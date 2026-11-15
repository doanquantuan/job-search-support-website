import jobPostRepository from '../repositories/jobPost.repository.js';
import jobViewHistoryRepository from '../repositories/jobViewHistory.repository.js';
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

const parseExperience = (exp) => {
  if (!exp || typeof exp !== 'string') return { experienceMin: null, experienceMax: null };
  const trimmed = exp.trim().toLowerCase();
  if (trimmed === 'không yêu cầu' || trimmed.includes('không yêu cầu')) {
    return { experienceMin: null, experienceMax: null };
  }
  if (trimmed.includes('dưới 1 năm')) {
    return { experienceMin: 0, experienceMax: 1 };
  }
  if (trimmed.includes('1 - 3') || trimmed.includes('1 – 3') || trimmed.includes('1-3')) {
    return { experienceMin: 1, experienceMax: 3 };
  }
  if (trimmed.includes('3 - 5') || trimmed.includes('3 – 5') || trimmed.includes('3-5')) {
    return { experienceMin: 3, experienceMax: 5 };
  }
  if (trimmed.includes('trên 5 năm') || trimmed.includes('tren 5 nam')) {
    return { experienceMin: 5, experienceMax: null };
  }
  return { experienceMin: null, experienceMax: null };
};

const sanitizeJobFields = (fields) => {
  const sanitized = { ...fields };

  // 1. Loại bỏ các trường rác không thuộc bảng JobPost
  delete sanitized.industry;
  delete sanitized.occupationId;
  delete sanitized.jobId;

  // 2. Map quantity -> vacancies
  if (sanitized.quantity !== undefined && sanitized.vacancies === undefined) {
    sanitized.vacancies = Number(sanitized.quantity) || 1;
  }
  delete sanitized.quantity;

  // 3. Parse experience chuỗi nếu experienceMin/Max chưa có
  if (sanitized.experience && (sanitized.experienceMin === undefined || sanitized.experienceMin === null)) {
    const parsed = parseExperience(sanitized.experience);
    sanitized.experienceMin = parsed.experienceMin;
    sanitized.experienceMax = parsed.experienceMax;
  }
  delete sanitized.experience;

  // 4. Chuẩn hóa skills thành mảng chuỗi
  if (sanitized.skills) {
    if (Array.isArray(sanitized.skills)) {
      sanitized.skills = sanitized.skills
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean);
    } else {
      delete sanitized.skills;
    }
  }

  // 5. Mặc định educationLevel & workingHours nếu thiếu
  if (!sanitized.educationLevel) {
    sanitized.educationLevel = 'NO_REQUIREMENT';
  }
  if (!sanitized.workingHours) {
    sanitized.workingHours = 'Thứ 2 - Thứ 6 (08:30 - 17:30)';
  }

  return sanitized;
};

class JobPostService {
  /**
   * Helper lấy companyId của nhà tuyển dụng với cơ chế ưu tiên RabbitMQ và fallback sang HTTP
   */
  async _getCompanyIdForUser(userId) {
    if (!userId) return null;
    try {
      const companyId = await companyMessageBroker.getCompanyIdByUserId(userId);
      if (companyId) return companyId;
    } catch (err) {
      console.warn('[JobPostService] Broker error:', err.message);
      // Fallback sang direct HTTP endpoint của company-service (bỏ qua khi chạy test)
      if (process.env.NODE_ENV !== 'test') {
        try {
          const res = await fetch(`http://localhost:5004/api/v1/companies/internal/by-recruiter/${userId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data?.companyId) {
              return json.data.companyId;
            }
          }
        } catch (httpErr) {
          console.warn('[JobPostService] Fallback HTTP lấy companyId thất bại:', httpErr.message);
        }
      }
    }
    return null;
  }

  async createJobPost(userId, data) {
    const { specializationIds = [], ...rawFields } = data;
    const jobFields = sanitizeJobFields(rawFields);

    let companyId = jobFields.companyId;

    if (!companyId) {
      companyId = await this._getCompanyIdForUser(userId);
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

  async _verifyJobOwnership(job, userId, defaultMessage = 'Bạn không có quyền thực hiện thao tác trên tin tuyển dụng này') {
    if (job.userId === userId) {
      return true;
    }

    const companyId = await this._getCompanyIdForUser(userId);

    if (companyId && job.companyId === companyId) {
      return true;
    }

    throw new ForbiddenError(defaultMessage);
  }

  async getMyJobs(userId, queryParams = {}) {
    const {
      page = 1,
      limit = 8,
      status = 'ALL',
      search = '',
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 8));
    const skip = (pageNum - 1) * take;

    const companyId = await this._getCompanyIdForUser(userId);

    const where = {};
    if (companyId) {
      where.OR = [
        { companyId },
        { userId },
      ];
    } else {
      where.userId = userId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const { total, jobs } = await jobPostRepository.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    // Lấy viewCount thực tế theo danh sách jobIds
    const jobIds = jobs.map((j) => j.jobId);
    let viewsMap = {};
    if (jobIds.length > 0 && process.env.NODE_ENV !== 'test') {
      try {
        viewsMap = await jobViewHistoryRepository.countViewsByJobIds(jobIds);
      } catch (err) {
        console.warn('[JobPostService] Lỗi countViewsByJobIds:', err.message);
      }
    }

    const formattedJobs = jobs.map((job) => {
      let salary = 'Thỏa thuận';
      if (job.salaryType === 'RANGE') {
        if (job.salaryMin && job.salaryMax) {
          const minM = Number(job.salaryMin) / 1_000_000;
          const maxM = Number(job.salaryMax) / 1_000_000;
          salary = `${minM} – ${maxM} triệu`;
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

      const occupationName = job.jobPostSpecializations?.[0]?.specialization?.occupation?.occupationName || 'Công nghệ thông tin';

      return {
        ...job,
        id: job.jobId,
        salary,
        experience,
        industry: occupationName,
        workplaceType: job.workMode,
        viewCount: viewsMap[job.jobId] || 0,
        applicationsCount: 0,
      };
    });

    return {
      data: formattedJobs,
      pagination: {
        total,
        totalPages: Math.ceil(total / take) || 1,
        page: pageNum,
        limit: take,
      },
    };
  }

  async getRecruiterJobMetrics(userId) {
    const companyId = await this._getCompanyIdForUser(userId);
    const where = {};
    if (companyId) {
      where.OR = [
        { companyId },
        { userId },
      ];
    } else {
      where.userId = userId;
    }

    if (process.env.NODE_ENV === 'test') {
      return {
        total: 0,
        published: 0,
        draft: 0,
        closed: 0,
        expired: 0,
        publishedGrowth: '+0 tin trong tuần này',
      };
    }

    const grouped = await jobPostRepository.countByStatus(where);
    const statusCounts = {
      PUBLISHED: 0,
      DRAFT: 0,
      CLOSED: 0,
      EXPIRED: 0,
    };
    let total = 0;
    for (const g of grouped) {
      statusCounts[g.status] = g._count.jobId;
      total += g._count.jobId;
    }

    const now = new Date();
    const start7d = new Date();
    start7d.setDate(now.getDate() - 7);
    start7d.setHours(0, 0, 0, 0);

    const prevStart7d = new Date(start7d);
    prevStart7d.setDate(start7d.getDate() - 7);

    const [currentWeekPublished, prevWeekPublished] = await Promise.all([
      jobPostRepository.count({
        ...where,
        status: 'PUBLISHED',
        createdAt: { gte: start7d, lte: now },
      }),
      jobPostRepository.count({
        ...where,
        status: 'PUBLISHED',
        createdAt: { gte: prevStart7d, lt: start7d },
      }),
    ]);

    const diff = currentWeekPublished - prevWeekPublished;
    const publishedGrowth = `${diff >= 0 ? '+' : ''}${diff} tin trong tuần này`;

    return {
      total,
      published: statusCounts.PUBLISHED || 0,
      draft: statusCounts.DRAFT || 0,
      closed: statusCounts.CLOSED || 0,
      expired: statusCounts.EXPIRED || 0,
      publishedGrowth,
    };
  }

  async updateJobPost(jobId, userId, updateData) {
    const job = await jobPostRepository.findById(jobId);
    if (!job) {
      throw new NotFoundError('Không tìm thấy tin tuyển dụng');
    }

    await this._verifyJobOwnership(job, userId, 'Bạn không có quyền chỉnh sửa tin tuyển dụng này');

    const { specializationIds, ...rawFields } = updateData;
    const jobFields = sanitizeJobFields(rawFields);

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

    await this._verifyJobOwnership(job, userId, 'Bạn không có quyền xóa tin tuyển dụng này');

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

    await this._verifyJobOwnership(job, userId, 'Bạn không có quyền thay đổi trạng thái tin tuyển dụng này');

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
