import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  Calendar,
  Trash2,
  Send,
  ExternalLink,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useJobStore } from "../store/useJobStore";
import { jobApi } from "../features/job/services/jobApi";
import { AppHeader } from "../components/common/AppHeader";
import { AppFooter } from "../components/common/AppFooter";
import { ProfileSidebar } from "../components/common/ProfileSidebar";
import { Toast } from "../components/common/Toast";
import { JobDetailModal } from "../features/company/components/JobDetailModal";

export const SavedJobsPage = () => {
  const navigate = useNavigate();
  const { savedJobIds, toggleSaveJob } = useJobStore();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [toast, setToast] = useState(null);

  // Apply modal
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  // Tải danh sách việc làm đã lưu từ API máy chủ hoặc fallback local
  const loadSavedJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.getSavedJobs({ limit: 50 });
      const items = res?.items || (Array.isArray(res) ? res : []);

      if (items.length > 0) {
        setSavedJobs(items);
      } else if (savedJobIds.length > 0) {
        // Fallback: Nếu API trả về rỗng nhưng local có savedJobIds, fetch từng job
        const fetched = await Promise.all(
          savedJobIds.slice(0, 20).map(async (id) => {
            try {
              const job = await jobApi.getJobById(id);
              return job ? { jobId: id, jobPost: job, savedAt: new Date().toISOString(), isAvailable: true } : null;
            } catch {
              return null;
            }
          })
        );
        setSavedJobs(fetched.filter(Boolean));
      } else {
        setSavedJobs([]);
      }
    } catch (err) {
      console.warn("Lỗi khi tải danh sách việc làm đã lưu:", err);
      // Fallback sang local nếu API yêu cầu đăng nhập hoặc lỗi kết nối
      if (savedJobIds.length > 0) {
        try {
          const fetched = await Promise.all(
            savedJobIds.slice(0, 20).map(async (id) => {
              try {
                const job = await jobApi.getJobById(id);
                return job ? { jobId: id, jobPost: job, savedAt: new Date().toISOString(), isAvailable: true } : null;
              } catch {
                return null;
              }
            })
          );
          setSavedJobs(fetched.filter(Boolean));
        } catch {
          setSavedJobs([]);
        }
      } else {
        setSavedJobs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [savedJobIds]);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  // Xử lý bỏ lưu tin
  const handleUnsave = async (jobId, jobTitle) => {
    await toggleSaveJob(jobId);
    setSavedJobs((prev) => prev.filter((item) => (item.jobId || item.jobPost?.id) !== jobId));
    setToast({
      type: "success",
      title: "Đã bỏ lưu",
      message: `Đã xóa công việc "${jobTitle || "đã chọn"}" khỏi danh sách lưu.`,
    });
  };

  const formatDate = (dateStr) => {
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

  // Lọc theo từ khóa tìm kiếm
  const filteredJobs = savedJobs.filter((item) => {
    if (!keyword.trim()) return true;
    const term = keyword.toLowerCase();
    const title = (item.jobPost?.title || "").toLowerCase();
    const company = (item.jobPost?.companyName || item.jobPost?.company?.name || "").toLowerCase();
    return title.includes(term) || company.includes(term);
  });

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
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight flex items-center gap-2.5">
                  <Bookmark className="w-6 h-6 text-primary fill-primary/20" />
                  Việc làm đã lưu
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                  Xem lại và ứng tuyển các tin tuyển dụng bạn đã quan tâm ({filteredJobs.length} việc làm)
                </p>
              </div>

              {/* Refresh button */}
              <button
                onClick={loadSavedJobs}
                disabled={loading}
                className="btn btn-outline btn-sm h-9 min-h-9 gap-1.5 text-xs font-medium self-start sm:self-auto"
                title="Làm mới danh sách"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="card bg-base-100 p-3 sm:p-4 border border-base-200 shadow-xs">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo chức danh công việc, tên công ty..."
                  className="input input-sm input-bordered w-full pl-9 text-xs sm:text-sm h-9"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

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
                      <div className="skeleton h-8 w-24 rounded-lg" />
                    </div>
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredJobs.length === 0 && (
              <div className="card bg-base-100 border border-base-200 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-base-content mb-1">
                  Chưa có việc làm nào được lưu
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mb-6">
                  {keyword
                    ? "Không tìm thấy việc làm nào phù hợp với từ khóa tìm kiếm."
                    : "Bạn chưa lưu tin tuyển dụng nào. Hãy bấm vào biểu tượng lưu trên tin tuyển dụng để xem lại sau."}
                </p>
                <Link
                  to="/jobs"
                  className="btn btn-primary btn-sm h-10 px-5 text-xs sm:text-sm font-semibold text-white shadow-sm"
                >
                  Khám phá việc làm ngay
                </Link>
              </div>
            )}

            {/* Saved Jobs List */}
            {!loading && filteredJobs.length > 0 && (
              <div className="space-y-3.5">
                {filteredJobs.map((item) => {
                  const job = item.jobPost || {};
                  const jobId = item.jobId || job.id;
                  const companyName = job.companyName || job.company?.name || "Doanh nghiệp";
                  const isExpired = item.isExpired || (job.deadline && new Date(job.deadline) < new Date());

                  return (
                    <div
                      key={jobId}
                      className="card bg-base-100 border border-base-200 shadow-xs hover:border-primary/40 transition-all p-4 sm:p-5 flex flex-col gap-3.5 rounded-2xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* Job Title */}
                          <Link
                            to={`/jobs/${jobId}`}
                            className="text-sm sm:text-base font-bold text-base-content hover:text-primary transition-colors flex items-center gap-1.5 group"
                          >
                            <span className="truncate">{job.title || "Vị trí tuyển dụng"}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-base-content/40 group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>

                          {/* Company Name */}
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-base-content/70">
                            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-medium truncate">{companyName}</span>
                          </div>

                          {/* Metadata: Salary, Location, Workplace */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-2xs sm:text-xs text-base-content/60">
                            <span className="inline-flex items-center gap-1 font-semibold text-primary">
                              <Banknote className="w-3.5 h-3.5" />
                              {job.salary || "Thỏa thuận"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-base-content/40" />
                              {job.location || job.province || "Toàn quốc"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-base-content/40" />
                              {job.level || job.employmentType || "Toàn thời gian"}
                            </span>
                            {item.savedAt && (
                              <span className="inline-flex items-center gap-1 text-base-content/50">
                                <Clock className="w-3.5 h-3.5 text-base-content/40" />
                                Đã lưu: {formatDate(item.savedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status badge: Expired vs Active */}
                        <div className="self-start">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Đã hết hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Đang tuyển
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="border-t border-base-200/60 pt-3 flex items-center justify-between gap-3">
                        {/* Deadline note */}
                        <div className="flex items-center gap-1 text-2xs text-base-content/60">
                          <Calendar className="w-3.5 h-3.5 text-base-content/40" />
                          <span>Hạn nộp: <strong className="text-base-content/80">{job.deadline || "Đang tuyển"}</strong></span>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUnsave(jobId, job.title)}
                            className="btn btn-ghost btn-xs text-base-content/60 hover:text-error gap-1"
                            title="Xóa khỏi danh sách lưu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Bỏ lưu</span>
                          </button>

                          <Link
                            to={`/jobs/${jobId}`}
                            className="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200"
                          >
                            Chi tiết
                          </Link>

                          {!isExpired && (
                            <button
                              type="button"
                              onClick={() => setSelectedJobToApply(job)}
                              className="btn btn-primary btn-xs text-white font-semibold gap-1 px-3 shadow-xs"
                            >
                              <Send className="w-3 h-3" />
                              Ứng tuyển ngay
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

      {/* Apply Modal */}
      {selectedJobToApply && (
        <JobDetailModal
          job={selectedJobToApply}
          company={selectedJobToApply.company}
          isOpen={Boolean(selectedJobToApply)}
          onClose={() => setSelectedJobToApply(null)}
          onApplySuccess={(jobTitle) => {
            setToast({
              type: "success",
              title: "Nộp hồ sơ thành công",
              message: `Đã nộp hồ sơ ứng tuyển vào vị trí "${jobTitle}".`,
            });
          }}
        />
      )}

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default SavedJobsPage;

