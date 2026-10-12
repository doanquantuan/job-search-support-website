const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');
const config = require('../../src/config/env.config');

describe('Cập nhật thông tin doanh nghiệp (PUT /api/v1/companies/my-company)', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiterWithCompany = {
    id: 'b2000000-0000-0000-0000-000000000001',
    email: 'recruiter@company.com',
    role: 'RECRUITER',
  };

  const recruiterNoCompany = {
    id: 'b2000000-0000-0000-0000-000000000002',
    email: 'recruiter.nocompany@company.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'b2000000-0000-0000-0000-000000000003',
    email: 'seeker@candidate.com',
    role: 'JOB_SEEKER',
  };

  const tokenRecruiter = jwt.sign(recruiterWithCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenNoCompany = jwt.sign(recruiterNoCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  const testRecruiterIds = [recruiterWithCompany.id, recruiterNoCompany.id];

  beforeAll(async () => {
    // Dọn dẹp dữ liệu cũ
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });

    // Tạo địa chỉ mẫu
    const location = await prisma.location.create({
      data: {
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng',
        address: 'Số 10 Phạm Văn Bạch',
      },
    });

    // Tạo công ty mẫu ban đầu
    await prisma.company.create({
      data: {
        recruiterId: recruiterWithCompany.id,
        companyName: 'Công ty Cổ phần AlphaTech',
        taxCode: '0108888001',
        industry: 'Phần mềm',
        companySize: 'SIZE_11_50',
        description: 'Mô tả ban đầu về công ty',
        website: 'https://alphatech.vn',
        email: 'info@alphatech.vn',
        phone: '02439998888',
        businessLicenseUrl: '/uploads/licenses/license-alpha.pdf',
        verificationStatus: 'APPROVED',
        locationId: location.locationId,
      },
    });
  });

  afterAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: testRecruiterIds } },
    });
    await prisma.$disconnect();

    // Dọn dẹp các tệp tạm tạo bởi Multer trong tests
    const logoDir = path.join(__dirname, '../../uploads/logos');
    const envDir = path.join(__dirname, '../../uploads/environment');
    [logoDir, envDir].forEach((dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.startsWith('logo-') || file.startsWith('env-')) {
            try {
              fs.unlinkSync(path.join(dir, file));
            } catch (e) {

            }
          }
        }
      }
    });
  });

  describe('1. Kiểm tra thành công (200 OK)', () => {
    it('Recruiter cập nhật thông tin công ty, địa chỉ và upload ảnh logo + ảnh môi trường -> trả về 200', async () => {
      const fakeLogoBuffer = Buffer.from('fake image png logo');
      const fakeEnvPhoto1 = Buffer.from('fake image photo 1');
      const fakeEnvPhoto2 = Buffer.from('fake image photo 2');

      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('companyName', 'Tập đoàn Công nghệ AlphaTech Toàn Cầu')
        .field('industry', 'Fintech & AI')
        .field('companySize', 'SIZE_201_500')
        .field('description', 'Mô tả công ty sau khi cập nhật phiên bản mới.')
        .field('website', 'https://global-alphatech.vn')
        .field('email', 'contact@global-alphatech.vn')
        .field('phone', '0987654321')
        .field('province', 'TP Hồ Chí Minh')
        .field('district', 'Quận 7')
        .field('ward', 'Tân Phú')
        .field('address', 'Khu chế xuất Tân Thuận')
        .attach('logo', fakeLogoBuffer, 'logo_alpha.png')
        .attach('environmentPhotos', fakeEnvPhoto1, 'van_phong_1.jpg')
        .attach('environmentPhotos', fakeEnvPhoto2, 'van_phong_2.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('thành công');
      expect(res.body.data).toBeDefined();

      const comp = res.body.data;
      expect(comp.companyName).toBe('Tập đoàn Công nghệ AlphaTech Toàn Cầu');
      expect(comp.industry).toBe('Fintech & AI');
      expect(comp.companySize).toBe('SIZE_201_500');
      expect(comp.email).toBe('contact@global-alphatech.vn');
      expect(comp.phone).toBe('0987654321');
      expect(comp.logo).toMatch(/^\/uploads\/logos\/logo-.*\.png$/);
      expect(comp.environmentPhotos).toHaveLength(2);
      expect(comp.environmentPhotos[0]).toMatch(/^\/uploads\/environment\/env-/);

      // Địa chỉ cập nhật
      expect(comp.location.province).toBe('TP Hồ Chí Minh');
      expect(comp.location.district).toBe('Quận 7');
      expect(comp.location.address).toBe('Khu chế xuất Tân Thuận');

      // Kiểm tra DB lưu trữ thực tế
      const dbCompany = await prisma.company.findFirst({
        where: { recruiterId: recruiterWithCompany.id },
        include: { location: true },
      });
      expect(dbCompany.companyName).toBe('Tập đoàn Công nghệ AlphaTech Toàn Cầu');
      expect(dbCompany.location.province).toBe('TP Hồ Chí Minh');
    });

    it('Recruiter cập nhật từng phần (chỉ sửa mô tả và phone, không upload ảnh) -> trả về 200', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('description', 'Mô tả cập nhật lần 2 không kèm file.')
        .field('phone', '0912345678');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Mô tả cập nhật lần 2 không kèm file.');
      expect(res.body.data.phone).toBe('0912345678');
    });
  });

  describe('2. Phân quyền & Vai trò (401, 403)', () => {
    it('từ chối 401 Unauthorized nếu không truyền Token', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .field('companyName', 'Công ty Test');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 403 Forbidden nếu người dùng là JOB_SEEKER', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenJobSeeker}`)
        .field('companyName', 'Công ty Test');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Chỉ nhà tuyển dụng');
    });
  });

  describe('3. Truy cập công ty người khác / Chưa có công ty (404 Not Found)', () => {
    it('từ chối 404 nếu Recruiter chưa đăng ký công ty nào', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenNoCompany}`)
        .field('companyName', 'Công ty Mới');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('chưa đăng ký hồ sơ doanh nghiệp');
    });
  });

  describe('4. Kiểm tra dữ liệu đầu vào không hợp lệ (400 Bad Request)', () => {
    it('trả về 400 nếu email công ty sai định dạng', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('email', 'email_sai_dinh_dang');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email liên hệ không hợp lệ');
    });

    it('trả về 400 nếu website công ty sai định dạng URL', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('website', 'dia_chi_web_sai');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Địa chỉ website không hợp lệ');
    });

    it('trả về 400 nếu số điện thoại sai định dạng', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('phone', 'abc1234xyz');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Số điện thoại liên hệ không hợp lệ');
    });

    it('trả về 400 nếu quy mô công ty không nằm trong danh mục CompanySize', async () => {
      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .field('companySize', 'QUY_MO_KHONG_TON_TAI');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Quy mô công ty không hợp lệ');
    });
  });

  describe('5. Kiểm tra tải lên tập tin hình ảnh (400 Bad Request)', () => {
    it('trả về 400 nếu tải lên file không phải ảnh (ví dụ file .pdf hoặc .txt cho logo)', async () => {
      const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf');

      const res = await request(app)
        .put('/api/v1/companies/my-company')
        .set('Authorization', `Bearer ${tokenRecruiter}`)
        .attach('logo', fakePdfBuffer, 'tai_lieu.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('không đúng định dạng ảnh');
    });
  });
});
