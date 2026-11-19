import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { toast } from "@/store/useToastStore";
import notificationApi from "@/features/notification/services/notificationApi";
import {
  formatRelativeTime,
  getNotificationVisualMeta,
  resolveNotificationTargetUrl,
} from "@/features/notification/utils/notificationHelpers";
import {
  fadeInUp,
  staggerContainer,
  listItemEnter,
} from "@/lib/motionVariants";

const FILTER_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "UNREAD", label: "Chưa đọc" },
  { key: "APPLICATION", label: "Ứng tuyển" },
  { key: "COMPANY", label: "Công ty & Xác thực" },
  { key: "JOB", label: "Tin tuyển dụng" },
  { key: "SYSTEM", label: "Hệ thống" },
];

const PAGE_LIMIT = 10;

export const RecruiterNotificationsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isSocketConnected = useNotificationStore(
    (state) => state.isSocketConnected
  );
  const lastRealtimeNotification = useNotificationStore(
    (state) => state.lastRealtimeNotification
  );
  const storeMarkAsRead = useNotificationStore((state) => state.markAsRead);
  const storeMarkAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead
  );
  const storeDeleteNotification = useNotificationStore(
    (state) => state.deleteNotification
  );
  const fetchUnreadCount = useNotificationStore(
    (state) => state.fetchUnreadCount
  );

  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: PAGE_LIMIT,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(
    async ({ targetPage = page, tab = activeTab, silent = false } = {}) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const params = { page: targetPage, limit: PAGE_LIMIT };
        if (tab === "UNREAD") {
          params.isRead = false;
        } else if (tab !== "ALL") {
          params.type = tab;
        }

        const result = await notificationApi.getNotifications(params);
        setItems(result.items);
        setPagination(result.pagination);
      } catch (err) {
        toast.error(
          "Không thể tải thông báo",
          err.response?.data?.message || "Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, activeTab]
  );

  useEffect(() => {
    loadNotifications({ targetPage: page, tab: activeTab });
  }, [page, activeTab, loadNotifications]);

  // Tự động chèn thông báo realtime mới vào đầu danh sách khi đang ở trang 1
  useEffect(() => {
    if (!lastRealtimeNotification) return;
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "UNREAD" && !lastRealtimeNotification.isRead) ||
      activeTab === lastRealtimeNotification.type;

    if (page === 1 && matchesTab) {
      setItems((prev) => {
        if (
          prev.some(
            (n) => n.notificationId === lastRealtimeNotification.notificationId
          )
        ) {
          return prev;
        }
        return [lastRealtimeNotification, ...prev].slice(0, PAGE_LIMIT);
      });
      setPagination((prev) => ({
        ...prev,
        totalCount: prev.totalCount + 1,
      }));
    }
  }, [lastRealtimeNotification, page, activeTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const handleRefresh = async () => {
    await Promise.all([
      loadNotifications({ targetPage: page, tab: activeTab, silent: true }),
      fetchUnreadCount(),
    ]);
  };

  const handleMarkAsRead = async (e, notif) => {
    if (e) e.stopPropagation();
    if (notif.isRead) return;

    setItems((prev) => {
      if (activeTab === "UNREAD") {
        return prev.filter((item) => item.notificationId !== notif.notificationId);
      }
      return prev.map((item) =>
        item.notificationId === notif.notificationId
          ? { ...item, isRead: true }
          : item
      );
    });

    await storeMarkAsRead(notif.notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await storeMarkAllAsRead();
      if (activeTab === "UNREAD") {
        setItems([]);
        setPagination((prev) => ({ ...prev, totalCount: 0, totalPages: 1 }));
      } else {
        setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      }
      toast.success("Hoàn tất", "Đã đánh dấu tất cả thông báo là đã đọc.");
    } catch {
      toast.error("Có lỗi xảy ra", "Không thể đánh dấu tất cả thông báo.");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.filter((item) => item.notificationId !== notificationId)
    );
    setPagination((prev) => ({
      ...prev,
      totalCount: Math.max(0, prev.totalCount - 1),
    }));

    try {
      await storeDeleteNotification(notificationId);
      toast.success("Đã xóa thông báo", "");
    } catch {
      toast.error("Không thể xóa thông báo", "Vui lòng thử lại sau.");
      loadNotifications({ targetPage: page, tab: activeTab, silent: true });
    }
  };

  const handleOpenNotification = async (notif) => {
    if (!notif.isRead) {
      await handleMarkAsRead(null, notif);
    }
    const targetUrl = resolveNotificationTargetUrl(notif, user?.role);
    if (targetUrl && targetUrl !== "/recruiter/notifications") {
      navigate(targetUrl);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="space-y-5 max-w-5xl mx-auto"
    >
      {/* Header Banner */}
      <div className="bg-base-100 rounded-2xl border border-base-300 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-base-content">
                Trung tâm thông báo
              </h1>
              {unreadCount > 0 && (
                <span className="badge badge-primary badge-sm font-bold text-white">
                  {unreadCount} chưa đọc
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  isSocketConnected
                    ? "bg-success/10 text-success border-success/25"
                    : "bg-base-200 text-base-content/50 border-base-300"
                }`}
                title={
                  isSocketConnected
                    ? "Đang kết nối nhận thông báo trực tiếp"
                    : "Đang kết nối lại máy chủ realtime"
                }
              >
                {isSocketConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span>Trực tuyến</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>Ngoại tuyến</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              Theo dõi realtime kết quả xác thực công ty, hồ sơ ứng viên mới nộp và cảnh báo tin tuyển dụng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline btn-sm border-base-300 hover:border-primary hover:bg-primary/5 hover:text-primary gap-1.5 text-xs font-semibold rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className="btn btn-primary btn-sm text-white gap-1.5 text-xs font-semibold rounded-xl"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-base-100 rounded-2xl border border-base-300 p-2 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
              }`}
            >
              {tab.label}
              {tab.key === "UNREAD" && unreadCount > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-error/15 text-error"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List Container */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-base-200/40 animate-pulse"
              >
                <div className="w-10 h-10 rounded-xl bg-base-300 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-base-300 rounded w-1/3" />
                  <div className="h-3 bg-base-300 rounded w-3/4" />
                  <div className="h-2.5 bg-base-300 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40 mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-base-content">
              {activeTab === "UNREAD"
                ? "Tuyệt vời! Bạn đã đọc hết thông báo"
                : "Chưa có thông báo nào trong mục này"}
            </h3>
            <p className="text-xs sm:text-sm text-base-content/60 max-w-md mt-1">
              Khi có ứng viên nộp hồ sơ, rút đơn hoặc quản trị viên cập nhật trạng thái xác thực công ty, thông báo sẽ được gửi ngay tại đây.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.04, 0.02)}
            initial="hidden"
            animate="visible"
            className="divide-y divide-base-200"
          >
            <AnimatePresence initial={false}>
              {items.map((notif) => {
                const { label, Icon, iconWrapClass, badgeClass } =
                  getNotificationVisualMeta(notif);
                const targetUrl = resolveNotificationTargetUrl(notif, user?.role);
                const hasNavTarget =
                  Boolean(targetUrl) && targetUrl !== "/recruiter/notifications";

                return (
                  <motion.div
                    key={notif.notificationId}
                    variants={listItemEnter}
                    layout
                    exit="exit"
                    onClick={() => handleOpenNotification(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpenNotification(notif);
                      }
                    }}
                    className={`group p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-colors cursor-pointer ${
                      notif.isRead
                        ? "bg-base-100 hover:bg-base-200/50"
                        : "bg-primary/[0.035] hover:bg-primary/[0.07]"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconWrapClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`badge badge-xs font-semibold px-2 py-2 ${badgeClass}`}
                        >
                          {label}
                        </span>
                        {!notif.isRead && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Mới
                          </span>
                        )}
                        <span
                          className="text-[11px] text-base-content/50 ml-auto"
                          title={
                            notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString("vi-VN")
                              : ""
                          }
                        >
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <h3
                        className={`text-sm mt-1.5 leading-snug ${
                          notif.isRead
                            ? "font-semibold text-base-content/85"
                            : "font-bold text-base-content"
                        }`}
                      >
                        {notif.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-base-content/70 mt-1 leading-relaxed whitespace-pre-line">
                        {notif.content}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-3">
                        {hasNavTarget ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                            <span>Xem chi tiết</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-1">
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(e, notif)}
                              className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 gap-1 font-medium"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Đã đọc</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, notif.notificationId)}
                            className="btn btn-ghost btn-xs text-base-content/50 hover:text-error hover:bg-error/10 gap-1 font-medium"
                            title="Xóa thông báo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-base-200 bg-base-200/30 flex items-center justify-between gap-3">
            <span className="text-xs text-base-content/60">
              Hiển thị trang{" "}
              <strong className="text-base-content">{pagination.currentPage}</strong>{" "}
              / {pagination.totalPages} ({pagination.totalCount} thông báo)
            </span>
            <div className="join">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="join-item btn btn-xs sm:btn-sm btn-outline border-base-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className="join-item btn btn-xs sm:btn-sm btn-outline border-base-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecruiterNotificationsPage;
