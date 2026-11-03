import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// 1. Mock các modules bên ngoài & config trước khi dynamic import authService
jest.unstable_mockModule('#shared/rabbitmq/publisher.js', () => ({
  publish: jest.fn().mockResolvedValue(true),
}));
jest.unstable_mockModule('ioredis', () => ({
  Redis: class {
    on() {}
    get() {}
    setex() {}
    del() {}
    quit() {}
  },
  default: class {
    on() {}
    get() {}
    setex() {}
    del() {}
    quit() {}
  },
}));

jest.unstable_mockModule('bullmq', () => ({
  Queue: class {
    add() {}
    close() {}
  },
  Worker: class {
    on() {}
    close() {}
  },
}));

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
};

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  default: mockRedis,
}));

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateVerified: jest.fn(),
};

jest.unstable_mockModule('../../src/repositories/user.repository.js', () => ({
  default: mockUserRepository,
}));

const mockOAuthRepository = {
  findByProviderAndId: jest.fn(),
  createOAuthAccount: jest.fn(),
  createUserWithOAuth: jest.fn(),
};

jest.unstable_mockModule('../../src/repositories/oauth.repository.js', () => ({
  default: mockOAuthRepository,
}));

const mockTokenService = {
  generateAccessTokens: jest.fn(),
  generateRefreshToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  findRefreshTokensByUserId: jest.fn(),
  revokeRefreshToken: jest.fn(),
};

jest.unstable_mockModule('../../src/services/token.service.js', () => ({
  default: mockTokenService,
}));

const mockEmailService = {
  sendOTP: jest.fn(),
};

jest.unstable_mockModule('../../src/services/email.service.js', () => ({
  default: mockEmailService,
}));

const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();

jest.unstable_mockModule('#shared/utils/password.util.js', () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
}));

// 2. Import module cần test sau khi unstable_mockModule đã cấu hình
const { default: authService } = await import('../../src/services/auth.service.js');
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} = await import('#shared/utils/errors.util.js');

describe('AuthService - Unit Tests (Core Logic)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Method: login', () => {
    const mockValidUser = {
      id: 'user-uuid-123',
      email: 'trunghau@example.com',
      fullName: 'Trung Hau',
      passwordHash: 'hashed_password_abc',
      role: 'JOB_SEEKER',
      status: 'ACTIVE',
      isVerified: true,
    };

    test('AUTH-01: Đăng nhập thành công khi thông tin hợp lệ (Happy path)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockValidUser);
      mockComparePassword.mockResolvedValue(true);
      mockTokenService.generateAccessTokens.mockReturnValue('mocked_access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('mocked_refresh_token');
      mockTokenService.saveRefreshToken.mockResolvedValue(true);

      const result = await authService.login('trunghau@example.com', 'ValidPassword123');

      expect(result).toEqual({
        accessToken: 'mocked_access_token',
        refreshToken: 'mocked_refresh_token',
        user: {
          id: mockValidUser.id,
          email: mockValidUser.email,
          fullName: mockValidUser.fullName,
          role: mockValidUser.role,
        },
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('trunghau@example.com');
      expect(mockComparePassword).toHaveBeenCalledWith('ValidPassword123', mockValidUser.passwordHash);
      expect(mockTokenService.saveRefreshToken).toHaveBeenCalledWith(mockValidUser.id, 'mocked_refresh_token');
    });

    test('AUTH-02: Ném lỗi NotFoundError khi user không tồn tại trong hệ thống', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('notfound@example.com', 'Password123'))
        .rejects
        .toThrow(NotFoundError);

      expect(mockComparePassword).not.toHaveBeenCalled();
    });

    test('AUTH-03: Ném lỗi UnauthorizedError khi tài khoản bị khóa (status = BLOCKED)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockValidUser,
        status: 'BLOCKED',
      });

      await expect(authService.login('trunghau@example.com', 'Password123'))
        .rejects
        .toThrow(UnauthorizedError);

      expect(mockComparePassword).not.toHaveBeenCalled();
    });

    test('AUTH-04: Ném lỗi UnauthorizedError khi tài khoản chưa được xác thực (isVerified = false)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockValidUser,
        isVerified: false,
      });

      await expect(authService.login('trunghau@example.com', 'Password123'))
        .rejects
        .toThrow('Tài khoản chưa được xác thực');

      expect(mockComparePassword).not.toHaveBeenCalled();
    });

    test('AUTH-05: Ném lỗi UnauthorizedError khi nhập sai mật khẩu', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockValidUser);
      mockComparePassword.mockResolvedValue(false);

      await expect(authService.login('trunghau@example.com', 'WrongPassword!'))
        .rejects
        .toThrow('Mật khẩu không đúng');

      expect(mockTokenService.generateAccessTokens).not.toHaveBeenCalled();
      expect(mockTokenService.saveRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('Method: register', () => {
    test('AUTH-06: Đăng ký thành công cho email mới (Happy path)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('new_hash_123');
      mockUserRepository.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        fullName: 'New User',
        isVerified: false,
      });
      mockEmailService.sendOTP.mockResolvedValue(true);

      const result = await authService.register({
        email: 'newuser@example.com',
        fullName: 'New User',
        password: 'Password123',
        role: 'JOB_SEEKER',
      });

      expect(result).toEqual({
        id: 'new-user-id',
        email: 'newuser@example.com',
        fullName: 'New User',
        isVerified: false,
      });
      expect(mockEmailService.sendOTP).toHaveBeenCalledWith('verify-email', 'newuser@example.com');
    });

    test('AUTH-07: Ném ConflictError khi đăng ký với email đã được xác minh', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: 'duplicate@example.com',
        isVerified: true,
      });

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          fullName: 'Duplicate',
          password: 'Password123',
        })
      )
        .rejects
        .toThrow(ConflictError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendOTP).not.toHaveBeenCalled();
    });

    test('AUTH-08: Cho phép gửi lại OTP và cập nhật thông tin nếu tài khoản cũ chưa xác thực', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'unverified-user-id',
        email: 'pending@example.com',
        isVerified: false,
      });
      mockHashPassword.mockResolvedValue('updated_hash');
      mockUserRepository.update.mockResolvedValue({
        id: 'unverified-user-id',
        email: 'pending@example.com',
        fullName: 'Updated Name',
        isVerified: false,
      });
      mockEmailService.sendOTP.mockResolvedValue(true);

      const result = await authService.register({
        email: 'pending@example.com',
        fullName: 'Updated Name',
        password: 'NewPassword123',
      });

      expect(result.id).toBe('unverified-user-id');
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockEmailService.sendOTP).toHaveBeenCalledWith('verify-email', 'pending@example.com');
    });
  });

  describe('Method: refreshAccessToken', () => {
    test('AUTH-09: Cấp accessToken mới thành công khi refreshToken hợp lệ', async () => {
      const validTokenDoc = {
        userId: 'user-123',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 60000),
      };

      mockTokenService.findRefreshToken.mockResolvedValue(validTokenDoc);
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        fullName: 'User Example',
        role: 'JOB_SEEKER',
      });
      mockTokenService.generateAccessTokens.mockReturnValue('new_access_token');

      const result = await authService.refreshAccessToken('valid_refresh_token');

      expect(result.accessToken).toBe('new_access_token');
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid_refresh_token');
    });

    test('AUTH-10: Ném UnauthorizedError khi refreshToken đã bị thu hồi (isRevoked = true)', async () => {
      mockTokenService.findRefreshToken.mockResolvedValue({
        userId: 'user-123',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(authService.refreshAccessToken('revoked_token'))
        .rejects
        .toThrow('Refresh token đã bị thu hồi');
    });
  });

  describe('Method: resetPassword', () => {
    test('AUTH-11: Đặt lại mật khẩu thành công và thu hồi tất cả refresh tokens', async () => {
      mockRedis.get.mockResolvedValue('user@example.com');
      mockHashPassword.mockResolvedValue('new_hashed_pwd');
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      });
      mockTokenService.findRefreshTokensByUserId.mockResolvedValue([
        { token: 'token-session-1' },
        { token: 'token-session-2' },
      ]);

      const result = await authService.resetPassword('valid_reset_token', 'NewSecret123');

      expect(result).toBe(true);
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        passwordHash: 'new_hashed_pwd',
      });
      expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledTimes(2);
      expect(mockRedis.del).toHaveBeenCalledWith('reset_token:valid_reset_token');
    });

    test('AUTH-12: Ném BadRequestError khi resetToken không tồn tại hoặc đã hết hạn trong Redis', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(authService.resetPassword('expired_token', 'NewSecret123'))
        .rejects
        .toThrow(BadRequestError);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
