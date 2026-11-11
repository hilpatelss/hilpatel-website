/**
 * ==============================================================================
 * Centralized Theme Management Context (ThemeContext.jsx)
 * ==============================================================================
 *
 * WHAT IS THIS FILE?
 * This file provides the Dark Mode / Light Mode system for the entire website,
 * inspired by Apple's clean design language.
 *
 * WHAT IS A REACT CONTEXT?
 * Normally in React, to share data between components, you have to pass it down
 * step-by-step through "props". A React Context is like a global radio broadcast:
 * any component anywhere in the tree can tune in with `useTheme()` and find out
 * whether dark mode or light mode is active, or toggle the theme with one click.
 *
 * HOW DOES PERSISTENCE WORK?
 * 1. Cookie 'site-theme': Stores 'light' or 'dark' for 1 full year so returning visitors
 *    see their preferred theme immediately.
 * 2. localStorage: Serves as a backup copy in the visitor's browser.
 * 3. System Detection: If a visitor arrives for the very first time and hasn't picked
 *    a theme yet, it checks their device/OS setting (`prefers-color-scheme`).
 * 4. DOM Sync: Sets `data-theme="dark"` or `data-theme="light"` on the `<html>` element,
 *    which activates the matching CSS rules in `styles.css`.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the Context radio station
const ThemeContext = createContext();

export const THEME_COOKIE_NAME = 'site-theme';
const LEGACY_COOKIE_NAME = 'hil_theme';
const THEME_STORAGE_KEY = 'site-theme';
const LEGACY_STORAGE_KEY = 'hil-theme';

/**
 * Checks the visitor's computer or smartphone operating system setting.
 * If their phone is in Dark Mode, this returns 'dark'. If unknown, defaults to 'light'.
 * 
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
 * Reads a browser cookie by its key name.
 * 
 * @param {string} name - Name of the cookie (e.g. 'site-theme')
 * @returns {string|null} - 'light', 'dark', or null if not found
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
 * Checks if the visitor has explicitly clicked the theme switcher in the past.
 * 
 * @returns {boolean} - True if a saved choice exists in cookies or localStorage
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
    // Ignore browser privacy/sandbox restrictions
  }
  return false;
}

/**
 * Determines which theme to load on startup.
 * Priority hierarchy:
 * 1. Saved Cookie ('site-theme') -> User's explicit past choice
 * 2. Saved localStorage -> Backup copy of choice
 * 3. Operating System preference -> Respects visitor's device mode
 * 4. 'light' -> Safe final fallback
 * 
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
    // Browser storage restriction fallback
  }

  // 3. System preference fallback on first visit; default to 'light' if unavailable
  return getSystemTheme();
}

/**
 * Saves the visitor's choice into cookies, localStorage, and updates the HTML attribute.
 * 
 * @param {'dark'|'light'} theme
 */
export function persistTheme(theme) {
  const validTheme = theme === 'light' ? 'light' : 'dark';
  try {
    // 1. Save cookie (1 year expiration = 31,536,000 seconds, SameSite=Lax, Secure if HTTPS, Path=/)
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    document.cookie = `${THEME_COOKIE_NAME}=${validTheme}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
    // Also update legacy cookie for backwards compatibility
    document.cookie = `${LEGACY_COOKIE_NAME}=${validTheme}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;

    // 2. Sync to browser localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
      localStorage.setItem(LEGACY_STORAGE_KEY, validTheme);
    }
  } catch (e) {
    // Silent fail if browser blocks storage
  }

  // 3. Update HTML data-theme attribute for immediate CSS styling updates
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = validTheme;
  }
}

/**
 * The Context Provider component that wraps the React tree.
 * Supplies the active theme and toggle functions to all child components.
 */
export function ThemeProvider({ children }) {
  // Read initial theme preference from cookies/system
  const [theme, setThemeState] = useState(() => getPersistedTheme());
  const [hasExplicit, setHasExplicit] = useState(() => hasExplicitThemePreference());

  // Listen for live OS theme changes if the visitor has NOT made an explicit choice yet
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

  // Synchronize HTML attribute whenever React state changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  // Helper function to switch between dark and light
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setHasExplicit(true);
      persistTheme(next);
      return next;
    });
  }, []);

  // Helper function to set an explicit theme
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
 * Custom hook: makes it simple for any component to access theme state.
 * Usage in any component: `const { theme, toggleTheme } = useTheme();`
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

