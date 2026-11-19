import { apiClient } from "@/lib/apiClient";

export const notificationApi = {
  /**
   * Lấy danh sách thông báo phân trang của người dùng hiện tại
   */
  async getNotifications({ page = 1, limit = 10, isRead, type } = {}) {
    const params = { page, limit };
    if (typeof isRead === "boolean") params.isRead = isRead;
    if (type && type !== "ALL") params.type = type;

    const response = await apiClient.get("/notifications", { params });
    const data = response.data?.data || response.data || {};
    return {
      items: Array.isArray(data.items) ? data.items : [],
      pagination: data.pagination || {
        totalCount: 0,
        totalPages: 1,
        currentPage: page,
        limit,
      },
    };
  },

  /**
   * Lấy tổng số thông báo chưa đọc
   */
  async getUnreadCount() {
    const response = await apiClient.get("/notifications/unread-count");
    const data = response.data?.data || response.data || {};
    return typeof data.unreadCount === "number" ? data.unreadCount : 0;
  },

  /**
   * Lấy chi tiết 1 thông báo (backend tự động đánh dấu đã đọc)
   */
  async getNotificationById(notificationId) {
    const response = await apiClient.get(`/notifications/${notificationId}`);
    return response.data?.data || response.data;
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(notificationId) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data?.data || response.data;
  },

  /**
   * Đánh dấu tất cả thông báo của user hiện tại là đã đọc
   */
  async markAllAsRead() {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data?.data || response.data;
  },

  /**
   * Xóa 1 thông báo
   */
  async deleteNotification(notificationId) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data?.data || response.data;
  },
};

export default notificationApi;
