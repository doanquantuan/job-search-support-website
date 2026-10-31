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
    return await this.searchJobs(queryParams);
  }

  async searchJobs(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      keyword,
      province,
      salaryType,
      minSalary,
      maxSalary,
      experienceMin,
      experienceMax,
      jobLevel,
      educationLevel,
      workMode,
      employmentType,
      status = 'PUBLISHED',
      companyId,
      occupationId,
      specializationId,
      specializationIds,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * take;

    const where = {};

    // 1. Lọc theo trạng thái tin tuyển dụng (Mặc định: PUBLISHED khi tìm kiếm công khai)
    if (status) {
      where.status = status;
    }

    // 2. Lọc theo tỉnh thành / địa chỉ
    if (province) {
      where.province = { contains: province, mode: 'insensitive' };
    }

    // 3. Lọc theo công ty
    if (companyId) {
      where.companyId = companyId;
    }

    // 4. Lọc theo loại lương
    if (salaryType) {
      where.salaryType = salaryType;
    }

    // 5. Lọc theo mức lương số (salaryMin, salaryMax)
    if (minSalary !== undefined || maxSalary !== undefined) {
      const parsedMin = minSalary ? parseFloat(minSalary) : null;
      const parsedMax = maxSalary ? parseFloat(maxSalary) : null;

      const salaryConditions = [];
      if (parsedMin !== null) {
        salaryConditions.push({ salaryMax: { gte: parsedMin } });
      }
      if (parsedMax !== null) {
        salaryConditions.push({ salaryMin: { lte: parsedMax } });
      }

      if (salaryConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push(...salaryConditions);
      }
    }

    // 6. Lọc theo số năm kinh nghiệm
    if (experienceMin !== undefined || experienceMax !== undefined) {
      const expConditions = [];
      if (experienceMin !== undefined) {
        expConditions.push({ experienceMax: { gte: parseFloat(experienceMin) } });
      }
      if (experienceMax !== undefined) {
        expConditions.push({ experienceMin: { lte: parseFloat(experienceMax) } });
      }
      if (expConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push(...expConditions);
      }
    }

    // 7. Lọc theo Enum
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

    // 8. Lọc theo Ngành nghề (occupationId) & Chuyên ngành (specializationId)
    const specFilter = {};
    if (specializationId) {
      specFilter.specializationId = specializationId;
    } else if (specializationIds) {
      const idsArray = Array.isArray(specializationIds)
        ? specializationIds
        : specializationIds.split(',').map((id) => id.trim()).filter(Boolean);
      if (idsArray.length > 0) {
        specFilter.specializationId = { in: idsArray };
      }
    }

    if (occupationId) {
      specFilter.specialization = { occupationId };
    }

    if (Object.keys(specFilter).length > 0) {
      where.jobPostSpecializations = {
        some: specFilter,
      };
    }

    // 9. Lọc toàn văn theo Keyword (tiêu đề, mô tả, yêu cầu, quyền lợi)
    if (keyword && keyword.trim()) {
      const trimmedKeyword = keyword.trim();
      const keywordConditions = [
        { title: { contains: trimmedKeyword, mode: 'insensitive' } },
        { description: { contains: trimmedKeyword, mode: 'insensitive' } },
        { requirements: { contains: trimmedKeyword, mode: 'insensitive' } },
        { benefits: { contains: trimmedKeyword, mode: 'insensitive' } },
      ];

      where.AND = where.AND || [];
      where.AND.push({ OR: keywordConditions });
    }

    // 10. Sắp xếp kết quả (createdAt, publishedAt, salaryMax, deadline)
    const allowedSortFields = ['createdAt', 'publishedAt', 'salaryMax', 'deadline'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

    const orderBy = { [validSortBy]: validSortOrder };

    const { total, jobs } = await jobPostRepository.findMany({
      where,
      skip,
      take,
      orderBy,
    });

    return {
      jobs,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
      filters: {
        keyword: keyword || null,
        province: province || null,
        occupationId: occupationId || null,
        specializationId: specializationId || null,
        salaryType: salaryType || null,
        jobLevel: jobLevel || null,
        workMode: workMode || null,
        employmentType: employmentType || null,
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
