/**
 * ==============================================================================
 * Global Theme Context Provider (ThemeContext.jsx)
 * ==============================================================================
 *
 * Implements Apple-grade Dark / Light theme switching:
 * - Detects system prefers-color-scheme on initial visit
 * - Preserves preference in localStorage and document cookies
 * - Updates data-theme attribute on <html> element with zero-flash rendering
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'hilpatel_theme_preference';
const ThemeContext = createContext(null);

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  // 1. Check saved localStorage
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  // 2. Check document cookies
  const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${THEME_STORAGE_KEY}=([^;]*)`));
  if (cookieMatch && (cookieMatch[1] === 'light' || cookieMatch[1] === 'dark')) {
    return cookieMatch[1];
  }

  // 3. Fallback to OS preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }

  return 'dark';
}

export const getPersistedTheme = getInitialTheme;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const applyThemeToDOM = useCallback((newTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    root.style.colorScheme = newTheme;

    // Persist to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      // Ignore private browsing storage quota warnings
    }

    // Persist to cookie (1 year expiry)
    document.cookie = `${THEME_STORAGE_KEY}=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
