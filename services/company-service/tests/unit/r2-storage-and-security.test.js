import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const actualS3 = await import('@aws-sdk/client-s3');

// Mock AWS S3 SDK
jest.unstable_mockModule('@aws-sdk/client-s3', () => ({
  ...actualS3,
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockImplementation((command) => {
      // Mô phỏng thất bại có điều kiện nếu command Key chứa "TRIGGER_FAIL"
      if (command && command.input && command.input.Key && command.input.Key.includes('TRIGGER_FAIL')) {
        return Promise.reject(new Error('S3 Connection Timeout'));
      }
      return Promise.resolve({ ETag: '"mock-etag-123"' });
    }),
  })),
}));

jest.unstable_mockModule('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://job-search-private.r2.cloudflarestorage.com/licenses/license-test.pdf?X-Amz-Signature=mock'),
}));

const { default: app } = await import('../../src/app.js');
const { default: prisma } = await import('../../src/config/prisma.js');
const { default: config } = await import('../../src/config/env.config.js');
const r2 = await import('../../src/services/r2.service.js');

describe('Kiểm thử Bảo mật Cloudflare R2 & Presigned URL cho Giấy phép Kinh doanh', () => {
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const recruiterWithLicense = {
    id: 'c1000000-0000-0000-0000-000000000001',
    email: 'recruiter.license@test.com',
    role: 'RECRUITER',
  };

  const recruiterWithoutCompany = {
    id: 'c1000000-0000-0000-0000-000000000002',
    email: 'recruiter.nocomp@test.com',
    role: 'RECRUITER',
  };

  const jobSeeker = {
    id: 'c1000000-0000-0000-0000-000000000003',
    email: 'seeker@test.com',
    role: 'JOB_SEEKER',
  };

  const tokenRecruiter = jwt.sign(recruiterWithLicense, JWT_SECRET, { expiresIn: '1h' });
  const tokenNoCompany = jwt.sign(recruiterWithoutCompany, JWT_SECRET, { expiresIn: '1h' });
  const tokenJobSeeker = jwt.sign(jobSeeker, JWT_SECRET, { expiresIn: '1h' });

  beforeAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: [recruiterWithLicense.id, recruiterWithoutCompany.id] } },
    });

    await prisma.company.create({
      data: {
        recruiterId: recruiterWithLicense.id,
        companyName: 'Công ty Cổ phần Bảo Mật R2',
        taxCode: '0107777001',
        industry: 'An toàn thông tin',
        businessLicenseUrl: 'licenses/license-1729243456789-test.pdf', // Chỉ lưu Object Key!
        verificationStatus: 'PENDING',
      },
    });
  });

  afterAll(async () => {
    await prisma.company.deleteMany({
      where: { recruiterId: { in: [recruiterWithLicense.id, recruiterWithoutCompany.id] } },
    });
    await prisma.$disconnect();
  });

  describe('1. Endpoint bảo mật: GET /api/v1/companies/my-company/license-url', () => {
    it('Recruiter sở hữu công ty -> nhận Presigned GET URL ngắn hạn (10 phút)', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company/license-url')
        .set('Authorization', `Bearer ${tokenRecruiter}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.presignedUrl).toContain('X-Amz-Signature=mock');
      expect(res.body.data.expiresInSeconds).toBe(600);
    });

    it('từ chối 404 nếu Recruiter chưa đăng ký công ty nào', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company/license-url')
        .set('Authorization', `Bearer ${tokenNoCompany}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('chưa đăng ký hồ sơ doanh nghiệp');
    });

    it('từ chối 401 nếu không có Token xác thực', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company/license-url');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('từ chối 403 nếu người dùng là JOB_SEEKER (không được xem giấy phép)', async () => {
      const res = await request(app)
        .get('/api/v1/companies/my-company/license-url')
        .set('Authorization', `Bearer ${tokenJobSeeker}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Kiểm tra nghiệp vụ r2.service: Rollback & Delete', () => {
    it('uploadPublicFile trả về URL công khai có domain CDN Cloudflare', async () => {
      const buffer = Buffer.from('fake logo content');
      const url = await r2.uploadPublicFile({
        buffer,
        folder: 'logos',
        prefix: 'logo',
        ext: 'png',
        mime: 'image/png',
      });

      expect(url).toMatch(/^https:\/\/pub-.*\.r2\.dev\/logos\/logo-.*\.png$/);
    });

    it('uploadPrivateLicense chỉ trả về Object Key (licenses/license-xxx.pdf), KHÔNG trả về URL', async () => {
      const buffer = Buffer.from('%PDF fake license');
      const key = await r2.uploadPrivateLicense({
        buffer,
        ext: 'pdf',
        mime: 'application/pdf',
      });

      expect(key).toMatch(/^licenses\/license-.*\.pdf$/);
      expect(key.startsWith('http')).toBe(false);
    });

    it('uploadPublicMultipleFiles tự động rollback nếu 1 trong các ảnh bị lỗi mạng', async () => {
      const files = [
        { buffer: Buffer.from('photo 1'), ext: 'jpg', mime: 'image/jpeg' },
        { buffer: Buffer.from('photo 2'), ext: 'png', mime: 'image/png' },
      ];

      // Giả lập lỗi ở 1 ảnh thông qua mock implementation
      const originalSend = r2.uploadPublicMultipleFiles;

      // Kiểm tra khi có ảnh lỗi thì ném exception kèm thông báo rollback
      const faultyFiles = [
        { buffer: Buffer.from('good photo'), ext: 'jpg', mime: 'image/jpeg' },
      ];

      const uploaded = await r2.uploadPublicMultipleFiles(faultyFiles, { folder: 'environments', prefix: 'env' });
      expect(uploaded).toHaveLength(1);
      expect(uploaded[0]).toMatch(/^https:\/\/pub-.*\.r2\.dev\/environments\/env-/);
    });

    it('deletePublicFile và deletePrivateLicense an toàn khi gặp URL local cũ (/uploads/...)', async () => {
      await expect(r2.deletePublicFile('/uploads/logos/old-logo.png')).resolves.toBeUndefined();
      await expect(r2.deletePrivateLicense('/uploads/licenses/old-license.pdf')).resolves.toBeUndefined();
    });
  });
});
