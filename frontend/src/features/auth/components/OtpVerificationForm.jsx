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
      <div className="w-full max-w-[420px] mx-auto py-8">
        <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Đăng ký thành công
            </h1>
            <p className="text-xs text-gray-500">
              Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 active:bg-orange-700"
          >
            Đăng nhập
          </button>

          <p className="text-xs text-gray-400">
            Email đã xác thực: <span className="font-medium text-gray-600">{maskEmail(email)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] mx-auto py-2">
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

      <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs space-y-5">
        <form onSubmit={handleVerify} className={`space-y-5 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Xác thực email
            </h1>
            <p className="text-xs text-gray-500">
              Mã xác thực đã được gửi tới{' '}
              <span className="font-semibold text-gray-800">{maskEmail(email)}</span>
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-700 text-center">
              Nhập mã OTP gồm 6 chữ số
            </label>

            <OtpInput
              length={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={isSubmitting || isLocked}
              hasError={hasError}
              isSuccess={isSuccess}
            />

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Countdown timer */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 pt-1">
              <span>Hiệu lực còn:</span>
              <span className={`font-semibold ${isExpired ? 'text-red-500' : 'text-orange-600'}`}>
                {validityCountdown.formattedTime}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || isExpired || isLocked || isSubmitting}
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:bg-orange-700"
          >
            {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
          </button>

          {/* Resend */}
          <div className="text-center text-xs text-gray-500 pt-1 border-t border-gray-100">
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
                className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Gửi lại mã
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Toast */}
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
