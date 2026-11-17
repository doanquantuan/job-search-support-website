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

  async findRecruiterByUserId(userId) {
    let recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            status: true,
            isVerified: true,
          },
        },
      },
    });

    if (!recruiter) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user && user.role === 'RECRUITER') {
        recruiter = await prisma.recruiter.create({
          data: {
            userId,
            isVerified: false,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                role: true,
                status: true,
                isVerified: true,
              },
            },
          },
        });
      }
    }

    if (!recruiter) return null;

    return {
      userId: recruiter.userId,
      position: recruiter.position,
      isVerified: recruiter.isVerified,
      companyId: recruiter.companyId,
      fullName: recruiter.user?.fullName,
      email: recruiter.user?.email,
      avatar: recruiter.user?.avatar,
      createdAt: recruiter.createdAt,
      updatedAt: recruiter.updatedAt,
      user: recruiter.user,
    };
  }

  async findAdminByUserId(userId) {
    let admin = await prisma.admin.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            status: true,
            isVerified: true,
          },
        },
      },
    });

    if (!admin) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user && user.role === 'ADMIN') {
        admin = await prisma.admin.create({
          data: { userId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                role: true,
                status: true,
                isVerified: true,
              },
            },
          },
        });
      }
    }

    if (!admin) return null;

    return {
      userId: admin.userId,
      fullName: admin.user?.fullName,
      email: admin.user?.email,
      avatar: admin.user?.avatar,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      user: admin.user,
    };
  }

  async findJobSeekerByUserId(userId) {
    let seeker = await prisma.jobSeeker.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true,
            status: true,
            isVerified: true,
          },
        },
        profile: true,
      },
    });

    if (!seeker) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user && user.role === 'JOB_SEEKER') {
        seeker = await prisma.jobSeeker.create({
          data: {
            userId,
            jobSeekingStatus: 'LOOKING',
            profile: {
              create: {
                contactEmail: user.email,
              },
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatar: true,
                role: true,
                status: true,
                isVerified: true,
              },
            },
            profile: true,
          },
        });
      }
    }

    if (!seeker) return null;

    return {
      userId: seeker.userId,
      jobSeekingStatus: seeker.jobSeekingStatus,
      fullName: seeker.user?.fullName,
      email: seeker.user?.email,
      avatar: seeker.user?.avatar,
      profile: seeker.profile,
      createdAt: seeker.createdAt,
      updatedAt: seeker.updatedAt,
      user: seeker.user,
    };
  }

  async findProfileByUserId(userId) {
    return await prisma.profile.findUnique({
      where: { userId },
    });
  }

}

export default new UserRepository();
