import { useRef, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const CORD_LENGTH = 36;
const PULL_THRESHOLD = 28;
const HANDLE_SIZE = 18;

export default function PullCord() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [pulled, setPulled] = useState(0);
  const [snapping, setSnapping] = useState(false);

  const dragRef = useRef({ active: false, startY: 0, pulledAtStart: 0 });

  const getClientY = (e) => {
    if (e.touches?.[0]) return e.touches[0].clientY;
    return e.clientY;
  };

  const handlePointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    dragRef.current = { active: true, startY: getClientY(e), pulledAtStart: pulled };
    setSnapping(false);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }, [pulled]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    if (e.cancelable) e.preventDefault();
    const delta = getClientY(e) - dragRef.current.startY;
    setPulled(Math.max(0, dragRef.current.pulledAtStart + delta));
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const didTrigger = pulled >= PULL_THRESHOLD;
    if (didTrigger) toggleTheme();
    setSnapping(true);
    setPulled(0);
    setTimeout(() => setSnapping(false), 500);
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  }, [pulled, toggleTheme, handlePointerMove]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleClick = () => {
    if (!dragRef.current.active && pulled < 5) toggleTheme();
  };

  const cordColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(80,70,180,0.45)';
  const handleColor = isDark ? '#7C5CFC' : '#5B5FEF';
  const handleGlow = isDark ? 'rgba(124,92,255,0.5)' : 'rgba(91,95,239,0.35)';
  const cordHeight = CORD_LENGTH + pulled;
  const handleOffset = Math.min(pulled * 0.04, 4);
  const isGrabbing = pulled > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        padding: '2px 0',
      }}
      aria-label={isDark ? 'Switch to light mode (pull cord)' : 'Switch to dark mode (pull cord)'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
      }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(91,95,239,0.3)',
        marginBottom: 2, flexShrink: 0,
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 1.5, height: cordHeight, background: cordColor, borderRadius: 2,
          transformOrigin: 'top center',
          transition: snapping && !prefersReducedMotion
            ? 'height 0.4s cubic-bezier(0.34,1.56,0.64,1)'
            : snapping ? 'height 0.2s ease' : 'none',
          animation: snapping && !prefersReducedMotion ? 'cordWobble 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        }} />

        <div
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onClick={handleClick}
          style={{
            width: HANDLE_SIZE, height: HANDLE_SIZE, borderRadius: '50%',
            background: `radial-gradient(circle at 38% 35%, ${isDark ? '#9d7fff' : '#8b8cf7'}, ${handleColor})`,
            boxShadow: pulled >= PULL_THRESHOLD
              ? `0 0 0 3px ${handleGlow}, 0 2px 8px rgba(0,0,0,0.3)`
              : `0 2px 6px rgba(0,0,0,0.25), 0 0 0 0px ${handleGlow}`,
            cursor: isGrabbing ? 'grabbing' : 'grab',
            marginTop: -1,
            transform: `translateY(${handleOffset}px)${snapping && !prefersReducedMotion ? ' scale(1.1)' : ''}`,
            transition: snapping && !prefersReducedMotion
              ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'
              : snapping ? 'transform 0.2s ease' : 'box-shadow 0.15s ease',
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={PULL_THRESHOLD * 2}
          aria-valuenow={Math.round(pulled)}
          aria-label="Theme toggle pull cord"
          tabIndex={-1}
        >
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', gap: 2, opacity: 0.6,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 1, background: 'rgba(255,255,255,0.7)', borderRadius: 1,
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
