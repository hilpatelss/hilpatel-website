import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const THEME_COOKIE_NAME = 'hil_theme';
const THEME_STORAGE_KEY = 'hil-theme';

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
  return 'dark'; // Safe default
}

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

  // 3. Update DOM attribute
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = validTheme;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getPersistedTheme());

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    const valid = newTheme === 'light' ? 'light' : 'dark';
    setThemeState(valid);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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

