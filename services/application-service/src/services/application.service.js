import applicationRepository from '../repositories/application.repository.js';
import prisma from '../config/prisma.js';
import { publish } from '#shared/rabbitmq/publisher.js';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '#shared/utils/errors.util.js';

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE || 'job_exchange';

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
   * Helper lấy companyId của recruiter (dùng local cache prisma.jobPost hoặc gọi sang company-service)
   */
  async _getCompanyIdByRecruiter(recruiterId) {
    if (!recruiterId) return null;

    // 1. Kiểm tra trong local JobPost
    const localJob = await prisma.jobPost.findFirst({
      where: {
        recruiterId,
        companyId: { not: null },
      },
      select: { companyId: true },
    });
    if (localJob?.companyId) {
      return localJob.companyId;
    }

    // 2. Gọi sang company-service
    try {
      const res = await fetch(`http://localhost:5004/api/v1/companies/internal/by-recruiter/${recruiterId}`);
      if (res.ok) {
        const json = await res.json();
        const cId = json.data?.companyId;
        if (cId) {
          // Cập nhật ngược lại các jobPost của recruiter này nếu đang bị khuyết companyId
          prisma.jobPost.updateMany({
            where: { recruiterId, companyId: null },
            data: { companyId: cId },
          }).catch(() => {});
          return cId;
        }
      }
    } catch (err) {
      console.warn('[ApplicationService] Không thể kết nối company-service lấy companyId:', err.message);
    }

    return null;
  }

  /**
   * Helper đồng bộ thông tin JobPost từ job-service sang local DB nếu chưa có
   */
  async _syncJobPostFromJobService(jobId) {
    if (!jobId) return null;
    try {
      const res = await fetch(`http://localhost:5003/api/v1/jobs/${jobId}`);
      if (res.ok) {
        const json = await res.json();
        const jobObj = json.data || json;
        if (jobObj && jobObj.jobId) {
          return await prisma.jobPost.upsert({
            where: { jobId: jobObj.jobId },
            update: {
              title: jobObj.title || 'Tin tuyển dụng',
              recruiterId: jobObj.userId || null,
              companyId: jobObj.companyId || null,
              status: jobObj.status || 'OPEN',
            },
            create: {
              jobId: jobObj.jobId,
              title: jobObj.title || 'Tin tuyển dụng',
              recruiterId: jobObj.userId || null,
              companyId: jobObj.companyId || null,
              status: jobObj.status || 'OPEN',
            },
          });
        }
      }
    } catch (err) {
      console.warn(`[ApplicationService] Lỗi đồng bộ job ${jobId} từ job-service:`, err.message);
    }
    return null;
  }

  /**
   * Helper format đơn ứng tuyển đồng bộ với giao diện Recruiter ATS
   */
  _formatApplicationResponse(app) {
    if (!app) return null;
    const latestHistory = app.statusHistories && app.statusHistories.length > 0
      ? app.statusHistories[0]
      : null;

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
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      lastNote: latestHistory?.note || null,
      statusHistories: (app.statusHistories || []).map((h) => ({
        status: h.applicationStatus,
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

    // Tự động truy vấn recruiterId, companyId và jobTitle nếu client chưa truyền
    try {
      const existingJob = await prisma.jobPost.findUnique({ where: { jobId } });
      if (existingJob) {
        recruiterId = recruiterId || existingJob.recruiterId;
        companyId = companyId || existingJob.companyId;
        jobTitle = jobTitle || existingJob.title;
      }
      if (!companyId || !recruiterId) {
        const jobRes = await fetch(`http://localhost:5003/api/v1/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobJson = await jobRes.json();
          const jobObj = jobJson.data || jobJson;
          if (jobObj) {
            recruiterId = recruiterId || jobObj.userId;
            companyId = companyId || jobObj.companyId;
            jobTitle = jobTitle || jobObj.title;
          }
        }
      }
    } catch (err) {
      console.warn('[ApplicationService] Không thể tự động lấy thông tin tin tuyển dụng từ job-service:', err.message);
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

    // 3. Phát sự kiện sang RabbitMQ (để notification-service gửi email thông báo)
    await publishApplicationEvent('application.created', {
      applicationId: application.applicationId,
      jobSeekerId,
      jobId,
      appliedAt: application.appliedAt,
    });

    return application;
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

    return applicationRepository.findApplicationsByJobSeeker(jobSeekerId, {
      ...query,
      status: query.status ? query.status.toUpperCase() : undefined,
    });
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

    return updated;
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

    // Lấy companyId của recruiter
    const companyId = await this._getCompanyIdByRecruiter(recruiterId);

    // Kiểm tra quyền sở hữu tin tuyển dụng
    let jobPost = await prisma.jobPost.findUnique({ where: { jobId } });
    if (!jobPost) {
      jobPost = await this._syncJobPostFromJobService(jobId);
    }
    if (!jobPost) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    let isOwner = (companyId && jobPost.companyId === companyId) || jobPost.recruiterId === recruiterId;
    if (!isOwner) {
      const synced = await this._syncJobPostFromJobService(jobId);
      if (synced && ((companyId && synced.companyId === companyId) || synced.recruiterId === recruiterId)) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      throw new ForbiddenError('Bạn không có quyền xem danh sách ứng viên của tin tuyển dụng này');
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
  async getAllRecruiterApplications(recruiterId, query = {}) {
    if (!recruiterId) {
      throw new BadRequestError('ID nhà tuyển dụng không hợp lệ');
    }

    if (query.status && query.status !== 'ALL' && !VALID_STATUSES.includes(query.status.toUpperCase())) {
      throw new BadRequestError(`Trạng thái lọc không hợp lệ: ${query.status}`);
    }

    const companyId = await this._getCompanyIdByRecruiter(recruiterId);
    const result = await applicationRepository.findApplicationsByRecruiter(recruiterId, query, companyId);
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

    const companyId = await this._getCompanyIdByRecruiter(recruiterId);
    let isOwner = (companyId && application.jobPost?.companyId === companyId) ||
                  application.jobPost?.recruiterId === recruiterId;

    if (!isOwner && application.jobId) {
      const synced = await this._syncJobPostFromJobService(application.jobId);
      if (synced && ((companyId && synced.companyId === companyId) || synced.recruiterId === recruiterId)) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      throw new ForbiddenError('Bạn không có quyền cập nhật đơn ứng tuyển của tin tuyển dụng này');
    }

    if (application.applicationStatus === 'WITHDRAWN') {
      throw new BadRequestError('Ứng viên đã rút đơn, không thể cập nhật trạng thái');
    }

    const updated = await applicationRepository.updateApplicationStatus(applicationId, {
      status: normalizedStatus,
      changedBy: recruiterId,
      note: note ? note.trim() : null,
    });

    // Phát event thông báo trạng thái
    await publishApplicationEvent('application.status_changed', {
      applicationId,
      status: normalizedStatus,
      changedBy: recruiterId,
      note,
    });

    return this._formatApplicationResponse(updated);
  }
}

export default new ApplicationService();
