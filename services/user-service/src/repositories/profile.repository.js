import prisma from '../config/prisma.js';


class ProfileRepository {

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

    return {
        ...user,
        ...jobSeeker?.profile,
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
      dateOfBirth,
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
}

export default new ProfileRepository();
