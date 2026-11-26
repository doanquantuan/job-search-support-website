import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ChevronRight,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { companyApi } from "@/features/company/services/companyApi";
import { applicationApi } from "@/features/job/services/applicationApi";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { useRecruiterApplicantStore } from "@/store/useRecruiterApplicantStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CandidateDrawer } from "@/features/recruiter/components/CandidateDrawer";

// Helper tách thứ và ngày từ label backend trả về ("T2 (31/10)" hoặc "CN (06/11)")
const parseChartLabel = (label = "") => {
  const parts = label.trim().split(" ");
  const day = parts[0] || "";
  const date = parts[1] ? parts[1].replace(/[()]/g, "") : "";
  return { day, date };
};

export const RecruiterDashboardOverviewPage = () => {
  const { user } = useAuthStore();
  const [verification, setVerification] = useState(null);
  const [company, setCompany] = useState(null);

  // Analytics API State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);

  const {
    jobs = [],
    metrics: jobMetrics = {},
    loading: jobsLoading = false,
    fetchMyJobs,
    fetchJobs,
  } = useRecruiterJobStore();

  const {
    applications = [],
    metrics: applicantMetrics = {},
    loading: appsLoading = false,
    fetchApplications,
    selectedApplicant,
    isDrawerOpen,
    updatingStatus,
    openDrawer,
    closeDrawer,
    changeApplicantStatus,
  } = useRecruiterApplicantStore();

  // 1. Tải dữ liệu phân tích 7 ngày gần nhất từ application-service
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const data = await applicationApi.getRecruiterAnalytics({ timeRange: "7d" });
      if (data) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.warn("[RecruiterDashboardOverviewPage] Lỗi getRecruiterAnalytics:", err);
      setAnalyticsError(
        err.response?.data?.message || err.message || "Không thể tải dữ liệu phân tích lúc này"
      );
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

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

    fetchAnalytics();
  }, [fetchMyJobs, fetchJobs, fetchApplications, fetchAnalytics]);

  const isVerified = verification?.verificationStatus === "APPROVED";
  const isPending = verification?.verificationStatus === "PENDING";
  const isRejected = verification?.verificationStatus === "REJECTED";

  // Lựa chọn A: Map số lượng đơn ứng tuyển theo từng jobId từ analyticsData.jobPerformances
  const appsByJobMap = useMemo(() => {
    const map = {};
    (analyticsData?.jobPerformances || []).forEach((jp) => {
      map[jp.id] = jp.apps || 0;
    });
    return map;
  }, [analyticsData]);

  // Thẻ chỉ số tổng quan chính xác (Zero State: hiển thị 0 thay vì số mock ảo)
  const jobsList = Array.isArray(jobs) ? jobs : [];
  const applicationsList = Array.isArray(applications) ? applications : [];

  const totalPublishedJobs = jobMetrics?.published ?? jobsList.filter((j) => j?.status === "PUBLISHED").length;
  const totalApplications = analyticsData?.kpis?.applications ?? (applicantMetrics?.total ?? applicationsList.length);
  const totalViews = analyticsData?.kpis?.views ?? (jobMetrics?.totalViews ?? 0);
  const pendingReviewCount = (applicantMetrics?.applied || 0) + (applicantMetrics?.reviewing || 0);

  const stats = [
    {
      title: "Tin tuyển dụng đang mở",
      value: totalPublishedJobs.toString(),
      change: jobMetrics?.publishedGrowth || "+0 tin trong tuần này",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border border-blue-200",
      link: "/recruiter/jobs",
      loading: jobsLoading,
    },
    {
      title: "Ứng viên đã nộp hồ sơ",
      value: totalApplications.toString(),
      change: analyticsData?.kpis?.applicationsGrowth
        ? `${analyticsData.kpis.applicationsGrowth} so với tuần trước`
        : "+0% so với tuần trước",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border border-emerald-200",
      link: "/recruiter/applications",
      loading: loadingAnalytics,
    },
    {
      title: "Lượt xem tin tuyển dụng",
      value: totalViews.toLocaleString("vi-VN"),
      change: analyticsData?.kpis?.viewsGrowth
        ? `${analyticsData.kpis.viewsGrowth} so với tuần trước`
        : "+0% so với tuần trước",
      icon: Eye,
      color: "text-amber-600 bg-amber-50 border border-amber-200",
      link: "/recruiter/jobs",
      loading: loadingAnalytics,
    },
    {
      title: "Hồ sơ cần xử lý ngay",
      value: pendingReviewCount.toString(),
      change: `${applicantMetrics.interview || 0} hồ sơ chờ phỏng vấn`,
      icon: Clock,
      color: "text-purple-600 bg-purple-50 border border-purple-200",
      link: "/recruiter/applications",
      loading: appsLoading,
    },
  ];

  // Tính toán phễu tuyển dụng động từ Backend
  const funnelStages = useMemo(() => {
    if (analyticsData?.funnel && analyticsData.funnel.length > 0) {
      return analyticsData.funnel;
    }
    return [];
  }, [analyticsData]);

  const hiredStage = funnelStages.find((s) => s.stage === "HIRED");
  const hiredSuccessPct = hiredStage ? hiredStage.pct : 0;

  // Tính chiều cao tối đa cho các cột biểu đồ
  const maxWeeklyCount = useMemo(() => {
    if (!analyticsData?.chart || analyticsData.chart.length === 0) return 1;
    return Math.max(...analyticsData.chart.map((d) => d.apps), 1);
  }, [analyticsData]);

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
      title: "Xác thực công ty",
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

  return (
    <div className="space-y-6 pb-12">
      {/* ── Welcome Banner (Màu sắc chuẩn Brand High-Contrast) ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-white/10"
        style={{
          background: "linear-gradient(135deg, #005A9C 0%, #16365c 50%, #0d233e 100%)",
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
            {company?.companyName || user?.companyName ? (
              <strong className="text-white font-bold underline decoration-white/30">
                {company?.companyName || user?.companyName}
              </strong>
            ) : (
              <Link to="/recruiter/company" className="text-amber-300 font-bold hover:underline">
                Chưa cập nhật tên công ty (Cập nhật ngay)
              </Link>
            )}
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
            <Link
              to="/recruiter"
              className="btn btn-sm text-white bg-white/10 hover:bg-white/20 border border-white/25 font-semibold gap-2 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Về trang chủ</span>
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
                  : "Đăng tải Giấy phép kinh doanh giúp tin đăng của bạn tiếp cận nhiều ứng viên tiềm năng hơn."}
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
          if (item.loading) {
            return (
              <div
                key={item.title}
                className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            );
          }

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
              <Link to={item.link} className="absolute inset-0 rounded-2xl" aria-label={item.title} />
            </motion.div>
          );
        })}
      </div>

      {/* ── Analytics & Thống kê tuyển dụng (Cô Lập Lỗi - Graceful Degradation) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ xu hướng nộp hồ sơ 7 ngày gần nhất (7 Cols) */}
        <div className="lg:col-span-7 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-primary border border-blue-100">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B365D]">Xu hướng hồ sơ nộp trong tuần</h3>
                <p className="text-xs text-slate-500">Số lượng hồ sơ ứng tuyển nhận được mỗi ngày</p>
              </div>
            </div>
            {analyticsData?.kpis?.applicationsGrowth && (
              <span className="badge badge-sm badge-success text-white font-bold gap-1">
                {analyticsData.kpis.applicationsGrowth}
              </span>
            )}
          </div>

          {/* Skeleton Loader cho Biểu Đồ */}
          {loadingAnalytics ? (
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 animate-pulse">
                {[45, 65, 30, 85, 70, 40, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-32">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full max-w-[36px] bg-slate-200 dark:bg-slate-700 rounded-t-lg"
                      />
                    </div>
                    <div className="h-3 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : analyticsError ? (
            /* Error State cục bộ cho Biểu Đồ (Không làm crash cả trang) */
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Không thể tải biểu đồ phân tích</p>
              <button
                type="button"
                onClick={fetchAnalytics}
                className="btn btn-xs btn-outline btn-primary gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            </div>
          ) : (
            /* Dữ liệu thật từ Backend */
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {(analyticsData?.chart || []).map((item, idx) => {
                  const { day, date } = parseChartLabel(item.label);
                  const heightPercent =
                    maxWeeklyCount > 0 ? Math.round((item.apps / maxWeeklyCount) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-[#1B365D] text-white text-[11px] font-semibold whitespace-nowrap z-20 pointer-events-none shadow-sm">
                        {item.apps} hồ sơ ({item.views || 0} lượt xem)
                      </div>

                      <div className="w-full flex items-end justify-center h-32">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(heightPercent, item.apps > 0 ? 8 : 3)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-colors shadow-2xs ${
                            item.apps > 0
                              ? "bg-gradient-to-t from-[#005A9C] to-sky-400 group-hover:from-primary group-hover:to-sky-300"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-[#1B365D]">
                          {day || `N${idx + 1}`}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {date || ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Phễu chuyển đổi tuyển dụng (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B365D]">Phễu chuyển đổi tuyển dụng</h3>
              <p className="text-xs text-slate-500">Tỷ lệ ứng viên qua từng bước tuyển dụng</p>
            </div>
          </div>

          {loadingAnalytics ? (
            /* Skeleton Loader cho Phễu */
            <div className="space-y-4 pt-2 animate-pulse">
              {[100, 75, 50, 30, 15].map((w, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${w}%` }} className="h-full bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : analyticsError ? (
            /* Error State cục bộ cho Phễu */
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Chưa tải được dữ liệu phễu</p>
              <button
                type="button"
                onClick={fetchAnalytics}
                className="btn btn-xs btn-outline btn-primary gap-1.5 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            </div>
          ) : (
            /* Dữ liệu thật từ Backend */
            <div className="space-y-3 pt-2">
              {funnelStages.map((stage) => (
                <div key={stage.stage || stage.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[190px]">
                      {stage.label || stage.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
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
                      className={`h-full rounded-full ${stage.color || "bg-primary"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tỷ lệ tuyển dụng thành công:</span>
            <span className="font-bold text-emerald-600">{hiredSuccessPct}%</span>
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
                <h3 className="font-bold text-sm text-[#1B365D]">Hồ sơ mới nộp cần xem</h3>
                <p className="text-xs text-slate-500">Các ứng viên mới nộp gần đây nhất</p>
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

          {appsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-2.5 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : recentApplicants.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Chưa có hồ sơ ứng tuyển mới nào</p>
              <p className="text-[11px] text-slate-400">Hồ sơ ứng viên nộp vào các vị trí tuyển dụng sẽ hiển thị tại đây</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplicants.map((app) => (
                <div
                  key={app.id || app.applicationId}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-primary font-bold flex items-center justify-center shrink-0 border border-blue-200">
                      {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1B365D] truncate group-hover:text-primary transition-colors">
                        {app.candidateName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{app.jobTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={app.status || app.applicationStatus} type="applicant" size="sm" />
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
          )}
        </div>

        {/* Tin tuyển dụng đang hoạt động (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-primary border border-blue-100">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B365D]">Tin tuyển dụng đang mở</h3>
                <p className="text-xs text-slate-500">Tiến độ nhận hồ sơ theo từng tin</p>
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

          {jobsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="h-3.5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2.5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Chưa có tin tuyển dụng nào đang mở</p>
              <Link to="/recruiter/jobs/create" className="btn btn-xs btn-primary text-white font-bold">
                Đăng tin tuyển dụng ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const jobId = job.id || job.jobId;
                // Lựa chọn A: Lấy applicationsCount từ map jobPerformances của Analytics API
                const appsCount = appsByJobMap[jobId] ?? (job.applicationsCount || 0);
                const viewsCount = job.viewCount || 0;

                return (
                  <div
                    key={jobId}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1B365D] truncate">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>{viewsCount.toLocaleString("vi-VN")} lượt xem</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          {appsCount} hồ sơ
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/recruiter/applications?jobId=${jobId}`}
                      className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 gap-1 shrink-0"
                    >
                      <span>Xem hồ sơ</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
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
                  <p className="text-xs text-slate-600 leading-relaxed">{action.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                <Link to={action.to} className="absolute inset-0" aria-label={action.title} />
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
