import { useEffect } from 'react';
import { Loader2, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function ConfirmModal({
  title,
  message,
  details,
  confirmLabel = 'Confirm',
  variant = 'primary', // 'primary' | 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
}) {
  const variantStyles = {
    primary: {
      buttonBg: 'var(--primary)',
      iconBg: 'var(--primary-light)',
      iconColor: 'var(--primary)',
    },
    danger: {
      buttonBg: 'var(--error)',
      iconBg: 'var(--error-light)',
      iconColor: 'var(--error)',
    },
    warning: {
      buttonBg: 'var(--warning)',
      iconBg: 'var(--warning-light)',
      iconColor: 'var(--warning)',
    },
    info: {
      buttonBg: 'var(--accent)',
      iconBg: 'var(--accent-light)',
      iconColor: 'var(--accent)',
    },
  };

  const style = variantStyles[variant] || variantStyles.primary;

  const IconComponent = variant === 'danger' ? AlertTriangle
    : variant === 'warning' ? AlertTriangle
    : variant === 'info' ? Info
    : CheckCircle;

  // Close on Escape key
  useEffect(() => {
    if (loading || disabled) return;
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [loading, disabled, onCancel]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: '1.5rem',
          maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: style.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <IconComponent size={18} style={{ color: style.iconColor }} />
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: details ? 12 : 20 }}>
          {message}
        </p>

        {/* Details list */}
        {details && details.length > 0 && (
          <div style={{
            background: 'var(--background)', borderRadius: 8, padding: '10px 14px',
            marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {details.map((detail, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{detail.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading || disabled}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || disabled}
            style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
              background: style.buttonBg,
              color: '#fff', border: 'none', opacity: (loading || disabled) ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
