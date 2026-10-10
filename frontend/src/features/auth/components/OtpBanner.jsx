import { motion } from 'framer-motion';
import { OtpIllustration } from './OtpIllustration';

export function OtpBanner() {
  const containerVariants = {
    hidden: { opacity: 0, y: 16 },
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
    hidden: { opacity: 0, y: 12 },
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
          XÁC THỰC BẢO MẬT
        </span>
        <span className="font-medium text-gray-400">Bước 2 / 2</span>
      </motion.div>

      {/* Center Giant Animated Illustration */}
      <div className="my-auto py-8 w-full flex items-center justify-center">
        <motion.div variants={itemVariants} className="w-full">
          <OtpIllustration />
        </motion.div>
      </div>

      {/* Steps Breadcrumb - Thống nhất chuẩn với Register */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-xs font-medium pb-4">
        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Thông tin đăng ký</span>
        </span>
        <span className="h-px w-8 bg-gray-300" />
        <span className="font-semibold text-orange-600">Xác thực OTP</span>
      </motion.div>

      {/* Bottom Legal / Trust Line */}
      <motion.div variants={itemVariants} className="text-center text-xs text-gray-400">
        © Jobloria • Nền tảng tuyển dụng thông minh
      </motion.div>
    </motion.div>
  );
}
