const redis = require('../config/redis');
const userRepository = require('../repositories/user.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors.util');

const OTP_EXPIRES_IN = 300; // 5 phút
const OTP_COOLDOWN = 60;    // 60 giây

class OTPService {

    async generateOTP(type, email) {
        const cooldownKey = `otp:cooldown:${type}:${email}`;

        const cooldown = await redis.ttl(cooldownKey);

        if (cooldown > 0) {
            throw new BadRequestError(`Vui lòng thử lại sau ${cooldown} giây`);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await redis.setex(
            `otp:${type}:${email}`,
            OTP_EXPIRES_IN,
            otp
        );

        await redis.setex(
            cooldownKey,
            OTP_COOLDOWN,
            '1'
        );

        return otp;
    }

    async verifyOTP(type, email, otp) {
        const key = `otp:${type}:${email}`;

        const storedOtp = await redis.get(key);

        if (!storedOtp) {
            throw new BadRequestError('Mã OTP đã hết hạn hoặc không hợp lệ');
        }
        if (storedOtp !== otp) {
            throw new BadRequestError('Mã OTP không hợp lệ');
        }
        await redis.del(key);
        return true;
    }

    async verifyEmail(type, email, otp) {

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Không tìm thấy tài khoản');
        }
        await this.verifyOTP(type, email, otp);
        const updatedUser = await userRepository.updateVerified(
            user.id,
            true
        );

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            isVerified: updatedUser.isVerified,
        };
    }
}

module.exports = new OTPService();