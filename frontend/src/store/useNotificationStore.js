import { create } from "zustand";
import notificationApi from "@/features/notification/services/notificationApi";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  isSocketConnected: false,
  lastCompanyNotificationAt: null,
  lastRealtimeNotification: null,

  setSocketConnected: (connected) => set({ isSocketConnected: Boolean(connected) }),

  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationApi.getUnreadCount();
      set({ unreadCount });
      return unreadCount;
    } catch (err) {
      console.warn("[NotificationStore] Không thể tải số thông báo chưa đọc:", err.message);
      return get().unreadCount;
    }
  },

  fetchRecentNotifications: async ({ limit = 8, isRead } = {}) => {
    set({ loading: true });
    try {
      const result = await notificationApi.getNotifications({ page: 1, limit, isRead });
      set({ notifications: result.items, loading: false });
      return result.items;
    } catch (err) {
      console.warn("[NotificationStore] Không thể tải danh sách thông báo:", err.message);
      set({ loading: false });
      return [];
    }
  },

  receiveRealtimeNotification: (notification) => {
    if (!notification?.notificationId) return;

    set((state) => {
      const exists = state.notifications.some(
        (item) => item.notificationId === notification.notificationId
      );

      const updatedList = exists
        ? state.notifications.map((item) =>
            item.notificationId === notification.notificationId ? notification : item
          )
        : [notification, ...state.notifications].slice(0, 20);

      const shouldIncrement = !exists && !notification.isRead;

      return {
        notifications: updatedList,
        unreadCount: shouldIncrement ? state.unreadCount + 1 : state.unreadCount,
        lastRealtimeNotification: notification,
        lastCompanyNotificationAt:
          notification.type === "COMPANY" ? Date.now() : state.lastCompanyNotificationAt,
      };
    });
  },

  markAsRead: async (notificationId) => {
    if (!notificationId) return;

    const existing = get().notifications.find((n) => n.notificationId === notificationId);
    const wasUnread = existing ? !existing.isRead : false;

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.notificationId === notificationId ? { ...item, isRead: true } : item
      ),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));

    try {
      await notificationApi.markAsRead(notificationId);
      // Nếu item không nằm trong danh sách cache dropdown (ví dụ click trên trang full), đồng bộ lại số chưa đọc
      if (!existing) {
        get().fetchUnreadCount();
      }
    } catch (err) {
      console.warn("[NotificationStore] Lỗi đánh dấu đã đọc:", err.message);
      get().fetchUnreadCount();
    }
  },

  markAllAsRead: async () => {
    const prevNotifications = get().notifications;
    const prevUnreadCount = get().unreadCount;

    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    }));

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn("[NotificationStore] Lỗi đánh dấu tất cả đã đọc:", err.message);
      set({ notifications: prevNotifications, unreadCount: prevUnreadCount });
      throw err;
    }
  },

  deleteNotification: async (notificationId) => {
    if (!notificationId) return;

    const existing = get().notifications.find((n) => n.notificationId === notificationId);
    const wasUnread = existing ? !existing.isRead : false;

    set((state) => ({
      notifications: state.notifications.filter((item) => item.notificationId !== notificationId),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));

    try {
      await notificationApi.deleteNotification(notificationId);
      if (!existing) {
        get().fetchUnreadCount();
      }
    } catch (err) {
      console.warn("[NotificationStore] Lỗi xóa thông báo:", err.message);
      get().fetchUnreadCount();
      throw err;
    }
  },

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      isSocketConnected: false,
      lastCompanyNotificationAt: null,
      lastRealtimeNotification: null,
    }),
}));

export default useNotificationStore;
