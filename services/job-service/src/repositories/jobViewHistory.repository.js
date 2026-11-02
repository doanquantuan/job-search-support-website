import prisma from '../config/prisma.js';

const MAX_HISTORY_PER_USER = 100;

class JobViewHistoryRepository {
  async upsert(userId, jobId) {
    const record = await prisma.jobViewHistory.upsert({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        userId,
        jobId,
        viewedAt: new Date(),
      },
      include: {
        jobPost: {
          select: {
            jobId: true,
            title: true,
            companyId: true,
            province: true,
            salaryType: true,
            salaryMin: true,
            salaryMax: true,
            jobLevel: true,
            workMode: true,
            employmentType: true,
            status: true,
            deadline: true,
            publishedAt: true,
          },
        },
      },
    });

    // Tự động dọn dẹp các bản ghi cũ nếu vượt quá giới hạn MAX_HISTORY_PER_USER
    this.trimOldHistory(userId).catch((err) => {
      console.error('[JobViewHistoryRepository] Lỗi dọn dẹp lịch sử xem tin cũ:', err.message);
    });

    return record;
  }

  async trimOldHistory(userId) {
    const count = await prisma.jobViewHistory.count({ where: { userId } });
    if (count > MAX_HISTORY_PER_USER) {
      const recordsToKeep = await prisma.jobViewHistory.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: MAX_HISTORY_PER_USER,
        select: { jobId: true },
      });

      const keepJobIds = recordsToKeep.map((r) => r.jobId);

      await prisma.jobViewHistory.deleteMany({
        where: {
          userId,
          jobId: { notIn: keepJobIds },
        },
      });
    }
  }

  async findByUserId(userId, { skip = 0, take = 10, orderBy = { viewedAt: 'desc' } } = {}) {
    const [total, items] = await Promise.all([
      prisma.jobViewHistory.count({
        where: { userId },
      }),
      prisma.jobViewHistory.findMany({
        where: { userId },
        skip,
        take,
        orderBy,
        include: {
          jobPost: {
            select: {
              jobId: true,
              title: true,
              companyId: true,
              province: true,
              salaryType: true,
              salaryMin: true,
              salaryMax: true,
              jobLevel: true,
              workMode: true,
              employmentType: true,
              status: true,
              deadline: true,
              publishedAt: true,
              createdAt: true,
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
      }),
    ]);

    return { total, items };
  }

  async countViewsByJobId(jobId) {
    return await prisma.jobViewHistory.count({
      where: { jobId },
    });
  }

  async delete(userId, jobId) {
    return await prisma.jobViewHistory.delete({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });
  }

  async clearByUserId(userId) {
    return await prisma.jobViewHistory.deleteMany({
      where: { userId },
    });
  }
}

export default new JobViewHistoryRepository();

