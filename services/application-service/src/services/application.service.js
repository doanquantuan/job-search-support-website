import applicationRepository from '../repositories/application.repository.js';
import prisma from '../config/prisma.js';
import { publish } from '#shared/rabbitmq/publisher.js';
import companyClient from '../rabbitmq/companyClient.js';
import jobClient from '../rabbitmq/jobClient.js';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '#shared/utils/errors.util.js';

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE || 'job_exchange';
const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE || 'job_search_topic_exchange';

const publishApplicationEvent = async (routingKey, data) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    await publish({
      exchange: EXCHANGE_NAME,
      routingKey,
      data,
    });
    console.log(`[application-service] Đã phát sự kiện [${routingKey}] qua shared RabbitMQ:`, data);
  } catch (error) {
    console.warn(`[application-service] Bỏ qua lỗi phát RabbitMQ event (${routingKey}):`, error.message);
  }
};

const publishNotificationEvent = async (routingKey, data) => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    await publish({
      exchange: NOTIFICATION_EXCHANGE,
      routingKey,
      data,
    });
    console.log(`[application-service] Đã phát thông báo [${routingKey}] cho recipientId=${data.recipientId}`);
  } catch (error) {
    console.warn(`[application-service] Bỏ qua lỗi phát thông báo (${routingKey}):`, error.message);
  }
};

const VALID_STATUSES = [
  'APPLIED',
  'VIEWED',
  'REVIEWING',
  'INTERVIEW',
  'REJECTED',
  'HIRED',
  'WITHDRAWN',
];

class ApplicationService {
  /**
   * Helper lấy companyId của recruiter (dùng local cache prisma.jobPost hoặc gọi qua RabbitMQ)
   */
  async _getCompanyIdByRecruiter(recruiterId) {
    if (!recruiterId || process.env.NODE_ENV === 'test') return null;
    return await companyClient.getCompanyIdByRecruiter(recruiterId);
  }

  /**
   * Helper đồng bộ thông tin JobPost từ job-service sang local DB nếu chưa có (qua RabbitMQ)
   */
  async _syncJobPostFromJobService(jobId) {
    if (!jobId || process.env.NODE_ENV === 'test') return null;
    return await jobClient.getJobById(jobId);
  }

  /**
   * Helper format đơn ứng tuyển đồng bộ với giao diện Recruiter ATS
   */
  _formatApplicationResponse(app) {
    if (!app) return null;
    let rawHistories = app.statusHistories || [];

    // Nếu đơn chưa có bản ghi lịch sử nào, tự động tạo 1 bản ghi khởi tạo APPLIED
    if (rawHistories.length === 0 && app.applicationStatus) {
      rawHistories = [
        {
          applicationStatus: app.applicationStatus,
          changedAt: app.appliedAt || app.createdAt || new Date(),
          changedBy: app.jobSeekerId,
          note: 'Ứng viên nộp hồ sơ ứng tuyển',
        },
      ];
    }

    const latestHistory = rawHistories.length > 0 ? rawHistories[0] : null;

    return {
      id: app.applicationId,
      applicationId: app.applicationId,
      jobId: app.jobId,
      jobTitle: app.jobPost?.title || 'Tin tuyển dụng',
      candidateName: app.jobSeeker?.user?.fullName || app.jobSeeker?.user?.email?.split('@')[0] || 'Ứng viên',
      candidateEmail: app.jobSeeker?.user?.email || '',
      candidatePhone: app.jobSeeker?.user?.phone || '',
      avatar: app.jobSeeker?.user?.avatar || null,
      cvUrl: app.cvUrl,
      cvTitle: app.cvTitle,
      coverLetter: app.coverLetter,
      applicationStatus: app.applicationStatus,
      status: app.applicationStatus,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      lastRemindedAt: app.lastRemindedAt || null,
      reminderCount: app.reminderCount || 0,
      lastNote: latestHistory?.note || null,
      statusHistories: rawHistories.map((h) => ({
        historyId: h.historyId,
        applicationId: h.applicationId || app.applicationId,
        status: h.applicationStatus || h.status,
        applicationStatus: h.applicationStatus || h.status,
        changedAt: h.changedAt,
        changedBy: h.changedBy,
        note: h.note,
      })),
      jobPost: app.jobPost,
    };
  }

  /**
   * Ứng viên nộp hồ sơ ứng tuyển
   */
  async applyJob(jobSeekerId, { jobId, cvId, cvUrl, cvTitle, coverLetter, jobTitle, recruiterId, companyId }) {
    if (!jobSeekerId) {
      throw new BadRequestError('ID ứng viên không hợp lệ');
    }

    if (!jobId) {
      throw new BadRequestError('ID tin tuyển dụng không được để trống');
    }

    // 1. Kiểm tra xem đã từng nộp hồ sơ vào tin tuyển dụng này chưa
    const existing = await applicationRepository.findApplicationBySeekerAndJob(jobSeekerId, jobId);
    if (existing) {
      if (existing.applicationStatus === 'WITHDRAWN') {
        throw new ConflictError('Bạn đã từng rút đơn khỏi tin tuyển dụng này. Vui lòng liên hệ nhà tuyển dụng để được hỗ trợ lại.');
      }
      throw new ConflictError('Bạn đã nộp đơn ứng tuyển cho công việc này rồi');
    }

    // Tự động truy vấn recruiterId, companyId, jobTitle và kiểm tra trạng thái hợp lệ của tin tuyển dụng qua CQRS replica hoặc RabbitMQ
    if (process.env.NODE_ENV !== 'test') {
      try {
        const jobInfo = await jobClient.getJobById(jobId);
        const currentStatus = jobInfo?.status;

        // Chặn ứng tuyển nếu công việc đang là bản nháp (DRAFT) hoặc không phải PUBLISHED
        if (currentStatus && currentStatus !== 'PUBLISHED') {
          if (currentStatus === 'DRAFT') {
            throw new BadRequestError('Tin tuyển dụng này hiện đang ở trạng thái bản nháp và chưa mở nhận hồ sơ ứng tuyển.');
          }
          throw new BadRequestError('Tin tuyển dụng này hiện đã đóng hoặc không còn nhận hồ sơ ứng tuyển.');
        }

        if (jobInfo) {
          recruiterId = recruiterId || jobInfo.recruiterId || jobInfo.userId;
          companyId = companyId || jobInfo.companyId;
          jobTitle = jobTitle || jobInfo.title;
        }
      } catch (err) {
        if (err instanceof BadRequestError) throw err;
        console.warn('[ApplicationService] Không thể lấy thông tin tin tuyển dụng:', err.message);
      }
    }

    // 2. Tạo đơn ứng tuyển & lưu lịch sử ban đầu (Snapshot CV từ user-service)
    const application = await applicationRepository.createApplication({
      jobSeekerId,
      jobId,
      cvId: cvId || null,
      cvUrl: cvUrl || null,
      cvTitle: cvTitle || null,
      coverLetter: coverLetter ? coverLetter.trim() : null,
      jobTitle,
      recruiterId,
      companyId,
    });

    // 3. Phát sự kiện sang RabbitMQ
    await publishApplicationEvent('application.created', {
      applicationId: application.applicationId,
      jobSeekerId,
      jobId,
      appliedAt: application.appliedAt,
    });

    // 4. Phát sự kiện thông báo realtime tới Recruiter chủ tin tuyển dụng
    const effectiveRecruiterId = recruiterId || application.jobPost?.recruiterId;
    const effectiveJobTitle = jobTitle || application.jobPost?.title || 'Tin tuyển dụng';
    if (effectiveRecruiterId && process.env.NODE_ENV !== 'test') {
      let candidateName = 'một ứng viên';
      try {
        const seekerUser = await prisma.user.findUnique({
          where: { id: jobSeekerId },
          select: { fullName: true, email: true },
        });
        if (seekerUser?.fullName) {
          candidateName = seekerUser.fullName;
        } else if (seekerUser?.email && !seekerUser.email.endsWith('@placeholder.local')) {
          candidateName = seekerUser.email.split('@')[0];
        }
      } catch (_err) {}

      await publishNotificationEvent('application.submitted', {
        eventId: `app-submitted-${application.applicationId}`,
        recipientId: effectiveRecruiterId,
        applicationId: application.applicationId,
        jobId,
        jobTitle: effectiveJobTitle,
        jobSeekerId,
        candidateName,
        appliedAt: application.appliedAt,
      });
    }

    return application;
  }

  /**
   * Helper bổ sung thông tin doanh nghiệp (companyName, companyLogo) từ company-service qua RabbitMQ Batch RPC
   */
  async _enrichCompanyInfo(applications) {
    if (!applications || !applications.length) return applications;

    const companyIds = [...new Set(
      applications
        .map((app) => app.jobPost?.companyId)
        .filter(Boolean)
    )];

    if (!companyIds.length) return applications;

    const companies = await companyClient.getCompaniesBatch(companyIds);
    const companyMap = new Map();
    if (Array.isArray(companies)) {
      for (const comp of companies) {
        if (comp?.companyId) {
          companyMap.set(comp.companyId, {
            companyId: comp.companyId,
            companyName: comp.companyName,
            logo: comp.logo,
          });
        }
      }
    }

    return applications.map((app) => {
      const cId = app.jobPost?.companyId;
      const comp = cId ? companyMap.get(cId) : null;
      return {
        ...app,
        company: comp || (cId ? { companyId: cId } : null),
        companyName: comp?.companyName || null,
        companyLogo: comp?.logo || null,
      };
    });
  }

  /**
   * Kiểm tra trạng thái ứng tuyển của ứng viên đối với 1 job
   */
  async checkAppliedStatus(jobSeekerId, jobId) {
    if (!jobSeekerId || !jobId) {
      return { hasApplied: false };
    }
    const application = await applicationRepository.findApplicationBySeekerAndJob(jobSeekerId, jobId);
    const hasApplied = !!application && application.applicationStatus !== 'WITHDRAWN';
    return {
      hasApplied,
      applicationId: application?.applicationId || null,
      status: application?.applicationStatus || null,
      appliedAt: application?.appliedAt || null,
    };
  }

  /**
   * Ứng viên xem danh sách các đơn đã nộp
   */
  async getMyApplications(jobSeekerId, query = {}) {
    if (!jobSeekerId) {
      throw new BadRequestError('ID ứng viên không hợp lệ');
    }

    if (query.status && !VALID_STATUSES.includes(query.status.toUpperCase())) {
      throw new BadRequestError(`Trạng thái lọc không hợp lệ: ${query.status}`);
    }

    const result = await applicationRepository.findApplicationsByJobSeeker(jobSeekerId, {
      ...query,
      status: query.status ? query.status.toUpperCase() : undefined,
    });

    if (result && Array.isArray(result.data)) {
      result.data = await this._enrichCompanyInfo(result.data);
      result.data = result.data.map((app) => this._formatApplicationResponse(app));
    }

    return result;
  }

  /**
   * Xem chi tiết 1 đơn ứng tuyển (kiểm tra quyền truy cập theo CompanyId-Scope)
   */
  async getApplicationDetail(applicationId, currentUser) {
    if (!applicationId) {
      throw new BadRequestError('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await applicationRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Không tìm thấy thông tin đơn ứng tuyển');
    }

    const currentUserId = currentUser.userId || currentUser.id;

    // Lấy companyId của recruiter (nếu currentUser là RECRUITER)
    let companyId = null;
    if (currentUser.role === 'RECRUITER') {
      companyId = await this._getCompanyIdByRecruiter(currentUserId);
    }

    // Kiểm tra quyền: Chỉ chính ứng viên đó, hoặc nhà tuyển dụng thuộc công ty sở hữu Job, hoặc Admin mới được xem
    const isJobSeekerOwner = currentUser.role === 'JOB_SEEKER' && application.jobSeekerId === currentUserId;
    let isRecruiterOwner = currentUser.role === 'RECRUITER' && (
      application.jobPost?.recruiterId === currentUserId ||
      (companyId && application.jobPost?.companyId === companyId)
    );

    // Fallback sync nếu jobPost chưa có trong local DB hoặc khuyết companyId
    if (!isRecruiterOwner && currentUser.role === 'RECRUITER' && application.jobId) {
      const synced = await this._syncJobPostFromJobService(application.jobId);
      if (synced && (synced.recruiterId === currentUserId || (companyId && synced.companyId === companyId))) {
        isRecruiterOwner = true;
      }
    }

    const isAdmin = currentUser.role === 'ADMIN';

    if (!isJobSeekerOwner && !isRecruiterOwner && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền xem đơn ứng tuyển này');
    }

    // Nếu nhà tuyển dụng xem lần đầu khi trạng thái đang là APPLIED -> Tự động chuyển sang VIEWED
    if (currentUser.role === 'RECRUITER' && application.applicationStatus === 'APPLIED') {
      const updated = await applicationRepository.updateApplicationStatus(applicationId, {
        status: 'VIEWED',
        changedBy: currentUserId,
        note: 'Nhà tuyển dụng đã mở xem hồ sơ',
      });

      await publishApplicationEvent('application.status_changed', {
        applicationId,
        status: 'VIEWED',
        changedBy: currentUserId,
      });

      await publishNotificationEvent('application.status_changed', {
        eventId: `app-status-${applicationId}-VIEWED-${Date.now()}`,
        recipientId: application.jobSeekerId,
        applicationId,
        jobId: application.jobId,
        jobTitle: application.jobPost?.title || 'Tin tuyển dụng',
        status: 'VIEWED',
        note: 'Nhà tuyển dụng đã mở xem hồ sơ',
      });

      return this._formatApplicationResponse(updated);
    }

    return this._formatApplicationResponse(application);
  }

  /**
   * Ứng viên tự rút đơn ứng tuyển
   */
  async withdrawApplication(jobSeekerId, applicationId, note) {
    if (!jobSeekerId || !applicationId) {
      throw new BadRequestError('Thông tin yêu cầu không hợp lệ');
    }

    const application = await applicationRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
    }

    if (application.jobSeekerId !== jobSeekerId) {
      throw new ForbiddenError('Bạn không có quyền rút đơn ứng tuyển của người khác');
    }

    if (application.applicationStatus === 'WITHDRAWN') {
      throw new BadRequestError('Đơn ứng tuyển này đã được rút trước đó');
    }

    if (['HIRED', 'REJECTED'].includes(application.applicationStatus)) {
      throw new BadRequestError(`Không thể rút đơn khi kết quả đã là ${application.applicationStatus}`);
    }

    const updated = await applicationRepository.withdrawApplication(applicationId, jobSeekerId, note);

    await publishApplicationEvent('application.status_changed', {
      applicationId,
      status: 'WITHDRAWN',
      changedBy: jobSeekerId,
      note,
    });

    // Thông báo cho Recruiter khi ứng viên rút đơn
    const ownerRecruiterId = application.jobPost?.recruiterId;
    if (ownerRecruiterId) {
      const seekerUser = application.jobSeeker?.user;
      const candidateName =
        seekerUser?.fullName ||
        (seekerUser?.email && !seekerUser.email.endsWith('@placeholder.local')
          ? seekerUser.email.split('@')[0]
          : 'một ứng viên');

      await publishNotificationEvent('application.withdrawn', {
        eventId: `app-withdrawn-${applicationId}-${Date.now()}`,
        recipientId: ownerRecruiterId,
        applicationId,
        jobId: application.jobId,
        jobTitle: application.jobPost?.title || 'Tin tuyển dụng',
        jobSeekerId,
        candidateName,
        note: note ? note.trim() : null,
      });
    }

    return this._formatApplicationResponse(updated);
  }

  /**
   * Nhà tuyển dụng xem danh sách ứng viên theo tin tuyển dụng (CompanyId-Scope)
   */
  async getJobApplications(recruiterId, jobId, query = {}) {
    if (!jobId) {
      throw new BadRequestError('ID tin tuyển dụng không được để trống');
    }

    if (query.status && query.status !== 'ALL' && !VALID_STATUSES.includes(query.status.toUpperCase())) {
      throw new BadRequestError(`Trạng thái lọc không hợp lệ: ${query.status}`);
    }

    // Kiểm tra quyền sở hữu tin tuyển dụng
    let jobPost = null;
    try {
      jobPost = await prisma.jobPost.findUnique({ where: { jobId } });
    } catch (_dbErr) {}

    if (!jobPost && process.env.NODE_ENV !== 'test') {
      jobPost = await this._syncJobPostFromJobService(jobId);
    }
    if (!jobPost && process.env.NODE_ENV !== 'test') {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (jobPost && jobPost.recruiterId && jobPost.recruiterId !== recruiterId) {
      const companyId = await this._getCompanyIdByRecruiter(recruiterId);
      let isCompanyOwner = companyId && jobPost.companyId === companyId;
      if (!isCompanyOwner && process.env.NODE_ENV !== 'test') {
        const synced = await this._syncJobPostFromJobService(jobId);
        if (synced && ((companyId && synced.companyId === companyId) || synced.recruiterId === recruiterId)) {
          isCompanyOwner = true;
        }
      }
      if (!isCompanyOwner) {
        throw new ForbiddenError('Bạn không có quyền xem danh sách ứng viên của tin tuyển dụng này');
      }
    }

    const result = await applicationRepository.findApplicationsByJobId(jobId, query);
    return {
      ...result,
      data: result.data.map((app) => this._formatApplicationResponse(app)),
    };
  }

  /**
   * Nhà tuyển dụng xem danh sách tất cả ứng viên thuộc về các tin tuyển dụng của công ty mình (CompanyId-Scope)
   */
  async getAllRecruiterApplications(recruiterId, query = {}, isAdmin = false) {
    if (!recruiterId) {
      throw new BadRequestError('ID nhà tuyển dụng không hợp lệ');
    }

    if (query.status && query.status !== 'ALL' && !VALID_STATUSES.includes(query.status.toUpperCase())) {
      throw new BadRequestError(`Trạng thái lọc không hợp lệ: ${query.status}`);
    }

    const companyId = isAdmin ? null : await this._getCompanyIdByRecruiter(recruiterId);
    const result = await applicationRepository.findApplicationsByRecruiter(recruiterId, query, companyId, isAdmin);
    return {
      ...result,
      data: result.data.map((app) => this._formatApplicationResponse(app)),
    };
  }

  /**
   * Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển (CompanyId-Scope)
   */
  async updateApplicationStatus(recruiterId, applicationId, { status, note }) {
    if (!applicationId || !status) {
      throw new BadRequestError('ID đơn ứng tuyển và trạng thái mới là bắt buộc');
    }

    const normalizedStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throw new BadRequestError(`Trạng thái không hợp lệ (${VALID_STATUSES.join(', ')})`);
    }

    const application = await applicationRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
    }

    if (application.jobPost?.recruiterId && application.jobPost.recruiterId !== recruiterId) {
      const companyId = await this._getCompanyIdByRecruiter(recruiterId);
      let isCompanyOwner = companyId && application.jobPost.companyId === companyId;

      if (!isCompanyOwner && application.jobId && process.env.NODE_ENV !== 'test') {
        const synced = await this._syncJobPostFromJobService(application.jobId);
        if (synced && ((companyId && synced.companyId === companyId) || synced.recruiterId === recruiterId)) {
          isCompanyOwner = true;
        }
      }

      if (!isCompanyOwner) {
        throw new ForbiddenError('Bạn không có quyền cập nhật đơn ứng tuyển của tin tuyển dụng khác');
      }
    }

    if (application.applicationStatus === 'WITHDRAWN') {
      throw new BadRequestError('Ứng viên đã rút đơn, không thể cập nhật trạng thái');
    }

    const updated = await applicationRepository.updateApplicationStatus(applicationId, {
      status: normalizedStatus,
      changedBy: recruiterId,
      note: note ? note.trim() : null,
    });

    // Phát event thông báo trạng thái nội bộ
    await publishApplicationEvent('application.status_changed', {
      applicationId,
      status: normalizedStatus,
      changedBy: recruiterId,
      note,
    });

    // Phát thông báo cho Ứng viên (Job Seeker) qua NOTIFICATION_EXCHANGE
    await publishNotificationEvent('application.status_changed', {
      eventId: `app-status-${applicationId}-${normalizedStatus}-${Date.now()}`,
      recipientId: application.jobSeekerId,
      applicationId,
      jobId: application.jobId,
      jobTitle: application.jobPost?.title || 'Tin tuyển dụng',
      status: normalizedStatus,
      note: note ? note.trim() : null,
    });

    return this._formatApplicationResponse(updated);
  }

  /**
   * Ứng viên gửi lời nhắc nhở NTD xem hồ sơ (có cooldown 24h)
   */
  async remindRecruiter(jobSeekerId, applicationId) {
    if (!jobSeekerId || !applicationId) {
      throw new BadRequestError('Thông tin yêu cầu không hợp lệ');
    }

    const application = await applicationRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Không tìm thấy đơn ứng tuyển');
    }

    if (application.jobSeekerId !== jobSeekerId) {
      throw new ForbiddenError('Bạn không có quyền thao tác trên đơn ứng tuyển của người khác');
    }

    // Không cho phép nhắc nếu đã có kết quả hoặc đã rút
    if (['HIRED', 'REJECTED', 'WITHDRAWN'].includes(application.applicationStatus)) {
      throw new BadRequestError(`Không thể gửi lời nhắc khi trạng thái hồ sơ đã là ${application.applicationStatus}`);
    }

    // Kiểm tra Cooldown 24 giờ
    if (application.lastRemindedAt) {
      const diffMs = Date.now() - new Date(application.lastRemindedAt).getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;
      if (diffMs < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - diffMs) / (60 * 60 * 1000));
        throw new BadRequestError(`Bạn đã gửi lời nhắc gần đây. Vui lòng thử lại sau ${remainingHours} giờ nữa.`);
      }
    }

    // Cập nhật DB
    const updated = await applicationRepository.updateApplicationReminder(applicationId);

    // Lấy tên ứng viên và recruiterId
    let candidateName = 'Một ứng viên';
    if (application.jobSeeker?.user?.fullName) {
      candidateName = application.jobSeeker.user.fullName;
    } else if (application.jobSeeker?.user?.email && !application.jobSeeker.user.email.endsWith('@placeholder.local')) {
      candidateName = application.jobSeeker.user.email.split('@')[0];
    }

    const ownerRecruiterId = application.jobPost?.recruiterId;
    if (ownerRecruiterId) {
      await publishNotificationEvent('application.reminded', {
        eventId: `app-remind-${applicationId}-${Date.now()}`,
        recipientId: ownerRecruiterId,
        applicationId,
        jobId: application.jobId,
        jobTitle: application.jobPost?.title || 'Tin tuyển dụng',
        jobSeekerId,
        candidateName,
        message: `Ứng viên ${candidateName} vừa gửi lời nhắc bạn xem và phản hồi hồ sơ cho vị trí "${application.jobPost?.title || 'công việc'}".`,
      });
    }

    return this._formatApplicationResponse(updated);
  }
}

export default new ApplicationService();
