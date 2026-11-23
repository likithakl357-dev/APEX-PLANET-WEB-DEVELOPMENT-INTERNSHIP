const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const getToken = () => localStorage.getItem('fn_access_token');
export const setToken = token => token ? localStorage.setItem('fn_access_token', token) : localStorage.removeItem('fn_access_token');
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken(); if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data?.error || `Request failed (${response.status})`); error.status = response.status; throw error; }
  return data;
}
export const apiAuth = {
  requestOtp: phone => api('/auth/otp/request', { method: 'POST', body: { phone } }),
  verifyOtp: (phone, otp) => api('/auth/otp/verify', { method: 'POST', body: { phone, otp } }),
};
