import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: 18, right: 18, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />,
  };

  const colors = {
    success: { bg: '#ecfdf3', border: '#22c55e', color: '#15803d', icon: '#22c55e' },
    error:   { bg: '#fef2f2', border: '#ef4444', color: '#b91c1c', icon: '#ef4444' },
    warning: { bg: '#fff7ed', border: '#f97316', color: '#c2410c', icon: '#f97316' },
    info:    { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', icon: '#3b82f6' },
  };

  const c = colors[toast.type] || colors.info;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 260, maxWidth: 360,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
      pointerEvents: 'all',
      animation: 'toastSlideIn 0.25s ease-out',
      fontFamily: 'Inter, sans-serif',
    }}>
      <span style={{ color: c.icon, flexShrink: 0 }}>{icons[toast.type]}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: c.color, flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.color, opacity: 0.6, padding: 2, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
