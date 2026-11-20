import { create } from 'zustand';
import { companyApi } from '../features/company/services/companyApi';
import { jobApi } from '../features/job/services/jobApi';
import { useAuthStore } from './useAuthStore';
import { toast } from './useToastStore';

const getInitialFollowedCompanies = () => {
  try {
    const raw = localStorage.getItem('followed_companies');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useCompanyStore = create((set, get) => ({
  // ── 1. Danh sách công ty ──
  companies: [],
  totalCount: 0,
  totalPages: 1,
  loading: false,
  error: null,

  // ── 2. Phân trang & Bộ lọc tìm kiếm ──
  currentPage: 1,
  itemsPerPage: 6,
  searchTerm: '',
  location: 'all',
  activeTab: 'all',
  selectedIndustries: [],
  selectedSizes: [],
  selectedMinRating: 0,
  sortBy: 'default',

  // ── 3. Chi tiết công ty ──
  currentCompany: null,
  similarCompanies: [],
  detailLoading: false,
  detailError: null,

  // ── 4. Quản lý theo dõi công ty (Persistence qua Backend & localStorage) ──
  followedCompanyIds: getInitialFollowedCompanies(),
  followingList: [],
  followingLoading: false,
  followingTotal: 0,

  // ── Actions cập nhật bộ lọc ──
  setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
  setLocation: (location) => set({ location, currentPage: 1 }),
  setActiveTab: (activeTab) => {
    let location = 'all';
    if (activeTab === 'Hà Nội' || activeTab === 'TP. Hồ Chí Minh') {
      location = activeTab;
    }
    set({ activeTab, location, currentPage: 1 });
  },
  setSelectedIndustries: (selectedIndustries) => set({ selectedIndustries, currentPage: 1 }),
  setSelectedSizes: (selectedSizes) => set({ selectedSizes, currentPage: 1 }),
  setSelectedMinRating: (selectedMinRating) => set({ selectedMinRating, currentPage: 1 }),
  setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  setHeroSearch: ({ search, location }) => set({
    searchTerm: search,
    location: location || 'all',
    currentPage: 1,
  }),

  resetFilters: () => set({
    searchTerm: '',
    location: 'all',
    activeTab: 'all',
    selectedIndustries: [],
    selectedSizes: [],
    selectedMinRating: 0,
    sortBy: 'default',
    currentPage: 1,
  }),

  // ── Async Action: Lấy danh sách công ty ──
  fetchCompanies: async () => {
    const {
      searchTerm,
      location,
      activeTab,
      selectedIndustries,
      selectedSizes,
      selectedMinRating,
      sortBy,
      currentPage,
      itemsPerPage,
    } = get();

    set({ loading: true, error: null });

    try {
      let effectiveLocation = location;
      let effectiveFilterTag = activeTab;

      if (activeTab === 'Hà Nội' || activeTab === 'TP. Hồ Chí Minh') {
        effectiveLocation = activeTab;
        effectiveFilterTag = 'all';
      }

      const result = await companyApi.getCompanies({
        search: searchTerm,
        location: effectiveLocation,
        industry: selectedIndustries,
        size: selectedSizes,
        minRating: selectedMinRating,
        sortBy,
        filterTag: effectiveFilterTag,
        page: currentPage,
        limit: itemsPerPage,
      });

      set({
        companies: result.data || [],
        totalCount: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || Math.ceil((result.pagination?.total || 0) / itemsPerPage) || 1,
        loading: false,
      });
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty:', err);
      set({
        error: err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách công ty',
        loading: false,
      });
    }
  },

  // ── Async Action: Lấy chi tiết công ty ──
  fetchCompanyDetail: async (id) => {
    if (!id) return;
    set({ detailLoading: true, detailError: null });

    try {
      const [companyData, similarData, companyJobs] = await Promise.all([
        companyApi.getCompanyById(id),
        companyApi.getSimilarCompanies(id, 3),
        jobApi.getJobsByCompanyId(id, 50),
      ]);

      const jobs = Array.isArray(companyJobs) ? companyJobs : [];

      set({
        currentCompany: {
          ...companyData,
          jobs,
          activeJobsCount: jobs.length || companyData?.activeJobsCount || 0,
        },
        similarCompanies: similarData,
        detailLoading: false,
      });
    } catch (err) {
      console.error('Lỗi khi tải chi tiết công ty:', err);
      set({
        detailError: err?.response?.data?.message || err.message || 'Không tìm thấy thông tin công ty',
        detailLoading: false,
      });
    }
  },

  clearCurrentCompany: () => set({ currentCompany: null, similarCompanies: [], detailError: null }),

  // ── Đồng bộ danh sách công ty đã theo dõi từ server ──
  fetchFollowedCompanies: async () => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated || user?.role === 'RECRUITER') return;

    try {
      const res = await companyApi.getFollowingCompanies({ limit: 100 });
      const items = res?.data || (Array.isArray(res) ? res : []);
      const ids = items.map((c) => c.companyId || c.id).filter(Boolean);
      set({ followedCompanyIds: ids });
      try {
        localStorage.setItem('followed_companies', JSON.stringify(ids));
      } catch (e) {
        console.warn('Không thể lưu followed_companies vào localStorage:', e);
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ danh sách theo dõi công ty:', err?.message);
    }
  },

  // ── Lấy chi tiết danh sách công ty đang theo dõi (cho trang FollowingCompaniesPage) ──
  fetchFollowingCompaniesPage: async (params = {}) => {
    set({ followingLoading: true });
    try {
      const res = await companyApi.getFollowingCompanies(params);
      const items = res?.data || (Array.isArray(res) ? res : []);
      const pagination = res?.pagination || { total: items.length, totalPages: 1 };
      set({
        followingList: items,
        followingTotal: pagination.total || items.length,
        followingLoading: false,
      });
      return items;
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty theo dõi:', err);
      set({ followingList: [], followingTotal: 0, followingLoading: false });
      return [];
    }
  },

  // ── Action: Bật/Tắt theo dõi công ty (có đồng bộ Backend & kiểm tra Auth) ──
  toggleFollowCompany: async (companyId, companyName = '') => {
    if (!companyId) return false;

    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.warning('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để theo dõi công ty này.');
      return false;
    }

    if (user?.role === 'RECRUITER') {
      toast.info('Thông báo', 'Tài khoản nhà tuyển dụng không thể theo dõi công ty.');
      return false;
    }

    const { followedCompanyIds, followingList } = get();
    const isCurrentlyFollowed = followedCompanyIds.includes(companyId);

    // Optimistic update
    const nextIds = isCurrentlyFollowed
      ? followedCompanyIds.filter((id) => id !== companyId)
      : [...followedCompanyIds, companyId];

    set({ followedCompanyIds: nextIds });
    try {
      localStorage.setItem('followed_companies', JSON.stringify(nextIds));
    } catch (e) {
      console.warn('Không thể lưu followed_companies vào localStorage:', e);
    }

    try {
      if (isCurrentlyFollowed) {
        await companyApi.unfollowCompany(companyId);
        set({
          followingList: followingList.filter((c) => (c.companyId || c.id) !== companyId),
        });
        toast.success('Hủy theo dõi', `Bạn đã hủy theo dõi ${companyName || 'công ty'}.`);
        return false;
      } else {
        await companyApi.followCompany(companyId);
        toast.success(
          'Đã theo dõi',
          `Bạn sẽ nhận được thông báo khi ${companyName || 'công ty'} có tin tuyển dụng mới!`
        );
        return true;
      }
    } catch (error) {
      console.error('Lỗi khi thao tác theo dõi công ty:', error);
      set({ followedCompanyIds });
      try {
        localStorage.setItem('followed_companies', JSON.stringify(followedCompanyIds));
      } catch (e) {
        console.warn('Rollback localStorage failed:', e);
      }
      toast.error('Lỗi', error.response?.data?.message || 'Không thể cập nhật theo dõi. Vui lòng thử lại!');
      return isCurrentlyFollowed;
    }
  },

  isFollowing: (companyId) => {
    return get().followedCompanyIds.includes(companyId);
  },
}));
