import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function getStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('uireview-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('uireview-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Only auto-switch if user hasn't explicitly set a preference
      const stored = localStorage.getItem('uireview-theme');
      if (!stored || stored === 'system') {
        const next = mq.matches ? 'dark' : 'light';
        setTheme(next);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const resolvedTheme = theme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
