/**
 * Centralized Theme Management System for hilpatel.site
 *
 * Provides:
 * - Dual persistence strategy: HTTP cookie ('hil_theme') with localStorage backup.
 * - Automatic system theme detection (prefers-color-scheme) on first visit when no cookie is set.
 * - Dynamic OS theme listener when no explicit cookie preference exists.
 * - Synchronizes active theme to HTML document.documentElement[data-theme].
 * - Pre-render theme detection to eliminate flash of unstyled content (FOUC).
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_COOKIE_NAME = 'hil_theme';
const THEME_STORAGE_KEY = 'hil-theme';

/**
 * Checks system-level color scheme preference.
 * @returns {'dark'|'light'}
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/**
 * Determines whether user explicitly chose a theme previously.
 * @returns {boolean}
 */
export function hasExplicitThemePreference() {
  try {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));
      if (match && ['dark', 'light'].includes(decodeURIComponent(match[1]).trim().toLowerCase())) {
        return true;
      }
    }
    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(THEME_STORAGE_KEY)?.trim().toLowerCase();
      if (local === 'dark' || local === 'light') {
        return true;
      }
    }
  } catch (e) {
    // Ignore storage restriction
  }
  return false;
}

/**
 * Retrieves persisted theme preference.
 * Priority: 1. Cookie 'hil_theme' -> 2. localStorage 'hil-theme' -> 3. System prefers-color-scheme -> 4. 'dark'.
 * @returns {'dark'|'light'}
 */
export function getPersistedTheme() {
  try {
    // 1. Read from cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));
      if (match) {
        const val = decodeURIComponent(match[1]).trim().toLowerCase();
        if (val === 'light' || val === 'dark') {
          return val;
        }
      }
    }
    // 2. Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(THEME_STORAGE_KEY)?.trim().toLowerCase();
      if (local === 'light' || local === 'dark') {
        return local;
      }
    }
  } catch (e) {
    // Browser storage/cookie restriction fallback
  }
  // 3. System preference fallback on first visit
  return getSystemTheme();
}

/**
 * Persists theme preference across cookie, localStorage, and DOM attribute.
 * @param {'dark'|'light'} theme
 */
export function persistTheme(theme) {
  const validTheme = theme === 'light' ? 'light' : 'dark';
  try {
    // 1. Save cookie (1 year expiration, SameSite=Lax, Secure if HTTPS)
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    document.cookie = `${THEME_COOKIE_NAME}=${validTheme}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;

    // 2. Sync to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    }
  } catch (e) {
    // Silent fail if cookies or localStorage are disabled
  }

  // 3. Update DOM attribute for immediate CSS selector matching
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = validTheme;
  }
}

/**
 * Context Provider wrapping the component tree to supply active theme and toggles.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getPersistedTheme());
  const [hasExplicit, setHasExplicit] = useState(() => hasExplicitThemePreference());

  // Listen to OS scheme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (hasExplicit || typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const newSysTheme = e.matches ? 'dark' : 'light';
      setThemeState(newSysTheme);
      document.documentElement.dataset.theme = newSysTheme;
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [hasExplicit]);

  // Synchronize DOM whenever theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setHasExplicit(true);
      persistTheme(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((newTheme) => {
    const valid = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(valid);
    setHasExplicit(true);
    persistTheme(valid);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, hasExplicit }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume active theme context.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
