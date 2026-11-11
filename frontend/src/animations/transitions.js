/**
 * ==============================================================================
 * Central Motion Physics & Easing System (transitions.js)
 * ==============================================================================
 *
 * Provides Apple/Rauno/Emil Kowalski precision deceleration curves:
 * - High-precision deceleration curves: cubic-bezier(0.16, 1, 0.3, 1)
 * - GPU-accelerated transforms (translateY, scale, opacity)
 * - Zero Layout Shifts (CLS = 0)
 */

export const APPLE_EASE = [0.16, 1, 0.3, 1];
export const SPRING_TRANSITION = { type: 'spring', stiffness: 420, damping: 30 };

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay,
      ease: APPLE_EASE,
    },
  }),
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: APPLE_EASE,
    },
  }),
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.55,
      delay,
      ease: APPLE_EASE,
    },
  }),
};

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});
