import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Power,
  Building2,
  Clock,
  GraduationCap,
  Users,
  Check,
  XCircle,
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
import apiClient from "@/lib/apiClient";
import { formatDate, formatNumber, exportToCSV } from "@/lib/utils";

export function JobsManagementPage() {
  const [jobs, setJobs] = useState([]);
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

  // Action states (Gỡ tin)
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Preview Job Modal state
  const [previewJob, setPreviewJob] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handlePreviewJob = async (job) => {
    setPreviewJob(job);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const jobId = job.id || job.jobId;
      const res = await apiClient.get(`/jobs/${jobId}`);
      setPreviewData(res.data?.data || null);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết tin tuyển dụng:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle Toggle Job Status (PUBLISHED <-> CLOSED)
  const handleToggleJobStatus = async (job, newStatus) => {
    try {
      const jobId = job.id || job.jobId;
      await apiClient.patch(`/jobs/${jobId}/status`, { status: newStatus });
      setJobs((prev) =>
        prev.map((item) =>
          (item.id || item.jobId) === jobId ? { ...item, status: newStatus } : item
        )
      );
      if (previewData && (previewData.id || previewData.jobId) === jobId) {
        setPreviewData((prev) => ({ ...prev, status: newStatus }));
      }
      setActionSuccess(
        newStatus === "CLOSED"
          ? `Đã tạm đóng nhận hồ sơ cho tin "${job.title}"`
          : `Đã mở lại bài đăng tuyển dụng "${job.title}"`
      );
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái tin tuyển dụng!");
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Jobs from Real Backend
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (debouncedSearch.trim()) params.keyword = debouncedSearch.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await apiClient.get("/jobs", { params });
      const data = res.data?.data;

      if (data) {
        setJobs(data.jobs || []);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || 1,
            page: data.pagination.page || prev.page,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tin tuyển dụng:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến Job Service qua API Gateway. Vui lòng kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle Remove Job (Gỡ bỏ tin vi phạm)
  const handleConfirmDeleteJob = async () => {
    if (!selectedJob) return;

    setSubmitting(true);
    try {
      const jobId = selectedJob.id || selectedJob.jobId;
      await apiClient.delete(`/jobs/${jobId}`);

      setActionSuccess(`Đã gỡ bỏ bài đăng tuyển dụng "${selectedJob.title}" thành công!`);

      // Update state
      setJobs((prev) => prev.filter((j) => (j.id || j.jobId) !== jobId));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));

      setSelectedJob(null);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Gỡ bài tuyển dụng thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSalary = (job) => {
    if (job.salaryType === "NEGOTIABLE" || !job.salaryMin) {
      return "Thỏa thuận";
    }
    if (job.salaryType === "EXACT") {
      return `${formatNumber(job.salaryMin)} VNĐ`;
    }
    return `${formatNumber(job.salaryMin)} - ${formatNumber(job.salaryMax)} VNĐ`;
  };

  const handleExportCSV = () => {
    if (!jobs || jobs.length === 0) {
      alert("Không có dữ liệu việc làm để xuất!");
      return;
    }
    const exportData = jobs.map((j) => ({
      title: j.title || "---",
      companyName: j.company?.name || j.companyName || "---",
      location: j.workLocation || j.province || j.city || "---",
      salary: renderSalary(j),
      jobType: j.jobType || "---",
      experienceLevel: j.experienceLevel || "---",
      status: j.status === "PUBLISHED" ? "Đang hiển thị" : j.status === "CLOSED" ? "Đã đóng" : j.status,
      createdAt: formatDate(j.createdAt),
    }));

    exportToCSV(exportData, `danh-sach-viec-lam-${new Date().toISOString().slice(0, 10)}`, [
      { key: "title", label: "Tiêu đề việc làm" },
      { key: "companyName", label: "Công ty" },
      { key: "location", label: "Địa điểm" },
      { key: "salary", label: "Mức lương" },
      { key: "jobType", label: "Hình thức làm việc" },
      { key: "experienceLevel", label: "Kinh nghiệm" },
      { key: "status", label: "Trạng thái" },
      { key: "createdAt", label: "Ngày đăng" },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý việc làm</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kiểm duyệt tin đăng tuyển, gỡ bỏ các bài đăng có dấu hiệu vi phạm hoặc spam
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || jobs.length === 0}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchJobs}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
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

      {/* Error Notification */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} className="h-7 text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {/* Filter and Search */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tiêu đề tin, kỹ năng, quyền lợi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Trạng thái:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "PUBLISHED", label: "Đang bật" },
                  { key: "DRAFT", label: "Bản nháp" },
                  { key: "CLOSED", label: "Đã đóng" },
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

      {/* Jobs Table */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Danh sách việc làm ({pagination.total})
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
                <TableHead className="text-xs font-semibold">Tin tuyển dụng</TableHead>
                <TableHead className="text-xs font-semibold">Doanh nghiệp</TableHead>
                <TableHead className="text-xs font-semibold">Địa điểm & Mức lương</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold">Ngày đăng</TableHead>
                <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang nạp dữ liệu từ Job Service...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Không tìm thấy tin tuyển dụng nào.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((j) => {
                  const jobId = j.id || j.jobId;
                  const isPublished = j.status === "PUBLISHED" || j.status === "ACTIVE";

                  return (
                    <TableRow key={jobId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground max-w-sm line-clamp-1">
                          {j.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          ID: <span className="font-mono">{jobId.slice(0, 8)}...</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-foreground font-medium">
                        {j.companyName || j.company?.companyName || "Chưa gắn công ty"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <DollarSign className="h-3 w-3" />
                          <span>{renderSalary(j)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span>{j.province || "Toàn quốc"}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isPublished ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Đang mở
                          </Badge>
                        ) : j.status === "DRAFT" ? (
                          <Badge variant="outline" className="text-[10px]">
                            Bản nháp
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            {j.status}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDate(j.createdAt || j.publishedAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewJob(j)}
                            className="h-8 text-xs hover:bg-muted gap-1 text-muted-foreground hover:text-foreground"
                            title="Xem nhanh chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Xem</span>
                          </Button>

                          {isPublished ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleJobStatus(j, "CLOSED")}
                              className="h-8 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1"
                              title="Tạm đóng nhận hồ sơ"
                            >
                              <Power className="h-3.5 w-3.5" />
                              <span>Đóng</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleJobStatus(j, "PUBLISHED")}
                              className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                              title="Mở lại tin tuyển dụng"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Mở</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJob(j)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            title="Gỡ bỏ bài đăng vi phạm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Gỡ</span>
                          </Button>

                          <a
                            href={`http://localhost:3000/jobs/${jobId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Xem trên trang Client"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
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
                Trang {pagination.page} / {pagination.totalPages} ({pagination.total} việc làm)
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

      {/* Delete Confirmation Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Xác nhận gỡ tin tuyển dụng
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Thao tác này sẽ gỡ bỏ bài đăng khỏi nền tảng Jobloria.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-xs">
              <p className="text-muted-foreground">
                Bài đăng: <span className="font-semibold text-foreground">{selectedJob.title}</span>
              </p>
              <p className="text-muted-foreground">
                Doanh nghiệp: <span className="font-semibold text-foreground">{selectedJob.companyName || "N/A"}</span>
              </p>
              <p className="text-destructive text-[11px] font-medium pt-1">
                Lưu ý: Hành động xóa sẽ gỡ bỏ hoàn toàn tin đăng khỏi kết quả tìm kiếm của ứng viên.
              </p>
            </CardContent>
            <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => setSelectedJob(null)}
                className="h-8 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={submitting}
                variant="destructive"
                onClick={handleConfirmDeleteJob}
                className="h-8 text-xs font-semibold gap-1.5"
              >
                {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Xác nhận gỡ bỏ</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Job Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-border overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/70 flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    {previewJob.title}
                  </CardTitle>
                  {previewJob.status === "PUBLISHED" ? (
                    <Badge variant="success" className="text-[10px]">Đang mở</Badge>
                  ) : previewJob.status === "CLOSED" ? (
                    <Badge variant="secondary" className="text-[10px]">Đã đóng</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">{previewJob.status}</Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {previewJob.companyName || "N/A"}
                  </span>
                  <span>•</span>
                  <span>ID: <code className="font-mono text-[11px]">{(previewJob.id || previewJob.jobId).slice(0, 8)}...</code></span>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewJob(null)}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </CardHeader>

            <CardContent className="p-4 overflow-y-auto space-y-4 text-xs">
              {previewLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span>Đang nạp chi tiết bài đăng...</span>
                </div>
              ) : (
                <>
                  {/* Key Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Mức lương:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {renderSalary(previewData || previewJob)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Địa điểm:</span>
                      <span className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {previewData?.province || previewJob.province || "Toàn quốc"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Kinh nghiệm:</span>
                      <span className="font-medium text-foreground mt-0.5 block">
                        {previewData?.experience || previewJob.experience || "Không yêu cầu"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Hạn nộp hồ sơ:</span>
                      <span className="font-medium text-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(previewData?.deadline || previewJob.deadline)}
                      </span>
                    </div>
                  </div>

                  {/* Skills badges */}
                  {previewData?.skills && previewData.skills.length > 0 && (
                    <div>
                      <span className="font-semibold text-foreground block mb-1.5">Kỹ năng yêu cầu:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {previewData.skills.map((s, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {typeof s === "string" ? s : s.skillName || s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {previewData?.description && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">Mô tả công việc:</span>
                      <div className="p-3 rounded-md border border-border bg-card whitespace-pre-line text-muted-foreground leading-relaxed">
                        {previewData.description}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {previewData?.requirements && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">Yêu cầu ứng viên:</span>
                      <div className="p-3 rounded-md border border-border bg-card whitespace-pre-line text-muted-foreground leading-relaxed">
                        {previewData.requirements}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {previewData?.benefits && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground block">Quyền lợi được hưởng:</span>
                      <div className="p-3 rounded-md border border-border bg-card whitespace-pre-line text-muted-foreground leading-relaxed">
                        {previewData.benefits}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewJob(null)}
                className="h-8 text-xs"
              >
                Đóng
              </Button>
              <div className="flex items-center gap-2">
                <a
                  href={`http://localhost:3000/jobs/${previewJob.id || previewJob.jobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Mở trên Client</span>
                </a>

                {previewJob.status === "PUBLISHED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handleToggleJobStatus(previewJob, "CLOSED");
                      setPreviewJob((prev) => ({ ...prev, status: "CLOSED" }));
                    }}
                    className="h-8 text-xs text-amber-600 dark:text-amber-400 gap-1"
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>Đóng nhận hồ sơ</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleToggleJobStatus(previewJob, "PUBLISHED");
                      setPreviewJob((prev) => ({ ...prev, status: "PUBLISHED" }));
                    }}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mở lại tin</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const j = previewJob;
                    setPreviewJob(null);
                    setSelectedJob(j);
                  }}
                  className="h-8 text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Gỡ tin</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default JobsManagementPage;
