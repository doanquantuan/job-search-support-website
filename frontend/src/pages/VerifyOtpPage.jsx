import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { OtpBanner } from '@/features/auth/components/OtpBanner';
import { OtpVerificationForm } from '@/features/auth/components/OtpVerificationForm';

export function VerifyOtpPage() {
  const location = useLocation();

  const email = location.state?.email;
  const purpose = location.state?.purpose || 'REGISTER';

  // If email is missing from router state, redirect back to /register or /forgot-password
  if (!email) {
    return <Navigate to={purpose === 'RESET_PASSWORD' ? '/forgot-password' : '/register'} replace />;
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left Column – Banner & Illustration \ */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-[#F9FAFC] border-r border-gray-100 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <OtpBanner purpose={purpose} />
      </div>

      {/* Right Column – OTP Form Content \*/}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <OtpVerificationForm email={email} purpose={purpose} />
        </div>
      </div>
    </div>
  );
}

export default VerifyOtpPage;
