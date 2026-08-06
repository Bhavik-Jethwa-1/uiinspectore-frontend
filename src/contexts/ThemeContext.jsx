import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'uiinspectore_theme';
const THEME_ATTR = 'data-theme';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'dark';
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;
  
  if (actualTheme === 'light') {
    root.setAttribute(THEME_ATTR, 'light');
  } else {
    root.removeAttribute(THEME_ATTR);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(
    () => theme === 'system' ? getSystemTheme() : theme
  );

  // Apply theme on mount and theme changes
  useEffect(() => {
    applyTheme(theme);
    setResolvedTheme(theme === 'system' ? getSystemTheme() : theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      applyTheme('system');
      setResolvedTheme(getSystemTheme());
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
    setResolvedTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
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
    // Fallback for when used outside provider
    const stored = getStoredTheme();
    return {
      theme: stored,
      resolvedTheme: stored === 'system' ? getSystemTheme() : stored,
      setTheme: () => {},
      toggleTheme: () => {},
      isDark: (stored === 'system' ? getSystemTheme() : stored) === 'dark',
      isLight: (stored === 'system' ? getSystemTheme() : stored) === 'light',
      isSystem: stored === 'system',
    };
  }
  return context;
}

export default ThemeContext;
