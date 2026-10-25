const applicationRepository = require('../repositories/application.repository');
const cvRepository = require('../repositories/cv.repository');
const { publishApplicationEvent } = require('../config/rabbitmq');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../utils/errors.util');

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
   * Ứng viên nộp hồ sơ ứng tuyển
   */
  async applyJob(jobSeekerId, { jobId, cvId, coverLetter }) {
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

    // 2. Nếu có cvId, kiểm tra tính hợp lệ và quyền sở hữu CV
    if (cvId) {
      const cv = await cvRepository.findCVById(cvId);
      if (!cv) {
        throw new NotFoundError('Không tìm thấy CV đã chọn');
      }
      if (cv.jobSeekerId !== jobSeekerId) {
        throw new ForbiddenError('Bạn không có quyền sử dụng CV của người khác');
      }
    }

    // 3. Tạo đơn ứng tuyển & lưu lịch sử ban đầu
    const application = await applicationRepository.createApplication({
      jobSeekerId,
      jobId,
      cvId,
      coverLetter: coverLetter ? coverLetter.trim() : null,
    });

    // 4. Phát sự kiện sang RabbitMQ (để notification-service gửi email thông báo)
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
   * Xem chi tiết 1 đơn ứng tuyển (kiểm tra quyền truy cập)
   */
  async getApplicationDetail(applicationId, currentUser) {
    if (!applicationId) {
      throw new BadRequestError('ID đơn ứng tuyển không hợp lệ');
    }

    const application = await applicationRepository.findApplicationById(applicationId);
    if (!application) {
      throw new NotFoundError('Không tìm thấy thông tin đơn ứng tuyển');
    }

    // Kiểm tra quyền: Chỉ chính ứng viên đó, hoặc nhà tuyển dụng sở hữu Job, hoặc Admin mới được xem
    const isJobSeekerOwner = currentUser.role === 'JOB_SEEKER' && application.jobSeekerId === currentUser.userId;
    const isRecruiterOwner = currentUser.role === 'RECRUITER' && (!application.jobPost?.recruiterId || application.jobPost.recruiterId === currentUser.userId);
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isJobSeekerOwner && !isRecruiterOwner && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền xem đơn ứng tuyển này');
    }

    // Nếu nhà tuyển dụng xem lần đầu khi trạng thái đang là APPLIED -> Tự động chuyển sang VIEWED
    if (currentUser.role === 'RECRUITER' && application.applicationStatus === 'APPLIED') {
      const updated = await applicationRepository.updateApplicationStatus(applicationId, {
        status: 'VIEWED',
        changedBy: currentUser.userId,
        note: 'Nhà tuyển dụng đã mở xem hồ sơ',
      });

      await publishApplicationEvent('application.status_changed', {
        applicationId,
        status: 'VIEWED',
        changedBy: currentUser.userId,
      });

      return updated;
    }

    return application;
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
   * Nhà tuyển dụng xem danh sách ứng viên theo tin tuyển dụng
   */
  async getJobApplications(recruiterId, jobId, query = {}) {
    if (!jobId) {
      throw new BadRequestError('ID tin tuyển dụng không được để trống');
    }

    if (query.status && !VALID_STATUSES.includes(query.status.toUpperCase())) {
      throw new BadRequestError(`Trạng thái lọc không hợp lệ: ${query.status}`);
    }

    return applicationRepository.findApplicationsByJobId(jobId, {
      ...query,
      status: query.status ? query.status.toUpperCase() : undefined,
    });
  }

  /**
   * Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển (phê duyệt, hẹn phỏng vấn, từ chối, v.v.)
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

    return updated;
  }
}

module.exports = new ApplicationService();

