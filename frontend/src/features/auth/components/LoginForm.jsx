import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { authApi } from '@/features/auth/services/authApi';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { useAuthStore } from '@/store/useAuthStore';
import { FormInput } from './common/FormInput';
import { PasswordInput } from './common/PasswordInput';
import { FieldError } from './common/FieldError';

export function LoginForm() {
  const navigate = useNavigate();
  const formId = useId();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loginSuccess = useAuthStore((state) => state.loginSuccess);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      const res = await authApi.login({
        email: data.email.trim(),
        password: data.password,
      });
      const { user, accessToken } = res.data;
      loginSuccess(user, accessToken);
      setSuccess(`Đăng nhập thành công! Chào mừng ${user.fullName || user.email}`);
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      setError(message);
    }
  };

  const handleOAuthLogin = (provider) => {
    // Sẵn sàng tích hợp luồng OAuth của Backend / API Gateway
    alert(`Chức năng đăng nhập bằng ${provider} đang được kết nối.`);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Header - Cùng phong cách với RegisterForm */}
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
          Đăng nhập
        </h1>
      </div>

      {/* Thông báo lỗi */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mb-4 rounded-md border border-red-200 bg-red-50/70 p-3 text-xs font-medium text-red-600 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thông báo thành công */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mb-4 rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-xs font-medium text-emerald-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Login Buttons: Google & Facebook */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {/* Google Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOAuthLogin('Google')}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 px-3 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50/70 hover:border-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        {/* Facebook Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleOAuthLogin('Facebook')}
          className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2.5 px-3 text-xs font-medium text-gray-700 shadow-2xs hover:bg-gray-50/70 hover:border-gray-400 transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative text-center text-xs my-5 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-gray-200">
        <span className="relative z-10 bg-white px-2.5 text-gray-400 font-medium">
          Hoặc đăng nhập bằng email
        </span>
      </div>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Nhập mật khẩu của bạn"
            autoComplete="current-password"
            disabled={isSubmitting}
            error={!!errors.password}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} id="password-error" />
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
              'Đăng nhập'
            )}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="text-center text-xs text-gray-500 pt-5">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
