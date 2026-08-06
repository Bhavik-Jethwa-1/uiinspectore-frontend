import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message, deleting }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm rounded-2xl border shadow-2xl pointer-events-auto"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <AlertTriangle size={17} style={{ color: '#ef4444' }} />
                  </div>
                  <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
                </div>
                <button onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-2">
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{message}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 py-4">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: '#ef4444' }}
                >
                  {deleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
