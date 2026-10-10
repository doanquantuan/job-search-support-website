import { motion, useReducedMotion } from 'framer-motion';
import { AuthIllustration } from './AuthIllustration';

export function AuthBanner({ mode = 'register' }) {
  const shouldReduce = useReducedMotion();
  const isLogin = mode === 'login';
  const isForgotPassword = mode === 'forgot-password';
  const isResetPassword = mode === 'reset-password';

  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full w-full max-w-[420px] flex-col justify-between py-10 sm:py-12 px-4 sm:px-6 mx-auto select-none"
    >
      {/* Top Header Badge */}
      <motion.div variants={itemVariants} className="flex items-center justify-between text-xs w-full">
        <span className="font-bold text-orange-600 tracking-wider uppercase">
          {isLogin
            ? 'ĐĂNG NHẬP HỆ THỐNG'
            : isForgotPassword
            ? 'KHÔI PHỤC TÀI KHOẢN'
            : isResetPassword
            ? 'ĐẶT LẠI MẬT KHẨU'
            : 'KHỞI ĐẦU HÀNH TRÌNH'}
        </span>
        {isForgotPassword && <span className="font-medium text-gray-400">Bước 1 / 3</span>}
        {isResetPassword && <span className="font-medium text-gray-400">Bước 3 / 3</span>}
        {mode === 'register' && <span className="font-medium text-gray-400">Bước 1 / 2</span>}
      </motion.div>

      {/* Center Hero Animation */}
      <div className="my-auto py-8 w-full flex items-center justify-center">
        <motion.div variants={itemVariants} className="w-full">
          <AuthIllustration />
        </motion.div>
      </div>

      {/* Steps Breadcrumb */}
      {mode === 'register' && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-xs font-medium pb-4">
          <span className="font-semibold text-orange-600">Thông tin đăng ký</span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-gray-400">Xác thực OTP</span>
        </motion.div>
      )}

      {(isForgotPassword || isResetPassword) && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-xs font-medium pb-4">
          <span className={isForgotPassword ? "font-semibold text-orange-600" : "flex items-center gap-1 text-gray-400"}>
            {isResetPassword && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            Nhập email
          </span>
          <span className="h-px w-5 bg-gray-300" />
          <span className="flex items-center gap-1 text-gray-400 font-medium">
            {isResetPassword && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            Xác thực OTP
          </span>
          <span className="h-px w-5 bg-gray-300" />
          <span className={isResetPassword ? "font-semibold text-orange-600" : "text-gray-400"}>
            Đặt lại mật khẩu
          </span>
        </motion.div>
      )}

      {/* Bottom Legal / Trust Line */}
      <motion.div variants={itemVariants} className="text-center text-xs text-gray-400">
        © Jobloria • Nền tảng tuyển dụng thông minh
      </motion.div>
    </motion.div>
  );
}
