import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Search,
  LayoutGrid,
  List,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Eye,
  Award,
  XCircle,
  Video,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Download,
  Filter,
} from "lucide-react";
import { useRecruiterApplicantStore } from "@/store/useRecruiterApplicantStore";
import { jobApi } from "@/features/job/services/jobApi";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CandidateDrawer } from "@/features/recruiter/components/CandidateDrawer";
import { EmptyState } from "@/components/common/EmptyState";
import { FilterTabs } from "@/components/common/FilterTabs";

const KANBAN_COLUMNS = [
  {
    id: "APPLIED",
    label: "Mới nộp",
    color: "border-sky-500",
    bgBadge: "bg-sky-500/10 text-sky-700",
    icon: FileText,
  },
  {
    id: "VIEWED",
    label: "Đã xem",
    color: "border-indigo-500",
    bgBadge: "bg-indigo-500/10 text-indigo-700",
    icon: Eye,
  },
  {
    id: "REVIEWING",
    label: "Đang đánh giá",
    color: "border-purple-500",
    bgBadge: "bg-purple-500/10 text-purple-700",
    icon: Clock,
  },
  {
    id: "INTERVIEW",
    label: "Mời phỏng vấn",
    color: "border-amber-500",
    bgBadge: "bg-amber-500/10 text-amber-700",
    icon: Calendar,
  },
  {
    id: "HIRED",
    label: "Trúng tuyển",
    color: "border-emerald-500",
    bgBadge: "bg-emerald-500/10 text-emerald-700",
    icon: Award,
  },
  {
    id: "REJECTED",
    label: "Chưa phù hợp",
    color: "border-rose-500",
    bgBadge: "bg-rose-500/10 text-rose-700",
    icon: XCircle,
  },
];

export const CandidateATSPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlJobId = searchParams.get("jobId") || "all";

  const {
    applications,
    selectedJobId,
    viewMode,
    searchKeyword,
    metrics,
    loading,
    updatingStatus,
    selectedApplicant,
    isDrawerOpen,
    fetchApplications,
    setSelectedJobId,
    setViewMode,
    setSearchKeyword,
    openDrawer,
    closeDrawer,
    updateApplicantStatus,
  } = useRecruiterApplicantStore();

  const [jobList, setJobList] = useState([]);

  useEffect(() => {
    // Tải danh sách tin tuyển dụng để đưa vào dropdown bộ lọc
    jobApi
      .getMyJobs({ limit: 100 })
      .then((res) => {
        setJobList(res.data || []);
      })
      .catch(() => {});

    // Đồng bộ jobId từ URL vào store nếu có
    fetchApplications(urlJobId);
  }, [urlJobId]);

  const handleJobSelectChange = (newJobId) => {
    setSearchParams(newJobId === "all" ? {} : { jobId: newJobId });
    setSelectedJobId(newJobId);
  };

  // Lọc ứng viên theo searchKeyword
  const filteredApplications = applications.filter((app) => {
    if (!searchKeyword.trim()) return true;
    const q = searchKeyword.trim().toLowerCase();
    return (
      app.candidateName.toLowerCase().includes(q) ||
      app.candidateEmail.toLowerCase().includes(q) ||
      (app.jobTitle && app.jobTitle.toLowerCase().includes(q)) ||
      (app.skills && app.skills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-300 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Hồ Sơ Ứng Viên & Quy Trình Tuyển Dụng (ATS)
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-0.5">
            Theo dõi ứng viên theo luồng Kanban trực quan, xem trước CV trực tuyến và đánh giá chuyên môn.
          </p>
        </div>

        {/* Quick Pipeline Stats */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-base-200 text-xs font-semibold flex items-center gap-1.5">
            <span>Tổng hồ sơ:</span>
            <span className="badge badge-primary badge-sm text-white font-bold">
              {metrics.total}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 text-xs font-semibold flex items-center gap-1.5">
            <span>Đang đánh giá:</span>
            <span className="font-bold">{metrics.reviewing}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
            <span>Phỏng vấn:</span>
            <span className="font-bold">{metrics.interview}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <span>Trúng tuyển:</span>
            <span className="font-bold">{metrics.hired}</span>
          </div>
        </div>
      </div>

      {/* ── Controls & Filter Bar ────────────────────────────────────────────── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Job Filter Dropdown + Search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Job Select */}
          <div className="relative min-w-[220px]">
            <select
              value={selectedJobId}
              onChange={(e) => handleJobSelectChange(e.target.value)}
              className="select select-bordered select-sm w-full font-medium focus:select-primary"
            >
              <option value="all">Tất cả vị trí tuyển dụng ({jobList.length} tin)</option>
              {jobList.map((j) => (
                <option key={j.id || j.jobId} value={j.id || j.jobId}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm ứng viên theo tên, email, kỹ năng..."
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
            />
          </div>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-base-200/70 p-1 rounded-xl border border-base-300 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`btn btn-xs rounded-lg gap-1.5 ${
              viewMode === "kanban"
                ? "btn-primary text-white shadow-xs font-bold"
                : "btn-ghost text-base-content/70"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`btn btn-xs rounded-lg gap-1.5 ${
              viewMode === "table"
                ? "btn-primary text-white shadow-xs font-bold"
                : "btn-ghost text-base-content/70"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* ── Main View Content ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-base-100 rounded-2xl border border-base-300 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <span className="loading loading-spinner loading-md text-primary" />
          <p className="text-xs text-base-content/60">Đang tải hồ sơ ứng viên...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            searchKeyword
              ? "Không tìm thấy ứng viên phù hợp"
              : "Chưa có hồ sơ ứng tuyển nào"
          }
          description={
            searchKeyword
              ? "Hãy thử tìm với tên, email hoặc từ khóa kỹ năng khác."
              : "Hồ sơ của ứng viên nộp cho vị trí này sẽ xuất hiện tại đây theo từng giai đoạn tuyển dụng."
          }
          actionText={searchKeyword ? "Xóa tìm kiếm" : "Xem tất cả vị trí"}
          onAction={() => {
            if (searchKeyword) setSearchKeyword("");
            else handleJobSelectChange("all");
          }}
        />
      ) : viewMode === "kanban" ? (
        /* ── KANBAN BOARD VIEW (6 COLUMNS) ────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const ColIcon = col.icon;
            const colApps = filteredApplications.filter(
              (a) => a.applicationStatus === col.id
            );

            return (
              <div
                key={col.id}
                className="bg-base-100 rounded-2xl border border-base-300 shadow-2xs flex flex-col max-h-[calc(100vh-14rem)] overflow-hidden"
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-t-4 border-b border-base-200 bg-base-100 flex items-center justify-between ${col.color}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ColIcon className="w-3.5 h-3.5 text-base-content/60 shrink-0" />
                    <h3 className="font-bold text-xs text-base-content truncate">
                      {col.label}
                    </h3>
                  </div>
                  <span
                    className={`badge badge-sm font-extrabold px-1.5 py-0.5 rounded-full ${col.bgBadge}`}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards List */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1 min-h-[140px] bg-base-200/30">
                  <AnimatePresence>
                    {colApps.map((app) => (
                      <motion.div
                        key={app.id || app.applicationId}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => openDrawer(app)}
                        className="p-3.5 bg-base-100 rounded-xl border border-base-300 shadow-2xs hover:shadow-md hover:border-primary/40 cursor-pointer transition-all space-y-2.5 group relative"
                      >
                        {/* Top: Avatar & Name */}
                        <div className="flex items-center gap-2.5">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-full ring-1 ring-base-300 overflow-hidden">
                              {app.avatar ? (
                                <img
                                  src={app.avatar}
                                  alt={app.candidateName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                  {app.candidateName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-xs text-base-content group-hover:text-primary transition-colors truncate">
                              {app.candidateName}
                            </h4>
                            <p className="text-2xs text-base-content/50 truncate">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>

                        {/* Match score & CV filename */}
                        <div className="flex items-center justify-between gap-1 text-2xs text-base-content/60">
                          <span className="flex items-center gap-1 truncate max-w-[130px]">
                            <FileText className="w-3 h-3 shrink-0 text-primary" />
                            <span className="truncate">{app.cvTitle || "CV.pdf"}</span>
                          </span>
                          {app.matchScore && (
                            <span className="badge badge-xs bg-emerald-500/10 text-emerald-700 font-bold shrink-0">
                              {app.matchScore}%
                            </span>
                          )}
                        </div>

                        {/* Skills preview tags */}
                        {app.skills && app.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.skills.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                className="text-2xs px-1.5 py-0.5 rounded bg-base-200 text-base-content/70 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {app.skills.length > 2 && (
                              <span className="text-2xs px-1 py-0.5 text-base-content/40">
                                +{app.skills.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Interview Date pill if in INTERVIEW */}
                        {col.id === "INTERVIEW" && app.interviewDetails?.date && (
                          <div className="text-2xs p-1.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">
                              {new Date(app.interviewDetails.date).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Footer: Date & Arrow action */}
                        <div className="flex items-center justify-between text-2xs text-base-content/40 pt-1 border-t border-base-200/60">
                          <span>
                            {app.appliedAt
                              ? new Date(app.appliedAt).toLocaleDateString("vi-VN")
                              : "Gần đây"}
                          </span>
                          <span className="text-primary font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colApps.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-2xs text-base-content/30 italic">
                      Trống
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ───────────────────────────────────────────────────── */
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[1020px]">
              <thead>
                <tr className="bg-base-200/60 text-base-content/70 border-b border-base-200 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Ứng viên</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Vị trí ứng tuyển</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Ngày nộp</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">CV đính kèm</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Vòng tuyển dụng</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Đánh giá gần nhất</th>
                  <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id || app.applicationId}
                    className="hover:bg-base-200/40 transition-colors group cursor-pointer"
                    onClick={() => openDrawer(app)}
                  >
                    {/* Ứng viên */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 max-w-[220px] mx-auto">
                        <div className="avatar shrink-0">
                          <div className="w-8 h-8 rounded-full ring-1 ring-base-300 overflow-hidden">
                            {app.avatar ? (
                              <img
                                src={app.avatar}
                                alt={app.candidateName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                {app.candidateName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-bold text-sm text-base-content group-hover:text-primary transition-colors whitespace-nowrap truncate">
                            {app.candidateName}
                          </p>
                          <p className="text-2xs text-base-content/50 whitespace-nowrap truncate">
                            {app.candidateEmail} • {app.candidatePhone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Vị trí */}
                    <td className="py-3 px-4 text-center font-medium text-base-content/80 max-w-[220px]">
                      <span className="truncate block mx-auto">{app.jobTitle}</span>
                    </td>

                    {/* Ngày nộp */}
                    <td className="py-3 px-4 text-center text-base-content/70 whitespace-nowrap font-medium">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString("vi-VN")
                        : "Gần đây"}
                    </td>

                    {/* CV đính kèm */}
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <a
                          href={app.cvUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-primary bg-primary/5 hover:bg-primary/15 border border-primary/20 text-xs font-semibold whitespace-nowrap transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[130px]">{app.cvTitle || "CV.pdf"}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        </a>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center">
                        <StatusBadge status={app.applicationStatus} size="sm" />
                      </div>
                    </td>

                    {/* Đánh giá gần nhất */}
                    <td className="py-3 px-4 text-center text-base-content/70 max-w-[220px]">
                      <span className="truncate block mx-auto">
                        {app.lastNote || (
                          <span className="text-base-content/40 italic">Chưa có ghi chú</span>
                        )}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => openDrawer(app)}
                          className="btn btn-primary btn-outline btn-xs whitespace-nowrap font-medium h-7 px-3.5 gap-1"
                        >
                          <span>Xem hồ sơ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Reusable CandidateDrawer ────────────────────────────────────────── */}
      <CandidateDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        applicant={selectedApplicant}
        onUpdateStatus={updateApplicantStatus}
        updating={updatingStatus}
      />
    </div>
  );
};

export default CandidateATSPage;
