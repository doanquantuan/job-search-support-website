const app = require('./src/app');
const config = require('./src/config/env.config');
const prisma = require('./src/config/prisma');
const { closeRabbitMQ } = require('./src/config/rabbitmq');
const { startAuthEventConsumer } = require('./src/workers/authEvent.worker');

// Chỉ chạy worker trong cùng tiến trình nếu cờ EMBEDDED_WORKER được bật (tiện lợi cho dev local 1 lệnh)
let embeddedWorker = null;
if (process.env.RUN_EMBEDDED_WORKER === 'true') {
  console.log('[user-service] Đang chạy Upload Worker ở chế độ EMBEDDED (cùng process API)...');
  embeddedWorker = require('./src/jobs/upload.worker');
}

const PORT = config.PORT;

const server = app.listen(PORT, async () => {
  console.log(`[user-service] API Server đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`);
  try {
    await prisma.$connect();
    console.log('[user-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
  } catch (error) {
    console.error('[user-service] Lỗi kết nối cơ sở dữ liệu:', error.message);
  }

  // Khởi chạy RabbitMQ Consumer
  try {
    await startAuthEventConsumer();
  } catch (error) {
    console.error('[user-service] Lỗi khi khởi động RabbitMQ Consumer:', error.message);
  }
});

const gracefulShutdown = async () => {
  console.log('Đang dừng server user-service...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Đã đóng server và ngắt kết nối Prisma.');

    if (embeddedWorker) {
      try {
        await embeddedWorker.close();
        console.log('Đã đóng Embedded Upload Worker.');
      } catch (e) {
        console.error('Lỗi khi đóng embeddedWorker:', e.message);
      }
    }

    await closeRabbitMQ();
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
