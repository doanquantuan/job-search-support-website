import { motion } from 'framer-motion';
import { OtpIllustration } from './OtpIllustration';

export function OtpBanner({ purpose = 'REGISTER' }) {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full w-full max-w-[390px] flex-col justify-between py-10 sm:py-12 px-4 sm:px-6 mx-auto"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-gray-700">Tài khoản</span>
      </motion.div>

      {/* Center Illustration & Content */}
      <div className="my-auto py-6 w-full">
        <motion.div variants={itemVariants}>
          <OtpIllustration />
        </motion.div>

        {/* Title & Description */}
        <motion.div variants={itemVariants} className="mt-8 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Một bước nhỏ,
            <br />
            một khởi đầu mới.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            {purpose === 'REGISTER'
              ? 'Xác thực email để hoàn tất đăng ký và bắt đầu sử dụng tài khoản của bạn.'
              : 'Xác thực email để tiếp tục đặt lại mật khẩu và truy cập tài khoản của bạn.'}
          </p>
        </motion.div>

        {/* Steps Breadcrumb (Step 1 is marked as completed) */}
        <motion.div variants={itemVariants} className="mt-8 flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-gray-600 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{purpose === 'REGISTER' ? 'Thông tin đăng ký' : 'Khôi phục mật khẩu'}</span>
          </span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="font-semibold text-indigo-600">Xác thực email</span>
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
        <span>Không chia sẻ mã OTP với bất kỳ ai.</span>
      </motion.div>
    </motion.div>
  );
}
