import React, { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowLeft } from 'lucide-react';

import { authApi } from '@/features/auth/services/authApi';
import { FormInput } from '@/features/auth/components/common/FormInput';
import { PasswordInput } from '@/features/auth/components/common/PasswordInput';
import { PasswordStrengthSection } from '@/features/auth/components/common/PasswordStrengthSection';
import { FieldError } from '@/features/auth/components/common/FieldError';

const recruiterRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ và tên là bắt buộc')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên tối đa 100 ký tự'),
    email: z
      .string()
      .min(1, 'Email công việc là bắt buộc')
      .trim()
      .email('Vui lòng nhập email đúng định dạng'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .refine(
        (val) =>
          val.length >= 8 &&
          /[a-z]/.test(val) &&
          /[A-Z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^A-Za-z0-9]/.test(val),
        { message: 'Mật khẩu chưa đáp ứng đủ điều kiện bảo mật' }
      ),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: 'Bạn cần đồng ý với điều khoản sử dụng' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export function RecruiterRegisterForm() {
  const navigate = useNavigate();
  const formId = useId();

  const [serverError409, setServerError409] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(recruiterRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAgreed: true,
    },
    mode: 'onBlur',
  });

  const watchedPassword = watch('password');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (data) => {
    setServerError409(false);
    const trimmedEmail = data.email?.trim().toLowerCase();
    const trimmedFullName = data.fullName?.trim();

    try {
      await authApi.register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password: data.password,
        role: 'RECRUITER',
      });

      navigate('/verify-otp', {
        state: {
          email: trimmedEmail,
          purpose: 'REGISTER',
          role: 'RECRUITER',
        },
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
      showToast('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="badge badge-primary badge-sm p-2 rounded-md text-primary-content shadow-xs">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-base-content/70">Dành cho Nhà tuyển dụng</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
          Đăng ký tài khoản
        </h1>
        <p className="text-xs text-base-content/60">
          Sau khi xác thực email và đăng nhập, bạn sẽ hoàn tất xác thực thông tin công ty.
        </p>
      </div>

      {/* Lỗi 409 */}
      <AnimatePresence>
        {serverError409 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="alert alert-error mb-4 py-2.5 px-3 text-xs font-medium rounded-btn shadow-xs"
          >
            <span>
              Email này đã được đăng ký.{' '}
              <Link to="/recruiter/login" className="underline font-bold">
                Đăng nhập ngay
              </Link>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Họ và tên */}
        <div className="form-control w-full space-y-1">
          <label htmlFor="fullName" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Họ và tên</span>
          </label>
          <FormInput
            id="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
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
            <span className="label-text text-xs font-semibold text-base-content/80">Email công việc</span>
          </label>
          <FormInput
            id="email"
            type="email"
            placeholder="hr@company.com"
            autoComplete="email"
            disabled={isSubmitting}
            error={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} id="email-error" />
        </div>

        {/* Mật khẩu */}
        <div className="form-control w-full space-y-1">
          <label htmlFor="password" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">Mật khẩu</span>
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            error={!!errors.password}
            {...register('password')}
          />
          <PasswordStrengthSection password={watchedPassword} />
          <FieldError message={errors.password?.message} id="password-error" />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="form-control w-full space-y-1">
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

        {/* Điều khoản */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2.5 py-1">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-xs rounded"
              disabled={isSubmitting}
              {...register('termsAgreed')}
            />
            <span className="label-text text-xs text-base-content/70">
              Tôi đồng ý với{' '}
              <Link to="/terms" className="link link-primary font-medium">
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="link link-primary font-medium">
                Chính sách bảo mật
              </Link>
            </span>
          </label>
          <FieldError message={errors.termsAgreed?.message} id="terms-error" />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full h-10 min-h-10 text-sm font-semibold text-white shadow-xs"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Đang đăng ký...</span>
              </>
            ) : (
              'Đăng ký tài khoản'
            )}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="pt-4 space-y-2 text-center text-xs">
        <p className="text-base-content/60">
          Đã có tài khoản tuyển dụng?{' '}
          <Link to="/recruiter/login" className="link link-primary link-hover font-semibold">
            Đăng nhập ngay
          </Link>
        </p>

        <div className="pt-1">
          <Link
            to="/recruiter"
            className="inline-flex items-center gap-1.5 text-base-content/50 hover:text-primary transition-colors font-medium text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Cổng giải pháp tuyển dụng</span>
          </Link>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="toast toast-bottom toast-center z-50"
          >
            <div className="alert bg-neutral text-neutral-content px-4 py-2 text-xs font-medium shadow-lg rounded-btn">
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecruiterRegisterForm;
