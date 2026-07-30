import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const PRESET_AMOUNTS = [10, 20, 50, 100];

export default function CreditWalletModal({ onClose, onSuccess }) {
  const [selected, setSelected] = useState(20);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = custom ? Math.max(0, parseFloat(custom)) : selected;

  const handleCheckout = async () => {
    if (!amount || amount < 1) {
      setError('Please enter a valid amount (min $1.00)');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('ui-inspectore_token');
      const balRes = await fetch('/api/billing/credits/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balData = await balRes.json();
      const walletBalance = balData.credits_remaining || 0;
      const finalCents = Math.max(0, Math.floor(amount * 100) - Math.min(walletBalance, Math.floor(amount * 100)));

      const packsRes = await fetch('/api/billing/credits/packs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const packsData = await packsRes.json();
      const packs = packsData.packs || [];
      const packId = packs.find(p => Math.abs(p.price_usd - amount) < 1)?.id || packs[0]?.id;

      if (!packId) {
        setError('No credit pack available. Please try again.');
        setLoading(false);
        return;
      }

      const purchaseRes = await fetch(`/api/billing/credits/packs/${packId}/purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success_url: `${window.location.origin}/app/billing?credits=success`,
          cancel_url: `${window.location.origin}/app/billing`,
        }),
      });
      const purchaseData = await purchaseRes.json();

      if (purchaseData.checkout_url) {
        window.location.href = purchaseData.checkout_url;
      } else if (purchaseData.instant) {
        onSuccess();
        onClose();
      } else {
        setError(purchaseData.error || 'Something went wrong.');
      }
    } catch {
      setError('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ animation: 'fadeScaleIn 0.2s ease' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#e5e7eb' }}>
          <h2 className="text-[18px] font-bold" style={{ color: '#111827' }}>Add Credit To Wallet</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ color: '#6b7280' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-[13px] font-medium mb-4" style={{ color: '#374151' }}>Credit</p>

          {/* Preset amount buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(''); }}
                className="px-4 py-2.5 rounded-xl text-[14px] font-medium border transition-all"
                style={{
                  borderColor: selected === amt && !custom ? '#3b82f6' : '#d1d5db',
                  color: selected === amt && !custom ? '#2563eb' : '#6b7280',
                  background: '#fff',
                  borderWidth: '1.5px',
                }}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
            {/* Custom input */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[14px] font-medium" style={{ color: '#6b7280' }}>$</span>
              <input
                type="number"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); }}
                placeholder="Custom"
                className="pl-7 pr-4 py-2.5 rounded-xl text-[14px] font-medium border outline-none transition-all"
                style={{
                  borderColor: custom ? '#3b82f6' : '#d1d5db',
                  color: '#111827',
                  width: '100px',
                  borderWidth: '1.5px',
                }}
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Selected amount display */}
          {amount > 0 && (
            <div className="rounded-xl p-4 mb-4" style={{ background: '#f3f4f6' }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px]" style={{ color: '#6b7280' }}>Amount to add</span>
                <span className="text-[20px] font-bold" style={{ color: '#111827' }}>${amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12px] mb-3 px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626' }}>
              {error}
            </p>
          )}

          <p className="text-[11px]" style={{ color: '#9ca3af' }}>
            Credits are added instantly to your wallet after payment.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-[14px] font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#d1d5db', color: '#374151', background: '#fff' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading || !amount}
            className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: '#3b82f6' }}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : 'Checkout'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
