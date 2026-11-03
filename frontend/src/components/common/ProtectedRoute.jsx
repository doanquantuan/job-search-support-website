import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles required and user's role does not match, redirect to profile
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
