import app from './src/app.js';
import config from './src/config/env.config.js';
import prisma from './src/config/prisma.js';
import cleanupService from './src/services/cleanup.service.js';
import { connectRabbitMQ, closeRabbitMQ } from '#shared/rabbitmq/connection.js';

const PORT = config.PORT;

const server = app.listen(PORT, async () => {
  console.log(`[auth-service] đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`);

  // 1. Kết nối cơ sở dữ liệu (Prisma)
  try {
    await prisma.$connect();
    console.log('[auth-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
  } catch (error) {
    console.error('[auth-service] Lỗi kết nối cơ sở dữ liệu:', error.message);
    process.exit(1);
  }

  // 2. Khởi động tác vụ tự động dọn dẹp tài khoản chưa kích hoạt
  cleanupService.startCleanupSchedule();

  // 3. Kết nối RabbitMQ (để publish events)
  try {
    await connectRabbitMQ();
    console.log('[auth-service] Đã kết nối thành công tới RabbitMQ');
  } catch (error) {
    console.error('[auth-service] Lỗi kết nối RabbitMQ:', error.message);
  }
});

let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[auth-service] Nhận tín hiệu ${signal}. Đang dừng server auth-service...`);

  // Dừng nhận thêm HTTP request mới
  server.close(async () => {
    try {
      // Dừng cleanup schedule
      cleanupService.stopCleanupSchedule();

      // Đóng kết nối RabbitMQ
      await closeRabbitMQ();

      // Ngắt kết nối Prisma
      await prisma.$disconnect();
      console.log('[auth-service] Đã ngắt kết nối Prisma và dừng server an toàn.');

      process.exit(0);
    } catch (error) {
      console.error('[auth-service] Lỗi khi thực hiện shutdown:', error.message);
      process.exit(1);
    }
  });

  // Force close sau 10s nếu graceful shutdown bị treo
  setTimeout(() => {
    console.error('[auth-service] Shutdown timeout! Buộc dừng tiến trình.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
