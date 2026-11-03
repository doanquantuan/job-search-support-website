import { create } from 'zustand';
import { companyApi } from '../features/company/services/companyApi';

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

  // ── 4. Quản lý theo dõi công ty (Persistence qua localStorage) ──
  followedCompanyIds: JSON.parse(localStorage.getItem('followed_companies')) || [],

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
      const [companyData, similarData] = await Promise.all([
        companyApi.getCompanyById(id),
        companyApi.getSimilarCompanies(id, 3),
      ]);

      set({
        currentCompany: companyData,
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

  // ── Action: Bật/Tắt theo dõi công ty ──
  toggleFollowCompany: (companyId) => {
    const { followedCompanyIds } = get();
    const isFollowed = followedCompanyIds.includes(companyId);
    const updated = isFollowed
      ? followedCompanyIds.filter((id) => id !== companyId)
      : [...followedCompanyIds, companyId];

    localStorage.setItem('followed_companies', JSON.stringify(updated));
    set({ followedCompanyIds: updated });
    return !isFollowed; // Trả về trạng thái mới (true: vừa follow, false: vừa unfollow)
  },

  isFollowing: (companyId) => {
    return get().followedCompanyIds.includes(companyId);
  },
}));
