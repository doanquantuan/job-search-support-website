import prisma from '../config/prisma.js';

class CompanyFollowerRepository {
  async follow(companyId, userId) {
    return prisma.companyFollower.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
      update: {},
      create: {
        companyId,
        userId,
      },
    });
  }

  async unfollow(companyId, userId) {
    return prisma.companyFollower.deleteMany({
      where: {
        companyId,
        userId,
      },
    });
  }

  async isFollowing(companyId, userId) {
    if (!companyId || !userId) return false;
    const record = await prisma.companyFollower.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });
    return !!record;
  }

  async findFollowedCompaniesByUserId(userId, { page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [followers, total] = await Promise.all([
      prisma.companyFollower.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { followedAt: 'desc' },
        include: {
          company: true,
        },
      }),
      prisma.companyFollower.count({ where: { userId } }),
    ]);

    return {
      items: followers,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async findFollowerUserIds(companyId) {
    if (!companyId) return [];
    const records = await prisma.companyFollower.findMany({
      where: { companyId },
      select: { userId: true },
    });
    return records.map((r) => r.userId);
  }
}

export default new CompanyFollowerRepository();
