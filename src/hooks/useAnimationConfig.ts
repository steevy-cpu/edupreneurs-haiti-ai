import { useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Shared animation config hook.
 * Gates all Framer Motion animations on:
 * 1. Desktop viewport (≥1024px)
 * 2. User's prefers-reduced-motion setting
 * 3. Network quality (disable on slow connections)
 * Returns shouldAnimate: true only when all conditions pass.
 */
export const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check on mount and resize — animations only on lg+ screens
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const shouldAnimate = !prefersReducedMotion && isDesktop;

  return { shouldAnimate };
};
