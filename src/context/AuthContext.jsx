import { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../api/beforelogin';
import { clearSession, getToken, getUserId, getRole } from '../api/client';

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

  const logout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
