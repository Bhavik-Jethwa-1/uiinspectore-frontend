import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Star, Users, Crown, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { getPlans, getSubscription, subscribe, createCheckoutSession, verifyCheckoutSession, changePlan } from '../utils/billingApi';
import api, { setUserData } from '../utils/api';

const ACCENT   = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS  = '#10b981';
const DANGER   = '#f87171';

const PLAN_COLORS = {
  free:  { bg: '#1e1e35', border: '#2a2a4a', accent: '#6b7280', badge: '#6b7280' },
  pro:   { bg: '#1a1040', border: '#7c5cff', accent: '#7c5cff', badge: '#7c5cff' },
  team:  { bg: '#1a1028', border: '#f59e0b', accent: '#f59e0b', badge: '#f59e0b' },
};

const FREE_FEATURES = [
  { label: 'AI Chat',            enabled: true },
  { label: 'AI UI Review',       enabled: true },
  { label: 'Screenshot Analysis',enabled: true },
  { label: 'Basic Image Gen',    enabled: true },
  { label: 'Basic Templates',    enabled: true },
  { label: 'Export PNG',         enabled: true },
  { label: 'History',           enabled: true },
  { label: 'Basic Dashboard',    enabled: true },
  { label: 'AI Auto Designer',  enabled: false },
  { label: 'AI Redesign',       enabled: false },
  { label: 'API Access',         enabled: false },
  { label: 'Team Collaboration', enabled: false },
  { label: 'White Label',        enabled: false },
  { label: 'React Code Export',  enabled: false },
  { label: 'Next.js Export',     enabled: false },
  { label: 'Unlimited History',  enabled: false },
];

const PRO_ADDITIONAL = [
  'AI Auto Designer',
  'AI Redesign',
  'AI Prompt Optimizer',
  'Premium Templates (40+)',
  'Advanced Dashboard',
  'React / Next.js / Vue Export',
  'Version History',
  'AI Design Comparison',
  'AI Suggestions',
  'AI Accessibility Analysis',
  'Batch Processing',
  'Priority Support',
  'API Access',
];

const TEAM_ADDITIONAL = [
  'Everything in Pro',
  'Team Workspace',
  'Organization Management',
  'Role Management',
  'Invite Members',
  'Shared Projects & Assets',
  'Activity & Audit Logs',
  'Team Billing',
  'Webhooks',
  'SSO Ready',
  'White Label',
  'Custom Branding',
  'Dedicated Support',
  'Custom Onboarding',
  'Enterprise Security',
];

function PlanBadge({ label, color }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

function FeatureRow({ label, enabled }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {enabled ? (
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${SUCCESS}20` }}>
          <Check size={11} style={{ color: SUCCESS }} strokeWidth={3} />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${DANGER}10` }}>
          <X size={11} style={{ color: DANGER }} strokeWidth={2.5} />
        </div>
      )}
      <span
        className="text-[13px] font-medium"
        style={{ color: enabled ? 'var(--text-2)' : 'var(--text-muted)' }}
      >
        {label}
      </span>
    </div>
  );
}

function PlanCard({ plan, currentSlug, billingCycle, subscription, onSelect, onCycleToggle, loading }) {
  const colors = PLAN_COLORS[plan.slug] || PLAN_COLORS.free;
  const isCurrent = currentSlug === plan.slug;
  const isFree = plan.price_monthly == 0;
  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const period = billingCycle === 'yearly' ? '/yr' : '/mo';
  const savings = isFree ? 0 : Math.round((plan.price_monthly * 12) - plan.price_yearly);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col rounded-3xl overflow-hidden border"
      style={{
        background: colors.bg,
        borderColor: isCurrent ? colors.accent : colors.border,
        boxShadow: isCurrent
          ? `0 0 0 2px ${colors.accent}44, 0 12px 40px rgba(0,0,0,0.4)`
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}88)` }} />

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <PlanBadge label="Current Plan" color={colors.accent} />
        </div>
      )}

      <div className="p-6 flex flex-col gap-5 flex-1">

        {/* Plan name & description */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {plan.slug === 'pro' && <Zap size={18} style={{ color: colors.accent }} />}
            {plan.slug === 'team' && <Users size={18} style={{ color: colors.accent }} />}
            {plan.slug === 'free' && <Star size={18} style={{ color: colors.accent }} />}
            <h3 className="text-[18px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
              {plan.name}
            </h3>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2">
          <div className="text-[36px] font-black leading-none" style={{ color: colors.accent }}>
            {isFree ? 'Free' : `$${price}`}
          </div>
          {!isFree && (
            <div className="text-[14px] mb-1" style={{ color: 'var(--text-muted)' }}>
              {period}
              {billingCycle === 'yearly' && savings > 0 && (
                <span className="ml-1 text-[11px]" style={{ color: SUCCESS }}>Save ${savings}</span>
              )}
            </div>
          )}
        </div>

        {/* Billing toggle */}
        {!isFree && (
          <div className="flex items-center gap-3 p-1 rounded-xl" style={{ background: 'var(--surface2)' }}>
            <button
              onClick={() => onCycleToggle('monthly')}
              className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={billingCycle === 'monthly' ? { background: colors.accent, color: '#fff' } : { color: 'var(--text-muted)' }}
            >
              Monthly
            </button>
            <button
              onClick={() => onCycleToggle('yearly')}
              className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all relative"
              style={billingCycle === 'yearly' ? { background: colors.accent, color: '#fff' } : { color: 'var(--text-muted)' }}
            >
              Yearly
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: SUCCESS, color: '#fff' }}>
                -17%
              </span>
            </button>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onSelect(plan)}
          disabled={loading || (isCurrent && billingCycle === subscription?.billing_cycle)}
          className="w-full py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={
            isCurrent
              ? { background: `${colors.accent}20`, color: colors.accent, border: `1px solid ${colors.accent}40`, cursor: 'default' }
              : !isFree
                ? { background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`, color: '#fff', boxShadow: `0 4px 20px ${colors.accent}44` }
                : { background: 'var(--surface2)', color: 'var(--text-2)', border: '1px solid var(--border)' }
          }
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isCurrent ? (
            billingCycle !== subscription?.billing_cycle
              ? `Switch to ${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}`
              : 'Current Plan'
          ) : (
            <>
              {isFree ? 'Get Started Free' : `Upgrade to ${plan.name}`}
              {!isFree && <ArrowRight size={13} />
            }
            </>
          )}
        </button>

        {/* Feature list */}
        <div className="space-y-0 border-t pt-4" style={{ borderColor: `${colors.border}50` }}>
          {plan.slug === 'free' && FREE_FEATURES.map(f => (
            <FeatureRow key={f.label} {...f} />
          ))}
          {plan.slug === 'pro' && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.accent }}>Everything in Free +</p>
              {PRO_ADDITIONAL.map(f => <FeatureRow key={f} label={f} enabled={true} />)}
            </>
          )}
          {plan.slug === 'team' && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.accent }}>Everything in Pro +</p>
              {TEAM_ADDITIONAL.map(f => <FeatureRow key={f} label={f} enabled={true} />)}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null); // plan slug being subscribed to
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');


  useEffect(() => {
    Promise.all([getPlans(), getSubscription().catch(() => ({ subscription: null }))])
      .then(([plansData, subData]) => {
        setPlans(plansData.plans || []);
        setSubscription(subData.subscription || null);
      })

      .finally(() => setLoading(false));
  }, []);

  // Handle Stripe Checkout redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');
    const cancelled = params.get('cancelled');

    if (success === 'true' && sessionId) {
      // Verify the checkout session with backend
      verifyCheckoutSession(sessionId)
        .then(async result => {
          if (result.success && result.subscription) {
            setSubscription(result.subscription);
            setPaymentMessage('Payment successful! Your ' + (result.subscription.plan || 'Pro') + ' plan is now active.');
            setPaymentError('');
            // Refresh auth so plan="pro" is reflected immediately in the app
            try {
              const me = await api.me();
              if (me) { setUserData(me); window.dispatchEvent(new Event('authUpdated')); }
            } catch {}
          } else {
            setPaymentError(result.error || 'Payment could not be verified. Please contact support.');
            setPaymentMessage('');
          }
          // Clean URL
          window.history.replaceState({}, '', '/app/pricing');
        })
        .catch((err) => {
          // Show error instead of silently reloading
          setPaymentError('Could not verify payment. Please contact support if you were charged.');
          setPaymentMessage('');
          // Clean URL
          window.history.replaceState({}, '', '/app/pricing');
        });
    } else if (cancelled === 'true') {
      setPaymentError('Payment was cancelled. No charges were made.');
      setPaymentMessage('');
      // Clean URL
      window.history.replaceState({}, '', '/app/pricing');
    }
  }, []);

  const handleSelect = async (plan) => {
    if (plan.slug === 'free') return; // free is default
    setSelecting(plan.slug);
    try {
      // Same plan slug + different billing cycle → switch via Stripe API (no new checkout)
      if (plan.slug === currentSlug && billingCycle !== subscription?.billing_cycle) {
        const result = await changePlan(plan.slug, billingCycle);
        if (result.requires_action && result.checkout_url) {
          window.location.href = result.checkout_url;
          return;
        }
        if (result.success) {
          setSubscription(result.subscription);
          // Show proration details if switching billing cycle
          if (result.proration) {
            const p = result.proration;
            const cycle = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);
            const msg = p.credit_added > 0
              ? `Switched to ${plan.name} ${cycle}! Credited $${p.credit_added.toFixed(2)} to wallet. Wallet: $${p.wallet_balance?.toFixed(2)}${p.wallet_covers_next_cycle ? ' — covers next cycle!' : `. Next cycle: $${p.stripe_will_charge} from card.`}`
              : `Switched to ${plan.name} ${cycle}!`;
            setPaymentMessage(msg);
          } else {
            setPaymentMessage('Switched to ' + plan.name + ' ' + billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1) + '!');
          }
          // Refresh auth so plan is reflected app-wide
          try {
            const me = await api.me();
            if (me) { setUserData(me); window.dispatchEvent(new Event('authUpdated')); }
          } catch {}
          return;
        }
      }
      // Different plan → create a Stripe Checkout session
      const checkout = await createCheckoutSession(plan.slug, billingCycle);
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      // Fallback: try regular subscribe
      const result = await subscribe(plan.slug, billingCycle);
      if (result.success) {
        setSubscription(result.subscription);
        window.location.reload();
      }
    } catch (e) {
      window.location.href = `/app/billing?plan=${plan.slug}&cycle=${billingCycle}`;
      return;
    } finally {
      setSelecting(null);
    }
  };

  const currentSlug = subscription?.slug || 'free';

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      {/* Payment feedback banners */}
      {paymentMessage && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: `${SUCCESS}18`, border: `1px solid ${SUCCESS}40`, color: SUCCESS }}>
          <Check size={16} />
          <span><b>{paymentMessage}</b></span>
        </div>
      )}
      {paymentError && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: `${DANGER}18`, border: `1px solid ${DANGER}40`, color: DANGER }}>
          <X size={16} />
          <span><b>Payment issue:</b> {paymentError}</span>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-10 pb-8 text-center" style={{
        background: 'linear-gradient(180deg, #0f0a1e 0%, var(--bg) 100%)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,92,255,0.15), transparent)',
        }} />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-4"
            style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>
            <Sparkles size={11} /> Simple, transparent pricing
          </div>
          <h1 className="text-[32px] font-black tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            Choose your plan
          </h1>
          <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: ACCENT }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.slug}
                plan={plan}
                currentSlug={currentSlug}
                billingCycle={billingCycle}
                subscription={subscription}
                onSelect={handleSelect}
                onCycleToggle={setBillingCycle}
                loading={selecting === plan.slug}
              />
            ))}
          </div>
        )}

        {/* FAQ / Trust signals */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔒', title: 'Secure Payments', desc: '256-bit SSL encryption via Stripe' },
            { icon: '↩',  title: 'Cancel Anytime',  desc: 'No lock-in. Cancel with one click.' },
            { icon: '💬', title: 'Priority Support', desc: 'Pro & Team plans get priority response' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
