import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export function OtpIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[400px] items-center justify-center py-8 select-none">
      {/* Center Logo Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[340px] rounded-2xl bg-base-100 px-8 py-12 shadow-sm border border-base-200 flex flex-col items-center justify-center gap-4"
      >
        <img
          src={logoImg}
          alt="Jobloria Logo"
          className="w-full h-auto max-h-24 sm:max-h-28 object-contain"
        />
        <p className="text-xs font-medium text-base-content/60 text-center">
          Xác thực tài khoản an toàn
        </p>
      </motion.div>

      {/* Top Right Shield Badge */}
      <div className="absolute -right-2 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-xl bg-base-100 shadow-sm border border-base-200 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      </div>

      {/* Bottom Left Lock Badge */}
      <div className="absolute -bottom-2 -left-1 z-20 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
    </div>
  );
}

export default OtpIllustration;
