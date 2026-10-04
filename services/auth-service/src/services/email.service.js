const { emailQueue } = require('../queues/email.queue');
const otpService = require('./otp.service');


class EmailService {
    async sendOTP(type, email) {
        let subject;
        let title;

        if (type === 'forgot-password') {
            subject = 'JobSearchSupport - Mã OTP đặt lại mật khẩu';
            title = 'Đặt lại mật khẩu';
        } else if (type === 'verify-email') {
            subject = 'JobSearchSupport - Xác thực email';
            title = 'Xác thực email';
        } else {
            subject = 'JobSearchSupport - Mã OTP';
            title = 'Mã xác thực';
        }

        const otp = await otpService.generateOTP(type, email);

        return emailQueue.add(
            'send-otp',
            { email, otp, subject, title },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: true,
                removeOnFail: false
            }
        );
    }
}

module.exports = new EmailService();