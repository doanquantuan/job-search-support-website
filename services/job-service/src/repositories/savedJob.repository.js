import prisma from '../config/prisma.js';

class SavedJobRepository {
  async create(userId, jobId) {
    return await prisma.savedJob.create({
      data: {
        userId,
        jobId,
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
    });
  }

  async findByUserAndJob(userId, jobId) {
    return await prisma.savedJob.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });
  }

  async delete(userId, jobId) {
    return await prisma.savedJob.delete({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
    });
  }

  async findByUserId(userId, { skip = 0, take = 10, orderBy = { savedAt: 'desc' } } = {}) {
    const [total, items] = await Promise.all([
      prisma.savedJob.count({
        where: { userId },
      }),
      prisma.savedJob.findMany({
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

  async findSavedJobIdsByUser(userId, jobIds = []) {
    if (!jobIds.length) return [];
    const saved = await prisma.savedJob.findMany({
      where: {
        userId,
        jobId: { in: jobIds },
      },
      select: {
        jobId: true,
      },
    });
    return saved.map((s) => s.jobId);
  }

  async countByJobId(jobId) {
    return await prisma.savedJob.count({
      where: { jobId },
    });
  }
}

export default new SavedJobRepository();

