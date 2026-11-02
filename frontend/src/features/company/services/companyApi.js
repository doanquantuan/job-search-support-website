import { apiClient } from '@/lib/apiClient';

// Dữ liệu mẫu phong phú và thực tế cho danh sách công ty
export const MOCK_COMPANIES = [
  {
    id: 'fpt-software',
    name: 'FPT Software',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-primary/25 via-accent/15 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'Hà Nội',
    address: 'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
    rating: 4.8,
    reviewCount: 342,
    activeJobsCount: 45,
    isFeatured: true,
    tags: ['Toàn cầu', 'Hybrid work', 'Thưởng dự án'],
    description: 'FPT Software là công ty công nghệ và chuyển đổi số hàng đầu Đông Nam Á, cung cấp dịch vụ phần mềm cho hàng trăm doanh nghiệp Fortune 500 trên toàn cầu.',
    website: 'https://fptsoftware.com',
  },
  {
    id: 'vng-corporation',
    name: 'VNG Corporation',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-secondary/25 via-primary/15 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'TP. Hồ Chí Minh',
    address: 'VNG Campus, Khu chế xuất Tân Thuận, Quận 7, TP. HCM',
    rating: 4.6,
    reviewCount: 289,
    activeJobsCount: 28,
    isFeatured: true,
    tags: ['Kỳ lân công nghệ', 'Campus hiện đại', 'Cơm trưa miễn phí'],
    description: 'Kỳ lân công nghệ đầu tiên tại Việt Nam, tiên phong trong các mảng game trực tuyến, nền tảng số Zalo, ZaloPay và dịch vụ điện toán đám mây.',
    website: 'https://vng.com.vn',
  },
  {
    id: 'momo-fintech',
    name: 'MoMo (M_Service)',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-primary/20 via-accent/20 to-transparent',
    industry: 'Tài chính / Ngân hàng',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
    rating: 4.7,
    reviewCount: 198,
    activeJobsCount: 16,
    isFeatured: true,
    tags: ['Top Fintech', 'Thưởng tháng 13+', 'Macbook M-series'],
    description: 'Ứng dụng Fintech số 1 Việt Nam, mang đến giải pháp thanh toán điện tử, chuyển tiền tức thì và dịch vụ tài chính toàn diện cho hơn 30 triệu người dùng.',
    website: 'https://momo.vn',
  },
  {
    id: 'shopee-vietnam',
    name: 'Shopee Việt Nam',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-secondary/25 via-primary/20 to-transparent',
    industry: 'Thương mại điện tử',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'TP. Hồ Chí Minh',
    address: 'Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP. HCM',
    rating: 4.5,
    reviewCount: 420,
    activeJobsCount: 32,
    isFeatured: true,
    tags: ['E-Commerce số 1', 'Môi trường trẻ', 'Bảo hiểm toàn diện'],
    description: 'Nền tảng thương mại điện tử hàng đầu tại Đông Nam Á và Đài Loan, cung cấp trải nghiệm mua sắm trực tuyến liền mạch, an toàn và nhanh chóng.',
    website: 'https://shopee.vn',
  },
  {
    id: 'techcombank',
    name: 'Techcombank Digital',
    logo: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-secondary/30 via-primary/15 to-transparent',
    industry: 'Tài chính / Ngân hàng',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'Hà Nội',
    address: '6 Quang Trung, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    rating: 4.4,
    reviewCount: 156,
    activeJobsCount: 19,
    isFeatured: false,
    tags: ['Chuyển đổi số', 'Lương thưởng cạnh tranh', 'Đào tạo quốc tế'],
    description: 'Ngân hàng tư nhân hàng đầu Việt Nam tiên phong dẫn đầu số hóa, xây dựng nền tảng tài chính công nghệ cao vượt trội cho khách hàng và doanh nghiệp.',
    website: 'https://techcombank.com',
  },
  {
    id: 'viettel-solutions',
    name: 'Viettel Solutions',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-accent/30 via-primary/15 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'Hà Nội',
    address: 'Tòa nhà Viettel, Số 1 Trần Hữu Dực, Nam Từ Liêm, Hà Nội',
    rating: 4.6,
    reviewCount: 215,
    activeJobsCount: 22,
    isFeatured: false,
    tags: ['Tập đoàn quốc gia', 'Dự án Big Data', 'Phúc lợi vững chắc'],
    description: 'Đơn vị thành viên trực thuộc Tập đoàn Viettel chuyên tư vấn, triển khai giải pháp công nghệ thông tin và chuyển đổi số cho Chính phủ và doanh nghiệp.',
    website: 'https://viettelsolutions.vn',
  },
  {
    id: 'tiki-corporation',
    name: 'Tiki Corporation',
    logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-accent/30 via-primary/20 to-transparent',
    industry: 'Thương mại điện tử',
    size: '201 - 500 nhân viên',
    sizeRange: '201-500',
    location: 'TP. Hồ Chí Minh',
    address: 'Viettel Complex, 285 Cách Mạng Tháng 8, Quận 10, TP. HCM',
    rating: 4.3,
    reviewCount: 180,
    activeJobsCount: 12,
    isFeatured: false,
    tags: ['TikiNOW', 'Văn phòng mở', 'Khuyến khích sáng tạo'],
    description: 'Hệ sinh thái thương mại all-in-one được hàng triệu người tiêu dùng Việt Nam tin tưởng với dịch vụ giao hàng nhanh TikiNOW và hàng chính hãng 100%.',
    website: 'https://tiki.vn',
  },
  {
    id: 'base-vn',
    name: 'Base.vn (FPT Member)',
    logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-primary/30 via-secondary/15 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '51 - 200 nhân viên',
    sizeRange: '51-200',
    location: 'Hà Nội',
    address: 'Tòa nhà Báo Sinh Viên, Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    rating: 4.7,
    reviewCount: 94,
    activeJobsCount: 8,
    isFeatured: false,
    tags: ['B2B SaaS', 'Tốc độ tăng trưởng cao', 'Văn hóa học tập'],
    description: 'Nền tảng quản trị doanh nghiệp SaaS hàng đầu Việt Nam, hỗ trợ hơn 8.000 doanh nghiệp tối ưu hóa quy trình làm việc và nâng cao hiệu suất.',
    website: 'https://base.vn',
  },
  {
    id: 'topcv-vietnam',
    name: 'TopCV Việt Nam',
    logo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-accent/25 via-primary/20 to-transparent',
    industry: 'Marketing / Truyền thông',
    size: '51 - 200 nhân viên',
    sizeRange: '51-200',
    location: 'Hà Nội',
    address: 'Tòa nhà FS, Tầng 3, GoldSeason, 47 Nguyễn Tuân, Thanh Xuân, Hà Nội',
    rating: 4.5,
    reviewCount: 87,
    activeJobsCount: 14,
    isFeatured: false,
    tags: ['HR Tech hàng đầu', 'Đội ngũ trẻ', 'Du lịch hàng năm'],
    description: 'Công ty công nghệ nhân sự hàng đầu tại Việt Nam, kết nối hàng triệu ứng viên tiềm năng với hàng trăm ngàn nhà tuyển dụng uy tín.',
    website: 'https://topcv.vn',
  },
  {
    id: 'sun-asterisk',
    name: 'Sun* Inc. (Sun Asterisk)',
    logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-secondary/20 via-accent/20 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '500+ nhân viên',
    sizeRange: '500+',
    location: 'Đà Nẵng',
    address: 'Tòa nhà FHome, 16 Lý Thường Kiệt, Hải Châu, Đà Nẵng',
    rating: 4.6,
    reviewCount: 140,
    activeJobsCount: 11,
    isFeatured: false,
    tags: ['Creative Studio', 'Dự án Nhật Bản', 'Đào tạo kỹ năng'],
    description: 'Studio công nghệ toàn cầu chuyên tạo ra các sản phẩm số đột phá, từ nghiên cứu R&D, thiết kế trải nghiệm đến phát triển giải pháp phần mềm hiện đại.',
    website: 'https://sun-asterisk.vn',
  },
  {
    id: 'katalon-studio',
    name: 'Katalon',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-primary/25 via-accent/20 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '51 - 200 nhân viên',
    sizeRange: '51-200',
    location: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Viettel, Quận 10, TP. Hồ Chí Minh',
    rating: 4.8,
    reviewCount: 76,
    activeJobsCount: 9,
    isFeatured: false,
    tags: ['Global Product', 'Silicon Valley Style', 'Stock Option'],
    description: 'Nền tảng kiểm thử tự động toàn diện hàng đầu thế giới được tin dùng bởi hơn 100.000 công ty và 1 triệu kỹ sư kiểm thử phần mềm trên toàn cầu.',
    website: 'https://katalon.com',
  },
  {
    id: 'vinai-research',
    name: 'VinAI Research',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=60',
    coverGradient: 'from-primary/30 via-secondary/25 to-transparent',
    industry: 'Công nghệ thông tin',
    size: '51 - 200 nhân viên',
    sizeRange: '51-200',
    location: 'Hà Nội',
    address: 'Tòa nhà Symphony, Chu Huy Mân, Long Biên, Hà Nội',
    rating: 4.9,
    reviewCount: 65,
    activeJobsCount: 7,
    isFeatured: true,
    tags: ['Top AI Research', 'Chuyên gia thế giới', 'GPU Cluster khủng'],
    description: 'Viện nghiên cứu Trí tuệ nhân tạo hàng đầu khu vực quy tụ các nhà khoa học, chuyên gia hàng đầu về Deep Learning, Computer Vision và Smart Mobility.',
    website: 'https://vinai.io',
  },
];

export const companyApi = {
  // Lấy danh sách công ty hỗ trợ search & filter
  async getCompanies({
    search = '',
    location = '',
    industry = [],
    size = [],
    minRating = 0,
    sortBy = 'default',
    filterTag = 'all', // 'all' | 'featured' | 'tech'
    page = 1,
    limit = 6,
  } = {}) {
    try {
      const response = await apiClient.get('/companies', {
        params: { search, location, page, limit },
      });
      return response.data;
    } catch {
      let results = [...MOCK_COMPANIES];

      // Lọc từ khóa tên
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        results = results.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.industry.toLowerCase().includes(query) ||
            (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)))
        );
      }

      // Lọc địa điểm
      if (location && location !== 'all') {
        results = results.filter((c) =>
          c.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      // Lọc theo tag tab nhanh
      if (filterTag === 'featured') {
        results = results.filter((c) => c.isFeatured);
      } else if (filterTag === 'tech') {
        results = results.filter((c) => c.industry === 'Công nghệ thông tin');
      }

      // Lọc ngành nghề
      if (industry && industry.length > 0) {
        results = results.filter((c) => industry.includes(c.industry));
      }

      // Lọc quy mô
      if (size && size.length > 0) {
        results = results.filter((c) => size.includes(c.sizeRange));
      }

      // Lọc đánh giá
      if (minRating > 0) {
        results = results.filter((c) => c.rating >= minRating);
      }

      // Sắp xếp
      if (sortBy === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'jobs') {
        results.sort((a, b) => b.activeJobsCount - a.activeJobsCount);
      } else if (sortBy === 'name') {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }

      const total = results.length;
      const startIndex = (page - 1) * limit;
      const paginatedItems = results.slice(startIndex, startIndex + limit);

      return {
        data: paginatedItems,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }
  },

  // Lấy chi tiết 1 công ty theo ID kèm thông tin phong phú
  async getCompanyById(id) {
    try {
      const response = await apiClient.get(`/companies/${id}`);
      const data = response.data?.data || response.data;
      return augmentCompanyDetails(data);
    } catch {
      const found = MOCK_COMPANIES.find((c) => c.id === id) || MOCK_COMPANIES[0];
      return augmentCompanyDetails(found);
    }
  },

  // Lấy danh sách công ty tương tự
  async getSimilarCompanies(currentId, limit = 3) {
    return MOCK_COMPANIES.filter((c) => c.id !== currentId).slice(0, limit);
  },
};


// Hàm bổ sung chi tiết phong phú cho trang xem công ty
export const augmentCompanyDetails = (company) => {
  if (!company) return null;

  return {
    ...company,
    coverImage: company.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
    founded: company.founded || '2006',
    companyType: company.companyType || 'Sản phẩm & Dịch vụ công nghệ',
    workingDays: company.workingDays || 'Thứ 2 - Thứ 6 (08:30 - 17:30)',
    overtimePolicy: company.overtimePolicy || 'Không OT thường xuyên / Có phụ cấp theo luật',
    email: company.email || `careers@${company.id}.vn`,
    phone: company.phone || '(+84) 28 7300 8888',
    keySkills: company.keySkills || ['React', 'Node.js', 'TypeScript', 'TailwindCSS', 'Docker', 'AWS', 'Microservices', 'CI/CD'],
    benefits: company.benefits || [
      {
        icon: 'Coins',
        title: 'Lương thưởng cạnh tranh & Tháng 13+',
        description: 'Thu nhập hấp dẫn theo năng lực, thưởng hiệu quả kinh doanh định kỳ và lương tháng 13 đảm bảo.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Bảo hiểm sức khỏe cao cấp',
        description: 'Gói bảo hiểm toàn diện (nội trú, ngoại trú, nha khoa) cho nhân viên và ưu đãi cho người thân.',
      },
      {
        icon: 'Laptop',
        title: 'Thiết bị làm việc hiện đại',
        description: 'Trang bị Macbook Pro / Laptop cấu hình cao đời mới nhất kèm 2 màn hình phụ 4K tại văn phòng.',
      },
      {
        icon: 'CalendarDays',
        title: 'Làm việc linh hoạt (Hybrid)',
        description: 'Chính sách kết hợp linh hoạt 2 ngày làm việc tại nhà (WFH) mỗi tuần và 15 ngày phép hưởng nguyên lương.',
      },
      {
        icon: 'GraduationCap',
        title: 'Đào tạo & Chứng chỉ quốc tế',
        description: 'Tài trợ 100% chi phí thi các chứng chỉ chuyên môn quốc tế (AWS, Azure, PMP, Scrum Master...) và khóa học online.',
      },
      {
        icon: 'Plane',
        title: 'Du lịch & Hoạt động văn hóa',
        description: 'Company trip nghỉ dưỡng 4-5 sao hàng năm, team building định kỳ và câu lạc bộ thể thao (Bóng đá, Cầu lông, Gym).',
      },
    ],
    jobs: company.jobs || [
      {
        id: `${company.id}-job-1`,
        title: 'Senior Frontend Developer (React / TypeScript)',
        salary: '25 - 42 triệu',
        salaryType: 'Thỏa thuận',
        location: company.location,
        type: 'Toàn thời gian',
        workMode: 'Hybrid (2 ngày WFH)',
        experience: '3 - 5 năm kinh nghiệm',
        department: 'Khối Công nghệ & Sản phẩm',
        deadline: '30/12/2026',
        urgent: true,
        tags: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
      },
      {
        id: `${company.id}-job-2`,
        title: 'Backend Engineer (Node.js / Go / Microservices)',
        salary: '28 - 48 triệu',
        salaryType: 'Thỏa thuận',
        location: company.location,
        type: 'Toàn thời gian',
        workMode: 'Tại văn phòng',
        experience: '3+ năm kinh nghiệm',
        department: 'Khối Nền tảng Core',
        deadline: '25/12/2026',
        urgent: false,
        tags: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Redis'],
      },
      {
        id: `${company.id}-job-3`,
        title: 'UI/UX Product Designer (Web & Mobile App)',
        salary: '18 - 30 triệu',
        salaryType: 'Cạnh tranh',
        location: company.location,
        type: 'Toàn thời gian',
        workMode: 'Hybrid',
        experience: '2+ năm kinh nghiệm',
        department: 'Phòng Thiết kế Trải nghiệm',
        deadline: '15/01/2027',
        urgent: false,
        tags: ['Figma', 'Design System', 'User Research', 'Prototyping'],
      },
      {
        id: `${company.id}-job-4`,
        title: 'DevOps / Cloud Infrastructure Specialist',
        salary: '32 - 55 triệu',
        salaryType: 'Cạnh tranh',
        location: company.location,
        type: 'Toàn thời gian',
        workMode: 'Linh hoạt',
        experience: '4+ năm kinh nghiệm',
        department: 'Khối Hạ tầng & Bảo mật',
        deadline: '20/12/2026',
        urgent: true,
        tags: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
      },
      {
        id: `${company.id}-job-5`,
        title: 'Technical Product Owner / Business Analyst',
        salary: '22 - 38 triệu',
        salaryType: 'Thỏa thuận',
        location: company.location,
        type: 'Toàn thời gian',
        workMode: 'Hybrid',
        experience: '2 - 4 năm kinh nghiệm',
        department: 'Khối Quản trị Sản phẩm',
        deadline: '10/01/2027',
        urgent: false,
        tags: ['Agile', 'Scrum', 'Product Backlog', 'SQL'],
      },
    ],
    reviews: company.reviews || [
      {
        id: 'rev-1',
        author: 'Kỹ sư Phần mềm Fullstack (Ẩn danh)',
        role: 'Nhân viên chính thức • Đã làm việc 2 năm',
        rating: 5.0,
        date: '20/10/2026',
        title: 'Môi trường làm việc năng động, lãnh đạo tôn trọng ý kiến nhân viên',
        pros: 'Văn hóa minh bạch, được tự do đề xuất giải pháp công nghệ mới. Chế độ bảo hiểm và phúc lợi rất chu đáo. Trang bị máy tính xịn và trà cà phê miễn phí.',
        cons: 'Giai đoạn nước rút ra mắt tính năng mới có thể hơi bận, nhưng bù lại được hỗ trợ ăn tối và phụ cấp OT đầy đủ.',
        helpful: 34,
      },
      {
        id: 'rev-2',
        author: 'Senior QA / Automation Tester',
        role: 'Nhân viên chính thức • Đã làm việc 1.5 năm',
        rating: 4.6,
        date: '08/10/2026',
        title: 'Cơ hội thăng tiến rõ ràng, đồng nghiệp thân thiện hỗ trợ nhau',
        pros: 'Quy trình CI/CD và review code rất chuẩn chỉ. Lộ trình phát triển năng lực rõ ràng được đánh giá định kỳ 6 tháng/lần. Ban giám đốc cởi mở.',
        cons: 'Cần chủ động trong công việc vì khối lượng nhiệm vụ tương đối lớn.',
        helpful: 21,
      },
      {
        id: 'rev-3',
        author: 'Product Designer',
        role: 'Nhân viên chính thức • Đã làm việc 1 năm',
        rating: 4.8,
        date: '25/09/2026',
        title: 'Không gian làm việc sáng tạo, khuyến khích thử nghiệm cái mới',
        pros: 'Campus văn phòng hiện đại với nhiều khu vực thư giãn, bóng bàn và phòng gym. Thời gian làm việc linh hoạt giúp cân bằng cuộc sống gia đình.',
        cons: 'Tài liệu hướng dẫn nội bộ của một số dự án cũ cần cập nhật thêm.',
        helpful: 15,
      },
    ],
    cultureGallery: company.cultureGallery || [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    ],
  };
};

export default companyApi;
