import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { authApi } from '@/features/auth/services/authApi';
import { registerSchema, getPasswordStrength } from '@/features/auth/schemas/registerSchema';

// Icons
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ErrorCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="h-4 w-4 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// (Animated Slide-Down + Fade-In)
function FieldError({ message, id }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-normal overflow-hidden"
        >
          <ErrorCircleIcon />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// Password Strength Component 
function PasswordStrengthSection({ password, hasError }) {
  const { checks, score } = getPasswordStrength(password || '');

  const isComplete = score === 5;
  const isWeak = password && score < 3;

  const getStatusText = () => {
    if (!password) return { text: 'Chưa nhập', color: 'text-gray-400' };
    if (score < 3) return { text: 'Yếu', color: 'text-red-500' };
    if (score < 5) return { text: 'Trung bình', color: 'text-yellow-600' };
    return { text: 'Mạnh', color: 'text-emerald-600' };
  };

  const status = getStatusText();

  const checklist = [
    { key: 'length', label: 'Ít nhất 8 ký tự' },
    { key: 'uppercase', label: 'Có chữ hoa' },
    { key: 'lowercase', label: 'Có chữ thường' },
    { key: 'number', label: 'Có chữ số' },
    { key: 'special', label: 'Có ký tự đặc biệt' },
  ];

  return (
    <div className="mt-3 space-y-2.5">
      {/* 4 Segment Bars */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((step) => {
          let barBg = 'bg-gray-200';
          if (isComplete) {
            barBg = 'bg-emerald-600';
          } else if (score >= 4 && step <= 3) {
            barBg = 'bg-emerald-500';
          } else if (score >= 3 && step <= 2) {
            barBg = 'bg-yellow-500';
          } else if (isWeak && step === 1) {
            barBg = 'bg-red-500';
          }
          return (
            <div key={step} className="h-1 flex-1 rounded-full overflow-hidden bg-gray-200">
              <div className={`h-full w-full transition-all duration-300 ${barBg}`} />
            </div>
          );
        })}
      </div>

      {/* Label Row */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-gray-500">Độ mạnh mật khẩu</span>
        <span className={`font-medium ${status.color}`}>{status.text}</span>
      </div>

      {/* 2x2 Checklist Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5">
        {checklist.map(({ key, label }) => {
          const isPassed = !!checks[key];
          const isFailedWithError = hasError && !isPassed;

          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <motion.span
                key={isPassed ? 'passed' : 'failed'}
                animate={{ scale: isPassed ? [1, 1.35, 1] : 1 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 flex items-center justify-center"
              >
                {isPassed ? (
                  <CheckCircleIcon />
                ) : isFailedWithError ? (
                  <span className="h-3.5 w-3.5 rounded-full border border-red-500 flex items-center justify-center" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-gray-300 flex items-center justify-center" />
                )}
              </motion.span>
              <span
                className={
                  isPassed
                    ? 'text-emerald-700 font-medium'
                    : isFailedWithError
                      ? 'text-red-500'
                      : 'text-gray-500'
                }
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// RegisterForm 
export function RegisterForm() {
  const navigate = useNavigate();
  const formId = useId();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const getInputStyle = (hasError) => {
    if (isSubmitting) {
      return 'border-gray-200 bg-gray-50/90 text-gray-500 cursor-not-allowed';
    }
    if (hasError) {
      return 'border-red-400 bg-[#FFF5F5] text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-400';
    }
    return 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600';
  };

  // Stagger animation variants for entrance
  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.06, // 60ms stagger per field
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Shake animation for error inputs
  const getShakeAnimation = (hasError) => {
    if (!hasError) return { x: 0 };
    return {
      x: [-6, 6, -4, 4, -2, 2, 0],
      transition: { duration: 0.35 },
    };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[440px] mx-auto py-2"
    >
      {/* Header with Pill Badge */}
      <motion.div variants={itemVariants} className="space-y-1.5 mb-7">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-700">Tài khoản</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 pt-2">
          Tạo tài khoản
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Bắt đầu hành trình nghề nghiệp của bạn. Điền thông tin bên dưới để đăng ký.
        </p>
      </motion.div>

      {/* 409 Error Banner (Slide-in AnimatePresence) */}
      <AnimatePresence>
        {serverError409 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 rounded-xl border border-red-200 bg-[#FFF5F5] p-4 text-xs space-y-1.5 overflow-hidden shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-red-600">
              <ErrorCircleIcon />
              <span>Email này đã được đăng ký</span>
            </div>
            <div className="flex items-center gap-4 pl-5 pt-0.5">
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                Đăng nhập
              </Link>
              <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                Quên mật khẩu
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Role Selector with Framer Motion layoutId Highlight */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            Bạn đăng ký với vai trò
          </label>
          <LayoutGroup id="roleSelection">
            <div className="grid grid-cols-2 gap-3">
              {/* Job Seeker Card */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setValue('role', 'JOB_SEEKER')}
                className={`relative flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-colors duration-200 overflow-hidden ${watchedRole === 'JOB_SEEKER'
                    ? 'border-indigo-600'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                  }`}
              >
                {watchedRole === 'JOB_SEEKER' && (
                  <motion.div
                    layoutId="roleActiveHighlight"
                    className="absolute inset-0 bg-indigo-50/80 -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 shrink-0 transition-colors ${watchedRole === 'JOB_SEEKER' ? 'text-indigo-600' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-semibold text-xs sm:text-sm leading-tight truncate ${watchedRole === 'JOB_SEEKER' ? 'text-indigo-700' : 'text-gray-800'}`}>
                      Người tìm việc
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 font-normal leading-tight mt-0.5">
                      (Job Seeker)
                    </span>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="relative z-10 ml-auto shrink-0 pl-3">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${watchedRole === 'JOB_SEEKER'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300 bg-white'
                      }`}
                  >
                    {watchedRole === 'JOB_SEEKER' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>

              {/* Recruiter Card */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setValue('role', 'RECRUITER')}
                className={`relative flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-colors duration-200 overflow-hidden ${watchedRole === 'RECRUITER'
                    ? 'border-indigo-600'
                    : 'border-gray-200 bg-white hover:bg-gray-50/50'
                  }`}
              >
                {watchedRole === 'RECRUITER' && (
                  <motion.div
                    layoutId="roleActiveHighlight"
                    className="absolute inset-0 bg-indigo-50/80 -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 shrink-0 transition-colors ${watchedRole === 'RECRUITER' ? 'text-indigo-600' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-semibold text-xs sm:text-sm leading-tight truncate ${watchedRole === 'RECRUITER' ? 'text-indigo-700' : 'text-gray-800'}`}>
                      Nhà tuyển dụng
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 font-normal leading-tight mt-0.5">
                      (Recruiter)
                    </span>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div className="relative z-10 ml-auto shrink-0 pl-3">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${watchedRole === 'RECRUITER'
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300 bg-white'
                      }`}
                  >
                    {watchedRole === 'RECRUITER' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            </div>
          </LayoutGroup>
        </motion.div>

        {/* Full Name */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700">
            Họ và tên
          </label>
          <motion.div animate={getShakeAnimation(!!errors.fullName)} className="relative">
            <input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên của bạn"
              autoComplete="name"
              disabled={isSubmitting}
              {...register('fullName')}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all duration-150 ${getInputStyle(
                !!errors.fullName
              )}`}
            />
            {isSubmitting && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <LockIcon />
              </span>
            )}
          </motion.div>
          <FieldError message={errors.fullName?.message} id="fullName-error" />
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
            Email
          </label>
          <motion.div animate={getShakeAnimation(!!errors.email)} className="relative">
            <input
              id="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              autoComplete="email"
              disabled={isSubmitting}
              {...register('email')}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all duration-150 ${getInputStyle(
                !!errors.email
              )}`}
            />
            {isSubmitting && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <LockIcon />
              </span>
            )}
          </motion.div>
          <FieldError message={errors.email?.message} id="email-error" />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
            Mật khẩu
          </label>
          <motion.div animate={getShakeAnimation(!!errors.password)} className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tạo mật khẩu"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register('password')}
              className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs sm:text-sm outline-none transition-all duration-150 ${getInputStyle(
                !!errors.password
              )}`}
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </motion.div>
          <FieldError message={errors.password?.message} id="password-error" />

          {/* Password Strength Section */}
          <PasswordStrengthSection password={watchedPassword} hasError={!!errors.password} />
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={itemVariants} className="space-y-1 pt-1">
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700">
            Xác nhận mật khẩu
          </label>
          <motion.div animate={getShakeAnimation(!!errors.confirmPassword)} className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register('confirmPassword')}
              className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs sm:text-sm outline-none transition-all duration-150 ${getInputStyle(
                !!errors.confirmPassword
              )}`}
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </motion.div>
          <FieldError message={errors.confirmPassword?.message} id="confirmPassword-error" />
        </motion.div>

        {/* Submit Button with Hover & Tap animation */}
        <motion.div variants={itemVariants} className="pt-2">
          {isSubmitting ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EEF2F6] py-3 text-sm font-medium text-gray-500 cursor-not-allowed border border-gray-200"
            >
              <SpinnerIcon />
              <span>Đang xử lý...</span>
            </button>
          ) : (
            <motion.button
              type="submit"
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1"
            >
              Đăng ký
            </motion.button>
          )}
        </motion.div>
      </form>

      {/* Footer Link */}
      <motion.p variants={itemVariants} className="text-center text-xs text-gray-500 pt-4">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
        >
          Đăng nhập
        </Link>
      </motion.p>

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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-gray-900 px-5 py-3 text-xs font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
