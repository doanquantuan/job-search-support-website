const prisma = require('../config/prisma');

class AdminUserRepository {
  /**
   * Lấy danh sách người dùng phân trang, tìm kiếm và lọc đa điều kiện
   */
  async findAllUsers({
    page = 1,
    limit = 10,
    search = '',
    role,
    status,
    isVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * take;

    const where = {};

    // 1. Tìm kiếm theo từ khóa (fullName, email, phone)
    if (search && search.trim()) {
      const keyword = search.trim();
      where.OR = [
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 2. Lọc theo vai trò (Role)
    if (role && ['JOB_SEEKER', 'RECRUITER', 'ADMIN'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    // 3. Lọc theo trạng thái tài khoản (Status)
    if (status && ['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // 4. Lọc theo trạng thái xác minh tài khoản (isVerified)
    if (typeof isVerified === 'boolean') {
      where.isVerified = isVerified;
    } else if (isVerified === 'true' || isVerified === 'false') {
      where.isVerified = isVerified === 'true';
    }

    // Thực thi đếm tổng số bản ghi và lấy danh sách song song (Parallel execution)
    const [totalItems, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          phone: true,
          role: true,
          status: true,
          blockReason: true,
          blockedAt: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          recruiter: {
            select: {
              position: true,
              isVerified: true,
              companyId: true,
            },
          },
          jobSeeker: {
            select: {
              jobSeekingStatus: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / take) || 1;

    return {
      data: users,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        limit: take,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    };
  }

  /**
   * Xem chi tiết người dùng kèm toàn bộ hồ sơ (JobSeeker Profile hoặc Recruiter Company)
   */
  async findUserDetailById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: {
          include: {
            profile: {
              include: {
                educations: { orderBy: { startDate: 'desc' } },
                experiences: { orderBy: { startDate: 'desc' } },
                projects: { orderBy: { startDate: 'desc' } },
                awards: { orderBy: { awardDate: 'desc' } },
                certificates: { orderBy: { issueDate: 'desc' } },
                careerPreferences: true,
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
   * Khóa hoặc mở khóa tài khoản kèm lý do
   */
  async updateUserStatus(id, { status, blockReason = null, blockedAt = null }) {
    return prisma.user.update({
      where: { id },
      data: {
        status,
        blockReason,
        blockedAt,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        blockReason: true,
        blockedAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái xác minh tài khoản cá nhân
   */
  async updateUserVerification(id, isVerified) {
    return prisma.user.update({
      where: { id },
      data: { isVerified },
      select: {
        id: true,
        email: true,
        fullName: true,
        isVerified: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái xác minh doanh nghiệp của Nhà tuyển dụng
   */
  async updateRecruiterVerification(userId, isVerified) {
    return prisma.recruiter.update({
      where: { userId },
      data: { isVerified },
    });
  }
}

module.exports = new AdminUserRepository();

