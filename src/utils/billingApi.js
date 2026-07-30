import api from './api';

const TOKEN_KEY = 'ui-inspectore_token';
const BASE = '/api/billing';
const ADMIN = '/api/admin/billing';

// Attach auth token to all requests — must match api.js token key
function headers() {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function get(endpoint) {
  const res = await fetch(`${BASE}${endpoint}`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

async function post(endpoint, body = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || 'Request failed');
  }
  return res.json();
}

// ─── Plans ──────────────────────────────────────────────────────────────────

export const getPlans = () => get('/plans');
export const getPlan = (slug) => get(`/plans/${slug}`);

// ─── Subscription ──────────────────────────────────────────────────────────

export const getSubscription = () => get('/subscription');
export const subscribe = (planSlug, billingCycle = 'monthly', paymentToken = null) =>
  post('/subscribe', { plan_slug: planSlug, billing_cycle: billingCycle, payment_token: paymentToken });

export const createCheckoutSession = (planSlug, billingCycle = 'monthly') =>
  post('/create-checkout', { plan_slug: planSlug, billing_cycle: billingCycle });

export const verifyCheckoutSession = (sessionId) =>
  post('/verify-checkout', { session_id: sessionId });
export const cancelSubscription = (immediately = false) =>
  post('/cancel', { immediately });
export const resumeSubscription = () => post('/resume');
export const changePlan = (planSlug, billingCycle = 'monthly') =>
  post('/change-plan', { plan_slug: planSlug, billing_cycle: billingCycle });

// ─── Usage ─────────────────────────────────────────────────────────────────

export const getUsage = () => get('/usage');
export const checkFeature = (feature) => get(`/check-feature/${feature}`);
export const checkUsage = (feature) => get(`/check-usage/${feature}`);

// ─── Payments ───────────────────────────────────────────────────────────────

export const getPayments = () => get('/payments');
export const getInvoices = () => get('/invoices');
export const savePaymentMethod = (cardData) => {
  // Demo: store card summary in localStorage (no real Stripe integration yet)
  const existing = JSON.parse(localStorage.getItem('ui_inspectore_payment_methods') || '[]');
  const newMethod = {
    id: Date.now().toString(),
    type: 'card',
    brand: detectCardBrand(cardData.number),
    last4: cardData.number.replace(/\s/g, '').slice(-4),
    expiry_month: cardData.expiry.split('/')[0]?.trim(),
    expiry_year: '20' + cardData.expiry.split('/')[1]?.trim(),
    is_default: existing.length === 0,
    added_at: new Date().toISOString(),
  };
  existing.push(newMethod);
  localStorage.setItem('ui_inspectore_payment_methods', JSON.stringify(existing));
  return newMethod;
};

function detectCardBrand(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6/.test(n)) return 'discover';
  return 'default';
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export const getCreditBalance = () => get('/credits/balance');
export const getCreditPacks = () => get('/credits/packs');
export const purchaseCreditPack = (packId, successUrl, cancelUrl) =>
  post(`/credits/packs/${packId}/purchase`, { success_url: successUrl, cancel_url: cancelUrl });

export const getDashboard = () => get('/dashboard');

// ─── Admin ────────────────────────────────────────────────────────────────

export const adminGetPlans = async () => {
  const res = await fetch(`${ADMIN}/plans`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load plans');
  return res.json();
};

export const adminCreatePlan = (data) =>
  fetch(`${ADMIN}/plans`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const adminUpdatePlan = (id, data) =>
  fetch(`${ADMIN}/plans/${id}`, {
    method: 'PUT',
    headers: { ...headers(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const adminDeletePlan = (id) =>
  fetch(`${ADMIN}/plans/${id}`, { method: 'DELETE', headers: headers() }).then(r => r.json());

export const adminGetSubscriptions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${ADMIN}/subscriptions${qs ? '?' + qs : ''}`, { headers: headers() }).then(r => r.json());
};

export const adminGetPayments = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${ADMIN}/payments${qs ? '?' + qs : ''}`, { headers: headers() }).then(r => r.json());
};

export const adminIssueRefund = (paymentId) =>
  fetch(`${ADMIN}/payments/${paymentId}/refund`, { method: 'POST', headers: headers() }).then(r => r.json());

export const adminGetAnalytics = () =>
  fetch(`${ADMIN}/analytics`, { headers: headers() }).then(r => r.json());

export const adminGetGlobalUsage = () =>
  fetch(`${ADMIN}/usage`, { headers: headers() }).then(r => r.json());

// ─── Feature Constants ─────────────────────────────────────────────────────

export const FEATURE_LIMITS = {
  free: {
    ai_generations: 10,
    image_generations: 10,
    ai_chat: 50,
    screenshot_analysis: 20,
    projects: 2,
    exports: 5,
    templates: 3,
    storage_mb: 100,
    team_members: 1,
    history_days: 7,
  },
  pro: {
    ai_generations: -1,
    image_generations: -1,
    ai_chat: -1,
    screenshot_analysis: -1,
    projects: -1,
    exports: -1,
    templates: 40,
    storage_mb: 20480,
    team_members: 5,
    history_days: -1,
  },
  team: {
    ai_generations: -1,
    image_generations: -1,
    ai_chat: -1,
    screenshot_analysis: -1,
    projects: -1,
    exports: -1,
    templates: -1,
    storage_mb: 102400,
    team_members: 5,
    history_days: -1,
  },
};

export const FEATURE_LABELS = {
  ai_generations: 'AI Generations',
  image_generations: 'Image Generation',
  ai_chat: 'AI Chat Messages',
  screenshot_analysis: 'Screenshot Analysis',
  projects: 'Projects',
  exports: 'Exports',
  templates: 'Templates',
  storage_mb: 'Storage (MB)',
  team_members: 'Team Members',
  history_days: 'History (Days)',
};

export const USAGE_FEATURE_ORDER = [
  'ai_generations',
  'image_generations',
  'ai_chat',
  'screenshot_analysis',
  'projects',
  'exports',
  'templates',
  'storage_mb',
  'team_members',
  'history_days',
];

// ─── Wallet API ─────────────────────────────────────────────────────────────────
export const getWallet = () => get('/wallet');
export const getWalletHistory = (page = 1, type = null) => {
  const params = new URLSearchParams({ page, per_page: 20 });
  if (type) params.set('type', type);
  return get(`/wallet/history?${params}`);
};
export const getWalletUsage = (page = 1, feature = null) => {
  const params = new URLSearchParams({ page, per_page: 20 });
  if (feature) params.set('feature', feature);
  return get(`/wallet/usage?${params}`);
};
export const getWalletPricing = () => get('/wallet/pricing');
export const updateAutoRecharge = (data) => post('/wallet/auto-recharge', data);
export const prepareWalletTopup = (amount, provider = 'stripe') =>
  post('/wallet/topup/prepare', { amount, provider });

export const verifyWalletTopup = (sessionId) =>
  post('/wallet/verify-topup', { session_id: sessionId });
