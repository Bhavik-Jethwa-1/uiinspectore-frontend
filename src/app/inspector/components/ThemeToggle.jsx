import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (resolvedTheme === 'dark') return Moon;
    if (resolvedTheme === 'light') return Sun;
    return Monitor;
  };

  const Icon = getIcon();

  const getLabel = () => {
    if (theme === 'system') return `System (${resolvedTheme})`;
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Theme: ${getLabel()}`}
      className={`relative p-2 rounded-lg transition-all duration-150 ${className}`}
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--surface-4)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--surface-3)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.15 }}
      >
        <Icon size={16} />
      </motion.div>
    </button>
  );
}
