const prisma = require('../config/prisma');

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

class UserRepository {
  async findJobSeekerByUserId(userId) {
    return prisma.jobSeeker.findUnique({
      where: { userId },
      include: {
        profile: {
          include: profileIncludeOptions,
        },
      },
    });
  }

  async findProfileByUserId(userId) {
    return prisma.profile.findUnique({
      where: { userId },
      include: profileIncludeOptions,
    });
  }

  async findRecruiterByUserId(userId) {
    return prisma.recruiter.findUnique({
      where: { userId },
    });
  }

  async findAdminByUserId(userId) {
    return prisma.admin.findUnique({
      where: { userId },
    });
  }
}

module.exports = new UserRepository();

