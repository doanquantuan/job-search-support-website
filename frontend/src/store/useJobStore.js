import { create } from 'zustand';
import { jobApi } from '../features/job/services/jobApi';

const SAVED_JOBS_KEY = 'saved_jobs_ids';

const getInitialSavedJobs = () => {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useJobStore = create((set, get) => ({
  // ── 1. Danh sách việc làm & Phân trang (10 việc làm / trang) ──
  jobs: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 10,
  loading: false,
  error: null,

  // ── 2. Từ khóa tìm kiếm (Search Bar) ──
  keyword: '',
  location: '',

  // ── 3. Bộ lọc nâng cao (Filter Bar) ──
  filters: {
    salary: 'all',
    experience: 'all',
    workType: 'all',
    industry: 'all',
    level: 'all',
  },

  // ── 4. Sắp xếp ──
  sortBy: 'newest', // 'newest' | 'salary_high' | 'salary_low' | 'deadline_near'

  // ── 5. Lưu việc làm (Bookmarks) ──
  savedJobIds: getInitialSavedJobs(),

  // ── 6. Chi tiết việc làm (Job Detail Page) ──
  currentJob: null,
  similarJobs: [],
  detailLoading: false,
  detailError: null,

  // Modal ứng tuyển nhanh
  selectedJob: null,

  // ── Actions cập nhật tiêu chí tìm kiếm ──
  setKeyword: (keyword) => set({ keyword }),
  setLocation: (location) => set({ location }),

  setFilter: (filterKey, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterKey]: value,
      },
      currentPage: 1,
    }));
    get().fetchJobs();
  },

  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
    get().fetchJobs();
  },

  setCurrentPage: (currentPage) => {
    set({ currentPage });
    get().fetchJobs();
  },

  setSelectedJob: (selectedJob) => set({ selectedJob }),

  // Đặt lại toàn bộ bộ lọc về mặc định
  resetFilters: () => {
    set({
      keyword: '',
      location: '',
      filters: {
        salary: 'all',
        experience: 'all',
        workType: 'all',
        industry: 'all',
        level: 'all',
      },
      sortBy: 'newest',
      currentPage: 1,
    });
    get().fetchJobs();
  },

  // Lưu / Bỏ lưu tin tuyển dụng
  toggleSaveJob: async (jobId) => {
    const { savedJobIds } = get();
    const isSaved = savedJobIds.includes(jobId);
    const updated = isSaved
      ? savedJobIds.filter((id) => id !== jobId)
      : [...savedJobIds, jobId];

    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Lỗi lưu vào localStorage:', e);
    }

    set({ savedJobIds: updated });

    // Đồng bộ với máy chủ (API /saved-jobs/:jobId)
    try {
      if (isSaved) {
        await jobApi.unsaveJob(jobId);
      } else {
        await jobApi.saveJob(jobId);
      }
    } catch (err) {
      console.warn('[useJobStore] Không thể đồng bộ trạng thái lưu tin với máy chủ:', err.message);
    }
  },

  // Đồng bộ danh sách tin đã lưu từ API máy chủ
  fetchSavedJobs: async () => {
    try {
      const res = await jobApi.getSavedJobs({ limit: 100 });
      const items = res?.items || (Array.isArray(res) ? res : []);
      const serverIds = items.map((i) => i.jobId || i.jobPost?.id || i.id).filter(Boolean);
      if (serverIds.length > 0) {
        set({ savedJobIds: serverIds });
        try {
          localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(serverIds));
        } catch {}
      }
      return items;
    } catch (err) {
      console.warn('[useJobStore] Không thể tải danh sách việc làm đã lưu từ API:', err.message);
      return [];
    }
  },

  isJobSaved: (jobId) => {
    return get().savedJobIds.includes(jobId);
  },

  // ── Async Action: Lấy danh sách việc làm từ API ──
  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const {
        keyword,
        location,
        filters,
        sortBy,
        currentPage,
        itemsPerPage,
      } = get();

      const res = await jobApi.getJobs({
        keyword,
        location,
        salary: filters.salary,
        experience: filters.experience,
        workType: filters.workType,
        industry: filters.industry,
        level: filters.level,
        sortBy,
        page: currentPage,
        limit: itemsPerPage,
      });

      set({
        jobs: res.data || [],
        totalCount: res.pagination?.total || 0,
        totalPages: res.pagination?.totalPages || 1,
        currentPage: res.pagination?.page || 1,
        loading: false,
      });
    } catch (err) {
      console.error('Lỗi khi fetchJobs:', err);
      set({
        loading: false,
        error: 'Không thể tải danh sách việc làm. Vui lòng thử lại sau.',
      });
    }
  },

  // ── Async Action: Lấy chi tiết việc làm theo ID từ API ──
  fetchJobDetail: async (jobId) => {
    set({ detailLoading: true, detailError: null, currentJob: null });
    try {
      const [job, similar] = await Promise.all([
        jobApi.getJobById(jobId),
        jobApi.getSimilarJobs(jobId, 4),
      ]);

      if (!job) {
        throw new Error('Không tìm thấy thông tin tin tuyển dụng');
      }

      set({
        currentJob: job,
        similarJobs: similar || [],
        detailLoading: false,
      });
    } catch (err) {
      console.error(`Lỗi khi fetchJobDetail(${jobId}):`, err);
      set({
        detailLoading: false,
        detailError: err.message || 'Lỗi khi tải chi tiết tin tuyển dụng',
      });
    }
  },
}));
