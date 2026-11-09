import jobPostRepository from '../repositories/jobPost.repository.js';
import companyMessageBroker from '../rabbitmq/companyConsumer.js';
import { publishJobCreated, publishJobUpdated, publishJobStatusChanged } from '../rabbitmq/jobPublisher.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '#shared/utils/errors.util.js';
import {
  indexJob,
  updateJobInES,
  deleteJobFromES,
  searchJobsInES,
  autocompleteJobsInES,
} from '../search/jobIndex.js';
import { parseSearchQuery } from '../search/queryParser.js';

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

    // Đồng bộ lên Elasticsearch (không block luồng chính)
    indexJob(newJob).catch(() => {});

    return newJob;
  }

  async getJobPosts(queryParams = {}) {
    return await this.searchJobs(queryParams);
  }

  async autocompleteJobs(prefix, limit = 10) {
    if (!prefix || !prefix.trim()) {
      return [];
    }
    return await autocompleteJobsInES(prefix.trim(), parseInt(limit, 10) || 10);
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

    // ── NLP / Query Understanding: Bóc tách thực thể từ keyword ───────────
    let effectiveKeyword = keyword;
    let effectiveProvince = province;
    let effectiveJobLevel = jobLevel;
    let effectiveWorkMode = workMode;
    let effectiveEmploymentType = employmentType;
    let effectiveSalaryType = salaryType;
    let effectiveMinSalary = minSalary;
    let effectiveMaxSalary = maxSalary;
    let effectiveExperienceMin = experienceMin;
    let effectiveExperienceMax = experienceMax;
    let parsedEntities = {};

    if (keyword && keyword.trim()) {
      const parsed = parseSearchQuery(keyword);
      effectiveKeyword = parsed.cleanKeyword;
      parsedEntities = parsed.entities;

      // Ưu tiên filter truyền qua query param; nếu không có thì lấy từ NLP parser
      if (!effectiveProvince && parsed.extractedFilters.province) {
        effectiveProvince = parsed.extractedFilters.province;
      }
      if (!effectiveJobLevel && parsed.extractedFilters.jobLevel) {
        effectiveJobLevel = parsed.extractedFilters.jobLevel;
      }
      if (!effectiveWorkMode && parsed.extractedFilters.workMode) {
        effectiveWorkMode = parsed.extractedFilters.workMode;
      }
      if (!effectiveEmploymentType && parsed.extractedFilters.employmentType) {
        effectiveEmploymentType = parsed.extractedFilters.employmentType;
      }
      if (!effectiveSalaryType && parsed.extractedFilters.salaryType) {
        effectiveSalaryType = parsed.extractedFilters.salaryType;
        if (effectiveMinSalary == null && parsed.extractedFilters.minSalary != null) {
          effectiveMinSalary = parsed.extractedFilters.minSalary;
        }
        if (effectiveMaxSalary == null && parsed.extractedFilters.maxSalary != null) {
          effectiveMaxSalary = parsed.extractedFilters.maxSalary;
        }
      }
      if (effectiveExperienceMin == null && parsed.extractedFilters.experienceMin != null) {
        effectiveExperienceMin = parsed.extractedFilters.experienceMin;
      }
      if (effectiveExperienceMax == null && parsed.extractedFilters.experienceMax != null) {
        effectiveExperienceMax = parsed.extractedFilters.experienceMax;
      }
    }

    // ── Tìm kiếm qua Elasticsearch ──────────────────────────────────────────
    try {
      const { hits, total } = await searchJobsInES({
        keyword: effectiveKeyword,
        province: effectiveProvince,
        salaryType: effectiveSalaryType,
        minSalary: effectiveMinSalary,
        maxSalary: effectiveMaxSalary,
        experienceMin: effectiveExperienceMin,
        experienceMax: effectiveExperienceMax,
        jobLevel: effectiveJobLevel,
        educationLevel,
        workMode: effectiveWorkMode,
        employmentType: effectiveEmploymentType,
        status,
        companyId,
        occupationId,
        specializationId,
        specializationIds,
        sortBy,
        sortOrder,
        page: pageNum,
        limit: take,
      });

      // Lấy thông tin công ty theo batch qua RabbitMQ
      const uniqueCompanyIds = [...new Set(hits.map((j) => j.companyId).filter(Boolean))];
      let companyMap = new Map();
      if (uniqueCompanyIds.length > 0) {
        try {
          const companies = await companyMessageBroker.getCompaniesBatch(uniqueCompanyIds);
          if (Array.isArray(companies)) {
            companies.forEach((c) => companyMap.set(c.companyId, c));
          }
        } catch (err) {
          console.warn('[JobPostService] Không thể lấy thông tin công ty qua RabbitMQ:', err.message);
        }
      }

      const jobs = hits.map((job) => {
        const companyInfo = companyMap.get(job.companyId);

        // Định dạng hiển thị mức lương
        let salary = 'Thỏa thuận';
        if (job.salaryType === 'RANGE') {
          if (job.salaryMin && job.salaryMax) {
            const minM = Number(job.salaryMin) / 1_000_000;
            const maxM = Number(job.salaryMax) / 1_000_000;
            salary = `${minM} - ${maxM} triệu`;
          } else if (job.salaryMin) {
            salary = `Từ ${Number(job.salaryMin) / 1_000_000} triệu`;
          } else if (job.salaryMax) {
            salary = `Lên đến ${Number(job.salaryMax) / 1_000_000} triệu`;
          }
        }

        // Định dạng hiển thị kinh nghiệm
        let experience = 'Không yêu cầu kinh nghiệm';
        if (job.experienceMin != null && job.experienceMax != null) {
          experience = `${job.experienceMin} - ${job.experienceMax} năm`;
        } else if (job.experienceMin != null) {
          experience = `Từ ${job.experienceMin} năm`;
        } else if (job.experienceMax != null) {
          experience = `Dưới ${job.experienceMax} năm`;
        }

        return {
          jobId: job.jobId,
          title: job.title,
          companyName: companyInfo?.companyName || job.companyName || null,
          logo: companyInfo?.logo || null,
          salary,
          experience,
          jobLevel: job.jobLevel,
          province: job.province,
          deadline: job.deadline,
          publishedAt: job.publishedAt,
          _score: job._score,
        };
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
          cleanKeyword: effectiveKeyword || null,
          province: effectiveProvince || null,
          occupationId: occupationId || null,
          specializationId: specializationId || null,
          salaryType: effectiveSalaryType || null,
          jobLevel: effectiveJobLevel || null,
          workMode: effectiveWorkMode || null,
          employmentType: effectiveEmploymentType || null,
          minSalary: effectiveMinSalary || null,
          maxSalary: effectiveMaxSalary || null,
          experienceMin: effectiveExperienceMin != null ? effectiveExperienceMin : null,
          experienceMax: effectiveExperienceMax != null ? effectiveExperienceMax : null,
          parsedEntities: Object.keys(parsedEntities).length > 0 ? parsedEntities : null,
        },
        source: 'elasticsearch',
      };
    } catch (esErr) {
      // ── Fallback sang PostgreSQL nếu Elasticsearch gặp lỗi ────────────────
      console.warn('[JobPostService] Elasticsearch lỗi, fallback sang PostgreSQL:', esErr.message);
      return this._searchJobsFromDB(queryParams);
    }
  }

  /**
   * Fallback: Tìm kiếm trực tiếp từ PostgreSQL (logic cũ).
   * Được gọi khi Elasticsearch không khả dụng.
   */
  async _searchJobsFromDB(queryParams = {}) {
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

    if (status) where.status = status;
    if (province) where.province = { contains: province, mode: 'insensitive' };
    if (companyId) where.companyId = companyId;
    if (salaryType) where.salaryType = salaryType;

    if (salaryType === 'RANGE') {
      const salaryConditions = [];
      if (minSalary != null && minSalary !== '') salaryConditions.push({ salaryMax: { gte: parseFloat(minSalary) } });
      if (maxSalary != null && maxSalary !== '') salaryConditions.push({ salaryMin: { lte: parseFloat(maxSalary) } });
      if (salaryConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push(...salaryConditions);
      }
    }

    const expConditions = [];
    if (experienceMin != null && experienceMin !== '') {
      expConditions.push({ OR: [{ experienceMax: null }, { experienceMax: { gte: parseFloat(experienceMin) } }] });
    }
    if (experienceMax != null && experienceMax !== '') {
      expConditions.push({ OR: [{ experienceMin: null }, { experienceMin: { lte: parseFloat(experienceMax) } }] });
    }
    if (expConditions.length > 0) {
      where.AND = where.AND || [];
      where.AND.push(...expConditions);
    }

    if (jobLevel) where.jobLevel = jobLevel;
    if (educationLevel) where.educationLevel = educationLevel;
    if (workMode) where.workMode = workMode;
    if (employmentType) where.employmentType = employmentType;

    const specFilter = {};
    if (specializationId) {
      specFilter.specializationId = specializationId;
    } else if (specializationIds) {
      const idList = Array.isArray(specializationIds)
        ? specializationIds
        : specializationIds.split(',').map((id) => id.trim());
      specFilter.specializationId = { in: idList };
    }
    if (occupationId) specFilter.specialization = { occupationId };
    if (Object.keys(specFilter).length > 0) where.jobPostSpecializations = { some: specFilter };

    if (keyword && keyword.trim()) {
      const trimmedKeyword = keyword.trim();
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { title: { contains: trimmedKeyword, mode: 'insensitive' } },
          { description: { contains: trimmedKeyword, mode: 'insensitive' } },
          { requirements: { contains: trimmedKeyword, mode: 'insensitive' } },
          { benefits: { contains: trimmedKeyword, mode: 'insensitive' } },
        ],
      });
    }

    const allowedSortFields = ['createdAt', 'publishedAt', 'salaryMax', 'deadline'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
    const orderBy = { [validSortBy]: validSortOrder };

    const { total, jobs } = await jobPostRepository.findMany({ where, skip, take, orderBy });

    const uniqueCompanyIds = [...new Set(jobs.map((j) => j.companyId).filter(Boolean))];
    let companyMap = new Map();
    if (uniqueCompanyIds.length > 0) {
      try {
        const companies = await companyMessageBroker.getCompaniesBatch(uniqueCompanyIds);
        if (Array.isArray(companies)) companies.forEach((c) => companyMap.set(c.companyId, c));
      } catch (err) {
        console.warn('[JobPostService] Không thể lấy thông tin công ty qua RabbitMQ:', err.message);
      }
    }

    const jobsWithCompany = jobs.map((job) => {
      const companyInfo = companyMap.get(job.companyId);
      let salary = 'Thỏa thuận';
      if (job.salaryType === 'RANGE') {
        if (job.salaryMin && job.salaryMax) {
          const minM = Number(job.salaryMin) / 1_000_000;
          const maxM = Number(job.salaryMax) / 1_000_000;
          salary = `${minM} - ${maxM} triệu`;
        } else if (job.salaryMin) {
          salary = `Từ ${Number(job.salaryMin) / 1_000_000} triệu`;
        } else if (job.salaryMax) {
          salary = `Lên đến ${Number(job.salaryMax) / 1_000_000} triệu`;
        }
      }
      let experience = 'Không yêu cầu kinh nghiệm';
      if (job.experienceMin !== null && job.experienceMin !== undefined && job.experienceMax !== null && job.experienceMax !== undefined) {
        experience = `${job.experienceMin} - ${job.experienceMax} năm`;
      } else if (job.experienceMin !== null && job.experienceMin !== undefined) {
        experience = `Từ ${job.experienceMin} năm`;
      } else if (job.experienceMax !== null && job.experienceMax !== undefined) {
        experience = `Dưới ${job.experienceMax} năm`;
      }
      return {
        jobId: job.jobId,
        title: job.title,
        companyName: companyInfo?.companyName || null,
        logo: companyInfo?.logo || null,
        salary,
        experience,
        jobLevel: job.jobLevel,
        province: job.province,
        deadline: job.deadline,
        publishedAt: job.publishedAt,
      };
    });

    return {
      jobs: jobsWithCompany,
      pagination: { page: pageNum, limit: take, total, totalPages: Math.ceil(total / take) },
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
      source: 'postgresql',
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

    // Đồng bộ lên Elasticsearch
    indexJob(updatedJob).catch(() => {});

    return updatedJob;
  }

  async deleteJobPost(jobId, userId) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xóa tin tuyển dụng này');
    }

    const deleted = await jobPostRepository.delete(jobId);

    // Xóa khỏi Elasticsearch
    deleteJobFromES(jobId).catch(() => {});

    return deleted;
  }

  async updateJobPostStatus(jobId, userId, status) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    if (job.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền thay đổi trạng thái tin tuyển dụng này');
    }

    const updated = await jobPostRepository.updateStatus(jobId, status);

    // Publish event job.status_changed
    publishJobStatusChanged(jobId, status).catch(() => {});

    // Đồng bộ trạng thái mới lên Elasticsearch
    updateJobInES(jobId, {
      status,
      ...(status === 'PUBLISHED' && { publishedAt: new Date().toISOString() }),
    }).catch(() => {});

    return updated;
  }
}

export default new JobPostService();
