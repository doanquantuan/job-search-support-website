import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';
import config from './env.config.js';

let aj = null;

if (config.arcjet.key) {
  aj = arcjet({
    key: config.arcjet.key,
    rules: [
      // 1. Arcjet Shield: Bảo vệ WAF chống lại các cuộc tấn công SQL injection, XSS...
      shield({
        mode: 'LIVE',
      }),

      // 2. Bot Detection: Chặn bot xấu, cho phép bot tìm kiếm phổ biến (Google, Bing...)
      detectBot({
        mode: 'LIVE',
        allow: [
          'CATEGORY:SEARCH_ENGINE', // Cho phép bot Google, Bing
          'CATEGORY:MONITOR',       // Cho phép UptimeRobot, Pingdom...
        ],
      }),

      // 3. Sliding Window Rate Limiting: 120 requests / 1 phút trên mỗi IP
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: 120,
      }),
    ],
  });
  console.log('[Arcjet] Khởi tạo bảo mật Arcjet thành công (LIVE mode).');
} else {
  console.warn(
    '[Arcjet] CẢNH BÁO: Chưa cấu hình ARCJET_KEY trong .env. Gateway sẽ chạy ở chế độ Bỏ qua bảo vệ (Bypass Mode).'
  );
}

export default aj;

