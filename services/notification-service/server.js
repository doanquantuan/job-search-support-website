import http from 'http';
import app from './src/app.js';
import config from './src/config/env.config.js';
import prisma from './src/config/prisma.js';
import { initSocketServer } from './src/sockets/socket.server.js';
import { startNotificationConsumer, stopNotificationConsumer } from './src/queues/notification.consumer.js';

const PORT = config.PORT;
const server = http.createServer(app);

// Khởi tạo Socket.IO server
const io = initSocketServer(server);

server.listen(PORT, async () => {
  console.log(`[notification-service] Đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`);
  try {
    await prisma.$connect();
    console.log('[notification-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
  } catch (error) {
    console.error('[notification-service] Lỗi kết nối cơ sở dữ liệu:', error.message);
  }

  // Khởi động RabbitMQ consumer
  try {
    await startNotificationConsumer();
  } catch (err) {
    console.error('[notification-service] Không thể khởi động consumer:', err.message);
  }
});

const gracefulShutdown = async () => {
  console.log('Đang dừng server notification-service...');
  await stopNotificationConsumer();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Đã đóng server và ngắt kết nối Prisma.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
