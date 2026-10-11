const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const config = require('../../src/config/env.config');

describe('UC30 - Xem trạng thái xác thực doanh nghiệp (GET /api/v1/companies/verification/status)', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiterWithCompany = {
    id: 'c0000000-0000-0000-0000-000000000001',
    email: 'recruiter.uc30@test.com',
    role: 'RECRUITER',
  };

  const recruiterNoCompany = {
    id: 'c0000000-0000-0000-0000-000000000002',
    email: 'recruiter.no.company@test.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'seeker.uc30@test.com',
    role: 'JOB_SEEKER',
  };

  const tokenWithCompany = jwt.sign(recruiterWithCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenNoCompany = jwt.sign(recruiterNoCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  // Tạo sẵn 1 công ty trước khi test
  beforeAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: [recruiterWithCompany.id, recruiterNoCompany.id] } },
    });


    const location = await prisma.location.create({
      data: {
        province: 'Hà Nội',
        district: 'Đống Đa',
        ward: 'Khương Thượng',
        address: '15 Tây Sơn',
      },
    });

    await prisma.company.create({
      data: {
        recruiterId: recruiterWithCompany.id,
        companyName: 'Công ty UC30 Test',
        taxCode: '0109998001',
        industry: 'Tài chính',
        companySize: 'SIZE_51_200',
        businessLicenseUrl: '/uploads/licenses/license-uc30-test.pdf',
        verificationStatus: 'PENDING',
        locationId: location.locationId,
      },
    });
  });

  afterAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: [recruiterWithCompany.id, recruiterNoCompany.id] } },
    });
    await prisma.$disconnect();
  });

  describe('1. Kiểm tra thành công (200 OK)', () => {
    it('Recruiter có công ty -> trả về 200 và trạng thái PENDING kèm thông tin đầy đủ', async () => {
      const res = await request(app)
        .get('/api/v1/companies/verification/status')
        .set('Authorization', `Bearer ${tokenWithCompany}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('thành công');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.companyId).toBeDefined();
      expect(res.body.data.companyName).toBe('Công ty UC30 Test');
      expect(res.body.data.taxCode).toBe('0109998001');
      expect(res.body.data.verificationStatus).toBe('PENDING');
      expect(res.body.data.rejectionReason).toBeNull();
      expect(res.body.data.adminNote).toBeNull();
      expect(res.body.data.submittedAt).toBeDefined();
    });

    it('Recruiter bị từ chối (REJECTED) -> trả về 200 và kèm rejectionReason', async () => {
      // Cập nhật trạng thái thành REJECTED với lý do
      await prisma.company.updateMany({
        where: { recruiterId: recruiterWithCompany.id },
        data: {
          verificationStatus: 'REJECTED',
          rejectionReason: 'Giấy phép kinh doanh hết hạn, vui lòng cập nhật lại.',
          adminNote: 'Recruiter cần nộp lại giấy phép còn hiệu lực.',
        },
      });

      const res = await request(app)
        .get('/api/v1/companies/verification/status')
        .set('Authorization', `Bearer ${tokenWithCompany}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('REJECTED');
      expect(res.body.data.rejectionReason).toBe('Giấy phép kinh doanh hết hạn, vui lòng cập nhật lại.');
      expect(res.body.data.adminNote).toBe('Recruiter cần nộp lại giấy phép còn hiệu lực.');


      await prisma.company.updateMany({
        where: { recruiterId: recruiterWithCompany.id },
        data: {
          verificationStatus: 'PENDING',
          rejectionReason: null,
          adminNote: null,
        },
      });
    });
  });

  describe('2. Phân quyền & Vai trò (401, 403)', () => {
    it('từ chối 401 nếu không truyền Authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/companies/verification/status');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 401 nếu token không hợp lệ', async () => {
      const res = await request(app)
        .get('/api/v1/companies/verification/status')
        .set('Authorization', 'Bearer token_sai_dinh_dang_abc123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 403 nếu role là JOB_SEEKER', async () => {
      const res = await request(app)
        .get('/api/v1/companies/verification/status')
        .set('Authorization', `Bearer ${tokenJobSeeker}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Trường hợp Recruiter chưa đăng ký công ty (404)', () => {
    it('Recruiter chưa đăng ký công ty nào -> trả về 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/v1/companies/verification/status')
        .set('Authorization', `Bearer ${tokenNoCompany}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('chưa đăng ký hồ sơ doanh nghiệp');
    });
  });
});
