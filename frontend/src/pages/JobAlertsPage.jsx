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
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { ProfileSidebar } from "@/components/common/ProfileSidebar";
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
  { key: "APPLICATION", label: "Hồ sơ ứng tuyển" },
  { key: "JOB", label: "Gợi ý việc làm" },
  { key: "SYSTEM", label: "Hệ thống" },
];

const PAGE_LIMIT = 10;

export const JobAlertsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const storeNotifications = useNotificationStore((state) => state.notifications);
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
  const [items, setItems] = useState(() => storeNotifications || []);
  const [pagination, setPagination] = useState({
    totalCount: storeNotifications?.length || 0,
    totalPages: 1,
    currentPage: 1,
    limit: PAGE_LIMIT,
  });
  const [loading, setLoading] = useState(
    !storeNotifications || storeNotifications.length === 0
  );
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
        const fetchedItems = Array.isArray(result.items) ? result.items : [];
        setItems(fetchedItems);
        setPagination(
          result.pagination || {
            totalCount: fetchedItems.length,
            totalPages: 1,
            currentPage: targetPage,
            limit: PAGE_LIMIT,
          }
        );

        // Đồng bộ danh sách mới nhất về store chung nếu đang tải tab Tất cả ở trang 1
        if (tab === "ALL" && targetPage === 1 && fetchedItems.length > 0) {
          useNotificationStore.setState({ notifications: fetchedItems });
        }
      } catch (err) {
        console.warn("[JobAlertsPage] Lỗi tải thông báo:", err);
        const cached = useNotificationStore.getState().notifications;
        if (cached && cached.length > 0) {
          setItems(cached);
          setPagination({
            totalCount: cached.length,
            totalPages: 1,
            currentPage: 1,
            limit: PAGE_LIMIT,
          });
        } else {
          toast.error(
            "Không thể tải thông báo",
            err.response?.data?.message || "Vui lòng thử lại sau."
          );
        }
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
    if (targetUrl && targetUrl !== "/jobs/alerts") {
      navigate(targetUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200/40 text-base-content antialiased">
      <AppHeader />

      {/* Page Container */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar Menu */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-72 flex-shrink-0 self-start"
          >
            <ProfileSidebar />
          </motion.div>

          {/* Right Main Content Area */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex-1 min-w-0 w-full space-y-5"
          >
            {/* Header Banner */}
            <div className="card bg-base-100 border border-base-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-extrabold text-base-content">
                      Thông báo việc làm & hồ sơ
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
                    Cập nhật tiến trình xét duyệt hồ sơ ứng tuyển, lời mời phỏng vấn và gợi ý công việc mới nhất.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn btn-outline btn-sm border-base-300 hover:border-primary hover:bg-primary/5 hover:text-primary gap-1.5 text-xs font-semibold rounded-xl"
                  title="Tải lại danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  <span>Làm mới</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0 || markingAll}
                  className="btn btn-primary btn-sm text-white gap-1.5 text-xs font-semibold rounded-xl shadow-xs"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Đọc tất cả</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-base-100 rounded-2xl border border-base-200/90 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
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
            <div className="bg-base-100 rounded-2xl border border-base-200/90 shadow-xs overflow-hidden">
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
                      ? "Tuyệt vời! Bạn đã đọc hết tất cả thông báo"
                      : "Chưa có thông báo nào trong mục này"}
                  </h3>
                  <p className="text-xs text-base-content/60 max-w-sm mt-1">
                    {activeTab === "UNREAD"
                      ? "Khi có cập nhật tuyển dụng hoặc gợi ý việc làm mới, hệ thống sẽ gửi thông báo đến bạn ngay."
                      : "Mọi thông báo về đơn ứng tuyển và việc làm phù hợp sẽ xuất hiện ở đây."}
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-base-200"
                >
                  <AnimatePresence initial={false}>
                    {items.map((notif) => {
                      const visual = getNotificationVisualMeta(notif);
                      const Icon = visual.Icon;
                      const isUnread = !notif.isRead;

                      return (
                        <motion.div
                          key={notif.notificationId}
                          variants={listItemEnter}
                          layout
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.18 }}
                          onClick={() => handleOpenNotification(notif)}
                          className={`p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 transition-colors group cursor-pointer ${
                            isUnread
                              ? "bg-primary/[0.03] hover:bg-primary/[0.07]"
                              : "hover:bg-base-200/50"
                          }`}
                        >
                          {/* Icon Category */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${visual.iconWrapClass}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`badge badge-xs font-bold text-[10px] px-2 py-0.5 ${visual.badgeClass}`}
                              >
                                {visual.label}
                              </span>
                              <span className="text-[11px] text-base-content/50">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                              {isUnread && (
                                <span
                                  className="w-2 h-2 rounded-full bg-primary shrink-0"
                                  title="Chưa đọc"
                                />
                              )}
                            </div>

                            <h4
                              className={`text-sm mt-1.5 leading-snug ${
                                isUnread
                                  ? "font-bold text-base-content"
                                  : "font-semibold text-base-content/85"
                              }`}
                            >
                              {notif.title}
                            </h4>

                            <p className="text-xs text-base-content/70 mt-1 line-clamp-2 leading-relaxed">
                              {notif.content || notif.message}
                            </p>

                            {notif.targetUrl && (
                              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Xem chi tiết</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div
                            className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(e, notif)}
                                className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary hover:bg-primary/10"
                                title="Đánh dấu đã đọc"
                                aria-label="Đánh dấu đã đọc"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, notif.notificationId)}
                              className="btn btn-ghost btn-xs btn-square text-base-content/40 hover:text-error hover:bg-error/10"
                              title="Xóa thông báo"
                              aria-label="Xóa thông báo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-base-200 bg-base-100 flex items-center justify-between gap-4">
                  <span className="text-xs text-base-content/60">
                    Trang {pagination.currentPage} / {pagination.totalPages} (Tổng{" "}
                    {pagination.totalCount} thông báo)
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="btn btn-ghost btn-sm btn-square text-base-content/70"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        const cur = pagination.currentPage;
                        return p === 1 || p === pagination.totalPages || Math.abs(p - cur) <= 1;
                      })
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <React.Fragment key={p}>
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-xs text-base-content/40">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setPage(p)}
                              className={`btn btn-sm btn-square text-xs font-semibold ${
                                page === p
                                  ? "btn-primary text-white"
                                  : "btn-ghost text-base-content/70"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      type="button"
                      disabled={page >= pagination.totalPages || loading}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      className="btn btn-ghost btn-sm btn-square text-base-content/70"
                      title="Trang tiếp"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default JobAlertsPage;
