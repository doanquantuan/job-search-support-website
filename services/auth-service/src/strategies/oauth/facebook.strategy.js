const BaseOAuthStrategy = require('./base.strategy');
const { BadRequestError } = require('../../utils/errors.util');

class FacebookOAuthStrategy extends BaseOAuthStrategy {
  constructor() {
    super('FACEBOOK');
  }

  /**
   * Xác thực Facebook Access Token qua Meta Graph API
   * @param {string} accessToken - Token do Facebook cấp từ Frontend
   */
  async verifyToken(accessToken) {
    if (!accessToken) {
      throw new BadRequestError('Facebook token không được để trống');
    }

    try {
      const graphUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`;
      const response = await fetch(graphUrl);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Facebook OAuth Error]:', errorData);
        throw new BadRequestError('Facebook token không hợp lệ hoặc đã hết hạn');
      }

      const data = await response.json();

      if (!data.id) {
        throw new BadRequestError('Không thể xác thực danh tính từ Facebook');
      }

      // Nếu tài khoản Facebook đăng ký bằng SĐT không có email, tạo email đại diện
      const email = data.email
        ? data.email.trim().toLowerCase()
        : `fb_${data.id}@facebook.jobsearch.com`;

      const avatar = data.picture?.data?.url || null;

      return {
        providerUserId: data.id,
        email,
        fullName: data.name || 'Người dùng Facebook',
        avatar,
        isEmailVerified: Boolean(data.email), // Chỉ coi là verified nếu Facebook trả về email thật
      };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      console.error('[Facebook OAuth Exception]:', error?.message || error);
      throw new BadRequestError('Không thể kết nối đến máy chủ xác thực Facebook');
    }
  }
}

module.exports = new FacebookOAuthStrategy();

