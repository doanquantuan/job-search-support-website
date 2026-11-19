import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import {
  formatRelativeTime,
  getNotificationVisualMeta,
  resolveNotificationTargetUrl,
} from "@/features/notification/utils/notificationHelpers";

export const NotificationBell = ({ viewAllPath }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const loading = useNotificationStore((state) => state.loading);
  const fetchRecentNotifications = useNotificationStore(
    (state) => state.fetchRecentNotifications
  );
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore(
    (state) => state.deleteNotification
  );

  const [open, setOpen] = useState(false);
  const [filterMode, setFilterMode] = useState("ALL"); // ALL | UNREAD
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef(null);

  const targetViewAll =
    viewAllPath ||
    (user?.role === "RECRUITER" ? "/recruiter/notifications" : "/my-applications");

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Tải danh sách thông báo mỗi khi mở dropdown hoặc đổi tab lọc
  useEffect(() => {
    if (!open) return;
    fetchRecentNotifications({
      limit: 8,
      isRead: filterMode === "UNREAD" ? false : undefined,
    });
  }, [open, filterMode, fetchRecentNotifications]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleItemClick = async (notification) => {
    setOpen(false);
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    const url = resolveNotificationTargetUrl(notification, user?.role);
    navigate(url);
  };

  const handleMarkAll = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDeleteItem = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch {
      // Lỗi đã được xử lý trong store
    }
  };

  const displayedList =
    filterMode === "UNREAD"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={`btn btn-ghost btn-circle btn-sm transition-colors ${
          open
            ? "bg-primary/10 text-primary"
            : "text-base-content/70 hover:text-base-content hover:bg-base-200"
        }`}
        aria-label="Thông báo"
        aria-expanded={open}
        title="Thông báo"
      >
        <div className="indicator">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className="badge badge-error badge-xs indicator-item text-white font-bold px-1.5 min-w-[18px] h-[18px] text-[10px]"
            >
              {badgeLabel}
            </motion.span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[360px] sm:w-[400px] max-w-[calc(100vw-1.5rem)] bg-base-100 rounded-2xl border border-base-300 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between gap-2 bg-base-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-base-content">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="badge badge-primary badge-xs font-semibold text-white px-2 py-2">
                    {unreadCount} mới
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={markingAll}
                  className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1 font-semibold"
                >
                  {markingAll ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="px-4 py-2 border-b border-base-200 flex items-center gap-1.5 bg-base-200/30">
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterMode === "ALL"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("UNREAD")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filterMode === "UNREAD"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
              >
                Chưa đọc {unreadCount > 0 ? `(${unreadCount})` : ""}
              </button>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-base-200/70">
              {loading && displayedList.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-base-content/50">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-xs">Đang tải thông báo...</span>
                </div>
              ) : displayedList.length === 0 ? (
                <div className="py-10 px-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-11 h-11 rounded-full bg-base-200 flex items-center justify-center text-base-content/40">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-base-content/80">
                    {filterMode === "UNREAD"
                      ? "Không có thông báo chưa đọc"
                      : "Chưa có thông báo nào"}
                  </p>
                  <p className="text-xs text-base-content/50">
                    Các cập nhật về hồ sơ ứng tuyển và xác thực công ty sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                displayedList.map((notif) => {
                  const { Icon, iconWrapClass } = getNotificationVisualMeta(notif);
                  return (
                    <div
                      key={notif.notificationId}
                      onClick={() => handleItemClick(notif)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleItemClick(notif);
                        }
                      }}
                      className={`group px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors ${
                        notif.isRead
                          ? "bg-base-100 hover:bg-base-200/60"
                          : "bg-primary/[0.04] hover:bg-primary/[0.08]"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconWrapClass}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs leading-snug line-clamp-1 ${
                              notif.isRead
                                ? "font-medium text-base-content/85"
                                : "font-bold text-base-content"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span
                              className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"
                              title="Chưa đọc"
                            />
                          )}
                        </div>
                        <p className="text-xs text-base-content/65 line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.content}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-base-content/45 font-medium">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(e, notif.notificationId)}
                            className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error hover:bg-error/10 transition-opacity"
                            title="Xóa thông báo"
                            aria-label="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 border-t border-base-200 bg-base-200/30">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(targetViewAll);
                }}
                className="btn btn-ghost btn-sm w-full text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
              >
                <span>Xem tất cả thông báo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
