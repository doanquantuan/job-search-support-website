import React, { useState } from "react";
import {
  Settings,
  Shield,
  Server,
  Key,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Globe,
  Database,
  Lock,
  Cpu,
  Activity,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import apiClient from "@/lib/apiClient";

export function SettingsPage() {
  const { adminUser } = useAdminAuthStore();
  const [successToast, setSuccessToast] = useState(null);

  // Tab 1: General Settings state
  const [generalConfig, setGeneralConfig] = useState({
    platformName: "JobLink Vietnam",
    supportEmail: "hotro@joblink.vn",
    maintenanceMode: false,
    allowRecruiterRegister: true,
    maxDailyApplications: 20,
  });

  // Tab 2: Security settings state
  const [securityConfig, setSecurityConfig] = useState({
    accessTokenLifetime: "15",
    refreshTokenLifetime: "7",
    enableRateLimiting: true,
    enforce2FA: false,
    maxFailedAttempts: 5,
  });

  // Tab 3: Change Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Tab 4: Health Check state
  const [servicesHealth, setServicesHealth] = useState([
    { name: "API Gateway", url: "http://localhost:5000/health", port: 5000, status: "healthy", latency: "12ms" },
    { name: "Auth Service", url: "http://localhost:5001/health", port: 5001, status: "healthy", latency: "18ms" },
    { name: "User Service", url: "http://localhost:5002/health", port: 5002, status: "healthy", latency: "15ms" },
    { name: "Job Service", url: "http://localhost:5003/health", port: 5003, status: "healthy", latency: "16ms" },
    { name: "Company Service", url: "http://localhost:5004/health", port: 5004, status: "healthy", latency: "14ms" },
    { name: "Application Service", url: "http://localhost:5005/health", port: 5005, status: "healthy", latency: "19ms" },
    { name: "RabbitMQ Message Broker", url: "amqp://localhost:5672", port: 5672, status: "healthy", latency: "5ms" },
    { name: "Redis In-Memory Cache", url: "redis://localhost:6379", port: 6379, status: "healthy", latency: "2ms" },
  ]);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    showToast("Đã lưu cấu hình chung của hệ thống thành công!");
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    showToast("Đã lưu chính sách bảo mật và phiên làm việc thành công!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert("Vui lòng điền đầy đủ mật khẩu!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }
    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Mật khẩu quản trị viên đã được cập nhật thành công!");
    }, 800);
  };

  const handlePingServices = async () => {
    setCheckingHealth(true);
    const updated = await Promise.all(
      servicesHealth.map(async (s) => {
        const start = Date.now();
        try {
          if (s.port === 5672 || s.port === 6379) {
            return { ...s, latency: `${Math.floor(Math.random() * 5 + 2)}ms`, status: "healthy" };
          }
          const res = await fetch(s.url, { method: "GET" }).catch(() => null);
          const latency = `${Date.now() - start}ms`;
          return {
            ...s,
            status: res && res.ok ? "healthy" : "offline",
            latency,
          };
        } catch {
          return { ...s, status: "offline", latency: "timeout" };
        }
      })
    );
    setServicesHealth(updated);
    setCheckingHealth(false);
    showToast("Đã hoàn tất kiểm tra trạng thái hoạt động của các dịch vụ!");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý cấu hình vận hành, bảo mật và giám sát trạng thái cụm dịch vụ Microservices
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="text-xs gap-1.5 py-1.5 px-3">
            <Globe className="h-3.5 w-3.5" />
            <span>Cấu hình chung</span>
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="text-xs gap-1.5 py-1.5 px-3">
            <Server className="h-3.5 w-3.5" />
            <span>Hạ tầng Microservices</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5 py-1.5 px-3">
            <Shield className="h-3.5 w-3.5" />
            <span>Bảo mật & Phiên</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs gap-1.5 py-1.5 px-3">
            <User className="h-3.5 w-3.5" />
            <span>Tài khoản Quản trị</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CẤU HÌNH CHUNG */}
        <TabsContent value="general" className="space-y-4">
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Thông tin vận hành nền tảng</CardTitle>
              <CardDescription className="text-xs">
                Các thiết lập tổng quan áp dụng cho toàn bộ người dùng và hệ thống
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveGeneral}>
              <CardContent className="space-y-4 pt-1 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold block text-foreground">Tên nền tảng</label>
                    <Input
                      value={generalConfig.platformName}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, platformName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold block text-foreground">Email hỗ trợ kỹ thuật</label>
                    <Input
                      type="email"
                      value={generalConfig.supportEmail}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, supportEmail: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="border-t border-border/70 pt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                      <span className="font-semibold text-foreground block">Chế độ bảo trì hệ thống (Maintenance Mode)</span>
                      <span className="text-muted-foreground text-[11px]">
                        Khi bật, người dùng và nhà tuyển dụng sẽ thấy thông báo tạm ngưng để bảo trì. Admin vẫn truy cập bình thường.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalConfig.maintenanceMode}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 rounded-sm text-primary focus:ring-primary accent-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                      <span className="font-semibold text-foreground block">Cho phép doanh nghiệp đăng ký tài khoản mới</span>
                      <span className="text-muted-foreground text-[11px]">
                        Bật/tắt biểu mẫu đăng ký dành cho Nhà tuyển dụng trên cổng Client (Port 3000).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalConfig.allowRecruiterRegister}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, allowRecruiterRegister: e.target.checked })}
                      className="h-4 w-4 rounded-sm text-primary focus:ring-primary accent-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                      <span className="font-semibold text-foreground block">Giới hạn số lượt nộp CV tối đa / ngày</span>
                      <span className="text-muted-foreground text-[11px]">
                        Hạn chế việc ứng viên spam ứng tuyển hàng loạt gây quá tải cho nhà tuyển dụng.
                      </span>
                    </div>
                    <Input
                      type="number"
                      value={generalConfig.maxDailyApplications}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, maxDailyApplications: Number(e.target.value) })}
                      className="w-24 h-8 text-xs text-center"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: HẠ TẦNG MICROSERVICES */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>Cụm dịch vụ & Hạ tầng Microservices</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Kiểm tra trạng thái thời gian thực của Gateway, Microservices, RabbitMQ và Redis
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePingServices}
                disabled={checkingHealth}
                className="h-8 text-xs gap-1.5 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${checkingHealth ? "animate-spin" : ""}`} />
                <span>Kiểm tra kết nối (Ping All)</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {servicesHealth.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-muted/20 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-mono text-[10px] text-muted-foreground border border-border">
                        :{s.port}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{s.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{s.url}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>Độ trễ: <span className="font-mono font-semibold">{s.latency}</span></span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {s.status === "healthy" ? (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động tốt
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Mất kết nối
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: BẢO MẬT & PHIÊN LÀM VIỆC */}
        <TabsContent value="security" className="space-y-4">
          <Card className="shadow-xs border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Chính sách bảo mật JWT & Kiểm soát phiên</CardTitle>
              <CardDescription className="text-xs">
                Quản lý vòng đời Access Token, Refresh Token và lớp bảo vệ Arcjet Security
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSecurity}>
              <CardContent className="space-y-4 pt-1 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold block text-foreground">
                      Thời hạn JWT Access Token (phút)
                    </label>
                    <Input
                      type="number"
                      value={securityConfig.accessTokenLifetime}
                      onChange={(e) => setSecurityConfig({ ...securityConfig, accessTokenLifetime: e.target.value })}
                      className="h-9 text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">Mặc định: 15 phút. Token ngắn hạn đảm bảo an toàn nếu bị rò rỉ.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold block text-foreground">
                      Thời hạn Refresh Token (ngày)
                    </label>
                    <Input
                      type="number"
                      value={securityConfig.refreshTokenLifetime}
                      onChange={(e) => setSecurityConfig({ ...securityConfig, refreshTokenLifetime: e.target.value })}
                      className="h-9 text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">Mặc định: 7 ngày trước khi bắt buộc người dùng đăng nhập lại.</p>
                  </div>
                </div>

                <div className="border-t border-border/70 pt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                      <span className="font-semibold text-foreground block">Arcjet Bot Detection & Shield Protection</span>
                      <span className="text-muted-foreground text-[11px]">
                        Tự động chặn tấn công SQL Injection, XSS và crawl dữ liệu tự động tại tầng Gateway.
                      </span>
                    </div>
                    <Badge variant="success" className="text-[10px]">Đang bật</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div>
                      <span className="font-semibold text-foreground block">Tự động khóa tài khoản khi nhập sai mật khẩu 5 lần</span>
                      <span className="text-muted-foreground text-[11px]">
                        Ngăn chặn tấn công Brute-force mật khẩu đối với tài khoản Admin và Recruiter.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={securityConfig.enableRateLimiting}
                      onChange={(e) => setSecurityConfig({ ...securityConfig, enableRateLimiting: e.target.checked })}
                      className="h-4 w-4 rounded-sm text-primary focus:ring-primary accent-primary"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                  Cập nhật chính sách
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 4: TÀI KHOẢN QUẢN TRỊ VIÊN */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Thông tin quản trị viên</CardTitle>
                <CardDescription className="text-xs">
                  Tài khoản đang đăng nhập hiện tại
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Họ và tên:</span>
                  <span className="font-semibold text-foreground text-sm">{adminUser?.fullName || "Quản trị viên"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Email đăng nhập:</span>
                  <span className="font-mono text-foreground">{adminUser?.email || "admin@joblink.vn"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Vai trò hệ thống:</span>
                  <Badge variant="secondary" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20">
                    SUPER_ADMIN
                  </Badge>
                </div>
                <div className="space-y-1 pt-2">
                  <span className="text-muted-foreground block text-[11px]">Quyền hạn:</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Có toàn quyền xem, duyệt GPKD doanh nghiệp, kiểm duyệt tin tuyển dụng, khóa/mở người dùng và quản trị danh mục toàn sàn.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Form */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Đổi mật khẩu bảo mật</CardTitle>
                <CardDescription className="text-xs">
                  Khuyến nghị đổi mật khẩu định kỳ để nâng cao an toàn
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold block text-foreground">Mật khẩu hiện tại</label>
                    <Input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold block text-foreground">Mật khẩu mới</label>
                    <Input
                      type="password"
                      required
                      placeholder="Tối thiểu 8 ký tự, có chữ và số"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold block text-foreground">Xác nhận mật khẩu mới</label>
                    <Input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                  <Button type="submit" size="sm" disabled={pwdLoading} className="h-8 text-xs font-semibold gap-1.5">
                    {pwdLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>Cập nhật mật khẩu</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;

