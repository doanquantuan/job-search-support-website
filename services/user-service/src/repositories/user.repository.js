import prisma from '../config/prisma.js';

class UserRepository {
  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return rawUser;
  }

  async findOne({ id }) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return rawUser;
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
    return rawUser;
  }

  async create(data) {
    const rawUser = await prisma.user.create({
      data,
    });
    return rawUser;
  }

  async update(id, data) {
    const rawUser = await prisma.user.update({
      where: { id },
      data,
    });
    return rawUser;
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
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

export default new UserRepository();
