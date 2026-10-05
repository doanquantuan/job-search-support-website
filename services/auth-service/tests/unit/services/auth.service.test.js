// 1. Mock toàn bộ dependencies của AuthService trước khi require module
jest.mock('ioredis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    ttl: jest.fn(),
  })),
}));
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    close: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}));
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/services/token.service');
jest.mock('../../../src/services/email.service');
jest.mock('../../../src/services/otp.service');
jest.mock('../../../src/config/redis', () => ({
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  quit: jest.fn(),
  on: jest.fn(),
}));
jest.mock('../../../src/utils/password.util');

// 2. Require modules sau khi đã mock
const authService = require('../../../src/services/auth.service');
const userRepository = require('../../../src/repositories/user.repository');
const tokenService = require('../../../src/services/token.service');
const emailService = require('../../../src/services/email.service');
const { hashPassword, comparePassword } = require('../../../src/utils/password.util');
const {
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} = require('../../../src/utils/errors.util');
const User = require('../../../src/domain/entities/User');

describe('AuthService - Unit Tests (Priority Cases)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Method: login', () => {
    const mockValidUser = new User({
      id: 'user-uuid-123',
      email: 'trunghau@example.com',
      fullName: 'Trung Hau',
      passwordHash: 'hashed_password_abc',
      role: 'JOB_SEEKER',
      status: 'ACTIVE',
      isVerified: true,
    });

    // AUTH-07: Happy path — baseline test cho toàn bộ login flow
    test('AUTH-07: Đăng nhập thành công khi thông tin hợp lệ (Happy path)', async () => {

      userRepository.findByEmail.mockResolvedValue(mockValidUser);
      comparePassword.mockResolvedValue(true);
      tokenService.generateAccessTokens.mockReturnValue('mocked_access_token');
      tokenService.generateRefreshToken.mockReturnValue('mocked_refresh_token');
      tokenService.saveRefreshToken.mockResolvedValue(true);

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


      expect(userRepository.findByEmail).toHaveBeenCalledWith('trunghau@example.com');
      expect(comparePassword).toHaveBeenCalledWith('ValidPassword123', mockValidUser.passwordHash);
      expect(tokenService.saveRefreshToken).toHaveBeenCalledWith(mockValidUser.id, 'mocked_refresh_token');
    });

    // AUTH-08: User không tồn tại 
    test('AUTH-08: Ném lỗi NotFoundError khi user không tồn tại trong hệ thống', async () => {

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('notfound@example.com', 'Password123'))
        .rejects
        .toThrow(NotFoundError);

      await expect(authService.login('notfound@example.com', 'Password123'))
        .rejects
        .toThrow('Người dùng không tồn tại');


      expect(comparePassword).not.toHaveBeenCalled();
    });

    // AUTH-09: BLOCKED account - security gate
    test('AUTH-09: Ném lỗi UnauthorizedError khi tài khoản bị khóa (status = BLOCKED)', async () => {

      const mockBlockedUser = new User({
        id: 'user-blocked-id',
        email: 'blocked@example.com',
        fullName: 'Blocked User',
        passwordHash: 'hashed_password_abc',
        role: 'JOB_SEEKER',
        status: 'BLOCKED',
        isVerified: true,
      });

      userRepository.findByEmail.mockResolvedValue(mockBlockedUser);

      await expect(authService.login('blocked@example.com', 'Password123'))
        .rejects
        .toThrow(UnauthorizedError);

      await expect(authService.login('blocked@example.com', 'Password123'))
        .rejects
        .toThrow('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để được hỗ trợ.');

      expect(comparePassword).not.toHaveBeenCalled();
    });

    // AUTH-10: Unverified account - security gate
    test('AUTH-10: Ném lỗi UnauthorizedError khi tài khoản chưa được xác thực (isVerified = false)', async () => {

      const mockUnverifiedUser = new User({
        id: 'user-unverified-id',
        email: 'unverified@example.com',
        fullName: 'Unverified User',
        passwordHash: 'hashed_password_abc',
        role: 'JOB_SEEKER',
        status: 'ACTIVE',
        isVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUnverifiedUser);

      await expect(authService.login('unverified@example.com', 'Password123'))
        .rejects
        .toThrow(UnauthorizedError);

      await expect(authService.login('unverified@example.com', 'Password123'))
        .rejects
        .toThrow('Tài khoản chưa được xác thực');

      expect(comparePassword).not.toHaveBeenCalled();
    });

    // AUTH-11: Wrong password - security gate quan trọng nhất
    test('AUTH-11: Ném lỗi UnauthorizedError khi nhập sai mật khẩu', async () => {

      userRepository.findByEmail.mockResolvedValue(mockValidUser);
      comparePassword.mockResolvedValue(false);

      await expect(authService.login('trunghau@example.com', 'WrongPassword!'))
        .rejects
        .toThrow(UnauthorizedError);

      await expect(authService.login('trunghau@example.com', 'WrongPassword!'))
        .rejects
        .toThrow('Mật khẩu không đúng');

      expect(tokenService.generateAccessTokens).not.toHaveBeenCalled();
      expect(tokenService.saveRefreshToken).not.toHaveBeenCalled();
    });

    // AUTH-15: Branch ordering (BLOCKED trước unverified) 
    test('AUTH-15: Phải kiểm tra và báo lỗi BLOCKED trước khi kiểm tra isVerified', async () => {

      const mockBlockedAndUnverifiedUser = new User({
        id: 'user-blocked-unverified-id',
        email: 'blocked-unverified@example.com',
        fullName: 'Dual Issue User',
        passwordHash: 'hashed_password_abc',
        role: 'JOB_SEEKER',
        status: 'BLOCKED',
        isVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockBlockedAndUnverifiedUser);

      await expect(authService.login('blocked-unverified@example.com', 'Password123'))
        .rejects
        .toThrow('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để được hỗ trợ.');
    });
  });

  describe('Method: register', () => {
    // AUTH-02: Duplicate email - nghiệp vụ cốt lõi
    test('AUTH-02: Ném lỗi ConflictError khi đăng ký với email đã tồn tại', async () => {

      const existingUser = new User({
        id: 'existing-id',
        email: 'duplicate@example.com',
        fullName: 'Old User',
        passwordHash: 'hash123',
      });

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          fullName: 'New User',
          password: 'Password123',
          role: 'JOB_SEEKER',
        })
      )
        .rejects
        .toThrow(ConflictError);

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          fullName: 'New User',
          password: 'Password123',
          role: 'JOB_SEEKER',
        })
      )
        .rejects
        .toThrow('Email này đã được đăng ký');


      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(emailService.sendOTP).not.toHaveBeenCalled();
    });
  });
});
