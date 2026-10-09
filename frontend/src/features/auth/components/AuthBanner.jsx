import { motion, useReducedMotion } from 'framer-motion';
import { AuthIllustration } from './AuthIllustration';

export function AuthBanner() {
  const shouldReduce = useReducedMotion();

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
      className="flex h-full w-full max-w-[390px] flex-col justify-between py-10 sm:py-12 px-4 sm:px-6 mx-auto"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between text-xs w-full">
        <span className="font-bold text-orange-600 tracking-wider uppercase">
          KHỞI ĐẦU HÀNH TRÌNH
        </span>
        <span className="font-medium text-gray-400">Bước 1 / 2</span>
      </motion.div>

      {/* Center Illustration - Content */}
      <div className="my-auto py-6 w-full">
        <motion.div variants={itemVariants}>
          <AuthIllustration />
        </motion.div>

        {/* Title - Description */}
        <motion.div variants={itemVariants} className="mt-8 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Một khởi đầu mới,
            <br />
            một cơ hội phù hợp.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Khám phá hàng ngàn cơ hội việc làm chất lượng hoặc kết nối với những nhân tài xuất sắc cùng Jobloria.
          </p>
        </motion.div>

        {/* Steps Breadcrumb */}
        <motion.div variants={itemVariants} className="mt-8 flex items-center gap-3 text-xs font-medium">
          <span className="font-semibold text-orange-600">Thông tin đăng ký</span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-gray-400">Xác thực OTP</span>
        </motion.div>
      </div>

      {/* Bottom Legal / Trust Line */}
      <motion.div variants={itemVariants} className="text-xs text-gray-400">
        © Jobloria • Nền tảng tuyển dụng thông minh
      </motion.div>
    </motion.div>
  );
}
