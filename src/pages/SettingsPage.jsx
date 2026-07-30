import { useState, useEffect, useRef, useCallback } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Save, Loader2, Check, Camera, Bell, Trash2, Copy,
  CreditCard, Wallet, IndianRupee, Star, Zap, ChevronRight,
  Download, Plus, ExternalLink, Shield, ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { setToken } from '../utils/api';
import { getSubscription, getInvoices, savePaymentMethod } from '../utils/billingApi';

const PLAN_META = {
  free:      { color: '#6b7280', gradient: 'from-gray-500 to-gray-600',     label: 'Free' },
  pro:       { color: '#7c5cff', gradient: 'from-purple-600 to-pink-500',  label: 'Pro' },
  team:      { color: '#f59e0b', gradient: 'from-amber-500 to-orange-500',  label: 'Team' },
  enterprise:{ color: '#1e40af', gradient: 'from-blue-700 to-blue-900',     label: 'Enterprise' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}

function PlanBadge({ slug }) {
  const meta = PLAN_META[slug] || PLAN_META.free;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
      style={{ background: `linear-gradient(135deg, ${meta.color})` }}
    >
      {slug === 'pro' && <Zap size={10} />}
      {meta.label}
    </span>
  );
}

function PaymentMethodCard({ method, onRemove, onSetDefault }) {
  const brandIcon = method.brand?.toLowerCase() || 'generic';
  const isDefault = method.is_default;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${isDefault ? 'border-[#7c5cff]' : 'border-[var(--border)]'} bg-[var(--surface2)]`}>
      <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        {method.brand ? method.brand.slice(0, 4).toUpperCase() : 'CARD'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold truncate">
          {method.brand || 'Card'} •••• {method.last4 || '????'}
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          {method.exp_month && method.exp_year ? `Expires ${method.exp_month}/${method.exp_year}` : 'No expiry'}
          {isDefault && <span className="ml-2 text-[var(--accent)] font-semibold">Default</span>}
        </div>
      </div>
      {!isDefault && (
        <button
          onClick={() => onSetDefault(method.id)}
          className="text-[11px] px-2.5 py-1 rounded-lg font-medium text-[var(--text-2)] hover:bg-[var(--surface)] border border-[var(--border)] transition-all"
        >
          Set default
        </button>
      )}
      <button
        onClick={() => onRemove(method.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all ml-1"
        title="Remove card"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function InvoiceRow({ invoice }) {
  const isPaid = invoice.status === 'paid' || invoice.status === 'succeeded';
  const isPending = invoice.status === 'pending' || invoice.status === 'open';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface2)] transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPaid ? 'bg-green-500/10 text-green-500' : isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
        {isPaid ? <Check size={14} /> : <CreditCard size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">
          {invoice.description || invoice.invoice_number || 'Invoice'}
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          {formatDate(invoice.created_at)}
        </div>
      </div>
      <div className="text-[13px] font-semibold">
        {formatCurrency(invoice.total, invoice.currency?.toUpperCase() || 'USD')}
      </div>
      {invoice.pdf_url && (
        <a
          href={invoice.pdf_url}
          target="_blank"
          rel="noreferrer"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface)] transition-all"
          title="Download PDF"
        >
          <Download size={13} />
        </a>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const { ask } = useConfirm();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Billing state
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [cardErr, setCardErr] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Payment gateways state
  const [gateways, setGateways] = useState({
    stripe:    { clientId: '', clientSecret: '', publishableKey: '', isActive: false },
    paypal:    { clientId: '', clientSecret: '', isActive: false },
    instamojo: { clientId: '', clientSecret: '', isActive: false },
  });
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gatewaySaved, setGatewaySaved] = useState(false);
  const [gatewayErr, setGatewayErr] = useState('');
  const [gatewayLoading, setGatewayLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Load billing data when payments tab opens
  const loadBilling = useCallback(async () => {
    setBillingLoading(true);
    setGatewayLoading(true);
    try {
      const [subData, invoicesData, gatewaysData] = await Promise.all([
        getSubscription().catch(() => null),
        getInvoices().catch(() => []),
        api.get('/payment-gateways').catch(() => null),
      ]);
      const subObj = subData?.subscription ?? subData ?? null;
      setSubscription(subObj);
      setInvoices(Array.isArray(invoicesData) ? invoicesData.slice(0, 5) : (invoicesData?.invoices || []).slice(0, 5));

      // Load gateway credentials
      if (gatewaysData?.data) {
        setGateways(prev => ({
          stripe:    { ...prev.stripe,    ...gatewaysData.data.stripe },
          paypal:    { ...prev.paypal,    ...gatewaysData.data.paypal },
          instamojo: { ...prev.instamojo, ...gatewaysData.data.instamojo },
        }));
      }

      // Load saved payment methods
      try {
        const stored = JSON.parse(localStorage.getItem('ui_inspectore_payment_methods') || '[]');
        setPaymentMethods(Array.isArray(stored) ? stored : []);
      } catch {
        setPaymentMethods([]);
      }
    } catch (e) {
      console.error('Billing load error:', e);
    } finally {
      setBillingLoading(false);
      setGatewayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadBilling();
    }
  }, [activeTab, loadBilling]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErr('Invalid file type. Please upload PNG, JPG, GIF, or WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr('File too large. Maximum size is 2MB.');
      return;
    }
    setUploadingAvatar(true);
    setErr('');
    try {
      const result = await api.uploadAvatar(file);
      if (result?.token) setToken(result.token);
      await refreshUser();
    } catch (err) {
      setErr(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCopyEmail = async () => {
    if (!email) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErr('Could not copy email.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    setSaved(false);
    try {
      await updateProfile({ name, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCard = (id) => {
    if (!confirm('Remove this payment method?')) return;
    const next = paymentMethods.filter(m => m.id !== id);
    setPaymentMethods(next);
    localStorage.setItem('ui_inspectore_payment_methods', JSON.stringify(next));
  };

  const handleSetDefaultCard = (id) => {
    const next = paymentMethods.map(m => ({ ...m, is_default: m.id === id }));
    setPaymentMethods(next);
    localStorage.setItem('ui_inspectore_payment_methods', JSON.stringify(next));
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setCardErr('');
    setAddingCard(true);
    try {
      const raw = cardNumber.replace(/\s/g, '');
      const [expMonth, expYear] = cardExpiry.split('/').map(s => s.trim());
      if (raw.length < 13 || !expMonth || !expCvc || cardCvc.length < 3) {
        setCardErr('Please enter valid card details.');
        return;
      }
      const cardData = {
        id: `card_${Date.now()}`,
        brand: detectBrand(raw),
        last4: raw.slice(-4),
        exp_month: parseInt(expMonth),
        exp_year: 2000 + parseInt(expYear),
        is_default: paymentMethods.length === 0,
      };
      const method = savePaymentMethod ? savePaymentMethod(cardData) : cardData;
      setPaymentMethods(prev => {
        const next = method.is_default
          ? [...prev.map(m => ({ ...m, is_default: false })), method]
          : [...prev, method];
        localStorage.setItem('ui_inspectore_payment_methods', JSON.stringify(next));
        return next;
      });
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');
      setShowAddCard(false);
    } catch (e) {
      setCardErr(e.message || 'Failed to add card');
    } finally {
      setAddingCard(false);
    }
  };

  const handleGatewayChange = (gateway, field, value) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: { ...prev[gateway], [field]: value },
    }));
  };

  const handleSaveGateways = async (gatewayId) => {
    setGatewaySaving(true);
    setGatewayErr('');
    setGatewaySaved(false);
    try {
      const payload = { [gatewayId]: gateways[gatewayId] };
      const res = await api.put('/payment-gateways', payload);
      if (res?.data) {
        setGateways(prev => ({
          ...prev,
          [gatewayId]: { ...prev[gatewayId], ...res.data[gatewayId] },
        }));
      }
      setGatewaySaved(true);
      setTimeout(() => setGatewaySaved(false), 2500);
    } catch (e) {
      setGatewayErr(e.message || 'Failed to save gateway credentials');
    } finally {
      setGatewaySaving(false);
    }
  };

  function detectBrand(number) {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    if (/^6/.test(number)) return 'Discover';
    return 'Card';
  }

  const planSlug = subscription?.slug || subscription?.plan?.toLowerCase() || user?.plan || 'free';
  const planMeta = PLAN_META[planSlug] || PLAN_META.free;
  const isPro = planSlug !== 'free';

  return (
    <div className="page bg-[radial-gradient(circle_at_50%_0%,rgba(124,92,255,0.05),transparent_40%)] m-8">
      <header className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile, plan, and payment methods.</p>
      </header>

      <div className="grid grid-cols-[220px_1fr] gap-6 max-w-[1100px] max-[800px]:grid-cols-1">
        {/* Sidebar */}
        <aside className="flex flex-col gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'profile' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-2)] hover:bg-[var(--surface2)]'}`}
          >
            <User size={15} /> Profile
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-2)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-not-allowed" disabled>
            <Bell size={15} /> Notifications
          </button>
          <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-2)] hover:bg-[var(--surface2)] disabled:opacity-40 cursor-not-allowed" disabled>
            <Lock size={15} /> Security
          </button>
          <button
            onClick={() => { setActiveTab('payments'); loadBilling(); }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'payments' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-2)] hover:bg-[var(--surface2)]'}`}
          >
            <CreditCard size={15} /> Payments
          </button>

          <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />

          <button
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-2)] hover:bg-red-500/10 hover:text-red-500 transition-all"
            onClick={async () => {
              if (await ask({ title: 'Log out?', message: 'You will be signed out of your account.', confirmLabel: 'Log out', danger: true })) logout();
            }}
          >
            <Trash2 size={15} /> Log out
          </button>
        </aside>

        {/* Content */}
        <div className="flex flex-col gap-6">

          {/* ── Profile Tab ─────────────────────────────────── */}
          <AnimatePresence>
            {activeTab === 'profile' && (
              <motion.div
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-7"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl font-bold mb-1">Profile</h2>
                <p className="text-[var(--text-2)] text-[13px] mb-6">Update your personal information.</p>

                <div className="flex items-center gap-4 p-4 bg-[var(--surface2)] border border-[var(--border)] rounded-xl mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-pink)] text-white text-2xl font-bold flex items-center justify-center relative flex-shrink-0 overflow-hidden cursor-pointer group"
                    onClick={handleAvatarClick}
                    title="Click to change photo"
                  >
                    {user?.avatar
                      ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      : <span>{(name || email || '?').slice(0, 1).toUpperCase()}</span>
                    }
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? <Loader2 size={20} className="text-white spin" /> : <Camera size={20} className="text-white" />}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
                  <div>
                    <div className="font-bold text-[15px]">{user?.name || 'User'}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{email}</div>
                      <button type="button" onClick={handleCopyEmail} className="p-1 rounded-md hover:bg-[var(--surface)] transition-all" title={copied ? 'Copied!' : 'Copy email'}>
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                  {err && <div className="auth-error">{err}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="field">
                      <label className="font-semibold text-sm">Name</label>
                      <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="font-semibold text-sm">Email</label>
                      <input type="email" className="input bg-[var(--surface2)] cursor-not-allowed text-gray-500" value={user?.email} readOnly />
                    </div>
                  </div>
                  <div className="field">
                    <label className="font-semibold text-sm">Bio</label>
                    <textarea className="input" rows={3} placeholder="Tell us about yourself…" value={bio} onChange={e => setBio(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-2">
                    {saved && <span className="inline-flex items-center gap-1 text-[var(--success)] text-[13px] font-semibold"><Check size={14} /> Saved</span>}
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Payments Tab ────────────────────────────────── */}
          <AnimatePresence>
            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-5"
              >
                {billingLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-[var(--accent)] spin" />
                  </div>
                ) : (
                  <>
                    {/* ── Current Plan ─────────────────────── */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-[15px] font-bold flex items-center gap-2">
                            <Zap size={15} style={{ color: planMeta.color }} />
                            Current Plan
                          </h3>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Your active subscription</p>
                        </div>
                        <PlanBadge slug={planSlug} />
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-[var(--surface2)] rounded-xl p-3">
                          <div className="text-[11px] text-[var(--text-muted)] mb-1">Plan</div>
                          <div className="text-[14px] font-bold">{planMeta.label}</div>
                        </div>
                        <div className="bg-[var(--surface2)] rounded-xl p-3">
                          <div className="text-[11px] text-[var(--text-muted)] mb-1">Status</div>
                          <div className="text-[14px] font-bold capitalize">{subscription?.status || 'active'}</div>
                        </div>
                        <div className="bg-[var(--surface2)] rounded-xl p-3">
                          <div className="text-[11px] text-[var(--text-muted)] mb-1">
                            {subscription?.cancel_at_period_end ? 'Renews' : 'Next billing'}
                          </div>
                          <div className="text-[14px] font-bold">
                            {formatDate(subscription?.current_period_end) || '—'}
                          </div>
                        </div>
                      </div>

                      {isPro && subscription?.amount && (
                        <div className="text-[13px] text-[var(--text-muted)] mb-4">
                          {formatCurrency(subscription.amount, subscription.currency?.toUpperCase() || 'USD')}
                          {' / '}{subscription.interval === 'year' ? 'year' : 'month'}
                        </div>
                      )}

                      <button
                        onClick={() => navigate('/app/billing')}
                        className="btn btn-primary flex items-center gap-2 text-[13px]"
                      >
                        {isPro ? 'Manage Subscription' : 'Upgrade Plan'}
                        <ArrowUpRight size={13} />
                      </button>
                    </div>

                    {/* ── Gateway Configuration ────────────── */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-[15px] font-bold flex items-center gap-2">
                            <CreditCard size={15} />
                            Payment Platforms
                          </h3>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Configure API keys for Stripe, PayPal & Instamojo</p>
                        </div>
                      </div>

                      {/* Stripe */}
                      <div className="mb-6 p-4 bg-[var(--surface2)] rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                              <CreditCard size={13} className="text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-[13px]">Stripe</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${gateways.stripe.isActive ? 'bg-green-500/15 text-green-500' : 'bg-gray-500/15 text-gray-400'}`}>
                                {gateways.stripe.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] text-[var(--text-muted)]">{gateways.stripe.isActive ? 'On' : 'Off'}</span>
                            <div onClick={() => handleGatewayChange('stripe', 'isActive', !gateways.stripe.isActive)} className={`relative w-9 h-5 rounded-full transition-colors ${gateways.stripe.isActive ? 'bg-[#7c5cff]' : 'bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${gateways.stripe.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Publishable Key</label>
                            <input className="input text-[12px] font-mono" type="text" placeholder="pk_test_..." value={gateways.stripe.publishableKey} onChange={e => handleGatewayChange('stripe', 'publishableKey', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Secret Key</label>
                            <input className="input text-[12px] font-mono" type="password" placeholder="sk_test_..." value={gateways.stripe.clientSecret} onChange={e => handleGatewayChange('stripe', 'clientSecret', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          {gatewaySaved && <span className="inline-flex items-center gap-1 text-green-500 text-[12px] mr-3"><Check size={12} /> Saved</span>}
                          <button onClick={() => handleSaveGateways('stripe')} disabled={gatewaySaving} className="btn btn-primary text-[12px] px-4 py-1.5 flex items-center gap-1.5">
                            {gatewaySaving ? <Loader2 size={11} className="spin" /> : <Save size={11} />}
                            {gatewaySaving ? 'Saving…' : 'Save Stripe'}
                          </button>
                        </div>
                      </div>

                      {/* PayPal */}
                      <div className="mb-6 p-4 bg-[var(--surface2)] rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                              <Wallet size={13} className="text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-[13px]">PayPal</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${gateways.paypal.isActive ? 'bg-green-500/15 text-green-500' : 'bg-gray-500/15 text-gray-400'}`}>
                                {gateways.paypal.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] text-[var(--text-muted)]">{gateways.paypal.isActive ? 'On' : 'Off'}</span>
                            <div onClick={() => handleGatewayChange('paypal', 'isActive', !gateways.paypal.isActive)} className={`relative w-9 h-5 rounded-full transition-colors ${gateways.paypal.isActive ? 'bg-[#7c5cff]' : 'bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${gateways.paypal.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Client ID</label>
                            <input className="input text-[12px] font-mono" type="text" placeholder="PayPal Client ID" value={gateways.paypal.clientId} onChange={e => handleGatewayChange('paypal', 'clientId', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Client Secret</label>
                            <input className="input text-[12px] font-mono" type="password" placeholder="PayPal Client Secret" value={gateways.paypal.clientSecret} onChange={e => handleGatewayChange('paypal', 'clientSecret', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          {gatewaySaved && <span className="inline-flex items-center gap-1 text-green-500 text-[12px] mr-3"><Check size={12} /> Saved</span>}
                          <button onClick={() => handleSaveGateways('paypal')} disabled={gatewaySaving} className="btn btn-primary text-[12px] px-4 py-1.5 flex items-center gap-1.5">
                            {gatewaySaving ? <Loader2 size={11} className="spin" /> : <Save size={11} />}
                            {gatewaySaving ? 'Saving…' : 'Save PayPal'}
                          </button>
                        </div>
                      </div>

                      {/* Instamojo */}
                      <div className="p-4 bg-[var(--surface2)] rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                              <IndianRupee size={13} className="text-white" />
                            </div>
                            <div>
                              <span className="font-bold text-[13px]">Instamojo</span>
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${gateways.instamojo.isActive ? 'bg-green-500/15 text-green-500' : 'bg-gray-500/15 text-gray-400'}`}>
                                {gateways.instamojo.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-[11px] text-[var(--text-muted)]">{gateways.instamojo.isActive ? 'On' : 'Off'}</span>
                            <div onClick={() => handleGatewayChange('instamojo', 'isActive', !gateways.instamojo.isActive)} className={`relative w-9 h-5 rounded-full transition-colors ${gateways.instamojo.isActive ? 'bg-[#7c5cff]' : 'bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${gateways.instamojo.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                            </div>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">API Key</label>
                            <input className="input text-[12px] font-mono" type="text" placeholder="Instamojo API Key" value={gateways.instamojo.clientId} onChange={e => handleGatewayChange('instamojo', 'clientId', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] mb-1 block">Auth Token</label>
                            <input className="input text-[12px] font-mono" type="password" placeholder="Instamojo Auth Token" value={gateways.instamojo.clientSecret} onChange={e => handleGatewayChange('instamojo', 'clientSecret', e.target.value)} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          {gatewaySaved && <span className="inline-flex items-center gap-1 text-green-500 text-[12px] mr-3"><Check size={12} /> Saved</span>}
                          <button onClick={() => handleSaveGateways('instamojo')} disabled={gatewaySaving} className="btn btn-primary text-[12px] px-4 py-1.5 flex items-center gap-1.5">
                            {gatewaySaving ? <Loader2 size={11} className="spin" /> : <Save size={11} />}
                            {gatewaySaving ? 'Saving…' : 'Save Instamojo'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Payment Methods ──────────────────── */}
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-[15px] font-bold flex items-center gap-2">
                            <CreditCard size={15} />
                            Payment Methods
                          </h3>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Saved cards for subscriptions and purchases</p>
                        </div>
                        <button
                          onClick={() => setShowAddCard(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                        >
                          <Plus size={13} /> Add Card
                        </button>
                      </div>

                      {paymentMethods.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                          <CreditCard size={28} className="mx-auto mb-2 opacity-40" />
                          <p className="text-[13px]">No payment methods saved</p>
                          <p className="text-[12px] mt-1">Add a card to enable Pro features</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {paymentMethods.map(method => (
                            <PaymentMethodCard
                              key={method.id}
                              method={method}
                              onRemove={handleRemoveCard}
                              onSetDefault={handleSetDefaultCard}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Recent Invoices ───────────────────── */}
                    {invoices.length > 0 && (
                      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-[15px] font-bold flex items-center gap-2">
                              <Download size={15} />
                              Recent Invoices
                            </h3>
                          </div>
                          <button
                            onClick={() => navigate('/app/billing?section=invoices')}
                            className="text-[12px] text-[var(--accent)] font-semibold hover:underline flex items-center gap-1"
                          >
                            View all <ChevronRight size={12} />
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {invoices.slice(0, 3).map((inv, i) => (
                            <InvoiceRow key={inv.id || i} invoice={inv} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Add Card Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddCard(false)}
          >
            <motion.div
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-1">Add Payment Method</h3>
              <p className="text-[var(--text-muted)] text-[13px] mb-6">Your card details are stored securely.</p>

              <form onSubmit={handleAddCard} className="flex flex-col gap-4">
                {cardErr && <div className="auth-error text-[12px]">{cardErr}</div>}

                <div className="field">
                  <label className="font-semibold text-sm">Cardholder Name</label>
                  <input className="input" type="text" placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value)} required />
                </div>

                <div className="field">
                  <label className="font-semibold text-sm">Card Number</label>
                  <input
                    className="input font-mono"
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="field">
                    <label className="font-semibold text-sm">Expiry</label>
                    <input
                      className="input font-mono"
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                        setCardExpiry(v);
                      }}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="font-semibold text-sm">CVC</label>
                    <input
                      className="input font-mono"
                      type="text"
                      placeholder="123"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-[var(--surface2)] rounded-lg text-[11px] text-[var(--text-muted)]">
                  <Shield size={13} className="text-green-500 shrink-0" />
                  Your card information is encrypted and never stored on our servers.
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setShowAddCard(false)} className="btn btn-secondary text-[13px]">Cancel</button>
                  <button type="submit" className="btn btn-primary text-[13px]" disabled={addingCard}>
                    {addingCard ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
                    {addingCard ? 'Adding…' : 'Add Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
