import { consume } from '#shared/rabbitmq/consumer.js';
import prisma from '../config/prisma.js';

const EXCHANGE_NAME = 'auth_events';
const QUEUE_NAME = 'user_service_auth_events';
const ROUTING_KEYS = ['user.verified', 'user.created'];

/**
 * Xử lý sự kiện tạo người dùng dựa vào Role tương ứng
 * Đảm bảo tính Idempotency (không bị lỗi nếu event được gửi nhiều lần)
 */
export async function handleUserEvent({ userId, email, fullName, role, isVerified = true, status = 'ACTIVE' }) {
  if (!userId) {
    console.warn('[user-service] Bỏ qua event: userId bị thiếu');
    return;
  }

  const normalizedRole = (role || 'JOB_SEEKER').toUpperCase();

  await prisma.$transaction(async (tx) => {
    // 1. Đồng bộ bản ghi User cơ bản (CQRS / Data Replication)
    await tx.user.upsert({
      where: { id: userId },
      update: {
        ...(email ? { email } : {}),
        ...(fullName ? { fullName } : {}),
        role: ['JOB_SEEKER', 'RECRUITER', 'ADMIN'].includes(normalizedRole) ? normalizedRole : 'JOB_SEEKER',
        isVerified,
      },
      create: {
        id: userId,
        email: email || null,
        fullName: fullName || null,
        role: ['JOB_SEEKER', 'RECRUITER', 'ADMIN'].includes(normalizedRole) ? normalizedRole : 'JOB_SEEKER',
        status,
        isVerified,
      },
    });

    // 2. Khởi tạo cấu trúc phân hệ dựa theo Role tương ứng
    switch (normalizedRole) {
      case 'JOB_SEEKER': {
        const existing = await tx.jobSeeker.findUnique({
          where: { userId },
        });

        if (existing) {
          console.log(`[user-service] JobSeeker ${userId} đã tồn tại.`);
          return;
        }

        await tx.jobSeeker.create({
          data: {
            userId,
            jobSeekingStatus: 'LOOKING',
            profile: {
              create: {
                contactEmail: email || null,
              },
            },
          },
        });
        console.log(`[user-service] Đã tạo thành công JobSeeker & Profile rỗng cho userId: ${userId}`);
        break;
      }

      case 'RECRUITER': {
        const existing = await tx.recruiter.findUnique({
          where: { userId },
        });

        if (existing) {
          console.log(`[user-service] Recruiter ${userId} đã tồn tại.`);
          return;
        }

        await tx.recruiter.create({
          data: {
            userId,
            isVerified: false,
          },
        });
        console.log(`[user-service] Đã tạo thành công Recruiter cho userId: ${userId}`);
        break;
      }

      case 'ADMIN': {
        const existing = await tx.admin.findUnique({
          where: { userId },
        });

        if (existing) {
          console.log(`[user-service] Admin ${userId} đã tồn tại.`);
          return;
        }

        await tx.admin.create({
          data: { userId },
        });
        console.log(`[user-service] Đã tạo thành công Admin cho userId: ${userId}`);
        break;
      }

      default:
        console.warn(`[user-service] Bỏ qua: Role "${role}" không được hỗ trợ`);
    }
  });
}

/**
 * Khởi chạy RabbitMQ Consumer lắng nghe các auth events
 */
export async function startAuthEventConsumer() {
  return consume({
    exchange: EXCHANGE_NAME,
    exchangeType: 'topic',
    queue: QUEUE_NAME,
    routingKeys: ROUTING_KEYS,
    handler: async (event) => {
      const eventData = event.data || event;
      await handleUserEvent(eventData);
    },
  });
}

export default {
  startAuthEventConsumer,
  handleUserEvent,
};
