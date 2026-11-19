import { jest } from '@jest/globals';

const mockSend = jest.fn();

jest.unstable_mockModule('../../src/config/r2.config.js', () => ({
  s3Client: { send: mockSend },
  bucketName: 'job-search-public',
  privateBucketName: 'job-search-private',
  publicUrl: 'https://pub-test.r2.dev',
}));

const { default: fileService } = await import('../../src/services/file.service.js');

describe('FileService Unit Tests (R2 Public Bucket logo/ & environments/)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({});
  });

  it('uploadProcessedImage lưu đúng vào thư mục gốc logo/ trên public bucket', async () => {
    const res = await fileService.uploadProcessedImage(
      Buffer.from('fake-webp'),
      '.webp',
      'image/webp',
      'logo'
    );

    expect(res.key).toMatch(/^logo\/\d+_[a-f0-9]+\.webp$/);
    expect(res.url).toBe(`https://pub-test.r2.dev/${res.key}`);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.Bucket).toBe('job-search-public');
    expect(mockSend.mock.calls[0][0].input.Key).toBe(res.key);
  });

  it('uploadProcessedImage lưu đúng vào thư mục gốc environments/ trên public bucket', async () => {
    const res = await fileService.uploadProcessedImage(
      Buffer.from('fake-webp'),
      '.webp',
      'image/webp',
      'environments'
    );

    expect(res.key).toMatch(/^environments\/\d+_[a-f0-9]+\.webp$/);
    expect(res.url).toBe(`https://pub-test.r2.dev/${res.key}`);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.Bucket).toBe('job-search-public');
  });

  it('isAllowedDeleteKey & deleteFile chỉ cho phép xóa key thuộc whitelist prefix và chặn path traversal', async () => {
    expect(fileService.isAllowedDeleteKey('logo/abc.webp')).toBe(true);
    expect(fileService.isAllowedDeleteKey('environments/xyz.webp')).toBe(true);
    expect(fileService.isAllowedDeleteKey('images/logos/legacy.webp')).toBe(true);
    expect(fileService.isAllowedDeleteKey('documents/licenses/doc.pdf')).toBe(true);

    // Chặn các key ngoài whitelist & path traversal
    expect(fileService.isAllowedDeleteKey('other-folder/file.webp')).toBe(false);
    expect(fileService.isAllowedDeleteKey('logo/../secret.env')).toBe(false);
    expect(fileService.isAllowedDeleteKey('../environments/a.webp')).toBe(false);

    // deleteFile từ chối key lạ → KHÔNG gọi S3
    await fileService.deleteFile('https://pub-test.r2.dev/system/important.json');
    await fileService.deleteFile('logo/../secret.txt');
    expect(mockSend).not.toHaveBeenCalled();

    // deleteFile cho phép key hợp lệ thuộc environments/ trên public bucket
    await fileService.deleteFile('https://pub-test.r2.dev/environments/office1.webp');
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.Bucket).toBe('job-search-public');
    expect(mockSend.mock.calls[0][0].input.Key).toBe('environments/office1.webp');
  });
});
