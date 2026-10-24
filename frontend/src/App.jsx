import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CvManagementPage } from "./pages/CvManagementPage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

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
          path="/profile/cvs"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <CvManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
