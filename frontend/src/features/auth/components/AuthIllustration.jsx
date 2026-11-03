import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export function AuthIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[420px] items-center justify-center py-10 select-none">
      {/* Background Large Pulsing Glow & Rotating Orbit Rings */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="absolute h-72 w-72 rounded-full bg-gradient-to-tr from-accent/40 via-primary/20 to-secondary/30 blur-3xl -z-0"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        className="absolute h-80 w-80 rounded-full border border-primary/20 -z-0"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 55, ease: 'linear' }}
        className="absolute h-96 w-96 rounded-full border border-dashed border-accent/30 -z-0"
      />

      {/* Floating Decorative Dots */}
      <motion.div
        animate={{ y: [0, -14, 0], scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute left-2 top-6 h-3.5 w-3.5 rounded-full bg-primary shadow-md shadow-primary/30"
      />
      <motion.div
        animate={{ y: [0, 12, 0], scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut', delay: 0.5 }}
        className="absolute right-4 bottom-8 h-3 w-3 rounded-full bg-accent shadow-sm"
      />

      {/* Center Giant Floating Logo Hero Card (No extra text, Pure Visual) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-[340px] rounded-2xl bg-base-100/95 backdrop-blur-sm px-8 py-10 shadow-2xl shadow-primary/10 border border-primary/20 flex items-center justify-center"
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
        className="absolute -right-2 top-2 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-100 shadow-xl shadow-primary/10 border border-primary/20 text-primary"
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

      {/* Floating Success / Verified Badge (Bottom Left) */}
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.7 }}
        className="absolute -bottom-3 -left-1 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-secondary to-primary text-white shadow-xl shadow-primary/30"
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default AuthIllustration;
