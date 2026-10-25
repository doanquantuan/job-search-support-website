import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export function AuthIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center py-10 select-none">
      {/* Background Large Pulsing Glow & Rotating Orbit Rings */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="absolute h-72 w-72 rounded-full bg-gradient-to-tr from-orange-300/40 via-amber-200/30 to-orange-400/20 blur-3xl -z-0"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        className="absolute h-80 w-80 rounded-full border border-orange-200/50 -z-0"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 55, ease: 'linear' }}
        className="absolute h-96 w-96 rounded-full border border-dashed border-orange-200/40 -z-0"
      />

      {/* Floating Decorative Dots */}
      <motion.div
        animate={{ y: [0, -14, 0], scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute left-2 top-6 h-3.5 w-3.5 rounded-full bg-orange-500 shadow-md shadow-orange-300"
      />
      <motion.div
        animate={{ y: [0, 12, 0], scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 0.5 }}
        className="absolute right-4 bottom-8 h-3 w-3 rounded-full bg-amber-400 shadow-sm"
      />

      {/* Center Giant Floating Logo Hero Card (No extra text, Pure Visual) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[340px] rounded-2xl bg-white/95 backdrop-blur-sm px-8 py-10 shadow-2xl shadow-orange-200/60 border border-orange-100 flex items-center justify-center"
      >
        <motion.img
          src={logoImg}
          alt="Jobloria Logo"
          className="w-full h-auto max-h-24 sm:max-h-28 object-contain filter drop-shadow-md"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [1, 1.03, 1], opacity: 1 }}
          transition={{
            scale: { repeat: Infinity, duration: 5, ease: 'easeInOut' },
            opacity: { duration: 0.5 },
          }}
        />
      </motion.div>

      {/* Floating Sparkle / Career Growth Badge (Top Right) */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.3 }}
        className="absolute -right-2 top-2 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-orange-200/80 border border-orange-100 text-orange-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </motion.div>

      {/* Floating Job Search Briefcase Badge (Bottom Left) */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -bottom-3 -left-1 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white shadow-xl shadow-orange-400/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
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
      </motion.div>
    </div>
  );
}
