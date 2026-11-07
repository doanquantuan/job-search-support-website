import jobPostRepository from '../repositories/jobPost.repository.js';
import companyMessageBroker from '../rabbitmq/companyConsumer.js';
import { publishJobCreated, publishJobUpdated, publishJobStatusChanged } from '../rabbitmq/jobPublisher.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '#shared/utils/errors.util.js';

class JobPostService {
  async createJobPost(userId, data) {
    const { specializationIds = [], ...jobFields } = data;

    let companyId = jobFields.companyId;

    // Gửi message qua message broker cho company-service kèm userId để lấy companyId
    if (!companyId) {
      try {
        companyId = await companyMessageBroker.getCompanyIdByUserId(userId);
      } catch (err) {
        console.error('[JobPostService] Lỗi giao tiếp Message Broker khi lấy companyId:', err.message);
        throw new BadRequestError('Không thể xác định công ty của nhà tuyển dụng từ company-service');
      }
    }

    if (!companyId) {
      throw new BadRequestError('Tài khoản nhà tuyển dụng chưa được liên kết với bất kỳ công ty nào');
    }

    const jobData = {
      ...jobFields,
      userId,
      companyId,
    };

    if (jobData.deadline) {
      jobData.deadline = new Date(jobData.deadline);
    }

    const newJob = await jobPostRepository.create(jobData, specializationIds);

    // Gửi sự kiện job.created qua Message Broker
    publishJobCreated(newJob).catch(() => {});

    return newJob;
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

    // 5. Lọc theo khoảng lương (RANGE)
    if (salaryType === 'RANGE') {
      const salaryConditions = [];
      if (minSalary !== undefined && minSalary !== null && minSalary !== '') {
        salaryConditions.push({ salaryMax: { gte: parseFloat(minSalary) } });
      }
      if (maxSalary !== undefined && maxSalary !== null && maxSalary !== '') {
        salaryConditions.push({ salaryMin: { lte: parseFloat(maxSalary) } });
      }
      if (salaryConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push(...salaryConditions);
      }
    }

    // 6. Lọc theo số năm kinh nghiệm
    const expConditions = [];
    if (experienceMin !== undefined && experienceMin !== null && experienceMin !== '') {
      expConditions.push({
        OR: [{ experienceMax: null }, { experienceMax: { gte: parseFloat(experienceMin) } }],
      });
    }
    if (experienceMax !== undefined && experienceMax !== null && experienceMax !== '') {
      expConditions.push({
        OR: [{ experienceMin: null }, { experienceMin: { lte: parseFloat(experienceMax) } }],
      });
    }
    if (expConditions.length > 0) {
      where.AND = where.AND || [];
      where.AND.push(...expConditions);
    }

    // 7. Lọc theo các trường Enum khác
    if (jobLevel) where.jobLevel = jobLevel;
    if (educationLevel) where.educationLevel = educationLevel;
    if (workMode) where.workMode = workMode;
    if (employmentType) where.employmentType = employmentType;

    // 8. Lọc theo ngành nghề (occupationId) hoặc chuyên ngành (specializationId / specializationIds)
    const specFilter = {};
    if (specializationId) {
      specFilter.specializationId = specializationId;
    } else if (specializationIds) {
      const idList = Array.isArray(specializationIds)
        ? specializationIds
        : specializationIds.split(',').map((id) => id.trim());
      specFilter.specializationId = { in: idList };
    }

    if (occupationId) {
      specFilter.specialization = {
        occupationId,
      };
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

    // Lấy thông tin công ty (companyName, logo...) từ company-service qua RabbitMQ
    const uniqueCompanyIds = [...new Set(jobs.map((j) => j.companyId).filter(Boolean))];
    let companyMap = new Map();
    if (uniqueCompanyIds.length > 0) {
      try {
        const companies = await companyMessageBroker.getCompaniesBatch(uniqueCompanyIds);
        if (Array.isArray(companies)) {
          companies.forEach((c) => {
            companyMap.set(c.companyId, c);
          });
        }
      } catch (err) {
        console.warn('[JobPostService] Không thể lấy thông tin công ty qua RabbitMQ:', err.message);
      }
    }

    const jobsWithCompany = jobs.map((job) => {
      const companyInfo = companyMap.get(job.companyId);
      return {
        ...job,
        companyName: companyInfo?.companyName || null,
        companyLogo: companyInfo?.logo || null,
        company: companyInfo || null,
      };
    });

    return {
      jobs: jobsWithCompany,
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

    // Gửi message qua message broker cho company-service kèm companyId để lấy thông tin chi tiết công ty
    let companyInfo = null;
    let companyName = null;
    let companyLogo = null;
    if (job.companyId) {
      try {
        companyInfo = await companyMessageBroker.getCompanyById(job.companyId);
        if (companyInfo) {
          companyName = companyInfo.companyName || companyInfo.name;
          companyLogo = companyInfo.logo;
        }
      } catch (err) {
        console.warn(`[JobPostService] Không thể lấy company qua Message Broker:`, err.message);
      }
    }

    return {
      ...job,
      companyName,
      companyLogo,
      company: companyInfo,
    };
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

    const updatedJob = await jobPostRepository.update(jobId, jobFields, specializationIds);

    // Publish event job.updated
    publishJobUpdated(updatedJob).catch(() => {});

    return updatedJob;
  }

  async deleteJobPost(jobId, userId, role) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('Bạn không có quyền xóa tin tuyển dụng này');
    }

    return await jobPostRepository.delete(jobId);
  }

  async updateJobPostStatus(jobId, userId, status, role) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenError('Bạn không có quyền thay đổi trạng thái tin tuyển dụng này');
    }

    const updated = await jobPostRepository.updateStatus(jobId, status);

    // Publish event job.status_changed
    publishJobStatusChanged(jobId, status).catch(() => {});

    return updated;
  }
}

export default new JobPostService();
