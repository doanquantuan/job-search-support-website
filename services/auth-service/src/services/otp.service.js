const redis = require('../config/redis');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { NotFoundError, BadRequestError, TooManyRequestsError } = require('../utils/errors.util');

const OTP_EXPIRES_IN = 300; // 5 phút
const OTP_COOLDOWN = 60;    // 60 giây
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300; // 5 phút

class OTPService {

    async generateOTP(type, email) {
        const lockoutKey = `otp:lockout:${type}:${email}`;
        const lockoutTtl = await redis.ttl(lockoutKey);
        if (lockoutTtl > 0) {
            const mins = Math.max(1, Math.ceil(lockoutTtl / 60));
            throw new TooManyRequestsError(`Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau ${mins} phút`, mins);
        }

        const cooldownKey = `otp:cooldown:${type}:${email}`;
        const cooldown = await redis.ttl(cooldownKey);

        if (cooldown > 0) {
            throw new TooManyRequestsError(`Vui lòng thử lại sau ${cooldown} giây`, Math.ceil(cooldown / 60));
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

        console.log(`\n======================================================`);
        console.log(`[OTPService] 🔑 [DEV OTP]: ${otp} | Gửi tới: ${email} | Loại: ${type}`);
        console.log(`======================================================\n`);

        return otp;
    }

    async verifyOTP(type, email, otp) {
        const lockoutKey = `otp:lockout:${type}:${email}`;
        const lockoutTtl = await redis.ttl(lockoutKey);
        if (lockoutTtl > 0) {
            const mins = Math.max(1, Math.ceil(lockoutTtl / 60));
            throw new TooManyRequestsError(`Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau ${mins} phút`, mins);
        }

        const key = `otp:${type}:${email}`;
        const storedOtp = await redis.get(key);

        if (!storedOtp) {
            throw new BadRequestError('Mã OTP đã hết hạn hoặc không hợp lệ');
        }

        const attemptsKey = `otp:attempts:${type}:${email}`;

        if (storedOtp !== otp) {
            const attempts = await redis.incr(attemptsKey);
            if (attempts === 1) {
                await redis.expire(attemptsKey, OTP_EXPIRES_IN);
            }

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                await redis.del(key);
                await redis.del(attemptsKey);
                await redis.setex(lockoutKey, LOCKOUT_DURATION, 'locked');
                throw new TooManyRequestsError('Bạn đã nhập sai quá 5 lần, vui lòng thử lại sau 5 phút', 5);
            }

            const remaining = MAX_FAILED_ATTEMPTS - attempts;
            throw new BadRequestError(`Mã OTP không hợp lệ. Bạn còn ${remaining} lần thử`);
        }

        // Successful verification
        await redis.del(key);
        await redis.del(attemptsKey);
        return true;
    }

    async verifyEmail(email, otp) {

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Không tìm thấy tài khoản');
        }
        await this.verifyOTP("verify-email", email, otp);

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

    async verifyForgotPassword(email, otp) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError('Không tìm thấy tài khoản');
        }
        await this.verifyOTP("forgot-password", email, otp);

        const resetToken = crypto.randomBytes(32).toString('hex');

        await redis.setex(`reset_token:${resetToken}`, 900, user.email);
        return { resetToken };
    }
}

module.exports = new OTPService();