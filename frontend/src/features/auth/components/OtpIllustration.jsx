import { motion } from 'framer-motion';

export function OtpIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[340px] items-center justify-center py-8 select-none">
      {/* Background Orbit Rings */}
      <div className="absolute h-64 w-64 rounded-full border border-indigo-100/80 -z-0" />
      <div className="absolute h-80 w-80 rounded-full border border-dashed border-indigo-100/50 -z-0" />

      {/* Decorative floating dots */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        className="absolute -left-2 top-8 h-3 w-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-1 bottom-16 h-2 w-2 rounded-full bg-indigo-400"
      />

      {/* Main Tilted Envelope Card */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 0, -2] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="relative z-10 flex h-48 w-56 flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100/80 border border-slate-100"
      >
        {/* Envelope Icon */}
        <div className="flex h-20 w-28 items-center justify-center rounded-2xl border-2 border-indigo-500/80 bg-indigo-50/40 text-indigo-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Floating Checkmark Badge (Bottom Right of card) */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -bottom-1 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
    </div>
  );
}
