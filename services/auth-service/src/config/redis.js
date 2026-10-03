const { Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("[Redis] Kết nối Redis thành công");
});

redis.on("error", (error) => {
    console.error("[Redis] Lỗi kết nối Redis:", error.message);
});

module.exports = redis;