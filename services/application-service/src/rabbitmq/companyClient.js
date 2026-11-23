import crypto from 'crypto';
import { publish } from '#shared/rabbitmq/publisher.js';
import { consume } from '#shared/rabbitmq/consumer.js';
import prisma from '../config/prisma.js';

const isTestEnv = () =>
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.execArgv.includes('--test');

class CompanyClient {
  constructor() {
    this.exchange = 'company_exchange';
    this.responseQueue = 'application_service_company_response_queue';
    this.replyTo = 'application.company.response';
    this.pendingRequests = new Map(); // correlationId -> { resolve, reject, timer }
    this.isConsumerStarted = false;
    this.cache = new Map(); // key -> { value, expiresAt }
    this.cacheTtlMs = 10 * 60 * 1000; // 10 phút
  }

  _getCached(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  _setCached(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  /**
   * Khởi tạo Consumer lắng nghe các message phản hồi từ company-service
   */
  async initConsumer() {
    if (this.isConsumerStarted || isTestEnv()) return;

    try {
      await consume({
        exchange: this.exchange,
        exchangeType: 'topic',
        queue: this.responseQueue,
        routingKeys: [this.replyTo],
        handler: async (event) => {
          this.handleResponse(event);
        },
      });

      this.isConsumerStarted = true;
      console.log(`[application-service] CompanyClient response consumer ready on queue: ${this.responseQueue}`);
    } catch (error) {
      console.warn('[application-service] Không thể khởi tạo CompanyClient consumer:', error.message);
    }
  }

  /**
   * Xử lý message phản hồi nhận được từ company-service
   */
  handleResponse(event) {
    const payload = event?.data && typeof event.data === 'object' ? event.data : event;
    const { correlationId, success, data, error } = payload || {};

    if (!correlationId || !this.pendingRequests.has(correlationId)) {
      return;
    }

    const { resolve, reject, timer } = this.pendingRequests.get(correlationId);
    clearTimeout(timer);
    this.pendingRequests.delete(correlationId);

    if (success === false) {
      reject(new Error(error || 'Không thể lấy thông tin từ company-service'));
    } else {
      resolve(data);
    }
  }

  /**
   * Gửi message qua Publisher và chờ Consumer nhận phản hồi (Request-Reply RPC qua RabbitMQ)
   */
  async sendRequest(routingKey, messageData, timeoutMs = 5000) {
    if (isTestEnv()) {
      return null;
    }

    await this.initConsumer();

    const correlationId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error(`Timeout: company-service không phản hồi sự kiện ${routingKey} sau ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(correlationId, { resolve, reject, timer });

      publish({
        exchange: this.exchange,
        routingKey,
        data: {
          ...messageData,
          correlationId,
          replyTo: this.replyTo,
        },
      }).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(correlationId);
        reject(err);
      });
    });
  }

  /**
   * Lấy companyId của recruiter (ưu tiên local DB, sau đó kiểm tra cache, rồi hỏi qua RabbitMQ)
   */
  async getCompanyIdByRecruiter(recruiterId) {
    if (!recruiterId) return null;

    // 1. Kiểm tra local JobPost trước (CQRS Read Model)
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recruiterId);
      if (isUuid) {
        const localJob = await prisma.jobPost.findFirst({
          where: { recruiterId, companyId: { not: null } },
          select: { companyId: true },
        });
        if (localJob?.companyId) {
          return localJob.companyId;
        }
      }
    } catch (_dbErr) {}

    // 2. Kiểm tra cache trong bộ nhớ
    const cacheKey = `recruiter:${recruiterId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    // 3. Gửi RabbitMQ request đến company-service
    try {
      const res = await this.sendRequest('company.get_by_user', { userId: recruiterId });
      const companyId = typeof res === 'string' ? res : (res?.companyId || res?.id);
      if (companyId) {
        this._setCached(cacheKey, companyId);
        // Đồng bộ ngược lại các jobPost còn khuyết companyId trong local DB
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recruiterId);
        if (isUuid) {
          prisma.jobPost.updateMany({
            where: { recruiterId, companyId: null },
            data: { companyId },
          }).catch(() => {});
        }
        return companyId;
      }
    } catch (err) {
      console.warn(`[application-service] RabbitMQ getCompanyIdByRecruiter (${recruiterId}) lỗi:`, err.message);
    }

    return null;
  }

  /**
   * Lấy thông tin chi tiết một công ty theo ID (có cache)
   */
  async getCompanyById(companyId) {
    if (!companyId) return null;

    const cacheKey = `company:${companyId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.sendRequest('company.get_by_id', { companyId });
      if (data) {
        this._setCached(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn(`[application-service] RabbitMQ getCompanyById (${companyId}) lỗi:`, err.message);
    }
    return null;
  }

  /**
   * Lấy hàng loạt thông tin công ty theo danh sách companyIds (batch qua RabbitMQ, không bị N+1)
   */
  async getCompaniesBatch(companyIds) {
    if (!Array.isArray(companyIds) || companyIds.length === 0) return [];

    const uniqueIds = [...new Set(companyIds.filter(Boolean))];
    const results = [];
    const missingIds = [];

    for (const id of uniqueIds) {
      const cached = this._getCached(`company:${id}`);
      if (cached) {
        results.push(cached);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) {
      return results;
    }

    try {
      const res = await this.sendRequest('company.get_batch_by_ids', { companyIds: missingIds });
      if (Array.isArray(res)) {
        for (const comp of res) {
          results.push(comp);
          if (comp?.companyId) {
            this._setCached(`company:${comp.companyId}`, comp);
          }
        }
      }
    } catch (err) {
      console.warn('[application-service] RabbitMQ getCompaniesBatch lỗi:', err.message);
    }

    return results;
  }

  close() {
    for (const [, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error('CompanyClient closed'));
    }
    this.pendingRequests.clear();
  }
}

export default new CompanyClient();
