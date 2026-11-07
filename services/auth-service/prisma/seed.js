/**
 * Seed tài khoản mẫu cho Auth Service & User Service
 * Chạy lệnh: npm run db:seed (trong thư mục services/auth-service)
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

const authPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/job_search_auth'
});

const userDbUrl = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('job_search_auth', 'job_search_user')
  : 'postgresql://postgres:123456@localhost:5432/job_search_user';

const userPool = new Pool({ connectionString: userDbUrl });

const SEED_USERS = [
  {
    id: '99999999-9999-9999-9999-999999999999',
    email: 'admin@joblink.vn',
    fullName: 'Quản Trị Viên Hệ Thống',
    passwordRaw: 'Admin@123456',
    role: 'ADMIN',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
    email: 'recruiter@joblink.vn',
    fullName: 'Nguyễn HR (FPT Software)',
    passwordRaw: 'Recruiter@123456',
    role: 'RECRUITER',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
    email: 'candidate@joblink.vn',
    fullName: 'Lê Văn Ứng Viên',
    passwordRaw: 'Candidate@123456',
    role: 'JOB_SEEKER',
  },
];

async function seed() {
  console.log('--- Đang bắt đầu seed tài khoản mẫu (Auth Service & User Service) ---');
  
  const salt = await bcrypt.genSalt(10);

  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.passwordRaw, salt);

    // 1. Seed vào Auth DB (auth_users)
    try {
      await authPool.query(
        `INSERT INTO auth_users (id, email, "fullName", "passwordHash", role, status, "isVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', true, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE 
         SET "fullName" = EXCLUDED."fullName",
             "passwordHash" = EXCLUDED."passwordHash",
             role = EXCLUDED.role,
             "isVerified" = true,
             status = 'ACTIVE'`,
        [u.id, u.email, u.fullName, passwordHash, u.role]
      );
      console.log(`✓ [auth_users] Đã tạo/cập nhật: ${u.email} (Role: ${u.role})`);
    } catch (err) {
      console.error(`✗ [auth_users] Lỗi khi tạo ${u.email}:`, err.message);
    }

    // 2. Seed vào User DB (users, admins, recruiters, job_seekers)
    try {
      await userPool.query(
        `INSERT INTO users (id, email, "fullName", role, status, "isVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'ACTIVE', true, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE
         SET "fullName" = EXCLUDED."fullName",
             role = EXCLUDED.role,
             status = 'ACTIVE',
             "isVerified" = true`,
        [u.id, u.email, u.fullName, u.role]
      );

      if (u.role === 'ADMIN') {
        await userPool.query(
          `INSERT INTO admins ("userId", "createdAt", "updatedAt")
           VALUES ($1, NOW(), NOW())
           ON CONFLICT ("userId") DO NOTHING`,
          [u.id]
        );
      } else if (u.role === 'RECRUITER') {
        await userPool.query(
          `INSERT INTO recruiters ("userId", "isVerified", "createdAt", "updatedAt")
           VALUES ($1, true, NOW(), NOW())
           ON CONFLICT ("userId") DO NOTHING`,
          [u.id]
        );
      } else if (u.role === 'JOB_SEEKER') {
        await userPool.query(
          `INSERT INTO job_seekers ("userId", "jobSeekingStatus", "createdAt", "updatedAt")
           VALUES ($1, 'LOOKING', NOW(), NOW())
           ON CONFLICT ("userId") DO NOTHING`,
          [u.id]
        );
      }
      console.log(`✓ [users] Đã tạo/đồng bộ hồ sơ user-service: ${u.email}`);
    } catch (err) {
      // User DB có thể chưa được tạo hoặc offline
      console.warn(`! [users] Lưu ý với user-service: ${err.message}`);
    }
  }

  console.log('\n--- Hoàn tất quá trình seed tài khoản test! ---');
  console.log('Danh sách tài khoản test:');
  console.log('1. Admin:     admin@joblink.vn     | Pass: Admin@123456     (Role: ADMIN - Port 3001)');
  console.log('2. Recruiter: recruiter@joblink.vn | Pass: Recruiter@123456 (Role: RECRUITER - Port 3000)');
  console.log('3. Candidate: candidate@joblink.vn | Pass: Candidate@123456 (Role: JOB_SEEKER - Port 3000)');

  await authPool.end().catch(() => {});
  await userPool.end().catch(() => {});
}

seed().catch((err) => {
  console.error('Lỗi khi thực thi seed:', err);
  process.exit(1);
});

