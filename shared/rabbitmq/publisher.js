import { connectRabbitMQ } from './connection.js';

let confirmChannel = null;
let channelPromise = null;

async function getConfirmChannel() {
  if (confirmChannel) return confirmChannel;
  if (channelPromise) return channelPromise;

  channelPromise = (async () => {
    const conn = await connectRabbitMQ();
    const ch = await conn.createConfirmChannel();

    ch.on('error', (err) => {
      console.error('[RabbitMQ Publisher] Channel error:', err.message);
      confirmChannel = null;
    });

    ch.on('close', () => {
      confirmChannel = null;
    });

    confirmChannel = ch;
    return ch;
  })();

  try {
    return await channelPromise;
  } finally {
    channelPromise = null;
  }
}

/**
 * Publish message với ConfirmChannel và retry nhẹ
 */
export async function publish({
  exchange,
  exchangeType = 'topic',
  routingKey,
  data,
  maxRetries = 2,
}) {
  if (!exchange || !routingKey) {
    throw new Error('exchange và routingKey là bắt buộc');
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const channel = await getConfirmChannel();

      await channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });

      const payload = Buffer.from(
        JSON.stringify({
          event: routingKey,
          timestamp: new Date().toISOString(),
          data,
        })
      );

      await new Promise((resolve, reject) => {
        channel.publish(
          exchange,
          routingKey,
          payload,
          {
            persistent: true,
            contentType: 'application/json',
          },
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });

      return; // Publish thành công
    } catch (error) {
      attempt++;
      confirmChannel = null; // Reset channel để lần sau khởi tạo lại nếu lỗi channel

      if (attempt > maxRetries) {
        console.error(`[RabbitMQ Publisher] Publish thất bại sau ${maxRetries + 1} lần thử:`, error.message);
        throw error;
      }
      console.warn(`[RabbitMQ Publisher] Lỗi publish, đang thử lại lần ${attempt}...:`, error.message);
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

export default { publish };
