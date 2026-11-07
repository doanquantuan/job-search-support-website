import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export function ProtectedRoute() {
  const { isAuthenticated, adminUser } = useAdminAuthStore();

  // Kiểm tra đã đăng nhập và có role là ADMIN chưa
  if (!isAuthenticated || adminUser?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

