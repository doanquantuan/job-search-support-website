import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersManagementPage } from "@/pages/UsersManagementPage";
import { CompanyApprovalPage } from "@/pages/CompanyApprovalPage";
import { JobsManagementPage } from "@/pages/JobsManagementPage";
import { ReportsManagementPage } from "@/pages/ReportsManagementPage";
import { OccupationsPage } from "@/pages/OccupationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Admin Login */}
        <Route path="/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersManagementPage />} />
            <Route path="/companies" element={<CompanyApprovalPage />} />
            <Route path="/jobs" element={<JobsManagementPage />} />
            <Route path="/occupations" element={<OccupationsPage />} />
            <Route path="/reports" element={<ReportsManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

