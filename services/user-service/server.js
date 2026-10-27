import app from './src/app.js';
import config from './src/config/env.config.js';
import prisma from './src/config/prisma.js';
import { closeRabbitMQ } from '#shared/rabbitmq/connection.js';
import { startAuthEventConsumer } from './src/events/auth.event.js';

const PORT = config.PORT;

const server = app.listen(PORT, async () => {
  console.log(`[user-service] API Server đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`);

  // 1. Kết nối cơ sở dữ liệu (Prisma)
  try {
    await prisma.$connect();
    console.log('[user-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
  } catch (error) {
    console.error('[user-service] Lỗi kết nối cơ sở dữ liệu:', error.message);
    process.exit(1);
  }

  // 2. Khởi chạy RabbitMQ Consumer
  try {
    await startAuthEventConsumer();
  } catch (error) {
    console.error('[user-service] Lỗi khi khởi động RabbitMQ Consumer:', error.message);
  }
});

let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[user-service] Nhận tín hiệu ${signal}. Đang dừng server user-service...`);

  // Dừng nhận thêm HTTP request mới
  server.close(async () => {
    try {
      // Đóng kết nối RabbitMQ
      await closeRabbitMQ();

      // Ngắt kết nối Prisma
      await prisma.$disconnect();
      console.log('[user-service] Đã đóng server và ngắt kết nối Prisma an toàn.');

      process.exit(0);
    } catch (error) {
      console.error('[user-service] Lỗi khi thực hiện shutdown:', error.message);
      process.exit(1);
    }
  });

  // Force close sau 10s nếu graceful shutdown bị treo
  setTimeout(() => {
    console.error('[user-service] Shutdown timeout! Buộc dừng tiến trình.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[user-service] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[user-service] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[user-service] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[user-service] Uncaught Exception:', error);
  process.exit(1);
});

