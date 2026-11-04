import { jest } from '@jest/globals';

const mockCompanyRepository = {
  findById: jest.fn(),
  findByRecruiterId: jest.fn(),
  findByTaxCode: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockFileService = {
  uploadDocument: jest.fn(),
  getPresignedUrl: jest.fn(),
  deleteFile: jest.fn(),
  uploadProcessedImage: jest.fn(),
  processLogoImage: jest.fn(),
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
        documents: [{ documentId: 'doc-1', fileUrl: 'private/license.pdf' }],
      };

      mockCompanyRepository.findById.mockResolvedValue(mockCompany);

      const result = await companyService.getPublicCompanyProfile(companyId);

      expect(mockCompanyRepository.findById).toHaveBeenCalledWith(companyId);
      expect(result.companyName).toBe('Tech Corp');
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
      expect(mockCompanyRepository.findAndCountAll).toHaveBeenCalled();
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
