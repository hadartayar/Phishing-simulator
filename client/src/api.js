const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function normalizeError(errObj) {
  // Zod error array -> friendly bullet list
  if (Array.isArray(errObj)) {
    return errObj.map(e => `${e.path?.join('.') || ''}: ${e.message}`).join(' • ');
  }
  if (typeof errObj === 'string') return errObj;
  if (errObj && typeof errObj === 'object' && errObj.error) return normalizeError(errObj.error);
  try { return JSON.stringify(errObj); } catch { return 'Unknown error'; }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(normalizeError(json || res.statusText));
  }
  return json;
}

export const api = {
  health: () => request('/api/health'),
  metrics: () => request('/api/campaigns/__metrics/summary'),
  templates: {
    list: () => request('/api/templates'),
    get: (id) => request(`/api/templates/${id}`),
    create: (data) => request('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/templates/${id}`, { method: 'DELETE' }),
  },
  recipients: {
    list: () => request('/api/recipients'),
    get: (id) => request(`/api/recipients/${id}`),
    create: (data) => request('/api/recipients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/recipients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/recipients/${id}`, { method: 'DELETE' }),
  },
  campaigns: {
    list: () => request('/api/campaigns'),
    get: (id) => request(`/api/campaigns/${id}`),
    create: (data) => request('/api/campaigns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/campaigns/${id}`, { method: 'DELETE' }),
    launch: (id) => request(`/api/campaigns/${id}/launch`, { method: 'POST' }),
  }
}
