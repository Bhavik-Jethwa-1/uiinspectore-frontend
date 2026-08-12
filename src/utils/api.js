const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body instanceof FormData) delete headers['Content-Type'];

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : null),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.message || data.error || 'Request failed',
      res.status
    );
  }

  return data;
}

export const api = {
  // Auth
  register: (data) => request('POST', '/register', data),
  login: (data) => request('POST', '/login', data),
  logout: (token) => request('POST', '/logout', null, token),
  getUser: (token) => request('GET', '/user', null, token),

  // Dashboard (aggregated — single call for all user dashboard data)
  getDashboard: (token) => request('GET', '/dashboard', null, token),

  // Projects
  getProjects: (token) => request('GET', '/projects', null, token),
  createProject: (data, token) => request('POST', '/projects', data, token),
  getProject: (id, token) => {
    const safeId = typeof id === 'object' ? id?.id ?? '' : String(id ?? '');
    return request('GET', `/projects/${safeId}`, null, token);
  },
  updateProject: (id, data, token) => request('PUT', `/projects/${id}`, data, token),
  deleteProject: (id, token) => request('DELETE', `/projects/${id}`, null, token),

  // Reviews
  createReview: (data, token) => request('POST', '/reviews', data, token),
  getReview: (id, token) => {
    const safeId = typeof id === 'object' ? id?.id ?? '' : String(id ?? '');
    return request('GET', `/reviews/${safeId}`, null, token);
  },
  uploadScreenshot: (reviewId, file, token) => {
    const form = new FormData();
    form.append('image', file);
    return request('POST', `/reviews/${reviewId}/screenshot`, form, token);
  },
  analyzeReview: (reviewId, token) => request('POST', `/reviews/${reviewId}/analyze`, {}, token),
  deleteReview: (id, token) => request('DELETE', `/reviews/${id}`, null, token),

  // Profile
  updateProfile: (data, token) => request('PUT', '/user', data, token),

  // Admin — Dashboard (aggregated)
  adminGetDashboard: (token) => request('GET', '/admin/dashboard', null, token),

  // Admin — Reviews (aggregated, no N+1)
  adminGetReviews: (token, params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.status) qs.set('status', params.status);
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', params.page);
    qs.set('per_page', params.per_page || 20);
    const query = qs.toString();
    return request('GET', `/admin/reviews${query ? '?' + query : ''}`, null, token);
  },

  // Admin — Projects
  adminGetProjects: (token, params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page) qs.set('page', params.page);
    qs.set('per_page', params.per_page || 20);
    const query = qs.toString();
    return request('GET', `/admin/projects${query ? '?' + query : ''}`, null, token);
  },

  // Admin — Users
  adminGetUsers: (token, params = {}) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.role) qs.set('role', params.role);
    if (params.status) qs.set('status', params.status);
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', params.page);
    qs.set('per_page', params.per_page || 20);
    const query = qs.toString();
    return request('GET', `/admin/users${query ? '?' + query : ''}`, null, token);
  },
  adminGetUser: (id, token) => request('GET', `/admin/users/${id}`, null, token),
  adminUpdateUser: (id, data, token) => request('PATCH', `/admin/users/${id}`, data, token),
  adminDeleteUser: (id, token) => request('DELETE', `/admin/users/${id}`, null, token),
};

export { ApiError };
