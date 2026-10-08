const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const otpService = require('../services/otp.service');
const { successResponse } = require('../utils/response.util');
const { UnauthorizedError, BadRequestError } = require('../utils/errors.util');

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

  async verifyOTP(req, res, next) {
    try {
      const { type, purpose, email, otp } = req.body;
      const otpType = type || (purpose === 'REGISTER' ? 'verify-email' : purpose === 'RESET_PASSWORD' ? 'forgot-password' : null);

      if (!otpType) {
        throw new BadRequestError('Mục đích xác thực (type hoặc purpose) không hợp lệ hoặc bị thiếu');
      }

      let result;
      if (otpType === 'verify-email') {
        result = await otpService.verifyEmail(email, otp);
      } else if (otpType === 'forgot-password') {
        result = await otpService.verifyForgotPassword(email, otp);
      } else {
        throw new BadRequestError('Mục đích xác thực không hợp lệ');
      }

      return successResponse(res, 'Xác thực email thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req, res, next) {
    try {
      const { type, purpose, email } = req.body;
      const otpType = type || (purpose === 'REGISTER' ? 'verify-email' : purpose === 'RESET_PASSWORD' ? 'forgot-password' : null);

      if (!otpType) {
        throw new BadRequestError('Mục đích gửi lại OTP (type hoặc purpose) không hợp lệ hoặc bị thiếu');
      }

      const result = await authService.resendOTP(otpType, email);
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

  async refreshAccessToken(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token không tìm thấy');
      }
      const { user, accessToken } = await authService.refreshAccessToken(refreshToken);
      return successResponse(res, 'Lấy token mới thành công', { user, accessToken }, 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token không tìm thấy');
      }
      await authService.logout(refreshToken);
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return successResponse(res, 'Đăng xuất thành công', null, 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return successResponse(res, 'Quên mật khẩu thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { newPassword, resetToken } = req.body

      const result = await authService.resetPassword(resetToken, newPassword);
      return successResponse(res, 'Đặt lại mật khẩu thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new AuthController();
