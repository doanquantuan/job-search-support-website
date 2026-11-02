import aj from '../config/arcjet.config.js';

export const arcjetProtection = async (req, res, next) => {
  // Nếu chưa cấu hình key thì cho qua (Fallback / Bypass Mode khi dev cục bộ)
  if (!aj) {
    return next();
  }

  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          status: 'fail',
          message: 'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau ít phút.',
          retryAfter: decision.reason.resetTime,
        });
      }

      if (decision.reason.isBot()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Yêu cầu bị từ chối: Phát hiện hoạt động tự động không hợp lệ (Automated Bot Detected).',
        });
      }

      if (decision.reason.isShield()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Yêu cầu bị chặn bởi tường lửa bảo mật (WAF Shield: Malicious Pattern Detected).',
        });
      }

      return res.status(403).json({
        status: 'fail',
        message: 'Truy cập bị từ chối bởi chính sách bảo mật Arcjet.',
      });
    }

    next();
  } catch (error) {
    console.error('[Arcjet Middleware Error]:', error.message);
    // Trong trường hợp lỗi kết nối đến Arcjet, fail-open để không làm gián đoạn hệ thống
    next();
  }
};

