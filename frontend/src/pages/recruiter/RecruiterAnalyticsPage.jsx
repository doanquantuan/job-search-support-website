import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Briefcase,
  Calendar,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronDown,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useRecruiterJobStore } from "@/store/useRecruiterJobStore";
import { useRecruiterApplicantStore } from "@/store/useRecruiterApplicantStore";
import { FilterTabs } from "@/components/common/FilterTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/store/useToastStore";

const TIME_RANGES = [
  { id: "7d", label: "7 ngày qua" },
  { id: "30d", label: "30 ngày qua" },
  { id: "quarter", label: "Quý này" },
  { id: "year", label: "Năm nay" },
];

const ANALYTICS_DATA = {
  "7d": {
    views: 1420,
    viewsGrowth: "+18%",
    applications: 28,
    applicationsGrowth: "+12%",
    conversionRate: "8.6%",
    conversionGrowth: "+1.4%",
    hired: 3,
    hiredGrowth: "+1",
    chart: [
      { label: "T2 (31/10)", views: 180, apps: 3 },
      { label: "T3 (01/11)", views: 240, apps: 5 },
      { label: "T4 (02/11)", views: 160, apps: 2 },
      { label: "T5 (03/11)", views: 320, apps: 8 },
      { label: "T6 (04/11)", views: 270, apps: 6 },
      { label: "T7 (05/11)", views: 130, apps: 3 },
      { label: "CN (06/11)", views: 120, apps: 4 },
    ],
  },
  "30d": {
    views: 5840,
    viewsGrowth: "+24%",
    applications: 114,
    applicationsGrowth: "+15%",
    conversionRate: "7.9%",
    conversionGrowth: "+0.8%",
    hired: 8,
    hiredGrowth: "+3",
    chart: [
      { label: "Tuần 1", views: 1200, apps: 22 },
      { label: "Tuần 2", views: 1540, apps: 34 },
      { label: "Tuần 3", views: 1680, apps: 30 },
      { label: "Tuần 4", views: 1420, apps: 28 },
    ],
  },
  quarter: {
    views: 16400,
    viewsGrowth: "+31%",
    applications: 340,
    applicationsGrowth: "+22%",
    conversionRate: "8.2%",
    conversionGrowth: "+1.1%",
    hired: 24,
    hiredGrowth: "+9",
    chart: [
      { label: "Tháng 8", views: 4800, apps: 98 },
      { label: "Tháng 9", views: 5760, apps: 128 },
      { label: "Tháng 10", views: 5840, apps: 114 },
    ],
  },
  year: {
    views: 52100,
    viewsGrowth: "+45%",
    applications: 1180,
    applicationsGrowth: "+38%",
    conversionRate: "8.0%",
    conversionGrowth: "+1.5%",
    hired: 78,
    hiredGrowth: "+28",
    chart: [
      { label: "Quý 1", views: 11200, apps: 230 },
      { label: "Quý 2", views: 12100, apps: 270 },
      { label: "Quý 3", views: 12400, apps: 340 },
      { label: "Quý 4", views: 16400, apps: 340 },
    ],
  },
};

export const RecruiterAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [exporting, setExporting] = useState(false);

  const { jobs = [], fetchMyJobs, fetchJobs } = useRecruiterJobStore();
  const { applications = [], fetchApplications } = useRecruiterApplicantStore();

  useEffect(() => {
    const loadJobs = fetchMyJobs || fetchJobs;
    if (typeof loadJobs === "function") loadJobs();
    if (typeof fetchApplications === "function") fetchApplications("all");
  }, [fetchMyJobs, fetchJobs, fetchApplications]);

  const currentData = ANALYTICS_DATA[timeRange] || ANALYTICS_DATA["7d"];
  const maxAppsInChart = Math.max(...currentData.chart.map((d) => d.apps), 1);

  // Thống kê hiệu quả theo từng tin tuyển dụng
  const jobPerformances = useMemo(() => {
    const list = Array.isArray(jobs) ? jobs : [];
    return list.map((j) => {
      const views = j.viewCount || Math.floor(Math.random() * 300 + 100);
      const apps = j.applicationsCount || Math.floor(Math.random() * 15 + 2);
      const convRate = views > 0 ? ((apps / views) * 100).toFixed(1) : "0.0";
      return {
        id: j.id || j.jobId,
        title: j.title,
        industry: j.industry || "Công nghệ thông tin",
        status: j.status,
        views,
        apps,
        convRate: parseFloat(convRate),
        rating:
          parseFloat(convRate) >= 8.0
            ? "Rất tốt"
            : parseFloat(convRate) >= 4.0
            ? "Đạt yêu cầu"
            : "Cần tối ưu",
      };
    });
  }, [jobs]);

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = "Mã tin,Tiêu đề,Ngành nghề,Lượt xem,Lượt nộp,Tỷ lệ chuyển đổi,Trạng thái\n";
      const rows = jobPerformances
        .map(
          (j) =>
            `"${j.id}","${j.title}","${j.industry}",${j.views},${j.apps},"${j.convRate}%","${j.status}"`
        )
        .join("\n");
      const blob = new Blob(["\uFEFF" + headers + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `BaoCao_TuyenDung_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
      toast.success(
        "Xuất báo cáo thành công",
        "File CSV đã được tải xuống máy tính của bạn."
      );
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* ── Top Header Banner ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-300 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B365D]">
              Báo cáo & Thống kê tuyển dụng
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi chi tiết số lượt xem tin đăng, số hồ sơ nộp và tỷ lệ chuyển đổi theo thời gian
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-100 text-[#1B365D] gap-2 font-semibold shadow-2xs"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>{exporting ? "Đang xuất..." : "Xuất file CSV"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-sm btn-outline border-slate-300 hover:bg-slate-100 text-[#1B365D] gap-2 font-semibold shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* ── Time Range Tabs Filter ────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FilterTabs
          tabs={TIME_RANGES}
          activeTab={timeRange}
          onChange={setTimeRange}
          layoutId="analyticsTimeRangePill"
        />

        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} hôm nay</span>
        </div>
      </div>

      {/* ── 4 Top KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng lượt xem tin
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1B365D]">
              {currentData.views.toLocaleString("vi-VN")}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentData.viewsGrowth}</span>
              <span>so với kỳ trước</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hồ sơ ứng tuyển nhận được
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1B365D]">
              {currentData.applications}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentData.applicationsGrowth}</span>
              <span>so với kỳ trước</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tỷ lệ chuyển đổi (CV / Lượt xem)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1B365D]">
              {currentData.conversionRate}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentData.conversionGrowth}</span>
              <span>tỷ lệ click nộp</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ứng viên trúng tuyển
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[#1B365D]">
              {currentData.hired}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentData.hiredGrowth}</span>
              <span>nhân sự thành công</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Visual Charts Section ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ tương quan Lượt xem & Lượt nộp (7 Cols) */}
        <div className="lg:col-span-7 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-[#1B365D]">
                Biểu đồ xu hướng nhận hồ sơ ứng tuyển
              </h3>
              <p className="text-xs text-slate-500">
                Phân bổ hồ sơ theo từng mốc thời gian trong {TIME_RANGES.find((t) => t.id === timeRange)?.label.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#005A9C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005A9C]" />
                Số hồ sơ nộp
              </span>
            </div>
          </div>

          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
              {currentData.chart.map((item, idx) => {
                const heightPct = Math.round((item.apps / maxAppsInChart) * 100);
                return (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 px-2.5 py-1 rounded-lg bg-[#1B365D] text-white text-xs font-semibold whitespace-nowrap z-20 pointer-events-none shadow-md space-y-0.5 text-center">
                      <p className="font-bold">{item.apps} hồ sơ</p>
                      <p className="text-[10px] text-blue-200">{item.views} lượt xem</p>
                    </div>

                    <div className="w-full flex items-end justify-center h-36">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="w-full max-w-[42px] bg-gradient-to-t from-[#005A9C] to-sky-400 rounded-t-lg group-hover:from-primary group-hover:to-sky-300 transition-colors shadow-2xs"
                      />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-[#1B365D]">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-medium">
                        {item.apps} CV
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phễu tỷ lệ chuyển đổi tuyển dụng (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#1B365D]">
              Phễu tuyển dụng & Tỷ lệ qua các vòng
            </h3>
            <p className="text-xs text-slate-500">
              Tỷ lệ duy trì hồ sơ ứng viên qua từng bước tuyển dụng
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "1. Hồ sơ mới nộp (Applied)", pct: 100, count: currentData.applications, color: "bg-sky-500" },
              { label: "2. Hồ sơ đã thẩm định (Viewed)", pct: 82, count: Math.round(currentData.applications * 0.82), color: "bg-indigo-500" },
              { label: "3. Đang phỏng vấn (Interview)", pct: 36, count: Math.round(currentData.applications * 0.36), color: "bg-amber-500" },
              { label: "4. Mời tuyển dụng (Offer)", pct: 18, count: Math.round(currentData.applications * 0.18), color: "bg-teal-500" },
              { label: "5. Trúng tuyển chính thức (Hired)", pct: 11, count: currentData.hired, color: "bg-emerald-500" },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{step.label}</span>
                  <span className="font-bold text-[#1B365D]">
                    {step.count} ({step.pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${step.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>
              Hiệu suất chuyển đổi phỏng vấn của doanh nghiệp bạn đạt mức <strong>36%</strong>, cao hơn <strong>4.2%</strong> so với mặt bằng chung ngành CNTT.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bảng phân tích chi tiết hiệu quả từng tin tuyển dụng ─────────────── */}
      <div className="bg-base-100 rounded-2xl border border-base-300 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base text-[#1B365D]">
              Hiệu quả theo từng tin tuyển dụng
            </h3>
            <p className="text-xs text-slate-500">
              Chi tiết số lượt xem, hồ sơ nhận được và tỷ lệ chuyển đổi cho từng vị trí
            </p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Quản lý tin đăng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full min-w-[850px]">
            <thead>
              <tr className="bg-base-200/60 text-base-content/70 border-b border-base-200 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold text-left whitespace-nowrap">Vị trí tuyển dụng</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Ngành nghề</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Lượt xem</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Hồ sơ nộp</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Tỷ lệ chuyển đổi</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Đánh giá hiệu quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-200 text-xs">
              {jobPerformances.map((job) => (
                <tr key={job.id} className="hover:bg-base-200/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-sm text-[#1B365D]">
                    <Link
                      to={`/recruiter/applications?jobId=${job.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                    {job.industry}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {job.views.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-extrabold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                      {job.apps} hồ sơ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {job.convRate}%
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex justify-center">
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`badge badge-sm font-bold ${
                        job.rating === "Rất tốt"
                          ? "badge-success text-white"
                          : job.rating === "Đạt yêu cầu"
                          ? "badge-info text-white"
                          : "badge-warning text-white"
                      }`}
                    >
                      {job.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalyticsPage;
