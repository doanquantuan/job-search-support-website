import notificationRepository from '../repositories/notification.repository.js';
import Notification from '../domain/entities/Notification.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.util.js';

let socketIOInstance = null;

class NotificationService {

  setSocketIO(io) {
    socketIOInstance = io;
  }

  // Phát thông báo realtime tới room của người dùng

  emitRealtimeNotification(userId, notificationDTO) {
    if (socketIOInstance) {
      socketIOInstance.to(`user:${userId}`).emit('notification:new', notificationDTO);
    }
  }

  async getNotifications(userId, { page = 1, limit = 10, isRead, type }) {
    const result = await notificationRepository.findByUserId(userId, {
      page,
      limit,
      isRead,
      type,
    });

    const items = result.notifications.map((record) => {
      const entity = new Notification(record);
      return entity.toDTO();
    });

    return {
      items,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    };
  }

  async getUnreadCount(userId) {
    const unreadCount = await notificationRepository.countUnread(userId);
    return { unreadCount };
  }

  async getNotificationById(userId, notificationId) {
    const record = await notificationRepository.findById(notificationId);
    if (!record) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    const entity = new Notification(record);
    if (!entity.belongsTo(userId)) {
      throw new ForbiddenError('Bạn không có quyền xem thông báo này');
    }

    if (!entity.isRead) {
      const updated = await notificationRepository.markAsRead(notificationId);
      return new Notification(updated).toDTO();
    }

    return entity.toDTO();
  }


  async markAsRead(userId, notificationId) {
    const record = await notificationRepository.findById(notificationId);
    if (!record) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    const entity = new Notification(record);
    if (!entity.belongsTo(userId)) {
      throw new ForbiddenError('Bạn không có quyền thao tác trên thông báo này');
    }

    if (!entity.isRead) {
      const updated = await notificationRepository.markAsRead(notificationId);
      return new Notification(updated).toDTO();
    }

    return entity.toDTO();
  }


  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllAsRead(userId);
    return {
      updatedCount: result.count,
    };
  }


  async deleteNotification(userId, notificationId) {
    const record = await notificationRepository.findById(notificationId);
    if (!record) {
      throw new NotFoundError('Không tìm thấy thông báo');
    }

    const entity = new Notification(record);
    if (!entity.belongsTo(userId)) {
      throw new ForbiddenError('Bạn không có quyền thao tác trên thông báo này');
    }

    await notificationRepository.deleteById(notificationId);
    return { success: true };
  }


  async createSystemNotification({ recipientId, title, content, type = 'SYSTEM', targetUrl, metadata }) {
    const created = await notificationRepository.create({
      userId: recipientId,
      title,
      content,
      type,
      targetUrl,
      metadata,
    });

    const dto = new Notification(created).toDTO();
    this.emitRealtimeNotification(recipientId, dto);

    return dto;
  }


  async processDomainEvent({ eventId, event, recipientId, data = {} }) {
    if (!recipientId) {
      throw new BadRequestError('Sự kiện thiếu mã người nhận (recipientId)');
    }

    // Kiểm tra Idempotency
    if (eventId) {
      const existing = await notificationRepository.findByEventAndUser(eventId, recipientId);
      if (existing) {
        return { duplicate: true, notification: new Notification(existing).toDTO() };
      }
    }


    let title = 'Thông báo mới';
    let content = 'Bạn có một thông báo mới từ hệ thống';
    let type = 'SYSTEM';
    let targetUrl = null;

    switch (event) {
      case 'application.status_changed':
        type = 'APPLICATION';
        title = 'Cập nhật trạng thái hồ sơ ứng tuyển';
        content = `Hồ sơ của bạn cho vị trí "${data.jobTitle || 'công việc'}" đã chuyển sang trạng thái: ${data.status || 'Được cập nhật'}.`;
        targetUrl = data.applicationId ? `/applications/${data.applicationId}` : '/applications';
        break;

      case 'application.submitted':
        type = 'APPLICATION';
        title = 'Có ứng viên mới nộp hồ sơ';
        content = `Ứng viên ${data.candidateName || 'mới'} vừa ứng tuyển vào vị trí "${data.jobTitle || 'công việc'}".`;
        targetUrl = data.jobId ? `/recruiter/jobs/${data.jobId}/candidates` : '/recruiter/applications';
        break;

      case 'company.verification.status_changed':
        type = 'COMPANY';
        title = 'Kết quả xác thực hồ sơ doanh nghiệp';
        content = data.verificationStatus === 'APPROVED' || data.verificationStatus === 'VERIFIED'
          ? `Chúc mừng! Hồ sơ doanh nghiệp "${data.companyName}" đã được kiểm duyệt thành công.`
          : `Hồ sơ doanh nghiệp "${data.companyName}" đã bị từ chối. Lý do: ${data.rejectionReason || 'Không hợp lệ'}.`;
        targetUrl = '/recruiter/company/verification';
        break;

      case 'auth.password_changed':
        type = 'SECURITY';
        title = 'Cảnh báo bảo mật: Mật khẩu đã thay đổi';
        content = 'Mật khẩu tài khoản của bạn vừa được thay đổi thành công. Nếu không phải bạn thực hiện, vui lòng liên hệ ngay với quản trị viên.';
        targetUrl = '/account/security';
        break;

      case 'user.status_changed':
        type = 'SECURITY';
        title = 'Thông báo trạng thái tài khoản';
        content = `Tài khoản của bạn đã được cập nhật trạng thái: ${data.status || 'Mới'}.`;
        targetUrl = '/profile';
        break;

      case 'chat.message_sent':
        type = 'MESSAGE';
        title = `Tin nhắn mới từ ${data.senderName || 'Người dùng'}`;
        content = data.content ? (data.content.length > 60 ? `${data.content.slice(0, 57)}...` : data.content) : 'Bạn nhận được một tin nhắn mới.';
        targetUrl = data.conversationId ? `/chat/${data.conversationId}` : '/chat';
        break;

      case 'report.resolved':
        type = 'SYSTEM';
        title = 'Báo cáo vi phạm đã được xử lý';
        content = `Báo cáo của bạn về "${data.targetName || 'nội dung'}" đã được ban quản trị xem xét và xử lý.`;
        targetUrl = '/reports';
        break;

      default:
        title = data.title || title;
        content = data.content || content;
        type = data.type || type;
        targetUrl = data.targetUrl || targetUrl;
        break;
    }

    // Lưu vào Database
    const created = await notificationRepository.create({
      userId: recipientId,
      title,
      content,
      type,
      targetUrl,
      metadata: data,
      eventId,
    });

    const dto = new Notification(created).toDTO();

    // Phát Realtime 
    this.emitRealtimeNotification(recipientId, dto);

    return { duplicate: false, notification: dto };
  }
}

export default new NotificationService();
