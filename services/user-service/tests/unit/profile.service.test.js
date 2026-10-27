// Unit tests for ProfileService
// Language: Vietnamese
import { jest } from '@jest/globals';
import fs from 'fs';

// Mock dependencies (must be set before importing the service)
jest.unstable_mockModule('../../src/repositories/profile.repository.js', () => ({
  default: {
    getInfo: jest.fn(),
    updateInfo: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/services/file.service.js', () => ({
  default: {
    processAvatarImage: jest.fn(),
    uploadProcessedImage: jest.fn(),
    deleteFile: jest.fn(),
  },
}));

let ProfileService; // will be set in beforeAll
let mockProfileRepo;
let mockFileService;

beforeAll(async () => {
  const profileRepoMod = await import('../../src/repositories/profile.repository.js');
  mockProfileRepo = profileRepoMod.default;
  const fileServiceMod = await import('../../src/services/file.service.js');
  mockFileService = fileServiceMod.default;
  const serviceMod = await import('../../src/services/profile.service.js');
  ProfileService = serviceMod.default;
});

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getInfo trả về thông tin khi role là JOB_SEEKER và profile tồn tại', async () => {
    const fakeProfile = {
      userId: 'u1',
      fullName: 'Nguyễn A',
      avatar: 'url',
      contactEmail: 'a@example.com',
      phone: '123',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      address: 'HN',
      githubUrl: 'https://github.com/a',
    };
    mockProfileRepo.getInfo.mockResolvedValue(fakeProfile);
    const result = await ProfileService.getInfo({ userId: 'u1', role: 'JOB_SEEKER' });
    expect(mockProfileRepo.getInfo).toHaveBeenCalledWith({ userId: 'u1' });
    expect(result).toEqual({
      id: fakeProfile.userId,
      fullName: fakeProfile.fullName,
      avatar: fakeProfile.avatar,
      contactEmail: fakeProfile.contactEmail,
      phone: fakeProfile.phone,
      dateOfBirth: fakeProfile.dateOfBirth,
      gender: fakeProfile.gender,
      address: fakeProfile.address,
      githubUrl: fakeProfile.githubUrl,
    });
  });

  test('getInfo trả về null khi profile không tồn tại', async () => {
    mockProfileRepo.getInfo.mockResolvedValue(null);
    const result = await ProfileService.getInfo({ userId: 'u2', role: 'JOB_SEEKER' });
    expect(result).toBeNull();
  });

  test('updateInfo cập nhật thành công khi profile tồn tại', async () => {
    mockProfileRepo.getInfo.mockResolvedValue({});
    mockProfileRepo.updateInfo.mockResolvedValue({ success: true });
    const data = { fullName: 'B' };
    const res = await ProfileService.updateInfo({ userId: 'u3', role: 'JOB_SEEKER', data });
    expect(mockProfileRepo.updateInfo).toHaveBeenCalledWith({ userId: 'u3', data });
    expect(res).toEqual({ success: true });
  });

  test('updateInfo throws NotFoundError khi profile không tồn tại', async () => {
    mockProfileRepo.getInfo.mockResolvedValue(null);
    await expect(
      ProfileService.updateInfo({ userId: 'u4', role: 'JOB_SEEKER', data: {} })
    ).rejects.toThrow('Profile không tồn tại');
  });

  test('uploadAvatar xử lý và cập nhật avatar thành công', async () => {
    const file = { path: '/tmp/avatar.png' };
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    const processed = { buffer: Buffer.from('data'), extension: 'webp', mimetype: 'image/webp' };
    mockFileService.processAvatarImage.mockResolvedValue(processed);
    mockFileService.uploadProcessedImage.mockResolvedValue({ url: 'https://cdn/avatar.webp' });
    mockFileService.deleteFile.mockResolvedValue({});
    mockProfileRepo.getInfo.mockResolvedValue({ avatar: 'oldUrl' });
    mockProfileRepo.updateInfo.mockResolvedValue({});
    const result = await ProfileService.uploadAvatar({ userId: 'u5', role: 'JOB_SEEKER', file });
    expect(mockFileService.processAvatarImage).toHaveBeenCalledWith(file.path, expect.any(Object));
    expect(mockFileService.uploadProcessedImage).toHaveBeenCalledWith(
      processed.buffer,
      processed.extension,
      processed.mimetype,
      'avatars'
    );
    expect(mockProfileRepo.updateInfo).toHaveBeenCalledWith({ userId: 'u5', data: { avatar: 'https://cdn/avatar.webp' } });
    expect(result).toEqual({ avatar: 'https://cdn/avatar.webp' });
    expect(mockFileService.deleteFile).toHaveBeenCalledWith('oldUrl');
    expect(fs.unlinkSync).toHaveBeenCalledWith(file.path);
  });

  test('deleteAvatar xóa avatar hiện tại và trả về thông báo', async () => {
    const current = { avatar: 'oldUrl' };
    mockProfileRepo.getInfo.mockResolvedValue(current);
    mockProfileRepo.updateInfo.mockResolvedValue({});
    mockFileService.deleteFile.mockResolvedValue({});
    const res = await ProfileService.deleteAvatar({ userId: 'u6', role: 'JOB_SEEKER' });
    expect(mockProfileRepo.updateInfo).toHaveBeenCalledWith({ userId: 'u6', data: { avatar: null } });
    expect(mockFileService.deleteFile).toHaveBeenCalledWith('oldUrl');
    expect(res).toEqual({ message: 'Xóa avatar thành công' });
  });
});
