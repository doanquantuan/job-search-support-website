import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Filter,
  RefreshCw,
  Search,
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
    description: "Hồ sơ của bạn đã được chuyển tới bộ phận tuyển dụng.",
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

export const MyApplicationsPage = () => {
  const navigate = useNavigate();

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

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
      console.error("Lỗi khi tải danh sách đơn ứng tuyển:", err);
      setError("Không thể tải danh sách đơn ứng tuyển. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  // Filtered list based on search keyword
  const filteredApplications = applications.filter((app) => {
    if (!searchKeyword.trim()) return true;
    const term = searchKeyword.toLowerCase();
    const title = (app.jobPost?.title || "").toLowerCase();
    const note = (app.coverLetter || "").toLowerCase();
    return title.includes(term) || note.includes(term);
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

  // Calculate stats
  const totalCount = applications.length;
  const interviewingCount = applications.filter((a) => a.applicationStatus === "INTERVIEW").length;
  const reviewingCount = applications.filter((a) => ["APPLIED", "VIEWED", "REVIEWING"].includes(a.applicationStatus)).length;

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
          <ProfileSidebar />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Header Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight flex items-center gap-2.5">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Việc làm đã ứng tuyển
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                  Theo dõi trạng thái và tiến trình hồ sơ của bạn với các nhà tuyển dụng
                </p>
              </div>

              {/* Action refresh button */}
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="btn btn-outline btn-sm h-9 min-h-9 gap-1.5 text-xs font-medium self-start sm:self-auto"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>

            {/* Quick Stats Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card bg-base-100 p-4 border border-base-200 shadow-xs flex flex-row items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-medium">Tổng số đơn đã nộp</p>
                  <p className="text-lg font-bold text-base-content">{totalCount}</p>
                </div>
              </div>

              <div className="card bg-base-100 p-4 border border-base-200 shadow-xs flex flex-row items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-medium">Đang trong tiến trình</p>
                  <p className="text-lg font-bold text-amber-600">{reviewingCount}</p>
                </div>
              </div>

              <div className="card bg-base-100 p-4 border border-base-200 shadow-xs flex flex-row items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60 font-medium">Lời mời phỏng vấn</p>
                  <p className="text-lg font-bold text-emerald-600">{interviewingCount}</p>
                </div>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="card bg-base-100 p-3 sm:p-4 border border-base-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm theo chức danh công việc, thư giới thiệu..."
                    className="input input-sm input-bordered w-full pl-9 text-xs sm:text-sm h-9"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword("")}
                      className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs (Scrollable on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-base-200/60 pt-3">
                {FILTER_TABS.map((tab) => {
                  const isActive = selectedStatus === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedStatus(tab.key)}
                      className={`btn btn-xs h-7 px-3 rounded-full text-2xs sm:text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "btn-primary text-white shadow-xs"
                          : "btn-ghost text-base-content/70 hover:bg-base-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="alert alert-error text-xs flex items-center justify-between py-3 px-4 rounded-box">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchApplications}
                  className="btn btn-xs btn-ghost underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card bg-base-100 p-5 border border-base-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="skeleton h-5 w-2/3" />
                        <div className="skeleton h-4 w-1/3" />
                      </div>
                      <div className="skeleton h-6 w-24 rounded-full" />
                    </div>
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredApplications.length === 0 && (
              <div className="card bg-base-100 border border-base-200 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-base-content mb-1">
                  Chưa có đơn ứng tuyển nào
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mb-6">
                  {selectedStatus !== "ALL" || searchKeyword
                    ? "Không tìm thấy đơn ứng tuyển nào phù hợp với bộ lọc hiện tại."
                    : "Bạn chưa nộp hồ sơ ứng tuyển nào. Hãy khám phá ngay hàng ngàn cơ hội việc làm hấp dẫn!"}
                </p>
                <Link
                  to="/jobs"
                  className="btn btn-primary btn-sm h-10 px-5 text-xs sm:text-sm font-semibold text-white shadow-sm"
                >
                  Khám phá việc làm ngay
                </Link>
              </div>
            )}

            {/* Applications List */}
            {!loading && !error && filteredApplications.length > 0 && (
              <div className="space-y-3">
                {filteredApplications.map((app) => {
                  const statusInfo =
                    STATUS_CONFIG[app.applicationStatus] || STATUS_CONFIG.APPLIED;
                  const StatusIcon = statusInfo.icon;
                  const canWithdraw = ["APPLIED", "VIEWED", "REVIEWING"].includes(
                    app.applicationStatus
                  );

                  return (
                    <div
                      key={app.applicationId}
                      className="card bg-base-100 border border-base-200 shadow-xs hover:border-primary/30 transition-all p-4 sm:p-5 flex flex-col gap-3.5"
                    >
                      {/* Top Row: Job Title + Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="text-sm sm:text-base font-bold text-base-content hover:text-primary transition-colors flex items-center gap-1.5 group"
                          >
                            <span className="truncate">
                              {app.jobPost?.title || "Công việc tuyển dụng"}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-base-content/40 group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-2xs sm:text-xs text-base-content/60">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-base-content/40" />
                              Nộp lúc: {formatDate(app.appliedAt)}
                            </span>

                            {(app.cvTitle || app.cv?.title) && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <FileText className="w-3.5 h-3.5" />
                                {app.cvTitle || app.cv?.title || "CV đính kèm"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="self-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}
                            />
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Cover Letter preview if exists */}
                      {app.coverLetter && (
                        <div className="bg-base-200/50 rounded-lg p-3 text-xs text-base-content/80 border border-base-200">
                          <span className="font-semibold text-base-content/90 block mb-0.5">
                            Thư giới thiệu của bạn:
                          </span>
                          <p className="line-clamp-2 italic text-base-content/70">
                            "{app.coverLetter}"
                          </p>
                        </div>
                      )}

                      {/* Status note explanation */}
                      <div className="text-2xs text-base-content/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-base-content/30" />
                        <span>{statusInfo.description}</span>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="border-t border-base-200/60 pt-3 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setDetailApp(app)}
                          className="btn btn-ghost btn-xs text-primary font-medium hover:bg-primary/10 gap-1"
                        >
                          Xem chi tiết đơn
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${app.jobId}`}
                            className="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200 gap-1"
                          >
                            Chi tiết tin
                          </Link>

                          {canWithdraw && (
                            <button
                              onClick={() => setWithdrawApp(app)}
                              className="btn btn-outline btn-error btn-xs gap-1"
                              title="Rút hồ sơ ứng tuyển nếu bạn không còn nhu cầu"
                            >
                              <Undo2 className="w-3 h-3" />
                              Rút hồ sơ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4 ring-8 ring-error/5">
            <Undo2 className="w-6 h-6" />
          </div>

          <h4 className="text-base font-bold text-base-content mb-1">
            Bạn có chắc muốn rút hồ sơ ứng tuyển?
          </h4>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-xs mb-2">
            Vị trí: <span className="font-semibold text-base-content">{withdrawApp?.jobPost?.title || "Công việc"}</span>
          </p>
          <p className="text-2xs sm:text-xs text-base-content/50 max-w-xs mb-6">
            Lưu ý: Sau khi rút đơn, nhà tuyển dụng sẽ không tiếp tục xử lý hồ sơ này. Hành động này không thể hoàn tác.
          </p>

          <div className="flex items-center justify-end gap-3 w-full border-t border-base-200 pt-4">
            <button
              type="button"
              disabled={withdrawLoading}
              onClick={() => setWithdrawApp(null)}
              className="btn btn-outline border-base-300 flex-1 h-10 min-h-10 text-xs sm:text-sm font-medium"
            >
              Giữ lại hồ sơ
            </button>
            <button
              type="button"
              disabled={withdrawLoading}
              onClick={handleConfirmWithdraw}
              className="btn btn-error flex-1 h-10 min-h-10 text-xs sm:text-sm font-semibold text-white gap-2"
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
                {detailApp.jobPost?.title || "Tin tuyển dụng"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-base-200/50 rounded-box border border-base-200">
              <div>
                <p className="text-2xs text-base-content/60">Trạng thái hiện tại</p>
                <p className="font-semibold text-primary mt-0.5">
                  {STATUS_CONFIG[detailApp.applicationStatus]?.label || detailApp.applicationStatus}
                </p>
              </div>
              <div>
                <p className="text-2xs text-base-content/60">Thời gian nộp</p>
                <p className="font-medium text-base-content mt-0.5">
                  {formatDate(detailApp.appliedAt)}
                </p>
              </div>
            </div>

            {(detailApp.cvTitle || detailApp.cvUrl || detailApp.cv) && (
              <div>
                <p className="text-xs text-base-content/60 mb-1">CV đính kèm</p>
                <div className="flex items-center gap-2 p-2.5 bg-base-200/40 rounded-box border border-base-200">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium text-base-content truncate flex-1">
                    {detailApp.cvTitle || detailApp.cv?.title || "CV đính kèm"}
                  </span>
                  {(detailApp.cvUrl || detailApp.cv?.fileUrl) && (
                    <a
                      href={detailApp.cvUrl || detailApp.cv?.fileUrl}
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
                <p className="text-xs text-base-content/60 mb-2">Lịch sử trạng thái</p>
                <div className="space-y-2 border-l-2 border-primary/30 pl-3 ml-1">
                  {detailApp.statusHistories.map((hist, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base-content">
                          {STATUS_CONFIG[hist.applicationStatus]?.label || hist.applicationStatus}
                        </span>
                        <span className="text-2xs text-base-content/50">
                          {formatDate(hist.changedAt)}
                        </span>
                      </div>
                      {hist.note && (
                        <p className="text-2xs text-base-content/70 italic">
                          {hist.note}
                        </p>
                      )}
                    </div>
                  ))}
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

