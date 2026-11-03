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
          <div className="badge badge-primary badge-sm p-2 rounded-md text-primary-content shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-base-content/70">Tài khoản</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
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
            className="alert alert-error mb-5 p-3.5 text-xs rounded-btn shadow-xs flex flex-col items-start space-y-1 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Email này đã được đăng ký</span>
            </div>
            <div className="flex items-center gap-4 pl-5 pt-0.5">
              <Link to="/login" className="link font-semibold underline">
                Đăng nhập
              </Link>
              <Link to="/forgot-password" className="link font-semibold underline">
                Quên mật khẩu
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* Full Name */}
        <div className="form-control w-full space-y-1">
          <label htmlFor="fullName" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Họ và tên</span>
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
        <div className="form-control w-full space-y-1">
          <label htmlFor="email" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Email</span>
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
        <div className="form-control w-full space-y-1">
          <label htmlFor="password" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Mật khẩu</span>
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
        <div className="form-control w-full space-y-1 pt-0.5">
          <label htmlFor="confirmPassword" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Xác nhận mật khẩu</span>
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
            className="btn btn-primary w-full h-10 min-h-10 text-sm font-semibold text-white shadow-xs"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="text-center text-xs text-base-content/60 pt-4">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="link link-primary link-hover font-semibold"
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
            className="toast toast-bottom toast-center z-50"
          >
            <div className="alert bg-neutral text-neutral-content px-4 py-2.5 text-xs font-medium shadow-lg rounded-btn">
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
