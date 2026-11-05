import { apiClient } from '@/lib/apiClient';
import { matchCompanyByIndustry } from '@/constants/categories';

// Helper chuẩn hóa dữ liệu công ty từ backend API thật
export const formatCompanyData = (raw) => {
  if (!raw) return null;
  const id = raw.companyId || raw.id;
  const name = raw.companyName || raw.name || 'Doanh nghiệp';
  const province = raw.province || raw.location || 'Chưa cập nhật';
  const address = raw.address || province;
  const rawSize = raw.companySize || raw.size;
  const sizeLabelMap = {
    SIZE_1_50: '1 - 50 nhân viên',
    SIZE_51_200: '51 - 200 nhân viên',
    SIZE_201_500: '201 - 500 nhân viên',
    SIZE_501_1000: '501 - 1.000 nhân viên',
    SIZE_1001_5000: '1.000+ nhân viên',
  };
  const size = sizeLabelMap[rawSize] || rawSize || '50+ nhân viên';
  const industry = raw.industry || 'Công nghệ thông tin';
  const isVerified = raw.verificationStatus === 'APPROVED';
  const isFeatured = Boolean(raw.isFeatured || isVerified);

  return {
    id,
    companyId: id,
    name,
    companyName: name,
    logo: raw.logo || null,
    industry,
    size,
    companySize: rawSize,
    sizeRange: raw.sizeRange || rawSize,
    description: raw.description || 'Công ty hiện chưa cập nhật phần giới thiệu chi tiết.',
    location: province,
    province,
    address,
    website: raw.website || null,
    email: raw.email || null,
    phone: raw.phone || null,
    taxCode: raw.taxCode || null,
    verificationStatus: raw.verificationStatus || 'APPROVED',
    isVerified,
    isFeatured,
    rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 0,
    activeJobsCount: typeof raw.activeJobsCount === 'number' ? raw.activeJobsCount : (raw.jobs ? raw.jobs.length : 0),
    tags: raw.tags && Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags
      : [industry, province].filter(Boolean),
    coverImage: raw.coverImage || null,
    workingDays: raw.workingDays || 'Thứ 2 - Thứ 6',
    companyType: raw.companyType || 'Doanh nghiệp',
    founded: raw.founded || (raw.createdAt ? new Date(raw.createdAt).getFullYear() : '2020'),
    keySkills: raw.keySkills || [],
    benefits: raw.benefits || [],
    jobs: raw.jobs || [],
    reviews: raw.reviews || [],
    cultureGallery: raw.cultureGallery || [],
  };
};

export const companyApi = {
  // Lấy danh sách công ty từ backend API thật với tìm kiếm & phân trang
  async getCompanies({
    search = '',
    location = '',
    industry = [],
    size = [],
    minRating = 0,
    sortBy = 'default',
    filterTag = 'all',
    page = 1,
    limit = 6,
  } = {}) {
    try {
      const params = {
        page,
        limit,
      };
      if (search && search.trim()) params.search = search.trim();
      if (location && location !== 'all') params.location = location;
      if (industry && industry.length > 0) params.industry = industry[0];
      if (size && size.length > 0) params.size = size[0];
      if (sortBy && sortBy !== 'default') params.sortBy = sortBy;

      const response = await apiClient.get('/companies', { params });
      const responseData = response.data?.data || response.data;
      const rawList = Array.isArray(responseData) 
        ? responseData 
        : (responseData.companies || responseData.data || []);
      const pagination = responseData.pagination || {
        total: rawList.length,
        page,
        limit,
        totalPages: Math.ceil(rawList.length / limit) || 1,
      };

      let formatted = rawList.map(formatCompanyData);

      if (filterTag === 'featured') {
        formatted = formatted.filter((c) => c.isFeatured);
      } else if (filterTag && filterTag !== 'all') {
        formatted = formatted.filter((c) => matchCompanyByIndustry(c, filterTag));
      }

      return {
        data: formatted,
        pagination,
      };
    } catch (err) {
      console.error('Lỗi khi tải danh sách công ty từ API:', err.message);
      return {
        data: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      };
    }
  },

  // Lấy chi tiết 1 công ty theo ID từ backend API thật
  async getCompanyById(id) {
    try {
      const response = await apiClient.get('/companies/' + id);
      const raw = response.data?.data || response.data;
      return formatCompanyData(raw);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết công ty từ API:', err.message);
      throw err;
    }
  },

  // Lấy các công ty khác (loại trừ ID hiện tại)
  async getSimilarCompanies(currentId, limit = 3) {
    try {
      const res = await this.getCompanies({ page: 1, limit: limit + 1 });
      return (res.data || []).filter((c) => c.id !== currentId).slice(0, limit);
    } catch {
      return [];
    }
  },
};

export default companyApi;
