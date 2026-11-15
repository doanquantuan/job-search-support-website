import prisma from '../config/prisma.js';

class JobReportRepository {
  async create(data) {
    const { jobId, weight = 1.0, snapshot = null } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi JobReport kèm Snapshot nội dung tại thời điểm report
      const createdReport = await tx.jobReport.create({
        data: {
          ...data,
          snapshot: snapshot || undefined,
        },
        include: {
          jobPost: true,
        },
      });

      // 2. Atomic Upsert trên bảng JobReportSummary (chống Race Condition hoàn toàn)
      const summary = await tx.jobReportSummary.upsert({
        where: { jobId },
        create: {
          jobId,
          totalReports: 1,
          pendingReports: 1,
          riskScore: weight,
          moderationStatus: 'NORMAL',
        },
        update: {
          totalReports: { increment: 1 },
          pendingReports: { increment: 1 },
          riskScore: { increment: weight },
        },
      });

      let autoHiddenTriggered = false;

      // 3. Cơ chế Ngắt mạch tự động (Auto-Hide Threshold) với Atomic Condition Check
      // Chỉ 1 request đầu tiên thỏa mãn chuyển từ NORMAL/FLAGGED_UNDER_REVIEW -> AUTO_HIDDEN mới trigger alert
      if (summary.riskScore >= 10.0) {
        const updateResult = await tx.jobReportSummary.updateMany({
          where: {
            jobId,
            moderationStatus: { in: ['NORMAL', 'FLAGGED_UNDER_REVIEW'] },
          },
          data: {
            moderationStatus: 'AUTO_HIDDEN',
          },
        });

        if (updateResult.count > 0) {
          await tx.jobPost.update({
            where: { jobId },
            data: { status: 'AUTO_HIDDEN' },
          });

          summary.moderationStatus = 'AUTO_HIDDEN';
          autoHiddenTriggered = true;
        }
      } else if (summary.riskScore >= 4.0 && summary.moderationStatus === 'NORMAL') {
        await tx.jobReportSummary.updateMany({
          where: {
            jobId,
            moderationStatus: 'NORMAL',
          },
          data: {
            moderationStatus: 'FLAGGED_UNDER_REVIEW',
          },
        });
        summary.moderationStatus = 'FLAGGED_UNDER_REVIEW';
      }

      return {
        ...createdReport,
        summary,
        autoHiddenTriggered,
      };
    });
  }

  async countReportsByReporterAndStatus(reportedBy, status) {
    return await prisma.jobReport.count({
      where: {
        reportedBy,
        status,
      },
    });
  }

  async findByJobAndReporter(jobId, reportedBy) {
    return await prisma.jobReport.findUnique({
      where: {
        jobId_reportedBy: {
          jobId,
          reportedBy,
        },
      },
    });
  }

  async countReportsByUserSince(userId, sinceDate) {
    return await prisma.jobReport.count({
      where: {
        reportedBy: userId,
        reportedAt: {
          gte: sinceDate,
        },
      },
    });
  }

  async findById(reportId) {
    return await prisma.jobReport.findUnique({
      where: { reportId },
      include: {
        jobPost: {
          include: {
            jobPostSpecializations: {
              include: {
                specialization: {
                  include: {
                    occupation: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findMany({ where = {}, skip = 0, take = 10, orderBy = { reportedAt: 'desc' } } = {}) {
    const [total, items] = await Promise.all([
      prisma.jobReport.count({ where }),
      prisma.jobReport.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          jobPost: {
            select: {
              jobId: true,
              title: true,
              companyId: true,
              userId: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async updateWithJobStatus(reportId, reportData, shouldCloseJob = false, jobId = null) {
    return await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.jobReport.update({
        where: { reportId },
        data: reportData,
        include: {
          jobPost: true,
        },
      });

      if (shouldCloseJob && jobId) {
        await tx.jobPost.update({
          where: { jobId },
          data: { status: 'CLOSED' },
        });
      }

      return updatedReport;
    });
  }

  async delete(reportId) {
    return await prisma.jobReport.delete({
      where: { reportId },
    });
  }
}

export default new JobReportRepository();

