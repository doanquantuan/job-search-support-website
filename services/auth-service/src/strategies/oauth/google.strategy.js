import { OAuth2Client } from 'google-auth-library';
import BaseOAuthStrategy from './base.strategy.js';
import { BadRequestError } from '#shared/utils/errors.util.js';

class GoogleOAuthStrategy extends BaseOAuthStrategy {
  constructor() {
    super('GOOGLE');
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyToken(token) {
    if (!token) {
      throw new BadRequestError('Google token không được để trống');
    }

    // 1. Thử xác thực theo dạng ID Token (JWT do Google ký)
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (payload && payload.email) {
        return {
          providerUserId: payload.sub,
          email: payload.email.trim().toLowerCase(),
          fullName: payload.name || payload.email.split('@')[0],
          avatar: payload.picture || null,
          isEmailVerified: Boolean(payload.email_verified),
        };
      }
    } catch (e) {
      // Nếu không phải ID Token, tiếp tục thử kiểm tra xem có phải Access Token từ popup hook
    }

    // 2. Thử xác thực theo dạng Access Token (Google Identity Services popup hook)
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.email) {
          return {
            providerUserId: data.sub,
            email: data.email.trim().toLowerCase(),
            fullName: data.name || data.email.split('@')[0],
            avatar: data.picture || null,
            isEmailVerified: Boolean(data.email_verified),
          };
        }
      } else {
        const errorDetail = await response.text();
        console.error('[Google OAuth API Error]:', response.status, errorDetail);
      }
    } catch (error) {
      console.error('[Google OAuth Error]:', error?.message || error);
      throw new BadRequestError('Google token không hợp lệ hoặc đã hết hạn');
    }

    throw new BadRequestError('Không thể xác thực thông tin tài khoản Google');
  }
}

export default new GoogleOAuthStrategy();

