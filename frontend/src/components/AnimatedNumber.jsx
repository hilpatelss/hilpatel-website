/**
 * ==============================================================================
 * Animated Number Counter Component (AnimatedNumber.jsx)
 * ==============================================================================
 *
 * Implements smooth counting animation for metrics and statistics:
 * - Triggers only once when entering the viewport.
 * - Preserves leading zeros (e.g., "03") and suffixes (e.g., "+").
 * - Fully respects prefers-reduced-motion accessibility.
 */

import React, { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../utils/animations';

export function AnimatedNumber({ value = '0', duration = 1100, className = '' }) {
  const reducedMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  // Parse string: e.g. "03" -> num 3, padLength 2, suffix ""
  // "05+" -> num 5, padLength 2, suffix "+"
  const parseNumber = (val) => {
    const raw = String(val).trim();
    const match = raw.match(/^([0-9]+)(.*)$/);
    if (!match) return { num: 0, padLength: 0, suffix: raw };
    const digits = match[1];
    const suffix = match[2] || '';
    const num = parseInt(digits, 10);
    const padLength = digits.startsWith('0') && digits.length > 1 ? digits.length : 0;
    return { num, padLength, suffix };
  };

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    const { num: targetNum, padLength, suffix } = parseNumber(value);
    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            observer.disconnect();

            const startTime = performance.now();

            const step = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out cubic curve: fast start, slow landing
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentNum = Math.round(targetNum * easeProgress);

              let formatted = String(currentNum);
              if (padLength > 0) {
                formatted = formatted.padStart(padLength, '0');
              }
              setDisplayValue(formatted + suffix);

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                let finalFormatted = String(targetNum);
                if (padLength > 0) finalFormatted = finalFormatted.padStart(padLength, '0');
                setDisplayValue(finalFormatted + suffix);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, duration, reducedMotion]);

  return (
    <span ref={containerRef} className={className}>
      {displayValue}
    </span>
  );
}

export default AnimatedNumber;
