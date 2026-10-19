require('dotenv').config({ quiet: true });
const prisma = require('./src/config/prisma');
const uploadWorker = require('./src/jobs/upload.worker');

console.log('[Worker-Service] Đang khởi động tiến trình Background Upload Worker độc lập...');

const initWorker = async () => {
  try {
    await prisma.$connect();
    console.log('[Worker-Service] Worker đã kết nối thành công đến cơ sở dữ liệu (Prisma)');
    console.log('[Worker-Service] Đang lắng nghe các jobs trong queue "upload"...');
  } catch (error) {
    console.error('[Worker-Service] Lỗi kết nối Database:', error.message);
    process.exit(1);
  }
};

initWorker();

const gracefulShutdown = async () => {
  console.log('[Worker-Service] Đang dừng tiến trình Worker...');
  try {
    await uploadWorker.close();
    console.log('[Worker-Service] Đã đóng BullMQ Upload Worker.');
  } catch (err) {
    console.error('[Worker-Service] Lỗi khi đóng uploadWorker:', err.message);
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

