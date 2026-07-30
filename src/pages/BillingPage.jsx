import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, CreditCard, Loader2, Check, AlertCircle, ArrowUpRight,
  RefreshCw, Zap, Star, Users, Crown, X, Clock, CheckCircle2,
  Download, ShieldCheck, Plus, Minus, Info, Receipt, Edit3, Trash2,
  TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight as ArrowUpRightAlt,
  ChevronDown, BarChart3, Activity, DollarSign,
} from 'lucide-react';
import {
  getWallet, getWalletHistory, getWalletUsage, getWalletPricing,
  updateAutoRecharge, prepareWalletTopup, verifyWalletTopup,
  getInvoices, getPlans, getSubscription, getUsage,
  getCreditBalance, verifyCheckoutSession, changePlan, FEATURE_LABELS, FEATURE_LIMITS, USAGE_FEATURE_ORDER,
} from '../utils/billingApi';
import api, { setUserData } from '../utils/api';

const ACCENT = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#ef4444';

const STATUS_CONFIG = {
  active: { color: SUCCESS, label: 'Active', icon: CheckCircle2 },
  cancelled: { color: DANGER, label: 'Cancelled', icon: X },
  past_due: { color: WARNING, label: 'Past Due', icon: AlertCircle },
  trialing: { color: ACCENT, label: 'Trial', icon: Zap },
  paused: { color: '#9ca3af', label: 'Paused', icon: Clock },
};

// ─── TABS ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'wallet',    label: 'Wallet',    icon: Wallet },
  { id: 'tx',        label: 'Transactions', icon: Activity },
  { id: 'usage',     label: 'Usage',     icon: BarChart3 },
  { id: 'overview',  label: 'Overview',  icon: CreditCard },
  { id: 'invoices',  label: 'Invoices',  icon: Receipt },
  { id: 'payment',   label: 'Payment',   icon: CreditCard },
];

const TOPUP_AMOUNTS = [5, 10, 20, 50, 100, 250];

const TX_TYPE_META = {
  topup:       { color: SUCCESS, icon: TrendingUp,   label: 'Top-up' },
  ai_usage:    { color: DANGER,  icon: TrendingDown, label: 'AI Usage' },
  refund:      { color: WARNING, icon: ArrowDownRight, label: 'Refund' },
  bonus:       { color: ACCENT,  icon: Star,          label: 'Bonus' },
  referral:    { color: ACCENT,  icon: Users,          label: 'Referral' },
  admin_credit:{ color: SUCCESS, icon: Plus,           label: 'Credit' },
  adjustment:  { color: WARNING, icon: Edit3,          label: 'Adjustment' },
  reservation: { color: '#6b7280', icon: Clock,         label: 'Reserved' },
};

const FEATURE_ICON = {
  chat: '💬', vision: '👁', image_generation: '🖼',
  code_generation: '💻', research: '🔬', redesign: '🎨',
};

function UsageMeter({ label, used, limit }) {
  const pct = limit <= 0 ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</span>
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
          {used.toLocaleString()} / {limit < 0 ? '∞' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct > 80 ? DANGER : ACCENT }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('wallet');

  // ── Wallet State ──────────────────────────────────────────────────
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txType, setTxType] = useState(null);
  const [txList, setTxList] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txLoading, setTxLoading] = useState(false);

  const [usagePage, setUsagePage] = useState(1);
  const [usageList, setUsageList] = useState([]);
  const [usageTotal, setUsageTotal] = useState(0);
  const [usageSummary, setUsageSummary] = useState({ total_cost: 0, total_calls: 0 });
  const [usageLoading, setUsageLoading] = useState(false);
  const [pricing, setPricing] = useState([]);

  const [topupAmount, setTopupAmount] = useState(20);
  const [topupCustom, setTopupCustom] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState('');
  const [topupMessage, setTopupMessage] = useState('');
  const [planMessage, setPlanMessage] = useState('');
  const [switchingPlan, setSwitchingPlan] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const [autoRecharge, setAutoRecharge] = useState({ enabled: false, threshold: 5, recharge_amount: 20 });
  const [showAutoRechargeEdit, setShowAutoRechargeEdit] = useState(false);

  // ── Legacy Billing State ──────────────────────────────────────────
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState({});
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);

  // ── Load Wallet ────────────────────────────────────────────────────
  const loadWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const data = await getWallet();
      setWallet(data.wallet);
      setAutoRecharge(data.auto_recharge || { enabled: false, threshold: 5, recharge_amount: 20 });
    } catch {
      /* silent */
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // ── Load Transactions ───────────────────────────────────────────────
  const loadTx = useCallback(async (page = 1) => {
    setTxLoading(true);
    try {
      const data = await getWalletHistory(page, txType);
      setTxList(data.transactions || []);
      setTxTotal(data.pagination?.total || 0);
      setTxPage(page);
    } catch {
      /* silent */
    } finally {
      setTxLoading(false);
    }
  }, [txType]);

  // ── Load Usage ─────────────────────────────────────────────────────
  const loadUsage = useCallback(async (page = 1) => {
    setUsageLoading(true);
    try {
      const data = await getWalletUsage(page);
      setUsageList(data.records || []);
      setUsageTotal(data.pagination?.total || 0);
      setUsageSummary(data.summary || { total_cost: 0, total_calls: 0 });
      setUsagePage(page);
    } catch {
      /* silent */
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // ── Load Pricing ────────────────────────────────────────────────────
  const loadPricing = useCallback(async () => {
    try {
      const data = await getWalletPricing();
      setPricing(data.pricing || []);
    } catch { /* silent */ }
  }, []);

  // ── Initial Load ───────────────────────────────────────────────────
  useEffect(() => {
    loadWallet();
    loadTx();
    loadUsage();
    loadPricing();
    loadLegacyBilling();
  }, []);

  // ── Stripe Success Redirect Handler ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const walletStatus = params.get('wallet');
    const successStatus = params.get('success');
    const sessionId = params.get('session_id');

    if (successStatus === 'true' && sessionId) {
      // Plan upgrade redirect from Stripe
      verifyCheckoutSession(sessionId)
        .then(result => {
          if (result.success && result.subscription) {
            setSubscription(result.subscription);
            setPlanMessage('Plan upgraded to ' + (result.subscription.plan || 'Pro') + '! Welcome to your new plan.');
          } else {
            setPlanMessage('Payment completed but subscription update pending. Refresh to see changes.');
          }
          loadBilling();
          window.history.replaceState({}, '', window.location.pathname + '?tab=subscription');
        })
        .catch(() => {
          loadBilling();
          window.history.replaceState({}, '', window.location.pathname + '?tab=subscription');
        });
    } else if (walletStatus === 'success' && sessionId) {
      // Clear URL params without page reload
      const cleanUrl = window.location.pathname + '?wallet=open';
      window.history.replaceState({}, '', cleanUrl);

      // Verify the payment and credit wallet
      verifyWalletTopup(sessionId)
        .then((data) => {
          if (data.success) {
            loadWallet(); // Refresh wallet balance
            loadTx();     // Refresh transaction history
            setActiveTab('wallet'); // Switch to wallet tab
            setTopupMessage(`Wallet credited! $${data.amount_credited?.toFixed(2) ?? sessionId} added successfully.`);
          } else if (data.already_processed) {
            loadWallet();
            setActiveTab('wallet');
            setTopupMessage('Wallet already credited.');
          }
        })
        .catch(() => {
          loadWallet(); // Still refresh on error
        });
    } else if (walletStatus === 'cancelled') {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      setTopupError('Payment was cancelled.');
    }
  }, []);

  // ── Refresh auth user (plan) from server ──────────────────────
  const refreshAuthUser = async () => {
    try {
      const me = await api.me();
      if (me) { setUserData(me); window.dispatchEvent(new Event('authUpdated')); }
    } catch {}
  };

  // ── Switch to Yearly ─────────────────────────────────────────────
  const handleSwitchToYearly = async () => {
    setSwitchingPlan(true);
    try {
      const result = await changePlan('pro', 'yearly');
      if (result.requires_action && result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }
      if (result.success) {
        setSubscription(result.subscription);
        // Show proration details if available
        if (result.proration) {
          const p = result.proration;
          const msg = p.credit_added > 0
            ? `Switched to Pro Yearly! Credited $${p.credit_added.toFixed(2)} to wallet (${p.days_remaining || '~364'} days). Next billing: $${p.next_billing_amount}/mo on ${p.next_billing_on}. Wallet balance: $${p.wallet_balance?.toFixed(2)}${p.wallet_covers_next_cycle ? ' — covers next cycle!' : `, $${p.stripe_will_charge} from card.`}`
            : `Switched to Pro Yearly!`;
          setPlanMessage(msg);
        } else {
          setPlanMessage('Switched to Pro Yearly!');
        }
        await refreshAuthUser();
      }
    } catch { setPlanMessage(''); } finally { setSwitchingPlan(false); }
  };

  // ── Switch to Monthly ─────────────────────────────────────────────
  const handleSwitchToMonthly = async () => {
    setSwitchingPlan(true);
    try {
      const result = await changePlan('pro', 'monthly');
      if (result.requires_action && result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }
      if (result.success) {
        setSubscription(result.subscription);
        // Show proration details if available
        if (result.proration) {
          const p = result.proration;
          const msg = p.credit_added > 0
            ? `Switched to Pro Monthly! Credited $${p.credit_added.toFixed(2)} to wallet. Next billing: $${p.next_billing_amount}/mo on ${p.next_billing_on}. Wallet: $${p.wallet_balance?.toFixed(2)}${p.wallet_covers_next_cycle ? ' — covers next cycle!' : `, $${p.stripe_will_charge} from card.`}`
            : `Switched to Pro Monthly!`;
          setPlanMessage(msg);
        } else {
          setPlanMessage('Switched to Pro Monthly!');
        }
        await refreshAuthUser();
      }
    } catch { setPlanMessage(''); } finally { setSwitchingPlan(false); }
  };

  // ── Open Billing Portal ──────────────────────────────────────────
  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else navigate('/app/pricing');
    } catch { navigate('/app/pricing'); } finally { setPortalLoading(false); }
  };

  // ── Cancel Plan ─────────────────────────────────────────────────
  const handleCancelPlan = () => {
    if (!confirm('Cancel your subscription? You will lose access to Pro features at the end of the billing period.')) return;
    fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ immediately: false }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubscription(prev => prev ? { ...prev, cancel_at_period_end: true, status: 'active' } : prev);
          setPlanMessage('Subscription will cancel at the end of the billing period.');
        }
      })
      .catch(() => {});
  };

  // ── Legacy Billing Load ─────────────────────────────────────────────
  const loadLegacyBilling = async () => {
    setLoading(true);
    try {
      const [sub, planList, inv, usg, bal] = await Promise.all([
        getSubscription().catch(() => null),
        getPlans().catch(() => []),
        getInvoices().catch(() => []),
        getUsage().catch(() => ({})),
        getCreditBalance().catch(() => null),
      ]);
      setSubscription(sub);
      setPlans(Array.isArray(planList) ? planList : planList?.plans || []);
      setInvoices(Array.isArray(inv) ? inv : inv?.invoices || []);
      setUsage(typeof usg === 'object' ? usg : {});
    } finally {
      setLoading(false);
    }
  };

  // ── Wallet Topup ────────────────────────────────────────────────────
  const handleTopup = async () => {
    const amount = topupCustom ? parseFloat(topupCustom) : topupAmount;
    if (!amount || amount < 1) { setTopupError('Enter a valid amount (min $1)'); return; }
    setTopupError('');
    setTopupLoading(true);
    try {
      const data = await prepareWalletTopup(amount, 'stripe');
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setTopupError(data.message || 'Something went wrong.');
      }
    } catch {
      setTopupError('Failed to start checkout. Try again.');
    } finally {
      setTopupLoading(false);
    }
  };

  // ── Auto Recharge Save ─────────────────────────────────────────────
  const saveAutoRecharge = async () => {
    try {
      await updateAutoRecharge(autoRecharge);
      setShowAutoRechargeEdit(false);
      loadWallet();
    } catch { /* silent */ }
  };

  // ── Helpers ────────────────────────────────────────────────────────
  const formatUSD = (n) => n != null ? `$${Number(n).toFixed(2)}` : '—';
  const formatTxAmount = (tx) => {
    const isCredit = Number(tx.amount) >= 0;
    return (
      <span className="font-semibold" style={{ color: isCredit ? SUCCESS : DANGER }}>
        {isCredit ? '+' : ''}{formatUSD(tx.amount)}
      </span>
    );
  };

  const currentSlug = subscription?.slug || subscription?.plan?.toLowerCase() || 'free';
  const currentMeta = { color: ACCENT, icon: Zap, label: 'Loading…' };
  const statusCfg = subscription?.status ? (STATUS_CONFIG[subscription.status] || STATUS_CONFIG.active) : STATUS_CONFIG.active;
  const isPaidPlan = subscription && subscription?.status === 'active';
  const daysLeft = subscription?.period_end ? Math.ceil((new Date(subscription.period_end) - Date.now()) / 86400000) : null;
  const cancelPending = subscription?.cancel_at_period_end;

  // ─── Render: Wallet Tab ───────────────────────────────────────────
  const renderWallet = () => (
    <div className="space-y-5">
      {/* Balance Card */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)', background: `${ACCENT}10` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                <Wallet size={28} style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Available Balance</p>
                <p className="text-[32px] font-black" style={{ color: ACCENT }}>
                  {walletLoading ? <Loader2 size={24} className="animate-spin" /> : formatUSD(wallet?.available_balance)}
                </p>
              </div>
            </div>
            <button
              onClick={loadWallet}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:bg-[var(--surface2)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: 'var(--border)' }}>
          {[
            ['Balance', formatUSD(wallet?.balance), 'var(--text)'],
            ['Reserved', formatUSD(wallet?.reserved_balance), '#9ca3af'],
            ['Purchased', formatUSD(wallet?.lifetime_purchased), SUCCESS],
            ['Spent', formatUSD(wallet?.lifetime_spent), DANGER],
          ].map(([label, val, color]) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-[14px] font-bold" style={{ color }}>{walletLoading ? '…' : val}</p>
            </div>
          ))}
        </div>

        {/* Low balance warning */}
        {wallet && Number(wallet.available_balance) < 2 && Number(wallet.available_balance) > 0 && (
          <div className="mx-5 my-3 flex items-center gap-3 p-3 rounded-xl text-[12px] font-semibold"
            style={{ background: `${WARNING}15`, color: WARNING, border: `1px solid ${WARNING}30` }}>
            <AlertCircle size={16} />
            Low Balance — Please recharge to continue using AI features.
          </div>
        )}
      </div>

      {/* Add Money */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--text)' }}>Add Money to Wallet</p>
        <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>Select an amount or enter a custom value.</p>

        {/* Preset amounts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TOPUP_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setTopupAmount(amt); setTopupCustom(''); }}
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all"
              style={{
                borderColor: !topupCustom && topupAmount === amt ? ACCENT : 'var(--border)',
                color: !topupCustom && topupAmount === amt ? ACCENT : 'var(--text)',
                background: !topupCustom && topupAmount === amt ? `${ACCENT}12` : 'var(--surface)',
              }}
            >
              ${amt}
            </button>
          ))}
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[13px] font-semibold" style={{ color: 'var(--text-muted)' }}>$</span>
            <input
              type="number"
              value={topupCustom}
              onChange={(e) => { setTopupCustom(e.target.value); setTopupAmount(0); }}
              placeholder="Custom"
              className="pl-7 pr-3 py-2.5 rounded-xl text-[13px] font-semibold border outline-none"
              style={{ borderColor: topupCustom ? ACCENT : 'var(--border)', color: 'var(--text)', width: '110px', background: 'var(--surface)' }}
              min="1"
            />
          </div>
        </div>

        {topupError && (
          <p className="text-[12px] mb-3 px-3 py-2 rounded-lg" style={{ background: `${DANGER}12`, color: DANGER }}>{topupError}</p>
        )}
        {topupMessage && (
          <p className="text-[12px] mb-3 px-3 py-2 rounded-lg" style={{ background: `${SUCCESS}12`, color: SUCCESS }}>{topupMessage}</p>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Amount: <span className="font-bold" style={{ color: ACCENT }}>${topupCustom ? topupCustom : topupAmount}</span>
          </p>
          <button
            onClick={handleTopup}
            disabled={topupLoading}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: ACCENT }}
          >
            {topupLoading ? <><Loader2 size={13} className="animate-spin" /> Processing…</> : <><Zap size={13} /> Add to Wallet</>}
          </button>
        </div>
      </div>

      {/* Auto Recharge */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold mb-0.5" style={{ color: 'var(--text)' }}>Auto Recharge</p>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Automatically recharge when balance falls below ${autoRecharge.threshold} using your saved card.
            </p>
          </div>
          <button
            onClick={() => setShowAutoRechargeEdit(!showAutoRechargeEdit)}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--border)', color: autoRecharge.enabled ? SUCCESS : 'var(--text-2)' }}
          >
            {autoRecharge.enabled ? '● Enabled' : '○ Disabled'}
          </button>
        </div>

        <AnimatePresence>
          {showAutoRechargeEdit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 space-y-3 overflow-hidden"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <label className="text-[12px] font-medium w-36" style={{ color: 'var(--text-2)' }}>Threshold ($)</label>
                <input
                  type="number"
                  value={autoRecharge.threshold}
                  onChange={(e) => setAutoRecharge({ ...autoRecharge, threshold: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)', maxWidth: '120px' }}
                  min="1"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[12px] font-medium w-36" style={{ color: 'var(--text-2)' }}>Recharge Amount ($)</label>
                <input
                  type="number"
                  value={autoRecharge.recharge_amount}
                  onChange={(e) => setAutoRecharge({ ...autoRecharge, recharge_amount: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)', maxWidth: '120px' }}
                  min="1"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[12px] font-medium w-36" style={{ color: 'var(--text-2)' }}>Enabled</label>
                <button
                  onClick={() => setAutoRecharge({ ...autoRecharge, enabled: !autoRecharge.enabled })}
                  className="w-12 h-7 rounded-full transition-all"
                  style={{ background: autoRecharge.enabled ? SUCCESS : 'var(--border)' }}
                >
                  <span className="block w-5 h-5 rounded-full bg-white shadow" style={{ marginLeft: autoRecharge.enabled ? '28px' : '2px', transition: 'margin 0.2s' }} />
                </button>
              </div>
              <button
                onClick={saveAutoRecharge}
                className="px-4 py-2 rounded-lg text-[12px] font-bold text-white transition-all"
                style={{ background: ACCENT }}
              >
                Save Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pricing Table */}
      {pricing.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-[14px] font-bold mb-3" style={{ color: 'var(--text)' }}>AI Pricing</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left pb-2 font-medium">Provider</th>
                  <th className="text-left pb-2 font-medium">Model</th>
                  <th className="text-left pb-2 font-medium">Feature</th>
                  <th className="text-right pb-2 font-medium">$/1K Input</th>
                  <th className="text-right pb-2 font-medium">$/1K Output</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((p, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="py-2 font-medium capitalize">{p.provider}</td>
                    <td className="py-2" style={{ color: 'var(--text-2)' }}>{p.model}</td>
                    <td className="py-2 capitalize">{FEATURE_ICON[p.feature] || '•'} {p.feature}</td>
                    <td className="py-2 text-right font-semibold" style={{ color: p.price_per_1k_input > 0 ? DANGER : SUCCESS }}>
                      {p.price_per_1k_input > 0 ? `$${p.price_per_1k_input.toFixed(4)}` : 'Free'}
                    </td>
                    <td className="py-2 text-right font-semibold" style={{ color: p.price_per_1k_output > 0 ? DANGER : SUCCESS }}>
                      {p.price_per_1k_output > 0 ? `$${p.price_per_1k_output.toFixed(4)}` : 'Free'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render: Transactions Tab ─────────────────────────────────────
  const renderTx = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>Transactions</p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{txTotal} total records</p>
        </div>
        <div className="flex gap-2">
          <select
            value={txType || ''}
            onChange={(e) => { setTxType(e.target.value || null); setTxPage(1); }}
            className="px-3 py-1.5 rounded-lg border text-[12px] outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}
          >
            <option value="">All Types</option>
            {Object.entries(TX_TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => loadTx(1)} className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {txLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
        </div>
      ) : txList.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No transactions yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {txList.map((tx, i) => {
            const meta = TX_TYPE_META[tx.type] || TX_TYPE_META.adjustment;
            const Icon = meta.icon;
            return (
              <div key={tx.id} className="flex items-center gap-4 p-4" style={{ borderBottom: i < txList.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}15` }}>
                  <Icon size={18} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{tx.description || meta.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    <span className="capitalize">{tx.type}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {formatTxAmount(tx)}
                  <p className="text-[10px] mt-0.5" style={{ color: meta.color }}>{meta.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {txTotal > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => loadTx(txPage - 1)}
            disabled={txPage <= 1}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            ← Prev
          </button>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Page {txPage} / {Math.ceil(txTotal / 20)}</span>
          <button
            onClick={() => loadTx(txPage + 1)}
            disabled={txPage >= Math.ceil(txTotal / 20)}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  // ─── Render: Usage Tab ─────────────────────────────────────────────
  const renderUsageTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>AI Usage History</p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {usageSummary.total_calls} calls · Total spent: <span className="font-bold" style={{ color: DANGER }}>{formatUSD(usageSummary.total_cost)}</span>
          </p>
        </div>
        <button onClick={() => loadUsage(1)} className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all hover:bg-[var(--surface2)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          <RefreshCw size={12} />
        </button>
      </div>

      {usageLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
        </div>
      ) : usageList.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No AI usage yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {usageList.map((r, i) => (
            <div key={r.id} className="flex items-center gap-4 p-4" style={{ borderBottom: i < usageList.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: r.status === 'success' ? `${SUCCESS}15` : `${DANGER}15` }}>
                {r.status === 'success'
                  ? <CheckCircle2 size={18} style={{ color: SUCCESS }} />
                  : <AlertCircle size={18} style={{ color: DANGER }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
                  {FEATURE_ICON[r.feature] || '•'} {r.feature?.replace('_', ' ')} · {r.model}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{r.provider}{' · '}{r.input_tokens.toLocaleString()} in / {r.output_tokens.toLocaleString()} out
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-bold" style={{ color: r.status === 'success' ? DANGER : SUCCESS }}>
                  {r.cost > 0 ? `-${formatUSD(r.cost)}` : 'Free'}
                </p>
                <p className="text-[10px] capitalize" style={{ color: r.status === 'success' ? SUCCESS : DANGER }}>{r.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {usageTotal > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => loadUsage(usagePage - 1)} disabled={usagePage <= 1}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>← Prev</button>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Page {usagePage} / {Math.ceil(usageTotal / 20)}</span>
          <button onClick={() => loadUsage(usagePage + 1)} disabled={usagePage >= Math.ceil(usageTotal / 20)}
            className="px-3 py-1.5 rounded-lg border text-[12px] font-semibold disabled:opacity-30"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>Next →</button>
        </div>
      )}
    </div>
  );

  // ─── Render: Overview ──────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-5">
      {/* Plan upgrade feedback */}
      {planMessage && (
        <div className="px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
          style={{ background: `${SUCCESS}18`, border: `1px solid ${SUCCESS}40`, color: SUCCESS }}>
          <Check size={16} />
          <span><b>{planMessage}</b></span>
        </div>
      )}

      {/* Subscription card */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border)', background: `${ACCENT}08` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Zap size={22} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-[16px] font-black" style={{ color: ACCENT }}>{subscription?.plan || subscription?.name || 'Free Plan'}</p>
              {subscription?.billing_cycle && (
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {Number(subscription?.amount) > 0 ? `${formatUSD(subscription.amount)} / ` : ''}
                  {subscription.billing_cycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          {isPaidPlan ? (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Switch billing cycle button */}
              {subscription?.billing_cycle === 'monthly' && (
                <button
                  onClick={handleSwitchToYearly}
                  disabled={switchingPlan}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold border transition-all hover:bg-green-500/10"
                  style={{ borderColor: `${SUCCESS}30`, color: SUCCESS }}>
                  {switchingPlan ? 'Switching…' : 'Switch to Yearly'}
                </button>
              )}
              {subscription?.billing_cycle === 'yearly' && (
                <button
                  onClick={handleSwitchToMonthly}
                  disabled={switchingPlan}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold border transition-all"
                  style={{ borderColor: `${ACCENT}30`, color: ACCENT }}>
                  {switchingPlan ? 'Switching…' : 'Switch to Monthly'}
                </button>
              )}
              {/* Manage subscription via Stripe portal */}
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="px-4 py-2 rounded-xl text-[12px] font-bold border transition-all hover:bg-[var(--surface2)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {portalLoading ? 'Opening…' : 'Manage Subscription'}
              </button>
              {/* Cancel plan */}
              <button
                onClick={handleCancelPlan}
                className="px-4 py-2 rounded-xl text-[12px] font-bold border transition-all hover:bg-red-500/10"
                style={{ borderColor: `${DANGER}30`, color: DANGER }}>
                Cancel Plan
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/app/pricing')}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Usage meters */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>Usage This Period</p>
        <div className="space-y-3">
          {USAGE_FEATURE_ORDER.slice(0, 6).map((key) => {
            const limit = FEATURE_LIMITS[currentSlug]?.[key] ?? -1;
            const used = usage?.[key]?.used ?? usage?.[key] ?? 0;
            return <UsageMeter key={key} label={FEATURE_LABELS[key] || key} used={used} limit={limit} />;
          })}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: `${SUCCESS}08`, border: `1px solid ${SUCCESS}20` }}>
        <ShieldCheck size={20} style={{ color: SUCCESS }} />
        <div>
          <p className="text-[12px] font-semibold" style={{ color: SUCCESS }}>Secure & Encrypted</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Payments processed via Stripe. 256-bit SSL encryption.</p>
        </div>
      </div>
    </div>
  );

  // ─── Render: Invoices ──────────────────────────────────────────────
  const renderInvoices = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>Invoice History</p>
        <button onClick={loadLegacyBilling} className="px-3 py-1.5 rounded-lg border text-[11px] font-semibold"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          <RefreshCw size={11} />
        </button>
      </div>
      {invoices.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Receipt size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-[13px]">No invoices yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {invoices.map((inv, i) => (
            <div key={inv.id || i} className="flex items-center gap-4 p-4" style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
                <Receipt size={18} style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{inv.description || inv.invoice_number || 'Invoice'}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {inv.date ? new Date(inv.date).toLocaleDateString() : ''} · {inv.status || 'paid'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-bold">{formatUSD(inv.total)}</p>
                <button className="text-[10px] font-semibold flex items-center gap-1 ml-auto mt-1" style={{ color: ACCENT }}>
                  <Download size={10} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Render: Payment ──────────────────────────────────────────────
  const renderPayment = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Payment Methods</p>
          <button className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--surface2)]"
            style={{ borderColor: 'var(--border)', color: ACCENT }}>
            <Plus size={12} /> Add Card
          </button>
        </div>
        <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No payment methods on file. Add a card to enable auto-recharge.
        </p>
      </div>
      <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[14px] font-bold mb-2" style={{ color: 'var(--text)' }}>Billing Address</p>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No billing address added</p>
      </div>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Billing & Wallet</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Manage your wallet balance, transactions, and billing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: activeSection === tab.id ? ACCENT : 'transparent',
                color: activeSection === tab.id ? '#fff' : 'var(--text-muted)',
                boxShadow: activeSection === tab.id ? `0 2px 8px ${ACCENT}44` : 'none',
              }}
            >
              <Icon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeSection === 'wallet'    && renderWallet()}
      {activeSection === 'tx'        && renderTx()}
      {activeSection === 'usage'     && renderUsageTab()}
      {activeSection === 'overview'  && renderOverview()}
      {activeSection === 'invoices'  && renderInvoices()}
      {activeSection === 'payment'   && renderPayment()}
    </div>
  );
}
