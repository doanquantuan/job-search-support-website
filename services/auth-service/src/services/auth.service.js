import userRepository from '../repositories/user.repository.js';
import oauthRepository from '../repositories/oauth.repository.js';
import tokenService from './token.service.js';
import emailService from './email.service.js';
import redis from '../config/redis.js';
import { getOAuthStrategy } from '../strategies/oauth/index.js';
import { hashPassword, comparePassword } from '#shared/utils/password.util.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@shared/utils/errors.util.js';


class AuthService {
  #normalizeEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  }

  async register({ email, fullName, password, role = 'JOB_SEEKER' }) {
    email = this.#normalizeEmail(email);
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
    email = this.#normalizeEmail(email);
    await emailService.sendOTP(type, email);
    return true;
  }

  async login(email, password) {
    email = this.#normalizeEmail(email);
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (user.status === 'BLOCKED') {
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
    email = this.#normalizeEmail(email);
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

  /**
   * Đăng nhập / Đăng ký qua OAuth (Google, Facebook, etc.)
   * Hỗ trợ Account Linking tự động nếu email đã tồn tại.
   */
  async oauthLogin({ provider, token, role = 'JOB_SEEKER' }) {
    // 1. Lấy Strategy tương ứng và verify token
    const strategy = getOAuthStrategy(provider);
    const profile = await strategy.verifyToken(token);

    const { providerUserId, email, fullName, avatar, isEmailVerified } = profile;

    // 2. Tìm tài khoản liên kết OAuth trước
    let oauthAccount = await oauthRepository.findByProviderAndId(strategy.name, providerUserId);
    let user;

    if (oauthAccount) {
      user = oauthAccount.user;
    } else {
      // 3. Nếu chưa có liên kết, kiểm tra xem Email này đã có User trong hệ thống chưa (Account Linking)
      user = await userRepository.findByEmail(email);

      if (user) {
        // Đã có User -> Liên kết tài khoản OAuth mới này vào User cũ
        await oauthRepository.createOAuthAccount({
          userId: user.id,
          provider: strategy.name,
          providerUserId,
        });

        // Nếu User cũ chưa xác thực email nhưng bên OAuth đã xác thực -> Kích hoạt tài khoản luôn
        if (!user.isVerified && isEmailVerified) {
          user = await userRepository.updateVerified(user.id, true);
        }

        // Cập nhật avatar nếu User chưa có
        if (!user.avatar && avatar) {
          user = await userRepository.update(user.id, { avatar });
        }
      } else {
        // Người dùng mới hoàn toàn -> Tạo mới User và liên kết OAuth trong 1 transaction
        user = await oauthRepository.createUserWithOAuth({
          email,
          fullName,
          avatar,
          role,
          isVerified: isEmailVerified,
          provider: strategy.name,
          providerUserId,
        });
      }
    }

    // 4. Kiểm tra trạng thái tài khoản
    if (user.isBlocked()) {
      throw new UnauthorizedError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ với quản trị viên.');
    }

    // 5. Cấp Access Token & Refresh Token
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
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}

export default new AuthService();
