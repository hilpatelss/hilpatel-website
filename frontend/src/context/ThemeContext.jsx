/**
 * Centralized Theme Management System for hilpatel.site
 *
 * Implements Apple-inspired light and dark mode functionality:
 * - Cookie name: 'site-theme' (allowed values: 'light' | 'dark').
 * - 1-year expiration (max-age=31536000), Path=/, SameSite=Lax, Secure when HTTPS.
 * - Automatic OS theme detection (prefers-color-scheme) on first visit when no cookie is set.
 * - If device detection is unavailable, defaults to 'light'.
 * - Saved preference in cookie takes priority and is preserved across navigation and visits.
 * - Backward compatibility with legacy 'hil_theme' and localStorage backup.
 * - Dynamic OS theme listener when no explicit preference exists.
 * - Synchronizes active theme to HTML document.documentElement[data-theme].
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const THEME_COOKIE_NAME = 'site-theme';
const LEGACY_COOKIE_NAME = 'hil_theme';
const THEME_STORAGE_KEY = 'site-theme';
const LEGACY_STORAGE_KEY = 'hil-theme';

/**
 * Checks system-level color scheme preference.
 * Defaults to 'light' if device detection is unavailable.
 * @returns {'dark'|'light'}
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  }
  return 'light';
}

/**
 * Helper to extract cookie value by name.
 * @param {string} name 
 * @returns {string|null}
 */
function readCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (match) {
    const val = decodeURIComponent(match[1]).trim().toLowerCase();
    if (val === 'light' || val === 'dark') {
      return val;
    }
  }
  return null;
}

/**
 * Determines whether user explicitly chose a theme previously.
 * @returns {boolean}
 */
export function hasExplicitThemePreference() {
  try {
    if (readCookieValue(THEME_COOKIE_NAME) || readCookieValue(LEGACY_COOKIE_NAME)) {
      return true;
    }
    if (typeof localStorage !== 'undefined') {
      const local = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY))?.trim().toLowerCase();
      if (local === 'dark' || local === 'light') {
        return true;
      }
    }
  } catch (e) {
    // Ignore storage restrictions
  }
  return false;
}

/**
 * Retrieves persisted theme preference.
 * Priority: 1. Cookie 'site-theme' (or 'hil_theme') -> 2. localStorage -> 3. System prefers-color-scheme -> 4. 'light'.
 * @returns {'dark'|'light'}
 */
export function getPersistedTheme() {
  try {
    // 1. Read from cookie
    const cookieVal = readCookieValue(THEME_COOKIE_NAME) || readCookieValue(LEGACY_COOKIE_NAME);
    if (cookieVal) {
      return cookieVal;
    }

    // 2. Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      const local = (localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY))?.trim().toLowerCase();
      if (local === 'light' || local === 'dark') {
        return local;
      }
    }
  } catch (e) {
    // Browser storage/cookie restriction fallback
  }

  // 3. System preference fallback on first visit; default to 'light' if unavailable
  return getSystemTheme();
}

/**
 * Persists theme preference across cookie, localStorage, and DOM attribute.
 * @param {'dark'|'light'} theme
 */
export function persistTheme(theme) {
  const validTheme = theme === 'light' ? 'light' : 'dark';
  try {
    // 1. Save cookie (1 year expiration, SameSite=Lax, Secure if HTTPS, Path=/)
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    document.cookie = `${THEME_COOKIE_NAME}=${validTheme}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
    // Also update legacy cookie for backwards compatibility
    document.cookie = `${LEGACY_COOKIE_NAME}=${validTheme}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;

    // 2. Sync to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
      localStorage.setItem(LEGACY_STORAGE_KEY, validTheme);
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
