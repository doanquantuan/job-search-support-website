import prisma from '../config/prisma.js';

class NotificationRepository {
  async findById(notificationId) {
    return prisma.notification.findUnique({
      where: { notificationId },
    });
  }

  async findByEventAndUser(eventId, userId) {
    if (!eventId || !userId) return null;
    return prisma.notification.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
  }

  async create(data) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type || 'SYSTEM',
        targetUrl: data.targetUrl || null,
        metadata: data.metadata || undefined,
        eventId: data.eventId || null,
        isRead: false,
      },
    });
  }

  async findByUserId(userId, { page = 1, limit = 10, isRead, type }) {
    const where = { userId };

    if (typeof isRead === 'boolean') {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
    };
      currentPage: page,
      limit,
    };
  }

  async countUnread(userId) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId) {
    return prisma.notification.update({
      where: { notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async deleteById(notificationId) {
    return prisma.notification.delete({
      where: { notificationId },
    });
  }
}

export default new NotificationRepository();
