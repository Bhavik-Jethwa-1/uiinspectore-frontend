import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Zap, Check, ArrowUpRight, AlertCircle,
  Sparkles, ShieldCheck, Star, Crown,
} from 'lucide-react';
import { getPlans, getSubscription, subscribe, createCheckoutSession } from '../../utils/billingApi';

const ACCENT = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#f87171';

const PLAN_COLORS = {
  free: { accent: '#6b7280', icon: Star },
  pro: { accent: ACCENT, icon: Zap },
  team: { accent: WARNING, icon: Crown },
};

export default function UpgradeModal({ isOpen, onClose, feature, usageData }) {
  const [plans, setPlans] = useState([]);
  const [currentSlug, setCurrentSlug] = useState('free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getPlans().catch(() => ({ plans: [] })),
        getSubscription().catch(() => ({ subscription: null })),
      ]).then(([plansData, subData]) => {
        setPlans(plansData.plans || []);
        setCurrentSlug(subData.subscription?.slug || 'free');
      }).catch(() => { });
    }
  }, [isOpen]);

  const handleUpgrade = async (planSlug) => {
    if (planSlug === 'free') return;
    setLoading(true);
    setError('');
    try {
      // Create Stripe Checkout session — redirects to Stripe for payment
      const checkout = await createCheckoutSession(planSlug, billingCycle);
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      // If no Stripe URL (credits cover full amount), subscribe directly
      const result = await subscribe(planSlug, billingCycle);
      if (result.success) {
        setDone(true);
        setTimeout(() => { onClose(); window.location.reload(); }, 1500);
      }
    } catch (e) {
      setError(e.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isProDisabled = currentSlug === 'pro' || currentSlug === 'team';
  const isTeamDisabled = currentSlug === 'team';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl pointer-events-auto"
              style={{
                background: 'linear-gradient(135deg, #0f0a1e 0%, #1a1040 50%, #0f0a1e 100%)',
                borderColor: `${ACCENT}30`,
                boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${ACCENT}20`,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[80px] pointer-events-none"
                style={{ background: `${ACCENT}30` }} />

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${ACCENT}20` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
                    <Sparkles size={18} color="#fff" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-black" style={{ color: 'var(--text)' }}>
                      {done ? 'Upgraded! 🎉' : 'Upgrade Required'}
                    </h2>
                    {feature && !done && (
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        "{feature}" needs a higher plan
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Usage bar */}
              {usageData && !done && (
                <div className="px-6 py-4 border-b" style={{ borderColor: `${ACCENT}15` }}>
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span>Current usage</span>
                    <span style={{ color: usageData.exceeded ? DANGER : 'var(--text-muted)' }}>
                      {usageData.used} / {usageData.limit === -1 ? '∞' : usageData.limit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (usageData.used / (usageData.limit || 1)) * 100)}%`,
                        background: usageData.exceeded
                          ? `linear-gradient(90deg, ${DANGER}, ${WARNING})`
                          : ACCENT,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-6">
                {done ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${SUCCESS}20` }}>
                      <Check size={32} style={{ color: SUCCESS }} strokeWidth={3} />
                    </div>
                    <h3 className="text-[18px] font-black mb-2" style={{ color: SUCCESS }}>
                      Upgrade Successful!
                    </h3>
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      Redirecting you to your new plan…
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Plan options */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {plans.filter(p => p.slug !== 'free').map(plan => {
                        const colors = PLAN_COLORS[plan.slug] || PLAN_COLORS.pro;
                        const Icon = colors.icon;
                        const isDisabled =
                          (plan.slug === 'pro' && isProDisabled) ||
                          (plan.slug === 'team' && isTeamDisabled);
                        const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                        const isSelected = plan.slug === 'pro';

                        return (
                          <motion.div
                            key={plan.slug}
                            whileHover={!isDisabled ? { y: -2 } : {}}
                            className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            style={{
                              background: isSelected ? `${colors.accent}12` : 'var(--surface)',
                              borderColor: isSelected ? colors.accent : 'var(--border)',
                              boxShadow: isSelected ? `0 0 0 2px ${colors.accent}44` : 'none',
                            }}
                            onClick={() => !isDisabled && handleUpgrade(plan.slug)}
                          >
                            {isSelected && (
                              <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: colors.accent, color: '#fff' }}>
                                Recommended
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: `${colors.accent}20` }}>
                                <Icon size={15} style={{ color: colors.accent }} />
                              </div>
                              <div>
                                <span className="text-[14px] font-black" style={{ color }}>{plan.name}</span>
                                <div className="text-[12px] font-bold" style={{ color: colors.accent }}>
                                  ${price}<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                                </div>
                              </div>
                            </div>
                            <ul className="space-y-1">
                              {plan.features
                                ? Object.entries(plan.features)
                                  .filter(([, v]) => v)
                                  .slice(0, 5)
                                  .map(([k]) => (
                                    <li key={k} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                      <Check size={10} style={{ color: colors.accent }} strokeWidth={3} />
                                      {k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </li>
                                  ))
                                : null
                              }
                            </ul>
                            {isDisabled && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                                style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <span className="text-[11px] font-bold px-3 py-1 rounded-lg"
                                  style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                                  Current Plan
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-[12px]"
                        style={{ background: `${DANGER}10`, color: DANGER, border: `1px solid ${DANGER}25` }}>
                        <AlertCircle size={14} />
                        {error}
                      </div>
                    )}

                    {/* Billing toggle */}
                    <div className="flex items-center justify-center gap-3 p-1 rounded-xl mb-4" style={{ background: 'var(--surface2)' }}>
                      {['monthly', 'yearly'].map(cycle => (
                        <button
                          key={cycle}
                          onClick={() => setBillingCycle(cycle)}
                          className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-all relative"
                          style={billingCycle === cycle
                            ? { background: ACCENT, color: '#fff', boxShadow: `0 2px 10px ${ACCENT}44` }
                            : { color: 'var(--text-muted)' }}
                        >
                          {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                          {cycle === 'yearly' && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                              style={{ background: SUCCESS, color: '#fff' }}>
                              -17%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleUpgrade('pro')}
                      disabled={loading || isProDisabled}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-black text-white transition-all disabled:opacity-50"
                      style={{
                        background: loading
                          ? 'var(--surface2)'
                          : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})`,
                        boxShadow: `0 8px 32px ${ACCENT}44`,
                      }}
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing…</>
                      ) : (
                        <><Sparkles size={15} /> Upgrade to Pro — $19/month</>
                      )}
                    </button>

                    <p className="text-center text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
                      <ShieldCheck size={10} className="inline mr-1" />
                      Cancel anytime. No lock-in. Your card is charged securely via Stripe.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
