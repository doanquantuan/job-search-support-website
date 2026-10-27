import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import tokenRepository from '../repositories/token.repository.js';
import { UnauthorizedError } from '#shared/utils/errors.util.js';

class TokenService {
  generateAccessTokens(payload) {
    return jwt.sign(payload, config.JWT.ACCESS_SECRET, {
      expiresIn: config.JWT.ACCESS_EXPIRES_IN,
    });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT.REFRESH_SECRET, {
      expiresIn: config.JWT.REFRESH_EXPIRES_IN,
    });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.JWT.ACCESS_SECRET);
    } catch (_err) {
      throw new UnauthorizedError('Token truy cập không hợp lệ hoặc đã hết hạn');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.JWT.REFRESH_SECRET);
    } catch (_err) {
      throw new UnauthorizedError('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }


  async saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return tokenRepository.saveRefreshToken(userId, token, expiresAt);
  }

  async revokeRefreshToken(token) {
    return tokenRepository.revokeToken(token);
  }

  async isRevoked(token) {
    return tokenRepository.isRevoked(token);
  }

  async findRefreshToken(token) {
    return tokenRepository.findByToken(token);
  }

  async findRefreshTokensByUserId(userId) {
    return tokenRepository.findRefreshTokensByUserId(userId);
  }
}

export default new TokenService();
