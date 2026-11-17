/**
 * Seed dữ liệu tuyển dụng & ATS cho Application Service
 * Chạy lệnh: npm run db:seed
 */
import 'dotenv/config';
import prisma from '../src/config/prisma.js';

const CANDIDATES = [
  {
    id: 'c1b2c3d4-e5f6-4a7b-8c9d-000000000001',
    email: 'candidate@joblink.vn',
    fullName: 'Lê Văn Ứng Viên',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '0987 654 321',
    role: 'JOB_SEEKER',
  },
  {
    id: 'c1b2c3d4-e5f6-4a7b-8c9d-000000000002',
    email: 'candidate.frontend@joblink.vn',
    fullName: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '0912 333 444',
    role: 'JOB_SEEKER',
  },
  {
    id: 'c1b2c3d4-e5f6-4a7b-8c9d-000000000003',
    email: 'candidate.backend@joblink.vn',
    fullName: 'Phạm Hoàng Long',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '0933 555 777',
    role: 'JOB_SEEKER',
  },
];

const JOB_POSTS = [
  {
    jobId: '30000000-0000-4000-8000-000000000101',
    companyId: 'd10e0513-4876-43b9-b883-9366df65c821', // FPT Software
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', // recruiter@joblink.vn
    title: 'Senior Frontend Engineer (React / TypeScript)',
    status: 'PUBLISHED',
  },
  {
    jobId: '30000000-0000-4000-8000-000000000102',
    companyId: 'd10e0513-4876-43b9-b883-9366df65c821', // FPT Software
    recruiterId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', // recruiter@joblink.vn
    title: 'Java Backend Developer (Spring Boot / Microservices)',
    status: 'PUBLISHED',
  },
];

const APPLICATIONS = [
  {
    applicationId: '70000000-0000-4000-8000-000000000001',
    jobSeekerId: CANDIDATES[0].id,
    jobId: JOB_POSTS[0].jobId,
    cvId: '60000000-0000-4000-8000-000000000001',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_LeVanUngVien_React_Senior.pdf',
    coverLetter: 'Kính gửi ban tuyển dụng FPT Software, tôi có hơn 3 năm kinh nghiệm React, TypeScript và rất mong muốn được cống hiến cho công ty.',
    applicationStatus: 'INTERVIEW',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    histories: [
      { status: 'APPLIED', note: 'Ứng viên nộp hồ sơ qua website', daysAgo: 5 },
      { status: 'VIEWED', note: 'HR đã xem hồ sơ', daysAgo: 4 },
      { status: 'REVIEWING', note: 'Chuyển Tech Lead đánh giá năng lực', daysAgo: 3 },
      { status: 'INTERVIEW', note: 'Mời phỏng vấn kỹ thuật Vòng 1 qua MS Teams', daysAgo: 1 },
    ],
  },
  {
    applicationId: '70000000-0000-4000-8000-000000000002',
    jobSeekerId: CANDIDATES[1].id,
    jobId: JOB_POSTS[0].jobId,
    cvId: '60000000-0000-4000-8000-000000000002',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_TranThiMai_Frontend.pdf',
    coverLetter: 'Tôi đã từng làm việc tại TechCorp với vị trí Senior Frontend trong 4 năm.',
    applicationStatus: 'HIRED',
    appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    histories: [
      { status: 'APPLIED', note: 'Ứng viên nộp hồ sơ', daysAgo: 10 },
      { status: 'INTERVIEW', note: 'Phỏng vấn hoàn tất tốt', daysAgo: 4 },
      { status: 'HIRED', note: 'Đã gửi offer và ứng viên đã đồng ý nhận việc', daysAgo: 1 },
    ],
  },
  {
    applicationId: '70000000-0000-4000-8000-000000000003',
    jobSeekerId: CANDIDATES[2].id,
    jobId: JOB_POSTS[1].jobId,
    cvId: '60000000-0000-4000-8000-000000000003',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_PhamHoangLong_Java_Spring.pdf',
    coverLetter: 'Thành thạo Spring Boot, Docker, K8s, đã xử lý các hệ thống tải cao.',
    applicationStatus: 'REVIEWING',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    histories: [
      { status: 'APPLIED', note: 'Nộp hồ sơ trực tuyến', daysAgo: 2 },
      { status: 'REVIEWING', note: 'Đang chấm điểm kỹ năng theo tiêu chuẩn dự án', daysAgo: 1 },
    ],
  },
  {
    applicationId: '70000000-0000-4000-8000-000000000004',
    jobSeekerId: CANDIDATES[0].id,
    jobId: JOB_POSTS[1].jobId,
    cvId: '60000000-0000-4000-8000-000000000001',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cvTitle: 'CV_LeVanUngVien_Fullstack.pdf',
    coverLetter: 'Ứng tuyển thêm vị trí Java Backend do có kinh nghiệm fullstack.',
    applicationStatus: 'APPLIED',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    histories: [
      { status: 'APPLIED', note: 'Hồ sơ mới gửi', daysAgo: 1 },
    ],
  },
];

async function seed() {
  console.log('--- Đang bắt đầu seed dữ liệu Application Service ---');

  // 1. Seed replicated Users & JobSeekers
  for (const c of CANDIDATES) {
    await prisma.user.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
    await prisma.jobSeeker.upsert({
      where: { userId: c.id },
      update: {},
      create: { userId: c.id },
    });
    console.log(`✓ [Replication] User & JobSeeker: ${c.fullName}`);
  }

  // 2. Seed replicated JobPosts
  for (const j of JOB_POSTS) {
    await prisma.jobPost.upsert({
      where: { jobId: j.jobId },
      update: j,
      create: j,
    });
    console.log(`✓ [Replication] JobPost: ${j.title}`);
  }

  // 3. Seed Applications & Status Histories
  for (const app of APPLICATIONS) {
    const { histories, ...appData } = app;
    await prisma.application.upsert({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId: appData.jobSeekerId,
          jobId: appData.jobId,
        },
      },
      update: appData,
      create: appData,
    });

    // Seed Histories
    await prisma.applicationStatusHistory.deleteMany({
      where: { applicationId: appData.applicationId },
    });

    for (const h of histories) {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: appData.applicationId,
          applicationStatus: h.status,
          changedAt: new Date(Date.now() - (h.daysAgo || 0) * 24 * 60 * 60 * 1000),
          note: h.note,
        },
      });
    }

    console.log(`✓ [Application] ${appData.applicationStatus} | CV: ${appData.cvTitle}`);
  }

  const totalApps = await prisma.application.count();
  console.log(`\n📊  Tổng số hồ sơ ứng tuyển (ATS) sau seed: ${totalApps}`);
  console.log('✅  Seed dữ liệu Application Service hoàn tất!\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi seed Application Service:', err);
  process.exit(1);
});
