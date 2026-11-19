import { jest } from '@jest/globals';

const mockCompanyRepository = {
  findById: jest.fn(),
  findByRecruiterId: jest.fn(),
  findByTaxCode: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateCompany: jest.fn(),
};

const mockFileService = {
  uploadDocument: jest.fn(),
  getPresignedUrl: jest.fn(),
  deleteFile: jest.fn(),
  deleteFiles: jest.fn(),
  uploadProcessedImage: jest.fn(),
  processLogoImage: jest.fn(),
  processEnvironmentImage: jest.fn(),
  uploadCompanyLogo: jest.fn(),
  uploadCompanyEnvironmentImage: jest.fn(),
  cleanupTempFile: jest.fn(),
};

jest.unstable_mockModule('../../src/repositories/company.repository.js', () => ({
  default: mockCompanyRepository,
}));

jest.unstable_mockModule('../../src/services/file.service.js', () => ({
  default: mockFileService,
}));

const { default: companyService } = await import('../../src/services/company.service.js');

describe('CompanyService Unit Tests', () => {
  const recruiterId = 'recruiter-123-uuid';
  const companyId = 'company-123-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicCompanyProfile', () => {
    it('should return public company profile without sensitive documents', async () => {
      const mockCompany = {
        companyId,
        companyName: 'Tech Corp',
        description: 'Technology Company',
        logo: 'https://cdn.example.com/logo.webp',
        website: 'https://techcorp.com',
        email: 'contact@techcorp.com',
        phone: '0123456789',
        taxCode: '0123456789',
        companySize: 'SIZE_51_200',
        industry: 'Software',
        province: 'Hà Nội',
        address: '123 Đường Láng',
        verificationStatus: 'APPROVED',
        environmentImages: ['https://pub-cdn.r2.dev/environments/office1.webp'],
        documents: [{ documentId: 'doc-1', fileUrl: 'private/license.pdf' }],
      };

      mockCompanyRepository.findById.mockResolvedValue(mockCompany);

      const result = await companyService.getPublicCompanyProfile(companyId);

      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(result.companyName).toBe('Tech Corp');
      expect(result.environmentImages).toEqual(['https://pub-cdn.r2.dev/environments/office1.webp']);
      expect(result.documents).toBeUndefined(); // Sensitive documents stripped
    });

    it('should throw NotFoundError if company does not exist', async () => {
      mockCompanyRepository.findById.mockResolvedValue(null);

      await expect(companyService.getPublicCompanyProfile(companyId)).rejects.toThrow('Không tìm thấy thông tin doanh nghiệp');
    });
  });

  describe('getMyCompany', () => {
    it('should return recruiter company with verification details', async () => {
      const mockCompany = {
        companyId,
        recruiterId,
        companyName: 'Recruiter Corp',
        verificationStatus: 'PENDING',
        documents: [],
        verifications: [],
      };

      mockCompanyRepository.findByRecruiterId.mockResolvedValue(mockCompany);

      const result = await companyService.getMyCompany(recruiterId);

      expect(mockCompanyRepository.findByRecruiterId).toHaveBeenCalledWith(recruiterId);
      expect(result.companyName).toBe('Recruiter Corp');
    });

    it('should throw NotFoundError if recruiter has no registered company', async () => {
      mockCompanyRepository.findByRecruiterId.mockResolvedValue(null);

      await expect(companyService.getMyCompany(recruiterId)).rejects.toThrow('Bạn chưa đăng ký hồ sơ doanh nghiệp nào');
    });
  });

  describe('getCompanies', () => {
    it('should return paginated company list', async () => {
      const mockCompanies = [
        {
          companyId,
          companyName: 'Tech Corp',
          province: 'Hà Nội',
          verificationStatus: 'APPROVED',
        },
      ];

      mockCompanyRepository.findAndCountAll.mockResolvedValue({
        companies: mockCompanies,
        total: 1,
      });

      const result = await companyService.getCompanies({ page: 1, limit: 10, keyword: 'Tech' });

      expect(result.pagination.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].environmentImages).toBeUndefined(); // Không trả mảng environmentImages trong danh sách
      expect(mockCompanyRepository.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('updateMyCompany (Logo & Environments)', () => {
    const existingCompany = {
      companyId,
      recruiterId,
      companyName: 'Tech Corp',
      logo: 'https://pub-cdn.r2.dev/logo/old-logo.webp',
      environmentImages: [
        'https://pub-cdn.r2.dev/environments/old-1.webp',
        'https://pub-cdn.r2.dev/environments/old-2.webp',
      ],
      documents: [],
      verifications: [],
    };

    it('upload logo mới (logo/), nhiều ảnh môi trường (environments/), lọc URL lạ và xóa ảnh cũ bị gỡ trên R2', async () => {
      mockCompanyRepository.findByRecruiterId.mockResolvedValue(existingCompany);
      mockFileService.uploadCompanyLogo.mockResolvedValue({
        key: 'logo/new-logo.webp',
        url: 'https://pub-cdn.r2.dev/logo/new-logo.webp',
      });
      mockFileService.uploadCompanyEnvironmentImage
        .mockResolvedValueOnce({
          key: 'environments/new-1.webp',
          url: 'https://pub-cdn.r2.dev/environments/new-1.webp',
        })
        .mockResolvedValueOnce({
          key: 'environments/new-2.webp',
          url: 'https://pub-cdn.r2.dev/environments/new-2.webp',
        });

      mockCompanyRepository.updateCompany.mockImplementation(async (_id, updateData) => ({
        ...existingCompany,
        ...updateData,
      }));

      const result = await companyService.updateMyCompany(
        recruiterId,
        {
          companyName: 'Tech Corp Updated',
          // Giữ old-1, cố tình chèn URL lạ không thuộc công ty, bỏ old-2
          retainedEnvironments: [
            'https://pub-cdn.r2.dev/environments/old-1.webp',
            'https://evil.example.com/environments/injected.webp',
          ],
        },
        {
          logo: [{ path: '/tmp/logo.png' }],
          environments: [{ path: '/tmp/env1.jpg' }, { path: '/tmp/env2.jpg' }],
        }
      );

      expect(mockFileService.uploadCompanyLogo).toHaveBeenCalledWith('/tmp/logo.png');
      expect(mockFileService.uploadCompanyEnvironmentImage).toHaveBeenCalledTimes(2);
      expect(result.logo).toBe('https://pub-cdn.r2.dev/logo/new-logo.webp');
      expect(result.environmentImages).toEqual([
        'https://pub-cdn.r2.dev/environments/old-1.webp',
        'https://pub-cdn.r2.dev/environments/new-1.webp',
        'https://pub-cdn.r2.dev/environments/new-2.webp',
      ]);
      // Xóa logo cũ và ảnh old-2 bị gỡ trên R2
      expect(mockFileService.deleteFiles).toHaveBeenCalledWith([
        'https://pub-cdn.r2.dev/logo/old-logo.webp',
        'https://pub-cdn.r2.dev/environments/old-2.webp',
      ]);
      // Dọn dẹp đủ 3 file tạm
      expect(mockFileService.cleanupTempFile).toHaveBeenCalledTimes(3);
    });

    it('ném BadRequestError nếu tổng số ảnh môi trường vượt quá 10', async () => {
      mockCompanyRepository.findByRecruiterId.mockResolvedValue({
        ...existingCompany,
        environmentImages: Array.from({ length: 9 }, (_, i) => `https://pub-cdn.r2.dev/environments/e${i}.webp`),
      });

      await expect(
        companyService.updateMyCompany(
          recruiterId,
          {},
          {
            environments: [{ path: '/tmp/a.jpg' }, { path: '/tmp/b.jpg' }],
          }
        )
      ).rejects.toThrow('tối đa 10 ảnh môi trường');

      expect(mockFileService.uploadCompanyEnvironmentImage).not.toHaveBeenCalled();
      expect(mockFileService.cleanupTempFile).toHaveBeenCalledTimes(2);
    });

    it('rollback xóa các file mới vừa upload lên R2 nếu lưu DB thất bại', async () => {
      mockCompanyRepository.findByRecruiterId.mockResolvedValue(existingCompany);
      mockFileService.uploadCompanyLogo.mockResolvedValue({
        key: 'logo/orphan-logo.webp',
        url: 'https://pub-cdn.r2.dev/logo/orphan-logo.webp',
      });
      mockFileService.uploadCompanyEnvironmentImage.mockResolvedValue({
        key: 'environments/orphan-env.webp',
        url: 'https://pub-cdn.r2.dev/environments/orphan-env.webp',
      });
      mockCompanyRepository.updateCompany.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        companyService.updateMyCompany(
          recruiterId,
          {},
          {
            logo: [{ path: '/tmp/logo.png' }],
            environments: [{ path: '/tmp/env.png' }],
          }
        )
      ).rejects.toThrow('DB connection lost');

      expect(mockFileService.deleteFiles).toHaveBeenCalledWith([
        'https://pub-cdn.r2.dev/logo/orphan-logo.webp',
        'https://pub-cdn.r2.dev/environments/orphan-env.webp',
      ]);
      expect(mockFileService.cleanupTempFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getVerificationStatus', () => {
    it('should return verification status and step info', async () => {
      const mockCompany = {
        companyId,
        companyName: 'Tech Corp',
        taxCode: '0123456789',
        verificationStatus: 'APPROVED',
        verifications: [{ rejectionReason: null, adminNote: null, verifiedAt: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompanyRepository.findByRecruiterId.mockResolvedValue(mockCompany);

      const result = await companyService.getVerificationStatus(recruiterId);

      expect(result.verificationStatus).toBe('APPROVED');
      expect(result.canUpdate).toBe(false);
    });
  });
});
