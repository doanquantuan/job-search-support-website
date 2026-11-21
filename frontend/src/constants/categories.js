import {
  Briefcase,
  Laptop,
  Cpu,
  Layers,
  Wrench,
  Sparkles,
  Calculator,
  ShieldCheck,
  Shield,
  Compass,
  FileText,
  Palette,
  Headphones,
  Building2,
  Banknote,
  ShoppingBag,
  Radio,
  Tv,
} from 'lucide-react';

/**
 * MASTER_CATEGORIES
 * Nguồn dữ liệu chuyên môn & lĩnh vực Công nghệ Thông tin (IT) duy nhất của toàn bộ hệ thống.
 * Toàn bộ hệ thống tập trung 100% vào các vị trí, kỹ năng và công ty trong ngành Công nghệ Thông tin.
 */
export const MASTER_CATEGORIES = [
  // ── 1. CÁC CHUYÊN MÔN / VỊ TRÍ CÔNG NGHỆ THÔNG TIN ─────────────────────────
  {
    id: 'it_frontend',
    name: 'Lập trình Frontend',
    shortName: 'Frontend Dev',
    keyword: 'Frontend',
    aliases: [
      'frontend',
      'front end',
      'front-end',
      'react',
      'reactjs',
      'vue',
      'vuejs',
      'angular',
      'nextjs',
      'next.js',
      'typescript',
      'javascript',
      'html',
      'css',
      'tailwind',
      'ui developer',
    ],
    icon: Laptop,
    badgeColor: 'text-blue-600 bg-blue-50',
    jobCount: '1.450+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_backend',
    name: 'Lập trình Backend',
    shortName: 'Backend Dev',
    keyword: 'Backend',
    aliases: [
      'backend',
      'back end',
      'back-end',
      'node',
      'nodejs',
      'java',
      'spring',
      'springboot',
      'golang',
      'go',
      'python',
      'django',
      'fastapi',
      'c#',
      '.net',
      'asp.net',
      'php',
      'laravel',
      'microservices',
      'rest api',
      'sql',
    ],
    icon: Cpu,
    badgeColor: 'text-indigo-600 bg-indigo-50',
    jobCount: '1.820+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_fullstack',
    name: 'Lập trình Fullstack',
    shortName: 'Fullstack Dev',
    keyword: 'Fullstack',
    aliases: [
      'fullstack',
      'full stack',
      'full-stack',
      'mern',
      'mevn',
      'web developer',
      'kỹ sư phần mềm',
      'software engineer',
    ],
    icon: Layers,
    badgeColor: 'text-purple-600 bg-purple-50',
    jobCount: '980+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_mobile',
    name: 'Lập trình Mobile (iOS / Android)',
    shortName: 'Mobile Dev',
    keyword: 'Mobile',
    aliases: [
      'mobile',
      'android',
      'ios',
      'flutter',
      'react native',
      'swift',
      'kotlin',
      'di động',
      'mobile developer',
    ],
    icon: Laptop,
    badgeColor: 'text-emerald-600 bg-emerald-50',
    jobCount: '750+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_devops',
    name: 'DevOps, Cloud & SRE',
    shortName: 'DevOps / Cloud',
    keyword: 'DevOps',
    aliases: [
      'devops',
      'dev ops',
      'cloud',
      'aws',
      'gcp',
      'azure',
      'docker',
      'kubernetes',
      'k8s',
      'ci/cd',
      'terraform',
      'sre',
      'site reliability',
      'system admin',
      'linux',
      'hạ tầng',
    ],
    icon: Wrench,
    badgeColor: 'text-orange-600 bg-orange-50',
    jobCount: '620+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_ai_ml',
    name: 'AI & Machine Learning',
    shortName: 'AI / Machine Learning',
    keyword: 'AI',
    aliases: [
      'ai',
      'artificial intelligence',
      'machine learning',
      'ml',
      'deep learning',
      'nlp',
      'computer vision',
      'generative ai',
      'llm',
      'pytorch',
      'tensorflow',
      'trí tuệ nhân tạo',
      'mlops',
    ],
    icon: Sparkles,
    badgeColor: 'text-amber-600 bg-amber-50',
    jobCount: '510+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_data',
    name: 'Dữ liệu & Big Data',
    shortName: 'Dữ liệu / Data',
    keyword: 'Data',
    aliases: [
      'data',
      'data engineer',
      'data analyst',
      'data science',
      'big data',
      'bi',
      'business intelligence',
      'power bi',
      'tableau',
      'sql',
      'dữ liệu',
      'khoa học dữ liệu',
    ],
    icon: Calculator,
    badgeColor: 'text-teal-600 bg-teal-50',
    jobCount: '680+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'product_data',
  },
  {
    id: 'it_qa_qc',
    name: 'Kiểm thử phần mềm (QA / QC / Tester)',
    shortName: 'QA / QC / Tester',
    keyword: 'QA',
    aliases: [
      'qa',
      'qc',
      'tester',
      'kiểm thử',
      'automation test',
      'manual test',
      'selenium',
      'playwright',
      'cypress',
      'quality assurance',
      'kiem thu phan mem',
    ],
    icon: ShieldCheck,
    badgeColor: 'text-rose-600 bg-rose-50',
    jobCount: '730+',
    isPopular: true,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_security',
    name: 'An toàn thông tin & Cybersecurity',
    shortName: 'Bảo mật / Security',
    keyword: 'Bảo mật',
    aliases: [
      'security',
      'cybersecurity',
      'bảo mật',
      'an toàn thông tin',
      'soc',
      'pentest',
      'penetration testing',
      'infosec',
      'an ninh mạng',
    ],
    icon: Shield,
    badgeColor: 'text-red-600 bg-red-50',
    jobCount: '340+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_product_ba',
    name: 'Quản trị sản phẩm & Dự án IT (PM / PO / Scrum)',
    shortName: 'Product / IT PM',
    keyword: 'Product Manager',
    aliases: [
      'product manager',
      'pm',
      'product owner',
      'po',
      'project manager',
      'scrum master',
      'agile',
      'quản lý dự án',
      'quản trị sản phẩm',
      'pdm',
    ],
    icon: Compass,
    badgeColor: 'text-sky-600 bg-sky-50',
    jobCount: '490+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'product_data',
  },
  {
    id: 'it_ba',
    name: 'Phân tích nghiệp vụ IT (Business Analyst - BA)',
    shortName: 'IT Business Analyst',
    keyword: 'Business Analyst',
    aliases: [
      'business analyst',
      'ba',
      'it ba',
      'phân tích nghiệp vụ',
      'product analyst',
      'system analyst',
      'phan tich he thong',
    ],
    icon: FileText,
    badgeColor: 'text-violet-600 bg-violet-50',
    jobCount: '580+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'product_data',
  },
  {
    id: 'it_ui_ux',
    name: 'Thiết kế UI/UX & Product Design',
    shortName: 'UI/UX Design',
    keyword: 'UI/UX',
    aliases: [
      'ui',
      'ux',
      'ui/ux',
      'ui-ux',
      'product designer',
      'figma',
      'thiết kế giao diện',
      'ux research',
      'design system',
    ],
    icon: Palette,
    badgeColor: 'text-pink-600 bg-pink-50',
    jobCount: '420+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'product_data',
  },
  {
    id: 'it_sysadmin_network',
    name: 'Hệ thống, Mạng & IT Helpdesk',
    shortName: 'Hệ thống & Mạng',
    keyword: 'Hệ thống',
    aliases: [
      'system admin',
      'sysadmin',
      'network',
      'mạng',
      'cisco',
      'it support',
      'helpdesk',
      'hỗ trợ kỹ thuật',
      'quản trị mạng',
    ],
    icon: Headphones,
    badgeColor: 'text-amber-700 bg-amber-50',
    jobCount: '390+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_embedded_iot',
    name: 'Lập trình nhúng & IoT',
    shortName: 'Nhúng / IoT',
    keyword: 'Nhúng',
    aliases: [
      'embedded',
      'iot',
      'nhúng',
      'c/c++',
      'firmware',
      'hardware',
      'vi điều khiển',
      'stm32',
      'lập trình nhúng',
    ],
    icon: Cpu,
    badgeColor: 'text-emerald-700 bg-emerald-50',
    jobCount: '290+',
    isPopular: false,
    isFeaturedFilter: true,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_blockchain',
    name: 'Blockchain & Web3',
    shortName: 'Blockchain / Web3',
    keyword: 'Blockchain',
    aliases: [
      'blockchain',
      'web3',
      'solidity',
      'smart contract',
      'crypto',
      'dapp',
      'ethereum',
    ],
    icon: Layers,
    badgeColor: 'text-purple-700 bg-purple-50',
    jobCount: '180+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: false,
    type: 'engineering',
  },
  {
    id: 'it_game',
    name: 'Lập trình Game (Unity / Unreal)',
    shortName: 'Lập trình Game',
    keyword: 'Game',
    aliases: [
      'game',
      'game developer',
      'unity',
      'unreal',
      'cocos',
      'game dev',
      'phát triển game',
    ],
    icon: Tv,
    badgeColor: 'text-cyan-700 bg-cyan-50',
    jobCount: '210+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: false,
    type: 'engineering',
  },

  // ── 2. CÁC LĨNH VỰC CỦA CÔNG TY CÔNG NGHỆ (TECH ENTERPRISES) ───────────────
  {
    id: 'it_services_company',
    name: 'Phát triển Phần mềm & Dịch vụ CNTT',
    shortName: 'Phần mềm & IT Outsourcing',
    keyword: 'Phần mềm',
    aliases: [
      'phần mềm',
      'software',
      'it services',
      'outsourcing',
      'fpt',
      'gia công phần mềm',
      'công nghệ thông tin',
      'it software',
    ],
    icon: Building2,
    badgeColor: 'text-blue-700 bg-blue-50',
    jobCount: '1.200+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'product_saas_company',
    name: 'Sản phẩm công nghệ & SaaS (Product Tech)',
    shortName: 'Sản phẩm công nghệ (Product)',
    keyword: 'Product',
    aliases: [
      'product',
      'saas',
      'nền tảng',
      'vng',
      'zalo',
      'công nghệ',
      'platform',
      'product tech',
    ],
    icon: Laptop,
    badgeColor: 'text-indigo-700 bg-indigo-50',
    jobCount: '890+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'fintech_company',
    name: 'Fintech & Công nghệ tài chính',
    shortName: 'Fintech & Ví điện tử',
    keyword: 'Fintech',
    aliases: [
      'fintech',
      'tài chính công nghệ',
      'ví điện tử',
      'momo',
      'zalopay',
      'ngân hàng số',
      'digital banking',
    ],
    icon: Banknote,
    badgeColor: 'text-emerald-700 bg-emerald-50',
    jobCount: '580+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'ai_data_company',
    name: 'Trí tuệ nhân tạo & Dữ liệu lớn (AI / DeepTech)',
    shortName: 'AI & Dữ liệu lớn',
    keyword: 'AI',
    aliases: [
      'ai',
      'trí tuệ nhân tạo',
      'deeptech',
      'vinai',
      'dữ liệu lớn',
      'big data',
      'computer vision',
    ],
    icon: Sparkles,
    badgeColor: 'text-amber-700 bg-amber-50',
    jobCount: '340+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'ecommerce_company',
    name: 'Thương mại điện tử & Bán lẻ số',
    shortName: 'E-Commerce Tech',
    keyword: 'Thương mại điện tử',
    aliases: [
      'thương mại điện tử',
      'e-commerce',
      'shopee',
      'tiki',
      'lazada',
      'logistics tech',
      'tech retail',
    ],
    icon: ShoppingBag,
    badgeColor: 'text-orange-700 bg-orange-50',
    jobCount: '460+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'telecom_company',
    name: 'Viễn thông & Hạ tầng số',
    shortName: 'Viễn thông & 5G/IoT',
    keyword: 'Viễn thông',
    aliases: [
      'viễn thông',
      'hạ tầng số',
      'viettel',
      'fpt telecom',
      'vnpt',
      '5g',
      'iot',
      'telecom',
    ],
    icon: Radio,
    badgeColor: 'text-red-700 bg-red-50',
    jobCount: '410+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
  {
    id: 'game_company',
    name: 'Trò chơi điện tử & Game Studio',
    shortName: 'Game Studio & Giải trí số',
    keyword: 'Game',
    aliases: [
      'game studio',
      'trò chơi điện tử',
      'vng game',
      'game development',
      'studio game',
    ],
    icon: Tv,
    badgeColor: 'text-cyan-700 bg-cyan-50',
    jobCount: '270+',
    isPopular: false,
    isFeaturedFilter: false,
    isCompanyIndustry: true,
    type: 'company_industry',
  },
];

// 1. Danh sách Top 8 chuyên môn IT phổ biến cho phần "Khám phá chuyên môn IT"
export const POPULAR_CATEGORIES = MASTER_CATEGORIES.filter((c) => c.isPopular);

// 2. Danh sách phân trang cho Cột Danh mục nhanh ở Hero (trang 1/3, mỗi trang 6 mục)
export const getSidebarCategoryPages = (pageSize = 6) => {
  const pages = [];
  const itTechCategories = MASTER_CATEGORIES.filter((c) => !c.isCompanyIndustry);
  for (let i = 0; i < itTechCategories.length; i += pageSize) {
    pages.push(
      itTechCategories.slice(i, i + pageSize).map((cat) => ({
        id: cat.id,
        name: cat.name,
        keyword: cat.keyword,
      }))
    );
  }
  return pages;
};

// 3. Dải Pills bộ lọc chuyên môn cho phần "Việc làm nổi bật"
export const JOB_FILTER_CATEGORIES = [
  'Tất cả',
  ...MASTER_CATEGORIES.filter((c) => c.isFeaturedFilter).map((c) => c.name),
];
export const FILTER_CATEGORIES = JOB_FILTER_CATEGORIES;

// 4. Dải Pills bộ lọc lĩnh vực cho phần "Top Công ty công nghệ hàng đầu"
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

// 5. Options chuyên môn IT dùng chung cho Dropdown (JobFilterBar)
export const INDUSTRY_DROPDOWN_OPTIONS = [
  { value: 'all', label: 'Tất cả chuyên môn IT' },
  ...MASTER_CATEGORIES.filter((c) => !c.isCompanyIndustry).map((c) => ({
    value: c.name,
    label: c.name,
  })),
];

// 6. Options lĩnh vực cho Sidebar lọc công ty (CompanyFilterSidebar)
export const COMPANY_SIDEBAR_INDUSTRIES = MASTER_CATEGORIES.filter(
  (c) => c.isCompanyIndustry
).map((c) => ({
  id: c.id,
  label: c.shortName || c.name,
}));

// 7. Tabs danh mục nhanh cho CompanyListPage
export const COMPANY_LIST_TABS = [
  { id: 'all', label: 'Tất cả công ty công nghệ' },
  { id: 'featured', label: '★ Doanh nghiệp IT nổi bật' },
  { id: 'it_services_company', label: 'Phần mềm & IT Outsourcing' },
  { id: 'fintech_company', label: 'Fintech & Ngân hàng số' },
  { id: 'product_saas_company', label: 'Sản phẩm công nghệ (Product)' },
  { id: 'Hà Nội', label: 'Hà Nội' },
  { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
];

/**
 * Helper: Kiểm tra một việc làm (job) có khớp với danh mục / chuyên môn IT được chọn không.
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
  const skills = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';

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
      return title.includes(a) || category.includes(a) || skills.includes(a);
    });
    if (isMatched) return true;
  }

  return (
    title.includes(query) ||
    category.includes(query) ||
    skills.includes(query) ||
    description.includes(query)
  );
};

/**
 * Helper: Kiểm tra một công ty (company) có khớp với lĩnh vực công nghệ được chọn không.
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

  return (
    industry.includes(query) ||
    name.includes(query) ||
    tags.includes(query) ||
    desc.includes(query)
  );
};

/**
 * Helper: Phân loại việc làm IT theo Nhóm chuyên môn (Kỹ thuật & Lập trình vs Dữ liệu, AI & Sản phẩm)
 */
export const matchJobByType = (job, jobType) => {
  if (!job || !jobType || jobType === 'all') return true;

  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const category = (job.category || job.categoryName || '').toLowerCase();
  const content = `${title} ${desc} ${category}`;

  if (jobType === 'engineering') {
    // Kỹ thuật, Lập trình, DevOps, QA, Cloud, Security
    return (
      content.includes('frontend') ||
      content.includes('backend') ||
      content.includes('fullstack') ||
      content.includes('developer') ||
      content.includes('engineer') ||
      content.includes('lập trình') ||
      content.includes('react') ||
      content.includes('node') ||
      content.includes('java') ||
      content.includes('golang') ||
      content.includes('mobile') ||
      content.includes('devops') ||
      content.includes('cloud') ||
      content.includes('tester') ||
      content.includes('qa') ||
      content.includes('qc') ||
      content.includes('security') ||
      content.includes('bảo mật') ||
      content.includes('nhúng') ||
      content.includes('embedded')
    );
  }

  if (jobType === 'product_data') {
    // Dữ liệu, Trí tuệ nhân tạo, Quản lý sản phẩm & Phân tích nghiệp vụ, UI/UX
    return (
      content.includes('data') ||
      content.includes('dữ liệu') ||
      content.includes('ai') ||
      content.includes('machine learning') ||
      content.includes('product manager') ||
      content.includes('product owner') ||
      content.includes('business analyst') ||
      content.includes('ba') ||
      content.includes('ui/ux') ||
      content.includes('ui') ||
      content.includes('ux') ||
      content.includes('scrum master')
    );
  }

  return true;
};
