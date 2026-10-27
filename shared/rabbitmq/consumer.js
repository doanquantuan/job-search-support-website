import { createChannel } from './connection.js';

export async function consume({
  exchange,
  exchangeType = 'topic',
  queue,
  routingKeys = [],
  handler,
  prefetch = 1,
  deadLetterExchange = null,
  maxRetryCount = 3,
}) {
  if (!exchange || !queue || typeof handler !== 'function') {
    throw new Error('Thiếu exchange, queue hoặc handler');
  }

  const dlx = deadLetterExchange || `${exchange}.dlx`;
  const dlq = `${queue}.dlq`;

  const channel = await createChannel();

  // 1. Cấu hình Dead Letter Exchange (DLX) và Dead Letter Queue (DLQ)
  await channel.assertExchange(dlx, 'topic', { durable: true });
  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, dlx, '#');

  // 2. Cấu hình Exchange & Main Queue gắn với DLX khi reject không requeue
  await channel.assertExchange(exchange, exchangeType, { durable: true });
  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dlx,
    },
  });

  for (const key of routingKeys) {
    await channel.bindQueue(queue, exchange, key);
  }

  await channel.prefetch(prefetch);

  await channel.consume(
    queue,
    async (message) => {
      if (!message) return;

      try {
        const event = JSON.parse(message.content.toString());
        await handler(event, message);
        channel.ack(message);
      } catch (error) {
        console.error(`[RabbitMQ] Consumer xử lý message trên queue ${queue} thất bại:`, error.message);

        // Kiểm tra số lần retry từ x-death header của RabbitMQ
        const xDeath = message.properties.headers?.['x-death'];
        const deathCount = (xDeath && xDeath[0] && xDeath[0].count) ? xDeath[0].count : 0;
        const manualRetryCount = message.properties.headers?.['x-retry-count'] || 0;

        const currentRetryCount = Math.max(deathCount, manualRetryCount);

        if (currentRetryCount < maxRetryCount) {
          console.warn(`[RabbitMQ] Requeue message để thử lại (lần ${currentRetryCount + 1}/${maxRetryCount})...`);
          // Requeue tạm thời để thử lại
          channel.nack(message, false, true);
        } else {
          console.error(`[RabbitMQ] Đã thử lại quá ${maxRetryCount} lần. Đẩy message vào DLQ: ${dlq}`);
          // nack với requeue = false sẽ tự động chuyển message sang Dead Letter Exchange (DLX)
          channel.nack(message, false, false);
        }
      }
    },
    { noAck: false }
  );

  console.log(`[RabbitMQ] Listening on queue: ${queue} (DLQ: ${dlq})`);

  return channel;
}

export default { consume };