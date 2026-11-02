import crypto from 'crypto';
import { publish } from '#shared/rabbitmq/publisher.js';
import { consume } from '#shared/rabbitmq/consumer.js';

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
   * Gửi message cho company-service kèm companyId để lấy companyName khi xem chi tiết jobPost
   */
  async getCompanyName(companyId) {
    const res = await this.sendRequest('company.get_by_id', { companyId });
    if (typeof res === 'string') return res;
    return res?.companyName || res?.name || res?.title;
  }
}

export default new CompanyMessageBroker();
