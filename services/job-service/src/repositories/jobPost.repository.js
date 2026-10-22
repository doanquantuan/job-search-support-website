import prisma from '../config/prisma.js';

class JobPostRepository {
  async create(jobPostData, specializationIds = []) {
    return await prisma.jobPost.create({
      data: {
        ...jobPostData,
        jobPostSpecializations: specializationIds.length > 0
          ? {
              create: specializationIds.map((specializationId) => ({
                specializationId,
              })),
            }
          : undefined,
      },
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
    });
  }

  async findById(jobId) {
    return await prisma.jobPost.findUnique({
      where: { jobId },
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
    });
  }

  async findMany({ where = {}, skip = 0, take = 10, orderBy = { createdAt: 'desc' } }) {
    const [total, jobs] = await Promise.all([
      prisma.jobPost.count({ where }),
      prisma.jobPost.findMany({
        where,
        skip,
        take,
        orderBy,
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
      }),
    ]);

    return { total, jobs };
  }

  async update(jobId, jobPostData, specializationIds) {
    const data = { ...jobPostData };

    if (Array.isArray(specializationIds)) {
      data.jobPostSpecializations = {
        deleteMany: {},
        create: specializationIds.map((specializationId) => ({
          specializationId,
        })),
      };
    }

    return await prisma.jobPost.update({
      where: { jobId },
      data,
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
    });
  }

  async updateStatus(jobId, status) {
    const data = { status };
    if (status === 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    return await prisma.jobPost.update({
      where: { jobId },
      data,
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
    });
  }

  async delete(jobId) {
    return await prisma.jobPost.delete({
      where: { jobId },
    });
  }
}

export default new JobPostRepository();
