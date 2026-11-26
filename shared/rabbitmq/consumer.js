import { createChannel, onRabbitMQReconnect } from './connection.js';

export async function consume(options) {
  const {
    exchange,
    exchangeType = 'topic',
    queue,
    routingKeys = [],
    handler,
    prefetch = 1,
    deadLetterExchange = null,
    deadLetterExchangeType = 'topic',
    maxRetryCount = 3,
    _isReconnect = false,
  } = options;

  if (!exchange || !queue || typeof handler !== 'function') {
    throw new Error('Thiếu exchange, queue hoặc handler');
  }

  // Tự động đăng ký khôi phục consumer khi kết nối RabbitMQ bị ngắt và kết nối lại
  if (!_isReconnect) {
    onRabbitMQReconnect(async () => {
      console.log(`[RabbitMQ] Tự động khôi phục consumer trên queue ${queue}...`);
      try {
        await consume({ ...options, _isReconnect: true });
      } catch (err) {
        console.error(`[RabbitMQ] Khôi phục consumer trên queue ${queue} thất bại:`, err.message);
      }
    });
  }

  const dlx = deadLetterExchange || `${exchange}.dlx`;
  const dlq = `${queue}.dlq`;

  let activeChannel = await createChannel();

  // 1. Cấu hình Dead Letter Exchange (DLX) và Dead Letter Queue (DLQ)
  await activeChannel.assertExchange(dlx, deadLetterExchangeType, { durable: true });
  await activeChannel.assertQueue(dlq, { durable: true });
  await activeChannel.bindQueue(dlq, dlx, '#');

  // 2. Cấu hình Exchange & Main Queue gắn với DLX khi reject không requeue
  await activeChannel.assertExchange(exchange, exchangeType, { durable: true });

  const queueOptions = {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dlx,
    },
  };

  try {
    await activeChannel.assertQueue(queue, queueOptions);
  } catch (err) {
    if (err.message && (err.message.includes('PRECONDITION_FAILED') || err.message.includes('inequivalent arg'))) {
      console.warn(`[RabbitMQ] Queue ${queue} bị lệch cấu hình cũ trên broker (${err.message}). Đang tự động tạo lại queue chuẩn...`);
      activeChannel = await createChannel();
      await activeChannel.deleteQueue(queue).catch(() => {});
      await activeChannel.assertQueue(queue, queueOptions);
      console.log(`[RabbitMQ] Đã tái tạo thành công queue: ${queue}`);
    } else {
      throw err;
    }
  }

  for (const key of routingKeys) {
    await activeChannel.bindQueue(queue, exchange, key);
  }

  await activeChannel.prefetch(prefetch);

  await activeChannel.consume(
    queue,
    async (message) => {
      if (!message) return;

      try {
        const event = JSON.parse(message.content.toString());
        await handler(event, message);
        activeChannel.ack(message);
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
          activeChannel.nack(message, false, true);
        } else {
          console.error(`[RabbitMQ] Đã thử lại quá ${maxRetryCount} lần. Đẩy message vào DLQ: ${dlq}`);
          // nack với requeue = false sẽ tự động chuyển message sang Dead Letter Exchange (DLX)
          activeChannel.nack(message, false, false);
        }
      }
    },
    { noAck: false }
  );

  console.log(`[RabbitMQ] Listening on queue: ${queue} (DLQ: ${dlq})`);

  return activeChannel;
}

export default { consume };