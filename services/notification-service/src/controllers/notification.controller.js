import notificationService from '../services/notification.service.js';
import { successResponse } from '../utils/response.util.js';

class NotificationController {
  // GET /api/v1/notifications
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const query = req.validatedQuery || {};
      const result = await notificationService.getNotifications(userId, query);

      return successResponse(res, 'Lấy danh sách thông báo thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/notifications/unread-count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.getUnreadCount(userId);

      return successResponse(res, 'Lấy số lượng thông báo chưa đọc thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/notifications/:id
  async getNotificationById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.validatedParams;
      const result = await notificationService.getNotificationById(userId, id);

      return successResponse(res, 'Lấy chi tiết thông báo thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.validatedParams;
      const result = await notificationService.markAsRead(userId, id);

      return successResponse(res, 'Đánh dấu thông báo đã đọc thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/notifications/read-all
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.markAllAsRead(userId);

      return successResponse(res, 'Đánh dấu tất cả thông báo là đã đọc thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/notifications/:id
  async deleteNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.validatedParams;
      const result = await notificationService.deleteNotification(userId, id);

      return successResponse(res, 'Xóa thông báo thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/notifications/system
  async createSystemNotification(req, res, next) {
    try {
      const data = req.validatedBody;
      const result = await notificationService.createSystemNotification(data);

      return successResponse(res, 'Tạo thông báo hệ thống thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
