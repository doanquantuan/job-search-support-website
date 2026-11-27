import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MotionConfig } from "framer-motion";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { PageLoader } from "./components/common/PageLoader";
import { ToastContainer } from "./components/common/Toast";
import { useNotificationSocket } from "./hooks/useNotificationSocket";

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
const FollowingCompaniesPage = lazy(() => import("./pages/FollowingCompaniesPage"));
const CompanyListPage = lazy(() => import("./pages/CompanyListPage"));
const CompanyDetailPage = lazy(() => import("./pages/CompanyDetailPage"));
const JobListPage = lazy(() => import("./pages/JobListPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

// Recruiter Portal Pages & Layouts
const RecruiterLandingPage = lazy(() => import("./pages/recruiter/RecruiterLandingPage"));
const RecruiterRegisterPage = lazy(() => import("./pages/recruiter/RecruiterRegisterPage"));
const RecruiterLoginPage = lazy(() => import("./pages/recruiter/RecruiterLoginPage"));
const RecruiterDashboardLayout = lazy(() => import("./layouts/RecruiterDashboardLayout"));
const RecruiterDashboardOverviewPage = lazy(() => import("./pages/recruiter/RecruiterDashboardOverviewPage"));
const CompanyVerificationPage = lazy(() => import("./pages/recruiter/CompanyVerificationPage"));
const MyCompanyManagementPage = lazy(() => import("./pages/recruiter/MyCompanyManagementPage"));
const CreateJobPostPage = lazy(() => import("./pages/recruiter/CreateJobPostPage"));
const RecruiterJobListPage = lazy(() => import("./pages/recruiter/RecruiterJobListPage"));
const EditJobPostPage = lazy(() => import("./pages/recruiter/EditJobPostPage"));
const CandidateATSPage = lazy(() => import("./pages/recruiter/CandidateATSPage"));
const RecruiterAnalyticsPage = lazy(() => import("./pages/recruiter/RecruiterAnalyticsPage"));
const RecruiterNotificationsPage = lazy(() => import("./pages/recruiter/RecruiterNotificationsPage"));
const JobAlertsPage = lazy(() => import("./pages/JobAlertsPage"));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const NotificationSocketBridge = () => {
  useNotificationSocket();
  return null;
};

export const App = () => {
  return (
    <MotionConfig reducedMotion="user">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <NotificationSocketBridge />
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

            {/* Job Seeker Following Companies Route */}
            <Route
              path="/companies/following"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <FollowingCompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/following" element={<Navigate to="/companies/following" replace />} />

            {/* Public Company Routes */}
            <Route path="/companies"       element={<CompanyListPage />} />
            <Route path="/companies/:id"   element={<CompanyDetailPage />} />

            {/* Public Recruiter Portal Routes */}
            <Route path="/recruiter"          element={<RecruiterLandingPage />} />
            <Route path="/recruiter/register" element={<RecruiterRegisterPage />} />
            <Route path="/recruiter/login"    element={<RecruiterLoginPage />} />

            {/* Protected Recruiter Portal Layout (Phase 1 & Phase 2) */}
            <Route
              element={
                <ProtectedRoute roles={["RECRUITER"]}>
                  <RecruiterDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/recruiter/dashboard" element={<RecruiterDashboardOverviewPage />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobListPage />} />
              <Route path="/recruiter/jobs/create" element={<CreateJobPostPage />} />
              <Route path="/recruiter/jobs/:jobId/edit" element={<EditJobPostPage />} />
              <Route path="/recruiter/applications" element={<CandidateATSPage />} />
              <Route path="/recruiter/jobs/:jobId/candidates" element={<CandidateATSPage />} />
              <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
              <Route path="/recruiter/verification" element={<CompanyVerificationPage />} />
              <Route path="/recruiter/company" element={<MyCompanyManagementPage />} />
              <Route path="/recruiter/notifications" element={<RecruiterNotificationsPage />} />
            </Route>

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
            {/* Protected Job Alerts / Notifications Route (Job Seeker only) */}
            <Route
              path="/jobs/alerts"
              element={
                <ProtectedRoute roles={["JOB_SEEKER"]}>
                  <JobAlertsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<Navigate to="/jobs/alerts" replace />} />
            <Route path="/applications" element={<Navigate to="/my-applications" replace />} />
            <Route path="/applications/:id" element={<Navigate to="/my-applications" replace />} />

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

            {/* Public Legal Routes */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Public Home Route */}
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Suspense>
        {/* Global Toast Notification Container */}
        <ToastContainer />
      </BrowserRouter>
    </GoogleOAuthProvider>
    </MotionConfig>
  );
};

export default App;
