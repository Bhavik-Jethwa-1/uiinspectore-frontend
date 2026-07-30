// API client — UI Inspectore backend
const API_BASE = '/api';

const TOKEN_KEY = 'ui-inspectore_token';
const USER_KEY = 'ui-inspectore_user';

// ─── Token / User helpers ──────────────────────────────────────────────────
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
  try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch {}
};

export const getUserData = () => {
  try { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; } catch { return null; }
};

export const setUserData = (user) => {
  try { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY); } catch {}
};

export const clearUserData = () => {
  try { localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); } catch {}
};

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── In-flight request deduplication ───────────────────────────────────────
// Prevents duplicate simultaneous GET requests to the same URL
const _inflight = new Map();

async function request(path, { method = 'GET', body, headers = {}, raw = false, dedup = false } = {}) {
  const token = getToken();
  const h = {
    Accept: 'application/json',
    ...headers,
  };
  if (body && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
  }
  if (token) h['Authorization'] = `Bearer ${token}`;

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  // Deduplicate GET requests — return in-flight promise instead of firing duplicate
  if (dedup && method === 'GET' && _inflight.has(url)) {
    return _inflight.get(url);
  }

  const opts = { method, headers: h };
  if (body !== undefined) {
    opts.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  let res;
  try {
    if (dedup && method === 'GET') {
      const p = fetch(url, opts).finally(() => _inflight.delete(url));
      _inflight.set(url, p);
      res = await p;
    } else {
      res = await fetch(url, opts);
    }
  } catch (err) {
    throw new ApiError('Network error — please check your connection', 0, null);
  }

  // In raw mode, return the Response object as-is
  if (raw) return res;

  const ct = res.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    try { data = await res.text(); } catch { data = null; }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.detail || data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  // Auto-unwrap { success: true, data: X } → X
  if (data && typeof data === 'object' && data.success === true && 'data' in data) {
    return data.data;
  }
  return data;
}

export const api = {
  request,

  // Generic HTTP methods — GET uses dedup to prevent duplicate simultaneous calls
  get:    (path) => request(path, { dedup: true }),
  put:    (path, opts) => request(path, { method: 'PUT', ...opts }),
  post:   (path, opts) => request(path, { method: 'POST', ...opts }),
  patch:  (path, opts) => request(path, { method: 'PATCH', ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),

  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { dedup: true }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: payload }),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/auth/avatar', { method: 'POST', body: form });
  },

  // Projects
  listProjects: ()             => request('/projects',                    { dedup: true }),
  getProject: (id)            => request(`/projects/${id}`,              { dedup: true }),
  createProject: (payload)    => request('/projects',                    { method: 'POST', body: payload }),
  updateProject: (id, payload) => request(`/projects/${id}`,              { method: 'PUT', body: payload }),
  deleteProject: (id)         => request(`/projects/${id}`,              { method: 'DELETE' }),

  // Screens (nested)
  createScreen: (projectId, payload) =>
    request(`/projects/${projectId}/screens`, { method: 'POST', body: payload }),
  updateScreen: (projectId, screenId, payload) =>
    request(`/projects/${projectId}/screens/${screenId}`, { method: 'PUT', body: payload }),
  deleteScreen: (projectId, screenId) =>
    request(`/projects/${projectId}/screens/${screenId}`, { method: 'DELETE' }),

  // Uploads — generic upload with raw response
  upload: (path, opts) => request(path, { ...opts, raw: true }),

  // AI
  autodesign: (payload) => request('/ai/autodesign', { method: 'POST', body: payload }),
  autodesignChat: (payload) => request('/ai/autodesign-chat', { method: 'POST', body: payload }),
  analyzeScreenshot: (payload) => request('/ai/analyze-screenshot', { method: 'POST', body: payload }),
  generateComponents: (payload) => request('/ai/generate-components', { method: 'POST', body: payload }),

  // AI Conversations
  deleteConversation: (id) => request(`/ai/conversations/${id}`, { method: 'DELETE' }),
  clearConversationHistory: () => request('/ai/conversations/clear-history', { method: 'POST' }),

  // Templates — dedup enabled
  listTemplates: ()         => request('/templates',                 { dedup: true }),
  getTemplate: (id)         => request(`/templates/${id}`,             { dedup: true }),
  listTemplateCategories: () => request('/templates/categories',       { dedup: true }),

  // Admin — dedup enabled
  adminAnalytics: ()      => request('/admin/analytics',      { dedup: true }),
  adminUsers: ()          => request('/admin/users',           { dedup: true }),
  adminPlans: ()          => request('/admin/plans',           { dedup: true }),
  adminSubscriptions: ()   => request('/admin/subscriptions',    { dedup: true }),
};

export default api;
