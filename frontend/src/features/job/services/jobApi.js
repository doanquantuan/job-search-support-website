import { apiClient } from '@/lib/apiClient';
import { matchJobByCategory } from '@/constants/categories';
import { matchJobBySalary, matchJobByExperience } from '@/constants/jobFilters';

// Cache đơn giản ở client để tránh gọi API company nhiều lần
const companyCache = new Map();

// Helper format dữ liệu trả về từ backend API chuẩn hoá sang frontend model
export const formatJobData = (raw) => {
  if (!raw) return null;

  const id = raw.jobId || raw.id;
  const title = raw.title || 'Vị trí tuyển dụng';
  const province = raw.province || raw.location || 'Toàn quốc';
  const address = raw.address || province;

  // Xử lý mức lương hiển thị (ưu tiên chuỗi salary đã được backend định dạng sẵn)
  let salaryText = raw.salary || 'Thỏa thuận';
  if (!raw.salary) {
    if (raw.salaryType === 'RANGE' || (raw.salaryMin && raw.salaryMax)) {
      const minM = raw.salaryMin ? Number(raw.salaryMin) / 1000000 : null;
      const maxM = raw.salaryMax ? Number(raw.salaryMax) / 1000000 : null;
      if (minM && maxM) {
        salaryText = `${minM} – ${maxM} triệu`;
      } else if (minM) {
        salaryText = `Từ ${minM} triệu`;
      } else if (maxM) {
        salaryText = `Lên đến ${maxM} triệu`;
      }
    }
  }

  // Map enum JobLevel sang Tiếng Việt
  const jobLevelMap = {
    INTERN: 'Thực tập sinh',
    FRESHER: 'Fresher',
    JUNIOR: 'Nhân viên (Junior)',
    MIDDLE: 'Chuyên viên (Middle)',
    SENIOR: 'Chuyên viên cao cấp (Senior)',
    LEAD: 'Trưởng nhóm (Lead)',
    MANAGER: 'Quản lý (Manager)',
  };

  // Map enum WorkMode
  const workModeMap = {
    REMOTE: 'Từ xa',
    HYBRID: 'Hybrid',
    ONSITE: 'Tại văn phòng',
  };

  // Map enum EmploymentType
  const employmentTypeMap = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    CONTRACT: 'Hợp đồng',
    INTERNSHIP: 'Thực tập',
    FREELANCE: 'Freelance',
    TEMPORARY: 'Tạm thời',
  };

  // Map enum EducationLevel
  const educationMap = {
    NO_REQUIREMENT: 'Không yêu cầu bằng cấp',
    HIGH_SCHOOL: 'Tốt nghiệp THPT',
    COLLEGE: 'Cao đẳng',
    UNIVERSITY: 'Đại học',
    POSTGRADUATE: 'Sau đại học / Thạc sĩ',
  };

  const level = jobLevelMap[raw.jobLevel] || raw.level || raw.jobLevel || 'Nhân viên';
  const workplaceType = workModeMap[raw.workMode] || raw.workplaceType || 'Tại văn phòng';
  const employmentType = employmentTypeMap[raw.employmentType] || raw.employmentType || 'Toàn thời gian';
  const educationLevel = educationMap[raw.educationLevel] || raw.educationLevel || 'Đại học';

  // Hạn nộp định dạng dd/mm
  let deadline = 'Đang tuyển';
  if (raw.deadline) {
    const d = new Date(raw.deadline);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      deadline = `${day}/${month}`;
    }
  }

  // Tags kỹ năng từ specializations nếu có
  const specializations = raw.jobPostSpecializations?.map((jps) => jps.specialization?.specializationName) || [];
  const occupationName = raw.jobPostSpecializations?.[0]?.specialization?.occupation?.occupationName || raw.industry || 'Công nghệ thông tin';

  const tags = raw.tags && raw.tags.length > 0 
    ? raw.tags 
    : [employmentType, workplaceType, ...specializations.slice(0, 2)];

  // Xử lý kinh nghiệm (ưu tiên chuỗi experience đã được backend định dạng sẵn)
  let experience = raw.experience || 'Không yêu cầu kinh nghiệm';
  if (!raw.experience) {
    if (raw.experienceMin !== null && raw.experienceMin !== undefined && raw.experienceMax !== null && raw.experienceMax !== undefined) {
      experience = `${raw.experienceMin} – ${raw.experienceMax} năm`;
    } else if (raw.experienceMin) {
      experience = `Từ ${raw.experienceMin} năm`;
    }
  }

  // Tên công ty: Ưu tiên raw.companyName hoặc raw.company.name
  const companyName = raw.companyName || raw.company?.name || raw.company?.companyName || 'Doanh nghiệp tuyển dụng';
  const companyLogo = raw.logo || raw.companyLogo || raw.company?.logo || null;

  return {
    id,
    jobId: id,
    title,
    province,
    location: province,
    address,
    salary: salaryText,
    salaryType: raw.salaryType || 'RANGE',
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    salaryRange: raw.salaryRange || {
      min: raw.salaryMin ? Number(raw.salaryMin) / 1000000 : 0,
      max: raw.salaryMax ? Number(raw.salaryMax) / 1000000 : 0,
      isNegotiable: raw.salaryType === 'NEGOTIABLE',
    },
    employmentType,
    workMode: raw.workMode,
    workplaceType,
    jobLevel: raw.jobLevel,
    level,
    educationLevel,
    experience,
    experienceMin: raw.experienceMin,
    experienceMax: raw.experienceMax,
    vacancies: raw.vacancies || 1,
    workingHours: raw.workingHours || 'Thứ 2 – Thứ 6 (Giờ hành chính)',
    deadline,
    rawDeadline: raw.deadline,
    publishedAt: raw.publishedAt || raw.createdAt,
    postedAt: raw.postedAt || 'Mới đăng',
    isHot: Boolean(raw.isHot || raw.jobLevel === 'LEAD' || raw.jobLevel === 'SENIOR'),
    description: raw.description || 'Mô tả công việc chi tiết đang được cập nhật.',
    requirements: raw.requirements || 'Yêu cầu ứng viên đang được cập nhật.',
    benefits: raw.benefits || 'Chế độ đãi ngộ hấp dẫn theo năng lực.',
    skills: raw.skills || specializations,
    tags,
    industry: occupationName,
    companyId: raw.companyId,
    companyName,
    logo: companyLogo,
    companyLogo,
    company: {
      id: raw.companyId,
      name: companyName,
      companyName,
      logo: companyLogo,
      province,
      address,
      isVerified: true,
      ...(raw.company || {}),
    },
  };
};

export const jobApi = {
  /**
   * Lấy danh sách việc làm có bộ lọc & phân trang từ API thật (/jobs)
   */
  async getJobs({
    keyword = '',
    location = '',
    salary = 'all',
    experience = 'all',
    workType = 'all',
    industry = 'all',
    level = 'all',
    sortBy = 'newest',
    page = 1,
    limit = 10,
  } = {}) {
    try {
      const params = {
        page,
        limit,
      };

      if (keyword && keyword.trim()) params.keyword = keyword.trim();
      if (location && location !== 'all') params.province = location;

      // Map sortBy sang backend field
      const sortMap = {
        newest: { sortBy: 'publishedAt', sortOrder: 'desc' },
        salary_high: { sortBy: 'salaryMax', sortOrder: 'desc' },
        salary_low: { sortBy: 'salaryMin', sortOrder: 'asc' },
        deadline_near: { sortBy: 'deadline', sortOrder: 'asc' },
      };
      if (sortMap[sortBy]) {
        params.sortBy = sortMap[sortBy].sortBy;
        params.sortOrder = sortMap[sortBy].sortOrder;
      }

      // Map level sang enum backend
      const levelEnumMap = {
        'Thực tập sinh': 'INTERN',
        'Fresher': 'FRESHER',
        'Nhân viên': 'JUNIOR',
        'Chuyên viên': 'SENIOR',
        'Trưởng nhóm / Quản lý': 'LEAD',
      };
      if (level && level !== 'all' && levelEnumMap[level]) {
        params.jobLevel = levelEnumMap[level];
      }

      // Map workType sang enum backend
      const workModeEnumMap = {
        'Remote': 'REMOTE',
        'Hybrid': 'HYBRID',
        'Tại văn phòng': 'ONSITE',
      };
      if (workType && workType !== 'all' && workModeEnumMap[workType]) {
        params.workMode = workModeEnumMap[workType];
      }

      // Gọi API qua Gateway (/jobs)
      const response = await apiClient.get('/jobs', { params });
      const resData = response.data?.data || response.data;
      const rawJobs = resData.jobs || (Array.isArray(resData) ? resData : []);
      const pagination = resData.pagination || {
        total: rawJobs.length,
        page,
        limit,
        totalPages: Math.ceil(rawJobs.length / limit) || 1,
      };

      if (rawJobs && rawJobs.length > 0) {
        // Kiểm tra xem có job nào chưa có companyName hay không (nếu RabbitMQ chưa trả về kịp)
        const missingCompanyIds = [
          ...new Set(
            rawJobs
              .filter((j) => !j.companyName && !j.company?.name && j.companyId)
              .map((j) => j.companyId)
          ),
        ];

        // Lấy thông tin bổ sung từ company-service nếu cần
        if (missingCompanyIds.length > 0) {
          await Promise.all(
            missingCompanyIds.map(async (compId) => {
              if (!companyCache.has(compId)) {
                try {
                  const cRes = await apiClient.get(`/companies/${compId}`).catch(() => null);
                  const cData = cRes?.data?.data || cRes?.data;
                  if (cData) {
                    companyCache.set(compId, cData);
                  }
                } catch {
                  // bỏ qua
                }
              }
            })
          );
        }

        const formattedJobs = rawJobs.map((j) => {
          const cachedComp = companyCache.get(j.companyId);
          if (cachedComp) {
            j.companyName = j.companyName || cachedComp.companyName || cachedComp.name;
            j.companyLogo = j.companyLogo || cachedComp.logo;
            j.company = { ...cachedComp, ...(j.company || {}) };
          }
          return formatJobData(j);
        });

        return {
          data: formattedJobs,
          pagination,
        };
      }
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    } catch (err) {
      console.error('[jobApi] Lỗi khi nạp danh sách việc làm từ backend:', err.message);
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 1 },
      };
    }
  },

  /**
   * Lấy chi tiết 1 tin tuyển dụng theo ID từ API thật (/jobs/:id)
   */
  async getJobById(id) {
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        const formatted = formatJobData(raw);

        // Nếu thiếu tên công ty hoặc thông tin chi tiết công ty, tự động query thêm từ /companies/:id
        if (formatted.companyId) {
          try {
            if (!companyCache.has(formatted.companyId)) {
              const compRes = await apiClient.get(`/companies/${formatted.companyId}`).catch(() => null);
              if (compRes?.data?.data) {
                companyCache.set(formatted.companyId, compRes.data.data);
              }
            }
            const compData = companyCache.get(formatted.companyId);
            if (compData) {
              formatted.companyName = compData.companyName || compData.name;
              formatted.companyLogo = compData.logo;
              formatted.company = {
                ...formatted.company,
                ...compData,
                name: compData.companyName || compData.name,
              };
            }
          } catch {
            // bỏ qua nếu lỗi
          }
        }
        return formatted;
      }
      return null;
    } catch (err) {
      console.error(`[jobApi] Lỗi getJobById(${id}) từ API:`, err.message);
      return null;
    }
  },

  /**
   * Lấy các việc làm tương tự hoặc cùng công ty
   */
  async getSimilarJobs(currentId, limit = 4) {
    try {
      const res = await this.getJobs({ page: 1, limit: limit + 1 });
      return (res.data || []).filter((j) => j.id !== currentId).slice(0, limit);
    } catch {
      return [];
    }
  },

  /**
   * Autocomplete gợi ý từ khóa tìm kiếm khi người dùng đang gõ
   * @param {string} q - Từ khóa tiền tố đang gõ (vd: "reac", "lap trin")
   * @param {number} limit - Số lượng gợi ý (mặc định 8)
   */
  async getAutocompleteSuggestions(q, limit = 8) {
    if (!q || !q.trim()) return [];
    try {
      const response = await apiClient.get('/jobs/autocomplete', {
        params: { q: q.trim(), limit },
      });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Lưu tin tuyển dụng vào danh sách yêu thích
   */
  async saveJob(jobId) {
    const response = await apiClient.post(`/saved-jobs/${jobId}`);
    return response.data?.data || response.data;
  },

  /**
   * Bỏ lưu tin tuyển dụng
   */
  async unsaveJob(jobId) {
    const response = await apiClient.delete(`/saved-jobs/${jobId}`);
    return response.data?.data || response.data;
  },

  /**
   * Lấy danh sách việc làm đã lưu của ứng viên (có phân trang)
   */
  async getSavedJobs(params = {}) {
    const response = await apiClient.get('/saved-jobs', { params });
    const result = response.data?.data || response.data;
    if (result && Array.isArray(result.items)) {
      result.items = result.items.map((item) => ({
        ...item,
        jobPost: formatJobData(item.jobPost),
      }));
    }
    return result;
  },

  /**
   * Kiểm tra hàng loạt xem danh sách jobId nào đã được lưu
   */
  async checkBatchSaved(jobIds = []) {
    if (!jobIds.length) return [];
    const response = await apiClient.post('/saved-jobs/check-batch', { jobIds });
    return response.data?.data || response.data || [];
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ── PHÂN HỆ NHÀ TUYỂN DỤNG (RECRUITER METHODS - UC34, UC35, UC36, UC37) ────
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Lấy danh sách tin tuyển dụng thuộc về doanh nghiệp hiện tại (UC35)
   */
  async getMyJobs({ status = 'ALL', search = '', page = 1, limit = 8 } = {}) {
    const params = { page, limit };
    if (status && status !== 'ALL') params.status = status;
    if (search && search.trim()) params.search = search.trim();

    const response = await apiClient.get('/jobs/my-jobs', { params });
    return response.data?.data || response.data;
  },

  /**
   * Đăng tin tuyển dụng mới (UC34)
   */
  async createJob(jobData) {
    try {
      const payload = {
        ...jobData,
        vacancies: Number(jobData.vacancies || jobData.quantity) || 1,
        requirements: Array.isArray(jobData.requirements)
          ? jobData.requirements.join('\n')
          : (jobData.requirements || ''),
        benefits: Array.isArray(jobData.benefits)
          ? jobData.benefits.join('\n')
          : (jobData.benefits || ''),
        workingHours: jobData.workingHours || 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
        educationLevel: jobData.educationLevel || 'NO_REQUIREMENT',
        jobLevel: jobData.jobLevel || 'MIDDLE',
        workMode: jobData.workMode || 'HYBRID',
        employmentType: jobData.employmentType || 'FULL_TIME',
        salaryType: jobData.salaryType || 'RANGE',
        skills: Array.isArray(jobData.skills) ? jobData.skills : [],
      };
      const response = await apiClient.post('/jobs', payload);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi tạo tin tuyển dụng';
      console.error('[jobApi] Lỗi createJob từ API:', errMsg);
      throw new Error(errMsg);
    }
  },

  /**
   * Cập nhật thông tin tin tuyển dụng (UC36)
   */
  async updateJob(jobId, jobData) {
    try {
      const payload = {
        ...jobData,
        vacancies: jobData.vacancies !== undefined ? Number(jobData.vacancies) : (jobData.quantity !== undefined ? Number(jobData.quantity) : undefined),
        requirements: Array.isArray(jobData.requirements)
          ? jobData.requirements.join('\n')
          : jobData.requirements,
        benefits: Array.isArray(jobData.benefits)
          ? jobData.benefits.join('\n')
          : jobData.benefits,
      };
      const response = await apiClient.patch(`/jobs/${jobId}`, payload);
      return response.data?.data || response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật tin tuyển dụng';
      console.error(`[jobApi] Lỗi updateJob(${jobId}):`, errMsg);
      throw new Error(errMsg);
    }
  },

  /**
   * Đóng hoặc mở lại nhận hồ sơ ứng tuyển (UC37)
   */
  async toggleJobStatus(jobId, newStatus) {
    const response = await apiClient.patch(`/jobs/${jobId}/status`, { status: newStatus });
    return response.data?.data || response.data;
  },

  /**
   * Xóa tin tuyển dụng (UC37)
   */
  async deleteJob(jobId) {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data?.data || response.data;
  },

  /**
   * Thống kê số lượng tin đăng cho Recruiter Dashboard
   */
  async getRecruiterJobMetrics() {
    try {
      const res = await apiClient.get('/jobs/my-jobs/metrics');
      const data = res.data?.data || res.data || {};
      return {
        total: data.total ?? 0,
        published: data.published ?? 0,
        draft: data.draft ?? 0,
        closed: data.closed ?? 0,
        expired: data.expired ?? 0,
        publishedGrowth: data.publishedGrowth ?? '+0 tin trong tuần này',
        totalApplications: data.totalApplications ?? 0,
        totalViews: data.totalViews ?? 0,
      };
    } catch (_err) {
      const res = await this.getMyJobs({ limit: 100 });
      const jobs = res.data || [];
      return {
        total: jobs.length,
        published: jobs.filter((j) => j.status === 'PUBLISHED').length,
        draft: jobs.filter((j) => j.status === 'DRAFT').length,
        closed: jobs.filter((j) => j.status === 'CLOSED').length,
        expired: jobs.filter((j) => j.status === 'EXPIRED').length,
        publishedGrowth: '+0 tin trong tuần này',
        totalApplications: jobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0),
        totalViews: jobs.reduce((acc, curr) => acc + (curr.viewCount || 0), 0),
      };
    }
  },

};

export default jobApi;
