import { apiClient } from '@/lib/apiClient';
import { MOCK_JOBS } from '../data/mockJobs';

// Cache đơn giản ở client để tránh gọi API company nhiều lần
const companyCache = new Map();

// Helper format dữ liệu trả về từ backend API chuẩn hoá sang frontend model
export const formatJobData = (raw) => {
  if (!raw) return null;

  const id = raw.jobId || raw.id;
  const title = raw.title || 'Vị trí tuyển dụng';
  const province = raw.province || raw.location || 'Toàn quốc';
  const address = raw.address || province;

  // Xử lý mức lương hiển thị
  let salaryText = 'Thỏa thuận';
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
  } else if (typeof raw.salary === 'string') {
    salaryText = raw.salary;
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

  // Xử lý kinh nghiệm
  let experience = 'Không yêu cầu kinh nghiệm';
  if (raw.experienceMin !== null && raw.experienceMin !== undefined && raw.experienceMax !== null && raw.experienceMax !== undefined) {
    experience = `${raw.experienceMin} – ${raw.experienceMax} năm`;
  } else if (raw.experienceMin) {
    experience = `Từ ${raw.experienceMin} năm`;
  } else if (raw.experience) {
    experience = raw.experience;
  }

  // Tên công ty: Ưu tiên raw.companyName hoặc raw.company.name
  const companyName = raw.companyName || raw.company?.name || raw.company?.companyName || 'Doanh nghiệp tuyển dụng';
  const companyLogo = raw.companyLogo || raw.company?.logo || null;

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
      filtered = filtered.filter((job) => {
        if (salary === 'deal') return job.salaryRange?.isNegotiable;
        if (salary === 'under_10') return (job.salaryRange?.max || 0) <= 10;
        if (salary === '10_15') return (job.salaryRange?.min || 0) >= 10 && (job.salaryRange?.max || 0) <= 15;
        if (salary === '15_25') return (job.salaryRange?.min || 0) <= 25 && (job.salaryRange?.max || 0) >= 15;
        if (salary === '25_50') return (job.salaryRange?.min || 0) <= 50 && (job.salaryRange?.max || 0) >= 25;
        if (salary === 'over_50') return (job.salaryRange?.min || 0) >= 50 || (job.salaryRange?.max || 0) >= 50;
        return true;
      });
    }

    if (experience && experience !== 'all') {
      filtered = filtered.filter((job) => job.experience === experience);
    }

    if (workType && workType !== 'all') {
      filtered = filtered.filter((job) =>
        job.employmentType === workType || job.workplaceType === workType || job.tags?.includes(workType)
      );
    }

    if (industry && industry !== 'all') {
      filtered = filtered.filter((job) => job.industry === industry);
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
};

export default jobApi;
