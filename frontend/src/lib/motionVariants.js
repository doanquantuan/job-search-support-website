// Tập trung tất cả animation variants Framer Motion dùng chung cho toàn bộ Jobloria Frontend
// Import: import { fadeInUp, staggerContainer, ... } from '@/lib/motionVariants';

const withDelay = (baseTransition, delay) =>
  typeof delay === 'number' ? { ...baseTransition, delay } : baseTransition;

// ── Fade variants ──

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay) => ({
    opacity: 1,
    transition: withDelay({ duration: 0.4, ease: 'easeOut' }, delay),
  }),
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: withDelay({ duration: 0.5, ease: 'easeOut' }, delay),
  }),
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: withDelay({ duration: 0.4, ease: 'easeOut' }, delay),
  }),
};

// ── Scale variants ──

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay) => ({
    opacity: 1,
    scale: 1,
    transition: withDelay(
      { duration: 0.4, type: 'spring', stiffness: 200, damping: 20 },
      delay
    ),
  }),
};

export const scaleInBounce = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay) => ({
    opacity: 1,
    scale: 1,
    transition: withDelay({ type: 'spring', stiffness: 260, damping: 20 }, delay),
  }),
};

// ── Slide variants ──

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay) => ({
    opacity: 1,
    x: 0,
    transition: withDelay({ duration: 0.5, ease: 'easeOut' }, delay),
  }),
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay) => ({
    opacity: 1,
    x: 0,
    transition: withDelay({ duration: 0.5, ease: 'easeOut' }, delay),
  }),
};

// ── Stagger container ──

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.1) => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: staggerDelay, delayChildren },
  },
});

// ── List item variants (dùng cho AnimatePresence trên danh sách thêm/xóa) ──

export const listItemEnter = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.25, ease: 'easeIn' } },
};

// ── Banner / Slide crossfade (dùng cho AnimatePresence chuyển slide) ──

export const slideCrossfade = {
  initial: { opacity: 0, scale: 1.03 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.4, ease: 'easeIn' } },
};

// ── Shake (dùng cho error banner) ──

export const shakeIn = {
  hidden: { opacity: 0, x: 0 },
  visible: {
    opacity: 1,
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};
