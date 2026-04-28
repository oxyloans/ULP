/**
 * api/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central axios client.
 * Base URL: https://meta.oxyloans.com/api
 *
 * Storage keys (mirrors legacy app):
 *   ACCESS_TOKEN  → localStorage
 *   USERID        → localStorage
 *   ROLES         → localStorage  (e.g. "INVESTOR" | "ADMIN")
 */

import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
export const BASE_URL    = 'https://meta.oxyloans.com/api';
export const ACCESS_TOKEN = 'accessToken';
export const USERID       = 'userId';
export const ROLES        = 'roles';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken   = ()      => localStorage.getItem(ACCESS_TOKEN) ?? '';
export const getUserId  = ()      => localStorage.getItem(USERID) ?? '';
export const getRole    = ()      => localStorage.getItem(ROLES) ?? '';
export const setSession = ({ accessToken, userId, role }) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(USERID,       userId);
  localStorage.setItem(ROLES,        role);
};
export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(USERID);
  localStorage.removeItem(ROLES);
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request + handle multipart correctly
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  // If body is FormData, remove the JSON Content-Type so axios
  // sets multipart/form-data with the correct boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Normalise errors
client.interceptors.response.use(
  (res) => res.data,          // unwrap → callers get data directly
  (err) => {
    const status  = err.response?.status ?? 0;
    const message = err.response?.data?.message
      || err.response?.data?.error
      || err.message
      || 'Network error';
    const error   = new Error(message);
    error.status  = status;
    error.data    = err.response?.data ?? null;
    return Promise.reject(error);
  }
);

export default client;

// ─── Convenience wrappers ─────────────────────────────────────────────────────
export const get   = (url, config)        => client.get(url, config);
export const post  = (url, data, config)  => client.post(url, data, config);
export const put   = (url, data, config)  => client.put(url, data, config);
export const patch = (url, data, config)  => client.patch(url, data, config);
export const del   = (url, config)        => client.delete(url, config);
