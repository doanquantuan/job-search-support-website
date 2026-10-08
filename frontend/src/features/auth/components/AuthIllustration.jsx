import { motion } from 'framer-motion';

export function AuthIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[340px] items-center justify-center py-6 select-none">
      {/* Background Orbit Rings */}
      <div className="absolute h-64 w-64 rounded-full border border-indigo-100/80 -z-0" />
      <div className="absolute h-80 w-80 rounded-full border border-dashed border-indigo-100/50 -z-0" />

      {/* Decorative floating dots */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute -left-2 top-8 h-3 w-3 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-1 bottom-16 h-2 w-2 rounded-full bg-indigo-400"
      />

      {/* Main Resume/Profile Card (Floating) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="relative z-10 w-52 rounded-2xl bg-white p-4 shadow-xl shadow-indigo-100/80 border border-slate-100"
      >
        {/* Avatar Box inside card */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50/90 text-indigo-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Placeholder Lines */}
        <div className="mt-3 space-y-2">
          <div className="h-2 w-28 rounded-full bg-indigo-200/80" />
          <div className="h-2 w-36 rounded-full bg-slate-100" />
          <div className="h-2 w-24 rounded-full bg-slate-100" />
        </div>

        {/* Small Bottom Tags */}
        <div className="mt-4 flex gap-2">
          <div className="h-4 w-12 rounded-md bg-indigo-50" />
          <div className="h-4 w-14 rounded-md bg-slate-100" />
        </div>
      </motion.div>

      {/* Floating Magnifying Glass Badge (Top Right) */}
      <motion.div
        animate={{ y: [0, -10, 0], x: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: 0.2 }}
        className="absolute -right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg shadow-indigo-100 border border-slate-100 text-indigo-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </motion.div>

      {/* Floating 3D Briefcase (Bottom Right) */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, -2, 0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        className="absolute -bottom-2 right-4 z-20 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
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
