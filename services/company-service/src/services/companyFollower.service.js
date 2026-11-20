import companyFollowerRepository from '../repositories/companyFollower.repository.js';
import companyRepository from '../repositories/company.repository.js';
import { NotFoundError, BadRequestError } from '#shared/utils/errors.util.js';

class CompanyFollowerService {
  async followCompany(userId, companyId) {
    if (!companyId) {
      throw new BadRequestError('Mã công ty không hợp lệ');
    }
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Công ty không tồn tại');
    }

    const record = await companyFollowerRepository.follow(companyId, userId);
    return {
      success: true,
      isFollowing: true,
      companyId,
      followedAt: record.followedAt,
    };
  }

  async unfollowCompany(userId, companyId) {
    if (!companyId) {
      throw new BadRequestError('Mã công ty không hợp lệ');
    }
    await companyFollowerRepository.unfollow(companyId, userId);
    return {
      success: true,
      isFollowing: false,
      companyId,
    };
  }

  async getFollowStatus(userId, companyId) {
    if (!userId || !companyId) {
      return { isFollowing: false };
    }
    const isFollowing = await companyFollowerRepository.isFollowing(companyId, userId);
    return { isFollowing };
  }

  async getFollowingCompanies(userId, queryParams = {}) {
    const { items, total, page, limit, totalPages } =
      await companyFollowerRepository.findFollowedCompaniesByUserId(userId, queryParams);

    // Lấy số lượng việc làm đang mở của các công ty từ job-service
    const companyIds = items.map((i) => i.companyId).filter(Boolean);
    let countsMap = {};
    if (companyIds.length > 0) {
      try {
        const cIds = companyIds.join(',');
        const countsRes = await fetch(`http://localhost:5003/api/v1/jobs/internal/company-counts?companyIds=${cIds}`);
        if (countsRes.ok) {
          const countsJson = await countsRes.json();
          countsMap = countsJson.data || {};
        }
      } catch (_err) {
        // Bỏ qua lỗi kết nối nội bộ
      }
    }

    const formatted = items.map((item) => {
      const c = item.company || {};
      return {
        id: item.companyId,
        companyId: item.companyId,
        followedAt: item.followedAt,
        name: c.companyName,
        companyName: c.companyName,
        logo: c.logo || null,
        industry: c.industry || '',
        companySize: c.companySize || '',
        size: c.companySize || '',
        province: c.province || '',
        location: c.province || '',
        address: c.address || '',
        website: c.website || null,
        description: c.description || null,
        verificationStatus: c.verificationStatus || 'PENDING',
        activeJobsCount: countsMap[item.companyId] || 0,
      };
    });

    return {
      companies: formatted,
      items: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getFollowerUserIds(companyId) {
    return await companyFollowerRepository.findFollowerUserIds(companyId);
  }
}

export default new CompanyFollowerService();
