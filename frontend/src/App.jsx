import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { PageLoader } from "./components/common/PageLoader";
import { ToastContainer } from "./components/common/Toast";

// Lazy-loaded page routes for code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyOtpPage = lazy(() => import("./pages/VerifyOtpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CvManagementPage = lazy(() => import("./pages/CvManagementPage"));
const MyApplicationsPage = lazy(() => import("./pages/MyApplicationsPage"));
const SavedJobsPage = lazy(() => import("./pages/SavedJobsPage"));
const CompanyListPage = lazy(() => import("./pages/CompanyListPage"));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage"));
const JobListPage = lazy(() => import("./pages/JobListPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/verify-otp"      element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />

            {/* Public Jobs Routes */}
            <Route path="/jobs"            element={<JobListPage />} />
            <Route path="/jobs/:id"        element={<JobDetailPage />} />

            {/* Public Company Routes */}
            <Route path="/companies"       element={<CompanyListPage />} />
            <Route path="/companies/:id"   element={<CompanyDetailPage />} />

            {/* Protected Profile Route (Job Seeker / Recruiter) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected CV Management Route (Job Seeker only) */}
            <Route
              path="/cvs"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <CvManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Application Management Route (Job Seeker only) */}
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/applied" element={<Navigate to="/my-applications" replace />} />

            {/* Protected Saved Jobs Route (Job Seeker only) */}
            <Route
              path="/saved"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <SavedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/saved" element={<Navigate to="/saved" replace />} />

            {/* Default redirect to jobs */}
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Suspense>
        {/* Hệ thống Toast thông báo toàn cục */}
        <ToastContainer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
