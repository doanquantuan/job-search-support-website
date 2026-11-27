import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export function AuthIllustration() {
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
          Kết nối nhân sự Công nghệ Thông tin
        </p>
      </motion.div>

      {/* Top Right Icon Badge */}
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
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Bottom Left Verified Badge */}
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  );
}

export default AuthIllustration;
