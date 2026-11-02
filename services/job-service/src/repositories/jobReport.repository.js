import prisma from '../config/prisma.js';

class JobReportRepository {
  async create(data) {
    return await prisma.jobReport.create({
      data,
      include: {
        jobPost: true,
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
