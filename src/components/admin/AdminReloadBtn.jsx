import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function AdminReloadBtn({ onClick, title = 'Refresh', size = 16, disabled }) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    if (spinning || disabled) return;
    setSpinning(true);
    try {
      await onClick();
    } finally {
      // Keep spinning for a moment so the user sees feedback
      setTimeout(() => setSpinning(false), 400);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || spinning}
      title={title}
      aria-label={title}
      style={{
        width: 36,
        height: 36,
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        cursor: disabled || spinning ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!disabled && !spinning) {
          e.currentTarget.style.background = 'var(--hover)';
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--surface)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {spinning ? (
        <Loader2 size={size} style={{ color: 'var(--primary)', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <RefreshCw size={size} style={{ color: 'inherit' }} />
      )}
    </button>
  );
}
