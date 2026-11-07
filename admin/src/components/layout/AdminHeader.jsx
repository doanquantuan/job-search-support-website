import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Shield,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

export function AdminHeader() {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      navigate(`/users?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  useEffect(() => {
    // Check initial dark mode from localStorage or system
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/80 px-6 backdrop-blur-md">
      {/* 1. Global Search Box */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng (Enter để tìm)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9 h-9 text-xs bg-muted/40 focus-visible:bg-background"
          />
        </div>
      </div>

      {/* 2. Right Quick Actions */}
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
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <div className="flex items-center justify-between pb-2 border-b px-2">
              <span className="font-semibold text-xs">Thông báo hệ thống</span>
              <Badge variant="secondary" className="text-[10px]">3 mới</Badge>
            </div>
            <div className="py-2 space-y-1">
              <DropdownMenuItem asChild>
                <Link to="/companies" className="flex flex-col items-start gap-1 p-2 rounded-md cursor-pointer">
                  <span className="font-medium text-xs text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-500" />
                    Hồ sơ doanh nghiệp đang chờ duyệt GPKD
                  </span>
                  <span className="text-[10px] text-muted-foreground">Nhấn để mở danh sách thẩm duyệt</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reports" className="flex flex-col items-start gap-1 p-2 rounded-md cursor-pointer">
                  <span className="font-medium text-xs text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    Báo cáo tin tuyển dụng nghi vấn spam / lừa đảo
                  </span>
                  <span className="text-[10px] text-muted-foreground">Nhấn để mở trang xử lý khiếu nại</span>
                </Link>
              </DropdownMenuItem>
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
                  Super Admin
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

