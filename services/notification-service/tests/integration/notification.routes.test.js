import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import config from '../../src/config/env.config.js';
import notificationService from '../../src/services/notification.service.js';
import { NotFoundError, ForbiddenError } from '../../src/utils/errors.util.js';

describe('Notification API Integration Tests (/api/v1/notifications) [ESM]', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const userA = {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'userA@test.com',
    role: 'JOB_SEEKER',
  };

  const userB = {
    id: 'b0000000-0000-0000-0000-000000000002',
    email: 'userB@test.com',
    role: 'JOB_SEEKER',
  };

  const adminUser = {
    id: '99999999-9999-9999-9999-999999999999',
    email: 'admin@test.com',
    role: 'ADMIN',
  };

  const tokenUserA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1h' });
  const tokenUserB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1h' });
  const tokenAdmin = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });

  const validUUID = 'c0000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. GET /api/v1/notifications', () => {
    it('200 OK: Lấy danh sách thông báo phân trang thành công', async () => {
      jest.spyOn(notificationService, 'getNotifications').mockResolvedValue({
        items: [
          {
            notificationId: validUUID,
            userId: userA.id,
            title: 'Thông báo tuyển dụng',
            content: 'Nội dung thông báo',
            type: 'APPLICATION',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: {
          totalCount: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        },
      });

      const res = await request(app)
        .get('/api/v1/notifications?page=1&limit=10')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination.totalCount).toBe(1);
    });

    it('400 Bad Request: Khi truyền limit vượt quá mức tối đa 50', async () => {
      const res = await request(app)
        .get('/api/v1/notifications?limit=100')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('50');
    });

    it('400 Bad Request: Khi truyền page không hợp lệ (< 1)', async () => {
      const res = await request(app)
        .get('/api/v1/notifications?page=-1')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('401 Unauthorized: Khi không truyền Authorization header', async () => {
      const res = await request(app).get('/api/v1/notifications');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. GET /api/v1/notifications/unread-count (Kiểm tra thứ tự route)', () => {
    it('200 OK: Trả về số lượng chưa đọc mà KHÔNG bị nhầm lẫn vào route /:id', async () => {
      jest.spyOn(notificationService, 'getUnreadCount').mockResolvedValue({ unreadCount: 3 });
      jest.spyOn(notificationService, 'getNotificationById');

      const res = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadCount).toBe(3);
      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(userA.id);
      expect(notificationService.getNotificationById).not.toHaveBeenCalled();
    });
  });

  describe('3. PATCH /api/v1/notifications/read-all (Kiểm tra thứ tự route)', () => {
    it('200 OK: Đánh dấu tất cả đã đọc mà KHÔNG bị nhầm lẫn vào route /:id', async () => {
      jest.spyOn(notificationService, 'markAllAsRead').mockResolvedValue({ updatedCount: 5 });
      jest.spyOn(notificationService, 'markAsRead');

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updatedCount).toBe(5);
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(userA.id);
      expect(notificationService.markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('4. GET /api/v1/notifications/:id', () => {
    it('200 OK: Lấy chi tiết thông báo thành công', async () => {
      jest.spyOn(notificationService, 'getNotificationById').mockResolvedValue({
        notificationId: validUUID,
        userId: userA.id,
        title: 'Chi tiết thông báo',
        content: 'Nội dung',
        isRead: true,
      });

      const res = await request(app)
        .get(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notificationId).toBe(validUUID);
    });

    it('400 Bad Request: ID không đúng định dạng UUID', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/not-a-valid-uuid-123')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('UUID');
    });

    it('404 Not Found: Khi ID không tồn tại', async () => {
      jest.spyOn(notificationService, 'getNotificationById').mockRejectedValue(
        new NotFoundError('Không tìm thấy thông báo')
      );

      const res = await request(app)
        .get(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('403 Forbidden: Khi cố xem thông báo của người khác (Chống IDOR)', async () => {
      jest.spyOn(notificationService, 'getNotificationById').mockRejectedValue(
        new ForbiddenError('Bạn không có quyền xem thông báo này')
      );

      const res = await request(app)
        .get(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. PATCH /api/v1/notifications/:id/read', () => {
    it('200 OK: Đánh dấu đã đọc thành công', async () => {
      jest.spyOn(notificationService, 'markAsRead').mockResolvedValue({
        notificationId: validUUID,
        isRead: true,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${validUUID}/read`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
    });

    it('404 Not Found: ID không tồn tại', async () => {
      jest.spyOn(notificationService, 'markAsRead').mockRejectedValue(
        new NotFoundError('Không tìm thấy thông báo')
      );

      const res = await request(app)
        .patch(`/api/v1/notifications/${validUUID}/read`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
    });

    it('403 Forbidden: Cố đánh dấu thông báo của người khác', async () => {
      jest.spyOn(notificationService, 'markAsRead').mockRejectedValue(
        new ForbiddenError('Bạn không có quyền thao tác trên thông báo này')
      );

      const res = await request(app)
        .patch(`/api/v1/notifications/${validUUID}/read`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
    });
  });

  describe('6. DELETE /api/v1/notifications/:id', () => {
    it('200 OK: Xóa thông báo thành công', async () => {
      jest.spyOn(notificationService, 'deleteNotification').mockResolvedValue({ success: true });

      const res = await request(app)
        .delete(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('404 Not Found: Khi ID không tồn tại', async () => {
      jest.spyOn(notificationService, 'deleteNotification').mockRejectedValue(
        new NotFoundError('Không tìm thấy thông báo')
      );

      const res = await request(app)
        .delete(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
    });

    it('403 Forbidden: Khi cố xóa thông báo của user khác', async () => {
      jest.spyOn(notificationService, 'deleteNotification').mockRejectedValue(
        new ForbiddenError('Bạn không có quyền thao tác trên thông báo này')
      );

      const res = await request(app)
        .delete(`/api/v1/notifications/${validUUID}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
    });
  });

  describe('7. POST /api/v1/notifications/system (Phân quyền & Bảo mật)', () => {
    const payload = {
      recipientId: userA.id,
      title: 'Thông báo toàn hệ thống',
      content: 'Bảo trì máy chủ lúc 0h',
      type: 'SYSTEM',
    };

    it('201 Created: Tạo thông báo thành công khi có Token Role ADMIN', async () => {
      jest.spyOn(notificationService, 'createSystemNotification').mockResolvedValue({
        notificationId: validUUID,
        ...payload,
      });

      const res = await request(app)
        .post('/api/v1/notifications/system')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(notificationService.createSystemNotification).toHaveBeenCalledWith(
        expect.objectContaining(payload)
      );
    });

    it('201 Created: Tạo thông báo thành công khi có x-internal-service-key hợp lệ', async () => {
      jest.spyOn(notificationService, 'createSystemNotification').mockResolvedValue({
        notificationId: validUUID,
        ...payload,
      });

      const res = await request(app)
        .post('/api/v1/notifications/system')
        .set('x-internal-service-key', config.INTERNAL_SERVICE_KEY)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('403 Forbidden: Khi người dùng thông thường (JOB_SEEKER) cố tình gọi route /system', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/system')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/quyền/i);
    });

    it('401 Unauthorized: Khi không có Token cũng không có Service Key', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/system')
        .send(payload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('400 Bad Request: Dữ liệu payload thiếu recipientId hoặc title', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/system')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ title: 'Thiếu người nhận' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
