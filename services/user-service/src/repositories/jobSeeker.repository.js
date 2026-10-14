const { raw } = require('body-parser');
const prisma = require('../config/prisma');
const { JobSeeker } = require('../domain/entities/JobSeeker');

const profileIncludeOptions = {
  educations: {
    orderBy: { startDate: 'desc' },
  },
  experiences: {
    orderBy: { startDate: 'desc' },
  },
  projects: {
    orderBy: { startDate: 'desc' },
  },
  awards: {
    orderBy: { awardDate: 'desc' },
  },
  certificates: {
    orderBy: { issueDate: 'desc' },
  },
  careerPreferences: true,
  skills: {
    include: {
      skill: true,
    },
  },
};

class JobSeekerRepository {
    _toEntity(rawJobSeeker) {
    if (!rawJobSeeker) return null;
    return new JobSeeker(rawJobSeeker);
  }

  async findAll() {
    const rawJobSeekers = await prisma.jobSeeker.findMany();
    return rawJobSeekers.map((rawJobSeeker) => this._toEntity(rawJobSeeker));
  }

  async findByUserId(userId) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return this._toEntity(rawJobSeeker);
  }
  async findById(userId) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return this._toEntity(rawJobSeeker);
  }

  async findOne({ userId }) {
    const rawJobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });
    return this._toEntity(rawJobSeeker);
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
    return this._toEntity(rawJobSeeker);
  }

  async create(data) {
    const rawJobSeeker = await prisma.jobSeeker.create({
      data,
    });
    return this._toEntity(rawJobSeeker);
  }

  async update(userId, data) {
    const rawJobSeeker = await prisma.jobSeeker.update({
      where: { userId },
      data,
    });
    return this._toEntity(rawJobSeeker);
  }

  async updateStatus(userId, jobSeekingStatus) {
    const rawJobSeeker = await prisma.jobSeeker.update({
      where: { userId },
      data: { jobSeekingStatus },
    });
    return this._toEntity(rawJobSeeker);
  }

  async delete(userId) {
    return prisma.jobSeeker.delete({
      where: { userId },
    });
  }
}

module.exports = new JobSeekerRepository();
