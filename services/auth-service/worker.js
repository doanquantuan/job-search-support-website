import 'dotenv/config';
import prisma from './src/config/prisma.js';
import emailWorker from './src/jobs/email.worker.js';

console.log('[Worker-Service] Đang khởi động tiến trình Background Email Worker độc lập...');

const initWorker = async () => {
  try {
    await prisma.$connect();
    console.log('[Worker-Service] Worker đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
    console.log('[Worker-Service] Đang lắng nghe các jobs trong queue "email"...');
  } catch (error) {
    console.error('[Worker-Service] Lỗi kết nối Database:', error.message);
    process.exit(1);
  }
};

initWorker();

const gracefulShutdown = async () => {
  console.log('[Worker-Service] Đang dừng tiến trình Worker...');
  try {
    await emailWorker.close();
    console.log('[Worker-Service] Đã đóng BullMQ Email Worker.');
  } catch (err) {
    console.error('[Worker-Service] Lỗi khi đóng emailWorker:', err.message);
  }

  try {
    await prisma.$disconnect();
    console.log('[Worker-Service] Đã ngắt kết nối Prisma.');
  } catch (err) {
    console.error('[Worker-Service] Lỗi khi ngắt kết nối Prisma:', err.message);
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

