import prisma from '../config/prisma.js';

class CleanupService {
  /* Xóa tất cả tài khoản chưa kích hoạt
   */
  async cleanupUnverifiedUsers() {
    try {
      const expirationDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Tìm danh sách tài khoản chưa xác thực quá 24h
      const unverifiedUsers = await prisma.authUser.findMany({
        where: {
          isVerified: false,
          createdAt: {
            lt: expirationDate,
          },
        },
        select: { id: true },
      });

      let count = 0;
      if (unverifiedUsers.length > 0) {
        const userIds = unverifiedUsers.map((u) => u.id);

        await prisma.$transaction(async (tx) => {
          await tx.oAuthAccount.deleteMany({ where: { userId: { in: userIds } } });
          await tx.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
          const res = await tx.authUser.deleteMany({ where: { id: { in: userIds } } });
          count = res.count;
        });

        console.log(`[CleanupService] Đã dọn dẹp ${count} tài khoản chưa kích hoạt quá 24h.`);
      }

      // Quét dọn phòng ngừa các bản ghi OAuth mồ côi (nếu có)
      await prisma.oAuthAccount.deleteMany({
        where: {
          user: null,
        },
      }).catch(() => {});

      return count;
    } catch (error) {
      console.error('[CleanupService] Lỗi khi dọn dẹp tài khoản quá hạn:', error.message);
      return 0;
    }
  }

  /**
   * Khởi động lịch trình tự động dọn dẹp định kỳ (mặc định mỗi 1 giờ)
   * @param {number} intervalMs - Khoảng thời gian giữa các lần chạy (ms), mặc định 1 giờ
   */
  startCleanupSchedule(intervalMs = 60 * 60 * 1000) {
    // Chạy ngay lần đầu tiên khi server khởi động
    this.cleanupUnverifiedUsers().catch((err) => {
      console.error('[CleanupService] Lỗi chạy dọn dẹp lần đầu:', err.message);
    });

    // Lên lịch chạy định kỳ mỗi 1 giờ
    this.intervalId = setInterval(() => {
      this.cleanupUnverifiedUsers();
    }, intervalMs);

    // Không chặn process exit nếu server tắt
    if (this.intervalId.unref) {
      this.intervalId.unref();
    }

    console.log('[CleanupService] Đã kích hoạt lịch trình tự động dọn dẹp tài khoản chưa kích hoạt (mỗi 1 giờ)');
  }

  stopCleanupSchedule() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new CleanupService();
