/**
 * Seed dữ liệu cho Job Service
 * Bao gồm: Occupation, Specialization, JobPost (với JobPostSpecialization)
 *
 * Chạy lệnh: npm run db:seed
 */

import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── CompanyId đồng bộ từ company-service/prisma/seed.js ──────────────────────
const COMPANIES = {
  FPT:     'd10e0513-4876-43b9-b883-9366df65c821',
  VNG:     'b27d8904-7a32-4e4b-97e2-45e69bf00f33',
  MOMO:    'c3f19472-8804-4c45-b461-71ec50ef9105',
  VIETTEL: 'a4b2c1d0-1234-4567-89ab-cdef01234567',
  SHOPEE:  'e5f6a7b8-9876-4321-ba98-fedcba098765',
  VINAI:   'f6e5d4c3-5678-4321-bcde-123456789abc',
};

// UserId giả lập — recruiter đã tồn tại trong user-service
const USERS = {
  FPT:     'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
  VNG:     'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
  MOMO:    'a1b2c3d4-e5f6-4a7b-8c9d-000000000003',
  VIETTEL: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
  SHOPEE:  'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
  VINAI:   'a1b2c3d4-e5f6-4a7b-8c9d-000000000006',
};

// ── 1. Occupation IDs ─────────────────────────────────────────────────────────
const OCC = {
  IT:      '10000000-0000-4000-8000-000000000001',
  DESIGN:  '10000000-0000-4000-8000-000000000002',
  MKT:     '10000000-0000-4000-8000-000000000003',
  FIN:     '10000000-0000-4000-8000-000000000004',
  SALES:   '10000000-0000-4000-8000-000000000005',
  HR:      '10000000-0000-4000-8000-000000000006',
  PM:      '10000000-0000-4000-8000-000000000007',
};

// ── 2. Specialization IDs ─────────────────────────────────────────────────────
const SPEC = {
  // IT
  FRONTEND:     '20000000-0000-4000-8000-000000000101',
  BACKEND:      '20000000-0000-4000-8000-000000000102',
  FULLSTACK:    '20000000-0000-4000-8000-000000000103',
  MOBILE:       '20000000-0000-4000-8000-000000000104',
  DEVOPS:       '20000000-0000-4000-8000-000000000105',
  DATA:         '20000000-0000-4000-8000-000000000106',
  AI_ML:        '20000000-0000-4000-8000-000000000107',
  QA:           '20000000-0000-4000-8000-000000000108',
  SECURITY:     '20000000-0000-4000-8000-000000000109',
  SYSADMIN:     '20000000-0000-4000-8000-000000000110',
  // Design
  UIUX:         '20000000-0000-4000-8000-000000000201',
  GRAPHIC:      '20000000-0000-4000-8000-000000000202',
  MOTION:       '20000000-0000-4000-8000-000000000203',
  PRODUCT_DES:  '20000000-0000-4000-8000-000000000204',
  // Marketing
  PERF_MKT:     '20000000-0000-4000-8000-000000000301',
  CONTENT_SEO:  '20000000-0000-4000-8000-000000000302',
  BRAND:        '20000000-0000-4000-8000-000000000303',
  SOCIAL:       '20000000-0000-4000-8000-000000000304',
  PROD_MKT:     '20000000-0000-4000-8000-000000000305',
  // Finance
  FIN_ANALYST:  '20000000-0000-4000-8000-000000000401',
  ACCOUNTING:   '20000000-0000-4000-8000-000000000402',
  SECURITIES:   '20000000-0000-4000-8000-000000000403',
  BANKING:      '20000000-0000-4000-8000-000000000404',
  // Sales
  B2B_SALES:    '20000000-0000-4000-8000-000000000501',
  KEY_ACCOUNT:  '20000000-0000-4000-8000-000000000502',
  BIZDEV:       '20000000-0000-4000-8000-000000000503',
  LOGISTICS:    '20000000-0000-4000-8000-000000000504',
  // HR
  RECRUITING:   '20000000-0000-4000-8000-000000000601',
  LND:          '20000000-0000-4000-8000-000000000602',
  CNB:          '20000000-0000-4000-8000-000000000603',
  ADMIN:        '20000000-0000-4000-8000-000000000604',
  // PM
  PROJECT_MGR:  '20000000-0000-4000-8000-000000000701',
  PRODUCT_MGR:  '20000000-0000-4000-8000-000000000702',
  BA:           '20000000-0000-4000-8000-000000000703',
};

// ── 3. Occupation & Specialization data ──────────────────────────────────────
const OCCUPATIONS = [
  {
    occupationId:   OCC.IT,
    occupationName: 'Công nghệ thông tin',
    specializations: [
      { specializationId: SPEC.FRONTEND,    specializationName: 'Lập trình Frontend' },
      { specializationId: SPEC.BACKEND,     specializationName: 'Lập trình Backend' },
      { specializationId: SPEC.FULLSTACK,   specializationName: 'Fullstack Developer' },
      { specializationId: SPEC.MOBILE,      specializationName: 'Mobile Developer (iOS / Android / Flutter)' },
      { specializationId: SPEC.DEVOPS,      specializationName: 'DevOps / SRE / Cloud' },
      { specializationId: SPEC.DATA,        specializationName: 'Data Engineer / Data Science' },
      { specializationId: SPEC.AI_ML,       specializationName: 'AI / Machine Learning / Computer Vision' },
      { specializationId: SPEC.QA,          specializationName: 'QA / QC / Kiểm thử phần mềm' },
      { specializationId: SPEC.SECURITY,    specializationName: 'Bảo mật thông tin / Cybersecurity' },
      { specializationId: SPEC.SYSADMIN,    specializationName: 'Quản trị hệ thống / System Admin' },
    ],
  },
  {
    occupationId:   OCC.DESIGN,
    occupationName: 'Thiết kế & Sáng tạo',
    specializations: [
      { specializationId: SPEC.UIUX,       specializationName: 'UI/UX Designer' },
      { specializationId: SPEC.GRAPHIC,    specializationName: 'Graphic Designer' },
      { specializationId: SPEC.MOTION,     specializationName: 'Motion Graphic / Video Editor' },
      { specializationId: SPEC.PRODUCT_DES,specializationName: 'Product Designer' },
    ],
  },
  {
    occupationId:   OCC.MKT,
    occupationName: 'Marketing & Truyền thông',
    specializations: [
      { specializationId: SPEC.PERF_MKT,   specializationName: 'Performance Marketing / Digital Ads' },
      { specializationId: SPEC.CONTENT_SEO,specializationName: 'Content Marketing / SEO' },
      { specializationId: SPEC.BRAND,      specializationName: 'Brand Marketing' },
      { specializationId: SPEC.SOCIAL,     specializationName: 'Social Media / Community Management' },
      { specializationId: SPEC.PROD_MKT,   specializationName: 'Product Marketing' },
    ],
  },
  {
    occupationId:   OCC.FIN,
    occupationName: 'Tài chính & Ngân hàng',
    specializations: [
      { specializationId: SPEC.FIN_ANALYST,specializationName: 'Phân tích tài chính / Financial Analyst' },
      { specializationId: SPEC.ACCOUNTING, specializationName: 'Kế toán / Kiểm toán' },
      { specializationId: SPEC.SECURITIES, specializationName: 'Chứng khoán & Đầu tư' },
      { specializationId: SPEC.BANKING,    specializationName: 'Ngân hàng bán lẻ & Dịch vụ tài chính' },
    ],
  },
  {
    occupationId:   OCC.SALES,
    occupationName: 'Kinh doanh & Bán hàng',
    specializations: [
      { specializationId: SPEC.B2B_SALES,  specializationName: 'Kinh doanh B2B / B2C' },
      { specializationId: SPEC.KEY_ACCOUNT,specializationName: 'Account Manager / Key Account' },
      { specializationId: SPEC.BIZDEV,     specializationName: 'Phát triển kinh doanh (Business Development)' },
      { specializationId: SPEC.LOGISTICS,  specializationName: 'Xuất nhập khẩu / Logistics' },
    ],
  },
  {
    occupationId:   OCC.HR,
    occupationName: 'Nhân sự & Hành chính',
    specializations: [
      { specializationId: SPEC.RECRUITING, specializationName: 'Tuyển dụng / Talent Acquisition' },
      { specializationId: SPEC.LND,        specializationName: 'Đào tạo & Phát triển nhân lực (L&D)' },
      { specializationId: SPEC.CNB,        specializationName: 'C&B / Lương thưởng & Phúc lợi' },
      { specializationId: SPEC.ADMIN,      specializationName: 'Hành chính văn phòng' },
    ],
  },
  {
    occupationId:   OCC.PM,
    occupationName: 'Quản lý dự án & Sản phẩm',
    specializations: [
      { specializationId: SPEC.PROJECT_MGR,specializationName: 'Project Manager / Scrum Master' },
      { specializationId: SPEC.PRODUCT_MGR,specializationName: 'Product Owner / Product Manager' },
      { specializationId: SPEC.BA,         specializationName: 'Business Analyst (BA)' },
    ],
  },
];

// ── 4. JobPost data ───────────────────────────────────────────────────────────
const now = new Date();
const addDays = (d, n) => new Date(new Date(d).setDate(new Date(d).getDate() + n));

const JOB_POSTS = [
  // ── FPT Software ─────────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000101',
    userId:        USERS.FPT,
    companyId:     COMPANIES.FPT,
    title:         'Senior Frontend Engineer (React / TypeScript)',
    province:      'Hà Nội',
    address:       'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
    description:   'Chịu trách nhiệm thiết kế và xây dựng các giao diện người dùng hiệu suất cao cho hệ thống phần mềm doanh nghiệp quy mô lớn. Làm việc trong môi trường Agile, phối hợp chặt chẽ với đội ngũ Backend, Product và QA.',
    requirements:  'Tối thiểu 3 năm kinh nghiệm với React + TypeScript.\nNắm vững state management (Redux / Zustand / React Query).\nHiểu biết về Web Performance, Accessibility và Responsive Design.\nKinh nghiệm với CI/CD và kiểm thử unit (Jest, Testing Library) là lợi thế.',
    benefits:      'Lương tháng 13 + thưởng hiệu quả kinh doanh hấp dẫn.\nBảo hiểm sức khỏe cao cấp.\nTrợ cấp thiết bị làm việc hiện đại (MacBook Pro).\nCơ hội onsite Nhật Bản, Hàn Quốc, Singapore.',
    workingHours:  'Thứ 2 – Thứ 6, 08:30 – 17:30',
    salaryType:    'RANGE',
    salaryMin:     25000000,
    salaryMax:     40000000,
    experienceMin: 3,
    experienceMax: 5,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     3,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -2),
    deadline:      addDays(now, 28),
    specializationIds: [SPEC.FRONTEND],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000102',
    userId:        USERS.FPT,
    companyId:     COMPANIES.FPT,
    title:         'Java Backend Developer (Spring Boot / Microservices)',
    province:      'Đà Nẵng',
    address:       'FPT Software Đà Nẵng, Khu CNTT tập trung, Ngũ Hành Sơn, Đà Nẵng',
    description:   'Tham gia phát triển và duy trì các hệ thống backend microservices phục vụ khách hàng quốc tế (Nhật Bản, Mỹ). Thiết kế API, tối ưu hiệu năng truy vấn và đảm bảo SLA 99.9%.',
    requirements:  'Trên 2 năm kinh nghiệm lập trình Java với Spring Boot.\nHiểu biết về kiến trúc Microservices, REST API và Message Queue (Kafka/RabbitMQ).\nKinh nghiệm với Docker, Kubernetes là lợi thế lớn.\nKỹ năng tiếng Anh đọc hiểu tài liệu kỹ thuật tốt.',
    benefits:      'Lương thưởng cạnh tranh theo năng lực.\nChứng chỉ quốc tế được tài trợ 100%.\nMôi trường làm việc quốc tế, cơ hội du lịch công tác.',
    workingHours:  'Thứ 2 – Thứ 6, 08:30 – 17:30',
    salaryType:    'RANGE',
    salaryMin:     20000000,
    salaryMax:     35000000,
    experienceMin: 2,
    experienceMax: 5,
    jobLevel:      'MIDDLE',
    educationLevel:'UNIVERSITY',
    vacancies:     5,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -5),
    deadline:      addDays(now, 25),
    specializationIds: [SPEC.BACKEND],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000103',
    userId:        USERS.FPT,
    companyId:     COMPANIES.FPT,
    title:         'QA Automation Engineer (Playwright / Selenium)',
    province:      'Hà Nội',
    address:       'Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội',
    description:   'Xây dựng framework kiểm thử tự động, viết kịch bản test (E2E, API, Regression) và tích hợp vào CI/CD pipeline. Phối hợp với Dev và PO đảm bảo chất lượng phần mềm trước mỗi sprint release.',
    requirements:  'Tối thiểu 1 năm kinh nghiệm kiểm thử phần mềm tự động.\nThành thạo Playwright hoặc Selenium với ngôn ngữ TypeScript/Java.\nHiểu rõ quy trình SDLC và Agile/Scrum.\nTiếng Anh giao tiếp cơ bản.',
    benefits:      'Môi trường chuyên nghiệp, đội ngũ QA lớn mạnh.\nHỗ trợ thi chứng chỉ ISTQB.\nLàm việc linh hoạt 2 ngày WFH / tuần.',
    workingHours:  'Thứ 2 – Thứ 6, 08:30 – 17:30',
    salaryType:    'RANGE',
    salaryMin:     15000000,
    salaryMax:     25000000,
    experienceMin: 1,
    experienceMax: 3,
    jobLevel:      'JUNIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     4,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -3),
    deadline:      addDays(now, 27),
    specializationIds: [SPEC.QA],
  },

  // ── VNG Corporation ───────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000201',
    userId:        USERS.VNG,
    companyId:     COMPANIES.VNG,
    title:         'Principal Software Engineer – Zalo Platform',
    province:      'TP. Hồ Chí Minh',
    address:       'VNG Campus, Đường số 13, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    description:   'Dẫn dắt thiết kế kiến trúc kỹ thuật cho nền tảng nhắn tin Zalo với hàng chục triệu người dùng đồng thời. Mentor đội ngũ kỹ sư cấp cao, ra quyết định kỹ thuật và đảm bảo SLA 99.99%.',
    requirements:  'Trên 7 năm kinh nghiệm phát triển hệ thống phân tán quy mô lớn.\nAm hiểu sâu về Distributed Systems, Consensus Protocols và CAP Theorem.\nKinh nghiệm thực chiến với Go, Java hoặc C++ trong môi trường high-throughput.\nKỹ năng leadership và mentoring.',
    benefits:      'Gói lương thưởng top-tier trên thị trường.\nCổ phiếu thưởng ESOP hàng năm.\nBảo hiểm sức khỏe VIP cả gia đình.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'NEGOTIABLE',
    salaryMin:     null,
    salaryMax:     null,
    experienceMin: 7,
    experienceMax: null,
    jobLevel:      'LEAD',
    educationLevel:'UNIVERSITY',
    vacancies:     1,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -1),
    deadline:      addDays(now, 30),
    specializationIds: [SPEC.BACKEND, SPEC.DEVOPS],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000202',
    userId:        USERS.VNG,
    companyId:     COMPANIES.VNG,
    title:         'Senior React Native Developer – ZaloPay',
    province:      'TP. Hồ Chí Minh',
    address:       'VNG Campus, Đường số 13, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    description:   'Phát triển tính năng thanh toán di động trên nền tảng ZaloPay (React Native). Đảm bảo hiệu năng 60fps, bảo mật giao dịch và trải nghiệm người dùng mượt mà trên cả iOS lẫn Android.',
    requirements:  'Tối thiểu 3 năm kinh nghiệm với React Native.\nAm hiểu về tích hợp cổng thanh toán, bảo mật mobile (SSL Pinning).\nKinh nghiệm với native modules (Objective-C/Swift, Kotlin/Java).\nCó ứng dụng đã phát hành trên App Store / Google Play là lợi thế lớn.',
    benefits:      'Mức lương cạnh tranh top 10% thị trường.\nThưởng hiệu suất hàng quý, thưởng tết hấp dẫn.\nMôi trường kỹ thuật hàng đầu, đồng đội giỏi.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'RANGE',
    salaryMin:     30000000,
    salaryMax:     50000000,
    experienceMin: 3,
    experienceMax: 6,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     2,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -2),
    deadline:      addDays(now, 33),
    specializationIds: [SPEC.MOBILE],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000203',
    userId:        USERS.VNG,
    companyId:     COMPANIES.VNG,
    title:         'Product Manager – Zing MP3 / Zing News',
    province:      'TP. Hồ Chí Minh',
    address:       'VNG Campus, Đường số 13, KCX Tân Thuận, Quận 7, TP. Hồ Chí Minh',
    description:   'Định hướng chiến lược sản phẩm, viết PRD và dẫn dắt đội ngũ cross-functional (Dev, Design, QA, Marketing) đưa tính năng mới ra thị trường. Phân tích dữ liệu người dùng, A/B test và tối ưu hóa funnel chuyển đổi.',
    requirements:  'Trên 3 năm kinh nghiệm Product Manager trong lĩnh vực consumer tech / mobile app.\nTư duy hướng dữ liệu mạnh, thành thạo SQL cơ bản và các BI tool.\nKỹ năng viết PRD, User Story và dẫn dắt sprint planning.',
    benefits:      'Mức thưởng hiệu suất hấp dẫn gắn với KPI sản phẩm.\nSản phẩm hàng chục triệu MAU tại Việt Nam.\nCơ hội học hỏi từ các chuyên gia sản phẩm kỳ cựu.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'RANGE',
    salaryMin:     35000000,
    salaryMax:     55000000,
    experienceMin: 3,
    experienceMax: null,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     1,
    workMode:      'ONSITE',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -4),
    deadline:      addDays(now, 20),
    specializationIds: [SPEC.PRODUCT_MGR],
  },

  // ── MoMo ──────────────────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000301',
    userId:        USERS.MOMO,
    companyId:     COMPANIES.MOMO,
    title:         'Lead UI/UX Designer – Super App MoMo',
    province:      'TP. Hồ Chí Minh',
    address:       'Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Quận 7, TP. Hồ Chí Minh',
    description:   'Dẫn dắt nhóm designer 5-7 người, xây dựng và duy trì Design System chuẩn mực cho siêu ứng dụng MoMo. Đặt ra tiêu chuẩn chất lượng UX, tổ chức user research và đảm bảo trải nghiệm nhất quán trên mọi touchpoint.',
    requirements:  'Tối thiểu 5 năm kinh nghiệm UI/UX Design, trong đó ít nhất 1 năm vị trí Lead/Senior.\nPortfolio xuất sắc thể hiện tư duy thiết kế sản phẩm tài chính số.\nThành thạo Figma (Variables, Auto Layout, Component Library).\nKỹ năng dẫn dắt và trình bày ý tưởng với stakeholder.',
    benefits:      'Lương cạnh tranh top thị trường, review 2 lần/năm.\nNgân sách học tập & hội nghị thiết kế quốc tế.\nBảo hiểm sức khỏe toàn diện.',
    workingHours:  'Thứ 2 – Thứ 6, 08:30 – 17:30',
    salaryType:    'RANGE',
    salaryMin:     40000000,
    salaryMax:     65000000,
    experienceMin: 5,
    experienceMax: null,
    jobLevel:      'LEAD',
    educationLevel:'UNIVERSITY',
    vacancies:     1,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -3),
    deadline:      addDays(now, 35),
    specializationIds: [SPEC.UIUX, SPEC.PRODUCT_DES],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000302',
    userId:        USERS.MOMO,
    companyId:     COMPANIES.MOMO,
    title:         'Data Analyst – Growth & Retention (Fintech)',
    province:      'TP. Hồ Chí Minh',
    address:       'Tòa nhà Phú Mỹ Hưng, Hoàng Văn Thái, Quận 7, TP. Hồ Chí Minh',
    description:   'Phân tích hành vi người dùng và dữ liệu giao dịch để hỗ trợ đội ngũ Growth tối ưu chiến lược giữ chân người dùng (retention), tăng trưởng GMV và triển khai các chương trình khuyến mãi có ROI cao.',
    requirements:  'Trên 2 năm kinh nghiệm phân tích dữ liệu trong môi trường fintech/e-commerce.\nThành thạo SQL nâng cao, Python (Pandas, NumPy) và BI tool (Looker, Metabase, Power BI).\nKinh nghiệm xây dựng cohort analysis, funnel analysis, A/B test.',
    benefits:      'Làm việc với dataset hàng triệu giao dịch thực tế mỗi ngày.\nThưởng KPI hàng quý dựa trên impact thực tế của phân tích.\nBảo hiểm Bảo Việt Sức Khỏe Toàn Diện.',
    workingHours:  'Thứ 2 – Thứ 6, 08:30 – 17:30',
    salaryType:    'RANGE',
    salaryMin:     22000000,
    salaryMax:     38000000,
    experienceMin: 2,
    experienceMax: 5,
    jobLevel:      'MIDDLE',
    educationLevel:'UNIVERSITY',
    vacancies:     2,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -1),
    deadline:      addDays(now, 29),
    specializationIds: [SPEC.DATA],
  },

  // ── Viettel ───────────────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000401',
    userId:        USERS.VIETTEL,
    companyId:     COMPANIES.VIETTEL,
    title:         'DevOps / Cloud Engineer (AWS / Kubernetes)',
    province:      'Hà Nội',
    address:       'Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    description:   'Thiết kế, triển khai và vận hành hạ tầng đám mây cho hệ thống viễn thông và dịch vụ số Viettel. Xây dựng IaC pipeline, giám sát hệ thống 24/7 và tự động hóa toàn bộ quy trình deploy.',
    requirements:  'Trên 3 năm kinh nghiệm DevOps/Cloud Engineering với AWS hoặc Azure.\nThành thạo Kubernetes, Helm, Terraform, Ansible và GitLab CI.\nKinh nghiệm xây dựng observability stack (Prometheus, Grafana, ELK).\nHiểu biết về bảo mật hạ tầng đám mây (IAM, VPC, WAF).',
    benefits:      'Chế độ đãi ngộ hàng đầu ngành viễn thông nhà nước.\nBảo hiểm sức khỏe VIP toàn diện.\nĐược tài trợ thi chứng chỉ AWS / CKA / CKAD.',
    workingHours:  'Thứ 2 – Thứ 6, 08:00 – 17:00',
    salaryType:    'RANGE',
    salaryMin:     28000000,
    salaryMax:     48000000,
    experienceMin: 3,
    experienceMax: 7,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     3,
    workMode:      'ONSITE',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -6),
    deadline:      addDays(now, 24),
    specializationIds: [SPEC.DEVOPS],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000402',
    userId:        USERS.VIETTEL,
    companyId:     COMPANIES.VIETTEL,
    title:         'Flutter Mobile Developer (5G IoT Platform)',
    province:      'Hà Nội',
    address:       'Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    description:   'Phát triển ứng dụng di động đa nền tảng phục vụ hệ sinh thái IoT và Smart City của Viettel. Tích hợp với backend thời gian thực (5G/MQTT) và đảm bảo UX mượt mà trên thiết bị đa dạng.',
    requirements:  'Tối thiểu 2 năm kinh nghiệm lập trình Flutter / Dart.\nHiểu rõ State Management (Bloc, Riverpod, Provider) và Clean Architecture.\nKinh nghiệm tích hợp WebSocket, MQTT hoặc REST API trong ứng dụng di động.',
    benefits:      'Tham gia dự án công nghệ quốc gia có tầm ảnh hưởng lớn.\nLương cạnh tranh, thưởng KPI rõ ràng.\nMôi trường làm việc ổn định, lâu dài.',
    workingHours:  'Thứ 2 – Thứ 6, 08:00 – 17:00',
    salaryType:    'RANGE',
    salaryMin:     20000000,
    salaryMax:     35000000,
    experienceMin: 2,
    experienceMax: 5,
    jobLevel:      'MIDDLE',
    educationLevel:'UNIVERSITY',
    vacancies:     4,
    workMode:      'ONSITE',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -4),
    deadline:      addDays(now, 26),
    specializationIds: [SPEC.MOBILE],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000403',
    userId:        USERS.VIETTEL,
    companyId:     COMPANIES.VIETTEL,
    title:         'Chuyên viên Bảo mật Thông tin (Security Analyst)',
    province:      'Hà Nội',
    address:       'Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
    description:   'Đánh giá rủi ro bảo mật, giám sát hệ thống SIEM, ứng phó sự cố (Incident Response) và thực hiện kiểm tra xâm nhập (pentest) định kỳ cho hạ tầng viễn thông Viettel.',
    requirements:  'Tối thiểu 2 năm kinh nghiệm trong lĩnh vực bảo mật thông tin.\nCó chứng chỉ CEH, OSCP, CompTIA Security+ hoặc tương đương là lợi thế lớn.\nAm hiểu về OWASP Top 10, CVE, MITRE ATT&CK Framework.',
    benefits:      'Làm việc trong môi trường bảo mật quy mô quốc gia.\nTài trợ học và thi chứng chỉ bảo mật quốc tế.\nMức lương hấp dẫn, chính sách phúc lợi nhà nước.',
    workingHours:  'Thứ 2 – Thứ 6, 08:00 – 17:00',
    salaryType:    'RANGE',
    salaryMin:     22000000,
    salaryMax:     40000000,
    experienceMin: 2,
    experienceMax: 5,
    jobLevel:      'MIDDLE',
    educationLevel:'UNIVERSITY',
    vacancies:     2,
    workMode:      'ONSITE',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -7),
    deadline:      addDays(now, 23),
    specializationIds: [SPEC.SECURITY],
  },

  // ── Shopee ────────────────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000501',
    userId:        USERS.SHOPEE,
    companyId:     COMPANIES.SHOPEE,
    title:         'Senior Backend Engineer – Logistics Platform (Go)',
    province:      'TP. Hồ Chí Minh',
    address:       'Tầng 17, Saigon Centre Tower 2, 67 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    description:   'Xây dựng và tối ưu hóa hệ thống backend cho nền tảng logistics Shopee Express. Xử lý hàng chục ngàn đơn hàng mỗi giây, đảm bảo tính nhất quán dữ liệu và khả năng mở rộng đến hàng tỷ giao dịch mỗi năm.',
    requirements:  'Trên 3 năm kinh nghiệm backend, ưu tiên Go hoặc Java.\nKinh nghiệm thiết kế hệ thống phân tán quy mô lớn (Distributed Systems).\nThành thạo PostgreSQL, Kafka, Redis trong môi trường production.',
    benefits:      'Gói lương thưởng hàng đầu khu vực (top 5% market).\nBảo hiểm sức khỏe quốc tế mở rộng cho gia đình.\nCơ hội chuyển làm việc tại Singapore, Indonesia.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'RANGE',
    salaryMin:     35000000,
    salaryMax:     60000000,
    experienceMin: 3,
    experienceMax: null,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     3,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -2),
    deadline:      addDays(now, 38),
    specializationIds: [SPEC.BACKEND, SPEC.DEVOPS],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000502',
    userId:        USERS.SHOPEE,
    companyId:     COMPANIES.SHOPEE,
    title:         'Performance Marketing Manager – Shopee Vietnam',
    province:      'TP. Hồ Chí Minh',
    address:       'Tầng 17, Saigon Centre Tower 2, 67 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    description:   'Lên chiến lược và quản lý toàn bộ ngân sách quảng cáo performance (Google, Meta, TikTok) cho các chiến dịch thương mại điện tử lớn (9.9, 10.10, 11.11, 12.12). Phân tích ROI và tối ưu hóa CPA theo thời gian thực.',
    requirements:  'Tối thiểu 3 năm kinh nghiệm Performance Marketing tại e-commerce hoặc retail.\nThành thạo Google Ads, Meta Ads Manager, TikTok Ads và các DSP.\nTư duy phân tích số liệu mạnh, thành thạo BigQuery cơ bản.',
    benefits:      'Ngân sách marketing lớn, cơ hội thử nghiệm chiến dịch sáng tạo.\nThưởng KPI theo campaign performance.\nMôi trường quốc tế, làm việc với đội ngũ SEA region.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'RANGE',
    salaryMin:     25000000,
    salaryMax:     45000000,
    experienceMin: 3,
    experienceMax: 6,
    jobLevel:      'SENIOR',
    educationLevel:'UNIVERSITY',
    vacancies:     1,
    workMode:      'ONSITE',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -5),
    deadline:      addDays(now, 21),
    specializationIds: [SPEC.PERF_MKT],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000503',
    userId:        USERS.SHOPEE,
    companyId:     COMPANIES.SHOPEE,
    title:         'Thực tập sinh Lập trình (Software Engineer Intern)',
    province:      'TP. Hồ Chí Minh',
    address:       'Tầng 17, Saigon Centre Tower 2, 67 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    description:   'Tham gia phát triển tính năng thực tế cho sản phẩm Shopee dưới sự hướng dẫn của Senior Engineer. Có cơ hội chuyển đổi thành nhân viên chính thức sau kỳ thực tập 4-6 tháng.',
    requirements:  'Sinh viên năm 3, năm cuối chuyên ngành Kỹ thuật phần mềm, CNTT hoặc tương đương.\nNắm chắc nền tảng thuật toán và cấu trúc dữ liệu.\nCó kiến thức cơ bản về ít nhất 1 ngôn ngữ: Python, Java, Go, hoặc TypeScript.',
    benefits:      'Trợ cấp thực tập cạnh tranh (10-15 triệu/tháng).\nMentor 1-1 là Senior/Staff Engineer từ Shopee.\nCơ hội trở thành nhân viên chính thức sau khi tốt nghiệp.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00 (có thể thỏa thuận part-time)',
    salaryType:    'RANGE',
    salaryMin:     10000000,
    salaryMax:     15000000,
    experienceMin: 0,
    experienceMax: 1,
    jobLevel:      'INTERN',
    educationLevel:'UNIVERSITY',
    vacancies:     10,
    workMode:      'HYBRID',
    employmentType:'INTERNSHIP',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -1),
    deadline:      addDays(now, 15),
    specializationIds: [SPEC.FRONTEND, SPEC.BACKEND, SPEC.FULLSTACK],
  },

  // ── VinAI ─────────────────────────────────────────────────────────────────
  {
    jobId:         '30000000-0000-4000-8000-000000000601',
    userId:        USERS.VINAI,
    companyId:     COMPANIES.VINAI,
    title:         'Research Scientist – Computer Vision (PhD preferred)',
    province:      'Hà Nội',
    address:       'Tòa nhà Symphony, Chu Huy Mân, Phúc Lợi, Long Biên, Hà Nội',
    description:   'Nghiên cứu và phát triển các mô hình Computer Vision tiên tiến (Object Detection, Image Segmentation, Generative AI) phục vụ xe tự hành và các sản phẩm AI thương mại của VinAI. Công bố bài báo tại top-tier conferences (NeurIPS, CVPR, ICCV).',
    requirements:  'Bằng Tiến sĩ (hoặc đang nghiên cứu sinh) chuyên ngành Computer Vision, Machine Learning, hoặc AI.\nCó track record công bố bài báo tại CVPR, ICCV, ECCV, NeurIPS, ICML.\nThành thạo Python, PyTorch / TensorFlow.',
    benefits:      'Gói lương & đãi ngộ cạnh tranh với các viện nghiên cứu AI toàn cầu.\nNgân sách GPU computing lớn (A100/H100 cluster).\nHỗ trợ tham dự và trình bày tại hội nghị khoa học quốc tế.',
    workingHours:  'Linh hoạt (Researcher-friendly schedule)',
    salaryType:    'NEGOTIABLE',
    salaryMin:     null,
    salaryMax:     null,
    experienceMin: 2,
    experienceMax: null,
    jobLevel:      'SENIOR',
    educationLevel:'POSTGRADUATE',
    vacancies:     3,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -3),
    deadline:      addDays(now, 45),
    specializationIds: [SPEC.AI_ML],
  },
  {
    jobId:         '30000000-0000-4000-8000-000000000602',
    userId:        USERS.VINAI,
    companyId:     COMPANIES.VINAI,
    title:         'MLOps Engineer – AI Platform Infrastructure',
    province:      'Hà Nội',
    address:       'Tòa nhà Symphony, Chu Huy Mân, Phúc Lợi, Long Biên, Hà Nội',
    description:   'Xây dựng và vận hành nền tảng MLOps phục vụ đội ngũ Research tại VinAI. Tự động hóa pipeline huấn luyện mô hình, quản lý thực nghiệm (experiment tracking), triển khai và giám sát mô hình AI trong production.',
    requirements:  'Trên 2 năm kinh nghiệm MLOps / AI Infrastructure.\nThành thạo MLflow, Kubeflow, Weights & Biases hoặc DVC.\nKinh nghiệm với Kubernetes, Docker và cloud platform (AWS/GCP).',
    benefits:      'Làm việc trong môi trường nghiên cứu AI hàng đầu Đông Nam Á.\nTiếp cận GPU cluster A100/H100 quy mô lớn.\nHỗ trợ giấy phép học tập, tham dự hội nghị kỹ thuật.',
    workingHours:  'Thứ 2 – Thứ 6, 09:00 – 18:00',
    salaryType:    'RANGE',
    salaryMin:     30000000,
    salaryMax:     55000000,
    experienceMin: 2,
    experienceMax: 6,
    jobLevel:      'MIDDLE',
    educationLevel:'UNIVERSITY',
    vacancies:     2,
    workMode:      'HYBRID',
    employmentType:'FULL_TIME',
    status:        'PUBLISHED',
    publishedAt:   addDays(now, -5),
    deadline:      addDays(now, 40),
    specializationIds: [SPEC.AI_ML, SPEC.DEVOPS],
  },
];

// ── Hàm seed chính ────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱  Bắt đầu seed dữ liệu Job Service...\n');

  // 1. Seed Occupation & Specialization
  console.log('📁  [1/3] Seed Occupation & Specialization...');
  for (const occ of OCCUPATIONS) {
    const { specializations, ...occData } = occ;

    await prisma.occupation.upsert({
      where:  { occupationId: occData.occupationId },
      update: { occupationName: occData.occupationName },
      create: { occupationId: occData.occupationId, occupationName: occData.occupationName },
    });

    for (const spec of specializations) {
      await prisma.specialization.upsert({
        where:  { specializationId: spec.specializationId },
        update: { specializationName: spec.specializationName },
        create: {
          specializationId:   spec.specializationId,
          specializationName: spec.specializationName,
          occupationId:       occData.occupationId,
        },
      });
    }
    console.log(`   ✓ ${occData.occupationName} (${specializations.length} chuyên ngành)`);
  }

  // 2. Seed JobPost + JobPostSpecialization
  console.log('\n📋  [2/3] Seed JobPost...');
  for (const jobData of JOB_POSTS) {
    const { specializationIds, ...jobFields } = jobData;

    // Upsert JobPost
    await prisma.jobPost.upsert({
      where:  { jobId: jobFields.jobId },
      update: {
        title:       jobFields.title,
        status:      jobFields.status,
        salaryMin:   jobFields.salaryMin,
        salaryMax:   jobFields.salaryMax,
        deadline:    jobFields.deadline,
        publishedAt: jobFields.publishedAt,
        updatedAt:   new Date(),
      },
      create: jobFields,
    });

    // Upsert JobPostSpecialization (xóa cũ rồi tạo lại để đồng bộ)
    await prisma.jobPostSpecialization.deleteMany({ where: { jobId: jobFields.jobId } });
    await prisma.jobPostSpecialization.createMany({
      data: specializationIds.map((sid) => ({
        jobId:           jobFields.jobId,
        specializationId: sid,
      })),
      skipDuplicates: true,
    });

    console.log(`   ✓ [${jobFields.status}] ${jobFields.title}`);
  }

  // 3. Tổng kết
  const jobCount  = await prisma.jobPost.count();
  const occCount  = await prisma.occupation.count();
  const specCount = await prisma.specialization.count();

  console.log('\n📊  [3/3] Thống kê dữ liệu sau seed:');
  console.log(`   • Occupation:     ${occCount}`);
  console.log(`   • Specialization: ${specCount}`);
  console.log(`   • JobPost:        ${jobCount}`);
  console.log('\n✅  Seed dữ liệu Job Service hoàn tất!\n');
}

seed()
  .catch((err) => {
    console.error('\n❌  Lỗi khi seed dữ liệu:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
