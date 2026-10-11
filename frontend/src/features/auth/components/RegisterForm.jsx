import React, { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { authApi } from '@/features/auth/services/authApi';
import { registerSchema } from '@/features/auth/schemas/registerSchema';
import { RoleSelector } from './common/RoleSelector';
import { FormInput } from './common/FormInput';
import { PasswordInput } from './common/PasswordInput';
import { PasswordStrengthSection } from './common/PasswordStrengthSection';
import { FieldError } from './common/FieldError';

export function RegisterForm() {
  const navigate = useNavigate();
  const formId = useId();

  const [serverError409, setServerError409] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'JOB_SEEKER',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (data) => {
    setServerError409(false);
    const trimmedEmail = data.email?.trim();
    const trimmedFullName = data.fullName?.trim();
    try {
      await authApi.register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password: data.password,
        role: data.role,
      });
      navigate('/verify-otp', {
        state: { email: trimmedEmail, purpose: 'REGISTER' },
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setServerError409(true);
        return;
      }
      if (status === 400 || status === 422) {
        showToast(err.response?.data?.message || 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.');
        return;
      }
      showToast('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-orange-500 text-white shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-700">Tài khoản</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 pt-1">
          Đăng ký
        </h1>
      </div>

      {/* 409 Conflict Error Banner */}
      <AnimatePresence>
        {serverError409 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 rounded-md border border-red-200 bg-red-50/60 p-3.5 text-xs space-y-1 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 font-semibold text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Email này đã được đăng ký</span>
            </div>
            <div className="flex items-center gap-4 pl-5 pt-0.5">
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                Đăng nhập
              </Link>
              <Link to="/forgot-password" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                Quên mật khẩu
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700">
            Họ và tên
          </label>
          <FormInput
            id="fullName"
            type="text"
            placeholder="Nhập họ và tên của bạn"
            autoComplete="name"
            disabled={isSubmitting}
            error={!!errors.fullName}
            {...register('fullName')}
          />
          <FieldError message={errors.fullName?.message} id="fullName-error" />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
            Email
          </label>
          <FormInput
            id="email"
            type="email"
            placeholder="Nhập địa chỉ email"
            autoComplete="email"
            disabled={isSubmitting}
            error={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} id="email-error" />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
            Mật khẩu
          </label>
          <PasswordInput
            id="password"
            placeholder="Tạo mật khẩu"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={!!errors.password}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} id="password-error" />
          <PasswordStrengthSection password={watchedPassword} hasError={!!errors.password} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1 pt-0.5">
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
            Xác nhận mật khẩu
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <FieldError message={errors.confirmPassword?.message} id="confirmPassword-error" />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="text-center text-xs text-gray-500 pt-4">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
        >
          Đăng nhập
        </Link>
      </p>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
