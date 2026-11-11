/**
 * ==============================================================================
 * Central Animation Utilities & Variants (animations.js)
 * ==============================================================================
 *
 * Designed to provide smooth, Apple/Rauno/Emil Kowalski-grade animations:
 * - High-precision deceleration curves: cubic-bezier(0.16, 1, 0.3, 1)
 * - GPU-accelerated transforms (translateY, scale, opacity)
 * - Zero Layout Shifts (CLS = 0)
 * - Automatic prefers-reduced-motion fallback
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Standard Apple & modern UI easing curves
 */
export const APPLE_EASE = [0.16, 1, 0.3, 1];
export const SPRING_TRANSITION = { type: 'spring', stiffness: 400, damping: 28 };

/**
 * Framer Motion Animation Variants
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: custom,
      ease: APPLE_EASE,
    },
  }),
};

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom,
      ease: APPLE_EASE,
    },
  }),
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: custom,
      ease: APPLE_EASE,
    },
  }),
};

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Custom hook to detect when page is scrolled past a threshold
 * Used for dynamic navbar backdrop blur and shadow transitions.
 */
export function useScrolled(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}

/**
 * Custom hook to detect currently visible section in the viewport
 * for the active navbar indicator.
 */
export function useActiveSection(sectionIds = ['home', 'about', 'projects', 'skills', 'education', 'certifications', 'contact']) {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

/**
 * Check if the visitor prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);

    const onChange = (e) => setReduced(e.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
