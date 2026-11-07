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

  // =========================================================
  // Dành riêng cho Nhà tuyển dụng (Recruiter Portal)
  // =========================================================

  // 1. Lấy trạng thái xác thực doanh nghiệp (UC30)
  async getVerificationStatus() {
    try {
      const response = await apiClient.get('/companies/verification/status');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[companyApi] Lỗi getVerificationStatus, dùng demo fallback:', err.message);
      return {
        companyId: 'comp-1',
        companyName: 'TechFlow Corporation',
        taxCode: '0316892345',
        companySize: 'SIZE_51_200',
        industry: 'Công nghệ thông tin & Phần mềm',
        province: 'TP. Hồ Chí Minh',
        address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Quận 1',
        email: 'contact@techflow.example.com',
        phone: '028 3822 9999',
        verificationStatus: 'APPROVED', // 'PENDING' | 'APPROVED' | 'REJECTED'
        submittedAt: '2026-10-15T08:30:00.000Z',
        verifiedAt: '2026-10-16T14:20:00.000Z',
        reviewedAt: '2026-10-16T14:20:00.000Z',
        businessLicenseUrl: 'https://example.com/mock-license.pdf',
        rejectionReason: null,
        rejectReason: null,
        canUpdate: false,
      };
    }
  },

  // 2. Đăng ký xác thực doanh nghiệp mới (UC29)
  async registerVerification(formData) {
    const response = await apiClient.post('/companies/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  // 3. Cập nhật hồ sơ xác thực doanh nghiệp khi bị từ chối (UC31)
  async updateVerification(formData) {
    const response = await apiClient.put('/companies/verification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  // 4. Lấy thông tin công ty nội bộ của Recruiter (UC32)
  async getMyCompany() {
    try {
      const response = await apiClient.get('/companies/my-company');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[companyApi] Lỗi getMyCompany, dùng demo fallback:', err.message);
      return {
        id: 'comp-1',
        companyId: 'comp-1',
        name: 'TechFlow Corporation',
        companyName: 'TechFlow Corporation',
        taxCode: '0316892345',
        companySize: 'SIZE_51_200',
        industry: 'Công nghệ thông tin & Phần mềm',
        description: 'TechFlow Corporation là doanh nghiệp tiên phong phát triển các giải pháp phần mềm, chuyển đổi số và nền tảng hỗ trợ tuyển dụng nhân sự chất lượng cao tại Việt Nam.',
        website: 'https://techflow.example.com',
        email: 'contact@techflow.example.com',
        phone: '028 3822 9999',
        province: 'TP. Hồ Chí Minh',
        address: 'Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Bến Nghé, Quận 1',
        logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=160&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
        workingDays: 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
        verificationStatus: 'APPROVED',
        isVerified: true,
        benefits: [
          'Lương tháng 13 và thưởng hiệu quả kinh doanh',
          'Gói bảo hiểm sức khỏe cao cấp dành riêng cho nhân viên',
          'Trang bị máy tính làm việc cấu hình cao (MacBook Pro / Dell XPS)',
          'Du lịch công ty thường niên và hoạt động thể thao gắn kết',
          'Chế độ làm việc kết hợp linh hoạt (Hybrid Working)',
        ],
      };
    }
  },

  // 5. Cập nhật thông tin công ty của Recruiter (UC33)
  async updateMyCompany(formData) {
    const response = await apiClient.put('/companies/my-company', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  // 6. Lấy Presigned URL xem giấy phép kinh doanh
  async getLicenseUrl() {
    try {
      const response = await apiClient.get('/companies/my-company/license-url');
      return response.data?.data || response.data;
    } catch {
      return { url: 'https://example.com/mock-license.pdf' };
    }
  },
};

export default companyApi;
