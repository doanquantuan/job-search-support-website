import crypto from 'crypto';
import { publish } from '#shared/rabbitmq/publisher.js';
import { consume } from '#shared/rabbitmq/consumer.js';
import redis from '../config/redis.js';

const CACHE_TTL_SECONDS = 3600; // 1 giờ

class CompanyMessageBroker {
  constructor() {
    this.exchange = 'company_exchange';
    this.responseQueue = 'job_service_company_response_queue';
    this.pendingRequests = new Map(); // correlationId -> { resolve, reject, timer }
    this.isConsumerStarted = false;
  }

  /**
   * Khởi tạo Consumer lắng nghe các message phản hồi từ company-service
   */
  async initConsumer() {
    if (this.isConsumerStarted) return;

    try {
      await consume({
        exchange: this.exchange,
        exchangeType: 'topic',
        queue: this.responseQueue,
        routingKeys: ['company.response'],
        handler: async (event) => {
          this.handleResponse(event);
        },
      });

      this.isConsumerStarted = true;
      console.log(`[RabbitMQ] Company response consumer ready on queue: ${this.responseQueue}`);
    } catch (error) {
      console.error('[RabbitMQ] Không thể khởi tạo Company response consumer:', error.message);
    }
  }

  /**
   * Xử lý message phản hồi nhận được từ company-service
   */
  handleResponse(event) {
    const payload = event.data || event;
    const { correlationId, success, data, error } = payload;

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
   * Gửi message qua Publisher và chờ Consumer nhận phản hồi
   */
  async sendRequest(routingKey, messageData, timeoutMs = 5000) {
    await this.initConsumer();

    const correlationId = crypto.randomUUID();

    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error(`Timeout: company-service không phản hồi sự kiện ${routingKey} sau ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.pendingRequests.set(correlationId, { resolve, reject, timer });

      try {
        await publish({
          exchange: this.exchange,
          routingKey,
          data: {
            ...messageData,
            correlationId,
            replyTo: 'company.response',
          },
        });
      } catch (err) {
        clearTimeout(timer);
        this.pendingRequests.delete(correlationId);
        reject(err);
      }
    });
  }

  /**
   * Gửi message cho company-service kèm userId (nhà tuyển dụng) để lấy companyId khi tạo jobPost
   */
  async getCompanyIdByUserId(userId) {
    const res = await this.sendRequest('company.get_by_user', { userId });
    if (typeof res === 'string') return res;
    return res?.companyId || res?.id;
  }

  /**
   * Lấy thông tin chi tiết company (ưu tiên Redis cache)
   */
  async getCompanyById(companyId) {
    if (!companyId) return null;

    // 1. Kiểm tra cache Redis trước
    if (redis && redis.status === 'ready') {
      try {
        const cached = await redis.get(`cache:company:${companyId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (err) {
        // Fallback tự nhiên nếu Redis lỗi
      }
    }

    // 2. Gọi qua Message Broker nếu Cache miss
    const data = await this.sendRequest('company.get_by_id', { companyId });

    // 3. Ghi lại vào Cache Redis
    if (data && redis && redis.status === 'ready') {
      try {
        await redis.set(`cache:company:${companyId}`, JSON.stringify(data), 'EX', CACHE_TTL_SECONDS);
      } catch (err) {
        // Bỏ qua lỗi ghi cache
      }
    }

    return data;
  }

  async getCompanyName(companyId) {
    const res = await this.getCompanyById(companyId);
    if (typeof res === 'string') return res;
    return res?.companyName || res?.name || res?.title;
  }

  /**
   * Lấy hàng loạt thông tin công ty theo danh sách companyIds (có cache Redis)
   */
  async getCompaniesBatch(companyIds) {
    if (!Array.isArray(companyIds) || companyIds.length === 0) return [];

    const uniqueIds = [...new Set(companyIds.filter(Boolean))];
    const results = [];
    const missingIds = [];

    // 1. Kiểm tra cache Redis cho từng ID
    if (redis && redis.status === 'ready') {
      try {
        for (const id of uniqueIds) {
          const cached = await redis.get(`cache:company:${id}`);
          if (cached) {
            results.push(JSON.parse(cached));
          } else {
            missingIds.push(id);
          }
        }
      } catch (err) {
        missingIds.push(...uniqueIds);
      }
    } else {
      missingIds.push(...uniqueIds);
    }

    // Nếu đã hit cache toàn bộ, trả về ngay lập tức không cần gọi RabbitMQ!
    if (missingIds.length === 0) {
      return results;
    }

    // 2. Gọi qua RabbitMQ lấy những ID còn thiếu
    try {
      const res = await this.sendRequest('company.get_batch_by_ids', { companyIds: missingIds });
      if (Array.isArray(res)) {
        for (const comp of res) {
          results.push(comp);
          // Ghi cache cho từng công ty vừa lấy
          if (redis && redis.status === 'ready' && comp?.companyId) {
            redis.set(`cache:company:${comp.companyId}`, JSON.stringify(comp), 'EX', CACHE_TTL_SECONDS).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('[RabbitMQ] Không thể lấy batch companies:', err.message);
    }

    return results;
  }
}

export default new CompanyMessageBroker();
