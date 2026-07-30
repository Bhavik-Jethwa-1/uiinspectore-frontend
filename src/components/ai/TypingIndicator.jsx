/**
 * TypingIndicator + LoadingDots — shared across all AI modules.
 */
export function TypingIndicator({ label = 'Thinking...' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
      style={{
        background: '#1a1a26',
        border: '1px solid #252535',
        borderRadius: '16px 16px 16px 4px',
        maxWidth: '160px',
      }}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: '#7c5cff',
            animation: `pulse-dot 1.2s ease-in-out ${i * 200}ms infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-dot {
          0%, 60%, 100% { transform: scale(0.8); opacity: 0.4; }
          30% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function LoadingSpinner({ size = 16, label = '' }) {
  return (
    <div className="flex items-center gap-2" style={{ color: '#9d7aff' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {label && <span className="text-xs" style={{ color: '#9090a8' }}>{label}</span>}
    </div>
  );
}

export function LoadingDots({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: '#7c5cff',
            animation: `dot-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      {label && <span className="text-xs ml-1" style={{ color: '#6b6b7b' }}>{label}</span>}
      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
