const amqp = require('amqplib');

let connection = null;
let channel = null;
const EXCHANGE_NAME = 'auth_events';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    console.log('[auth-service] Đã kết nối thành công tới RabbitMQ');
  } catch (error) {
    console.error('[auth-service] Lỗi kết nối RabbitMQ:', error.message);
  }
}

async function publishAuthEvent(routingKey, data) {
  try {
    if (!channel) {
      console.warn('[auth-service] RabbitMQ channel chưa sẵn sàng. Bỏ qua event:', routingKey);
      return;
    }

    const payload = Buffer.from(
      JSON.stringify({
        event: routingKey,
        timestamp: new Date().toISOString(),
        data,
      })
    );

    channel.publish(EXCHANGE_NAME, routingKey, payload, { persistent: true });
    console.log(`[auth-service] Đã phát sự kiện: [${routingKey}] cho userId: ${data.userId}`);
  } catch (error) {
    console.error('[auth-service] Lỗi khi phát event:', error.message);
  }
}

module.exports = { connectRabbitMQ, publishAuthEvent };
