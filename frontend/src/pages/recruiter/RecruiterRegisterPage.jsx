import React, { useEffect } from 'react';
import { RecruiterRegisterForm } from '@/features/recruiter/components/RecruiterRegisterForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';
import { useAuthStore } from '@/store/useAuthStore';

export const RecruiterRegisterPage = () => {
  const { user, logout } = useAuthStore();

  // Đăng xuất tài khoản ứng viên nếu đang đăng nhập khi truy cập cổng đăng ký tuyển dụng
  useEffect(() => {
    if (user && user.role === 'JOB_SEEKER') {
      logout();
    }
  }, [user, logout]);

  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center px-4 py-8 font-sans">
      <div className="card bg-base-100 shadow-xl w-full max-w-6xl border border-base-300">
        <div className="card-body p-0 flex flex-col md:flex-row">

          {/* Left Column – Khung banner bên trái đồng nhất 100% với hệ thống Auth */}
          <div className="md:w-[45%] lg:w-[46%] min-h-[360px] md:min-h-[640px] shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-base-200">
            <AuthBanner mode="recruiter" />
          </div>

          {/* Right Column – Khung bên phải chứa form đăng ký Nhà tuyển dụng */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-8 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-[540px]">
              <RecruiterRegisterForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecruiterRegisterPage;
