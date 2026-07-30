import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, LogOut, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirm, setConfirm] = useState(null); // { title, message, confirmLabel, onConfirm, danger }

  const ask = useCallback(({ title, message, confirmLabel = 'Confirm', danger = true, onConfirm }) => {
    return new Promise((resolve) => {
      setConfirm({
        title,
        message,
        confirmLabel,
        danger,
        onConfirm: () => { resolve(true); setConfirm(null); },
        onCancel: () => { resolve(false); setConfirm(null); },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ ask }}>
      {children}
      <AnimatePresence>
        {confirm && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) confirm.onCancel(); }}
          >
            <motion.div
              className="modal"
              style={{ maxWidth: 400 }}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            >
              <div className="modal-head">
                <div className="modal-icon" style={confirm.danger ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' } : {}}>
                  {confirm.danger
                    ? <Trash2 size={18} color="#ef4444" />
                    : <AlertTriangle size={18} color="#f59e0b" />}
                </div>
                <div>
                  <h2>{confirm.title}</h2>
                  {confirm.message && <p>{confirm.message}</p>}
                </div>
                <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '6px' }} onClick={confirm.onCancel}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-foot">
                <button className="btn btn-ghost" onClick={confirm.onCancel}>Cancel</button>
                <button
                  className={`btn ${confirm.danger ? 'btn-danger' : 'btn-primary'}`}
                  onClick={confirm.onConfirm}
                >
                  {confirm.confirmLabel || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}
