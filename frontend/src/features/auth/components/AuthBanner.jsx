import { motion, useReducedMotion } from 'framer-motion';
import loginBg from '@/assets/login page.png';

export function AuthBanner({ mode = 'register' }) {
  const shouldReduce = useReducedMotion();
  const isLogin = mode === 'login';
  const isRecruiter = mode === 'recruiter';
  const isForgotPassword = mode === 'forgot-password';
  const isResetPassword = mode === 'reset-password';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative h-full w-full overflow-hidden select-none bg-white rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
    >
      {/* ── Background image ── */}
      <img
        src={loginBg}
        alt="Login background"
        className="absolute inset-0 w-full h-full object-contain object-center p-2"
        draggable={false}
      />

      {/* ── Content overlay ── */}
      <div className="relative z-10 flex h-full flex-col justify-between py-6 px-6">

        {/* Top label */}
        <motion.div variants={itemVariants} className="flex items-center justify-between text-xs">
          <span className="font-bold text-primary tracking-widest uppercase">
            {isLogin
              ? 'ĐĂNG NHẬP HỆ THỐNG'
              : isRecruiter
              ? 'CỔNG DOANH NGHIỆP'
              : isForgotPassword
              ? 'KHÔI PHỤC TÀI KHOẢN'
              : isResetPassword
              ? 'ĐẶT LẠI MẬT KHẨU'
              : 'KHỞI ĐẦU HÀNH TRÌNH'}
          </span>
          {isForgotPassword && <span className="font-medium text-base-content/50">Bước 1 / 3</span>}
          {isResetPassword && <span className="font-medium text-base-content/50">Bước 3 / 3</span>}
          {(mode === 'register' || isRecruiter) && (
            <span className="font-medium text-base-content/50">Bước 1 / 2</span>
          )}
        </motion.div>

        {/* Bottom area: steps + copyright */}
        <div className="space-y-2.5">
          {/* Steps Breadcrumb */}
          {(mode === 'register' || isRecruiter) && (
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-xs font-medium">
              <span className="font-semibold text-primary">
                {isRecruiter ? 'Thông tin tuyển dụng' : 'Thông tin đăng ký'}
              </span>
              <span className="h-px w-8 bg-base-300" />
              <span className="text-base-content/50">Xác thực OTP</span>
            </motion.div>
          )}

          {(isForgotPassword || isResetPassword) && (
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-xs font-medium">
              <span className={isForgotPassword ? 'font-semibold text-primary' : 'flex items-center gap-1 text-base-content/50'}>
                {isResetPassword && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Nhập email
              </span>
              <span className="h-px w-5 bg-base-300" />
              <span className="flex items-center gap-1 text-base-content/50 font-medium">
                {isResetPassword && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-success" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Xác thực OTP
              </span>
              <span className="h-px w-5 bg-base-300" />
              <span className={isResetPassword ? 'font-semibold text-primary' : 'text-base-content/50'}>
                Đặt lại mật khẩu
              </span>
            </motion.div>
          )}

          {/* Copyright */}
          <motion.div variants={itemVariants} className="text-center text-xs text-base-content/50">
            © Jobloria • Nền tảng tuyển dụng và tìm kiếm việc làm
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
