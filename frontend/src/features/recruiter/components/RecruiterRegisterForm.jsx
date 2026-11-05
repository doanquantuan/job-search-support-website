import React, { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowLeft, User, Briefcase, Lock } from 'lucide-react';

import { authApi } from '@/features/auth/services/authApi';
import { FormInput } from '@/features/auth/components/common/FormInput';
import { PasswordInput } from '@/features/auth/components/common/PasswordInput';
import { PasswordStrengthSection } from '@/features/auth/components/common/PasswordStrengthSection';
import { FieldError } from '@/features/auth/components/common/FieldError';
import { COMPANY_SIZES, LOCATIONS, RECRUITER_POSITIONS } from '@/constants/jobFilters';

const recruiterRegisterSchema = z
  .object({
    role: z.literal('RECRUITER').default('RECRUITER'),
    fullName: z
      .string()
      .min(1, 'Họ và tên là bắt buộc')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên tối đa 100 ký tự'),
    phone: z
      .string()
      .min(1, 'Số điện thoại là bắt buộc')
      .regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)'),
    email: z
      .string()
      .min(1, 'Email công việc là bắt buộc')
      .trim()
      .email('Vui lòng nhập email đúng định dạng'),
    position: z.string().min(1, 'Vui lòng chọn chức vụ của bạn'),
    companyName: z
      .string()
      .min(1, 'Tên công ty là bắt buộc')
      .min(2, 'Tên công ty tối thiểu 2 ký tự')
      .max(200, 'Tên công ty tối đa 200 ký tự'),
    companySize: z.string().min(1, 'Vui lòng chọn quy mô nhân sự'),
    province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .refine(
        (val) =>
          val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^A-Za-z0-9]/.test(val),
        {
          message: 'Mật khẩu chưa đáp ứng các yêu cầu bảo mật bên dưới.',
        }
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    termsAgreed: z.boolean().refine((val) => val === true, {
      message: 'Bạn cần đồng ý với điều khoản dịch vụ tuyển dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
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
      role: 'RECRUITER',
      fullName: '',
      phone: '',
      email: '',
      position: RECRUITER_POSITIONS[0] || 'Nhân viên tuyển dụng (HR Recruiter)',
      companyName: '',
      companySize: COMPANY_SIZES[1]?.value || 'SIZE_51_200',
      province: 'Hà Nội',
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
    const trimmedCompanyName = data.companyName?.trim();
    const trimmedPhone = data.phone?.trim();

    try {
      // Lưu hồ sơ tạm thời của doanh nghiệp để đồng bộ/xác thực sau khi đăng ký
      try {
        localStorage.setItem(
          'recruiter_pending_registration',
          JSON.stringify({
            fullName: trimmedFullName,
            email: trimmedEmail,
            phone: trimmedPhone,
            companyName: trimmedCompanyName,
            position: data.position,
            companySize: data.companySize,
            province: data.province,
          })
        );
      } catch (e) {
        // Bỏ qua nếu storage đầy
      }

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
    <div className="w-full max-w-[540px] mx-auto py-2">
      {/* Header đồng bộ 100% phong cách với JobSeeker */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="badge badge-primary badge-sm p-2 rounded-md text-primary-content shadow-xs">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-base-content/70">Dành cho Nhà tuyển dụng</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
          Đăng ký tuyển dụng
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
              <span>Email này đã được đăng ký tài khoản</span>
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
        {/* Phần 1: Thông tin người đại diện tuyển dụng */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70 pb-0.5">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>1. Thông tin người đại diện tuyển dụng</span>
          </div>

          {/* Grid: Họ tên & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="fullName" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Họ và tên <span className="text-error">*</span>
                </span>
              </label>
              <FormInput
                id="fullName"
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                disabled={isSubmitting}
                error={!!errors.fullName}
                {...register('fullName')}
              />
              <FieldError message={errors.fullName?.message} id="fullName-error" />
            </div>

            {/* Phone */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="phone" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Số điện thoại <span className="text-error">*</span>
                </span>
              </label>
              <FormInput
                id="phone"
                type="tel"
                placeholder="Ví dụ: 0912345678"
                autoComplete="tel"
                disabled={isSubmitting}
                error={!!errors.phone}
                {...register('phone')}
              />
              <FieldError message={errors.phone?.message} id="phone-error" />
            </div>
          </div>

          {/* Grid: Email & Chức vụ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="email" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Email công việc <span className="text-error">*</span>
                </span>
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

            {/* Position */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="position" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Chức vụ <span className="text-error">*</span>
                </span>
              </label>
              <select
                id="position"
                disabled={isSubmitting}
                className={`select select-bordered w-full h-10 min-h-10 text-xs sm:text-sm font-normal transition-colors duration-150 focus:outline-none focus:border-primary ${
                  errors.position
                    ? 'select-error bg-error/5 text-base-content border-error focus:border-error'
                    : 'bg-base-100 text-base-content border-base-300'
                } ${isSubmitting ? 'select-disabled bg-base-200 cursor-not-allowed text-base-content/40' : ''}`}
                {...register('position')}
              >
                {RECRUITER_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              <FieldError message={errors.position?.message} id="position-error" />
            </div>
          </div>
        </div>

        {/* Phần 2: Thông tin doanh nghiệp */}
        <div className="space-y-3 pt-2 border-t border-base-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70 pb-0.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>2. Thông tin doanh nghiệp</span>
          </div>

          {/* Company Name */}
          <div className="form-control w-full space-y-1">
            <label htmlFor="companyName" className="label py-0">
              <span className="label-text text-xs font-semibold text-base-content/80">
                Tên doanh nghiệp / Công ty <span className="text-error">*</span>
              </span>
            </label>
            <FormInput
              id="companyName"
              type="text"
              placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
              autoComplete="organization"
              disabled={isSubmitting}
              error={!!errors.companyName}
              {...register('companyName')}
            />
            <FieldError message={errors.companyName?.message} id="companyName-error" />
          </div>

          {/* Grid: Quy mô & Trụ sở / Tỉnh thành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Company Size */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="companySize" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Quy mô nhân sự <span className="text-error">*</span>
                </span>
              </label>
              <select
                id="companySize"
                disabled={isSubmitting}
                className={`select select-bordered w-full h-10 min-h-10 text-xs sm:text-sm font-normal transition-colors duration-150 focus:outline-none focus:border-primary ${
                  errors.companySize
                    ? 'select-error bg-error/5 text-base-content border-error focus:border-error'
                    : 'bg-base-100 text-base-content border-base-300'
                } ${isSubmitting ? 'select-disabled bg-base-200 cursor-not-allowed text-base-content/40' : ''}`}
                {...register('companySize')}
              >
                {COMPANY_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.companySize?.message} id="companySize-error" />
            </div>

            {/* Province */}
            <div className="form-control w-full space-y-1">
              <label htmlFor="province" className="label py-0">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Tỉnh / Thành phố <span className="text-error">*</span>
                </span>
              </label>
              <select
                id="province"
                disabled={isSubmitting}
                className={`select select-bordered w-full h-10 min-h-10 text-xs sm:text-sm font-normal transition-colors duration-150 focus:outline-none focus:border-primary ${
                  errors.province
                    ? 'select-error bg-error/5 text-base-content border-error focus:border-error'
                    : 'bg-base-100 text-base-content border-base-300'
                } ${isSubmitting ? 'select-disabled bg-base-200 cursor-not-allowed text-base-content/40' : ''}`}
                {...register('province')}
              >
                {LOCATIONS.filter((loc) => loc.value).map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.province?.message} id="province-error" />
            </div>
          </div>
        </div>

        {/* Phần 3: Thiết lập mật khẩu */}
        <div className="space-y-3 pt-2 border-t border-base-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70 pb-0.5">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>3. Thiết lập mật khẩu bảo vệ</span>
          </div>

          {/* Password */}
          <div className="form-control w-full space-y-1">
            <label htmlFor="password" className="label py-0">
              <span className="label-text text-xs font-semibold text-base-content/80">
                Mật khẩu <span className="text-error">*</span>
              </span>
            </label>
            <PasswordInput
              id="password"
              placeholder="Tạo mật khẩu an toàn"
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
              <span className="label-text text-xs font-semibold text-base-content/80">
                Xác nhận mật khẩu <span className="text-error">*</span>
              </span>
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
        </div>

        {/* Cam kết điều khoản */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={isSubmitting}
              {...register('termsAgreed')}
              className={`checkbox checkbox-primary checkbox-xs mt-0.5 rounded ${
                errors.termsAgreed ? 'checkbox-error' : ''
              }`}
            />
            <span className="text-xs text-base-content/75 leading-relaxed">
              Tôi cam kết tuân thủ{' '}
              <a href="#terms" className="text-primary font-semibold hover:underline">
                Quy chế hoạt động
              </a>{' '}
              và{' '}
              <a href="#privacy" className="text-primary font-semibold hover:underline">
                Chính sách bảo mật dữ liệu tuyển dụng
              </a>{' '}
              của JobLink.
            </span>
          </label>
          <FieldError message={errors.termsAgreed?.message} id="terms-error" />
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
              'Đăng ký tài khoản tuyển dụng'
            )}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="pt-4 space-y-2.5 text-center text-xs">
        <p className="text-base-content/60">
          Đã có tài khoản tuyển dụng?{' '}
          <Link to="/login" className="link link-primary link-hover font-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

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

export default RecruiterRegisterForm;
