import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/cv.repository.js', () => ({
  default: {
    countByUserId: jest.fn(),
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    findById: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/services/file.service.js', () => ({
  default: {
    uploadCvFile: jest.fn(),
    deleteFile: jest.fn(),
    normalizeUrl: jest.fn((url) => url),
  },
}));

jest.unstable_mockModule('fs', () => ({
  default: {
    readFileSync: jest.fn(() => Buffer.from('dummy-pdf-content')),
    existsSync: jest.fn(() => true),
    unlinkSync: jest.fn(),
  },
}));

let cvService;
let mockCvRepo;
let mockFileService;

beforeAll(async () => {
  const cvRepoMod = await import('../../src/repositories/cv.repository.js');
  mockCvRepo = cvRepoMod.default;
  const fileServiceMod = await import('../../src/services/file.service.js');
  mockFileService = fileServiceMod.default;
  const serviceMod = await import('../../src/services/cv.service.js');
  cvService = serviceMod.default;
});

describe('CvService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploadCv tải lên CV thành công khi dữ liệu hợp lệ', async () => {
    mockCvRepo.countByUserId.mockResolvedValue(2);
    mockFileService.uploadCvFile.mockResolvedValue({
      key: 'documents/cvs/user-1/test.pdf',
      url: 'http://localhost:5000/api/v1/users/files/documents/cvs/user-1/test.pdf',
    });
    mockCvRepo.create.mockResolvedValue({
      cvId: '11111111-2222-3333-4444-555555555555',
      userId: 'user-1',
      title: 'Frontend Developer CV',
      fileUrl: 'http://localhost:5000/api/v1/users/files/documents/cvs/user-1/test.pdf',
    });

    const file = {
      path: '/tmp/test.pdf',
      originalname: 'Frontend Developer CV.pdf',
      mimetype: 'application/pdf',
    };

    const result = await cvService.uploadCv({
      userId: 'user-1',
      role: 'JOB_SEEKER',
      file,
      title: 'Frontend Developer CV',
    });

    expect(mockFileService.uploadCvFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      'application/pdf',
      'user-1',
      'Frontend Developer CV.pdf'
    );
    expect(mockCvRepo.create).toHaveBeenCalled();
    expect(result.cvId).toBe('11111111-2222-3333-4444-555555555555');
  });

  test('uploadCv ném lỗi khi vượt quá giới hạn 5 CV', async () => {
    mockCvRepo.countByUserId.mockResolvedValue(5);

    await expect(
      cvService.uploadCv({
        userId: 'user-1',
        role: 'JOB_SEEKER',
        file: { path: '/tmp/test.pdf' },
        title: 'CV',
      })
    ).rejects.toThrow('Bạn chỉ có thể tải lên tối đa 5 CV');
  });

  test('getMyCvs chuẩn hóa URL và trả về danh sách', async () => {
    mockCvRepo.findAllByUserId.mockResolvedValue([
      { cvId: '1', title: 'CV 1', fileUrl: 'documents/cvs/1.pdf' },
    ]);

    const result = await cvService.getMyCvs({ userId: 'user-1', role: 'JOB_SEEKER' });
    expect(result).toHaveLength(1);
    expect(mockFileService.normalizeUrl).toHaveBeenCalledWith('documents/cvs/1.pdf');
  });
});
