import app from "./src/app.js";
import config from "./src/config/env.config.js";
import prisma from "./src/config/prisma.js";
import cleanupService from "./src/services/cleanup.service.js";
import { connectRabbitMQ } from './src/config/rabbitmq.js';

const PORT = config.PORT;

const server = app.listen(PORT, async () => {
  console.log(
    `[auth-service] đang chạy trên cổng ${PORT} trong môi trường ${config.NODE_ENV}`,
  );
  try {
    await prisma.$connect();
    console.log(
      "[auth-service] Đã kết nối thành công đến cơ sở dữ liệu (Prisma)",
    );
    // Khởi động tác vụ tự động dọn dẹp tài khoản chưa kích hoạt sau 24h
    cleanupService.startCleanupSchedule();

    await connectRabbitMQ();
  } catch (error) {
    console.error("[auth-service] Lỗi kết nối cơ sở dữ liệu:", error.message);
  }
});

const gracefulShutdown = async () => {
  console.log("Đang dừng server auth-service...");
  server.close(async () => {
    cleanupService.stopCleanupSchedule();
    await prisma.$disconnect();
    console.log("Đã đóng server, worker và ngắt kết nối Prisma.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
