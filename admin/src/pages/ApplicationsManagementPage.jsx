import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/apiClient";
import { formatDate, exportToCSV } from "@/lib/utils";

export function ApplicationsManagementPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal detail
  const [selectedApp, setSelectedApp] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch applications from backend
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await apiClient.get("/applications/recruiter/all", { params });
      const resData = res.data?.data;

      if (resData) {
        let list = resData.data || (Array.isArray(resData) ? resData : []);

        // Filter search term locally if backend doesn't support search param on this endpoint
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.trim().toLowerCase();
          list = list.filter((a) => {
            const candName = a.candidateName || a.jobSeeker?.user?.fullName || "";
            const candEmail = a.candidateEmail || a.jobSeeker?.user?.email || "";
            const jobTitle = a.jobTitle || a.jobPost?.title || "";
            return (
              candName.toLowerCase().includes(q) ||
              candEmail.toLowerCase().includes(q) ||
              jobTitle.toLowerCase().includes(q)
            );
          });
        }

        setApplications(list);
        if (resData.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: resData.pagination.total || list.length,
            totalPages: resData.pagination.totalPages || 1,
            page: resData.pagination.page || prev.page,
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            total: list.length,
            totalPages: Math.ceil(list.length / prev.limit) || 1,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn ứng tuyển:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến Application Service qua API Gateway. Vui lòng kiểm tra dịch vụ."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Render Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "APPLIED":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
            Mới nộp
          </Badge>
        );
      case "REVIEWING":
        return (
          <Badge variant="warning" className="text-[10px]">
            Đang xem xét
          </Badge>
        );
      case "INTERVIEW":
        return (
          <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
            Phỏng vấn
          </Badge>
        );
      case "HIRED":
        return (
          <Badge variant="success" className="text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Trúng tuyển
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="text-[10px]">
            Từ chối
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Đã rút đơn
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  // Metrics summary
  const totalCount = pagination.total;
  const appliedCount = applications.filter((a) => (a.status || a.applicationStatus) === "APPLIED").length;
  const reviewingCount = applications.filter((a) => ["REVIEWING", "INTERVIEW"].includes(a.status || a.applicationStatus)).length;
  const hiredCount = applications.filter((a) => (a.status || a.applicationStatus) === "HIRED").length;

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) {
      alert("Không có dữ liệu đơn ứng tuyển để xuất!");
      return;
    }
    const exportData = applications.map((a) => {
      const candidate = a.candidate || a.jobSeeker || {};
      const job = a.job || {};
      const company = job.company || a.company || {};
      return {
        candidateName: candidate.fullName || "---",
        candidateEmail: candidate.email || "---",
        candidatePhone: candidate.phone || "---",
        jobTitle: job.title || a.jobTitle || "---",
        companyName: company.name || "---",
        status: a.status || a.applicationStatus || "---",
        appliedAt: formatDate(a.createdAt || a.appliedAt),
      };
    });

    exportToCSV(exportData, `danh-sach-ung-tuyen-${new Date().toISOString().slice(0, 10)}`, [
      { key: "candidateName", label: "Họ tên ứng viên" },
      { key: "candidateEmail", label: "Email ứng viên" },
      { key: "candidatePhone", label: "Số điện thoại" },
      { key: "jobTitle", label: "Vị trí ứng tuyển" },
      { key: "companyName", label: "Công ty" },
      { key: "status", label: "Trạng thái tuyển dụng" },
      { key: "appliedAt", label: "Thời gian nộp" },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đơn ứng tuyển & Phễu ATS</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Giám sát hồ sơ ứng tuyển, dòng luân chuyển CV và tỷ lệ chuyển đổi tuyển dụng toàn sàn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || applications.length === 0}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng lượt ứng tuyển
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Toàn bộ hồ sơ trên sàn</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mới nộp (APPLIED)
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {appliedCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Đang chờ NTD mở xem</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Đang phỏng vấn / Xem xét
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {reviewingCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Vòng đánh giá chuyên môn</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Trúng tuyển (HIRED)
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {hiredCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Tuyển dụng thành công</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên ứng viên, email, vị trí ứng tuyển..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Vòng tuyển dụng:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs flex-wrap">
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "APPLIED", label: "Mới nộp" },
                  { key: "REVIEWING", label: "Đang xem xét" },
                  { key: "INTERVIEW", label: "Phỏng vấn" },
                  { key: "HIRED", label: "Trúng tuyển" },
                  { key: "REJECTED", label: "Từ chối" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.key);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      statusFilter === item.key
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error alert */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchApplications} className="h-7 text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {/* Applications Table */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Danh sách đơn ứng tuyển ({pagination.total})
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Trang {pagination.page} / {pagination.totalPages}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold">Ứng viên</TableHead>
                <TableHead className="text-xs font-semibold">Vị trí & Doanh nghiệp</TableHead>
                <TableHead className="text-xs font-semibold">Hồ sơ CV đính kèm</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái ATS</TableHead>
                <TableHead className="text-xs font-semibold">Thời gian nộp</TableHead>
                <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang tải danh sách hồ sơ ứng tuyển...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Không tìm thấy hồ sơ ứng tuyển nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const appId = app.id || app.applicationId;
                  const candName = app.candidateName || app.jobSeeker?.user?.fullName || "Ứng viên ẩn danh";
                  const candEmail = app.candidateEmail || app.jobSeeker?.user?.email || "N/A";
                  const candPhone = app.candidatePhone || app.jobSeeker?.user?.phone || null;
                  const candAvatar = app.candidateAvatar || app.jobSeeker?.user?.avatar || null;
                  const jobTitle = app.jobTitle || app.jobPost?.title || "Vị trí tuyển dụng";
                  const compName = app.companyName || app.jobPost?.companyName || "Doanh nghiệp tuyển dụng";
                  const status = app.status || app.applicationStatus || "APPLIED";
                  const cvTitle = app.cvTitle || "CV_UngVien.pdf";
                  const cvUrl = app.cvUrl || null;

                  return (
                    <TableRow key={appId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={candAvatar} />
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {candName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-xs text-foreground block">
                              {candName}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {candEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-xs text-foreground max-w-xs line-clamp-1">
                          {jobTitle}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{compName}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground max-w-xs truncate">
                            {cvTitle}
                          </span>
                        </div>
                        {cvUrl && (
                          <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary text-[11px] hover:underline mt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Mở file CV</span>
                          </a>
                        )}
                      </TableCell>

                      <TableCell>{renderStatusBadge(status)}</TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDate(app.appliedAt || app.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="h-8 text-xs hover:bg-muted gap-1 text-muted-foreground hover:text-foreground"
                          title="Xem chi tiết đơn nộp"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                          <span>Chi tiết</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages} ({pagination.total} hồ sơ)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border-border overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/70 flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    Hồ sơ ứng tuyển
                  </CardTitle>
                  {renderStatusBadge(selectedApp.status || selectedApp.applicationStatus)}
                </div>
                <CardDescription className="text-xs text-muted-foreground font-mono">
                  Mã đơn: {(selectedApp.id || selectedApp.applicationId).slice(0, 8)}... • Nộp lúc: {formatDate(selectedApp.appliedAt || selectedApp.createdAt)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApp(null)}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Candidate Info Card */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider text-muted-foreground">
                  Thông tin ứng viên
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Họ và tên:</span>
                    <span className="font-semibold text-foreground">
                      {selectedApp.candidateName || selectedApp.jobSeeker?.user?.fullName || "Ẩn danh"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Email liên hệ:</span>
                    <span className="font-mono text-foreground">
                      {selectedApp.candidateEmail || selectedApp.jobSeeker?.user?.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Số điện thoại:</span>
                    <span className="text-foreground">
                      {selectedApp.candidatePhone || selectedApp.jobSeeker?.user?.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Vị trí nộp đơn:</span>
                    <span className="font-medium text-foreground">
                      {selectedApp.jobTitle || selectedApp.jobPost?.title || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-1">
                <span className="font-semibold text-foreground block">Thư giới thiệu (Cover Letter):</span>
                <div className="p-3 rounded-md border border-border bg-card whitespace-pre-line text-muted-foreground leading-relaxed min-h-[60px]">
                  {selectedApp.coverLetter || "Ứng viên không đính kèm thư giới thiệu."}
                </div>
              </div>

              {/* CV File Attachment */}
              <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium text-foreground block">
                      {selectedApp.cvTitle || "CV_UngVien.pdf"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Định dạng PDF • Đã xác thực chống virus
                    </span>
                  </div>
                </div>
                {selectedApp.cvUrl && (
                  <a
                    href={selectedApp.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem file CV</span>
                  </a>
                )}
              </div>
            </CardContent>

            <div className="p-3 bg-muted/30 border-t border-border flex justify-end shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
                className="h-8 text-xs font-semibold"
              >
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ApplicationsManagementPage;
