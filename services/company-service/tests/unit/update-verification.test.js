const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const config = require('../../src/config/env.config');

describe('UC31 - Cập nhật hồ sơ xác thực doanh nghiệp (PUT /api/v1/companies/verification)', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiterRejected = {
    id: 'e0000000-0000-0000-0000-000000000001',
    email: 'recruiter.rejected@test.com',
    role: 'RECRUITER',
  };

  const recruiterAdditional = {
    id: 'e0000000-0000-0000-0000-000000000002',
    email: 'recruiter.additional@test.com',
    role: 'RECRUITER',
  };

  const recruiterPending = {
    id: 'e0000000-0000-0000-0000-000000000003',
    email: 'recruiter.pending@test.com',
    role: 'RECRUITER',
  };

  const recruiterNoCompany = {
    id: 'e0000000-0000-0000-0000-000000000004',
    email: 'recruiter.none@test.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'f0000000-0000-0000-0000-000000000001',
    email: 'seeker.uc31@test.com',
    role: 'JOB_SEEKER',
  };

  const tokenRejected = jwt.sign(recruiterRejected, JWT_SECRET, { expiresIn: '1h' });
  const tokenAdditional = jwt.sign(recruiterAdditional, JWT_SECRET, { expiresIn: '1h' });
  const tokenPending = jwt.sign(recruiterPending, JWT_SECRET, { expiresIn: '1h' });
  const tokenNoCompany = jwt.sign(recruiterNoCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  const testRecruiterIds = [
    recruiterRejected.id,
    recruiterAdditional.id,
    recruiterPending.id,
    recruiterNoCompany.id,
  ];

  let locationIdRejected;
  let locationIdAdditional;
  let locationIdPending;

  beforeAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });

    // Tạo công ty trạng thái REJECTED
    const locRejected = await prisma.location.create({
      data: { province: 'Hà Nội', district: 'Hoàn Kiếm' },
    });
    locationIdRejected = locRejected.locationId;
    await prisma.company.create({
      data: {
        recruiterId: recruiterRejected.id,
        companyName: 'Công ty REJECTED Test',
        taxCode: '0109997001',
        industry: 'Thương mại',
        companySize: 'SIZE_1_10',
        businessLicenseUrl: '/uploads/licenses/test-rejected.pdf',
        verificationStatus: 'REJECTED',
        rejectionReason: 'Giấy phép hết hạn',
        locationId: locRejected.locationId,
      },
    });

    // Tạo công ty trạng thái ADDITIONAL_INFO_REQUIRED
    const locAdditional = await prisma.location.create({
      data: { province: 'Đà Nẵng' },
    });
    locationIdAdditional = locAdditional.locationId;
    await prisma.company.create({
      data: {
        recruiterId: recruiterAdditional.id,
        companyName: 'Công ty ADDITIONAL Test',
        taxCode: '0109997002',
        industry: 'Xây dựng',
        companySize: 'SIZE_11_50',
        businessLicenseUrl: '/uploads/licenses/test-additional.pdf',
        verificationStatus: 'ADDITIONAL_INFO_REQUIRED',
        adminNote: 'Cần bổ sung thêm giấy tờ',
        locationId: locAdditional.locationId,
      },
    });

    // Tạo công ty trạng thái PENDING (không được cập nhật)
    const locPending = await prisma.location.create({
      data: { province: 'TP Hồ Chí Minh' },
    });
    locationIdPending = locPending.locationId;
    await prisma.company.create({
      data: {
        recruiterId: recruiterPending.id,
        companyName: 'Công ty PENDING Test',
        taxCode: '0109997003',
        industry: 'Logistics',
        companySize: 'SIZE_51_200',
        businessLicenseUrl: '/uploads/licenses/test-pending.pdf',
        verificationStatus: 'PENDING',
        locationId: locPending.locationId,
      },
    });
  });

  afterAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });
    await prisma.$disconnect();
  });

  describe('1. Kiểm tra thành công (200 OK)', () => {
    it('Recruiter có công ty REJECTED -> cập nhật thông tin và file giấy phép -> trả về 200 và verificationStatus = PENDING', async () => {
      const fakePdf = Buffer.from('%PDF-1.4 resubmission');

      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRejected}`)
        .field('companyName', 'Công ty REJECTED Test Đã Sửa')
        .field('industry', 'Thương mại điện tử')
        .field('province', 'Hà Nội')
        .field('district', 'Cầu Giấy')
        .attach('businessLicense', fakePdf, 'giay_phep_moi.pdf');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('PENDING');
      expect(res.body.data.verificationStatus).toBe('PENDING');
      expect(res.body.data.companyName).toBe('Công ty REJECTED Test Đã Sửa');
      expect(res.body.data.businessLicenseUrl).toMatch(/^\/uploads\/licenses\/license-/);

      // Kiểm tra rejectionReason được xóa
      const dbCompany = await prisma.company.findFirst({
        where: { recruiterId: recruiterRejected.id },
      });
      expect(dbCompany.verificationStatus).toBe('PENDING');
      expect(dbCompany.rejectionReason).toBeNull();
      expect(dbCompany.adminNote).toBeNull();
    });

    it('Recruiter có công ty ADDITIONAL_INFO_REQUIRED -> cập nhật không cần file mới -> trả về 200', async () => {
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenAdditional}`)
        .field('description', 'Bổ sung mô tả công ty theo yêu cầu Admin')
        .field('email', 'contact@additional.vn')
        .field('phone', '0901234567');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('PENDING');

      const dbCompany = await prisma.company.findFirst({
        where: { recruiterId: recruiterAdditional.id },
      });
      expect(dbCompany.verificationStatus).toBe('PENDING');
      expect(dbCompany.adminNote).toBeNull();
    });
  });

  describe('2. Phân quyền & Vai trò (401, 403)', () => {
    it('từ chối 401 nếu không truyền Authorization header', async () => {
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .field('industry', 'IT');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 403 nếu role là JOB_SEEKER', async () => {
      const fakePdf = Buffer.from('%PDF fake');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenJobSeeker}`)
        .field('industry', 'IT')
        .attach('businessLicense', fakePdf, 'license.pdf');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Ràng buộc trạng thái (400 Bad Request)', () => {
    it('trả về 400 nếu công ty đang ở trạng thái PENDING (không được cập nhật)', async () => {
      const fakePdf = Buffer.from('%PDF fake');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenPending}`)
        .field('industry', 'Fintech')
        .attach('businessLicense', fakePdf, 'license.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Không thể cập nhật hồ sơ khi trạng thái là');
    });

    it('trả về 400 nếu gửi file sai định dạng (.txt)', async () => {
      const txtBuf = Buffer.from('text content');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRejected}`)
        .field('industry', 'IT')
        .attach('businessLicense', txtBuf, 'license.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Định dạng tệp không hợp lệ');
    });

    it('trả về 400 nếu taxCode mới sai định dạng', async () => {
      const fakePdf = Buffer.from('%PDF fake');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRejected}`)
        .field('taxCode', 'SAI_DINH_DANG')
        .attach('businessLicense', fakePdf, 'license.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Mã số thuế');
    });
  });

  describe('4. Trường hợp Recruiter chưa đăng ký công ty (404)', () => {
    it('trả về 404 nếu Recruiter chưa có công ty nào', async () => {
      const fakePdf = Buffer.from('%PDF fake');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenNoCompany}`)
        .field('industry', 'IT')
        .attach('businessLicense', fakePdf, 'license.pdf');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('chưa đăng ký hồ sơ doanh nghiệp');
    });
  });

  describe('5. Xung đột mã số thuế (409)', () => {
    beforeEach(async () => {
      // Reset công ty của recruiterRejected về REJECTED để test 409 
      await prisma.company.updateMany({
        where: { recruiterId: recruiterRejected.id },
        data: { verificationStatus: 'REJECTED', rejectionReason: 'Reset cho test 409' },
      });
    });

    it('trả về 409 nếu taxCode mới đã thuộc về công ty khác', async () => {

      const fakePdf = Buffer.from('%PDF fake');
      const res = await request(app)
        .put('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRejected}`)
        .field('taxCode', '0109997003')
        .attach('businessLicense', fakePdf, 'license.pdf');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Mã số thuế '0109997003'");
    });
  });
});
