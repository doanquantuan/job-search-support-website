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
import { formatDate, formatNumber } from "@/lib/utils";

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
                          <a
                            href={`http://localhost:3000/jobs/${jobId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Xem trên trang Client"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJob(j)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            title="Gỡ bỏ bài đăng vi phạm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Gỡ tin</span>
                          </Button>
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
                    Thao tác này sẽ gỡ bỏ bài đăng khỏi nền tảng JobLink.
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
    </div>
  );
}

export default JobsManagementPage;
