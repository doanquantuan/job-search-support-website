const nodemailer = require('nodemailer');
const { Worker } = require('bullmq');
const redis = require('../config/redis');


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const emailWorker = new Worker(
    'email',
    async (job) => {
        const { email, otp, subject, title } = job.data;

        if (job.attemptsMade === 0) {
            console.log(`[EmailWorker] Đang gửi email chứa OTP tới: ${email} (${title})`);
        }

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>${title}</h2>
                <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
                <p>Mã OTP sẽ hết hạn sau 5 phút.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `JobSearchSupport <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        });
    },
    {
        connection: redis,
        concurrency: 5
    }
);

emailWorker.on('ready', () => {
    console.log('[EmailWorker] Worker đã sẵn sàng nhận task gửi email');
});

emailWorker.on('completed', (job) => {
    console.log(`[EmailWorker] Đã gửi email thành công tới ${job.data.email}`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Gửi email tới ${job?.data?.email} thất bại:`, err.message);
});

emailWorker.on('error', (err) => {
    console.error('[EmailWorker] Lỗi Worker:', err.message);
});

module.exports = emailWorker;