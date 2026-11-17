import { consume } from '#shared/rabbitmq/consumer.js';
import prisma from '../config/prisma.js';

export async function startJobConsumer() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    await consume({
      exchange: 'job_exchange',
      exchangeType: 'topic',
      queue: 'application_job_sync_queue',
      routingKeys: ['job.created', 'job.updated', 'job.status_changed'],
      prefetch: 10,
      handler: async (event, message) => {
        const routingKey = message.fields?.routingKey;
        const data = event;

        if (!data || !data.jobId) return;

        try {
          if (routingKey === 'job.created' || routingKey === 'job.updated') {
            await prisma.jobPost.upsert({
              where: { jobId: data.jobId },
              update: {
                ...(data.title ? { title: data.title } : {}),
                ...(data.userId ? { recruiterId: data.userId } : {}),
                ...(data.companyId ? { companyId: data.companyId } : {}),
                ...(data.status ? { status: data.status } : {}),
              },
              create: {
                jobId: data.jobId,
                title: data.title || 'Tin tuyển dụng',
                recruiterId: data.userId || null,
                companyId: data.companyId || null,
                status: data.status || 'OPEN',
              },
            });
            console.log(`[application-service] Đã đồng bộ job (${routingKey}) cho jobId: ${data.jobId}`);
          } else if (routingKey === 'job.status_changed') {
            await prisma.jobPost.updateMany({
              where: { jobId: data.jobId },
              data: { status: data.status },
            });
            console.log(`[application-service] Đã cập nhật status job cho jobId: ${data.jobId} -> ${data.status}`);
          }
        } catch (dbErr) {
          console.error(`[application-service] Lỗi khi đồng bộ job vào DB:`, dbErr.message);
        }
      },
    });
    console.log('[application-service] Job Consumer đã khởi chạy thành công lắng nghe job_exchange');
  } catch (error) {
    console.warn('[application-service] Không thể khởi chạy Job Consumer (RabbitMQ chưa sẵn sàng?):', error.message);
  }
}

export default {
  startJobConsumer,
};
