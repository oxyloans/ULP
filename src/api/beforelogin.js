/**
 * api/beforelogin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All public API calls — no auth token required.
 * Handles BOTH user and admin login from one place.
 *
 * Real endpoint:
 *   POST https://meta.oxyloans.com/api/auth-service/auth/sign-in
 *   Body:     { email, password }
 *   Response: { accessToken, userId, roles: [{ name: 'INVESTOR' | 'ADMIN' }] }
 *
 * Demo credentials (USE_DUMMY path):
 *   User  → LR-1001 / pass123
 *   Admin → ADMIN   / admin123
 */

import { post, setSession } from './client';

const SIGN_IN = '/auth-service/auth/sign-in';

// ─── Demo users (shown when USE_DUMMY = true) ─────────────────────────────────
const DEMO_USERS = {
  'LR-1001': { password: 'pass123',  name: 'Rajesh Varma', role: 'INVESTOR', userId: 'USR-001', email: 'rajesh@example.com', lrId: 'LR-1001' },
  'ADMIN':   { password: 'admin123', name: 'Admin',         role: 'ADMIN',    userId: 'ADMIN',   email: 'admin@oxyloans.com', lrId: 'ADMIN'   },
};

// ─── Login (user + admin) ─────────────────────────────────────────────────────
/**
 * login({ credential, password })
 *
 * credential = LR ID | email | "ADMIN"
 *
 * Returns: { accessToken, userId, role, name, email, lrId }
 * Throws:  Error with .status on failure
 *
 * Flow:
 *  1. If credential matches a DEMO_USER key → return dummy data (no API call)
 *  2. Otherwise → call real API, store token, return normalised result
 */
export async function login({ credential, password }) {
  const key = credential.trim().toUpperCase();

  // ── Demo path ───────────────────────────────────────────────────────────────
  if (key in DEMO_USERS) {
    const u = DEMO_USERS[key];
    if (u.password !== password) {
      const err = new Error('Invalid credentials'); err.status = 401; throw err;
    }
    const accessToken = `demo-token-${Date.now()}`;
    setSession({ accessToken, userId: u.userId, role: u.role });
    return { accessToken, userId: u.userId, role: u.role, name: u.name, email: u.email, lrId: u.lrId };
  }

  // ── Real API path ───────────────────────────────────────────────────────────
  // credential is treated as email; backend also accepts LR ID as email field
  const response = await post(SIGN_IN, { email: credential.trim(), password }, { auth: false });

  const accessToken = response.accessToken ?? response.access_token ?? '';
  const userId      = response.userId      ?? response.user_id      ?? '';
  const role        = response.roles?.[0]?.name ?? 'INVESTOR';

  if (!accessToken) {
    const err = new Error('Login failed — no token received.'); err.status = 500; throw err;
  }

  setSession({ accessToken, userId, role });

  return {
    accessToken,
    userId,
    role,
    name:  response.name ?? response.fullName ?? credential,
    email: response.email ?? credential,
    lrId:  response.lrId  ?? userId,
  };
}

// ─── Hidden / Super Login ─────────────────────────────────────────────────────
/**
 * hiddenLogin({ credential, password })
 *
 * Uses hardcoded super password. Accepts email or mobile number.
 * Calls: POST /auth-service/auth/registerwith_MobileAndEmail_HiddenLogin
 *
 * Returns: { accessToken, userId, role, name, email, lrId }
 */
const SUPER_PASSWORD = 'SUPERPASSWORD';

export async function hiddenLogin({ credential, password }) {
  if (password !== SUPER_PASSWORD) {
    const err = new Error('Invalid credentials'); err.status = 401; throw err;
  }

  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const mobileRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

  let postData = {};
  if (emailRegex.test(credential))       postData = { email: credential.toLowerCase() };
  else if (mobileRegex.test(credential)) postData = { mobileNumber: credential };
  else {
    const err = new Error('Please enter a valid email or mobile number.'); err.status = 400; throw err;
  }

  const response = await post(
    '/auth-service/auth/registerwith_MobileAndEmail_HiddenLogin',
    postData,
    { auth: false }
  );

  const accessToken = response.accessToken ?? response.access_token ?? '';
  const userId      = response.userId      ?? response.user_id      ?? '';
  const role        = response.roles?.[0]?.name ?? 'INVESTOR';

  if (!accessToken) {
    const err = new Error('Hidden login failed — no token received.'); err.status = 500; throw err;
  }

  setSession({ accessToken, userId, role });

  return {
    accessToken,
    userId,
    role,
    name:  response.name ?? response.fullName ?? credential,
    email: response.email ?? credential,
    lrId:  response.lrId  ?? userId,
  };
}
export async function forgotPassword({ email }) {
  return post('/auth-service/auth/forgot-password', { email }, { auth: false });
}

// ─── Reset password ───────────────────────────────────────────────────────────
export async function resetPassword({ token, newPassword }) {
  return post('/auth-service/auth/reset-password', { token, newPassword }, { auth: false });
}

// ─── Register — send mobile OTP ──────────────────────────────────────────────
export async function sendMobileOtp({ mobileNumber }) {
  return post('/auth-service/user/send-mobile-otp?type=check', {
    mobileNumber,
    templateName: 'OXYBRICKS',
  }, { auth: false });
}

// ─── Register — sign up ───────────────────────────────────────────────────────
export async function signUp({ firstName, lastName, email, gender, mobileNumber, password, otp, otpSession, referId }) {
  return post('/auth-service/auth/sign-up', {
    alternativeMobile: mobileNumber,
    email,
    firstName,
    gender,
    lastName,
    middleName: '',
    mobileOtp: otp,
    otpSession,
    mobileNumber,
    password,
    profileImage: '',
    proofNumber: '',
    proofPath: '',
    roleId: 'bb261c45-f169-445d-a08f-eb47d9080aa0',
    refferId: referId ?? '',
  }, { auth: false });
}

// ─── Pre-login support contact ────────────────────────────────────────────────
export async function submitSupportQuery({ name, email, phone, message }) {
  return post('/user-service/support/contact', { name, email, phone, message }, { auth: false });
}
