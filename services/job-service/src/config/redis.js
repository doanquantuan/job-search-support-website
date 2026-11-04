import { Redis } from 'ioredis';

let redis = null;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 1000);
    },
  });

  redis.on('connect', () => {
    console.log('[job-service] Kết nối Redis Cache thành công');
  });

  redis.on('error', (err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[job-service] Cảnh báo Redis Cache:', err.message);
    }
  });
} catch (error) {
  console.warn('[job-service] Không thể khởi tạo Redis:', error.message);
}

export default redis;

