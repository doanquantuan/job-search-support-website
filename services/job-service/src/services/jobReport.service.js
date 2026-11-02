import jobReportRepository from '../repositories/jobReport.repository.js';
import jobPostRepository from '../repositories/jobPost.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '#shared/utils/errors.util.js';

const DAILY_REPORT_LIMIT = 5;

class JobReportService {
  async createReport(userId, data) {
    const { jobId, reason, description } = data;

    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Tin tuyển dụng không tồn tại');
    }

    // 1. Không cho phép tự báo cáo tin của chính mình
    if (job.userId === userId) {
      throw new BadRequestError('Bạn không thể tự gửi báo cáo vi phạm cho tin tuyển dụng của chính mình');
    }

    // 2. Chống spam: Giới hạn số lượng report mỗi người dùng trong 24 giờ
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReportsCount = await jobReportRepository.countReportsByUserSince(userId, oneDayAgo);
    if (recentReportsCount >= DAILY_REPORT_LIMIT) {
      throw new BadRequestError(`Bạn đã vượt quá giới hạn gửi báo cáo (${DAILY_REPORT_LIMIT} báo cáo / 24 giờ). Vui lòng thử lại sau.`);
    }

    // 3. Kiểm tra xem người dùng đã từng gửi báo cáo cho tin này chưa
    const existing = await jobReportRepository.findByJobAndReporter(jobId, userId);
    if (existing) {
      throw new ConflictError('Bạn đã gửi báo cáo vi phạm cho tin tuyển dụng này rồi');
    }

    return await jobReportRepository.create({
      jobId,
      reportedBy: userId,
      reason,
      description,
    });
  }

  async getReports(queryParams = {}) {
    const { page = 1, limit = 10, status, reason, jobId } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (jobId) where.jobId = jobId;

    const { total, items } = await jobReportRepository.findMany({
      where,
      skip,
      take,
      orderBy: { reportedAt: 'desc' },
    });

    return {
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      data: items,
    };
  }

  async getMyReports(userId, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const { total, items } = await jobReportRepository.findMany({
      where: { reportedBy: userId },
      skip,
      take,
      orderBy: { reportedAt: 'desc' },
    });

    return {
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      data: items,
    };
  }

  async getReportById(reportId) {
    const report = await jobReportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Báo cáo vi phạm không tồn tại');
    }
    return report;
  }

  async updateReportStatus(reportId, adminId, { status, adminNote, closeJob = false }) {
    const report = await jobReportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Báo cáo vi phạm không tồn tại');
    }

    const updateData = {
      status,
      adminNote,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    };

    // Nếu duyệt vi phạm (RESOLVED) và cờ closeJob = true (hoặc mặc định khi RESOLVED vi phạm nghiêm trọng)
    const shouldCloseJob = Boolean(closeJob || status === 'RESOLVED');

    return await jobReportRepository.updateWithJobStatus(
      reportId,
      updateData,
      shouldCloseJob,
      report.jobId,
    );
  }

  async deleteReport(reportId) {
    const report = await jobReportRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Báo cáo vi phạm không tồn tại');
    }

    return await jobReportRepository.delete(reportId);
  }
}

export default new JobReportService();

