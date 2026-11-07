import React from 'react';
import { RecruiterRegisterForm } from '@/features/recruiter/components/RecruiterRegisterForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export const RecruiterRegisterPage = () => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row font-sans">
      {/* Left Column – Khung banner bên trái đồng nhất 100% với hệ thống Auth */}
      <div className="hidden md:flex md:w-[46%] lg:w-[45%] xl:w-[44%] bg-base-200 border-r border-base-200 flex-col justify-center items-center py-10 px-6 sm:px-8 shrink-0">
        <AuthBanner mode="recruiter" />
      </div>

      {/* Right Column – Khung bên phải chứa form đăng ký Nhà tuyển dụng */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[560px]">
          <RecruiterRegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RecruiterRegisterPage;
