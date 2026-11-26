import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { OtpBanner } from '@/features/auth/components/OtpBanner';
import { OtpVerificationForm } from '@/features/auth/components/OtpVerificationForm';

export function VerifyOtpPage() {
  const location = useLocation();

  const email = location.state?.email;
  const purpose = location.state?.purpose || 'REGISTER';
  const role = location.state?.role || 'JOB_SEEKER';

  // If email is missing from router state, redirect back to /register or /forgot-password
  if (!email) {
    return <Navigate to={purpose === 'RESET_PASSWORD' ? '/forgot-password' : role === 'RECRUITER' ? '/recruiter/register' : '/register'} replace />;
  }

  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-5xl border border-base-300">
        <div className="card-body p-0 flex flex-col md:flex-row">

          {/* Left Column – Banner trái */}
          <div className="md:w-[48%] lg:w-[50%] min-h-[360px] md:min-h-[580px] shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-base-200">
            <OtpBanner purpose={purpose} />
          </div>

          {/* Right Column – OTP Form Content */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-8 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              <OtpVerificationForm email={email} purpose={purpose} role={role} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VerifyOtpPage;
