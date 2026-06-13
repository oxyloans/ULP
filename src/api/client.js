/**
 * api/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central axios client.
 * Base URL: https://meta.oxyloans.com/api
 *
 * Storage keys:
 *   ACCESS_TOKEN  → sessionStorage
 *   USERID        → sessionStorage
 *   ROLES         → sessionStorage  (array of role strings, e.g. ["ADMIN"], ["CEO", "ACCOUNTS_MANAGER"])
 */

import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
export const BASE_URL    = 'https://meta.oxyloans.com/api';
export const ACCESS_TOKEN = 'accessToken';
export const USERID       = 'userId';
export const ROLES        = 'roles';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken      = ()      => sessionStorage.getItem(ACCESS_TOKEN) ?? '';
export const getUserId     = ()      => sessionStorage.getItem(USERID) ?? '';
export const getRoles      = ()      => {
  const raw = sessionStorage.getItem(ROLES);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return raw ? [raw] : []; }
};
export const setSession = ({ accessToken, userId, roles }) => {
  sessionStorage.setItem(ACCESS_TOKEN, accessToken);
  sessionStorage.setItem(USERID,       userId);
  sessionStorage.setItem(ROLES,        JSON.stringify(roles ?? []));
};
export const clearSession = () => {
  sessionStorage.removeItem(ACCESS_TOKEN);
  sessionStorage.removeItem(USERID);
  sessionStorage.removeItem(ROLES);
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
