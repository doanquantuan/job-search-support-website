/**
 * Seed dữ liệu chi tiết cho User Service
 * Bao gồm: Profile, Educations, Experiences, Skills, CVs, Company mapping cho Recruiter
 * Chạy lệnh: npm run db:seed
 */
import 'dotenv/config';
import prisma from '../src/config/prisma.js';

const CANDIDATE_1_ID = 'c1b2c3d4-e5f6-4a7b-8c9d-000000000001';
const RECRUITER_FPT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001';
const FPT_COMPANY_ID = 'd10e0513-4876-43b9-b883-9366df65c821';

const SAMPLE_SKILLS = [
  { skillId: '50000000-0000-4000-8000-000000000001', skillName: 'React.js' },
  { skillId: '50000000-0000-4000-8000-000000000002', skillName: 'Node.js' },
  { skillId: '50000000-0000-4000-8000-000000000003', skillName: 'TypeScript' },
  { skillId: '50000000-0000-4000-8000-000000000004', skillName: 'Java Spring Boot' },
  { skillId: '50000000-0000-4000-8000-000000000005', skillName: 'Docker & Kubernetes' },
  { skillId: '50000000-0000-4000-8000-000000000006', skillName: 'AWS Cloud' },
  { skillId: '50000000-0000-4000-8000-000000000007', skillName: 'PostgreSQL' },
  { skillId: '50000000-0000-4000-8000-000000000008', skillName: 'UI/UX Design' },
];

async function seed() {
  console.log('--- Đang bắt đầu seed dữ liệu mở rộng cho User Service ---');

  // 1. Seed Skills
  console.log('1. Đang nạp danh mục Kỹ năng (skills)...');
  const skillMap = new Map();
  for (const s of SAMPLE_SKILLS) {
    const record = await prisma.skill.upsert({
      where: { skillName: s.skillName },
      update: { skillName: s.skillName },
      create: {
        skillId: s.skillId,
        skillName: s.skillName,
      },
    });
    skillMap.set(s.skillName, record.skillId);
  }
  console.log(`✓ Đã nạp ${SAMPLE_SKILLS.length} kỹ năng chuyên môn.`);

  // 2. Cập nhật Recruiter gán trực tiếp với FPT Software
  try {
    await prisma.recruiter.upsert({
      where: { userId: RECRUITER_FPT_ID },
      update: {
        companyId: FPT_COMPANY_ID,
        isVerified: true,
        position: 'Trưởng phòng Tuyển dụng Công nghệ',
      },
      create: {
        userId: RECRUITER_FPT_ID,
        companyId: FPT_COMPANY_ID,
        isVerified: true,
        position: 'Trưởng phòng Tuyển dụng Công nghệ',
      },
    });
    console.log('✓ Đã đồng bộ liên kết Recruiter 1 -> FPT Software');
  } catch (err) {
    console.warn('! Lưu ý khi map recruiter FPT:', err.message);
  }

  // 3. Seed Profile cho Candidate 1 (Lê Văn Ứng Viên)
  try {
    await prisma.profile.upsert({
      where: { userId: CANDIDATE_1_ID },
      update: {
        contactEmail: 'candidate@joblink.vn',
        phone: '0987 654 321',
        gender: 'MALE',
        address: 'Quận Cầu Giấy, Hà Nội',
        githubUrl: 'https://github.com/levanungvien',
      },
      create: {
        userId: CANDIDATE_1_ID,
        contactEmail: 'candidate@joblink.vn',
        phone: '0987 654 321',
        gender: 'MALE',
        address: 'Quận Cầu Giấy, Hà Nội',
        githubUrl: 'https://github.com/levanungvien',
      },
    });

    // Seed Educations
    await prisma.education.deleteMany({ where: { userId: CANDIDATE_1_ID } });
    await prisma.education.create({
      data: {
        userId: CANDIDATE_1_ID,
        institution: 'Đại học Bách Khoa Hà Nội',
        major: 'Công nghệ Thông tin (Kỹ sư Phần mềm)',
        startDate: new Date('2018-09-01'),
        endDate: new Date('2023-06-30'),
        description: 'Tốt nghiệp loại Giỏi, GPA 3.6/4.0',
      },
    });

    // Seed Experiences
    await prisma.experience.deleteMany({ where: { userId: CANDIDATE_1_ID } });
    await prisma.experience.createMany({
      data: [
        {
          userId: CANDIDATE_1_ID,
          companyName: 'FPT Software',
          position: 'Frontend Developer (React/TS)',
          startDate: new Date('2023-07-01'),
          endDate: new Date('2025-10-01'),
          description: 'Xây dựng Web Portal doanh nghiệp phục vụ 200,000 người dùng hàng ngày.',
        },
      ],
    });

    // Seed Skills cho Profile
    await prisma.profileSkill.deleteMany({ where: { userId: CANDIDATE_1_ID } });
    const skillsToAssign = [
      skillMap.get('React.js'),
      skillMap.get('Node.js'),
      skillMap.get('TypeScript'),
    ].filter(Boolean);

    await prisma.profileSkill.createMany({
      data: skillsToAssign.map((skillId) => ({
        userId: CANDIDATE_1_ID,
        skillId,
      })),
      skipDuplicates: true,
    });

    // Seed CV
    await prisma.cV.deleteMany({ where: { userId: CANDIDATE_1_ID } });
    await prisma.cV.create({
      data: {
        cvId: '60000000-0000-4000-8000-000000000001',
        userId: CANDIDATE_1_ID,
        title: 'CV_LeVanUngVien_Fullstack_2026.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    });

    console.log('✓ Đã tạo Profile, Học vấn, Kinh nghiệm, Kỹ năng và CV cho Ứng viên 1');
  } catch (err) {
    console.warn('! Lưu ý khi seed Profile ứng viên 1:', err.message);
  }

  console.log('--- Hoàn tất seed dữ liệu User Service! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Lỗi khi seed User Service:', err);
  process.exit(1);
});
