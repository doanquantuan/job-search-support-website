import amqp from 'amqplib';
import 'dotenv/config';

let connection = null;
let connectingPromise = null;

export async function connectRabbitMQ() {
  if (connection) return connection;

  // Tránh nhiều service module tạo kết nối đồng thời
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    const url = process.env.RABBITMQ_URL;

    if (!url) {
      throw new Error('Thiếu biến môi trường RABBITMQ_URL');
    }

    const conn = await amqp.connect(url);

    conn.on('error', (error) => {
      console.error('[RabbitMQ] Connection error:', error.message);
    });

    conn.on('close', () => {
      if (connection === conn) {
        connection = null;
      }

      console.warn('[RabbitMQ] Connection closed');
    });

    connection = conn;
    return conn;
  })();

  try {
    return await connectingPromise;
  } finally {
    connectingPromise = null;
  }
}

export async function createChannel() {
  const conn = await connectRabbitMQ();
  return conn.createChannel();
}

export async function closeRabbitMQ() {
  try {
    if (connection) {
      await connection.close();
      connection = null;
      console.log('[RabbitMQ] Đã đóng kết nối RabbitMQ.');
    }
  } catch (error) {
    console.error('[RabbitMQ] Lỗi khi đóng kết nối RabbitMQ:', error.message);
  }
}

export default {
  connectRabbitMQ,
  createChannel,
  closeRabbitMQ,
};
