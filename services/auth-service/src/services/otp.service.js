const redis = require('../config/redis');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const { NotFoundError, BadRequestError, TooManyRequestsError } = require('../utils/errors.util');

const OTP_EXPIRES_IN = 300; // 5 phút
const OTP_COOLDOWN = 60;    // 60 giây
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300; // 5 phút

// Lua script sinh Atomic OTP
const GENERATE_OTP_LUA = `
    local lockoutTtl = redis.call('TTL', KEYS[1])
    if lockoutTtl > 0 then
        return { 'LOCKOUT', lockoutTtl }
    end

    local cooldownTtl = redis.call('TTL', KEYS[2])
    if cooldownTtl > 0 then
        return { 'COOLDOWN', cooldownTtl }
    end

    redis.call('SETEX', KEYS[3], tonumber(ARGV[2]), ARGV[1])
    redis.call('SETEX', KEYS[2], tonumber(ARGV[3]), '1')
    return { 'SUCCESS' }
    `;

// Lua script xác thực OTP nguyên tử (Atomic OTP Verification)
const VERIFY_OTP_LUA = `
    local lockoutTtl = redis.call('TTL', KEYS[1])
    if lockoutTtl > 0 then
        return { 'LOCKOUT', lockoutTtl }
    end

    local storedHash = redis.call('GET', KEYS[2])
    if not storedHash then
        return { 'EXPIRED' }
    end

    if storedHash == ARGV[1] then
        redis.call('DEL', KEYS[2])
        redis.call('DEL', KEYS[3])
        return { 'SUCCESS' }
    else
        local attempts = redis.call('INCR', KEYS[3])
        if attempts == 1 then
            redis.call('EXPIRE', KEYS[3], tonumber(ARGV[2]))
        end

        local maxAttempts = tonumber(ARGV[3])
        if attempts >= maxAttempts then
            redis.call('DEL', KEYS[2])
            redis.call('DEL', KEYS[3])
            redis.call('SETEX', KEYS[1], tonumber(ARGV[4]), 'locked')
            return { 'LOCKOUT_TRIGGERED', attempts }
        else
            return { 'INVALID_OTP', attempts }
        end
    end
    `;

class OTPService {

    /**
     * Băm OTP bằng HMAC-SHA256 để lưu trữ và so sánh an toàn
     */
    #hashOTP(otp, type, email) {
        const secret = process.env.OTP_SECRET || 'default_otp_secret';
        return crypto
            .createHmac('sha256', secret)
            .update(`${type}:${email}:${otp}`)
            .digest('hex');
    }

    /**
     * Tạo mã OTP mới - Atomic chống race condition
     */
    async generateOTP(type, email) {
        const lockoutKey = `otp:lockout:${type}:${email}`;
        const cooldownKey = `otp:cooldown:${type}:${email}`;
        const otpKey = `otp:${type}:${email}`;

        // Sinh OTP ngẫu nhiên an toàn bằng CSPRNG
        const otp = crypto.randomInt(100000, 1000000).toString();
        const hashedOtp = this.#hashOTP(otp, type, email);

        const [status, ttl] = await redis.eval(
            GENERATE_OTP_LUA,
            3,
            lockoutKey,
            cooldownKey,
            otpKey,
            hashedOtp,
            OTP_EXPIRES_IN,
            OTP_COOLDOWN
        );

        if (status === 'LOCKOUT') {
            const mins = Math.max(1, Math.ceil(ttl / 60));
            throw new TooManyRequestsError(`Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau ${mins} phút`, mins);
        }

        if (status === 'COOLDOWN') {
            throw new TooManyRequestsError(`Vui lòng thử lại sau ${ttl} giây`, Math.ceil(ttl / 60));
        }

        return otp;
    }

    /**
     * Xác thực OTP - Atomic chống race condition & brute-force song song
     */
    async verifyOTP(type, email, otp) {
        const lockoutKey = `otp:lockout:${type}:${email}`;
        const otpKey = `otp:${type}:${email}`;
        const attemptsKey = `otp:attempts:${type}:${email}`;

        const inputHash = this.#hashOTP(otp, type, email);

        const [status, value] = await redis.eval(
            VERIFY_OTP_LUA,
            3,
            lockoutKey,
            otpKey,
            attemptsKey,
            inputHash,
            OTP_EXPIRES_IN,
            MAX_FAILED_ATTEMPTS,
            LOCKOUT_DURATION
        );

        if (status === 'LOCKOUT') {
            const mins = Math.max(1, Math.ceil(value / 60));
            throw new TooManyRequestsError(`Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau ${mins} phút`, mins);
        }

        if (status === 'EXPIRED') {
            throw new BadRequestError('Mã OTP đã hết hạn hoặc không hợp lệ');
        }

        if (status === 'LOCKOUT_TRIGGERED') {
            throw new TooManyRequestsError('Bạn đã nhập sai quá 5 lần, vui lòng thử lại sau 5 phút', 5);
        }

        if (status === 'INVALID_OTP') {
            const remaining = MAX_FAILED_ATTEMPTS - value;
            throw new BadRequestError(`Mã OTP không hợp lệ. Bạn còn ${remaining} lần thử`);
        }

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
