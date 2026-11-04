import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock R2 service và file-validator để tests chạy offline, không gọi Cloudflare thực tế
jest.unstable_mockModule('../../src/services/r2.service.js', () => ({
  uploadPrivateLicense: jest.fn().mockResolvedValue('licenses/license-test-uuid.pdf'),
  getLicensePresignedUrl: jest.fn().mockResolvedValue('https://private.r2.dev/license-presigned'),
  deletePrivateLicense: jest.fn().mockResolvedValue(undefined),
  uploadPublicFile: jest.fn().mockResolvedValue('https://pub-xxx.r2.dev/logos/logo-test.png'),
  uploadPublicMultipleFiles: jest.fn().mockResolvedValue([]),
  deletePublicFile: jest.fn().mockResolvedValue(undefined),
}));

jest.unstable_mockModule('../../src/utils/file-validator.util.js', () => ({
  validateAndExtractFileType: jest.fn().mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' }),
  ALLOWED_LICENSE_MIMES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp'],
}));

const { default: app } = await import('../../src/app.js');
const { default: prisma } = await import('../../src/config/prisma.js');
const { default: config } = await import('../../src/config/env.config.js');
const { default: companyEvents } = await import('../../src/events/company.events.js');

describe('UC29 - Đăng ký xác thực doanh nghiệp (POST /api/v1/companies/verification)', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiter1 = {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'recruiter1@company.com',
    role: 'RECRUITER',
  };

  const recruiter2 = {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'recruiter2@company.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'b0000000-0000-0000-0000-000000000001',
    email: 'candidate@example.com',
    role: 'JOB_SEEKER',
  };

  const tokenRecruiter1 = jwt.sign(recruiter1, JWT_SECRET, { expiresIn: '1h' });
  const tokenRecruiter2 = jwt.sign(recruiter2, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  const testTaxCodes = ['0109999001', '0109999002', '0109999003'];
  const testRecruiterIds = [recruiter1.id, recruiter2.id];

  // Helper dọn dẹp DB
  const cleanupDb = async () => {
    await prisma.company.deleteMany({
      where: {
        OR: [
          { taxCode: { in: testTaxCodes } },
          { recruiterId: { in: testRecruiterIds } },
        ],
      },
    });
  };

  beforeAll(async () => {
    await cleanupDb();
  });

  afterAll(async () => {
    await cleanupDb();
    await prisma.$disconnect();

    // Dọn dẹp các tệp tạm tạo bởi Multer trong tests
    const uploadDir = path.join(__dirname, '../../uploads/licenses');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        if (file.startsWith('license-')) {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
          } catch (e) {
            // bỏ qua
          }
        }
      }
    }
  });

  describe('1. Kiểm tra thành công (201 Created)', () => {
    it('nhà tuyển dụng gửi hồ sơ hợp lệ kèm giấy phép kinh doanh PDF -> trả về 201 và trạng thái PENDING', async () => {
      let emittedEvent = null;
      companyEvents.once('verification.submitted', (data) => {
        emittedEvent = data;
      });

      const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf content for testing');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRecruiter1}`)
        .field('companyName', 'Công ty Cổ phần Công nghệ Tiên Phong')
        .field('taxCode', '0109999001')
        .field('industry', 'Công nghệ thông tin')
        .field('companySize', 'SIZE_11_50')
        .field('province', 'Hà Nội')
        .field('district', 'Cầu Giấy')
        .field('ward', 'Dịch Vọng Hậu')
        .field('address', 'Tầng 5, Tòa nhà ABC, Phố Duy Tân')
        .field('website', 'https://tienphongtech.vn')
        .field('email', 'contact@tienphongtech.vn')
        .field('phone', '0912345678')
        .field('description', 'Công ty chuyên cung cấp giải pháp chuyển đổi số.')
        .attach('businessLicense', fakePdfBuffer, 'giay_phep_kd.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('PENDING');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.companyName).toBe('Công ty Cổ phần Công nghệ Tiên Phong');
      expect(res.body.data.taxCode).toBe('0109999001');
      expect(res.body.data.verificationStatus).toBe('PENDING');
      expect(res.body.data.businessLicenseUrl).toMatch(/^licenses\/license-.*\.pdf$/);
      expect(res.body.data.location).toBeDefined();
      expect(res.body.data.location.province).toBe('Hà Nội');

      // Kiểm tra DB lưu trữ chính xác
      const dbCompany = await prisma.company.findUnique({
        where: { taxCode: '0109999001' },
        include: { location: true },
      });
      expect(dbCompany).not.toBeNull();
      expect(dbCompany.recruiterId).toBe(recruiter1.id);
      expect(dbCompany.verificationStatus).toBe('PENDING');

      // Kiểm tra sự kiện verification.submitted được bắn ra
      expect(emittedEvent).not.toBeNull();
      expect(emittedEvent.taxCode).toBe('0109999001');
      expect(emittedEvent.recruiterId).toBe(recruiter1.id);
    });

    it('hỗ trợ alias endpoint /api/v1/companies/register-verification thành công', async () => {
      // Recruiter 2 đăng ký qua alias endpoint
      const fakeJpgBuffer = Buffer.from('fake jpg image buffer');

      const res = await request(app)
        .post('/api/v1/companies/register-verification')
        .set('Authorization', `Bearer ${tokenRecruiter2}`)
        .field('companyName', 'Công ty TNHH Giải Pháp Sáng Tạo')
        .field('taxCode', '0109999002')
        .field('industry', 'Thiết kế đồ họa')
        .field('province', 'TP Hồ Chí Minh')
        .attach('businessLicense', fakeJpgBuffer, 'giay_phep.jpg');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('PENDING');
      expect(res.body.data.taxCode).toBe('0109999002');
    });
  });

  describe('2. Phân quyền & Vai trò (401, 403)', () => {
    it('từ chối 403 Forbidden nếu người dùng không phải role RECRUITER (ví dụ JOB_SEEKER)', async () => {
      const fakePdfBuffer = Buffer.from('%PDF fake');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenJobSeeker}`)
        .field('companyName', 'Công ty Ứng viên')
        .field('taxCode', '0109999003')
        .field('industry', 'Dịch vụ')
        .field('province', 'Đà Nẵng')
        .attach('businessLicense', fakePdfBuffer, 'license.pdf');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Chỉ nhà tuyển dụng (RECRUITER) mới có quyền');
    });

    it('từ chối 401 Unauthorized nếu không truyền Token xác thực', async () => {
      const res = await request(app)
        .post('/api/v1/companies/verification')
        .field('companyName', 'Công ty Test')
        .field('taxCode', '0109999003')
        .field('industry', 'Dịch vụ')
        .field('province', 'Hà Nội');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 401 Unauthorized nếu token sai bí danh hoặc hết hạn', async () => {
      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', 'Bearer token_khong_hop_le_12345')
        .field('companyName', 'Công ty Test')
        .field('taxCode', '0109999003')
        .field('industry', 'Dịch vụ')
        .field('province', 'Hà Nội');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Kiểm tra dữ liệu đầu vào (400 Bad Request)', () => {
    it('trả về 400 nếu thiếu file giấy phép kinh doanh', async () => {
      const newRecruiter = {
        id: 'a0000000-0000-0000-0000-000000000003',
        email: 'recruiter3@company.com',
        role: 'RECRUITER',
      };
      const token = jwt.sign(newRecruiter, JWT_SECRET, { expiresIn: '1h' });

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${token}`)
        .field('companyName', 'Công ty Thiếu File')
        .field('taxCode', '0109999003')
        .field('industry', 'Fintech')
        .field('province', 'Hà Nội');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('giấy phép kinh doanh');
    });

    it('trả về 400 nếu tệp giấy phép sai định dạng (ví dụ .txt)', async () => {
      const newRecruiter = {
        id: 'a0000000-0000-0000-0000-000000000003',
        email: 'recruiter3@company.com',
        role: 'RECRUITER',
      };
      const token = jwt.sign(newRecruiter, JWT_SECRET, { expiresIn: '1h' });
      const txtBuffer = Buffer.from('day la file van ban');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${token}`)
        .field('companyName', 'Công ty File Sai')
        .field('taxCode', '0109999003')
        .field('industry', 'Fintech')
        .field('province', 'Hà Nội')
        .attach('businessLicense', txtBuffer, 'license.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Định dạng tệp');
    });

    it('trả về 400 nếu mã số thuế không đúng định dạng', async () => {
      const newRecruiter = {
        id: 'a0000000-0000-0000-0000-000000000004',
        email: 'recruiter4@company.com',
        role: 'RECRUITER',
      };
      const token = jwt.sign(newRecruiter, JWT_SECRET, { expiresIn: '1h' });
      const fakePdfBuffer = Buffer.from('%PDF fake');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${token}`)
        .field('companyName', 'Công ty MST Sai')
        .field('taxCode', 'MST_KHONG_HOP_LE')
        .field('industry', 'Fintech')
        .field('province', 'Hà Nội')
        .attach('businessLicense', fakePdfBuffer, 'license.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Mã số thuế');
    });

    it('trả về 400 nếu thiếu các trường bắt buộc (tên công ty, tỉnh thành, lĩnh vực)', async () => {
      const newRecruiter = {
        id: 'a0000000-0000-0000-0000-000000000005',
        email: 'recruiter5@company.com',
        role: 'RECRUITER',
      };
      const token = jwt.sign(newRecruiter, JWT_SECRET, { expiresIn: '1h' });
      const fakePdfBuffer = Buffer.from('%PDF fake');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${token}`)
        .field('taxCode', '0109999003')
        .attach('businessLicense', fakePdfBuffer, 'license.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('4. Kiểm tra xung đột & Trùng lặp (409 Conflict)', () => {
    it('trả về 409 nếu mã số thuế đã được doanh nghiệp khác đăng ký', async () => {
      // Recruiter mới cố gắng đăng ký với taxCode đã dùng bởi recruiter1 ('0109999001')
      const newRecruiter = {
        id: 'a0000000-0000-0000-0000-000000000006',
        email: 'recruiter6@company.com',
        role: 'RECRUITER',
      };
      const token = jwt.sign(newRecruiter, JWT_SECRET, { expiresIn: '1h' });
      const fakePdfBuffer = Buffer.from('%PDF fake');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${token}`)
        .field('companyName', 'Công ty Cố Tình Trùng Mã Số Thuế')
        .field('taxCode', '0109999001')
        .field('industry', 'Logistics')
        .field('province', 'Hải Phòng')
        .attach('businessLicense', fakePdfBuffer, 'license.pdf');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Mã số thuế '0109999001' đã được đăng ký");
    });

    it('trả về 409 nếu Recruiter này đã đăng ký một công ty đang chờ duyệt hoặc đã xác thực', async () => {
      // recruiter1 đã đăng ký công ty ở test 1, cố đăng ký thêm công ty thứ 2
      const fakePdfBuffer = Buffer.from('%PDF fake');

      const res = await request(app)
        .post('/api/v1/companies/verification')
        .set('Authorization', `Bearer ${tokenRecruiter1}`)
        .field('companyName', 'Công ty Thứ Hai Của Recruiter 1')
        .field('taxCode', '0109999003')
        .field('industry', 'Logistics')
        .field('province', 'Hà Nội')
        .attach('businessLicense', fakePdfBuffer, 'license.pdf');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Bạn đã đăng ký doanh nghiệp');
    });
  });
});
