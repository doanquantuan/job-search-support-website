import React from 'react';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left Column – Khung nền xám nhạt bên trái chứa banner logo Jobloria */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-[#F9FAFC] border-r border-gray-100 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <AuthBanner mode="forgot-password" />
      </div>

      {/* Right Column – Khung màu trắng bên phải chứa ForgotPasswordForm */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
