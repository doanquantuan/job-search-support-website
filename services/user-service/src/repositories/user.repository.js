const prisma = require('../config/prisma');
const { User } = require('../domain/entities/User');

class UserRepository {
  _toEntity(rawUser) {
    if (!rawUser) return null;
    return new User(rawUser);
  }

  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return this._toEntity(rawUser);
  }

  async findOne({ id }) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return this._toEntity(rawUser);
  }

  async findWithRoles(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: true,
        recruiter: true,
        admin: true,
      },
    });
    return this._toEntity(rawUser);
  }

  async create(data) {
    const rawUser = await prisma.user.create({
      data,
    });
    return this._toEntity(rawUser);
  }

  async update(id, data) {
    const rawUser = await prisma.user.update({
      where: { id },
      data,
    });
    return this._toEntity(rawUser);
  }

  async delete(id) {
    const rawUser = await prisma.user.delete({
      where: { id },
    });
    return this._toEntity(rawUser);
  }

  // Helper find methods for roles
  // async findJobSeekerByUserId(userId) {
  //   const rawJobSeeker = await prisma.jobSeeker.findUnique({
  //     where: { userId },
  //     include: {
  //       user: true,
  //       profile: {
  //         include: {
  //           educations: { orderBy: { startDate: 'desc' } },
  //           experiences: { orderBy: { startDate: 'desc' } },
  //           projects: { orderBy: { startDate: 'desc' } },
  //           awards: { orderBy: { awardDate: 'desc' } },
  //           certificates: { orderBy: { issueDate: 'desc' } },
  //           careerPreferences: true,
  //           skills: { include: { skill: true } },
  //         },
  //       },
  //     },
  //   });
  //   return this._toEntity(rawJobSeeker);
  // }

  // async findProfileByUserId(userId) {
  //   const rawProfile = await prisma.profile.findUnique({
  //     where: { userId },
  //     include: {
  //       educations: { orderBy: { startDate: 'desc' } },
  //       experiences: { orderBy: { startDate: 'desc' } },
  //       projects: { orderBy: { startDate: 'desc' } },
  //       awards: { orderBy: { awardDate: 'desc' } },
  //       certificates: { orderBy: { issueDate: 'desc' } },
  //       careerPreferences: true,
  //       skills: { include: { skill: true } },
  //     },
  //   });
  // }

  // async findRecruiterByUserId(userId) {
  //   return prisma.recruiter.findUnique({
  //     where: { userId },
  //     include: {
  //       user: true,
  //     },
  //   });
  // }

  // async findAdminByUserId(userId) {
  //   return prisma.admin.findUnique({
  //     where: { userId },
  //     include: {
  //       user: true,
  //     },
  //   });
  // }
}

module.exports = new UserRepository();
