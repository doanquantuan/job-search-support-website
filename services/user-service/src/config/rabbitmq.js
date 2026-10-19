const amqp = require('amqplib');
const config = require('./env.config');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'auth_events';

/**
 * Kết nối tới RabbitMQ và khởi tạo channel
 */
async function connectRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }

  const rabbitmqUrl = config.RABBITMQ_URL;

  try {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    // Khai báo topic exchange cho toàn hệ thống
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    console.log('[user-service] Đã kết nối thành công tới RabbitMQ');

    connection.on('error', (err) => {
      console.error('[user-service] Lỗi kết nối RabbitMQ:', err.message);
    });

    connection.on('close', () => {
      console.warn('[user-service] Mất kết nối RabbitMQ. Đang chờ kết nối lại...');
      connection = null;
      channel = null;
    });

    return { connection, channel };
  } catch (error) {
    console.error('[user-service] Không thể kết nối tới RabbitMQ:', error.message);
    throw error;
  }
}

function getChannel() {
  return channel;
}

function getConnection() {
  return connection;
}

/**
 * Đóng kết nối an toàn khi dừng server
 */
async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('[user-service] Đã đóng kết nối RabbitMQ an toàn.');
  } catch (error) {
    console.error('[user-service] Lỗi khi đóng kết nối RabbitMQ:', error.message);
  }
}

async function publishUserEvent(routingKey, data) {
  try {
    if (!channel) {
      console.warn('[user-service] RabbitMQ channel chưa sẵn sàng. Bỏ qua event:', routingKey);
      return;
    }

    const payload = Buffer.from(
      JSON.stringify({
        event: routingKey,
        timestamp: new Date().toISOString(),
        data,
      }),
    );

    channel.publish(EXCHANGE_NAME, routingKey, payload, { persistent: true });
    console.log(`[user-service] Đã phát sự kiện [${routingKey}]:`, data);
  } catch (error) {
    console.error('[user-service] Lỗi khi phát RabbitMQ event:', error.message);
  }
}

module.exports = {
  EXCHANGE_NAME,
  connectRabbitMQ,
  getChannel,
  getConnection,
  publishUserEvent,
  closeRabbitMQ,
};

