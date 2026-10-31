import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import notificationService from '../../src/services/notification.service.js';
import notificationRepository from '../../src/repositories/notification.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../src/utils/errors.util.js';

describe('NotificationService Unit Tests (ESM)', () => {
  const userId = 'a0000000-0000-0000-0000-000000000001';
  const otherUserId = 'b0000000-0000-0000-0000-000000000002';
  const notificationId = 'n0000000-0000-0000-0000-000000000001';

  const mockNotificationRecord = {
    notificationId,
    userId,
    title: 'Cập nhật trạng thái',
    content: 'Hồ sơ của bạn đã được duyệt',
    type: 'APPLICATION',
    isRead: false,
    targetUrl: '/applications/123',
    metadata: { applicationId: '123' },
    eventId: 'evt-001',
    createdAt: new Date('2026-10-29T10:00:00Z'),
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. getNotifications', () => {
    it('Lấy danh sách thông báo phân trang thành công', async () => {
      jest.spyOn(notificationRepository, 'findByUserId').mockResolvedValue({
        notifications: [mockNotificationRecord],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      });

      const result = await notificationService.getNotifications(userId, { page: 1, limit: 10 });

      expect(notificationRepository.findByUserId).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
        isRead: undefined,
        type: undefined,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].notificationId).toBe(notificationId);
      expect(result.pagination.totalCount).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('Lấy danh sách kèm bộ lọc isRead và type', async () => {
      jest.spyOn(notificationRepository, 'findByUserId').mockResolvedValue({
        notifications: [],
        totalCount: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      });

      await notificationService.getNotifications(userId, {
        page: 1,
        limit: 10,
        isRead: false,
        type: 'SECURITY',
      });

      expect(notificationRepository.findByUserId).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
        isRead: false,
        type: 'SECURITY',
      });
    });
  });

  describe('2. getUnreadCount', () => {
    it('Trả về số lượng thông báo chưa đọc chính xác', async () => {
      jest.spyOn(notificationRepository, 'countUnread').mockResolvedValue(5);

      const result = await notificationService.getUnreadCount(userId);

      expect(notificationRepository.countUnread).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ unreadCount: 5 });
    });
  });

  describe('3. getNotificationById', () => {
    it('Lấy thông báo thành công và tự động đánh dấu đã đọc nếu chưa đọc', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(mockNotificationRecord);
      jest.spyOn(notificationRepository, 'markAsRead').mockResolvedValue({
        ...mockNotificationRecord,
        isRead: true,
      });

      const result = await notificationService.getNotificationById(userId, notificationId);

      expect(notificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(result.isRead).toBe(true);
    });

    it('Ném NotFoundError nếu thông báo không tồn tại', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

      await expect(
        notificationService.getNotificationById(userId, 'non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });

    it('Ném ForbiddenError nếu thông báo thuộc về người dùng khác (Chống IDOR)', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue({
        ...mockNotificationRecord,
        userId: otherUserId,
      });

      await expect(
        notificationService.getNotificationById(userId, notificationId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('4. markAsRead', () => {
    it('Đánh dấu đã đọc thành công khi là chủ sở hữu', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(mockNotificationRecord);
      jest.spyOn(notificationRepository, 'markAsRead').mockResolvedValue({
        ...mockNotificationRecord,
        isRead: true,
      });

      const result = await notificationService.markAsRead(userId, notificationId);

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(result.isRead).toBe(true);
    });

    it('Ném NotFoundError nếu id không tồn tại', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

      await expect(
        notificationService.markAsRead(userId, notificationId)
      ).rejects.toThrow(NotFoundError);
    });

    it('Ném ForbiddenError nếu cố tình mark read thông báo của user khác', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue({
        ...mockNotificationRecord,
        userId: otherUserId,
      });

      await expect(
        notificationService.markAsRead(userId, notificationId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('5. markAllAsRead', () => {
    it('Đánh dấu tất cả là đã đọc và trả về số lượng bản ghi cập nhật', async () => {
      jest.spyOn(notificationRepository, 'markAllAsRead').mockResolvedValue({ count: 7 });

      const result = await notificationService.markAllAsRead(userId);

      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ updatedCount: 7 });
    });
  });

  describe('6. deleteNotification', () => {
    it('Xóa thông báo thành công khi đúng chủ sở hữu', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(mockNotificationRecord);
      jest.spyOn(notificationRepository, 'deleteById').mockResolvedValue(mockNotificationRecord);

      const result = await notificationService.deleteNotification(userId, notificationId);

      expect(notificationRepository.deleteById).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual({ success: true });
    });

    it('Ném NotFoundError nếu thông báo không tồn tại', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue(null);

      await expect(
        notificationService.deleteNotification(userId, notificationId)
      ).rejects.toThrow(NotFoundError);
    });

    it('Ném ForbiddenError nếu cố xóa thông báo của user khác (Chống IDOR)', async () => {
      jest.spyOn(notificationRepository, 'findById').mockResolvedValue({
        ...mockNotificationRecord,
        userId: otherUserId,
      });

      await expect(
        notificationService.deleteNotification(userId, notificationId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('7. createSystemNotification', () => {
    it('Tạo thông báo hệ thống và phát realtime qua Socket.IO', async () => {
      jest.spyOn(notificationRepository, 'create').mockResolvedValue(mockNotificationRecord);

      const mockIO = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
      notificationService.setSocketIO(mockIO);

      const result = await notificationService.createSystemNotification({
        recipientId: userId,
        title: 'Bảo trì hệ thống',
        content: 'Hệ thống sẽ bảo trì vào 0h đêm nay',
        type: 'SYSTEM',
      });

      expect(notificationRepository.create).toHaveBeenCalled();
      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('notification:new', expect.objectContaining({
        title: mockNotificationRecord.title,
      }));
      expect(result.notificationId).toBe(notificationId);
    });
  });

  describe('8. processDomainEvent (RabbitMQ Consumer Handler)', () => {
    it('Ném BadRequestError nếu sự kiện thiếu recipientId', async () => {
      await expect(
        notificationService.processDomainEvent({
          eventId: 'evt-123',
          event: 'application.status_changed',
          data: {},
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('Chống trùng lặp (Idempotent): Nếu eventId và recipientId đã tồn tại thì bỏ qua không tạo mới', async () => {
      jest.spyOn(notificationRepository, 'findByEventAndUser').mockResolvedValue(mockNotificationRecord);
      jest.spyOn(notificationRepository, 'create');

      const result = await notificationService.processDomainEvent({
        eventId: 'evt-001',
        event: 'application.status_changed',
        recipientId: userId,
        data: {},
      });

      expect(result.duplicate).toBe(true);
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });

    it('Xử lý event mới: Lưu DB và phát realtime qua Socket.IO', async () => {
      jest.spyOn(notificationRepository, 'findByEventAndUser').mockResolvedValue(null);
      jest.spyOn(notificationRepository, 'create').mockResolvedValue(mockNotificationRecord);

      const mockIO = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
      notificationService.setSocketIO(mockIO);

      const result = await notificationService.processDomainEvent({
        eventId: 'evt-new-999',
        event: 'company.verification.status_changed',
        recipientId: userId,
        data: {
          companyName: 'Công ty Test ABC',
          verificationStatus: 'APPROVED',
        },
      });

      expect(result.duplicate).toBe(false);
      expect(notificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        type: 'COMPANY',
        eventId: 'evt-new-999',
      }));
      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith('notification:new', expect.any(Object));
    });
  });
});
