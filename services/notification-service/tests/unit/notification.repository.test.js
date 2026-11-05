import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import notificationRepository from '../../src/repositories/notification.repository.js';
import prisma from '../../src/config/prisma.js';

describe('NotificationRepository Unit Tests (ESM)', () => {
  const userId = 'a0000000-0000-0000-0000-000000000001';
  const notificationId = 'n0000000-0000-0000-0000-000000000001';
  const eventId = 'evt-001';

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('findById: tìm thấy thông báo theo notificationId', async () => {
    const mockData = { notificationId, userId, title: 'Test' };
    jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockData);

    const result = await notificationRepository.findById(notificationId);

    expect(prisma.notification.findUnique).toHaveBeenCalledWith({
      where: { notificationId },
    });
    expect(result).toEqual(mockData);
  });

  it('findByEventAndUser: tìm theo khóa kết hợp (eventId, userId)', async () => {
    const mockData = { notificationId, userId, eventId };
    jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockData);

    const result = await notificationRepository.findByEventAndUser(eventId, userId);

    expect(prisma.notification.findUnique).toHaveBeenCalledWith({
      where: {
        eventId_userId: { eventId, userId },
      },
    });
    expect(result).toEqual(mockData);
  });

  it('findByEventAndUser: trả về null nếu thiếu eventId hoặc userId', async () => {
    jest.spyOn(prisma.notification, 'findUnique');

    const res1 = await notificationRepository.findByEventAndUser(null, userId);
    const res2 = await notificationRepository.findByEventAndUser(eventId, null);

    expect(res1).toBeNull();
    expect(res2).toBeNull();
    expect(prisma.notification.findUnique).not.toHaveBeenCalled();
  });

  it('create: tạo thông báo mới trong database', async () => {
    const createData = {
      userId,
      title: 'Thông báo mới',
      content: 'Nội dung',
      type: 'APPLICATION',
      targetUrl: '/jobs/1',
      metadata: { id: 1 },
      eventId,
    };
    jest.spyOn(prisma.notification, 'create').mockResolvedValue({
      notificationId,
      ...createData,
      isRead: false,
    });

    const result = await notificationRepository.create(createData);

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId,
        title: 'Thông báo mới',
        content: 'Nội dung',
        type: 'APPLICATION',
        targetUrl: '/jobs/1',
        metadata: { id: 1 },
        eventId,
        isRead: false,
      },
    });
    expect(result.notificationId).toBe(notificationId);
  });

  it('findByUserId: phân trang và tính toán metadata chính xác', async () => {
    jest.spyOn(prisma.notification, 'findMany').mockResolvedValue([{ notificationId }]);
    jest.spyOn(prisma.notification, 'count').mockResolvedValue(25);

    const result = await notificationRepository.findByUserId(userId, {
      page: 2,
      limit: 10,
      isRead: false,
      type: 'SECURITY',
    });

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId, isRead: false, type: 'SECURITY' },
      skip: 10,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    expect(result.totalCount).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
    expect(result.limit).toBe(10);
  });

  it('countUnread: đếm số bản ghi isRead=false', async () => {
    jest.spyOn(prisma.notification, 'count').mockResolvedValue(4);

    const result = await notificationRepository.countUnread(userId);

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId, isRead: false },
    });
    expect(result).toBe(4);
  });

  it('markAsRead: cập nhật isRead = true cho một bản ghi', async () => {
    jest.spyOn(prisma.notification, 'update').mockResolvedValue({ notificationId, isRead: true });

    const result = await notificationRepository.markAsRead(notificationId);

    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { notificationId },
      data: { isRead: true },
    });
    expect(result.isRead).toBe(true);
  });

  it('markAllAsRead: cập nhật toàn bộ isRead = true cho user', async () => {
    jest.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 8 });

    const result = await notificationRepository.markAllAsRead(userId);

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    expect(result).toEqual({ count: 8 });
  });

  it('deleteById: xóa bản ghi theo notificationId', async () => {
    jest.spyOn(prisma.notification, 'delete').mockResolvedValue({ notificationId });

    const result = await notificationRepository.deleteById(notificationId);

    expect(prisma.notification.delete).toHaveBeenCalledWith({
      where: { notificationId },
    });
    expect(result).toEqual({ notificationId });
  });
});
