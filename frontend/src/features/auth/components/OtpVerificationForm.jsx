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

      // If RESET_PASSWORD flow, navigate to /reset-password
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
        // Clear and focus on error after a brief delay
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
      validityCountdown.reset(300); // Reset 5-minute countdown
      resendCooldown.reset(60);     // Reset 60s cooldown
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

  // Render: SUCCESS SCREEN 
  if (isSuccess && purpose === 'REGISTER') {
    return (
      <div className="w-full max-w-[440px] mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center text-center space-y-6"
        >
          {/* Green Checkmark Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Đăng ký thành công
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Email của bạn đã được xác thực. Bạn có thể đăng nhập để sử dụng tài khoản.
            </p>
          </div>

          {/* Button login */}
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
              Đăng nhập
            </button>
          </div>

          {/* Masked Email Footer */}
          <p className="text-xs text-gray-400 pt-2">
            Email đã xác thực: <span className="font-medium text-gray-600">{maskEmail(email)}</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // STANDARD OTP VERIFICATION FORM 
  return (
    <div className="w-full max-w-[450px] mx-auto py-2">
      {/* Top Header Bar: Back link + Step 2/2 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-8">
        <Link
          to={purpose === 'REGISTER' ? '/register' : '/forgot-password'}
          className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <span>←</span>
          <span>{purpose === 'REGISTER' ? 'Quay lại đăng ký' : 'Quay lại quên mật khẩu'}</span>
        </Link>
        <span className="font-medium text-gray-400">Bước 2 / 2</span>
      </div>

      {/* Main Content Area */}
      <form onSubmit={handleVerify} className={`space-y-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Envelope Icon + Badge + Title */}
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50/90 text-indigo-600 border border-indigo-100/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </motion.div>

          <span className="block text-xs font-bold text-indigo-600 tracking-wider uppercase">
            {purpose === 'REGISTER' ? 'HOÀN TẤT ĐĂNG KÝ' : 'KHÔI PHỤC MẬT KHẨU'}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Xác thực email
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Chúng tôi đã gửi mã OTP đến{' '}
            <span className="font-medium text-gray-800">{maskEmail(email)}</span>
          </p>
        </div>

        {/* OTP Input Section */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-gray-700">
            Nhập mã xác thực gồm 6 chữ số
          </label>

          <OtpInput
            length={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={isSubmitting || isLocked}
            hasError={hasError}
            isSuccess={isSuccess}
          />

          {/* Progress bar indicating 5-minute countdown */}
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
            <motion.div
              className={`h-full transition-all duration-300 ${validityCountdown.seconds < 30
                ? 'bg-red-500'
                : validityCountdown.seconds < 60
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
                }`}
              style={{ width: `${validityCountdown.percentage}%` }}
            />
          </div>

          {/* Error Banner below inputs */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-red-200 bg-[#FFF5F5] p-3 text-xs text-red-600 flex items-center gap-2 overflow-hidden shadow-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${validityCountdown.seconds < 30 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Mã có hiệu lực trong{' '}
              <span
                className={`font-semibold ${isExpired
                  ? 'text-red-500'
                  : validityCountdown.seconds < 30
                    ? 'text-red-500 font-bold'
                    : 'text-indigo-600'
                  }`}
              >
                {validityCountdown.formattedTime}
              </span>
            </span>
          </div>
        </div>

        {/* Submit Button "Xác nhận" */}
        <div className="pt-2">
          {isComplete && !isExpired && !isLocked ? (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ y: -2, boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
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
                'Xác nhận'
              )}
            </motion.button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-[#EEF2F6] py-3.5 text-sm font-semibold text-gray-400 cursor-not-allowed border border-gray-100"
            >
              Xác nhận
            </button>
          )}
        </div>

        {/* Resend OTP Section */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-gray-500">
            Chưa nhận được mã?{' '}
            {resendCooldown.isRunning ? (
              <span className="font-semibold text-gray-400 cursor-not-allowed">
                Gửi lại mã ({resendCooldown.seconds}s)
              </span>
            ) : (
              <motion.button
                key="resend-active-btn"
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || isLocked}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: [0.95, 1.08, 1] }}
                transition={{ duration: 0.4 }}
                className={`font-semibold transition-all ${isExpired
                  ? 'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm hover:bg-indigo-100'
                  : 'text-indigo-600 hover:text-indigo-800 hover:underline'
                  }`}
              >
                Gửi lại mã
              </motion.button>
            )}
          </p>

          {isExpired && (
            <p className="text-[11px] text-amber-600 font-medium">
              Mã cũ đã hết hạn. Vui lòng bấm &quot;Gửi lại mã&quot; ở trên để nhận mã mới.
            </p>
          )}

          <p className="text-[11px] text-gray-400">
            Kiểm tra cả thư mục Spam nếu bạn chưa thấy email.
          </p>
        </div>

        {/* Security Notice Footer */}
        <p className="text-center text-[11px] text-gray-400 pt-6">
          Chỉ sử dụng mã được gửi đến email của bạn.
        </p>
      </form>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-gray-900 px-5 py-3 text-xs font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
