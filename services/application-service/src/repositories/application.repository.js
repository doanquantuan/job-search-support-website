const prisma = require('../config/prisma');

class ApplicationRepository {
  /**
   * Tạo đơn ứng tuyển mới và lưu lại lịch sử trạng thái ban đầu trong 1 Transaction
   */
  async createApplication({ jobSeekerId, jobId, cvId, coverLetter }) {
    return prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          jobSeekerId,
          jobId,
          cvId: cvId || null,
          coverLetter: coverLetter || null,
          applicationStatus: 'APPLIED',
        },
        include: {
          jobPost: true,
          cv: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.applicationId,
          applicationStatus: 'APPLIED',
          changedBy: jobSeekerId,
          note: 'Ứng viên nộp hồ sơ ứng tuyển',
        },
      });

      return application;
    });
  }

  /**
   * Tìm đơn ứng tuyển theo ID
   */
  async findApplicationById(applicationId) {
    return prisma.application.findUnique({
      where: { applicationId },
      include: {
        jobSeeker: {
          include: {
            user: true,
          },
        },
        jobPost: true,
        cv: true,
        statusHistories: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });
  }

  /**
   * Kiểm tra xem ứng viên đã nộp đơn vào Job này chưa
   */
  async findApplicationBySeekerAndJob(jobSeekerId, jobId) {
    return prisma.application.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId,
          jobId,
        },
      },
    });
  }

  /**
   * Lấy danh sách đơn ứng tuyển của ứng viên (có phân trang & lọc trạng thái)
   */
  async findApplicationsByJobSeeker(jobSeekerId, { page = 1, limit = 10, status } = {}) {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * take;

    const where = { jobSeekerId };
    if (status) {
      where.applicationStatus = status;
    }

    const [totalItems, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { appliedAt: 'desc' },
        include: {
          jobPost: true,
          cv: true,
          statusHistories: {
            orderBy: { changedAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / take) || 1;

    return {
      data: applications,
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
   * Lấy danh sách đơn ứng tuyển của một tin tuyển dụng (Dành cho nhà tuyển dụng)
   */
  async findApplicationsByJobId(jobId, { page = 1, limit = 10, status } = {}) {
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * take;

    const where = { jobId };
    if (status) {
      where.applicationStatus = status;
    }

    const [totalItems, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take,
        orderBy: { appliedAt: 'desc' },
        include: {
          jobSeeker: {
            include: {
              user: true,
            },
          },
          cv: true,
          statusHistories: {
            orderBy: { changedAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / take) || 1;

    return {
      data: applications,
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
   * Cập nhật trạng thái đơn ứng tuyển và thêm lịch sử trạng thái
   */
  async updateApplicationStatus(applicationId, { status, changedBy, note }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { applicationId },
        data: {
          applicationStatus: status,
        },
        include: {
          jobPost: true,
          jobSeeker: {
            include: {
              user: true,
            },
          },
          cv: true,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          applicationStatus: status,
          changedBy: changedBy || null,
          note: note || null,
        },
      });

      return updated;
    });
  }

  /**
   * Rút đơn ứng tuyển (Chuyển trạng thái sang WITHDRAWN)
   */
  async withdrawApplication(applicationId, jobSeekerId, note = 'Ứng viên chủ động rút đơn') {
    return this.updateApplicationStatus(applicationId, {
      status: 'WITHDRAWN',
      changedBy: jobSeekerId,
      note,
    });
  }
}

module.exports = new ApplicationRepository();

