const userRepository = require('../repositories/user.repository');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const otpService = require('./otp.service');
const redis = require('../config/redis');
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
      if (existingUser.isVerified) {
        throw new ConflictError('Email này đã được đăng ký');
      }

      // Nếu tài khoản đã đăng ký nhưng chưa xác thực email, cập nhật thông tin mới và gửi lại OTP
      const passwordHash = await hashPassword(password);
      const updatedUser = await userRepository.update(existingUser.id, {
        fullName,
        passwordHash,
        role,
      });

      await emailService.sendOTP('verify-email', email);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isVerified: updatedUser.isVerified,
      };
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
      const error = new UnauthorizedError('Tài khoản chưa được xác thực');
      error.code = 'ACCOUNT_NOT_VERIFIED';
      throw error;
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
    tokenService.verifyRefreshToken(refreshToken);

    const token = await tokenService.findRefreshToken(refreshToken);

    if (!token) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc không tồn tại');
    }

    if (token.isRevoked) {
      throw new UnauthorizedError('Refresh token đã bị thu hồi');
    }

    if (token.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token đã hết hạn');
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

  async logout(refreshToken) {
    tokenService.verifyRefreshToken(refreshToken);

    const token = await tokenService.findRefreshToken(refreshToken);

    if (!token) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    await tokenService.revokeRefreshToken(refreshToken);

    return true;
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    await emailService.sendOTP('forgot-password', email);

    return true;
  }

  async resetPassword(resetToken, newPassword) {
    const email = await redis.get(`reset_token:${resetToken}`);
    if (!email) throw new BadRequestError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');

    const passwordHash = await hashPassword(newPassword);

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    await userRepository.update(user.id, { passwordHash });

    const tokens = await tokenService.findRefreshTokensByUserId(user.id);
    for (const token of tokens) {
      await tokenService.revokeRefreshToken(token.token);
    }

    // Xóa resetToken khỏi Redis để tránh tái sử dụng (One-time use)
    await redis.del(`reset_token:${resetToken}`);

    return true;

  }
}

module.exports = new AuthService();
