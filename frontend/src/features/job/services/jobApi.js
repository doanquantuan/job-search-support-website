import { apiClient } from '@/lib/apiClient';
import { MOCK_JOBS } from '../data/mockJobs';
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
    } catch (err) {
      console.warn('[jobApi] Không thể kết nối API /jobs từ backend, chuyển sang mock data dự phòng:', err.message);
    }

    // === FALLBACK MOCK DATA NẾU BACKEND CHƯA CHẠY HOẶC TRẢ VỀ RỖNG ===
    let filtered = [...MOCK_JOBS];

    if (keyword && keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      filtered = filtered.filter((job) => {
        const titleMatch = job.title.toLowerCase().includes(q);
        const compMatch = (job.company?.name || job.companyName || '').toLowerCase().includes(q);
        const skillsMatch = job.skills?.some((s) => s.toLowerCase().includes(q));
        return titleMatch || compMatch || skillsMatch;
      });
    }

    if (location && location.trim() && location !== 'all') {
      const loc = location.trim().toLowerCase();
      filtered = filtered.filter((job) => {
        const jLoc = (job.location || '').toLowerCase();
        const jProv = (job.company?.province || '').toLowerCase();
        return jLoc.includes(loc) || jProv.includes(loc);
      });
    }

    if (salary && salary !== 'all') {
      filtered = filtered.filter((job) => matchJobBySalary(job, salary));
    }

    if (experience && experience !== 'all') {
      filtered = filtered.filter((job) => matchJobByExperience(job, experience));
    }

    if (workType && workType !== 'all') {
      filtered = filtered.filter((job) =>
        job.employmentType === workType || job.workplaceType === workType || job.tags?.includes(workType)
      );
    }

    if (industry && industry !== 'all') {
      filtered = filtered.filter((job) => matchJobByCategory(job, industry));
    }

    if (level && level !== 'all') {
      filtered = filtered.filter((job) => job.level === level);
    }

    if (sortBy === 'salary_high') {
      filtered.sort((a, b) => (b.salaryRange?.max || 0) - (a.salaryRange?.max || 0));
    } else if (sortBy === 'salary_low') {
      filtered.sort((a, b) => (a.salaryRange?.min || 0) - (b.salaryRange?.min || 0));
    } else if (sortBy === 'deadline_near') {
      filtered.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData.map(formatJobData),
      pagination: {
        total,
        page: safePage,
        limit,
        totalPages,
      },
    };
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
    } catch (err) {
      console.warn(`[jobApi] Lỗi getJobById(${id}) từ API, thử tìm trong mock:`, err.message);
    }

    const found = MOCK_JOBS.find((j) => j.id === id || j.jobId === id);
    return found ? formatJobData(found) : null;
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
    try {
      const params = { page, limit };
      if (status && status !== 'ALL') params.status = status;
      if (search && search.trim()) params.search = search.trim();

      const response = await apiClient.get('/jobs/my-jobs', { params });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[jobApi] Lỗi getMyJobs từ API, dùng mock data dự phòng:', err.message);
      return this._getMockRecruiterJobs({ status, search, page, limit });
    }
  },

  /**
   * Đăng tin tuyển dụng mới (UC34)
   */
  async createJob(jobData) {
    try {
      const payload = {
        ...jobData,
        requirements: Array.isArray(jobData.requirements)
          ? jobData.requirements.join('\n')
          : (jobData.requirements || ''),
        benefits: Array.isArray(jobData.benefits)
          ? jobData.benefits.join('\n')
          : (jobData.benefits || ''),
        workingHours: jobData.workingHours || 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
        educationLevel: jobData.educationLevel || 'COLLEGE',
        jobLevel: jobData.jobLevel || 'MIDDLE',
        workMode: jobData.workMode || 'HYBRID',
        employmentType: jobData.employmentType || 'FULL_TIME',
        salaryType: jobData.salaryType || 'RANGE',
      };
      const response = await apiClient.post('/jobs', payload);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[jobApi] Lỗi createJob từ API, lưu vào mock data:', err.message);
      return this._createMockRecruiterJob(jobData);
    }
  },

  /**
   * Cập nhật thông tin tin tuyển dụng (UC36)
   */
  async updateJob(jobId, jobData) {
    try {
      const payload = {
        ...jobData,
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
      console.warn(`[jobApi] Lỗi updateJob(${jobId}), cập nhật mock:`, err.message);
      return this._updateMockRecruiterJob(jobId, jobData);
    }
  },

  /**
   * Đóng hoặc mở lại nhận hồ sơ ứng tuyển (UC37)
   */
  async toggleJobStatus(jobId, newStatus) {
    try {
      const response = await apiClient.patch(`/jobs/${jobId}/status`, { status: newStatus });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[jobApi] Lỗi toggleJobStatus(${jobId}), cập nhật mock:`, err.message);
      return this._toggleMockJobStatus(jobId, newStatus);
    }
  },

  /**
   * Xóa tin tuyển dụng (UC37)
   */
  async deleteJob(jobId) {
    try {
      const response = await apiClient.delete(`/jobs/${jobId}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[jobApi] Lỗi deleteJob(${jobId}), xóa khỏi mock:`, err.message);
      return this._deleteMockRecruiterJob(jobId);
    }
  },

  /**
   * Thống kê số lượng tin đăng cho Recruiter Dashboard
   */
  async getRecruiterJobMetrics() {
    const res = await this.getMyJobs({ limit: 100 });
    const jobs = res.data || [];
    return {
      total: jobs.length,
      published: jobs.filter((j) => j.status === 'PUBLISHED').length,
      draft: jobs.filter((j) => j.status === 'DRAFT').length,
      closed: jobs.filter((j) => j.status === 'CLOSED').length,
      expired: jobs.filter((j) => j.status === 'EXPIRED').length,
      totalApplications: jobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0),
      totalViews: jobs.reduce((acc, curr) => acc + (curr.viewCount || 0), 0),
    };
  },

  // ── MOCK DATA HELPERS CHO RECRUITER KHI OFFLINE ───────────────────────────
  _getMockRecruiterJobs({ status = 'ALL', search = '', page = 1, limit = 8 } = {}) {
    let list = [..._MOCK_RECRUITER_JOBS_STORE];

    if (status && status !== 'ALL') {
      list = list.filter((j) => j.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.skills && j.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  _createMockRecruiterJob(jobData) {
    const newId = `rjob-${Date.now()}`;
    const salaryText =
      jobData.salaryType === 'RANGE' && jobData.salaryMin && jobData.salaryMax
        ? `${Number(jobData.salaryMin) / 1000000} – ${Number(jobData.salaryMax) / 1000000} triệu`
        : 'Thỏa thuận';

    const newJob = {
      ...jobData,
      id: newId,
      jobId: newId,
      salary: salaryText,
      status: jobData.status || 'PUBLISHED',
      viewCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    _MOCK_RECRUITER_JOBS_STORE.unshift(newJob);
    return newJob;
  },

  _updateMockRecruiterJob(jobId, jobData) {
    const idx = _MOCK_RECRUITER_JOBS_STORE.findIndex((j) => j.id === jobId || j.jobId === jobId);
    if (idx !== -1) {
      _MOCK_RECRUITER_JOBS_STORE[idx] = {
        ..._MOCK_RECRUITER_JOBS_STORE[idx],
        ...jobData,
        updatedAt: new Date().toISOString(),
      };
      return _MOCK_RECRUITER_JOBS_STORE[idx];
    }
    return null;
  },

  _toggleMockJobStatus(jobId, newStatus) {
    const idx = _MOCK_RECRUITER_JOBS_STORE.findIndex((j) => j.id === jobId || j.jobId === jobId);
    if (idx !== -1) {
      const currentStatus = _MOCK_RECRUITER_JOBS_STORE[idx].status;
      const targetStatus = newStatus || (currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED');
      _MOCK_RECRUITER_JOBS_STORE[idx].status = targetStatus;
      _MOCK_RECRUITER_JOBS_STORE[idx].updatedAt = new Date().toISOString();
      return _MOCK_RECRUITER_JOBS_STORE[idx];
    }
    return null;
  },

  _deleteMockRecruiterJob(jobId) {
    _MOCK_RECRUITER_JOBS_STORE = _MOCK_RECRUITER_JOBS_STORE.filter(
      (j) => j.id !== jobId && j.jobId !== jobId
    );
    return { success: true, message: 'Đã xóa tin tuyển dụng' };
  },
};

// Khởi tạo kho dữ liệu mock bền vững trong phiên chạy
let _MOCK_RECRUITER_JOBS_STORE = [
  {
    id: 'rjob-1',
    jobId: 'rjob-1',
    title: 'Senior Frontend Engineer (React / TypeScript)',
    occupationId: 'it',
    industry: 'Công nghệ thông tin',
    jobLevel: 'SENIOR',
    level: 'Chuyên viên cao cấp',
    workMode: 'HYBRID',
    workplaceType: 'Hybrid',
    employmentType: 'FULL_TIME',
    salaryType: 'RANGE',
    salaryMin: 25000000,
    salaryMax: 40000000,
    salary: '25 – 40 triệu',
    province: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Quận 1',
    quantity: 3,
    deadline: '2026-12-15',
    experience: '3 - 5 năm',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Zustand', 'Next.js'],
    tags: ['React', 'TypeScript', 'Zustand'],
    description: 'Chịu trách nhiệm thiết kế, phát triển và tối ưu hóa hệ thống giao diện Web B2B/B2C quy mô lớn. Làm việc chặt chẽ với UI/UX Designer và Backend team để đảm bảo trải nghiệm người dùng mượt mà nhất.',
    requirements: [
      'Tối thiểu 3 năm kinh nghiệm lập trình chuyên sâu với ReactJS, TypeScript.',
      'Thành thạo tối ưu hiệu năng frontend (Web Vitals, code-splitting, caching).',
      'Có tư duy thẩm mỹ tốt, làm chủ TailwindCSS và Framer Motion.',
    ],
    benefits: [
      'Lương tháng 13 + thưởng KPI quý hấp dẫn.',
      'Gói bảo hiểm sức khỏe PVI Premium cho cả gia đình.',
      'Cấp MacBook Pro M3 Max và màn hình 4K làm việc.',
    ],
    status: 'PUBLISHED',
    viewCount: 480,
    applicationsCount: 14,
    createdAt: '2026-10-18T09:00:00.000Z',
    updatedAt: '2026-11-01T14:30:00.000Z',
  },
  {
    id: 'rjob-2',
    jobId: 'rjob-2',
    title: 'Backend Node.js & Microservices Engineer',
    occupationId: 'it',
    industry: 'Công nghệ thông tin',
    jobLevel: 'MIDDLE',
    level: 'Chuyên viên',
    workMode: 'HYBRID',
    workplaceType: 'Hybrid',
    employmentType: 'FULL_TIME',
    salaryType: 'RANGE',
    salaryMin: 20000000,
    salaryMax: 32000000,
    salary: '20 – 32 triệu',
    province: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Quận 1',
    quantity: 2,
    deadline: '2026-12-20',
    experience: '2 - 3 năm',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'RabbitMQ', 'Docker'],
    tags: ['Node.js', 'PostgreSQL', 'Docker'],
    description: 'Xây dựng và duy trì các dịch vụ Microservices xử lý khối lượng lớn truy vấn người dùng. Thiết kế RESTful API và đồng bộ dữ liệu qua Event-driven architecture.',
    requirements: [
      'Có từ 2 năm kinh nghiệm thực chiến với Node.js / TypeScript.',
      'Thành thạo cơ sở dữ liệu PostgreSQL, Redis và Message Queue (RabbitMQ).',
      'Hiểu biết sâu về containerization với Docker & CI/CD.',
    ],
    benefits: [
      'Lương cạnh tranh, xét tăng lương 2 lần/năm.',
      'Trợ cấp ăn trưa, gửi xe và teambuilding định kỳ.',
      'Hỗ trợ kinh phí thi các chứng chỉ AWS / Cloud quốc tế.',
    ],
    status: 'PUBLISHED',
    viewCount: 310,
    applicationsCount: 8,
    createdAt: '2026-10-22T10:15:00.000Z',
    updatedAt: '2026-11-02T16:00:00.000Z',
  },
  {
    id: 'rjob-3',
    jobId: 'rjob-3',
    title: 'Senior Product Designer (UI/UX)',
    occupationId: 'design',
    industry: 'Thiết kế / Sáng tạo',
    jobLevel: 'SENIOR',
    level: 'Chuyên viên cao cấp',
    workMode: 'REMOTE',
    workplaceType: 'Từ xa',
    employmentType: 'FULL_TIME',
    salaryType: 'NEGOTIABLE',
    salary: 'Thỏa thuận',
    province: 'TP. Hồ Chí Minh',
    address: 'Làm việc từ xa (Toàn quốc)',
    quantity: 1,
    deadline: '2026-11-30',
    experience: '3 - 5 năm',
    skills: ['Figma', 'Design System', 'User Research', 'Prototyping'],
    tags: ['Figma', 'UI/UX', 'Remote'],
    description: 'Dẫn dắt thiết kế trải nghiệm người dùng toàn diện cho phân hệ tuyển dụng và ứng tuyển. Xây dựng và duy trì Design System đồng bộ.',
    requirements: [
      'Portfolio thể hiện các sản phẩm Web/App SaaS thực tế có chiều sâu.',
      'Làm chủ công cụ Figma, Auto-layout, Variables và Component Sets.',
      'Khả năng nghiên cứu người dùng và diễn giải dữ liệu hành vi (User journey).',
    ],
    benefits: [
      'Thời gian làm việc tự do, 100% Remote linh hoạt.',
      'Trang bị bản quyền công cụ thiết kế chuyên nghiệp.',
      'Chế độ nghỉ phép 16 ngày/năm.',
    ],
    status: 'PUBLISHED',
    viewCount: 220,
    applicationsCount: 5,
    createdAt: '2026-10-25T08:30:00.000Z',
    updatedAt: '2026-11-03T11:00:00.000Z',
  },
  {
    id: 'rjob-4',
    jobId: 'rjob-4',
    title: 'DevOps & Cloud Infrastructure Specialist',
    occupationId: 'it',
    industry: 'Công nghệ thông tin',
    jobLevel: 'MIDDLE',
    level: 'Chuyên viên',
    workMode: 'ONSITE',
    workplaceType: 'Tại văn phòng',
    employmentType: 'FULL_TIME',
    salaryType: 'RANGE',
    salaryMin: 22000000,
    salaryMax: 35000000,
    salary: '22 – 35 triệu',
    province: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Quận 1',
    quantity: 1,
    deadline: '2026-12-31',
    experience: '2 - 4 năm',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
    tags: ['DevOps', 'AWS', 'Kubernetes'],
    description: 'Vận hành hạ tầng đám mây AWS và cụm Kubernetes phục vụ microservices. Giám sát độ trễ hệ thống và bảo mật dữ liệu.',
    requirements: [
      'Thành thạo Kubernetes, Docker, Helm charts.',
      'Kinh nghiệm cấu hình pipeline CI/CD GitHub Actions / GitLab CI.',
    ],
    benefits: ['Bảo hiểm sức khỏe', 'Thưởng dự án', 'Du lịch hàng năm'],
    status: 'DRAFT',
    viewCount: 0,
    applicationsCount: 0,
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'rjob-5',
    jobId: 'rjob-5',
    title: 'Chuyên viên Tuyển dụng Nhân tài (IT Recruiter)',
    occupationId: 'hr',
    industry: 'Nhân sự',
    jobLevel: 'JUNIOR',
    level: 'Nhân viên',
    workMode: 'ONSITE',
    workplaceType: 'Tại văn phòng',
    employmentType: 'FULL_TIME',
    salaryType: 'RANGE',
    salaryMin: 12000000,
    salaryMax: 18000000,
    salary: '12 – 18 triệu',
    province: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Quận 1',
    quantity: 2,
    deadline: '2026-10-30',
    experience: '1 - 2 năm',
    skills: ['Talent Sourcing', 'Interviewing', 'Headhunting', 'LinkedIn Recruiter'],
    tags: ['Recruiter', 'HR', 'IT'],
    description: 'Tìm kiếm và kết nối các kỹ sư phần mềm tài năng cho các dự án công nghệ của TechFlow. Quản lý luồng phỏng vấn và chăm sóc ứng viên.',
    requirements: ['Tối thiểu 1 năm kinh nghiệm tuyển dụng mảng IT phần mềm.'],
    benefits: ['Hoa hồng tuyển dụng theo đầu mối (Commission)', 'Đào tạo kỹ năng'],
    status: 'CLOSED',
    viewCount: 390,
    applicationsCount: 16,
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-10-31T17:00:00.000Z',
  },
];

export default jobApi;
