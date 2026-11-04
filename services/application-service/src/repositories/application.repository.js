import prisma from '../config/prisma.js';
import { parsePagination, formatPaginationResponse } from '#shared/utils/pagination.util.js';

class ApplicationRepository {
  /**
   * Tạo đơn ứng tuyển mới và lưu lại lịch sử trạng thái ban đầu trong 1 Transaction
   */
  async createApplication({ jobSeekerId, jobId, cvId, cvUrl, cvTitle, coverLetter, jobTitle, recruiterId }) {
    return prisma.$transaction(async (tx) => {
      // CQRS replication stub để tránh Foreign Key Constraint error (P2003) khi microservice chạy độc lập
      await tx.user.upsert({
        where: { id: jobSeekerId },
        update: {},
        create: { id: jobSeekerId, email: `seeker_${jobSeekerId.slice(0, 8)}@placeholder.local` },
      });
      await tx.jobSeeker.upsert({
        where: { userId: jobSeekerId },
        update: {},
        create: { userId: jobSeekerId },
      });
      await tx.jobPost.upsert({
        where: { jobId },
        update: {
          ...(recruiterId ? { recruiterId } : {}),
          ...(jobTitle ? { title: jobTitle } : {}),
        },
        create: {
          jobId,
          title: jobTitle || 'Tin tuyển dụng',
          recruiterId: recruiterId || null,
        },
      });

      const application = await tx.application.create({
        data: {
          jobSeekerId,
          jobId,
          cvId: cvId || null,
          cvUrl: cvUrl || null,
          cvTitle: cvTitle || null,
          coverLetter: coverLetter || null,
          applicationStatus: 'APPLIED',
        },
        include: {
          jobPost: true,
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
   * Đảm bảo JobSeeker tồn tại trước khi tạo CV hoặc thực hiện thao tác phụ thuộc
   */
  async ensureJobSeekerExists(jobSeekerId) {
    return prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: jobSeekerId },
        update: {},
        create: { id: jobSeekerId, email: `seeker_${jobSeekerId.slice(0, 8)}@placeholder.local` },
      });
      return tx.jobSeeker.upsert({
        where: { userId: jobSeekerId },
        update: {},
        create: { userId: jobSeekerId },
      });
    });
  }

  /**
   * Tìm đơn ứng tuyển theo applicationId kèm chi tiết Job và lịch sử trạng thái
   */
  async findApplicationById(applicationId) {
    return prisma.application.findUnique({
      where: { applicationId },
      include: {
        jobPost: true,
        jobSeeker: {
          include: {
            user: true,
          },
        },
        statusHistories: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Tìm đơn ứng tuyển của 1 ứng viên đối với 1 công việc cụ thể
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
  async findApplicationsByJobSeeker(jobSeekerId, query = {}) {
    const { page, limit, skip, take } = parsePagination(query);

    const where = { jobSeekerId };
    if (query.status) {
      where.applicationStatus = query.status;
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
          statusHistories: {
            orderBy: { changedAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return formatPaginationResponse({
      data: applications,
      total: totalItems,
      page,
      limit,
    });
  }

  /**
   * Lấy danh sách đơn ứng tuyển của một tin tuyển dụng (Dành cho nhà tuyển dụng)
   */
  async findApplicationsByJobId(jobId, query = {}) {
    const { page, limit, skip, take } = parsePagination(query);

    const where = { jobId };
    if (query.status) {
      where.applicationStatus = query.status;
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
          statusHistories: {
            orderBy: { changedAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    return formatPaginationResponse({
      data: applications,
      total: totalItems,
      page,
      limit,
    });
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

export default new ApplicationRepository();
