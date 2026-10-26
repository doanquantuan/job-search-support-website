const { connectRabbitMQ, EXCHANGE_NAME } = require('../config/rabbitmq');
const prisma = require('../config/prisma');

const QUEUE_NAME = 'user_service_auth_events';
const ROUTING_KEYS = ['user.verified', 'user.created'];

/**
 * Xử lý sự kiện tạo người dùng dựa vào Role tương ứng
 * Đảm bảo tính Idempotency (không bị lỗi nếu event được gửi nhiều lần)
 */
async function handleUserEvent({ userId, email, fullName, role, isVerified = true, status = 'ACTIVE' }) {
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


async function startAuthEventConsumer() {
  try {
    const { channel } = await connectRabbitMQ();

    // 1. Khẳng định Queue bền vững (durable)
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 2. Bind Queue với từng routing key từ Exchange auth_events
    for (const key of ROUTING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
    }

    // Prefetch 1 message một lần để xử lý tuần tự, công bằng
    channel.prefetch(1);

    console.log(`[user-service] Worker đang lắng nghe hàng đợi "${QUEUE_NAME}" từ exchange "${EXCHANGE_NAME}"...`);

    // 3. Tiêu thụ message
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        try {
          const rawContent = msg.content.toString();
          const parsed = JSON.parse(rawContent);
          const routingKey = msg.fields.routingKey;

          console.log(`[user-service] Nhận message [${routingKey}]:`, parsed);

          const eventData = parsed.data || parsed;
          await handleUserEvent(eventData);

          // Xác nhận xử lý thành công (ACK)
          channel.ack(msg);
        } catch (error) {
          console.error('[user-service] Lỗi khi xử lý message từ RabbitMQ:', error.message);
          // Nack và không requeue nếu payload lỗi dữ liệu để tránh loop vô tận
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error('[user-service] Không thể khởi động RabbitMQ Consumer:', error.message);
  }
}

module.exports = {
  startAuthEventConsumer,
  handleUserEvent,
};

