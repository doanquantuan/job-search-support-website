import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 1. Sidebar bên trái */}
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* 2. Content bên phải */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header trên cùng */}
        <AdminHeader />

        {/* Nội dung trang thay đổi theo Router */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

