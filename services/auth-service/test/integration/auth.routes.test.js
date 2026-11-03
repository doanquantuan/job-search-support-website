import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock dependencies trước khi import app
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

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshAccessToken: jest.fn(),
  logout: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  resendOTP: jest.fn(),
};

const mockOtpService = {
  verifyEmail: jest.fn(),
  verifyForgotPassword: jest.fn(),
};

jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  default: mockAuthService,
}));

jest.unstable_mockModule('../../src/services/otp.service.js', () => ({
  default: mockOtpService,
}));

// 2. Import Express app sau khi đã mock services
const { default: app } = await import('../../src/app.js');
const {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} = await import('#shared/utils/errors.util.js');

describe('Auth Service - API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    test('IT-01: Trả về trạng thái healthy của auth-service', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'auth-service',
      });
    });
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegisterPayload = {
      email: 'candidate@example.com',
      fullName: 'Nguyen Van A',
      password: 'Password123!',
      role: 'JOB_SEEKER',
    };

    test('IT-02: Đăng ký thành công trả về HTTP 201', async () => {
      mockAuthService.register.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'candidate@example.com',
        fullName: 'Nguyen Van A',
        isVerified: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual({
        id: 'user-uuid-1',
        email: 'candidate@example.com',
        fullName: 'Nguyen Van A',
        isVerified: false,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'candidate@example.com',
        fullName: 'Nguyen Van A',
        password: 'Password123!',
        role: 'JOB_SEEKER',
      });
    });

    test('IT-03: Trả về 400 nếu dữ liệu đầu vào không hợp lệ (Mật khẩu yếu)', async () => {
      const invalidPayload = {
        email: 'candidate@example.com',
        fullName: 'Nguyen Van A',
        password: '123', // Mật khẩu không thỏa mãn validation regex
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    test('IT-04: Trả về 409 Conflict nếu email đã tồn tại', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictError('Email này đã được đăng ký'));

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email này đã được đăng ký');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const validLoginPayload = {
      email: 'candidate@example.com',
      password: 'Password123!',
    };

    test('IT-05: Đăng nhập thành công trả về 200, access token trong body và refreshToken trong cookie', async () => {
      mockAuthService.login.mockResolvedValue({
        user: {
          id: 'user-uuid-1',
          email: 'candidate@example.com',
          fullName: 'Nguyen Van A',
          role: 'JOB_SEEKER',
        },
        accessToken: 'access_token_jwt_123',
        refreshToken: 'refresh_token_jwt_456',
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginPayload);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBe('access_token_jwt_123');
      expect(response.body.data.user.email).toBe('candidate@example.com');

      // Kiểm tra HTTP-only cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken=refresh_token_jwt_456');
      expect(cookies[0]).toContain('HttpOnly');
    });

    test('IT-06: Trả về 401 Unauthorized khi sai thông tin đăng nhập', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedError('Mật khẩu không đúng'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(validLoginPayload);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Mật khẩu không đúng');
    });

    test('IT-07: Trả về 404 NotFound nếu user không tồn tại', async () => {
      mockAuthService.login.mockRejectedValue(new NotFoundError('Người dùng không tồn tại'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Người dùng không tồn tại');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    test('IT-08: Cấp mới access token thành công khi gửi kèm refreshToken cookie', async () => {
      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new_access_token_789',
        user: {
          id: 'user-uuid-1',
          email: 'candidate@example.com',
        },
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=valid_mock_refresh_token']);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBe('new_access_token_789');
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith('valid_mock_refresh_token');
    });

    test('IT-09: Trả về 401 nếu request không có cookie refreshToken', async () => {
      const response = await request(app).post('/api/v1/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Refresh token không tìm thấy');
      expect(mockAuthService.refreshAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    test('IT-10: Đăng xuất thành công và xóa cookie refreshToken', async () => {
      mockAuthService.logout.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', ['refreshToken=token_to_logout']);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockAuthService.logout).toHaveBeenCalledWith('token_to_logout');

      const cookies = response.headers['set-cookie'];
      expect(cookies[0]).toMatch(/refreshToken=;/);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    test('IT-11: Xác thực OTP thành công với type=verify-email', async () => {
      mockOtpService.verifyEmail.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'candidate@example.com',
        isVerified: true,
      });

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          type: 'verify-email',
          email: 'candidate@example.com',
          otp: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(mockOtpService.verifyEmail).toHaveBeenCalledWith('candidate@example.com', '123456');
    });
  });
});

