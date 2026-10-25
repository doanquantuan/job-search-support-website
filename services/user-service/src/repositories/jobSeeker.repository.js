const prisma = require('../config/prisma');


class JobSeekerRepository {

  async findAll() {
    const rawJobSeekers = await prisma.jobSeeker.findMany();
    return rawJobSeekers;
  }

  async findByUserId(userId) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return rawJobSeeker;
  }
  async findById(userId) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return rawJobSeeker;
  }

  async findOne({ userId }) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return rawJobSeeker;
  }

  async findWithProfile(userId) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
      include: {
        user: true,
        profile: {
          include: profileIncludeOptions,
        },
      },
    });
    return rawJobSeeker;
  }

  async create(data) {
    const rawJobSeeker = await prisma.jobSeeker.create({
      data,
    });
    return rawJobSeeker;
  }

  async update(userId, data) {
    const rawJobSeeker = await prisma.jobSeeker.update({
      where: { userId },
      data,
    });
    return rawJobSeeker;
  }

  async updateStatus(userId, jobSeekingStatus) {
    const rawJobSeeker = await prisma.jobSeeker.update({
      where: { userId },
      data: { jobSeekingStatus },
    });
    return rawJobSeeker;
  }

  async delete(userId) {
    return prisma.jobSeeker.delete({
      where: { userId },
    });
  }
}

module.exports = new JobSeekerRepository();
