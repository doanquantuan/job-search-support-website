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
        <span className="font-bold text-indigo-600 tracking-wider uppercase">
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
            Tạo tài khoản để tìm công việc phù hợp hoặc kết nối với ứng viên cho đội ngũ của bạn.
          </p>
        </motion.div>

        {/* Steps Breadcrumb */}
        <motion.div variants={itemVariants} className="mt-8 flex items-center gap-3 text-xs font-medium">
          <span className="font-semibold text-indigo-600">Thông tin đăng ký</span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-gray-400">Xác thực email</span>
        </motion.div>
      </div>

      {/* Bottom Footer Shield */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs text-gray-400 pt-4 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Khởi đầu an toàn với tài khoản của bạn.</span>
      </motion.div>
    </motion.div>
  );
}
