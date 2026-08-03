/**
 * Inspector API utility — thin wrapper around fetch with Bearer auth.
 * All inspector API calls use this instead of the generic api.js.
 */

function getToken() {
  return localStorage.getItem('inspector_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw { response: { data }, message: data.error || 'Request failed' };
  }

  return data;
}

export const inspectorApi = {
  // Auth
  login: (email, password) => request('/inspector/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password, password_confirmation) =>
    request('/inspector/register', { method: 'POST', body: JSON.stringify({ name, email, password, password_confirmation }) }),
  logout: () => request('/inspector/logout', { method: 'POST' }),
  me: () => request('/inspector/me'),
  updateProfile: (data) => request('/inspector/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: () => request('/inspector/account', { method: 'DELETE' }),

  // Projects
  getProjects: () => request('/inspector/projects'),
  getProject: (id) => request(`/inspector/projects/${id}`),
  createProject: (data) => request('/inspector/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/inspector/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/inspector/projects/${id}`, { method: 'DELETE' }),

  // Screenshots
  uploadScreenshot: (projectId, formData) => {
    const token = getToken();
    return fetch(`/api/inspector/projects/${projectId}/screenshots`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData, // FormData — no Content-Type header
    }).then(r => r.json());
  },
  deleteScreenshot: (id) => request(`/inspector/screenshots/${id}`, { method: 'DELETE' }),

  // Reviews
  generateReview: (projectId, data) =>
    request(`/inspector/projects/${projectId}/review`, { method: 'POST', body: JSON.stringify(data) }),
  getProjectReviews: (projectId) => request(`/inspector/projects/${projectId}/reviews`),
  getReview: (id) => request(`/inspector/reviews/${id}`),

  // Redesigns
  generateRedesign: (projectId, data) =>
    request(`/inspector/projects/${projectId}/redesign`, { method: 'POST', body: JSON.stringify(data) }),
  regenerateRedesign: (id, data) =>
    request(`/inspector/redesigns/${id}/regenerate`, { method: 'POST', body: JSON.stringify(data) }),
  getRedesign: (id) => request(`/inspector/redesigns/${id}`),
};

export default inspectorApi;
