/**
 * ThemePullCord - Wrapper around the pullcord npm package
 * Uses the physics-based pull-cord toggle for theme switching
 */
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import { useTheme } from '../context/ThemeContext'

export default function ThemePullCord({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <PullCord
      onPull={toggleTheme}
      pulled={!isDark}
      ariaLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
    />
  )
}
