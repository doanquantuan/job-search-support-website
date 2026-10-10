import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function ResetPasswordPage() {
  const location = useLocation();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  // If resetToken is missing, redirect back to /forgot-password
  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left Column – Banner xám bên trái */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-[#F9FAFC] border-r border-gray-100 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <AuthBanner mode="reset-password" />
      </div>

      {/* Right Column – Form bên phải */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <ResetPasswordForm email={email} resetToken={resetToken} />
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

