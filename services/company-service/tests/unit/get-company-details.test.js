const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const config = require('../../src/config/env.config');

describe('Xem thông tin doanh nghiệp (GET /my-company & GET /:id)', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiterWithCompany = {
    id: 'a1000000-0000-0000-0000-000000000001',
    email: 'recruiter.uc32@company.com',
    role: 'RECRUITER',
  };

  const recruiterNoCompany = {
    id: 'a1000000-0000-0000-0000-000000000002',
    email: 'recruiter.nocompany@company.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'b1000000-0000-0000-0000-000000000001',
    email: 'seeker@candidate.com',
    role: 'JOB_SEEKER',
  };

  const tokenRecruiter = jwt.sign(recruiterWithCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenNoCompany = jwt.sign(recruiterNoCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  let sampleCompanyId;
  const testRecruiterIds = [recruiterWithCompany.id, recruiterNoCompany.id];

  beforeAll(async () => {
    // Dọn dẹp dữ liệu test cũ nếu có
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });

    // Tạo địa chỉ mẫu
    const location = await prisma.location.create({
      data: {
        province: 'TP Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Bến Nghé',
        address: 'Số 1 Lê Duẩn',
      },
    });

    // Tạo công ty mẫu
    const company = await prisma.company.create({
      data: {
        recruiterId: recruiterWithCompany.id,
        companyName: 'Tập đoàn Công nghệ Sài Gòn',
        taxCode: '0309999001',
        industry: 'Trí tuệ nhân tạo (AI)',
        companySize: 'SIZE_201_500',
        description: 'Doanh nghiệp tiên phong trong lĩnh vực AI & Dữ liệu lớn.',
        website: 'https://saigontech.vn',
        email: 'hr@saigontech.vn',
        phone: '02838123456',
        logo: '/uploads/logos/saigontech.png',
        businessLicenseUrl: '/uploads/licenses/license-saigontech.pdf',
        environmentPhotos: [
          '/uploads/environment/photo1.jpg',
          '/uploads/environment/photo2.jpg',
        ],
        verificationStatus: 'APPROVED',
        adminNote: 'Ghi chú nội bộ bí mật của Admin',
        locationId: location.locationId,
      },
    });

    sampleCompanyId = company.companyId;
  });

  afterAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });
    await prisma.$disconnect();
  });

  describe('1. Endpoint nội bộ: GET /api/v1/companies/my-company (Dành cho Recruiter)', () => {
    it('Recruiter sở hữu công ty -> trả về 200 kèm đầy đủ thông tin nội bộ và địa chỉ', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const comp = res.body.data;
      expect(comp.companyId).toBe(sampleCompanyId);
      expect(comp.recruiterId).toBe(recruiterWithCompany.id);
      expect(comp.companyName).toBe('Tập đoàn Công nghệ Sài Gòn');
      expect(comp.taxCode).toBe('0309999001');
      expect(comp.businessLicenseUrl).toBe('/uploads/licenses/license-saigontech.pdf');
      expect(comp.verificationStatus).toBe('APPROVED');
      expect(comp.adminNote).toBe('Ghi chú nội bộ bí mật của Admin');
      expect(comp.location).toBeDefined();
      expect(comp.location.province).toBe('TP Hồ Chí Minh');
      expect(comp.location.district).toBe('Quận 1');
      expect(comp.location.fullAddress).toContain('Số 1 Lê Duẩn');
      expect(comp.environmentPhotos).toHaveLength(2);
    });

    it('từ chối 404 nếu Recruiter chưa đăng ký công ty nào', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenNoCompany}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('chưa đăng ký hồ sơ doanh nghiệp');
    });

    it('từ chối 401 nếu không gửi kèm token xác thực', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 403 nếu người dùng có role JOB_SEEKER truy cập', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenJobSeeker}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Chỉ nhà tuyển dụng');
    });
  });

  describe('2. Endpoint công khai: GET /api/v1/companies/:id (Dành cho Ứng viên / Khách vãng lai)', () => {
    it('Khách vãng lai / Ứng viên không cần token -> trả về 200 và hồ sơ công khai (không lộ thông tin bí mật)', async () => {
      const res = await request(app)
        .get(`/api/v1/companies/${sampleCompanyId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const pub = res.body.data;
      expect(pub.companyId).toBe(sampleCompanyId);
      expect(pub.companyName).toBe('Tập đoàn Công nghệ Sài Gòn');
      expect(pub.logo).toBe('/uploads/logos/saigontech.png');
      expect(pub.website).toBe('https://saigontech.vn');
      expect(pub.location).toBeDefined();
      expect(pub.location.province).toBe('TP Hồ Chí Minh');
      expect(pub.environmentPhotos).toHaveLength(2);

      // Không làm rò rỉ dữ liệu nhạy cảm
      expect(pub.taxCode).toBeUndefined();
      expect(pub.businessLicenseUrl).toBeUndefined();
      expect(pub.adminNote).toBeUndefined();
      expect(pub.rejectionReason).toBeUndefined();
      expect(pub.recruiterId).toBeUndefined();
    });

    it('trả về 404 khi truy vấn ID công ty không tồn tại', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';
      const res = await request(app)
        .get(`/api/v1/companies/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Không tìm thấy thông tin doanh nghiệp');
    });
  });
});
