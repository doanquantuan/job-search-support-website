import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
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
import { formatDate } from "@/lib/utils";

export function ReportsManagementPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Action modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionStatus, setActionStatus] = useState("RESOLVED"); // 'RESOLVED' | 'DISMISSED'
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await apiClient.get("/job-reports", { params });
      const data = res.data?.data;

      if (data) {
        setReports(data.reports || data.data || []);
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
      console.error("Lỗi khi tải danh sách báo cáo vi phạm:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến Job Report Service qua API Gateway. Vui lòng kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Update Report Status
  const handleConfirmReportAction = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      const reportId = selectedReport.reportId || selectedReport.id;
      await apiClient.patch(`/job-reports/${reportId}/status`, {
        status: actionStatus,
        adminNote: adminNote.trim() || undefined,
      });

      setActionSuccess(`Đã xử lý báo cáo vi phạm thành công!`);

      // Update state
      setReports((prev) =>
        prev.map((r) =>
          (r.reportId || r.id) === reportId
            ? { ...r, status: actionStatus, adminNote: adminNote.trim() }
            : r
        )
      );

      setSelectedReport(null);
      setAdminNote("");
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái báo cáo!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xử lý báo cáo vi phạm</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xem xét và giải quyết các khiếu nại, tin tuyển dụng lừa đảo do ứng viên phản ánh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
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

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchReports} className="h-7 text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Trạng thái:</span>
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
              {[
                { key: "PENDING", label: "Chờ xử lý" },
                { key: "INVESTIGATING", label: "Đang kiểm tra" },
                { key: "RESOLVED", label: "Đã giải quyết" },
                { key: "DISMISSED", label: "Bác bỏ" },
                { key: "ALL", label: "Tất cả" },
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
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Danh sách khiếu nại ({pagination.total})
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
                <TableHead className="text-xs font-semibold">Tin bị khiếu nại</TableHead>
                <TableHead className="text-xs font-semibold">Lý do vi phạm</TableHead>
                <TableHead className="text-xs font-semibold">Mô tả chi tiết</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold">Thời gian</TableHead>
                <TableHead className="text-xs font-semibold text-right">Xử lý</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang nạp dữ liệu báo cáo từ Job Service...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Không có báo cáo vi phạm nào trong mục này.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((r) => {
                  const reportId = r.reportId || r.id;
                  const isPending = r.status === "PENDING";
                  const isResolved = r.status === "RESOLVED";

                  return (
                    <TableRow key={reportId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground max-w-xs line-clamp-1">
                          {r.jobPost?.title || `Tin ID: ${r.jobId?.slice(0, 8)}...`}
                        </div>
                        <a
                          href={`http://localhost:3000/jobs/${r.jobId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5"
                        >
                          <span>Mở bài đăng</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>

                      <TableCell>
                        <Badge variant="destructive" className="text-[10px]">
                          {r.reason}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground max-w-sm">
                        <p className="line-clamp-2">{r.description || "Không có mô tả kèm theo."}</p>
                        {r.adminNote && (
                          <p className="text-[11px] text-foreground font-medium mt-1">
                            Ghi chú Admin: {r.adminNote}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        {isPending ? (
                          <Badge variant="warning" className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" />
                            Chờ giải quyết
                          </Badge>
                        ) : isResolved ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã xử lý
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            {r.status}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDate(r.reportedAt || r.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        {isPending ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReport(r);
                              setActionStatus("RESOLVED");
                              setAdminNote("");
                            }}
                            className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                          >
                            Xử lý
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReport(r);
                              setActionStatus("DISMISSED");
                              setAdminNote(r.adminNote || "");
                            }}
                            className="h-7 text-xs text-muted-foreground"
                          >
                            Cập nhật lại
                          </Button>
                        )}
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
                Trang {pagination.page} / {pagination.totalPages} ({pagination.total} báo cáo)
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

      {/* Action Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Cập nhật kết quả xử lý báo cáo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Lý do: <span className="font-semibold text-foreground">{selectedReport.reason}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleConfirmReportAction}>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold block">Quyết định xử lý:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionStatus("RESOLVED")}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        actionStatus === "RESOLVED"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Xác nhận vi phạm (RESOLVED)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionStatus("DISMISSED")}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        actionStatus === "DISMISSED"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Bác bỏ khiếu nại (DISMISSED)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold block">Ghi chú của Admin:</label>
                  <textarea
                    placeholder="VD: Đã xác minh bài đăng vi phạm và gỡ bỏ / Bài đăng hợp lệ..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full min-h-[70px] p-2.5 text-xs rounded-md bg-muted/40 border border-border focus:ring-1 focus:ring-primary outline-hidden"
                  />
                </div>
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => setSelectedReport(null)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Lưu quyết định</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ReportsManagementPage;

