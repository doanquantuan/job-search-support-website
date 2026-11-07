import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  FolderTree,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import apiClient from "@/lib/apiClient";



export function AdminSidebar({ collapsed, setCollapsed }) {
  const { adminUser, logout } = useAdminAuthStore();
  const [pendingCompanies, setPendingCompanies] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    apiClient
      .get("/companies", { params: { verificationStatus: "PENDING", limit: 1 } })
      .then((res) => setPendingCompanies(res.data?.data?.pagination?.total || 0))
      .catch(() => {});

    apiClient
      .get("/job-reports", { params: { status: "PENDING", limit: 1 } })
      .then((res) => setPendingReports(res.data?.data?.pagination?.total || res.data?.data?.total || 0))
      .catch(() => {});
  }, []);

  const navItems = [
    { title: "Tổng quan", to: "/", icon: LayoutDashboard },
    { title: "Quản lý người dùng", to: "/users", icon: Users },
    {
      title: "Duyệt doanh nghiệp",
      to: "/companies",
      icon: Building2,
      badge: pendingCompanies > 0 ? String(pendingCompanies) : null,
      badgeVariant: "warning",
    },
    { title: "Quản lý việc làm", to: "/jobs", icon: Briefcase },
    { title: "Ngành nghề & Chuyên môn", to: "/occupations", icon: FolderTree },
    {
      title: "Báo cáo vi phạm",
      to: "/reports",
      icon: AlertTriangle,
      badge: pendingReports > 0 ? String(pendingReports) : null,
      badgeVariant: "destructive",
    },
    { title: "Cài đặt hệ thống", to: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* 1. Brand Logo Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                JobLink
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-mono font-bold bg-primary/10 text-primary border-primary/20">
                  ADMIN
                </Badge>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Control Center
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className={cn("px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground", collapsed && "sr-only")}>
          Quản trị hệ thống
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <Badge
                  variant={item.badgeVariant || "secondary"}
                  className="ml-auto text-[10px] px-1.5 py-0 h-4 font-bold"
                >
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 3. Bottom Links & User Section */}
      <div className="p-3 border-t space-y-2">
        {/* Link xem trang người dùng Client */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
            collapsed && "justify-center px-2"
          )}
          title="Mở cổng ứng viên / doanh nghiệp"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Xem trang Client</span>}
        </a>

        {/* Nút Đăng xuất */}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title="Đăng xuất"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>

        {/* Nút Thu gọn Sidebar */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-full items-center justify-center rounded-md border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs"
          title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;

