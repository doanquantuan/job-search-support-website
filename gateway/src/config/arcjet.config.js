import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import config from './env.config.js';

let aj = null;

if (config.arcjet.key) {
  const isProduction = config.nodeEnv === 'production';

  aj = arcjet({
    key: config.arcjet.key,
    rules: [
      // 1. Arcjet Shield: Bảo vệ WAF chống lại các cuộc tấn công SQL injection, XSS...
      shield({
        mode: 'LIVE',
      }),

      // 2. Bot Detection: Chặn bot xấu, cho phép bot tìm kiếm và công cụ lập trình (Postman, cURL) trong môi trường dev
      detectBot({
        mode: isProduction ? 'LIVE' : 'DRY_RUN',
        allow: [
          'CATEGORY:SEARCH_ENGINE', // Cho phép bot Google, Bing
          'CATEGORY:MONITOR',       // Cho phép UptimeRobot, Pingdom...
          'CATEGORY:TOOL',          // Cho phép Postman, curl, Insomnia để developer kiểm thử API
        ],
      }),

      // 3. Sliding Window Rate Limiting: 120 requests / 1 phút trên mỗi IP (Chạy DRY_RUN / nới lỏng trong môi trường development để tránh F5 bị lỗi 429)
      slidingWindow({
        mode: isProduction ? 'LIVE' : 'DRY_RUN',
        interval: '1m',
        max: isProduction ? 120 : 5000,
      }),
    ],
  });
  console.log(`[Arcjet] Khởi tạo bảo mật Arcjet thành công (${isProduction ? 'LIVE' : 'DRY_RUN'} mode).`);
} else {
  console.warn(
    '[Arcjet] CẢNH BÁO: Chưa cấu hình ARCJET_KEY trong .env. Gateway sẽ chạy ở chế độ Bỏ qua bảo vệ (Bypass Mode).'
  );
}

export default aj;

