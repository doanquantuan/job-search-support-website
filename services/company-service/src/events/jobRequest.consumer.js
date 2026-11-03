import { consume } from '#shared/rabbitmq/consumer.js';
import { publish } from '#shared/rabbitmq/publisher.js';
import companyRepository from '../repositories/company.repository.js';
import prisma from '../config/prisma.js';

class JobRequestConsumer {
  constructor() {
    this.exchange = 'company_exchange';
    this.requestQueue = 'company_service_job_requests_queue';
    this.isStarted = false;
  }

  /**
   * Khởi động lắng nghe các yêu cầu lấy thông tin công ty từ job-service
   */
  async start() {
    if (this.isStarted) return;

    try {
      await consume({
        exchange: this.exchange,
        exchangeType: 'topic',
        queue: this.requestQueue,
        routingKeys: [
          'company.get_by_user',
          'company.get_by_id',
          'company.get_batch_by_ids',
        ],
        handler: async (event, message) => {
          await this.handleJobRequest(event, message);
        },
      });

      this.isStarted = true;
      console.log(`[RabbitMQ] JobRequestConsumer đã sẵn sàng nhận yêu cầu trên queue: ${this.requestQueue}`);
    } catch (error) {
      console.error('[RabbitMQ] Không thể khởi động JobRequestConsumer:', error.message);
    }
  }

  /**
   * Xử lý từng message yêu cầu và gửi response ngược lại cho job-service
   */
  async handleJobRequest(event, message) {
    const payload = event.data || event;
    const { correlationId, replyTo, userId, companyId, companyIds } = payload;
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
      // 1. Trường hợp lấy theo danh sách companyIds (phục vụ trang danh sách việc làm)
      if (routingKey === 'company.get_batch_by_ids' || (Array.isArray(companyIds) && companyIds.length > 0)) {
        const companies = await prisma.company.findMany({
          where: {
            companyId: { in: companyIds },
          },
          select: {
            companyId: true,
            companyName: true,
            logo: true,
            province: true,
            address: true,
            verificationStatus: true,
          },
        });
        responsePayload.data = companies;
      }
      // 2. Trường hợp job-service hỏi: "userId này thuộc công ty nào?"
      else if (routingKey === 'company.get_by_user' || userId) {
        const company = await companyRepository.findByRecruiterId(userId);
        if (!company) {
          responsePayload.success = false;
          responsePayload.error = `Không tìm thấy công ty liên kết với tài khoản nhà tuyển dụng (userId: ${userId})`;
        } else {
          responsePayload.data = {
            companyId: company.companyId,
            companyName: company.companyName,
            province: company.province,
            logo: company.logo,
            verificationStatus: company.verificationStatus,
          };
        }
      } 
      // 3. Trường hợp job-service hỏi: "companyId này tên là gì / thông tin chi tiết ra sao?"
      else if (routingKey === 'company.get_by_id' || companyId) {
        const company = await companyRepository.findById(companyId);
        if (!company) {
          responsePayload.success = false;
          responsePayload.error = `Không tìm thấy công ty với ID: ${companyId}`;
        } else {
          responsePayload.data = {
            companyId: company.companyId,
            companyName: company.companyName,
            province: company.province,
            address: company.address,
            logo: company.logo,
            website: company.website,
            verificationStatus: company.verificationStatus,
          };
        }
      } else {
        responsePayload.success = false;
        responsePayload.error = `Routing key không hợp lệ: ${routingKey}`;
      }
    } catch (err) {
      console.error('[RabbitMQ] Lỗi khi truy vấn dữ liệu công ty cho job-service:', err.message);
      responsePayload.success = false;
      responsePayload.error = err.message || 'Lỗi xử lý nội bộ tại company-service';
    }

    // Gửi kết quả phản hồi về cho job-service qua replyTo ('company.response')
    try {
      await publish({
        exchange: this.exchange,
        routingKey: replyTo,
        data: responsePayload,
      });
    } catch (publishErr) {
      console.error('[RabbitMQ] Không thể gửi phản hồi cho job-service:', publishErr.message);
    }
  }
}

export default new JobRequestConsumer();
