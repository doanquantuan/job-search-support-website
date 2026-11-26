import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Building2, User, ArrowLeft } from 'lucide-react';

import { authApi } from '@/features/auth/services/authApi';
import { loginSchema } from '@/features/auth/schemas/loginSchema';
import { useAuthStore } from '@/store/useAuthStore';
import { useFacebookLogin } from '@/features/auth/hooks/useFacebookLogin';
import { FormInput } from './common/FormInput';
import { PasswordInput } from './common/PasswordInput';
import { FieldError } from './common/FieldError';
import { CircleAlert, Check } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export function LoginForm({ mode = 'candidate' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const formId = useId();

  const isRecruiter = mode === 'recruiter' || location.pathname.startsWith('/recruiter');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState('');

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
    setUnverifiedEmail('');
    const trimmedEmail = data.email.trim();
    try {
      const expectedRole = isRecruiter ? 'RECRUITER' : 'JOB_SEEKER';
      const response = await authApi.login({
        email: trimmedEmail,
        password: data.password,
        expectedRole,
      });

      const { user, accessToken } = response.data;

      if (!isRecruiter && user.role === 'RECRUITER') {
        setError(
          <span>
            Tài khoản này là <strong>Nhà tuyển dụng</strong>. Vui lòng chuyển sang{' '}
            <Link to="/recruiter/login" className="underline font-bold text-white hover:text-base-100">
              Cổng đăng nhập Nhà tuyển dụng
            </Link>!
          </span>
        );
        return;
      }

      if (isRecruiter && user.role === 'JOB_SEEKER') {
        setError(
          <span>
            Tài khoản này là <strong>Người tìm việc</strong>. Vui lòng chuyển sang{' '}
            <Link to="/login" className="underline font-bold text-white hover:text-base-100">
              Cổng đăng nhập Người tìm việc
            </Link>!
          </span>
        );
        return;
      }

      loginSuccess(user, accessToken);
      setSuccess(`Đăng nhập thành công! Chào mừng ${user.fullName || user.email}`);
      setTimeout(() => {
        if (user?.role === 'RECRUITER' || isRecruiter) {
          navigate('/recruiter');
        } else {
          navigate('/');
        }
      }, 700);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
      const isNotVerified =
        err.response?.data?.code === 'ACCOUNT_NOT_VERIFIED' ||
        message.includes('chưa được xác thực');

      if (isNotVerified) {
        setUnverifiedEmail(trimmedEmail);
        setError(message);
      } else if (err.response?.status === 403 || message.includes('Nhà tuyển dụng') || message.includes('Người tìm việc')) {
        const targetLink = isRecruiter ? '/login' : '/recruiter/login';
        const targetText = isRecruiter ? 'Cổng Người tìm việc' : 'Cổng Nhà tuyển dụng';
        setError(
          <span>
            {message}{' '}
            <Link to={targetLink} className="underline font-bold text-white hover:text-base-100">
              [Chuyển sang {targetText}]
            </Link>
          </span>
        );
      } else {
        setError(message);
      }
    }
  };

  const handleVerifyNow = async () => {
    if (!unverifiedEmail || isResendingOtp) return;
    setIsResendingOtp(true);
    try {
      await authApi.resendOtp({
        email: unverifiedEmail,
        purpose: 'REGISTER',
      });
      navigate('/verify-otp', {
        state: {
          email: unverifiedEmail,
          purpose: 'REGISTER',
          role: isRecruiter ? 'RECRUITER' : 'JOB_SEEKER',
        },
      });
    } catch (err) {
      setUnverifiedEmail('');
      setError(err.response?.data?.message || 'Không thể gửi email xác thực. Vui lòng thử lại!');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleOAuthSuccess = async (provider, token) => {
    setError('');
    setSuccess('');
    setUnverifiedEmail('');
    try {
      const expectedRole = isRecruiter ? 'RECRUITER' : 'JOB_SEEKER';
      const response = await authApi.oauthLogin({
        provider: provider.toUpperCase(),
        token,
        role: expectedRole,
      });
      const { user, accessToken } = response.data;

      if (!isRecruiter && user.role === 'RECRUITER') {
        setError(
          <span>
            Tài khoản {provider} này đã đăng ký vai trò <strong>Nhà tuyển dụng</strong>. Vui lòng chuyển sang{' '}
            <Link to="/recruiter/login" className="underline font-bold text-white hover:text-base-100">
              Cổng đăng nhập Nhà tuyển dụng
            </Link>!
          </span>
        );
        return;
      }

      if (isRecruiter && user.role === 'JOB_SEEKER') {
        setError(
          <span>
            Tài khoản {provider} này đã đăng ký vai trò <strong>Người tìm việc</strong>. Vui lòng chuyển sang{' '}
            <Link to="/login" className="underline font-bold text-white hover:text-base-100">
              Cổng đăng nhập Người tìm việc
            </Link>!
          </span>
        );
        return;
      }

      loginSuccess(user, accessToken);
      setSuccess(`Đăng nhập bằng ${provider} thành công! Chào mừng ${user.fullName || user.email}`);
      setTimeout(() => {
        if (user?.role === 'RECRUITER' || isRecruiter) {
          navigate('/recruiter');
        } else {
          navigate('/');
        }
      }, 700);
    } catch (err) {
      const message =
        err.response?.data?.message || `Đăng nhập bằng ${provider} thất bại. Vui lòng thử lại!`;

      if (err.response?.status === 403 || message.includes('Nhà tuyển dụng') || message.includes('Người tìm việc')) {
        const targetLink = isRecruiter ? '/login' : '/recruiter/login';
        const targetText = isRecruiter ? 'Cổng Người tìm việc' : 'Cổng Nhà tuyển dụng';
        setError(
          <span>
            {message}{' '}
            <Link to={targetLink} className="underline font-bold text-white hover:text-base-100">
              [Chuyển sang {targetText}]
            </Link>
          </span>
        );
      } else {
        setError(message);
      }
    } finally {
      setIsOAuthLoading(false);
      setOauthProvider('');
    }
  };

  // Google OAuth Hook
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleOAuthSuccess('Google', tokenResponse.access_token),
    scope: 'email profile openid',
    onError: () => {
      setError('Không thể kết nối với tài khoản Google. Vui lòng thử lại!');
      setIsOAuthLoading(false);
      setOauthProvider('');
    },
  });

  // Facebook OAuth Hook
  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
  const { login: triggerFacebookLogin } = useFacebookLogin({
    appId: fbAppId,
    onSuccess: (authResponse) => handleOAuthSuccess('Facebook', authResponse.accessToken),
    onError: (err) => {
      setError(err?.message || 'Không thể kết nối với tài khoản Facebook.');
      setIsOAuthLoading(false);
      setOauthProvider('');
    },
  });

  const handleOAuthLogin = (provider) => {
    if (provider === 'Google') {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        setError('Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong frontend/.env');
        return;
      }
      setIsOAuthLoading(true);
      setOauthProvider('Google');
      triggerGoogleLogin();
    } else if (provider === 'Facebook') {
      if (!fbAppId) {
        setError('Chưa cấu hình VITE_FACEBOOK_APP_ID trong frontend/.env');
        return;
      }
      setIsOAuthLoading(true);
      setOauthProvider('Facebook');
      triggerFacebookLogin();
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="badge badge-primary badge-sm p-2 rounded-md text-primary-content shadow-xs">
            {isRecruiter ? (
              <Building2 className="h-3.5 w-3.5" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="text-xs font-semibold text-base-content/70">
            {isRecruiter ? 'Dành cho Nhà tuyển dụng' : 'Dành cho Người tìm việc'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content pt-1">
          {isRecruiter ? 'Đăng nhập tuyển dụng' : 'Đăng nhập'}
        </h1>

      </div>

      {/* Thông báo lỗi */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="alert alert-error mb-4 py-2.5 px-3 text-xs font-medium rounded-btn shadow-xs flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {unverifiedEmail && (
              <button
                type="button"
                onClick={handleVerifyNow}
                disabled={isResendingOtp}
                className="btn btn-xs bg-white/20 hover:bg-white/30 text-white border-white/40 shrink-0"
              >
                {isResendingOtp ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  'Xác thực ngay'
                )}
              </button>
            )}
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
            className="alert alert-success mb-4 py-2.5 px-3 text-xs font-medium text-white rounded-btn shadow-xs flex items-center gap-2"
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div className="form-control w-full space-y-1">
          <label htmlFor="email" className="label py-0">
            <span className="label-text text-xs font-semibold text-base-content/80">
              {isRecruiter ? 'Email công việc' : 'Email'}
            </span>
          </label>
          <FormInput
            id="email"
            type="email"
            placeholder={isRecruiter ? 'hr@company.com' : 'name@example.com'}
            autoComplete="email"
            disabled={isSubmitting}
            error={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} id="email-error" />
        </div>

        {/* Password */}
        <div className="form-control w-full space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label py-0">
              <span className="label-text text-xs font-semibold text-base-content/80">Mật khẩu</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary font-medium hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            error={!!errors.password}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} id="password-error" />
        </div>

        {/* Social Login Divider */}
        <div className="divider text-xs text-base-content/40 my-3">Hoặc</div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isOAuthLoading || isSubmitting}
            onClick={() => handleOAuthLogin('Google')}
            className="btn btn-outline btn-sm h-10 min-h-10 text-xs font-medium gap-2 border-base-300 hover:bg-base-200 hover:text-base-content hover:border-base-300"
          >
            {isOAuthLoading && oauthProvider === 'Google' ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FcGoogle className="h-4 w-4 shrink-0" />
            )}
            Google
          </button>

          <button
            type="button"
            disabled={isOAuthLoading || isSubmitting}
            onClick={() => handleOAuthLogin('Facebook')}
            className="btn btn-outline btn-sm h-10 min-h-10 text-xs font-medium gap-2 border-base-300 hover:bg-base-200 hover:text-base-content hover:border-base-300"
          >
            {isOAuthLoading && oauthProvider === 'Facebook' ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <FaFacebook className="h-4 w-4 shrink-0 text-[#1877F2]" />
            )}
            Facebook
          </button>
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
              'Đăng nhập'
            )}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="pt-4 space-y-2 text-center text-xs">
        <p className="text-base-content/60">
          {isRecruiter ? 'Chưa có tài khoản tuyển dụng? ' : 'Chưa có tài khoản? '}
          <Link
            to={isRecruiter ? '/recruiter/register' : '/register'}
            className="link link-primary link-hover font-semibold"
          >
            Đăng ký ngay
          </Link>
        </p>

        {/* Chuyển đổi giữa 2 vai trò để tránh nhầm lẫn */}
        <div className="pt-1.5 border-t border-base-200">
          {isRecruiter ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-base-content/60 hover:text-primary transition-colors font-medium py-0.5"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Bạn là Người tìm việc? Đăng nhập tại đây</span>
            </Link>
          ) : (
            <Link
              to="/recruiter/login"
              className="inline-flex items-center gap-1.5 text-base-content/60 hover:text-primary transition-colors font-medium py-0.5"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Bạn là Nhà tuyển dụng? Đăng nhập Cổng Doanh nghiệp</span>
            </Link>
          )}
        </div>

        {isRecruiter && (
          <div className="pt-0.5">
            <Link
              to="/recruiter"
              className="inline-flex items-center gap-1.5 text-base-content/50 hover:text-primary transition-colors font-medium text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Cổng giải pháp tuyển dụng</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
