import crypto from 'crypto';
import { publish } from '#shared/rabbitmq/publisher.js';
import { consume } from '#shared/rabbitmq/consumer.js';
import prisma from '../config/prisma.js';

const isTestEnv = () =>
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.execArgv.includes('--test');

class JobClient {
  constructor() {
    this.exchange = 'job_exchange';
    this.responseQueue = 'application_service_job_response_queue';
    this.replyTo = 'application.job.response';
    this.pendingRequests = new Map(); // correlationId -> { resolve, reject, timer }
    this.isConsumerStarted = false;
  }

  /**
   * Khởi tạo Consumer lắng nghe các message phản hồi từ job-service
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
      console.log(`[application-service] JobClient response consumer ready on queue: ${this.responseQueue}`);
    } catch (error) {
      console.warn('[application-service] Không thể khởi tạo JobClient consumer:', error.message);
    }
  }

  /**
   * Xử lý message phản hồi nhận được từ job-service
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
      reject(new Error(error || 'Không thể lấy thông tin từ job-service'));
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
          reject(new Error(`Timeout: job-service không phản hồi sự kiện ${routingKey} sau ${timeoutMs}ms`));
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
   * Lấy thông tin tin tuyển dụng: ưu tiên local CQRS DB trước, nếu chưa có thì hỏi job-service qua RabbitMQ
   */
  async getJobById(jobId) {
    if (!jobId) return null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);

    // 1. Kiểm tra local DB (JobPost replica)
    if (isUuid) {
      try {
        const localJob = await prisma.jobPost.findUnique({ where: { jobId } });
        if (localJob) return localJob;
      } catch (_err) {}
    }

    // 2. Gửi request qua RabbitMQ nếu local DB chưa có
    try {
      const jobData = await this.sendRequest('job.get_by_id', { jobId });
      if (jobData && jobData.jobId && isUuid) {
        // Lưu/cập nhật vào local replica
        return await prisma.jobPost.upsert({
          where: { jobId: jobData.jobId },
          update: {
            title: jobData.title || 'Tin tuyển dụng',
            recruiterId: jobData.userId || jobData.recruiterId || null,
            companyId: jobData.companyId || null,
            status: jobData.status || 'OPEN',
          },
          create: {
            jobId: jobData.jobId,
            title: jobData.title || 'Tin tuyển dụng',
            recruiterId: jobData.userId || jobData.recruiterId || null,
            companyId: jobData.companyId || null,
            status: jobData.status || 'OPEN',
          },
        });
      }
    } catch (err) {
      console.warn(`[application-service] RabbitMQ getJobById (${jobId}) lỗi:`, err.message);
    }

    return null;
  }

  /**
   * Lấy dữ liệu phân tích lượt xem (job views) qua RabbitMQ
   */
  async getJobViewsAnalytics(userId, timeRange = '7d') {
    try {
      const res = await this.sendRequest('job.get_views_analytics', { userId, timeRange });
      if (res) return res;
    } catch (err) {
      console.warn('[application-service] RabbitMQ getJobViewsAnalytics lỗi:', err.message);
    }

    return {
      totalCurrentViews: 0,
      totalPrevViews: 0,
      viewsGrowth: '+0%',
      chartViews: [],
      viewsPerJob: {},
    };
  }

  close() {
    for (const [, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error('JobClient closed'));
    }
    this.pendingRequests.clear();
  }
}

export default new JobClient();
