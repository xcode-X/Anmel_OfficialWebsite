const API = '/api';

function getToken() {
  return localStorage.getItem('intelera_admin_token');
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || res.statusText);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => localStorage.removeItem('intelera_admin_token'),
  setToken: (token) => localStorage.setItem('intelera_admin_token', token),
  getToken,
  isLoggedIn: () => !!getToken(),
};

export const lmsContent = {
  list: (includeDrafts = false) => api.get(`/lms-content${includeDrafts ? '?published=false' : ''}`),
  create: (payload) => api.post('/lms-content', payload),
  bulkCreate: (items) => api.post('/lms-content/bulk', { items }),
  update: (id, payload) => api.put(`/lms-content/${id}`, payload),
  remove: (id) => api.delete(`/lms-content/${id}`),
  subscribe: (onChange) => {
    const source = new EventSource('/api/lms-content/stream');
    source.onmessage = () => onChange?.();
    source.onerror = () => {
      // EventSource auto-reconnects; ignore noisy transient errors.
    };
    return () => source.close();
  },
};

export const studentRegistrations = {
  // Public submission — no auth required
  register: (payload) => api.post('/student-registrations', payload),

  // Admin list (lightweight — no doc blobs, includes submittedDocFields array).
  // Throws with message 'db_unavailable' on 503 so the dashboard can retry.
  list: () => api.get('/student-registrations'),

  // Admin single record — includes full base64 document data for view/download
  getById: (id) => api.get(`/student-registrations/${id}`),

  update: (id, payload) => api.patch(`/student-registrations/${id}`, payload),
  reject:  (id, reason) => api.post(`/student-registrations/${id}/reject`, { reason }),
  restore: (id)         => api.post(`/student-registrations/${id}/restore`, {}),
  provision: (id)       => api.post(`/student-registrations/${id}/provision-lms`, {}),

  // SSE subscription — instant push from the server on any data change.
  // Returns a cleanup function; call it on component unmount.
  subscribe: (onChange) => {
    const token = getToken();
    if (!token) return () => {};
    const source = new EventSource(
      `/api/student-registrations/stream?token=${encodeURIComponent(token)}`
    );
    source.onmessage = (e) => {
      try { if (JSON.parse(e.data).event === 'changed') onChange(); } catch { /* ignore */ }
    };
    source.onerror = () => { /* EventSource auto-reconnects */ };
    return () => source.close();
  },
};

export const securityChecker = {
  analyze: (url) => api.post('/security-checker/analyze', { url }),
};

// ─── Scholarships ────────────────────────────────────────────────
export const scholarshipsApi = {
  list: () => request('/scholarships'),
  adminList: () => request('/scholarships/admin/all'),
  get: (id) => request(`/scholarships/${id}`),
  create: (data) => request('/scholarships', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/scholarships/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id) => request(`/scholarships/${id}`, { method: 'DELETE' }),
  // Real-time polling helper
  poll: (callback, intervalMs = 15000) => {
    let active = true;
    const tick = async () => {
      if (!active) return;
      try { const data = await request('/scholarships'); callback(data); } catch { /* ignore */ }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => { active = false; clearInterval(id); };
  },
};

// ─── Agents ──────────────────────────────────────────────────────
function getAgentToken() {
  return localStorage.getItem('intelera_agent_token');
}

async function agentRequest(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getAgentToken() || getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || res.statusText);
  return data;
}

export const agentsApi = {
  // Public
  register: (payload) =>
    fetch('/api/agents/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Registration failed'); return d; }),
  login: async (credentials) => {
    const d = await fetch('/api/agents/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) })
      .then(async r => { const dd = await r.json(); if (!r.ok) throw new Error(dd.error || 'Login failed'); return dd; });
    if (d.token) localStorage.setItem('intelera_agent_token', d.token);
    return d;
  },
  logout: () => localStorage.removeItem('intelera_agent_token'),
  getToken: getAgentToken,
  isLoggedIn: () => !!getAgentToken(),
  me: () => agentRequest('/agents/portal/me'),

  // Admin CRUD
  adminList: () => request('/agents'),
  adminGet: (id) => request(`/agents/${id}`),
  adminApprove: (id) => request(`/agents/${id}/approve`, { method: 'PATCH', body: '{}' }),
  adminReject: (id, notes) => request(`/agents/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ notes }) }),
  adminUpdate: (id, data) => request(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminResendCredentials: (id) => request(`/agents/${id}/resend-credentials`, { method: 'POST', body: '{}' }),

  // SSE subscription — instant push whenever any agent record changes.
  // Calls onChange() on every 'changed' event. Returns cleanup function.
  subscribe: (onChange) => {
    const token = getToken();
    if (!token) return () => {};
    const source = new EventSource(
      `/api/agents/stream?token=${encodeURIComponent(token)}`
    );
    source.onmessage = (e) => {
      try { if (JSON.parse(e.data).event === 'changed') onChange(); } catch { /* ignore */ }
    };
    source.onerror = () => { /* EventSource auto-reconnects */ };
    return () => source.close();
  },

  // Agent portal
  changePassword: (currentPassword, newPassword) =>
    agentRequest('/agents/portal/change-password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
};

// Sentinel returned when the backend responds with 503 db_unavailable.
// Components check for this to avoid replacing good cached data with nothing.
const DB_UNAVAILABLE = Symbol('db_unavailable');

export const universitiesApi = {
  // Lightweight list — no image blobs, fast for admin polling.
  // Returns DB_UNAVAILABLE sentinel when the server responds 503.
  list: () =>
    fetch('/api/universities', { headers: { Authorization: `Bearer ${localStorage.getItem('intelera_admin_token') || ''}` } })
      .then(r => r.status === 503 ? DB_UNAVAILABLE : r.json())
      .catch(() => DB_UNAVAILABLE),

  // Full list with images — used by the public-facing display.
  listFull: () =>
    fetch('/api/universities?full=1', { headers: { Authorization: `Bearer ${localStorage.getItem('intelera_admin_token') || ''}` } })
      .then(r => r.status === 503 ? DB_UNAVAILABLE : r.json())
      .catch(() => DB_UNAVAILABLE),

  isUnavailable: (v) => v === DB_UNAVAILABLE,

  get:    (id) => request(`/universities/${id}`),
  lookup: (url) => request(`/universities/lookup?url=${encodeURIComponent(url)}`),
  create: (data) => request('/universities', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/universities/${id}`, { method: 'DELETE' }),

  // Admin poll: lightweight (no images).
  // Calls callback only when real data arrives; skips on 503 so cached data is preserved.
  poll: (callback, interval = 30000) => {
    let timeout;
    const tick = async () => {
      const d = await universitiesApi.list();
      if (!universitiesApi.isUnavailable(d)) callback(d);
      timeout = setTimeout(tick, interval);
    };
    tick();
    return () => clearTimeout(timeout);
  },

  // Public poll: includes full image data for card rendering.
  // Calls callback(data, isUnavailable) so the UI can decide what to do.
  pollFull: (callback, interval = 15000) => {
    let timeout;
    const tick = async () => {
      const d = await universitiesApi.listFull();
      callback(d, universitiesApi.isUnavailable(d));
      timeout = setTimeout(tick, interval);
    };
    tick();
    return () => clearTimeout(timeout);
  },
};

export const testimonialsApi = {
  list: () => request('/testimonials').catch(() => []),
  create: (data) => request('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/testimonials/${id}`, { method: 'DELETE' }),
  poll: (callback, interval = 5000) => {
    let timeout;
    const tick = async () => {
      try { const d = await testimonialsApi.list(); callback(d); } catch (e) {}
      timeout = setTimeout(tick, interval);
    };
    tick();
    return () => clearTimeout(timeout);
  }
};

export default api;
