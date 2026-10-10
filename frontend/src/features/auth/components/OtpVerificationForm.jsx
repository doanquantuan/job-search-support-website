import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OtpInput } from './OtpInput';
import { authApi } from '../services/authApi';
import { useCountdown } from '@/hooks/useCountdown';

export const maskEmail = (email = '') => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local}***@${domain}`;
  }
  return `${local.slice(0, 2)}***@${domain}`;
};

export function OtpVerificationForm({ email, purpose = 'REGISTER' }) {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(5);
  const [toast, setToast] = useState(null);

  // 5-minute validity timer
  const validityCountdown = useCountdown(300, true, () => {
    setErrorMessage('Mã OTP đã hết hạn');
  });

  // 60-second cooldown for Resend OTP button
  const resendCooldown = useCountdown(60, true);

  const otpCode = otp.join('');
  const isComplete = otpCode.length === 6;
  const isExpired = validityCountdown.isExpired;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleOtpChange = (newOtp) => {
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
    setOtp(newOtp);
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!isComplete || isSubmitting || isExpired || isLocked) return;

    setIsSubmitting(true);
    setHasError(false);
    setErrorMessage('');

    try {
      await authApi.verifyOtp({
        email,
        otp: otpCode,
        purpose,
        type: purpose === 'REGISTER' ? 'verify-email' : 'forgot-password',
      });

      setIsSuccess(true);

      if (purpose === 'RESET_PASSWORD') {
        setTimeout(() => {
          navigate('/reset-password', {
            state: { email, otp: otpCode },
          });
        }, 800);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Mã OTP không hợp lệ';

      setHasError(true);

      if (status === 429) {
        setIsLocked(true);
        const mins = err.response?.data?.retryAfterMinutes || 5;
        setLockoutMinutes(mins);
        setErrorMessage(`Bạn đã nhập sai quá nhiều lần, vui lòng thử lại sau ${mins} phút`);
      } else if (msg.includes('mục đích') || msg.includes('không dùng được')) {
        setErrorMessage('Mã OTP không dùng được cho yêu cầu này');
      } else if (msg.includes('hết hạn') || isExpired) {
        setErrorMessage('Mã OTP đã hết hạn');
      } else {
        setErrorMessage('Mã OTP không hợp lệ');
        setTimeout(() => {
          setOtp(['', '', '', '', '', '']);
        }, 600);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown.isRunning || isSubmitting || isLocked) return;

    setIsSubmitting(true);
    try {
      await authApi.resendOtp({
        email,
        purpose,
        type: purpose === 'REGISTER' ? 'verify-email' : 'forgot-password',
      });

      showToast('Đã gửi mã mới');
      setOtp(['', '', '', '', '', '']);
      setHasError(false);
      setErrorMessage('');
      validityCountdown.reset(300);
      resendCooldown.reset(60);
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setIsLocked(true);
        setErrorMessage('Bạn đã yêu cầu gửi mã quá nhiều lần, vui lòng thử lại sau');
      } else {
        showToast(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (isSuccess && purpose === 'REGISTER') {
    return (
      <div className="w-full max-w-[440px] mx-auto py-2">
        <div className="space-y-1.5 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-emerald-600 text-white shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-700">Hoàn tất</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 pt-1">
            Đăng ký thành công
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập để bắt đầu trải nghiệm Jobloria.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 active:bg-orange-700"
          >
            Đăng nhập ngay
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          Email đã xác thực: <span className="font-medium text-gray-700">{maskEmail(email)}</span>
        </p>
      </div>
    );
  }

  // STANDARD OTP FORM - Đồng bộ 100% Header và Form flat không viền box
  return (
    <div className="w-full max-w-[440px] mx-auto py-2">
      {/* Back button */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
        <Link
          to={purpose === 'REGISTER' ? '/register' : '/forgot-password'}
          className="flex items-center gap-1 font-medium text-gray-600 hover:text-orange-600 transition-colors"
        >
          <span>←</span>
          <span>{purpose === 'REGISTER' ? 'Quay lại đăng ký' : 'Quay lại quên mật khẩu'}</span>
        </Link>
        <span className="font-medium text-gray-400">Bước 2 / 2</span>
      </div>

      {/* Header đồng bộ chuẩn với LoginForm / RegisterForm */}
      <div className="space-y-1.5 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-orange-500 text-white shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-700">Xác thực OTP</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 pt-1">
          Kiểm tra email của bạn
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          Chúng tôi đã gửi mã xác thực 6 chữ số đến{' '}
          <span className="font-semibold text-gray-800">{maskEmail(email)}</span>. Vui lòng nhập mã bên dưới để tiếp tục.
        </p>
      </div>

      {/* Thông báo lỗi */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="mb-4 rounded-md border border-red-200 bg-red-50/70 p-3 text-xs font-medium text-red-600 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleVerify} className={`space-y-4 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Mã xác thực (6 chữ số)
          </label>

          <OtpInput
            length={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={isSubmitting || isLocked}
            hasError={hasError}
            isSuccess={isSuccess}
          />

          {/* Countdown timer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>Hiệu lực của mã:</span>
            <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-orange-600'}`}>
              {validityCountdown.formattedTime}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isComplete || isExpired || isLocked || isSubmitting}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:bg-orange-700"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Đang xác nhận...</span>
              </>
            ) : (
              'Xác nhận mã OTP'
            )}
          </button>
        </div>

        {/* Resend OTP */}
        <div className="text-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          Chưa nhận được mã?{' '}
          {resendCooldown.isRunning ? (
            <span className="font-semibold text-gray-400">
              Gửi lại sau {resendCooldown.seconds}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting || isLocked}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
            >
              Gửi lại mã
            </button>
          )}
        </div>
      </form>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-md bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
