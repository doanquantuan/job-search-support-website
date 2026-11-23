import { consume } from '#shared/rabbitmq/consumer.js';
import { closeRabbitMQ, onRabbitMQReconnect } from '#shared/rabbitmq/connection.js';
import config from '../config/env.config.js';
import notificationService from '../services/notification.service.js';

let channel = null;

export const ROUTING_KEYS = [
  'application.status_changed',
  'application.submitted',
  'application.withdrawn',
  'application.reminded',
  'company.verification.status_changed',
  'auth.password_changed',
  'user.status_changed',
  'chat.message_sent',
  'report.resolved',
  'job.report_alert',
  'job.auto_hidden',
  'job.matched',
  'company.job_posted',
];

/**
 * Chuẩn hóa payload từ RabbitMQ (hỗ trợ cả định dạng phẳng và định dạng bọc bởi #shared/rabbitmq/publisher.js)
 */
export function normalizeRabbitMQPayload(routingKey, payload) {
  const innerData = payload?.data && typeof payload.data === 'object' ? payload.data : {};
  const eventId = payload?.eventId || innerData.eventId || payload?.id || null;
  const recipientId =
    payload?.recipientId ||
    innerData.recipientId ||
    (routingKey === 'job.report_alert' ? 'ADMIN_GROUP' : null);

  return {
    eventId,
    recipientId,
    data: payload?.data && typeof payload.data === 'object' ? payload.data : payload,
  };
}

export async function startNotificationConsumer() {
  try {
    const exchange = config.RABBITMQ.EXCHANGE;
    const queue = config.RABBITMQ.MAIN_QUEUE;
    const dlx = config.RABBITMQ.DLX_EXCHANGE;

    channel = await consume({
      exchange,
      exchangeType: 'topic',
      queue,
      routingKeys: ROUTING_KEYS,
      prefetch: 10,
      deadLetterExchange: dlx,
      handler: async (event, message) => {
        const routingKey = message?.fields?.routingKey || event.event;
        const { eventId, recipientId: targetRecipientId, data } = normalizeRabbitMQPayload(routingKey, event);

        if (!targetRecipientId) {
          console.warn('[RabbitMQ Consumer] Message thiếu recipientId, nack vào DLQ:', event);
          throw new Error('Message thiếu recipientId');
        }

        const result = await notificationService.processDomainEvent({
          eventId,
          event: routingKey,
          recipientId: targetRecipientId,
          data,
        });

        if (result?.duplicate) {
          console.log(`[RabbitMQ Consumer] Bỏ qua message trùng (eventId: ${eventId}, recipientId: ${targetRecipientId})`);
        }
      },
    });

    console.log(`[RabbitMQ Consumer] Đã khởi chạy consumer thành công trên hàng đợi: ${queue}`);
    return channel;
  } catch (error) {
    console.error('[RabbitMQ Consumer] Không thể khởi động consumer:', error.message);
    return null;
  }
}

export async function stopNotificationConsumer() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    await closeRabbitMQ();
    console.log('[RabbitMQ Consumer] Đã dừng consumer thành công.');
  } catch (error) {
    console.error('[RabbitMQ Consumer] Lỗi khi dừng consumer:', error.message);
  }
}

// Tự động lắng nghe lại nếu RabbitMQ bị ngắt kết nối và phục hồi
onRabbitMQReconnect(async () => {
  console.log('[notification-service] Đang tái khởi động Notification Consumer sau khi RabbitMQ reconnect...');
  await startNotificationConsumer();
});

export default {
  startNotificationConsumer,
  stopNotificationConsumer,
  normalizeRabbitMQPayload,
  ROUTING_KEYS,
};
