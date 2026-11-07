import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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

export function CompanyApprovalPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Action modals
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT'
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Viewing License Document
  const [licenseLoading, setLicenseLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Companies from Real Backend
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter !== "ALL") {
        params.verificationStatus = statusFilter;
      } else {
        params.verificationStatus = "ALL";
      }
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await apiClient.get("/companies", { params });
      const data = res.data?.data;

      if (data) {
        setCompanies(data.companies || data.data || []);
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
      console.error("Lỗi khi tải danh sách doanh nghiệp:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến Company Service qua API Gateway. Vui lòng kiểm tra backend."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Xem GPKD bằng Presigned URL
  const handleViewLicense = async (company) => {
    setLicenseLoading(true);
    try {
      const res = await apiClient.get(`/companies/${company.companyId || company.id}/license-url`);
      const presignedUrl = res.data?.data?.presignedUrl;
      if (presignedUrl) {
        window.open(presignedUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("Doanh nghiệp này chưa tải lên tài liệu GPKD.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Không thể tải đường dẫn xem tài liệu!");
    } finally {
      setLicenseLoading(false);
    }
  };

  // Submit Duyệt / Từ chối
  const handleConfirmVerification = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !actionType) return;

    if (actionType === "REJECT" && !rejectionReason.trim()) {
      alert("Vui lòng nêu rõ lý do từ chối hồ sơ!");
      return;
    }

    setSubmitting(true);
    try {
      const targetStatus = actionType === "APPROVE" ? "APPROVED" : "REJECTED";
      const payload = {
        status: targetStatus,
        rejectionReason: actionType === "REJECT" ? rejectionReason.trim() : undefined,
        adminNote: adminNote.trim() || undefined,
      };

      const res = await apiClient.patch(
        `/companies/${selectedCompany.companyId || selectedCompany.id}/verification`,
        payload
      );

      setActionSuccess(res.data?.message || `Thao tác thành công!`);

      // Update local state
      setCompanies((prev) =>
        prev.map((c) =>
          (c.companyId || c.id) === (selectedCompany.companyId || selectedCompany.id)
            ? { ...c, verificationStatus: targetStatus }
            : c
        )
      );

      // Close modal
      setSelectedCompany(null);
      setActionType(null);
      setRejectionReason("");
      setAdminNote("");

      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Thao tác phê duyệt thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thẩm duyệt doanh nghiệp</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thẩm định Giấy phép kinh doanh (GPKD) và cấp tick xanh xác thực cho nhà tuyển dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanies}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Success Toast */}
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
          <Button variant="outline" size="sm" onClick={fetchCompanies} className="h-7 text-xs">
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
                placeholder="Tìm kiếm theo tên công ty, mã số thuế, tỉnh thành..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Trạng thái:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
                {[
                  { key: "PENDING", label: "Chờ thẩm duyệt" },
                  { key: "APPROVED", label: "Đã duyệt (Tick xanh)" },
                  { key: "REJECTED", label: "Từ chối" },
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
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Danh sách hồ sơ ({pagination.total})
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Hiển thị trang {pagination.page} / {pagination.totalPages}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold">Doanh nghiệp</TableHead>
                <TableHead className="text-xs font-semibold">Mã số thuế</TableHead>
                <TableHead className="text-xs font-semibold">Quy mô & Địa điểm</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold">Giấy phép KD</TableHead>
                <TableHead className="text-xs font-semibold text-right">Quyết định</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang nạp dữ liệu từ Company Service...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Không có doanh nghiệp nào trong danh sách.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((c) => {
                  const compId = c.companyId || c.id;
                  const isApproved = c.verificationStatus === "APPROVED";
                  const isPending = c.verificationStatus === "PENDING";
                  const isRejected = c.verificationStatus === "REJECTED";

                  return (
                    <TableRow key={compId} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {c.logo ? (
                            <img
                              src={c.logo}
                              alt={c.companyName || c.name}
                              className="h-9 w-9 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border shrink-0">
                              <Building2 className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <span>{c.companyName || c.name}</span>
                              {isApproved && (
                                <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" title="Đã có tick xanh xác thực" />
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {c.industry || "Chưa cập nhật ngành nghề"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs font-mono font-medium">
                        {c.taxCode || "---"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        <div>{c.companySize || c.size || "1 - 50 nhân viên"}</div>
                        <div className="text-[11px] text-muted-foreground/80">{c.province || c.location || "Toàn quốc"}</div>
                      </TableCell>

                      <TableCell>
                        {isPending && (
                          <Badge variant="warning" className="text-[10px] gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Chờ thẩm duyệt
                          </Badge>
                        )}
                        {isApproved && (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Đã xác minh
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <XCircle className="h-3 w-3" />
                            Từ chối
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={licenseLoading}
                          onClick={() => handleViewLicense(c)}
                          className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5 font-medium"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Xem GPKD</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompany(c);
                                  setActionType("APPROVE");
                                  setAdminNote("");
                                }}
                                className="h-7 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Phê duyệt</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompany(c);
                                  setActionType("REJECT");
                                  setRejectionReason("");
                                }}
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Từ chối</span>
                              </Button>
                            </>
                          )}
                          {isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(c);
                                setActionType("REJECT");
                                setRejectionReason("");
                              }}
                              className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            >
                              Thu hồi xác minh
                            </Button>
                          )}
                          {isRejected && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(c);
                                setActionType("APPROVE");
                              }}
                              className="h-7 text-xs text-muted-foreground hover:text-emerald-600"
                            >
                              Xem xét lại
                            </Button>
                          )}
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
                Trang {pagination.page} / {pagination.totalPages} ({pagination.total} doanh nghiệp)
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

      {/* Modal Duyệt / Từ chối */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {actionType === "APPROVE" ? (
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <XCircle className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {actionType === "APPROVE" ? "Phê duyệt xác thực doanh nghiệp" : "Từ chối hồ sơ doanh nghiệp"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Công ty: <span className="font-semibold text-foreground">{selectedCompany.companyName || selectedCompany.name}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleConfirmVerification}>
              <CardContent className="space-y-3 pt-0">
                {actionType === "APPROVE" ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Khi được phê duyệt, doanh nghiệp sẽ nhận được **Tick xanh xác thực** uy tín và được phép đăng tin tuyển dụng không giới hạn.
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold block">Ghi chú nội bộ Admin (tùy chọn):</label>
                      <Input
                        placeholder="VD: Đã đối chiếu MST trên cổng Thuế quốc gia..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold block">
                        Lý do từ chối hồ sơ <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        required
                        placeholder="VD: Bản scan GPKD bị mờ, Mã số thuế không trùng khớp với tên doanh nghiệp..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full min-h-[80px] p-2.5 text-xs rounded-md bg-muted/40 border border-border focus:ring-1 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold block">Ghi chú nội bộ Admin (tùy chọn):</label>
                      <Input
                        placeholder="Ghi chú dành riêng cho ban quản trị..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => {
                    setSelectedCompany(null);
                    setActionType(null);
                  }}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  variant={actionType === "APPROVE" ? "default" : "destructive"}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{actionType === "APPROVE" ? "Xác nhận cấp Tick Xanh" : "Xác nhận từ chối"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CompanyApprovalPage;
