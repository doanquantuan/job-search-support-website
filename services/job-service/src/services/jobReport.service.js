import jobReportRepository from '../repositories/jobReport.repository.js';
import jobPostRepository from '../repositories/jobPost.repository.js';
import jobViewHistoryRepository from '../repositories/jobViewHistory.repository.js';
import rateLimiter from '../utils/rateLimiter.util.js';
import { calculateReportWeight } from '../utils/trustScore.util.js';
import { publishJobStatusChanged, publishJobReportAlert } from '../rabbitmq/jobPublisher.js';
import { deleteJobFromES } from '../search/jobIndex.js';
import config from '../config/env.config.js';
import { NotFoundError, ConflictError, BadRequestError } from '#shared/utils/errors.util.js';

const HOURLY_USER_REPORT_LIMIT = 5;

class JobReportService {
  async createReport(userId, data) {
    const { jobId, reason, description } = data;

    // 1. Giới hạn số lượt report theo user_id (tối đa 5 report/giờ)
    const userLimit = await rateLimiter.checkRateLimit('rate:report:user', userId, HOURLY_USER_REPORT_LIMIT, 3600);
    if (!userLimit.allowed) {
      throw new BadRequestError(`Bạn đã vượt quá giới hạn gửi báo cáo (${HOURLY_USER_REPORT_LIMIT} báo cáo/giờ). Vui lòng thử lại sau ${Math.ceil(userLimit.ttl / 60)} phút.`);
    }

    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Tin tuyển dụng không tồn tại');
    }

    // 2. Tin tuyển dụng phải ở trạng thái PUBLISHED
    if (job.status !== 'PUBLISHED') {
      throw new BadRequestError('Chỉ có thể gửi báo cáo vi phạm đối với tin tuyển dụng đang được công khai');
    }

    // 3. Không cho phép tự báo cáo tin của chính mình
    if (job.userId === userId) {
      throw new BadRequestError('Bạn không thể tự gửi báo cáo vi phạm cho tin tuyển dụng của chính mình');
    }

    // 4. 1 user chỉ được report 1 lần với 1 tin tuyển dụng
    const existing = await jobReportRepository.findByJobAndReporter(jobId, userId);
    if (existing) {
      throw new ConflictError('Bạn đã gửi báo cáo vi phạm cho tin tuyển dụng này rồi');
    }

    // 5. Hệ thống chấm điểm uy tín (Trust Score / Weighting)
    const [resolvedCount, rejectedCount, viewCount] = await Promise.all([
      jobReportRepository.countReportsByReporterAndStatus(userId, 'RESOLVED'),
      jobReportRepository.countReportsByReporterAndStatus(userId, 'REJECTED'),
      jobViewHistoryRepository.countByUserId ? jobViewHistoryRepository.countByUserId(userId) : 0,
    ]);

    const weight = calculateReportWeight({
      reason,
      description,
      resolvedReports: resolvedCount,
      rejectedReports: rejectedCount,
      totalViews: viewCount,
    });

    // 6. Lưu Snapshot nội dung tin tại thời điểm bị report (đối chiếu khi nhà tuyển dụng sửa/xóa)
    const snapshot = {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      salaryType: job.salaryType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobLevel: job.jobLevel,
      workMode: job.workMode,
      employmentType: job.employmentType,
      province: job.province,
      address: job.address,
      snapshotAt: new Date(),
    };

    const reportResult = await jobReportRepository.create({
      jobId,
      reportedBy: userId,
      reason,
      description,
      weight,
      snapshot,
    });

    // 7. Cơ chế Ngắt mạch tự động (Auto-Hide Threshold)
    if (reportResult.autoHiddenTriggered) {
      console.warn(`[Auto-Hide] Tin tuyển dụng ${jobId} đạt risk_score >= 10.0 (${reportResult.summary.riskScore}). Tự động chuyển AUTO_HIDDEN.`);

      // 7.1 Publish event job.status_changed sang AUTO_HIDDEN
      publishJobStatusChanged(jobId, 'AUTO_HIDDEN').catch(() => {});

      // 7.2 Xóa ngay document khỏi Elasticsearch để tin biến mất khỏi trang tìm kiếm lập tức
      deleteJobFromES(jobId).catch((esErr) => {
        console.warn(`[Auto-Hide] Không thể xóa document ES cho jobId ${jobId}:`, esErr.message);
      });

      // 7.3 Bắn cảnh báo khẩn (Job Report Alert) qua Notification Service cho Admin duy nhất
      publishJobReportAlert({
        eventId: `alert-autohide-${jobId}-${Date.now()}`,
        recipientId: config.ADMIN_USER_ID,
        jobId,
        jobTitle: job.title,
        companyId: job.companyId,
        riskScore: reportResult.summary.riskScore,
        totalReports: reportResult.summary.totalReports,
        reason: 'AUTO_HIDE_THRESHOLD_EXCEEDED',
        message: `CẢNH BÁO KHẨN: Tin tuyển dụng "${job.title}" (ID: ${jobId}) đã vượt ngưỡng rủi ro an toàn (Risk Score: ${reportResult.summary.riskScore}) và đã được hệ thống tự động ẩn (AUTO_HIDDEN). Vui lòng kiểm tra khẩn cấp!`,
      }).catch((mqErr) => {
        console.error(`[Auto-Hide] Lỗi gửi cảnh báo khẩn cho admin:`, mqErr.message);
      });
    }

    return reportResult;
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

