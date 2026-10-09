const app = require('./src/app');
const config = require('./src/config/env.config');
const prisma = require('./src/config/prisma');

const PORT = config.PORT;

const server = app.listen(PORT, async () => {
  console.log(`[application-service] đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`);
  try {
    await prisma.$connect();
    console.log('[application-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
  } catch (error) {
    console.error('[application-service] Lỗi kết nối cơ sở dữ liệu:', error.message);
  }
});

const gracefulShutdown = async () => {
  console.log('Đang dừng server application-service...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Đã đóng server và ngắt kết nối Prisma.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
