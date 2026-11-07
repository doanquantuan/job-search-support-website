import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FilePlus2,
  Briefcase,
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Calendar,
  ChevronRight,
  UserCheck,
  BarChart3,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { companyApi } from "@/features/company/services/companyApi";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { useRecruiterApplicantStore } from "@/store/useRecruiterApplicantStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CandidateDrawer } from "@/features/recruiter/components/CandidateDrawer";

// Dữ liệu mẫu biểu đồ 7 ngày gần nhất
const WEEKLY_TREND_DATA = [
  { day: "T2", date: "31/10", count: 3, label: "3 hồ sơ" },
  { day: "T3", date: "01/11", count: 5, label: "5 hồ sơ" },
  { day: "T4", date: "02/11", count: 2, label: "2 hồ sơ" },
  { day: "T5", date: "03/11", count: 8, label: "8 hồ sơ" },
  { day: "T6", date: "04/11", count: 6, label: "6 hồ sơ" },
  { day: "T7", date: "05/11", count: 3, label: "3 hồ sơ" },
  { day: "CN", date: "06/11", count: 4, label: "4 hồ sơ" },
];

export const RecruiterDashboardOverviewPage = () => {
  const { user } = useAuthStore();
  const [verification, setVerification] = useState(null);
  const [company, setCompany] = useState(null);

  const {
    jobs = [],
    metrics: jobMetrics = {},
    fetchMyJobs,
    fetchJobs,
  } = useRecruiterJobStore();

  const {
    applications = [],
    metrics: applicantMetrics = {},
    fetchApplications,
    selectedApplicant,
    isDrawerOpen,
    updatingStatus,
    openDrawer,
    closeDrawer,
    changeApplicantStatus,
  } = useRecruiterApplicantStore();

  useEffect(() => {
    companyApi.getVerificationStatus().then(setVerification).catch(() => {});
    companyApi.getMyCompany().then(setCompany).catch(() => {});
    const loadJobs = fetchMyJobs || fetchJobs;
    if (typeof loadJobs === "function") {
      loadJobs();
    }
    if (typeof fetchApplications === "function") {
      fetchApplications("all");
    }
  }, [fetchMyJobs, fetchJobs, fetchApplications]);

  const isVerified = verification?.verificationStatus === "APPROVED";
  const isPending = verification?.verificationStatus === "PENDING";
  const isRejected = verification?.verificationStatus === "REJECTED";

  // Thẻ chỉ số tổng quan an toàn khi chỉ chạy frontend
  const jobsList = Array.isArray(jobs) ? jobs : [];
  const applicationsList = Array.isArray(applications) ? applications : [];
  const totalPublishedJobs =
    jobMetrics?.published ||
    jobsList.filter((j) => j?.status === "PUBLISHED").length ||
    4;
  const totalApplications =
    applicantMetrics?.total || applicationsList.length || 28;
  const totalViews = jobMetrics?.totalViews || 1420;
  const pendingReviewCount =
    (applicantMetrics?.applied || 0) + (applicantMetrics?.reviewing || 0) || 5;

  const stats = [
    {
      title: "Tin tuyển dụng đang mở",
      value: totalPublishedJobs.toString(),
      change: "+1 tin trong tuần này",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border border-blue-200",
      link: "/recruiter/jobs",
    },
    {
      title: "Ứng viên đã nộp hồ sơ",
      value: totalApplications.toString(),
      change: "+6 hồ sơ mới tuần này",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border border-emerald-200",
      link: "/recruiter/applications",
    },
    {
      title: "Lượt xem tin tuyển dụng",
      value: totalViews.toLocaleString("vi-VN"),
      change: "+18% so với tháng trước",
      icon: Eye,
      color: "text-amber-600 bg-amber-50 border border-amber-200",
      link: "/recruiter/jobs",
    },
    {
      title: "Hồ sơ cần xử lý ngay",
      value: pendingReviewCount.toString(),
      change: `${applicantMetrics.interview || 2} hồ sơ chờ phỏng vấn`,
      icon: Clock,
      color: "text-purple-600 bg-purple-50 border border-purple-200",
      link: "/recruiter/applications",
    },
  ];

  // Dữ liệu phễu tuyển dụng
  const funnelStages = [
    {
      id: "APPLIED",
      name: "Mới ứng tuyển",
      count: applicantMetrics.applied || 3,
      pct: 100,
      color: "bg-sky-500",
    },
    {
      id: "VIEWED",
      name: "Đã xem hồ sơ",
      count: applicantMetrics.viewed || 2,
      pct: 82,
      color: "bg-indigo-500",
    },
    {
      id: "REVIEWING",
      name: "Đang đánh giá",
      count: applicantMetrics.reviewing || 2,
      pct: 60,
      color: "bg-amber-500",
    },
    {
      id: "INTERVIEW",
      name: "Mời phỏng vấn",
      count: applicantMetrics.interview || 2,
      pct: 35,
      color: "bg-purple-500",
    },
    {
      id: "HIRED",
      name: "Trúng tuyển",
      count: applicantMetrics.hired || 1,
      pct: 18,
      color: "bg-emerald-500",
    },
  ];

  const quickActions = [
    {
      title: "Đăng tin tuyển dụng mới",
      desc: "Tạo tin tuyển dụng nhanh chóng với biểu mẫu thông minh 4 bước",
      icon: FilePlus2,
      to: "/recruiter/jobs/create",
      iconBg: "bg-primary text-white",
      badge: "Phổ biến",
    },
    {
      title: "Quản lý hồ sơ ứng viên (ATS)",
      desc: "Xem CV, lọc trạng thái tuyển dụng và đặt lịch phỏng vấn",
      icon: Users,
      to: "/recruiter/applications",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      title: "Cập nhật hồ sơ công ty",
      desc: "Chỉnh sửa văn hóa doanh nghiệp, logo, ảnh bìa & phúc lợi",
      icon: Building2,
      to: "/recruiter/company",
      iconBg: "bg-indigo-600 text-white",
    },
    {
      title: "Xác thực doanh nghiệp (GPKD)",
      desc: isVerified
        ? "Doanh nghiệp đã được cấp huy hiệu Tích xanh Uy tín"
        : "Tải giấy phép kinh doanh để duyệt mở rộng quyền đăng tin",
      icon: ShieldCheck,
      to: "/recruiter/verification",
      iconBg: isVerified ? "bg-teal-600 text-white" : "bg-amber-600 text-white",
    },
  ];

  // 4 hồ sơ ứng viên mới nhất cần xem
  const recentApplicants = (applications || []).slice(0, 4);

  // 3 tin tuyển dụng mới nhất
  const recentJobs = (jobs || []).slice(0, 3);

  const maxWeeklyCount = Math.max(...WEEKLY_TREND_DATA.map((d) => d.count), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Welcome Banner (Màu sắc chuẩn Brand High-Contrast) ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-white/10"
        style={{
          background:
            "linear-gradient(135deg, #005A9C 0%, #16365c 50%, #0d233e 100%)",
        }}
      >
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Cổng quản trị Nhà tuyển dụng</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Xin chào, {user?.fullName || "Nhà tuyển dụng"}!
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Hệ thống quản lý tuyển dụng của{" "}
            <strong className="text-white font-bold underline decoration-white/30">
              {company?.companyName || user?.companyName || "TechFlow Corporation"}
            </strong>
            . Theo dõi hồ sơ ứng viên, đăng tin tuyển dụng và quản lý thông tin doanh nghiệp.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/recruiter/jobs/create"
              className="btn btn-sm bg-white text-[#005A9C] hover:bg-blue-50 hover:text-[#00406e] border-none font-bold shadow-md gap-2 transition-all cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4 text-[#005A9C]" />
              <span>Đăng tin tuyển dụng</span>
            </Link>
            <Link
              to="/recruiter/company"
              className="btn btn-sm text-white bg-white/15 hover:bg-white/25 border border-white/30 font-semibold gap-2 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Hồ sơ công ty</span>
            </Link>
          </div>
        </div>

        {/* Decorative Watermark & Glow */}
        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden sm:flex items-center justify-center overflow-hidden">
          <Briefcase className="w-64 h-64 text-white transform rotate-12 translate-x-12" />
        </div>
      </motion.div>

      {/* ── Verification Warning Banner if not verified ────────────────────── */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isPending
              ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
              : isRejected
              ? "bg-rose-500/10 border-rose-500/30 text-rose-900"
              : "bg-blue-500/10 border-blue-500/30 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-xs shrink-0">
              {isPending ? (
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              ) : isRejected ? (
                <ShieldCheck className="w-5 h-5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {isPending
                  ? "Hồ sơ xác thực doanh nghiệp đang chờ Quản trị viên xét duyệt"
                  : isRejected
                  ? "Hồ sơ xác thực GPKD bị từ chối xét duyệt"
                  : "Hoàn tất xác thực doanh nghiệp để nhận huy hiệu Uy tín"}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {isPending
                  ? "Thời gian xét duyệt thông thường trong 24 giờ làm việc."
                  : isRejected
                  ? "Vui lòng xem lý do và cập nhật lại bản scan Giấy phép kinh doanh hợp lệ."
                  : "Đăng tải Giấy phép kinh doanh giúp tin đăng của bạn tiếp cận nhiều ứng viên hàng đầu hơn."}
              </p>
            </div>
          </div>
          <Link
            to="/recruiter/verification"
            className="btn btn-sm btn-outline self-end sm:self-center gap-1.5 shrink-0"
          >
            <span>{isPending ? "Xem tiến độ" : isRejected ? "Khắc phục ngay" : "Xác thực ngay"}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* ── Stat Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:shadow-md hover:border-primary/40 transition-all group relative cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {item.title}
                </span>
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1B365D]">
                  {item.value}
                </p>
                <p className="text-xs font-semibold text-slate-600 mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item.change}</span>
                </p>
              </div>
              <Link
                to={item.link}
                className="absolute inset-0 rounded-2xl"
                aria-label={item.title}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── Analytics & Thống kê tuyển dụng (Phase 4) ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ xu hướng nộp hồ sơ 7 ngày gần nhất (7 Cols) */}
        <div className="lg:col-span-7 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-primary border border-blue-100">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B365D]">
                  Xu hướng hồ sơ nộp trong tuần
                </h3>
                <p className="text-xs text-slate-500">
                  Số lượng hồ sơ ứng tuyển nhận được mỗi ngày
                </p>
              </div>
            </div>
            <span className="badge badge-sm badge-success text-white font-bold gap-1">
              +18%
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {WEEKLY_TREND_DATA.map((item) => {
                const heightPercent = Math.round((item.count / maxWeeklyCount) * 100);
                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-[#1B365D] text-white text-[11px] font-semibold whitespace-nowrap z-20 pointer-events-none shadow-sm">
                      {item.label}
                    </div>

                    <div className="w-full flex items-end justify-center h-32">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-[#005A9C] to-sky-400 rounded-t-lg group-hover:from-primary group-hover:to-sky-300 transition-colors shadow-2xs"
                      />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-[#1B365D]">
                        {item.day}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {item.date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phễu chuyển đổi tuyển dụng (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B365D]">
                Phễu chuyển đổi tuyển dụng
              </h3>
              <p className="text-xs text-slate-500">
                Tỷ lệ ứng viên qua các vòng phỏng vấn
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {funnelStages.map((stage) => (
              <div key={stage.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1B365D]">{stage.count}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({stage.pct}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.pct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${stage.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tỷ lệ tuyển dụng thành công:</span>
            <span className="font-bold text-emerald-600">18.5%</span>
          </div>
        </div>
      </div>

      {/* ── Hồ sơ mới nộp cần xử lý & Tin tuyển dụng gần đây ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Danh sách hồ sơ mới nhất (7 Cols) */}
        <div className="lg:col-span-7 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B365D]">
                  Hồ sơ mới nộp cần xem
                </h3>
                <p className="text-xs text-slate-500">
                  Các ứng viên mới nộp gần đây nhất
                </p>
              </div>
            </div>
            <Link
              to="/recruiter/applications"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({applications.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApplicants.map((app) => (
              <div
                key={app.id || app.applicationId}
                className="py-3 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center shrink-0 border border-blue-200">
                    {app.candidateName
                      ? app.candidateName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1B365D] truncate group-hover:text-primary transition-colors">
                      {app.candidateName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {app.jobTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={app.status} type="applicant" size="sm" />
                  <button
                    type="button"
                    onClick={() => openDrawer(app)}
                    className="btn btn-xs btn-outline btn-primary font-semibold rounded-lg"
                  >
                    Xem CV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tin tuyển dụng đang hoạt động (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-primary border border-blue-100">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B365D]">
                  Tin tuyển dụng đang mở
                </h3>
                <p className="text-xs text-slate-500">
                  Tiến độ nhận hồ sơ theo từng tin
                </p>
              </div>
            </div>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Quản lý ({jobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id || job.jobId}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#1B365D] truncate">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{job.viewCount || 0} lượt xem</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">
                      {job.applicationsCount || 0} hồ sơ
                    </span>
                  </div>
                </div>

                <Link
                  to={`/recruiter/applications?jobId=${job.id || job.jobId}`}
                  className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 gap-1 shrink-0"
                >
                  <span>Xem hồ sơ</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lối tắt chức năng nhanh ────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-[#1B365D] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Lối tắt chức năng nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex items-start gap-4 relative"
              >
                <div className={`p-3 rounded-xl shrink-0 ${action.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#1B365D] group-hover:text-primary">
                      {action.title}
                    </h4>
                    {action.badge && (
                      <span className="badge badge-primary badge-xs text-white">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                <Link
                  to={action.to}
                  className="absolute inset-0"
                  aria-label={action.title}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Candidate Drawer (Xem CV trực tiếp từ Dashboard) ────────────────── */}
      <CandidateDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        applicant={selectedApplicant}
        onUpdateStatus={changeApplicantStatus}
        updating={updatingStatus}
      />
    </div>
  );
};

export default RecruiterDashboardOverviewPage;
