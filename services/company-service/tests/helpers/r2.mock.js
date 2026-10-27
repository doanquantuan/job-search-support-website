import { jest } from '@jest/globals';

export const R2_MOCK_URLS = {
  license: 'licenses/license-test-uuid.pdf',
  logo: 'https://pub-5d933c4c40b54437a90a14c0ceb6b767.r2.dev/logos/logo-test-uuid.png',
  envPhoto1: 'https://pub-5d933c4c40b54437a90a14c0ceb6b767.r2.dev/environments/env-test-uuid-1.jpg',
  envPhoto2: 'https://pub-5d933c4c40b54437a90a14c0ceb6b767.r2.dev/environments/env-test-uuid-2.png',
  presignedUrl: 'https://job-search-private.r2.cloudflarestorage.com/licenses/license-test.pdf?X-Amz-Signature=mock',
};

export const mockR2 = {
  uploadPrivateLicense: jest.fn().mockResolvedValue(R2_MOCK_URLS.license),
  getLicensePresignedUrl: jest.fn().mockResolvedValue(R2_MOCK_URLS.presignedUrl),
  deletePrivateLicense: jest.fn().mockResolvedValue(undefined),
  uploadPublicFile: jest.fn().mockResolvedValue(R2_MOCK_URLS.logo),
  uploadPublicMultipleFiles: jest
    .fn()
    .mockResolvedValue([R2_MOCK_URLS.envPhoto1, R2_MOCK_URLS.envPhoto2]),
  deletePublicFile: jest.fn().mockResolvedValue(undefined),
};

export function resetR2Mocks() {
  mockR2.uploadPrivateLicense.mockResolvedValue(R2_MOCK_URLS.license);
  mockR2.getLicensePresignedUrl.mockResolvedValue(R2_MOCK_URLS.presignedUrl);
  mockR2.deletePrivateLicense.mockResolvedValue(undefined);
  mockR2.uploadPublicFile.mockResolvedValue(R2_MOCK_URLS.logo);
  mockR2.uploadPublicMultipleFiles.mockResolvedValue([R2_MOCK_URLS.envPhoto1, R2_MOCK_URLS.envPhoto2]);
  mockR2.deletePublicFile.mockResolvedValue(undefined);
  Object.values(mockR2).forEach((fn) => fn.mockClear());
}

export default { mockR2, R2_MOCK_URLS, resetR2Mocks };
