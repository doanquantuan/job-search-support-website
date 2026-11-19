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
      if (userId === 'ADMIN_GROUP') {
        socketIOInstance.to('admin:room').emit('notification:new', notificationDTO);
      } else {
        socketIOInstance.to(`user:${userId}`).emit('notification:new', notificationDTO);
      }
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
        targetUrl = data.applicationId ? `/my-applications?applicationId=${data.applicationId}` : '/my-applications';
        break;

      case 'application.submitted':
        type = 'APPLICATION';
        title = 'Có ứng viên mới nộp hồ sơ';
        content = `Ứng viên ${data.candidateName || 'mới'} vừa ứng tuyển vào vị trí "${data.jobTitle || 'công việc'}".`;
        targetUrl = data.jobId ? `/recruiter/jobs/${data.jobId}/candidates` : '/recruiter/applications';
        break;

      case 'application.withdrawn': {
        type = 'APPLICATION';
        title = 'Ứng viên đã rút hồ sơ ứng tuyển';
        const withdrawNote = data.note ? ` Lý do: ${data.note}` : '';
        content = `Ứng viên ${data.candidateName || 'một ứng viên'} đã rút hồ sơ khỏi vị trí "${data.jobTitle || 'công việc'}".${withdrawNote}`;
        targetUrl = data.jobId ? `/recruiter/jobs/${data.jobId}/candidates` : '/recruiter/applications';
        break;
      }

      case 'application.reminded':
        type = 'APPLICATION';
        title = 'Ứng viên nhắc nhở xem hồ sơ';
        content = data.message || `Ứng viên ${data.candidateName || 'một ứng viên'} vừa gửi lời nhắc bạn xem và phản hồi hồ sơ cho vị trí "${data.jobTitle || 'công việc'}".`;
        targetUrl = data.jobId ? `/recruiter/jobs/${data.jobId}/candidates` : '/recruiter/applications';
        break;

      case 'company.verification.status_changed': {
        type = 'COMPANY';
        const companyName = data.companyName || 'doanh nghiệp của bạn';
        const vStatus = data.verificationStatus || data.status;
        if (vStatus === 'APPROVED' || vStatus === 'VERIFIED') {
          title = 'Hồ sơ xác thực công ty đã được phê duyệt';
          content = `Chúc mừng! Công ty "${companyName}" đã được xác thực thành công. Bạn có thể đăng tin tuyển dụng ngay bây giờ.`;
        } else if (vStatus === 'ADDITIONAL_INFO_REQUIRED') {
          title = 'Yêu cầu bổ sung hồ sơ xác thực công ty';
          const detail = data.adminNote || data.rejectionReason;
          content = detail
            ? `Hồ sơ xác thực công ty "${companyName}" cần bổ sung thông tin: ${detail}`
            : `Hồ sơ xác thực công ty "${companyName}" cần bổ sung thêm thông tin để hoàn tất kiểm duyệt.`;
        } else {
          title = 'Hồ sơ xác thực công ty bị từ chối';
          const reason = data.rejectionReason || data.adminNote || 'Thông tin chưa hợp lệ';
          content = `Hồ sơ xác thực công ty "${companyName}" chưa được phê duyệt. Lý do: ${reason}.`;
        }
        targetUrl = '/recruiter/verification';
        break;
      }

      case 'job.auto_hidden':
        type = 'JOB';
        title = 'Tin tuyển dụng tạm thời bị ẩn';
        content = data.message || `Tin tuyển dụng "${data.jobTitle || ''}" đã tạm thời bị ẩn khỏi trang tìm kiếm do nhận nhiều báo cáo. Vui lòng kiểm tra lại nội dung tin đăng.`;
        targetUrl = '/recruiter/jobs';
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

      case 'job.report_alert':
        type = 'SECURITY';
        title = '🚨 CẢNH BÁO KHẨN: Tin tuyển dụng bị ngắt mạch tự động';
        content = data.message || `Tin tuyển dụng "${data.jobTitle || ''}" (ID: ${data.jobId}) đã vượt ngưỡng rủi ro an toàn và bị tự động ẩn khỏi hệ thống tìm kiếm.`;
        targetUrl = data.jobId ? `/admin/jobs/${data.jobId}/reports` : '/admin/job-reports';
        break;

      case 'job.matched':
        type = 'JOB';
        title = data.title || 'Gợi ý việc làm phù hợp với bạn';
        content = data.message || `Việc làm mới "${data.jobTitle || 'công việc'}" tại ${data.companyName || 'doanh nghiệp'} rất phù hợp với kỹ năng của bạn. Xem ngay!`;
        targetUrl = data.jobId ? `/jobs/${data.jobId}` : '/jobs';
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
