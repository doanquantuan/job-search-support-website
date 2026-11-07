import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
import { formatDate } from "@/lib/utils";

export function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Action states (Khóa/Mở khóa)
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null); // 'BLOCK' | 'UNBLOCK'
  const [blockReason, setBlockReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Users from Real Backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await apiClient.get("/admin/users", { params });
      const responseData = res.data?.data;

      if (responseData) {
        setUsers(responseData.data || []);
        if (responseData.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalItems: responseData.pagination.totalItems || 0,
            totalPages: responseData.pagination.totalPages || 1,
            page: responseData.pagination.currentPage || prev.page,
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến máy chủ User Service qua API Gateway. Vui lòng kiểm tra dịch vụ."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle status update (Khóa / Mở khóa)
  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedUser || !actionType) return;

    if (actionType === "BLOCK" && !blockReason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản!");
      return;
    }

    setSubmitting(true);
    try {
      const newStatus = actionType === "BLOCK" ? "BLOCKED" : "ACTIVE";
      const payload = {
        status: newStatus,
        reason: actionType === "BLOCK" ? blockReason.trim() : undefined,
      };

      const res = await apiClient.patch(`/admin/users/${selectedUser.id}/status`, payload);

      setActionMessage({
        type: "success",
        text: res.data?.message || `Đã ${actionType === "BLOCK" ? "khóa" : "mở khóa"} người dùng thành công!`,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: newStatus, blockReason: payload.reason }
            : u
        )
      );

      // Close modal
      setSelectedUser(null);
      setActionType(null);
      setBlockReason("");

      // Clear toast after 3s
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Thao tác thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dữ liệu thời gian thực từ cơ sở dữ liệu User Service & Auth Service
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="h-7 text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo họ tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Vai trò:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "JOB_SEEKER", label: "Ứng viên" },
                  { key: "RECRUITER", label: "Nhà tuyển dụng" },
                  { key: "ADMIN", label: "Quản trị" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setRoleFilter(item.key);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      roleFilter === item.key
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Trạng thái:</span>
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "ACTIVE", label: "Hoạt động" },
                  { key: "BLOCKED", label: "Đã khóa" },
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
                        ? "bg-background text-foreground shadow-xs"
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

      {/* Users Table */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Danh sách tài khoản ({pagination.totalItems})
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
                <TableHead className="text-xs font-semibold">Người dùng</TableHead>
                <TableHead className="text-xs font-semibold">Vai trò</TableHead>
                <TableHead className="text-xs font-semibold">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold">Xác thực</TableHead>
                <TableHead className="text-xs font-semibold">Ngày tham gia</TableHead>
                <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang nạp dữ liệu từ User Service...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-lg border border-border">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback className="rounded-lg text-[10px] font-semibold bg-primary/10 text-primary">
                            {u.fullName?.slice(0, 2).toUpperCase() || "US"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {u.role === "ADMIN" && (
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          Quản trị viên
                        </Badge>
                      )}
                      {u.role === "RECRUITER" && (
                        <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                          Nhà tuyển dụng
                        </Badge>
                      )}
                      {u.role === "JOB_SEEKER" && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Ứng viên
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {u.status === "ACTIVE" ? (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </Badge>
                      ) : (
                        <div className="space-y-0.5">
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <Lock className="h-3 w-3" />
                            Đã khóa
                          </Badge>
                          {u.blockReason && (
                            <p className="text-[10px] text-destructive/80 italic max-w-[160px] truncate" title={u.blockReason}>
                              Lý do: {u.blockReason}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                          Chưa
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(u.createdAt)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {u.role !== "ADMIN" && (
                        u.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setActionType("BLOCK");
                              setBlockReason("");
                            }}
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            <span>Khóa</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setActionType("UNBLOCK");
                            }}
                            className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            <span>Mở khóa</span>
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Trang {pagination.page} trên tổng {pagination.totalPages} trang ({pagination.totalItems} kết quả)
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

      {/* Block / Unblock Modal Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-md shadow-2xl border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {actionType === "BLOCK" ? (
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <Lock className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Unlock className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {actionType === "BLOCK" ? "Khóa tài khoản người dùng" : "Mở khóa tài khoản"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Người dùng: <span className="font-semibold text-foreground">{selectedUser.fullName}</span> ({selectedUser.email})
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleConfirmStatusChange}>
              <CardContent className="space-y-3 pt-0">
                {actionType === "BLOCK" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold block">
                      Lý do khóa tài khoản <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      required
                      placeholder="VD: Vi phạm điều khoản đăng tin spam, nộp CV giả mạo..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full min-h-[80px] p-2.5 text-xs rounded-md bg-muted/40 border border-border focus:ring-1 focus:ring-primary outline-hidden"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Tài khoản bị khóa sẽ lập tức bị thu hồi JWT token và không thể đăng nhập vào hệ thống.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Bạn có chắc chắn muốn mở khóa cho tài khoản này? Người dùng sẽ được phép đăng nhập lại bình thường.
                  </p>
                )}
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting}
                  onClick={() => {
                    setSelectedUser(null);
                    setActionType(null);
                  }}
                  className="h-8 text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  variant={actionType === "BLOCK" ? "destructive" : "default"}
                  className="h-8 text-xs font-semibold gap-1.5"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{actionType === "BLOCK" ? "Xác nhận khóa" : "Xác nhận mở khóa"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default UsersManagementPage;
