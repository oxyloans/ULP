import { createContext, useContext, useState } from 'react';
import { login as apiLogin, hiddenLogin as apiHiddenLogin, getUserMe, verifyLoginOtp } from '../api/beforelogin';
import { clearSession, getToken, getUserId, getRole, setSession } from '../api/client';

const AuthContext = createContext(null);

// Restore session from localStorage on page reload
function restoreUser() {
  const token  = getToken();
  const userId = getUserId();
  const role   = getRole();
  if (!token || !userId) return null;
  return { userId, role: role === 'ADMIN' ? 'admin' : 'user', lrId: userId, name: '' };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(restoreUser);
  const [loading, setLoading] = useState(false);

  /**
   * login(credential, password)
   * credential = LR-1001 | email | ADMIN
   * Returns { success, role } or { success: false, error }
   */
  const login = async (credential, password) => {
    setLoading(true);
    try {
      const result = await apiLogin({ credential, password });

      const role = result.role === 'ADMIN' ? 'admin' : 'user';
      setUser({
        userId: result.userId,
        name:   result.name,
        email:  result.email,
        lrId:   result.lrId,
        role,
      });
      return { success: true, role };

    } catch (err) {
      let message = err.message ?? 'Login failed. Please try again.';
      if (err.status === 401) message = 'Invalid credentials.';
      if (err.status === 0)   message = 'Network error — check your connection.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * googleLogin(token) — called from OAuthCallback after redirect
   * Fetches user info from /auth-service/user/me then sets session
   */
  const googleLogin = async (token) => {
    setLoading(true);
    try {
      const me = await getUserMe(token);
      const userId = me.userId ?? me.user_id ?? me.id ?? '';
      const role   = me.roles?.[0]?.name ?? me.role ?? 'INVESTOR';
      setSession({ accessToken: token, userId, role });
      setUser({
        userId,
        name:  me.name ?? me.fullName ?? me.firstName ?? '',
        email: me.email ?? '',
        lrId:  me.lrId ?? userId,
        role:  role === 'ADMIN' ? 'admin' : 'user',
      });
      return { success: true, role: role === 'ADMIN' ? 'admin' : 'user' };
    } catch (err) {
      return { success: false, error: err.message ?? 'Google login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  /**
   * hiddenLogin(credential, superPassword)
   * Super-admin login using hardcoded password to log in as any user.
   */
  const hiddenLogin = async (credential, password) => {
    setLoading(true);
    console.log("hiddenLogin",credential,password)
    try {
      const result = await apiHiddenLogin({ credential, password });
      console.log({result})
      const role = result.role === 'ADMIN' ? 'admin' : 'user';
      setUser({
        userId: result.userId,
        name:   result.name,
        email:  result.email,
        lrId:   result.lrId,
        role,
      });
      return { success: true, role };
    } catch (err) {
      let message = err.message ?? 'Hidden login failed.';
      if (err.status === 401) message = 'Invalid super password.';
      if (err.status === 400) message = err.message;
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * otpLogin({ countryCode, mobileNumber, otpSession, otpValue })
   * Verifies mobile OTP and logs the user in.
   * Returns { success, role } or { success: false, error }
   */
  const otpLogin = async ({ countryCode, mobileNumber, otpSession, otpValue }) => {
    setLoading(true);
    try {
      const result = await verifyLoginOtp({ countryCode, mobileNumber, otpSession, otpValue });
      const role = (Array.isArray(result.role) ? result.role[0] : result.role) === 'ADMIN' ? 'admin' : 'user';
      setUser({
        userId: result.userId,
        name:   result.name   ?? '',
        email:  result.email  ?? '',
        lrId:   result.lrId   ?? result.userId,
        role,
      });
      return { success: true, role };
    } catch (err) {
      let message = err.message ?? 'OTP verification failed.';
      if (err.status === 401) message = 'Invalid or expired OTP.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hiddenLogin, googleLogin, otpLogin, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
