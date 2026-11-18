import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { RefreshCw } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, adminUser, isCheckingAuth, checkAuth } = useAdminAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Đang kiểm tra phiên làm việc lần đầu khi F5
  if (isCheckingAuth && !adminUser) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">
          Đang xác thực phiên làm việc quản trị...
        </span>
      </div>
    );
  }

  // Kiểm tra đã đăng nhập và có role là ADMIN chưa
  if (!isAuthenticated || adminUser?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
