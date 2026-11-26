import { consume } from '#shared/rabbitmq/consumer.js';
import { publish } from '#shared/rabbitmq/publisher.js';
import prisma from '../config/prisma.js';
import jobViewHistoryService from '../services/jobViewHistory.service.js';

class JobRequestConsumer {
  constructor() {
    this.exchange = 'job_exchange';
    this.requestQueue = 'job_service_requests_queue';
    this.isStarted = false;
  }

  async start(retryCount = 0) {
    if (this.isStarted || process.env.NODE_ENV === 'test') return;

    try {
      await consume({
        exchange: this.exchange,
        exchangeType: 'topic',
        queue: this.requestQueue,
        routingKeys: [
          'job.get_by_id',
          'job.get_views_analytics',
        ],
        handler: async (event, message) => {
          await this.handleJobRequest(event, message);
        },
      });

      this.isStarted = true;
      console.log(`[RabbitMQ] JobRequestConsumer đã sẵn sàng nhận yêu cầu trên queue: ${this.requestQueue}`);
    } catch (error) {
      console.error(`[RabbitMQ] Không thể khởi động JobRequestConsumer (lần ${retryCount + 1}):`, error.message);
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => this.start(retryCount + 1), 3000);
      }
    }
  }

  async handleJobRequest(event, message) {
    const payload = event?.data && typeof event.data === 'object' ? event.data : event;
    const { correlationId, replyTo, jobId, userId, timeRange } = payload || {};
    const routingKey = message?.fields?.routingKey;

    if (!correlationId || !replyTo) {
      console.warn('[RabbitMQ] Bỏ qua request thiếu correlationId hoặc replyTo:', payload);
      return;
    }

    let responsePayload = {
      correlationId,
      success: true,
      data: null,
      error: null,
    };

    try {
      if (routingKey === 'job.get_by_id' || jobId) {
        const job = await prisma.jobPost.findUnique({
          where: { jobId },
          select: {
            jobId: true,
            title: true,
            status: true,
            userId: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!job) {
          responsePayload.success = false;
          responsePayload.error = `Không tìm thấy tin tuyển dụng với ID: ${jobId}`;
        } else {
          responsePayload.data = {
            jobId: job.jobId,
            title: job.title,
            status: job.status,
            userId: job.userId,
            recruiterId: job.userId,
            companyId: job.companyId,
          };
        }
      } else if (routingKey === 'job.get_views_analytics' || (userId && routingKey?.includes('analytics'))) {
        const viewsData = await jobViewHistoryService.getRecruiterViewsAnalytics(userId, {
          timeRange: timeRange || '7d',
        });
        responsePayload.data = viewsData;
      } else {
        responsePayload.success = false;
        responsePayload.error = `Routing key không hợp lệ: ${routingKey}`;
      }
    } catch (err) {
      console.error('[RabbitMQ] Lỗi khi xử lý job request:', err.message);
      responsePayload.success = false;
      responsePayload.error = err.message || 'Lỗi xử lý nội bộ tại job-service';
    }

    try {
      await publish({
        exchange: this.exchange,
        routingKey: replyTo,
        data: responsePayload,
      });
    } catch (publishErr) {
      console.error('[RabbitMQ] Không thể gửi phản hồi cho job request:', publishErr.message);
    }
  }
}

export default new JobRequestConsumer();
