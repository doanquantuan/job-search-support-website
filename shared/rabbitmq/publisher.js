import { connectRabbitMQ } from './connection.js';

async function createConfirmChannel() {
  const conn = await connectRabbitMQ();
  return conn.createConfirmChannel();
}

export async function publish({
  exchange,
  exchangeType = 'topic',
  routingKey,
  data,
}) {
  if (!exchange || !routingKey) {
    throw new Error('exchange và routingKey là bắt buộc');
  }

  const channel = await createConfirmChannel();

  try {
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

    // Dùng ConfirmChannel để đợi broker xác nhận thay vì chỉ dựa vào boolean của channel.publish()
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
  } finally {
    await channel.close();
  }
}

export default { publish };
