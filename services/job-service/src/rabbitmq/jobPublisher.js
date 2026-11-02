import { publish } from '#shared/rabbitmq/publisher.js';

export async function publishJobCreated(jobData) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.created',
      data: jobData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.created cho jobId: ${jobData.jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.created:', error.message);
  }
}

export async function publishJobUpdated(jobData) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.updated',
      data: jobData,
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.updated cho jobId: ${jobData.jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.updated:', error.message);
  }
}

export async function publishJobStatusChanged(jobId, status) {
  try {
    await publish({
      exchange: 'job_exchange',
      routingKey: 'job.status_changed',
      data: { jobId, status },
    });
    console.log(`[RabbitMQ Publisher] Đã publish event job.status_changed cho jobId: ${jobId}`);
  } catch (error) {
    console.error('[RabbitMQ Publisher] Lỗi publish job.status_changed:', error.message);
  }
}

export default {
  publishJobCreated,
  publishJobUpdated,
  publishJobStatusChanged,
};

