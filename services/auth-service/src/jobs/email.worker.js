
import nodemailer from 'nodemailer';
import { Worker } from 'bullmq';
import redis from '../config/redis.js';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: Number(process.env.MAIL_PORT) === 465,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    socketTimeout: 30000,
    keepAlive: true, // Giữ kết nối socket mở để không phải handshake lại mỗi email
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const emailWorker = new Worker(
    'email',
    async (job) => {

        const startTime = Date.now();

        const { email, otp, subject, title } = job.data;

        if (job.attemptsMade === 0) {
            console.log(
                `[EmailWorker] Đang gửi email chứa OTP tới: ${email} (${title})`
            );
        }

        try {
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>${title}</h2>
                    <p>Mã OTP của bạn là:
                        <strong style="font-size: 24px; color: #2563eb;">${otp}</strong>
                    </p>
                    <p>Mã OTP sẽ hết hạn sau 5 phút.</p>
                </div>
            `;

            const smtpStart = Date.now();
            await transporter.sendMail({
                from: `JobSearchSupport <${process.env.MAIL_USER}>`,
                to: email,
                subject,
                html: htmlContent
            });

            console.log(
    `[EmailWorker] SMTP sendMail: ${Date.now() - smtpStart} ms`
);

            // Thời điểm hoàn thành xử lý
            const endTime = Date.now();
            const processingTime = endTime - startTime;

            console.log(
                `[EmailWorker] Gửi email thành công tới ${email}`
            );
            console.log(
                `[EmailWorker] Job ID: ${job.id} | ` +
                `Thời gian xử lý: ${processingTime} ms`
            );

            return {
                success: true,
                processingTime
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            console.error(
                `[EmailWorker] Gửi email tới ${email} thất bại sau ${processingTime} ms:`,
                error.message
            );

            // Ném lỗi để BullMQ thực hiện retry nếu được cấu hình
            throw error;
        }
    },
    {
        connection: redis,
        concurrency: 5
    }
);

emailWorker.on('ready', () => {
    console.log('[EmailWorker] Worker đã sẵn sàng nhận task gửi email');
});

emailWorker.on('completed', (job, result) => {
    console.log(
        `[EmailWorker] Job ${job.id} hoàn thành | ` +
        `Email: ${job.data.email} | ` +
        `Thời gian xử lý: ${result.processingTime} ms`
    );

    // Thời gian từ lúc tạo job đến lúc hoàn thành,
    // nếu timestamp của job có sẵn.
    if (job.timestamp) {
        const totalTime = Date.now() - job.timestamp;

        console.log(
            `[EmailWorker] Job ${job.id} | ` +
            `Tổng thời gian từ lúc tạo đến hoàn thành: ${totalTime} ms`
        );
    }
});

emailWorker.on('failed', (job, err) => {
    console.error(
        `[EmailWorker] Job ${job?.id} | ` +
        `Gửi email tới ${job?.data?.email} thất bại:`,
        err.message
    );
});

emailWorker.on('error', (err) => {
    console.error('[EmailWorker] Lỗi Worker:', err.message);
});

export default emailWorker;
