import { motion, useReducedMotion } from 'framer-motion';
import { AuthIllustration } from './AuthIllustration';

export function AuthBanner({ mode = 'register' }) {
  const shouldReduce = useReducedMotion();
  const isLogin = mode === 'login';

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
          {isLogin ? 'ĐĂNG NHẬP HỆ THỐNG' : 'KHỞI ĐẦU HÀNH TRÌNH'}
        </span>
        {!isLogin && <span className="font-medium text-gray-400">Bước 1 / 2</span>}
      </motion.div>

      {/* Center Hero Animation */}
      <div className="my-auto py-8 w-full flex items-center justify-center">
        <motion.div variants={itemVariants} className="w-full">
          <AuthIllustration />
        </motion.div>
      </div>

      {/* Steps Breadcrumb - CHỈ HIỂN THỊ KHI Ở TRANG REGISTER, TRANG LOGIN KHÔNG CÓ */}
      {!isLogin && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-xs font-medium pb-4">
          <span className="font-semibold text-orange-600">Thông tin đăng ký</span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-gray-400">Xác thực OTP</span>
        </motion.div>
      )}

      {/* Bottom Legal / Trust Line */}
      <motion.div variants={itemVariants} className="text-center text-xs text-gray-400">
        © Jobloria • Nền tảng tuyển dụng thông minh
      </motion.div>
    </motion.div>
  );
}
