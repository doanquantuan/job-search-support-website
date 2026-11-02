import jobViewHistoryRepository from '../repositories/jobViewHistory.repository.js';
import jobPostRepository from '../repositories/jobPost.repository.js';
import { NotFoundError } from '#shares/utils/errors.util.js';

class JobViewHistoryService {
  async recordView(userId, jobId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Tin tuyển dụng không tồn tại');
    }

    return await jobViewHistoryRepository.upsert(userId, jobId);
  }

  async getViewHistory(userId, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const { total, items } = await jobViewHistoryRepository.findByUserId(userId, {
      skip,
      take,
      orderBy: { viewedAt: 'desc' },
    });

    return {
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      data: items,
    };
  }

  async getViewCountByJob(jobId) {
    const count = await jobViewHistoryRepository.countViewsByJobId(jobId);
    return { jobId, viewsCount: count };
  }

  async removeViewHistory(userId, jobId) {
    try {
      return await jobViewHistoryRepository.delete(userId, jobId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Không tìm thấy lịch sử xem tin này');
      }
      throw error;
    }
  }

  async clearViewHistory(userId) {
    return await jobViewHistoryRepository.clearByUserId(userId);
  }
}

export default new JobViewHistoryService();
