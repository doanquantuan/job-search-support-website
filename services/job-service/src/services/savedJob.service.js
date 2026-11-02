import savedJobRepository from '../repositories/savedJob.repository.js';
import jobPostRepository from '../repositories/jobPost.repository.js';
import { NotFoundError, ConflictError, BadRequestError } from '#shared/utils/errors.util.js';

class SavedJobService {
  async saveJob(userId, jobId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Tin tuyển dụng không tồn tại');
    }

    // Chỉ cho phép lưu tin đang ở trạng thái PUBLISHED và chưa hết hạn
    if (job.status !== 'PUBLISHED') {
      throw new BadRequestError('Không thể lưu tin tuyển dụng chưa công khai hoặc đã đóng');
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new BadRequestError('Tin tuyển dụng này đã hết hạn nộp hồ sơ');
    }

    const existing = await savedJobRepository.findByUserAndJob(userId, jobId);
    if (existing) {
      throw new ConflictError('Bạn đã lưu tin tuyển dụng này trước đó');
    }

    return await savedJobRepository.create(userId, jobId);
  }

  async unsaveJob(userId, jobId) {
    const existing = await savedJobRepository.findByUserAndJob(userId, jobId);
    if (!existing) {
      throw new NotFoundError('Tin tuyển dụng chưa được lưu');
    }

    return await savedJobRepository.delete(userId, jobId);
  }

  async getSavedJobs(userId, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const { total, items } = await savedJobRepository.findByUserId(userId, {
      skip,
      take,
      orderBy: { savedAt: 'desc' },
    });

    const enrichedItems = items.map((item) => {
      const isExpired = item.jobPost?.deadline ? new Date(item.jobPost.deadline) < new Date() : false;
      const isAvailable = item.jobPost?.status === 'PUBLISHED' && !isExpired;
      return {
        ...item,
        isExpired,
        isAvailable,
      };
    });

    return {
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      data: enrichedItems,
    };
  }

  async checkIsJobSaved(userId, jobId) {
    const existing = await savedJobRepository.findByUserAndJob(userId, jobId);
    return { isSaved: !!existing };
  }

  async checkBatchSaved(userId, jobIds = []) {
    const savedIds = await savedJobRepository.findSavedJobIdsByUser(userId, jobIds);
    const savedMap = {};
    jobIds.forEach((id) => {
      savedMap[id] = savedIds.includes(id);
    });
    return savedMap;
  }

  async getSavedCountByJob(jobId) {
    const count = await savedJobRepository.countByJobId(jobId);
    return { jobId, savedCount: count };
  }
}

export default new SavedJobService();

