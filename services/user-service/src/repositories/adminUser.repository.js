import prisma from '../config/prisma.js';

class AdminUserRepository {
  /**
   * Lấy danh sách users kèm pagination, tìm kiếm và lọc
   */
  async findAllUsers({ page = 1, limit = 10, search = '', role, status }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          role: true,
          status: true,
          isVerified: true,
          blockReason: true,
          blockedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Lấy chi tiết user kèm thông tin tương ứng theo Role
   */
  async findUserDetailById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: {
          include: {
            profile: {
              include: {
                educations: true,
                experiences: true,
                projects: true,
                certificates: true,
                awards: true,
                careerPreference: true,
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
        },
        recruiter: true,
        admin: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái người dùng (Khóa / Mở khóa)
   */
  async updateUserStatus(id, { status, blockReason, blockedAt }) {
    return prisma.user.update({
      where: { id },
      data: {
        status,
        blockReason: blockReason || null,
        blockedAt: blockedAt || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        blockReason: true,
        blockedAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Cập nhật xác minh người dùng chung
   */
  async updateUserVerification(id, isVerified) {
    return prisma.user.update({
      where: { id },
      data: { isVerified },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái xác minh doanh nghiệp của Recruiter
   */
  async updateRecruiterVerification(userId, isVerified) {
    return prisma.recruiter.update({
      where: { userId },
      data: { isVerified },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }
}

export default new AdminUserRepository();
