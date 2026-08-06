import { motion } from 'framer-motion';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { ACCENT } from '../../app/inspector/constants/theme';

// ─── Full Page Loading ───────────────────────────────────────────────────────
export function PageLoading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={28} style={{ color: ACCENT }} />
      </motion.div>
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────
export function ErrorState({
  message = 'Something went wrong',
  description = 'An error occurred while loading this content.',
  onRetry,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'py-8 gap-3' : 'py-16 gap-4'}`}>
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)' }}
      >
        <AlertTriangle size={24} style={{ color: '#ef4444' }} />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>{message}</p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all hover:opacity-80"
          style={{ background: ACCENT, color: '#fff' }}
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      )}
    </div>
  );
}

// ─── Inline Loading (small) ──────────────────────────────────────────────────
export function InlineLoading({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center gap-2 py-4 ${className}`}>
      <Loader2 size={14} className="animate-spin" style={{ color: ACCENT }} />
      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
}

// ─── Button Loading ──────────────────────────────────────────────────────────
export function ButtonLoading({ children, loading, icon: Icon, iconPosition = 'left', className = '' }) {
  return (
    <span className="relative inline-flex items-center gap-2">
      <motion.span
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-2"
      >
        {icon && iconPosition === 'left' && <Icon size={14} />}
        {children}
      </motion.span>
      {loading && (
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Loader2 size={14} className="animate-spin" />
        </motion.span>
      )}
    </span>
  );
}

// ─── Skeleton Shimmer (standalone) ───────────────────────────────────────────
export function Shimmer({ className = '', style = {} }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
