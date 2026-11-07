import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function RecruiterLoginPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row font-sans">
      {/* Left Column – Khung banner bên trái dành riêng cho Nhà tuyển dụng */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-base-200 border-r border-base-200 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <AuthBanner mode="recruiter" />
      </div>

      {/* Right Column – Khung màu trắng bên phải chứa LoginForm chế độ tuyển dụng */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[450px]">
          <LoginForm mode="recruiter" />
        </div>
      </div>
    </div>
  );
}

export default RecruiterLoginPage;
