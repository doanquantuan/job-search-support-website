import redis from '../config/redis.js';

class RateLimiter {
  /**
   * Kiểm tra giới hạn số lượt request sử dụng Redis (với fallback in-memory)
   * @param {string} keyPrefix - tiền tố định danh (vd: 'rate:report:user' hoặc 'rate:report:ip')
   * @param {string} identifier - user ID hoặc IP
   * @param {number} maxAttempts - số lượt cho phép
   * @param {number} windowSeconds - khung thời gian tính bằng giây (vd: 3600 = 1 giờ)
   * @returns {Promise<{ allowed: boolean, count: number, ttl: number }>}
   */
  async checkRateLimit(keyPrefix, identifier, maxAttempts, windowSeconds = 3600) {
    if (!identifier) {
      return { allowed: true, count: 0, ttl: 0 };
    }

    const key = `${keyPrefix}:${identifier}`;

    if (redis && redis.status === 'ready') {
      try {
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, windowSeconds);
        }
        const ttl = await redis.ttl(key);
        return {
          allowed: count <= maxAttempts,
          count,
          ttl: ttl > 0 ? ttl : windowSeconds,
        };
      } catch (err) {
        console.warn(`[RateLimiter] Lỗi Redis key ${key}: ${err.message}. Tiếp tục dự phòng.`);
      }
    }

    // Fallback: Sử dụng in-memory Map nếu Redis tạm ngưng hoạt động
    return this.checkInMemory(key, maxAttempts, windowSeconds);
  }

  // Khởi tạo Map lưu trữ dự phòng
  static inMemoryMap = new Map();

  checkInMemory(key, maxAttempts, windowSeconds) {
    const now = Date.now();
    const entry = RateLimiter.inMemoryMap.get(key);

    if (!entry || entry.expiresAt <= now) {
      RateLimiter.inMemoryMap.set(key, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return { allowed: true, count: 1, ttl: windowSeconds };
    }

    entry.count += 1;
    const ttl = Math.ceil((entry.expiresAt - now) / 1000);
    return {
      allowed: entry.count <= maxAttempts,
      count: entry.count,
      ttl,
    };
  }
}

export default new RateLimiter();
