import React, { useEffect } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';
import { useAuthStore } from '@/store/useAuthStore';

export function RecruiterLoginPage() {
  const { user, logout } = useAuthStore();

  // Đăng xuất tài khoản ứng viên nếu đang đăng nhập khi truy cập cổng đăng nhập tuyển dụng
  useEffect(() => {
    if (user && user.role === 'JOB_SEEKER') {
      logout();
    }
  }, [user, logout]);

  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center px-4 py-8 font-sans">
      <div className="card bg-base-100 shadow-xl w-full max-w-5xl border border-base-300">
        <div className="card-body p-0 flex flex-col md:flex-row">

          {/* Left Column – Khung banner bên trái dành riêng cho Nhà tuyển dụng */}
          <div className="md:w-[48%] lg:w-[50%] min-h-[360px] md:min-h-[580px] shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-base-200">
            <AuthBanner mode="recruiter" />
          </div>

          {/* Right Column – Khung màu trắng bên phải chứa LoginForm chế độ tuyển dụng */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-8 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              <LoginForm mode="recruiter" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecruiterLoginPage;
