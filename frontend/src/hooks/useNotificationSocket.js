import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "@/store/useToastStore";
import { getNotificationVisualMeta } from "@/features/notification/utils/notificationHelpers";

const SOCKET_URL =
  import.meta.env.VITE_NOTIFICATION_SOCKET_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

/**
 * Hook quản lý kết nối Socket.IO realtime tới notification-service (gắn 1 lần ở cấp App)
 */
export const useNotificationSocket = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id || state.user?.userId);

  const socketRef = useRef(null);

  useEffect(() => {
    const store = useNotificationStore.getState();

    // Khi chưa đăng nhập hoặc đã đăng xuất → đóng socket & dọn store
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      store.reset();
      return;
    }

    // Tải số thông báo chưa đọc ngay khi đăng nhập / mount
    store.fetchUnreadCount();

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      useNotificationStore.getState().setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      useNotificationStore.getState().setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      useNotificationStore.getState().setSocketConnected(false);
      if (import.meta.env.DEV) {
        console.warn("[NotificationSocket] Kết nối tạm gián đoạn:", err.message);
      }
    });

    socket.on("notification:new", (notification) => {
      if (!notification) return;

      useNotificationStore.getState().receiveRealtimeNotification(notification);

      // Hiển thị Toast thông báo realtime cho người dùng
      const { toastType } = getNotificationVisualMeta(notification);
      const notifier = toast[toastType] || toast.info;
      notifier(
        notification.title || "Thông báo mới",
        notification.content || ""
      );
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("notification:new");
      socket.disconnect();
      socketRef.current = null;
      useNotificationStore.getState().setSocketConnected(false);
    };
  }, [isAuthenticated, accessToken, userId]);
};

export default useNotificationSocket;
