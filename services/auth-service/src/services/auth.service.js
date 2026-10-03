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

    // Create user entity via repository
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


}

module.exports = new AuthService();
