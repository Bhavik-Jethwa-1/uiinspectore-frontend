import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, ShieldCheck } from 'lucide-react';

const ACCENT = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS = '#10b981';

export default function AddCardModal({ onSave, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoading(true);
    try {
      await onSave({
        number: form.cardNumber.value,
        expiry: form.expiry.value,
        cvc: form.cvc.value,
        name: form.name.value,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
              <CreditCard size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Add Payment Method</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Enter your card details securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface2)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--text-2)' }}>
              Cardholder Name
            </label>
            <input name="name" type="text" placeholder="John Doe" required className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          <div>
            <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--text-2)' }}>
              Card Number
            </label>
            <input name="cardNumber" type="text" placeholder="4242 4242 4242 4242" maxLength={19} required
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').substring(0, 16);
                e.target.value = v.replace(/(\d{4})/g, '$1 ').trim();
              }}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--text-2)' }}>Expiry</label>
              <input name="expiry" type="text" placeholder="MM/YY" maxLength={5} required
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').substring(0, 4);
                  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
                  e.target.value = v;
                }}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="text-[12px] font-medium block mb-1.5" style={{ color: 'var(--text-2)' }}>CVC</label>
              <input name="cvc" type="text" placeholder="123" maxLength={4} required
                className="w-full px-3 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: `${SUCCESS}10` }}>
            <ShieldCheck size={14} style={{ color: SUCCESS }} />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Your card info is encrypted and secure. Demo mode — no real charges.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all hover:bg-[var(--surface2)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
              {loading ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
