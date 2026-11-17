import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  Settings,
  LogOut,
  Building2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUIStore } from "@/store/useUIStore";

export function AdminHeader() {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuthStore();
  const { isDark, toggleTheme, isSidebarCollapsed, toggleSidebar } = useUIStore();
  const {
    pendingCompaniesCount,
    pendingReportsCount,
    fetchNotificationCounts,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotificationCounts();
  }, [fetchNotificationCounts]);

  const totalNotifications = pendingCompaniesCount + pendingReportsCount;

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Sidebar Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title={isSidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {totalNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between pb-2 border-b px-2">
              <span className="font-semibold text-xs">Thông báo cần xử lý</span>
              <Badge variant="secondary" className="text-[10px]">
                {totalNotifications} mới
              </Badge>
            </div>
            <div className="py-2 space-y-1">
              {pendingCompaniesCount > 0 && (
                <DropdownMenuItem asChild>
                  <Link to="/companies" className="flex flex-col items-start gap-1 p-2 rounded-md cursor-pointer">
                    <span className="font-medium text-xs text-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" />
                      Hồ sơ doanh nghiệp chờ duyệt GPKD ({pendingCompaniesCount})
                    </span>
                    <span className="text-[10px] text-muted-foreground">Nhấn để mở danh sách thẩm duyệt</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {pendingReportsCount > 0 && (
                <DropdownMenuItem asChild>
                  <Link to="/reports" className="flex flex-col items-start gap-1 p-2 rounded-md cursor-pointer">
                    <span className="font-medium text-xs text-foreground flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      Báo cáo tin tuyển dụng nghi vấn vi phạm ({pendingReportsCount})
                    </span>
                    <span className="text-[10px] text-muted-foreground">Nhấn để mở trang xử lý khiếu nại</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {totalNotifications === 0 && (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Hiện không có thông báo mới cần xử lý.
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-full p-1 hover:bg-accent transition-colors focus:outline-none"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={adminUser?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {getInitials(adminUser?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  {adminUser?.fullName || "Quản trị viên"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Quản trị viên
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 border-b">
              <p className="text-xs font-semibold text-foreground">{adminUser?.fullName || "Admin"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email || "admin@joblink.vn"}</p>
            </div>
            <div className="p-1">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-3.5 w-3.5" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-3.5 w-3.5" />
                <span>Cài đặt hệ thống</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AdminHeader;
