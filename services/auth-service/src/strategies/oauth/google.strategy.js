const { OAuth2Client } = require('google-auth-library');
const BaseOAuthStrategy = require('./base.strategy');
const { BadRequestError } = require('../../utils/errors.util');

class GoogleOAuthStrategy extends BaseOAuthStrategy {
  constructor() {
    super('GOOGLE');
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyToken(idToken) {
    if (!idToken) {
      throw new BadRequestError('Google token không được để trống');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestError('Không thể giải mã dữ liệu người dùng từ Google');
      }

      const {
        sub: providerUserId,
        email,
        name: fullName,
        picture: avatar,
        email_verified: isEmailVerified,
      } = payload;

      if (!email) {
        throw new BadRequestError('Tài khoản Google không có email');
      }

      return {
        providerUserId,
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
        avatar: avatar || null,
        isEmailVerified: Boolean(isEmailVerified),
      };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Google token không hợp lệ hoặc đã hết hạn');
    }
  }
}

module.exports = new GoogleOAuthStrategy();

