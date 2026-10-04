const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const otpService = require('../services/otp.service');
const { successResponse } = require('../utils/response.util');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, fullName, password, role } = req.body;
      const result = await authService.register({ email, fullName, password, role });
      return successResponse(res, 'Đăng ký tài khoản thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { type, email, otp } = req.body;
      const result = await otpService.verifyEmail(type, email, otp);
      return successResponse(res, 'Xác thực email thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const { type, email } = req.body;
      const result = await authService.resendOTP(type, email);
      return successResponse(res, 'Gửi lại mã OTP thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, 'Đăng nhập thành công', { user, accessToken }, 200);
    } catch (error) {
      next(error);
    }

  }

}

module.exports = new AuthController();
