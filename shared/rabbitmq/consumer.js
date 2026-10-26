import { createChannel } from './connection.js';

export async function consume({
  exchange,
  exchangeType = 'topic',
  queue,
  routingKeys = [],
  handler,
  prefetch = 1,
}) {
  if (!exchange || !queue || typeof handler !== 'function') {
    throw new Error('Thiếu exchange, queue hoặc handler');
  }

  const channel = await createChannel();

  await channel.assertExchange(exchange, exchangeType, { durable: true, });

  await channel.assertQueue(queue, { durable: true, });

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
        console.error('[RabbitMQ] Consumer error:', error.message);

        // Requeue tạm thời; production nên có giới hạn retry/DLQ
        channel.nack(message, false, true);
      }
    },
    { noAck: false }
  );

  console.log(`[RabbitMQ] Listening on queue: ${queue}`);

  return channel;
}

export default { consume };
