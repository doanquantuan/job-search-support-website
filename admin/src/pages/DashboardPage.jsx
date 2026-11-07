import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import apiClient from "@/lib/apiClient";
import { formatNumber, formatDate } from "@/lib/utils";

// Mock trend chart for visualization
const DEFAULT_CHART_DATA = [
  { month: "T5", applications: 120, jobs: 42 },
  { month: "T6", applications: 180, jobs: 55 },
  { month: "T7", applications: 240, jobs: 68 },
  { month: "T8", applications: 310, jobs: 89 },
  { month: "T9", applications: 420, jobs: 110 },
  { month: "T10", applications: 560, jobs: 135 },
];

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCompanies: 0,
    totalJobs: 0,
    totalReports: 0,
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes, jobsRes, reportsRes] = await Promise.allSettled([
        apiClient.get("/admin/users", { params: { limit: 1 } }),
        apiClient.get("/companies", { params: { verificationStatus: "PENDING", limit: 5 } }),
        apiClient.get("/jobs", { params: { limit: 1 } }),
        apiClient.get("/job-reports", { params: { limit: 1 } }),
      ]);

      const totalUsers =
        usersRes.status === "fulfilled"
          ? usersRes.value.data?.data?.pagination?.totalItems || 0
          : 0;

      const compData =
        companiesRes.status === "fulfilled" ? companiesRes.value.data?.data : null;
      const pendingCompaniesCount = compData?.pagination?.total || 0;
      const pendingList = compData?.companies || compData?.data || [];

      const totalJobs =
        jobsRes.status === "fulfilled"
          ? jobsRes.value.data?.data?.pagination?.total || 0
          : 0;

      const totalReports =
        reportsRes.status === "fulfilled"
          ? reportsRes.value.data?.data?.pagination?.total || reportsRes.value.data?.data?.total || 0
          : 0;

      setStats({
        totalUsers,
        pendingCompanies: pendingCompaniesCount,
        totalJobs,
        totalReports,
      });

      setPendingCompanies(pendingList);
    } catch (err) {
      console.warn("Lỗi nạp dữ liệu Dashboard từ backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Approve on Dashboard
  const handleQuickApprove = async (companyId, companyName) => {
    try {
      await apiClient.patch(`/companies/${companyId}/verification`, {
        status: "APPROVED",
        adminNote: "Phê duyệt nhanh từ màn hình Dashboard",
      });

      setActionSuccess(`Đã duyệt xác thực thành công cho ${companyName}!`);
      setPendingCompanies((prev) =>
        prev.filter((c) => (c.companyId || c.id) !== companyId)
      );
      setStats((prev) => ({
        ...prev,
        pendingCompanies: Math.max(0, prev.pendingCompanies - 1),
      }));

      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể phê duyệt doanh nghiệp!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan quản trị</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dữ liệu thống kê thời gian thực từ API Gateway và các dịch vụ vi mô
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Cập nhật số liệu</span>
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-semibold shadow-xs">
            <Link to="/companies">
              <FileCheck className="h-4 w-4" />
              <span>Duyệt hồ sơ GPKD ({stats.pendingCompanies})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng người dùng
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {loading ? "..." : formatNumber(stats.totalUsers)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Thời gian thực
              </span>
              <span>từ User Service</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Verification */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Doanh nghiệp chờ duyệt
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {loading ? "..." : formatNumber(stats.pendingCompanies)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Hồ sơ GPKD đang chờ thẩm định</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Jobs */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tin tuyển dụng
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {loading ? "..." : formatNumber(stats.totalJobs)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Từ Job Service
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Violations / Reports */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Báo cáo vi phạm
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-destructive">
              {loading ? "..." : formatNumber(stats.totalReports)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <span>Tin tuyển dụng bị người dùng báo cáo</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Chart + Pending Approvals */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Growth Chart */}
        <Card className="shadow-xs border-border/80 lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Tăng trưởng ứng tuyển & Tin tuyển dụng</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Thống kê số lượt nộp CV và số việc làm mới trong 6 tháng gần nhất
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono">
                6 Tháng
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEFAULT_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Lượt ứng tuyển"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="jobs"
                    name="Việc làm mới"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorJobs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Companies Table */}
        <Card className="shadow-xs border-border/80 lg:col-span-3">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Doanh nghiệp vừa nộp hồ sơ</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Các doanh nghiệp đang chờ duyệt giấy phép
              </CardDescription>
            </div>
            <Link to="/companies" className="text-xs text-primary hover:underline font-medium">
              Xem tất cả ({stats.pendingCompanies})
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold">Doanh nghiệp</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Duyệt nhanh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-primary" />
                      Đang tải danh sách chờ duyệt...
                    </TableCell>
                  </TableRow>
                ) : pendingCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center text-xs text-muted-foreground">
                      <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-500" />
                      Hiện tại không có hồ sơ nào chờ duyệt!
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingCompanies.map((c) => {
                    const compId = c.companyId || c.id;
                    const compName = c.companyName || c.name;
                    return (
                      <TableRow key={compId} className="hover:bg-muted/20">
                        <TableCell className="py-3">
                          <div className="font-semibold text-xs text-foreground max-w-[200px] truncate">
                            {compName}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="font-mono">MST: {c.taxCode || "---"}</span>
                            <span>•</span>
                            <span>{c.province || c.location || "Việt Nam"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickApprove(compId, compName)}
                            className="h-7 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Duyệt</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
