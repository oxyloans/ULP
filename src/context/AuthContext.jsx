import { createContext, useContext, useState } from 'react';
import { login as apiLogin, hiddenLogin as apiHiddenLogin, getUserMe, verifyLoginOtp } from '../api/beforelogin';
import { clearSession, getToken, getUserId, getRoles, setSession } from '../api/client';
import { hasPermission, ADMIN_ROLES } from '../config/adminRoles';

const AuthContext = createContext(null);

// Restore session from sessionStorage on page reload
function restoreUser() {
  const token   = getToken();
  const userId  = getUserId();
  const roles   = getRoles(); // array of role strings from API
  if (!token || !userId) return null;
  
  const isAdmin = roles.includes('ADMIN') || roles.some(r => ADMIN_ROLES[r]);
  return {
    userId,
    roles,
    role:      isAdmin ? 'admin' : 'user',
    lrId:      userId,
    name:      '',
  };
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

      const roles = Array.isArray(result.roles) ? result.roles : (result.role ? [result.role] : []);
      const isAdmin = roles.includes('ADMIN') || roles.some(r => ADMIN_ROLES[r]);
      setUser({
        userId:    result.userId,
        name:      result.name,
        email:     result.email,
        lrId:      result.lrId,
        role:      isAdmin ? 'admin' : 'user',
        roles,
      });
      return { success: true, role: isAdmin ? 'admin' : 'user' };

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
      const roles = Array.isArray(me.roles) 
        ? me.roles.map(r => r.name).filter(Boolean) 
        : (me.role ? [me.role] : []);
      
      setSession({ accessToken: token, userId, roles });
      const isAdmin = roles.includes('ADMIN') || roles.some(r => ADMIN_ROLES[r]);
      setUser({
        userId,
        name:      me.name ?? me.fullName ?? me.firstName ?? '',
        email:     me.email ?? '',
        lrId:      me.lrId ?? userId,
        role:      isAdmin ? 'admin' : 'user',
        roles,
      });
      return { success: true, role: isAdmin ? 'admin' : 'user' };
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
    try {
      const result = await apiHiddenLogin({ credential, password });
      const roles = Array.isArray(result.roles) ? result.roles : (result.role ? [result.role] : []);
      const isAdmin = roles.includes('ADMIN') || roles.some(r => ADMIN_ROLES[r]);
      setUser({
        userId:    result.userId,
        name:      result.name,
        email:     result.email,
        lrId:      result.lrId,
        role:      isAdmin ? 'admin' : 'user',
        roles,
      });
      return { success: true, role: isAdmin ? 'admin' : 'user' };
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
      const roles = Array.isArray(result.roles) ? result.roles : (result.role ? [result.role] : []);
      const isAdmin = roles.includes('ADMIN') || roles.some(r => ADMIN_ROLES[r]);
      setUser({
        userId:    result.userId,
        name:      result.name   ?? '',
        email:     result.email  ?? '',
        lrId:      result.lrId   ?? result.userId,
        role:      isAdmin ? 'admin' : 'user',
        roles,
      });
      return { success: true, role: isAdmin ? 'admin' : 'user' };
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
