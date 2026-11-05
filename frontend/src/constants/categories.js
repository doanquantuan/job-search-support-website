import {
  Briefcase,
  Laptop,
  Megaphone,
  TrendingUp,
  Banknote,
  Users,
  Palette,
  Truck,
  HeartPulse,
  Building2,
  GraduationCap,
  ShoppingBag,
  Factory,
  Shield,
  Languages,
  Tv,
  Radio,
  Wrench,
  Sparkles,
  Clock,
  Compass,
  Headphones,
  FileText,
  Calculator,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

/**
 * MASTER_CATEGORIES
 * Nguồn dữ liệu ngành nghề & danh mục nghề nghiệp duy nhất của toàn bộ hệ thống (Single Source of Truth).
 * Bất kỳ sự thay đổi (thêm, sửa, đổi tên, đổi icon, đổi từ khóa tìm kiếm) chỉ cần chỉnh sửa tại file này.
 */
export const MASTER_CATEGORIES = [
  {
    id: 'it',
    name: 'Công nghệ thông tin',
    shortName: 'IT - Phần mềm',
    keyword: 'Công nghệ thông tin',
    aliases: [
      'it',
      'phần mềm',
      'software',
      'developer',
      'frontend',
      'backend',
      'fullstack',
      'react',
      'node',
      'java',
      'devops',
      'cloud',
      'qa',
      'qc',
      'tester',
      'lập trình',
      'công nghệ thông tin',
    ],
    icon: Laptop,
    badgeColor: 'text-blue-600 bg-blue-50',
    jobCount: '1.200+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'sales',
    name: 'Kinh doanh / Bán hàng',
    shortName: 'Kinh doanh',
    keyword: 'Kinh doanh',
    aliases: [
      'kinh doanh',
      'bán hàng',
      'sales',
      'account executive',
      'telesales',
      'phát triển thị trường',
      'b2b',
      'b2c',
    ],
    icon: TrendingUp,
    badgeColor: 'text-emerald-600 bg-emerald-50',
    jobCount: '850+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'marketing',
    name: 'Marketing / PR / Quảng cáo',
    shortName: 'Marketing',
    keyword: 'Marketing',
    aliases: [
      'marketing',
      'pr',
      'quảng cáo',
      'seo',
      'content',
      'digital marketing',
      'copywriter',
      'truyền thông',
      'social',
    ],
    icon: Megaphone,
    badgeColor: 'text-orange-600 bg-orange-50',
    jobCount: '620+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'customer_service',
    name: 'Chăm sóc khách hàng',
    shortName: 'CSKH',
    keyword: 'Chăm sóc khách hàng',
    aliases: [
      'chăm sóc khách hàng',
      'cskh',
      'customer service',
      'customer care',
      'support',
      'tư vấn',
      'trực tổng đài',
    ],
    icon: Headphones,
    badgeColor: 'text-cyan-600 bg-cyan-50',
    jobCount: '580+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'hr',
    name: 'Nhân sự / Hành chính / Pháp chế',
    shortName: 'Nhân sự',
    keyword: 'Nhân sự',
    aliases: [
      'nhân sự',
      'hành chính',
      'hr',
      'tuyển dụng',
      'c&b',
      'pháp chế',
      'legal',
      'văn phòng',
    ],
    icon: Users,
    badgeColor: 'text-purple-600 bg-purple-50',
    jobCount: '540+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'finance_banking',
    name: 'Tài chính / Ngân hàng',
    shortName: 'Ngân hàng',
    keyword: 'Tài chính',
    aliases: [
      'tài chính',
      'ngân hàng',
      'tín dụng',
      'bank',
      'chứng khoán',
      'đầu tư',
      'finance',
      'quan hệ khách hàng',
    ],
    icon: Banknote,
    badgeColor: 'text-amber-600 bg-amber-50',
    jobCount: '780+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'accounting',
    name: 'Kế toán / Kiểm toán / Thuế',
    shortName: 'Kế toán',
    keyword: 'Kế toán',
    aliases: [
      'kế toán',
      'kiểm toán',
      'thuế',
      'accountant',
      'auditor',
      'sổ sách',
      'báo cáo tài chính',
    ],
    icon: Calculator,
    badgeColor: 'text-emerald-700 bg-emerald-50',
    jobCount: '490+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'design',
    name: 'Thiết kế UI/UX & Đồ họa',
    shortName: 'Thiết kế',
    keyword: 'Thiết kế',
    aliases: [
      'thiết kế',
      'ui',
      'ux',
      'graphic design',
      'đồ họa',
      'photoshop',
      'illustrator',
      'figma',
      'banner',
    ],
    icon: Palette,
    badgeColor: 'text-pink-600 bg-pink-50',
    jobCount: '420+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'logistics',
    name: 'Logistics / Vận tải / Kho vận',
    shortName: 'Logistics',
    keyword: 'Logistics',
    aliases: [
      'logistics',
      'vận tải',
      'kho vận',
      'xuất nhập khẩu',
      'giao nhận',
      'supply chain',
      'chuỗi cung ứng',
      'forwarding',
    ],
    icon: Truck,
    badgeColor: 'text-indigo-600 bg-indigo-50',
    jobCount: '670+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'healthcare',
    name: 'Y tế / Dược phẩm / Sức khỏe',
    shortName: 'Dược phẩm - Y tế',
    keyword: 'Y tế',
    aliases: [
      'y tế',
      'dược phẩm',
      'sức khỏe',
      'bác sĩ',
      'dược sĩ',
      'trình dược viên',
      'pharma',
      'bệnh viện',
      'phòng khám',
    ],
    icon: HeartPulse,
    badgeColor: 'text-teal-600 bg-teal-50',
    jobCount: '350+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'real_estate',
    name: 'Bất động sản & Địa ốc',
    shortName: 'Bất động sản',
    keyword: 'Bất động sản',
    aliases: [
      'bất động sản',
      'địa ốc',
      'nhà đất',
      'môi giới',
      'real estate',
      'bds',
      'property',
      'land',
    ],
    icon: Building2,
    badgeColor: 'text-yellow-700 bg-yellow-50',
    jobCount: '410+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'construction',
    name: 'Xây dựng & Kiến trúc',
    shortName: 'Xây dựng',
    keyword: 'Xây dựng',
    aliases: [
      'xây dựng',
      'kiến trúc',
      'công trình',
      'kỹ sư xây dựng',
      'cad',
      'nội thất',
      'construction',
      'giám sát',
    ],
    icon: Compass,
    badgeColor: 'text-amber-700 bg-amber-50',
    jobCount: '320+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'retail_fmcg',
    name: 'Bán lẻ - Hàng tiêu dùng - FMCG',
    shortName: 'Bán lẻ - Hàng tiêu dùng - FMCG',
    keyword: 'Bán lẻ',
    aliases: [
      'bán lẻ',
      'fmcg',
      'hàng tiêu dùng',
      'siêu thị',
      'cửa hàng',
      'retail',
      'quản lý cửa hàng',
      'thu ngân',
    ],
    icon: ShoppingBag,
    badgeColor: 'text-rose-600 bg-rose-50',
    jobCount: '530+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'manufacturing',
    name: 'Sản xuất & Vận hành',
    shortName: 'Sản xuất',
    keyword: 'Sản xuất',
    aliases: [
      'sản xuất',
      'vận hành',
      'nhà máy',
      'chế tạo',
      'quản lý sản xuất',
      'qc',
      'qa sản xuất',
      'kỹ thuật',
    ],
    icon: Factory,
    badgeColor: 'text-slate-600 bg-slate-100',
    jobCount: '480+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'education',
    name: 'Giáo dục & Đào tạo',
    shortName: 'Giáo dục - Đào tạo',
    keyword: 'Giáo dục',
    aliases: [
      'giáo dục',
      'đào tạo',
      'giáo viên',
      'giảng viên',
      'gia sư',
      'trợ giảng',
      'education',
      'tiếng anh',
    ],
    icon: GraduationCap,
    badgeColor: 'text-sky-600 bg-sky-50',
    jobCount: '360+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'hospitality',
    name: 'Nhà hàng & Khách sạn (F&B / Du lịch)',
    shortName: 'Du lịch - Khách sạn',
    keyword: 'Khách sạn',
    aliases: [
      'nhà hàng',
      'khách sạn',
      'du lịch',
      'f&b',
      'tour',
      'lễ tân',
      'pha chế',
      'bếp',
      'phục vụ',
    ],
    icon: Compass,
    badgeColor: 'text-lime-600 bg-lime-50',
    jobCount: '310+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'insurance',
    name: 'Bảo hiểm & Quản trị rủi ro',
    shortName: 'Bảo hiểm',
    keyword: 'Bảo hiểm',
    aliases: [
      'bảo hiểm',
      'tư vấn bảo hiểm',
      'insurance',
      'nhân thọ',
      'phi nhân thọ',
      'bồi thường',
    ],
    icon: ShieldCheck,
    badgeColor: 'text-blue-700 bg-blue-50',
    jobCount: '270+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'translation',
    name: 'Biên / Phiên dịch & Ngôn ngữ',
    shortName: 'Biên / Phiên dịch',
    keyword: 'Phiên dịch',
    aliases: [
      'phiên dịch',
      'biên dịch',
      'tiếng anh',
      'tiếng nhật',
      'tiếng hàn',
      'tiếng trung',
      'translator',
      'interpreter',
    ],
    icon: Languages,
    badgeColor: 'text-violet-600 bg-violet-50',
    jobCount: '290+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'media',
    name: 'Báo chí / Truyền hình / Truyền thông',
    shortName: 'Báo chí / Truyền hình',
    keyword: 'Truyền thông',
    aliases: [
      'báo chí',
      'truyền hình',
      'biên tập viên',
      'phóng viên',
      'media',
      'video editor',
      'quay phim',
    ],
    icon: Tv,
    badgeColor: 'text-red-600 bg-red-50',
    jobCount: '240+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'telecom',
    name: 'Bưu chính - Viễn thông',
    shortName: 'Bưu chính - Viễn thông',
    keyword: 'Viễn thông',
    aliases: [
      'viễn thông',
      'telecom',
      'mạng',
      'bưu chính',
      'hạ tầng mạng',
      'truyền dẫn',
      'kỹ thuật viễn thông',
    ],
    icon: Radio,
    badgeColor: 'text-blue-500 bg-blue-50',
    jobCount: '210+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'general_labor',
    name: 'Lao động phổ thông',
    shortName: 'Lao động phổ thông',
    keyword: 'Lao động phổ thông',
    aliases: [
      'lao động',
      'phổ thông',
      'công nhân',
      'tạp vụ',
      'bảo vệ',
      'giao hàng',
      'shipper',
      'phục vụ',
      'thợ may',
      'thợ hàn',
      'đóng gói',
    ],
    icon: Wrench,
    badgeColor: 'text-zinc-600 bg-zinc-100',
    jobCount: '910+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'general',
  },
  {
    id: 'intern',
    name: 'Thực tập sinh & Mới tốt nghiệp',
    shortName: 'Thực tập sinh',
    keyword: 'Thực tập sinh',
    aliases: [
      'thực tập',
      'intern',
      'fresher',
      'mới tốt nghiệp',
      'trainee',
      'học việc',
    ],
    icon: Sparkles,
    badgeColor: 'text-emerald-500 bg-emerald-50',
    jobCount: '440+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'ecommerce',
    name: 'Thương mại điện tử (E-commerce)',
    shortName: 'Thương mại điện tử',
    keyword: 'Thương mại điện tử',
    aliases: [
      'e-commerce',
      'thương mại điện tử',
      'shopee',
      'tiktok shop',
      'lazada',
      'vận hành sàn',
    ],
    icon: ShoppingBag,
    badgeColor: 'text-amber-600 bg-amber-50',
    jobCount: '380+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'data_ai',
    name: 'Trí tuệ nhân tạo (AI) & Dữ liệu (Data)',
    shortName: 'AI & Data',
    keyword: 'AI',
    aliases: [
      'ai',
      'trí tuệ nhân tạo',
      'machine learning',
      'data analyst',
      'data engineer',
      'data scientist',
      'big data',
      'phân tích dữ liệu',
    ],
    icon: Cpu,
    badgeColor: 'text-indigo-600 bg-indigo-50',
    jobCount: '290+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'security',
    name: 'Bảo mật & An toàn thông tin',
    shortName: 'An toàn thông tin',
    keyword: 'Security',
    aliases: [
      'security',
      'an toàn thông tin',
      'cyber security',
      'soc',
      'bảo mật',
      'pentest',
    ],
    icon: Shield,
    badgeColor: 'text-red-700 bg-red-50',
    jobCount: '150+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'office',
  },
  {
    id: 'consulting',
    name: 'Dịch vụ tư vấn chuyên nghiệp',
    shortName: 'Tư vấn',
    keyword: 'Tư vấn',
    aliases: [
      'tư vấn',
      'consulting',
      'advisor',
      'chiến lược',
      'tư vấn quản lý',
    ],
    icon: FileText,
    badgeColor: 'text-slate-600 bg-slate-50',
    jobCount: '180+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'office',
  },
  {
    id: 'fashion_beauty',
    name: 'Thời trang & Làm đẹp',
    shortName: 'Thời trang & Làm đẹp',
    keyword: 'Thời trang',
    aliases: [
      'thời trang',
      'làm đẹp',
      'mỹ phẩm',
      'spa',
      'fashion',
      'stylist',
      'make up',
    ],
    icon: Sparkles,
    badgeColor: 'text-rose-500 bg-rose-50',
    jobCount: '220+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'automotive',
    name: 'Cơ khí & Kỹ thuật ô tô',
    shortName: 'Cơ khí - Ô tô',
    keyword: 'Cơ khí',
    aliases: [
      'cơ khí',
      'ô tô',
      'chế tạo máy',
      'bảo dưỡng ô tô',
      'kỹ thuật cơ khí',
      'cnc',
    ],
    icon: Wrench,
    badgeColor: 'text-stone-600 bg-stone-100',
    jobCount: '260+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'agriculture',
    name: 'Nông nghiệp & Môi trường',
    shortName: 'Nông nghiệp',
    keyword: 'Nông nghiệp',
    aliases: [
      'nông nghiệp',
      'môi trường',
      'lâm nghiệp',
      'thủy sản',
      'công nghệ sinh học',
      'chăn nuôi',
    ],
    icon: Compass,
    badgeColor: 'text-green-600 bg-green-50',
    jobCount: '140+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'general',
  },
  {
    id: 'part_time',
    name: 'Việc làm bán thời gian (Part-time)',
    shortName: 'Bán thời gian',
    keyword: 'Part-time',
    aliases: [
      'part-time',
      'bán thời gian',
      'thời vụ',
      'theo ca',
      'sinh viên',
    ],
    icon: Clock,
    badgeColor: 'text-teal-600 bg-teal-50',
    jobCount: '460+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: false,
    type: 'general',
  },
];

// 1. Danh sách Top 8 ngành phổ biến cho "Khám phá theo ngành nghề"
export const POPULAR_CATEGORIES = MASTER_CATEGORIES.filter((c) => c.isPopular);

// 2. Danh sách phân trang cho Cột Danh mục nhanh ở Hero (trang 1/5, mỗi trang 6 mục)
export const getSidebarCategoryPages = (pageSize = 6) => {
  const pages = [];
  for (let i = 0; i < MASTER_CATEGORIES.length; i += pageSize) {
    pages.push(
      MASTER_CATEGORIES.slice(i, i + pageSize).map((cat) => ({
        id: cat.id,
        name: cat.name,
        keyword: cat.keyword,
      }))
    );
  }
  return pages;
};

// 3. Dải Pills bộ lọc ngành nghề cho phần "Việc làm nổi bật"
export const JOB_FILTER_CATEGORIES = [
  'Tất cả',
  ...MASTER_CATEGORIES.filter((c) => c.isFeaturedFilter).map((c) => c.name),
];
export const FILTER_CATEGORIES = JOB_FILTER_CATEGORIES;

// 4. Dải Pills bộ lọc ngành nghề cho phần "Top Công ty hàng đầu"
export const COMPANY_FILTER_CATEGORIES = [
  'Tất cả',
  ...Array.from(
    new Set(
      MASTER_CATEGORIES.filter((c) => c.isCompanyIndustry).map(
        (c) => c.shortName || c.name
      )
    )
  ),
];

// 5. Options ngành nghề dùng chung cho Dropdown (JobFilterBar)
export const INDUSTRY_DROPDOWN_OPTIONS = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  ...MASTER_CATEGORIES.map((c) => ({
    value: c.name,
    label: c.name,
  })),
];

// 6. Options ngành nghề cho Sidebar lọc công ty (CompanyFilterSidebar)
export const COMPANY_SIDEBAR_INDUSTRIES = MASTER_CATEGORIES.filter(
  (c) => c.isCompanyIndustry
).map((c) => ({
  id: c.id,
  label: c.shortName || c.name,
}));

// 7. Tabs danh mục nhanh cho CompanyListPage
export const COMPANY_LIST_TABS = [
  { id: 'all', label: 'Tất cả công ty' },
  { id: 'featured', label: '★ Doanh nghiệp nổi bật' },
  { id: 'it', label: 'Công nghệ thông tin' },
  { id: 'Hà Nội', label: 'Hà Nội' },
  { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
];

/**
 * Helper: Kiểm tra một việc làm (job) có khớp với danh mục / ngành nghề được chọn không.
 * Tự động đối soát linh hoạt qua Tên, Danh mục, Tiêu đề và toàn bộ từ khóa bí danh (aliases).
 */
export const matchJobByCategory = (job, categoryFilter) => {
  if (!job || !categoryFilter || categoryFilter === 'Tất cả' || categoryFilter === 'all') {
    return true;
  }

  const query = categoryFilter.toLowerCase();
  const title = (job.title || '').toLowerCase();
  const category = (job.category || job.categoryName || '').toLowerCase();
  const description = (job.description || '').toLowerCase();

  // Tìm category trong Master list
  const catObj = MASTER_CATEGORIES.find(
    (c) =>
      c.name.toLowerCase() === query ||
      (c.shortName && c.shortName.toLowerCase() === query) ||
      c.id === categoryFilter ||
      c.keyword.toLowerCase() === query
  );

  if (catObj && catObj.aliases) {
    const isMatched = catObj.aliases.some((alias) => {
      const a = alias.toLowerCase();
      return title.includes(a) || category.includes(a);
    });
    if (isMatched) return true;
  }

  return title.includes(query) || category.includes(query) || description.includes(query);
};

/**
 * Helper: Kiểm tra một công ty (company) có khớp với ngành nghề được chọn không.
 */
export const matchCompanyByIndustry = (company, industryFilter) => {
  if (!company || !industryFilter || industryFilter === 'Tất cả' || industryFilter === 'all') {
    return true;
  }

  const query = industryFilter.toLowerCase();
  const industry = (company.industry || '').toLowerCase();
  const name = (company.name || company.companyName || '').toLowerCase();
  const desc = (company.description || '').toLowerCase();
  const tags = Array.isArray(company.tags) ? company.tags.join(' ').toLowerCase() : '';

  const catObj = MASTER_CATEGORIES.find(
    (c) =>
      c.name.toLowerCase() === query ||
      (c.shortName && c.shortName.toLowerCase() === query) ||
      c.id === industryFilter
  );

  if (catObj && catObj.aliases) {
    const isMatched = catObj.aliases.some((alias) => {
      const a = alias.toLowerCase();
      return industry.includes(a) || name.includes(a) || tags.includes(a);
    });
    if (isMatched) return true;
  }

  return industry.includes(query) || name.includes(query) || tags.includes(query) || desc.includes(query);
};

/**
 * Helper: Phân loại việc làm văn phòng vs việc làm phổ thông
 */
export const matchJobByType = (job, jobType) => {
  if (!job || !jobType || jobType === 'all') return true;

  const title = (job.title || '').toLowerCase();
  const experience = (job.experience || job.experienceLevel || '').toLowerCase();

  if (jobType === 'office') {
    const isManual =
      title.includes('lao động phổ thông') ||
      title.includes('công nhân') ||
      title.includes('phục vụ') ||
      title.includes('bảo vệ') ||
      title.includes('tạp vụ') ||
      title.includes('giao hàng') ||
      title.includes('shipper') ||
      title.includes('lái xe') ||
      title.includes('thợ may') ||
      title.includes('thợ hàn');
    return !isManual;
  }

  if (jobType === 'general') {
    const isGeneral =
      title.includes('phổ thông') ||
      title.includes('lao động') ||
      title.includes('công nhân') ||
      title.includes('phục vụ') ||
      title.includes('bảo vệ') ||
      title.includes('tạp vụ') ||
      title.includes('giao hàng') ||
      title.includes('shipper') ||
      title.includes('kho') ||
      title.includes('thu ngân') ||
      title.includes('bán lẻ') ||
      title.includes('bán hàng') ||
      experience.includes('không yêu cầu') ||
      experience.includes('chưa có');
    return isGeneral;
  }

  return true;
};

