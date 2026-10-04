const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const otpService = require('./otp.service');
const { hashPassword, comparePassword } = require('../utils/password.util');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors.util');


class AuthService {
  async register({ email, fullName, password, role = 'JOB_SEEKER' }) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictError('Email này đã được đăng ký');
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      email,
      fullName,
      passwordHash,
      role,
    });

    await emailService.sendOTP('verify-email', email);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isVerified: user.isVerified,
    }
  }

  async resendOTP(type, email) {
    await emailService.sendOTP(type, email);
    return true;
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (user.isBlocked()) {
      throw new UnauthorizedError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên để được hỗ trợ.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedError('Tài khoản chưa được xác thực');
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedError('Mật khẩu không đúng');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = tokenService.generateAccessTokens(payload);
    const refreshToken = tokenService.generateRefreshToken(payload);

    await tokenService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    };
  }

  async refreshAccessToken(refreshToken) {
    console.log('Refresh token:', refreshToken);
    tokenService.verifyRefreshToken(refreshToken);

    const token = await tokenService.findRefreshToken(refreshToken);

    if (!token) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await userRepository.findById(token.userId);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = tokenService.generateAccessTokens(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    };
  }
}

module.exports = new AuthService();
