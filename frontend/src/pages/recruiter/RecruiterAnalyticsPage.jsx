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
  Loader2,
} from "lucide-react";
import applicationApi from "@/features/job/services/applicationApi";
import { FilterTabs } from "@/components/common/FilterTabs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/store/useToastStore";

const TIME_RANGES = [
  { id: "7d", label: "7 ngày qua" },
  { id: "30d", label: "30 ngày qua" },
  { id: "quarter", label: "Quý này" },
  { id: "year", label: "Năm nay" },
];

export const RecruiterAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await applicationApi.getRecruiterAnalytics({ timeRange });
        if (isMounted && res) {
          setAnalyticsData(res);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thống kê tuyển dụng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const currentKpis = analyticsData?.kpis || {
    views: 0,
    viewsGrowth: "+0%",
    applications: 0,
    applicationsGrowth: "+0%",
    conversionRate: "0.0%",
    conversionGrowth: "+0.0%",
    hired: 0,
    hiredGrowth: "+0",
  };

  const chartData = analyticsData?.chart || [];
  const maxAppsInChart = Math.max(...chartData.map((d) => d.apps), 1);

  const funnelData = analyticsData?.funnel || [
    { stage: "APPLIED", label: "1. Hồ sơ mới nộp (Applied)", count: 0, pct: 0, color: "bg-sky-500" },
    { stage: "VIEWED", label: "2. Đã xem xét / Thẩm định (Viewed)", count: 0, pct: 0, color: "bg-indigo-500" },
    { stage: "REVIEWING", label: "3. Đang đánh giá chuyên môn (Reviewing)", count: 0, pct: 0, color: "bg-purple-500" },
    { stage: "INTERVIEW", label: "4. Mời phỏng vấn (Interview)", count: 0, pct: 0, color: "bg-amber-500" },
    { stage: "HIRED", label: "5. Trúng tuyển chính thức (Hired)", count: 0, pct: 0, color: "bg-emerald-500" },
  ];

  const insightText = analyticsData?.insight || "Chưa có đủ dữ liệu để đưa ra phân tích hiệu suất tuyển dụng.";
  const jobPerformances = analyticsData?.jobPerformances || [];

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = "Mã tin,Tiêu đề,Ngành nghề,Lượt xem,Lượt nộp,Tỷ lệ chuyển đổi,Trạng thái,Đánh giá\n";
      const rows = jobPerformances
        .map(
          (j) =>
            `"${j.id}","${j.title}","${j.industry}",${j.views},${j.apps},"${j.convRate}%","${j.status}","${j.rating}"`
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
        `BaoCao_TuyenDung_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
      toast.success(
        "Xuất báo cáo thành công",
        "File CSV đã được tải xuống máy tính của bạn."
      );
    }, 400);
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
            disabled={exporting || jobPerformances.length === 0}
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
          {loading ? (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang cập nhật số liệu...</span>
            </span>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} hôm nay</span>
            </>
          )}
        </div>
      </div>

      {/* ── 4 Top KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div
          className="bg-base-100 rounded-xl p-5 border border-base-300 shadow-2xs space-y-3"
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
              {currentKpis.views.toLocaleString("vi-VN")}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentKpis.viewsGrowth}</span>
              <span>so với kỳ trước</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div
          className="bg-base-100 rounded-xl p-5 border border-base-300 shadow-2xs space-y-3"
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
              {currentKpis.applications}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentKpis.applicationsGrowth}</span>
              <span>so với kỳ trước</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div
          className="bg-base-100 rounded-xl p-5 border border-base-300 shadow-2xs space-y-3"
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
              {currentKpis.conversionRate}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentKpis.conversionGrowth}</span>
              <span>tỷ lệ click nộp</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div
          className="bg-base-100 rounded-xl p-5 border border-base-300 shadow-2xs space-y-3"
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
              {currentKpis.hired}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold">{currentKpis.hiredGrowth}</span>
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
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                Chưa có dữ liệu biểu đồ
              </div>
            ) : (
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                {chartData.map((item, idx) => {
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
                          className="w-full max-w-[42px] bg-[#005A9C] rounded-t-md group-hover:bg-[#1B365D] transition-colors"
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
            )}
          </div>
        </div>

        {/* Phễu tỷ lệ chuyển đổi tuyển dụng (5 Cols) */}
        <div className="lg:col-span-5 bg-base-100 rounded-2xl p-5 sm:p-6 border border-base-300 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#1B365D]">
              Phễu tuyển dụng & Tỷ lệ qua các vòng
            </h3>
            <p className="text-xs text-slate-500">
              Tỷ lệ duy trì hồ sơ ứng viên qua từng bước tuyển dụng thực tế
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {funnelData.map((step) => (
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
            <p>{insightText}</p>
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
          {jobPerformances.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Chưa có dữ liệu tin tuyển dụng nào được ghi nhận.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAnalyticsPage;
