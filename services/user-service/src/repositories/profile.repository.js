const prisma = require('../config/prisma');
const Profile = require('../domain/entities/Profile');

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

class ProfileRepository {
    _toEntity(rawProfile) {
    if (!rawProfile) return null;
    return new Profile(rawProfile);
  }
  async findByUserId(userId) {
    return prisma.profile.findUnique({
      where: { userId }
    });
  }

  async getInfo({ userId }) {
    const rawUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
        jobSeeker: {
            include: {
            profile: true,
            },
        },
        },
    });

    if (!rawUser) {
        return null;
    }

    const { jobSeeker, ...user } = rawUser;
    const { profile, ...jobSeekerData } = jobSeeker ?? {};

    return {
        ...user,
        ...profile,
    };
  }

async updateInfo({ userId, data }) {
  const {
    fullName,
    avatar,
    contactEmail,
    phone,
    dateOfBirth,
    gender,
    address,
    githubUrl,
  } = data;

  const dataUser = Object.fromEntries(
    Object.entries({ fullName, avatar })
      .filter(([, value]) => value !== undefined)
  );

  const dataProfile = Object.fromEntries(
    Object.entries({
      contactEmail,
      phone,
      dateOfBirth:
        dateOfBirth === undefined
        ? undefined
        : dateOfBirth === null
          ? null
          : new Date(`${dateOfBirth}T00:00:00.000Z`),
      gender,
      address,
      githubUrl,
    }).filter(([, value]) => value !== undefined)
  );

  await prisma.$transaction(async (tx) => {
    if (Object.keys(dataUser).length > 0) {
      await tx.user.update({
        where: { id: userId },
        data: dataUser,
      });
    }

    if (Object.keys(dataProfile).length > 0) {
      await tx.profile.update({
        where: { userId },
        data: dataProfile,
      });
    }
  });

  return this.getInfo({ userId });
}

  async create(data) {
    return prisma.profile.create({
      data,
    });
  }

  async update(userId, data) {
    return prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async upsert(userId, createData, updateData) {
    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...createData },
      update: updateData,
    });
  }

  async delete(userId) {
    return prisma.profile.delete({
      where: { userId },
    });
  }

  // --- Educations ---
  async addEducation(userId, data) {
    return prisma.education.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateEducation(educationId, data) {
    return prisma.education.update({
      where: { educationId },
      data,
    });
  }

  async deleteEducation(educationId) {
    return prisma.education.delete({
      where: { educationId },
    });
  }

  // --- Experiences ---
  async addExperience(userId, data) {
    return prisma.experience.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateExperience(experienceId, data) {
    return prisma.experience.update({
      where: { experienceId },
      data,
    });
  }

  async deleteExperience(experienceId) {
    return prisma.experience.delete({
      where: { experienceId },
    });
  }

  // --- Projects ---
  async addProject(userId, data) {
    return prisma.project.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateProject(projectId, data) {
    return prisma.project.update({
      where: { projectId },
      data,
    });
  }

  async deleteProject(projectId) {
    return prisma.project.delete({
      where: { projectId },
    });
  }

  // --- Awards ---
  async addAward(userId, data) {
    return prisma.award.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateAward(awardId, data) {
    return prisma.award.update({
      where: { awardId },
      data,
    });
  }

  async deleteAward(awardId) {
    return prisma.award.delete({
      where: { awardId },
    });
  }

  // --- Certificates ---
  async addCertificate(userId, data) {
    return prisma.certificate.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateCertificate(certificateId, data) {
    return prisma.certificate.update({
      where: { certificateId },
      data,
    });
  }

  async deleteCertificate(certificateId) {
    return prisma.certificate.delete({
      where: { certificateId },
    });
  }

  // --- Career Preferences ---
  async upsertCareerPreference(userId, data) {
    return prisma.careerPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }

  // --- Skills ---
  async addSkill(userId, skillId) {
    return prisma.profileSkill.create({
      data: {
        userId,
        skillId,
      },
    });
  }

  async removeSkill(userId, skillId) {
    return prisma.profileSkill.delete({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });
  }

  async setSkills(userId, skillIds = []) {
    return prisma.$transaction(async (tx) => {
      await tx.profileSkill.deleteMany({
        where: { userId },
      });

      if (skillIds.length > 0) {
        await tx.profileSkill.createMany({
          data: skillIds.map((skillId) => ({
            userId,
            skillId,
          })),
        });
      }

      return tx.profileSkill.findMany({
        where: { userId },
        include: { skill: true },
      });
    });
  }
}

module.exports = new ProfileRepository();
