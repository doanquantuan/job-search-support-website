import React from 'react';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { AuthBanner } from '@/features/auth/components/AuthBanner';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card bg-base-100 shadow-xl w-full max-w-5xl border border-base-300">
        <div className="card-body p-0 flex flex-col md:flex-row">

          {/* Left Column – Banner trái */}
          <div className="md:w-[48%] lg:w-[50%] min-h-[360px] md:min-h-[580px] shrink-0 overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none border-b md:border-b-0 md:border-r border-base-200">
            <AuthBanner mode="forgot-password" />
          </div>

          {/* Right Column – Khung màu trắng bên phải chứa ForgotPasswordForm */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 sm:px-8 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-[420px]">
              <ForgotPasswordForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
