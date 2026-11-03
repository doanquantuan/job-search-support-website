import amqp from 'amqplib';
import 'dotenv/config';

let connection = null;
let connectingPromise = null;
const reconnectListeners = new Set();
let isReconnecting = false;
let isClosingExplicitly = false;

export function onRabbitMQReconnect(callback) {
  if (typeof callback === 'function') {
    reconnectListeners.add(callback);
  }
  return () => reconnectListeners.delete(callback);
}

export async function connectRabbitMQ() {
  if (connection) return connection;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    const url = process.env.RABBITMQ_URL;
    if (!url) {
      throw new Error('Thiếu biến môi trường RABBITMQ_URL');
    }

    const conn = await amqp.connect(url);
    isClosingExplicitly = false;

    conn.on('error', (error) => {
      console.error('[RabbitMQ] Connection error:', error.message);
    });

    conn.on('close', () => {
      if (connection === conn) {
        connection = null;
      }
      console.warn('[RabbitMQ] Connection closed.');
      if (!isClosingExplicitly) {
        triggerReconnect();
      }
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

async function triggerReconnect() {
  if (isReconnecting || isClosingExplicitly) return;
  isReconnecting = true;
  console.log('[RabbitMQ] Đang thử kết nối lại sau 5s...');

  const retryInterval = 5000;
  const timer = setInterval(async () => {
    try {
      if (isClosingExplicitly) {
        clearInterval(timer);
        isReconnecting = false;
        return;
      }
      console.log('[RabbitMQ] Thử tái kết nối...');
      await connectRabbitMQ();
      clearInterval(timer);
      isReconnecting = false;
      console.log('[RabbitMQ] Tái kết nối thành công! Kích hoạt lại consumers...');

      for (const listener of reconnectListeners) {
        try {
          await listener();
        } catch (err) {
          console.error('[RabbitMQ] Lỗi khi chạy lại listener sau khi reconnect:', err.message);
        }
      }
    } catch (err) {
      console.warn('[RabbitMQ] Tái kết nối thất bại, sẽ thử lại sau 5s:', err.message);
    }
  }, retryInterval);
}

export async function createChannel() {
  const conn = await connectRabbitMQ();
  return conn.createChannel();
}

export async function closeRabbitMQ() {
  isClosingExplicitly = true;
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
  onRabbitMQReconnect,
};
