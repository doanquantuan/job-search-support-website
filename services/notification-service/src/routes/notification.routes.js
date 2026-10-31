import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { authenticateSystem } from '../middlewares/internal-auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  createSystemNotificationSchema,
} from '../validators/notification.validator.js';

const router = express.Router();




router.get(
  '/unread-count',
  authenticateToken,
  notificationController.getUnreadCount
);


router.patch(
  '/read-all',
  authenticateToken,
  notificationController.markAllAsRead
);


router.post(
  '/system',
  authenticateSystem,
  validate(createSystemNotificationSchema, 'body'),
  notificationController.createSystemNotification
);



// Lấy danh sách thông báo phân trang của user hiện tại
router.get(
  '/',
  authenticateToken,
  validate(getNotificationsQuerySchema, 'query'),
  notificationController.getNotifications
);

router.get(
  '/:id',
  authenticateToken,
  validate(notificationIdParamSchema, 'params'),
  notificationController.getNotificationById
);


router.patch(
  '/:id/read',
  authenticateToken,
  validate(notificationIdParamSchema, 'params'),
  notificationController.markAsRead
);

router.delete(
  '/:id',
  authenticateToken,
  validate(notificationIdParamSchema, 'params'),
  notificationController.deleteNotification
);

export default router;
