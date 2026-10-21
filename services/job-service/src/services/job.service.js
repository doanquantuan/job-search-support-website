import jobPostRepository from '../repositories/jobPost.repository.js';
import { NotFoundError, ForbiddenError } from '#shares/utils/errors.util.js';

class JobPostService {
  async createJobPost(userId, data) {
    const { specializationIds = [], ...jobFields } = data;

    const jobData = {
      ...jobFields,
      userId,
    };

    if (jobData.deadline) {
      jobData.deadline = new Date(jobData.deadline);
    }

    return await jobPostRepository.create(jobData, specializationIds);
  }

  async getJobPosts(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      keyword,
      province,
      salaryType,
      jobLevel,
      educationLevel,
      workMode,
      employmentType,
      status = 'PUBLISHED',
      companyId,
      specializationId,
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (province) {
      where.province = { contains: province, mode: 'insensitive' };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (salaryType) {
      where.salaryType = salaryType;
    }

    if (jobLevel) {
      where.jobLevel = jobLevel;
    }

    if (educationLevel) {
      where.educationLevel = educationLevel;
    }

    if (workMode) {
      where.workMode = workMode;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (specializationId) {
      where.jobPostSpecializations = {
        some: {
          specializationId,
        },
      };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { requirements: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const { total, jobs } = await jobPostRepository.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return {
      jobs,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getJobPostById(jobId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }
    return job;
  }

  async updateJobPost(jobId, userId, updateData) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa tin tuyển dụng này');
    }

    const { specializationIds, ...jobFields } = updateData;

    delete jobFields.jobId;
    delete jobFields.userId;
    delete jobFields.companyId;

    if (jobFields.deadline) {
      jobFields.deadline = new Date(jobFields.deadline);
    }

    return await jobPostRepository.update(jobId, jobFields, specializationIds);
  }

  async deleteJobPost(jobId, userId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xóa tin tuyển dụng này');
    }

    return await jobPostRepository.delete(jobId);
  }

  async updateJobPostStatus(jobId, userId, status) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền thay đổi trạng thái tin tuyển dụng này');
    }

    return await jobPostRepository.updateStatus(jobId, status);
  }
}

export default new JobPostService();
