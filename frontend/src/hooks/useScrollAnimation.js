import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook: trigger animation khi element lần đầu xuất hiện trong viewport.
 *
 * @param {number} threshold - Tỉ lệ phần tử phải hiện trong viewport (0 → 1). Mặc định 0.15.
 * @returns {{ ref: React.RefObject, isInView: boolean }}
 *
 * @example
 * const { ref, isInView } = useScrollAnimation(0.2);
 * <motion.section ref={ref} variants={fadeInUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
 */
export const useScrollAnimation = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    // Respect prefers-reduced-motion: nếu user bật reduce motion thì hiển thị luôn
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target); // Chỉ animate 1 lần
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  return { ref, isInView };
};

export default useScrollAnimation;
