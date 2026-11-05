import amqp from 'amqplib';
import config from '../config/env.config.js';
import notificationService from '../services/notification.service.js';

let connection = null;
let channel = null;

export const ROUTING_KEYS = [
  'application.status_changed',
  'application.submitted',
  'company.verification.status_changed',
  'auth.password_changed',
  'user.status_changed',
  'chat.message_sent',
  'report.resolved',
];

export async function startNotificationConsumer() {
  try {
    const amqpUrl = config.RABBITMQ.URL;
    connection = await amqp.connect(amqpUrl);

    connection.on('error', (err) => {
      console.error('[RabbitMQ Consumer] Lỗi kết nối:', err.message);
    });

    connection.on('close', () => {
      console.warn('[RabbitMQ Consumer] Kết nối đã đóng.');
    });

    channel = await connection.createChannel();

    const exchange = config.RABBITMQ.EXCHANGE;
    const dlx = config.RABBITMQ.DLX_EXCHANGE;
    const dlq = config.RABBITMQ.DLQ_QUEUE;
    const queue = config.RABBITMQ.MAIN_QUEUE;

    // Cấu hình DLX và DLQ
    await channel.assertExchange(dlx, 'direct', { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, dlx, 'notification.dead_letter');

    // Cấu hình Main Exchange và Main Queue
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlx,
        'x-dead-letter-routing-key': 'notification.dead_letter',
      },
    });

    // Bind tất cả các Routing Keys cần lắng nghe
    for (const key of ROUTING_KEYS) {
      await channel.bindQueue(queue, exchange, key);
    }

    await channel.prefetch(10);

    console.log(`[RabbitMQ Consumer] Đang lắng nghe hàng đợi ${queue} trên exchange ${exchange}...`);

    await channel.consume(queue, async (msg) => {
      if (!msg) return;

      const routingKey = msg.fields.routingKey;
      let payload;

      try {
        payload = JSON.parse(msg.content.toString());
      } catch (parseError) {
        console.error('[RabbitMQ Consumer] Message sai định dạng JSON, nack vào DLQ:', parseError.message);
        channel.nack(msg, false, false); // Đẩy thẳng vào DLQ
        return;
      }

      try {
        const { eventId, recipientId, data } = payload;

        if (!recipientId) {
          console.warn('[RabbitMQ Consumer] Message thiếu recipientId, nack vào DLQ:', payload);
          channel.nack(msg, false, false);
          return;
        }

        // Xử lý sự kiện qua Service (có chống trùng Idempotency)
        const result = await notificationService.processDomainEvent({
          eventId: eventId || payload.id,
          event: routingKey,
          recipientId,
          data: data || payload,
        });

        if (result.duplicate) {
          console.log(`[RabbitMQ Consumer] Bỏ qua message trùng (eventId: ${eventId}, recipientId: ${recipientId})`);
        }

        // Ack thành công
        channel.ack(msg);
      } catch (processingError) {
        console.error(`[RabbitMQ Consumer] Lỗi xử lý event ${routingKey}:`, processingError.message);

        // Kiểm tra số lần retry từ header
        const retryCount = (msg.properties.headers && msg.properties.headers['x-retry-count']) || 0;
        if (retryCount >= 3) {
          console.error('[RabbitMQ Consumer] Đã thử lại quá 3 lần, nack vào DLQ');
          channel.nack(msg, false, false);
        } else {
          console.warn(`[RabbitMQ Consumer] Đang thử lại lần ${retryCount + 1}...`);
          channel.nack(msg, false, false);
        }
      }
    });

    return { connection, channel };
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
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('[RabbitMQ Consumer] Đã dừng consumer thành công.');
  } catch (error) {
    console.error('[RabbitMQ Consumer] Lỗi khi dừng consumer:', error.message);
  }
}

export default {
  startNotificationConsumer,
  stopNotificationConsumer,
  ROUTING_KEYS,
};
