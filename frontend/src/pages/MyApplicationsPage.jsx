import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeInUp,
  fadeInDown,
  scaleIn,
  scaleInBounce,
  slideInLeft,
  staggerContainer,
  listItemEnter,
  shakeIn,
} from "@/lib/motionVariants";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Eye,
  FileCheck,
  FileSearch,
  CheckCircle2,
  XCircle,
  Undo2,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Search,
  BellRing,
  Check,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";

import { applicationApi } from "../features/job/services/applicationApi";
import { AppHeader } from "../components/common/AppHeader";
import { AppFooter } from "../components/common/AppFooter";
import { ProfileSidebar } from "../components/common/ProfileSidebar";
import { Toast } from "../components/common/Toast";
import { Modal } from "../features/profile/components/modals/Modal";

// ── Status Configurations ───────────────────────────────────────────────────

export const STATUS_CONFIG = {
  APPLIED: {
    label: "Đã nộp hồ sơ",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
    dotClass: "bg-blue-500",
    icon: Clock,
    description: "Hồ sơ của bạn đã được chuyển tới bộ phận tuyển dụng của công ty.",
  },
  VIEWED: {
    label: "NTD đã xem hồ sơ",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20",
    dotClass: "bg-purple-500",
    icon: Eye,
    description: "Nhà tuyển dụng đã mở và xem chi tiết hồ sơ ứng tuyển của bạn.",
  },
  REVIEWING: {
    label: "Đang xét duyệt",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    dotClass: "bg-amber-500",
    icon: FileSearch,
    description: "Hồ sơ đang được phòng ban chuyên môn đánh giá mức độ phù hợp.",
  },
  INTERVIEW: {
    label: "Mời phỏng vấn",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
    dotClass: "bg-emerald-500",
    icon: Calendar,
    description: "Bạn đã được chọn vào vòng phỏng vấn! Vui lòng kiểm tra email hoặc điện thoại.",
  },
  HIRED: {
    label: "Trúng tuyển",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500/20",
    dotClass: "bg-teal-500",
    icon: CheckCircle2,
    description: "Chúc mừng bạn đã trúng tuyển vị trí này!",
  },
  REJECTED: {
    label: "Chưa phù hợp",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
    dotClass: "bg-rose-500",
    icon: XCircle,
    description: "Hồ sơ chưa phù hợp với yêu cầu hiện tại của vị trí này.",
  },
  WITHDRAWN: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/20",
    dotClass: "bg-slate-400",
    icon: Undo2,
    description: "Bạn đã chủ động rút hồ sơ ứng tuyển này.",
  },
};

const FILTER_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "APPLIED", label: "Đã nộp" },
  { key: "VIEWED", label: "Đã xem" },
  { key: "REVIEWING", label: "Đang xét duyệt" },
  { key: "INTERVIEW", label: "Phỏng vấn" },
  { key: "HIRED", label: "Trúng tuyển" },
  { key: "REJECTED", label: "Chưa phù hợp" },
  { key: "WITHDRAWN", label: "Đã rút" },
];

// Helper tính toán 5 bước tiến trình
const getProgressSteps = (currentStatus) => {
  const statusLevels = {
    APPLIED: 2,
    VIEWED: 3,
    REVIEWING: 4,
    INTERVIEW: 4,
    HIRED: 5,
    REJECTED: 5,
    WITHDRAWN: 5,
  };
  const currentLevel = statusLevels[currentStatus] || 2;
  return [
    { key: "step-1", label: "UV nộp CV", done: true },
    { key: "step-2", label: "Tiếp nhận CV", done: true },
    { key: "step-3", label: "NTD xem CV", done: currentLevel >= 3 },
    { key: "step-4", label: "Xử lý CV", done: currentLevel >= 4 },
    {
      key: "step-5",
      label:
        currentStatus === "HIRED"
          ? "Trúng tuyển"
          : currentStatus === "REJECTED"
          ? "Chưa phù hợp"
          : currentStatus === "WITHDRAWN"
          ? "Đã rút"
          : "NTD phản hồi",
      done: currentLevel >= 5,
      status: currentStatus,
    },
  ];
};

// Helper dịch nhãn dòng thời gian
const getStatusTimelineLabel = (status) => {
  switch (status) {
    case "APPLIED":
      return "NTD đã tiếp nhận hồ sơ";
    case "VIEWED":
      return "NTD đã mở xem hồ sơ";
    case "REVIEWING":
      return "Hồ sơ đang được phòng ban chuyên môn đánh giá";
    case "INTERVIEW":
      return "NTD gửi lời mời phỏng vấn";
    case "HIRED":
      return "Chúc mừng! Bạn đã trúng tuyển vị trí này";
    case "REJECTED":
      return "Hồ sơ chưa phù hợp với yêu cầu tuyển dụng";
    case "WITHDRAWN":
      return "Ứng viên đã chủ động rút đơn ứng tuyển";
    default:
      return STATUS_CONFIG[status]?.label || status;
  }
};

export const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedAppId = searchParams.get("applicationId");

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Accordion state (set of expanded application IDs)
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Reminding state
  const [remindingId, setRemindingId] = useState(null);

  // Toast feedback with auto-dismiss
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, title, message = "") => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Withdraw Modal state
  const [withdrawApp, setWithdrawApp] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Detail Modal state
  const [detailApp, setDetailApp] = useState(null);

  // Toggle Accordion
  const toggleAccordion = (appId) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const handleOpenDetail = async (app) => {
    setDetailApp(app);
    const targetId = app.applicationId || app.id;
    if (targetId) {
      try {
        const fullDetail = await applicationApi.getApplicationDetail(targetId);
        if (fullDetail) {
          setDetailApp((prev) =>
            prev && (prev.applicationId === targetId || prev.id === targetId)
              ? { ...prev, ...fullDetail }
              : prev
          );
        }
      } catch (err) {
        console.warn("Could not fetch latest detail:", err.message);
      }
    }
  };

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 50,
      };
      if (selectedStatus !== "ALL") {
        params.status = selectedStatus;
      }
      const res = await applicationApi.getMyApplications(params);
      const list = Array.isArray(res) ? res : res?.data || [];
      setApplications(list);
    } catch (err) {
      console.warn("Backend offline, sử dụng dữ liệu mẫu cho đơn ứng tuyển:", err.message);
      setApplications([
        {
          id: "app-demo-1",
          applicationId: "app-demo-1",
          jobId: "job-1",
          jobTitle: "Senior Frontend Engineer (React/TypeScript)",
          companyName: "VNG Corporation",
          companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=80",
          location: "TP. Hồ Chí Minh",
          salary: "25 – 40 triệu",
          appliedAt: "2026-11-01T09:30:00.000Z",
          applicationStatus: "INTERVIEW",
          cvTitle: "CV_NguyenMinhAnh_Frontend.pdf",
          cvUrl: "https://example.com/cv.pdf",
          coverLetter: "Tôi có hơn 4 năm kinh nghiệm chuyên sâu về React và TypeScript...",
          statusHistories: [
            {
              historyId: "h-2",
              applicationStatus: "INTERVIEW",
              changedAt: "2026-11-03T10:00:00.000Z",
              note: "Mời bạn tham gia vòng phỏng vấn kỹ thuật online vào 14h ngày 05/11",
            },
            {
              historyId: "h-1",
              applicationStatus: "VIEWED",
              changedAt: "2026-11-02T15:30:00.000Z",
              note: "Nhà tuyển dụng đã mở xem hồ sơ",
            },
            {
              historyId: "h-0",
              applicationStatus: "APPLIED",
              changedAt: "2026-11-01T09:30:00.000Z",
              note: "Ứng viên gửi hồ sơ thành công",
            },
          ],
        },
        {
          id: "app-demo-2",
          applicationId: "app-demo-2",
          jobId: "job-2",
          jobTitle: "Backend Developer Intern",
          companyName: "CÔNG TY CỔ PHẦN VIỄN THÔNG FPT",
          companyLogo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
          location: "Hà Nội",
          salary: "Thỏa thuận",
          appliedAt: "2026-10-19T14:25:12.000Z",
          applicationStatus: "APPLIED",
          cvTitle: "CV_NguyenMinhAnh_Backend.pdf",
          cvUrl: "https://example.com/cv.pdf",
          lastRemindedAt: "2026-10-26T08:00:00.000Z",
          statusHistories: [
            {
              historyId: "h-fpt-1",
              applicationStatus: "APPLIED",
              changedAt: "2026-10-19T14:25:12.000Z",
              note: "NTD đã tiếp nhận hồ sơ",
            },
            {
              historyId: "h-fpt-0",
              applicationStatus: "APPLIED",
              changedAt: "2026-10-19T14:25:00.000Z",
              note: "Ứng viên gửi hồ sơ thành công",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Deep-link scroll & auto-expand when URL has ?applicationId=...
  useEffect(() => {
    if (highlightedAppId && applications.length > 0) {
      setExpandedCards((prev) => new Set([...prev, highlightedAppId]));
      setTimeout(() => {
        const element = document.getElementById(`app-card-${highlightedAppId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }, [highlightedAppId, applications]);

  // Handle Remind Recruiter
  const handleRemindRecruiter = async (applicationId) => {
    setRemindingId(applicationId);
    try {
      await applicationApi.remindRecruiter(applicationId);
      showToast(
        "success",
        "Đã gửi lời nhắc",
        "Đã gửi thông báo nhắc nhở thành công tới Nhà tuyển dụng!"
      );
      setApplications((prev) =>
        prev.map((app) => {
          if ((app.applicationId || app.id) === applicationId) {
            return {
              ...app,
              lastRemindedAt: new Date().toISOString(),
              reminderCount: (app.reminderCount || 0) + 1,
            };
          }
          return app;
        })
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Không thể gửi lời nhắc lúc này. Vui lòng thử lại sau.";
      showToast("error", "Không thể gửi lời nhắc", msg);
    } finally {
      setRemindingId(null);
    }
  };

  // Handle Withdraw
  const handleConfirmWithdraw = async () => {
    if (!withdrawApp) return;
    const targetId = withdrawApp.applicationId || withdrawApp.id;
    if (!targetId) {
      showToast("error", "Không thể rút đơn", "Không xác định được mã đơn ứng tuyển.");
      return;
    }
    setWithdrawLoading(true);
    try {
      await applicationApi.withdrawApplication(targetId);
      showToast(
        "success",
        "Thành công",
        `Đã rút hồ sơ ứng tuyển vị trí: "${withdrawApp.jobPost?.title || "đã chọn"}"`
      );
      setWithdrawApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Lỗi khi rút đơn:", err);
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Không thể rút hồ sơ lúc này. Vui lòng thử lại sau.";
      showToast("error", "Không thể rút đơn", msg);
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Cooldown check helper (24 hours)
  const isRemindCooldown = (lastRemindedAt) => {
    if (!lastRemindedAt) return false;
    const diff = Date.now() - new Date(lastRemindedAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  // Filtered list based on search keyword
  const filteredApplications = applications.filter((app) => {
    if (!searchKeyword.trim()) return true;
    const term = searchKeyword.toLowerCase();
    const title = (app.jobPost?.title || app.jobTitle || "").toLowerCase();
    const company = (app.companyName || app.company?.companyName || "").toLowerCase();
    const note = (app.coverLetter || "").toLowerCase();
    return title.includes(term) || company.includes(term) || note.includes(term);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDetailDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;
    } catch {
      return dateStr;
    }
  };

  // Calculate timeline histories
  const getTimelineHistories = (app) => {
    const histories = Array.isArray(app.statusHistories) ? [...app.statusHistories] : [];
    const hasApplied = histories.some((h) => h.applicationStatus === "APPLIED");
    if (!hasApplied && app.appliedAt) {
      histories.push({
        historyId: "init-applied",
        applicationStatus: "APPLIED",
        changedAt: app.appliedAt,
        note: "Ứng viên gửi hồ sơ thành công",
      });
    }
    return histories.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  };

  // Calculate stats
  const totalCount = applications.length;
  const interviewingCount = applications.filter((a) => a.applicationStatus === "INTERVIEW").length;
  const reviewingCount = applications.filter((a) =>
    ["APPLIED", "VIEWED", "REVIEWING"].includes(a.applicationStatus)
  ).length;

  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col font-sans">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Header */}
      <AppHeader />

      {/* Page Container */}
      <main className="flex-1 max-w-8xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Sidebar */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-72 flex-shrink-0 self-start"
          >
            <ProfileSidebar activeItem="applied-jobs" />
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-5">
            {/* Header Title Card */}
            <motion.div
              variants={fadeInDown}
              initial="hidden"
              animate="visible"
              className="card bg-base-100 border border-base-200 shadow-xs p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-base-content flex items-center gap-2.5">
                    <Briefcase className="w-6 h-6 text-primary" />
                    Lịch sử & Tiến trình ứng tuyển
                  </h1>
                  <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                    Theo dõi trực tiếp trạng thái duyệt hồ sơ, các mốc tiến trình và tương tác với Nhà tuyển dụng.
                  </p>
                </div>

                <button
                  onClick={fetchApplications}
                  disabled={loading}
                  className="btn btn-outline btn-sm gap-1.5 self-start sm:self-auto shrink-0"
                  title="Tải lại danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 pt-5 border-t border-base-200">
                <div className="bg-base-200/50 rounded-xl p-3 border border-base-200 text-center">
                  <span className="text-2xs sm:text-xs text-base-content/60 font-medium block">
                    Tổng đơn nộp
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-base-content mt-0.5 block">
                    {totalCount}
                  </span>
                </div>

                <div className="bg-primary/5 rounded-xl p-3 border border-primary/15 text-center">
                  <span className="text-2xs sm:text-xs text-primary font-medium block">
                    Đang xử lý
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-primary mt-0.5 block">
                    {reviewingCount}
                  </span>
                </div>

                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
                  <span className="text-2xs sm:text-xs text-emerald-600 font-medium block">
                    Mời phỏng vấn
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-emerald-600 mt-0.5 block">
                    {interviewingCount}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Filter and Search Bar */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="card bg-base-100 border border-base-200 shadow-xs p-4 sm:p-5 space-y-4"
            >
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo chức danh công việc, tên công ty..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="input input-sm input-bordered w-full pl-9 pr-4 text-xs sm:text-sm rounded-lg"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Filter className="w-3.5 h-3.5 text-base-content/40 shrink-0 mr-1" />
                {FILTER_TABS.map((tab) => {
                  const isActive = selectedStatus === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedStatus(tab.key)}
                      className={`btn btn-xs whitespace-nowrap rounded-full transition-all ${
                        isActive
                          ? "btn-primary shadow-xs"
                          : "btn-ghost text-base-content/70 hover:bg-base-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="card bg-base-100 border border-base-200 p-5 space-y-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-base-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-base-200 rounded w-1/2" />
                        <div className="h-3 bg-base-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-8 bg-base-200 rounded" />
                    <div className="h-10 bg-base-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {!loading && error && (
              <motion.div
                variants={shakeIn}
                initial="hidden"
                animate="visible"
                className="alert alert-error shadow-sm text-xs sm:text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
                <button onClick={fetchApplications} className="btn btn-xs btn-outline ml-auto">
                  Thử lại
                </button>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredApplications.length === 0 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="card bg-base-100 border border-base-200 p-8 sm:p-12 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center text-base-content/40 mb-3">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-base-content">
                  Chưa có đơn ứng tuyển nào phù hợp
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mt-1 mb-5">
                  {selectedStatus !== "ALL" || searchKeyword.trim()
                    ? "Không tìm thấy hồ sơ với bộ lọc hiện tại. Vui lòng thử chọn trạng thái khác."
                    : "Bạn chưa nộp hồ sơ vào vị trí tuyển dụng nào. Hãy khám phá các công việc phù hợp ngay!"}
                </p>
                <Link to="/jobs" className="btn btn-primary btn-sm gap-1.5 shadow-xs">
                  <Search className="w-4 h-4" />
                  Tìm kiếm việc làm ngay
                </Link>
              </motion.div>
            )}

            {/* Applications List */}
            {!loading && !error && filteredApplications.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedStatus}
                  variants={staggerContainer(0.06, 0.04)}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                  className="space-y-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredApplications.map((app) => {
                      const appKey = app.applicationId || app.id;
                      const statusInfo =
                        STATUS_CONFIG[app.applicationStatus] || STATUS_CONFIG.APPLIED;
                      const StatusIcon = statusInfo.icon;
                      const canWithdraw = ["APPLIED", "VIEWED", "REVIEWING"].includes(
                        app.applicationStatus
                      );
                      const canRemind = ["APPLIED", "VIEWED", "REVIEWING"].includes(
                        app.applicationStatus
                      );
                      const isCooldown = isRemindCooldown(app.lastRemindedAt);
                      const isExpanded = expandedCards.has(appKey);
                      const steps = getProgressSteps(app.applicationStatus);
                      const histories = getTimelineHistories(app);
                      const companyName =
                        app.companyName ||
                        app.company?.companyName ||
                        "Công ty tuyển dụng";
                      const companyLogo = app.companyLogo || app.company?.logo;
                      const recruiterId =
                        app.jobPost?.recruiterId || app.recruiterId;
                      const isHighlighted = highlightedAppId === appKey;

                      return (
                        <motion.div
                          id={`app-card-${appKey}`}
                          key={appKey}
                          layout
                          variants={listItemEnter}
                          exit="exit"
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.2 }}
                          className={`card bg-base-100 border shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col gap-4 rounded-2xl ${
                            isHighlighted
                              ? "border-primary ring-2 ring-primary/20 bg-primary/2"
                              : "border-base-200 hover:border-primary/30"
                          }`}
                        >
                          {/* ── Khối 1: Header thẻ ứng tuyển (Logo, Title, Company, Meta, Actions) ── */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              {/* Logo công ty */}
                              {companyLogo ? (
                                <img
                                  src={companyLogo}
                                  alt={companyName}
                                  className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl object-contain bg-base-100 p-1.5 border border-base-200 shrink-0 shadow-xs"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-xs">
                                  <Building2 className="w-7 h-7" />
                                </div>
                              )}

                              {/* Thông tin công việc */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="badge badge-success badge-xs gap-1 text-white font-bold px-2 py-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    TOP
                                  </span>

                                  <Link
                                    to={`/jobs/${app.jobId}`}
                                    className="text-base sm:text-lg font-bold text-base-content hover:text-primary transition-colors truncate"
                                  >
                                    {app.jobPost?.title || app.jobTitle || "Công việc tuyển dụng"}
                                  </Link>
                                </div>

                                <p className="text-xs sm:text-sm font-medium text-base-content/80 mt-0.5 truncate">
                                  {companyName}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-2xs sm:text-xs text-base-content/60">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-base-content/40" />
                                    Ứng tuyển: {formatDate(app.appliedAt)}
                                  </span>

                                  {(app.cvUrl || app.cvTitle || app.cvName) && (
                                    <a
                                      href={app.cvUrl || "#"}
                                      target={app.cvUrl ? "_blank" : undefined}
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-primary hover:underline font-medium"
                                      onClick={(e) => {
                                        if (!app.cvUrl) {
                                          e.preventDefault();
                                          setDetailApp(app);
                                        }
                                      }}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      {app.cvTitle || app.cvName || "CV ứng tuyển"}
                                      {app.cvUrl && (
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      )}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Cụm nút hành động góc phải (Nhắc NTD & Nhắn tin) */}
                            <div className="flex items-center gap-2 self-start shrink-0 pt-0.5">
                              {canRemind && (
                                <button
                                  type="button"
                                  onClick={() => handleRemindRecruiter(appKey)}
                                  disabled={isCooldown || remindingId === appKey}
                                  className={`btn btn-xs rounded-full gap-1.5 transition-all font-semibold ${
                                    isCooldown
                                      ? "btn-ghost text-base-content/40 cursor-not-allowed bg-base-200/80"
                                      : "btn-outline btn-success hover:bg-success hover:text-white shadow-xs"
                                  }`}
                                  title={
                                    isCooldown
                                      ? "Bạn đã gửi lời nhắc gần đây. Có thể nhắc lại sau 24h"
                                      : "Nhắc nhở Nhà tuyển dụng xem và phản hồi hồ sơ của bạn"
                                  }
                                >
                                  {remindingId === appKey ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <BellRing className="w-3.5 h-3.5" />
                                  )}
                                  <span>{isCooldown ? "Đã nhắc NTD" : "Nhắc NTD"}</span>
                                </button>
                              )}

                              <Link
                                to={
                                  recruiterId
                                    ? `/chat?recipientId=${recruiterId}`
                                    : "/chat"
                                }
                                className="btn btn-xs btn-outline btn-ghost text-base-content/75 hover:bg-base-200 rounded-full gap-1.5"
                                title="Nhắn tin trao đổi với Nhà tuyển dụng"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Nhắn tin</span>
                              </Link>
                            </div>
                          </div>

                          {/* ── Khối 2: Banner nhắc nhở / Trạng thái hiện tại ── */}
                          {app.lastRemindedAt ? (
                            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-success/10 border border-success/25 text-success text-xs font-medium">
                              <BellRing className="w-4 h-4 shrink-0" />
                              <span>
                                Bạn đã gửi lời nhắc NTD xem và phản hồi CV của bạn (
                                {formatDateOnly(app.lastRemindedAt)})
                              </span>
                            </div>
                          ) : (
                            <div
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border ${statusInfo.badgeClass}`}
                            >
                              <StatusIcon className="w-4 h-4 shrink-0" />
                              <span>{statusInfo.description}</span>
                            </div>
                          )}

                          {/* ── Khối 3: Stepper tiến trình ứng tuyển 5 bước ngang ── */}
                          <div className="w-full py-1 sm:py-2 px-1 sm:px-2">
                            <div className="relative flex items-center justify-between">
                              {steps.map((step, sIdx) => {
                                const nextStep = steps[sIdx + 1];
                                const isTerminalRejected = step.status === "REJECTED";
                                const isTerminalWithdrawn = step.status === "WITHDRAWN";

                                let circleClass =
                                  "bg-base-100 border-2 border-base-300 text-base-content/30";
                                let iconNode = (
                                  <span className="w-1.5 h-1.5 rounded-full bg-base-content/25" />
                                );

                                if (step.done) {
                                  if (isTerminalRejected) {
                                    circleClass =
                                      "bg-error text-white border-error ring-4 ring-error/15";
                                    iconNode = <XCircle className="w-3.5 h-3.5" />;
                                  } else if (isTerminalWithdrawn) {
                                    circleClass =
                                      "bg-slate-500 text-white border-slate-500 ring-4 ring-slate-400/15";
                                    iconNode = <Undo2 className="w-3 h-3" />;
                                  } else {
                                    circleClass =
                                      "bg-success text-white border-success ring-4 ring-success/15";
                                    iconNode = <Check className="w-3.5 h-3.5 stroke-[3]" />;
                                  }
                                }

                                // Màu vạch kết nối sang bước kế tiếp (chỉ xanh khi bước kế tiếp đã hoàn thành)
                                let nextLineColor = "bg-base-300";
                                if (nextStep?.done) {
                                  if (nextStep.status === "REJECTED") {
                                    nextLineColor = "bg-error/70";
                                  } else if (nextStep.status === "WITHDRAWN") {
                                    nextLineColor = "bg-slate-400";
                                  } else {
                                    nextLineColor = "bg-success";
                                  }
                                }

                                return (
                                  <div
                                    key={step.key || sIdx}
                                    className="relative flex flex-col items-center flex-1"
                                  >
                                    {/* Vạch kết nối sang bước kế tiếp (kết thúc chính xác tại tâm icon kế tiếp) */}
                                    {sIdx < steps.length - 1 && (
                                      <div
                                        className={`absolute top-3 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 transition-colors duration-300 ${nextLineColor}`}
                                      />
                                    )}

                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs relative z-10 ${circleClass}`}
                                    >
                                      {iconNode}
                                    </div>
                                    <span
                                      className={`mt-1.5 text-3xs sm:text-2xs text-center line-clamp-1 ${
                                        step.done
                                          ? isTerminalRejected
                                            ? "text-error font-semibold"
                                            : isTerminalWithdrawn
                                            ? "text-slate-600 font-semibold"
                                            : "text-success font-semibold"
                                          : "text-base-content/50 font-normal"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* ── Khối 4: Accordion Chi tiết tiến trình ứng tuyển ── */}
                          <div className="border-t border-base-200/80 pt-2.5">
                            <button
                              type="button"
                              onClick={() => toggleAccordion(appKey)}
                              className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-base-content/85 hover:text-primary transition-colors py-1 group"
                            >
                              <span className="flex items-center gap-1.5">
                                Chi tiết tiến trình ứng tuyển
                              </span>
                              <span className="flex items-center gap-1 text-2xs text-base-content/50 group-hover:text-primary">
                                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </span>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 space-y-3.5 pl-2 sm:pl-3 border-l-2 border-primary/25 ml-2 pb-1">
                                    {histories.map((h, hIdx) => {
                                      const isLatest = hIdx === 0;
                                      return (
                                        <div
                                          key={h.historyId || hIdx}
                                          className="relative pl-4 text-xs"
                                        >
                                          {/* Timeline Dot */}
                                          <div
                                            className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-base-100 ${
                                              isLatest
                                                ? "border-success bg-success ring-4 ring-success/20"
                                                : "border-base-content/30"
                                            }`}
                                          />
                                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                            {isLatest && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold bg-success/15 text-success">
                                                • Mới nhất
                                              </span>
                                            )}
                                            <span className="font-semibold text-base-content">
                                              {getStatusTimelineLabel(h.applicationStatus)}
                                            </span>
                                            <span className="text-2xs text-base-content/50">
                                              {formatDetailDate(h.changedAt)}
                                            </span>
                                          </div>
                                          {h.note && (
                                            <p className="mt-1 text-2xs text-base-content/75 italic bg-base-200/50 p-2 rounded-lg border border-base-200/80">
                                              "{h.note}"
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* ── Khối 5: Chân thẻ (Thao tác rút đơn, xem chi tiết) ── */}
                          <div className="border-t border-base-200/60 pt-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/jobs/${app.jobId}`}
                                className="btn btn-ghost btn-xs text-base-content/70 hover:text-primary gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Chi tiết tin tuyển dụng
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleOpenDetail(app)}
                                className="btn btn-ghost btn-xs text-primary font-medium hover:bg-primary/10 gap-1"
                              >
                                Xem chi tiết đơn
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {canWithdraw && (
                              <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setWithdrawApp(app)}
                                className="btn btn-outline btn-error btn-xs gap-1"
                                title="Rút hồ sơ ứng tuyển nếu bạn không còn nhu cầu"
                              >
                                <Undo2 className="w-3 h-3" />
                                Rút hồ sơ
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Confirm Withdraw Modal */}
      <Modal
        isOpen={Boolean(withdrawApp)}
        onClose={() => (withdrawLoading ? null : setWithdrawApp(null))}
        title="Xác nhận rút hồ sơ ứng tuyển"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            variants={scaleInBounce}
            initial="hidden"
            animate="visible"
            className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4 ring-8 ring-error/5"
          >
            <Undo2 className="w-6 h-6" />
          </motion.div>

          <h4 className="text-base font-bold text-base-content mb-1">
            Bạn có chắc muốn rút hồ sơ ứng tuyển?
          </h4>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-xs mb-2">
            Vị trí:{" "}
            <span className="font-semibold text-base-content">
              {withdrawApp?.jobPost?.title || "Công việc"}
            </span>
          </p>
          <p className="text-2xs sm:text-xs text-base-content/50 max-w-xs mb-6">
            Lưu ý: Sau khi rút hồ sơ, nhà tuyển dụng sẽ không thể xử lý đơn ứng tuyển này nữa. Thao tác này không thể hoàn tác.
          </p>

          <div className="flex items-center gap-3 w-full justify-end">
            <button
              onClick={() => setWithdrawApp(null)}
              disabled={withdrawLoading}
              className="btn btn-sm btn-ghost"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmWithdraw}
              disabled={withdrawLoading}
              className="btn btn-sm btn-error text-white gap-1.5"
            >
              {withdrawLoading && <span className="loading loading-spinner loading-xs" />}
              Xác nhận rút đơn
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Application Modal */}
      <Modal
        isOpen={Boolean(detailApp)}
        onClose={() => setDetailApp(null)}
        title="Chi tiết đơn ứng tuyển"
        maxWidth="max-w-lg"
      >
        {detailApp && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <p className="text-xs text-base-content/60">Vị trí ứng tuyển</p>
              <h3 className="text-base font-bold text-base-content mt-0.5">
                {detailApp.jobPost?.title || detailApp.jobTitle || "Tin tuyển dụng"}
              </h3>
              <p className="text-xs text-base-content/75 font-medium mt-0.5">
                {detailApp.companyName || detailApp.company?.companyName || "Doanh nghiệp tuyển dụng"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-base-200/50 rounded-box border border-base-200">
              <div>
                <p className="text-2xs text-base-content/60">Trạng thái hiện tại</p>
                <p className="font-semibold text-primary mt-0.5">
                  {STATUS_CONFIG[detailApp.applicationStatus || detailApp.status]?.label ||
                    detailApp.applicationStatus ||
                    detailApp.status}
                </p>
              </div>
              <div>
                <p className="text-2xs text-base-content/60">Thời gian nộp</p>
                <p className="font-medium text-base-content mt-0.5">
                  {formatDate(detailApp.appliedAt)}
                </p>
              </div>
            </div>

            {(detailApp.cvTitle || detailApp.cvUrl || detailApp.cvName) && (
              <div>
                <p className="text-xs text-base-content/60 mb-1">CV đính kèm</p>
                <div className="flex items-center gap-2 p-2.5 bg-base-200/40 rounded-box border border-base-200">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium text-base-content truncate flex-1">
                    {detailApp.cvTitle || detailApp.cvName || "CV đính kèm"}
                  </span>
                  {detailApp.cvUrl && (
                    <a
                      href={detailApp.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-xs text-primary gap-1"
                    >
                      Xem file
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {detailApp.coverLetter && (
              <div>
                <p className="text-xs text-base-content/60 mb-1">Thư giới thiệu (Cover Letter)</p>
                <div className="p-3 bg-base-200/30 rounded-box border border-base-200 whitespace-pre-line text-base-content/80 text-xs">
                  {detailApp.coverLetter}
                </div>
              </div>
            )}

            {/* History timeline if available */}
            {detailApp.statusHistories && detailApp.statusHistories.length > 0 && (
              <div>
                <p className="text-xs text-base-content/60 mb-2 font-medium">Lịch sử trạng thái</p>
                <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-base-300">
                  {detailApp.statusHistories.map((hist, idx) => {
                    const st = hist.status || hist.applicationStatus;
                    const stCfg = STATUS_CONFIG[st] || STATUS_CONFIG.APPLIED;
                    const isApplicant =
                      hist.changedBy === detailApp.jobSeekerId ||
                      hist.changedBy === detailApp.userId;
                    return (
                      <div key={idx} className="relative space-y-1">
                        <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-base-100" />
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge badge-sm font-medium border ${stCfg.badgeClass}`}
                          >
                            {stCfg.label}
                          </span>
                          <span className="text-2xs text-base-content/50">
                            {formatDate(hist.changedAt)}
                          </span>
                        </div>
                        {hist.note && (
                          <p className="text-xs text-base-content/80 font-medium">
                            {hist.note}
                          </p>
                        )}
                        <p className="text-2xs text-base-content/50">
                          Bởi: {isApplicant ? "Bạn (Ứng viên)" : "Nhà tuyển dụng"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="pt-3 border-t border-base-200 flex justify-end">
              <button
                onClick={() => setDetailApp(null)}
                className="btn btn-sm btn-ghost"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default MyApplicationsPage;
