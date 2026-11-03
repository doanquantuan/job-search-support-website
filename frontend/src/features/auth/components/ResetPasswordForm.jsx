import React, { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { authApi } from '@/features/auth/services/authApi';
import { resetPasswordSchema } from '@/features/auth/schemas/resetPasswordSchema';
import { PasswordInput } from './common/PasswordInput';
import { PasswordStrengthSection } from './common/PasswordStrengthSection';
import { FieldError } from './common/FieldError';
import { maskEmail } from './OtpVerificationForm';

export function ResetPasswordForm({ email, resetToken }) {
  const navigate = useNavigate();
  const formId = useId();

  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const watchedPassword = watch('password');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await authApi.resetPassword({
        resetToken,
        newPassword: data.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 400 || status === 401) {
        setServerError(message || 'Link hoặc token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        return;
      }
      showToast(message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // SUCCESS SCREEN
  if (isSuccess) {
    return (
      <div className="w-full max-w-[440px] mx-auto py-2">
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-2">
            <div className="badge badge-success badge-sm p-2 rounded-md text-white shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-base-content/70">Hoàn tất</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
            Đặt lại mật khẩu thành công
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 leading-relaxed">
            Mật khẩu mới của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại để sử dụng dịch vụ.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-primary w-full h-10 min-h-10 text-sm font-semibold text-white shadow-xs"
          >
            Đăng nhập ngay
          </button>
        </div>

        {email && (
          <p className="text-center text-xs text-base-content/50 pt-4">
            Tài khoản: <span className="font-medium text-base-content/80">{maskEmail(email)}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="badge badge-primary badge-sm p-2 rounded-md text-primary-content shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-base-content/70">Tạo mật khẩu mới</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
          Đặt lại mật khẩu
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 leading-relaxed">
          Tạo mật khẩu mới an toàn cho tài khoản {email ? <span className="font-semibold text-base-content">{maskEmail(email)}</span> : ''}.
        </p>
      </div>

      {/* Server Error Alert Banner */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="alert alert-error mb-4 p-3.5 text-xs font-medium rounded-btn shadow-xs flex flex-col items-start space-y-1 overflow-hidden"
          >
            <div className="flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
            <div className="pl-6 pt-1">
              <Link to="/forgot-password" className="link font-semibold underline">
                Gửi lại yêu cầu quên mật khẩu →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Password */}
        <div className="form-control w-full space-y-1">
          <label htmlFor="password" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Mật khẩu mới</span>
          </label>
          <PasswordInput
            id="password"
            placeholder="Tạo mật khẩu mới"
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
            <span className="label-text text-xs font-semibold text-base-content/80">Xác nhận mật khẩu mới</span>
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
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
              'Đặt lại mật khẩu'
            )}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="text-center text-xs text-base-content/60 pt-5">
        Hủy bỏ và{' '}
        <Link
          to="/login"
          className="link link-primary link-hover font-semibold"
        >
          Quay lại đăng nhập
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

export default ResetPasswordForm;
