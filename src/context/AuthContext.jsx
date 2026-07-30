import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setToken, getToken, getUserData, setUserData, clearUserData, ApiError } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Hydrate from localStorage immediately so page reloads show user without a flash
  const [user, setUser] = useState(() => getUserData());
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const me = await api.me();
      setUser(me);
      setUserData(me); // persist fresh data
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setToken(null);
        clearUserData();
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    const token = data?.token || data?.access_token || data?.accessToken;
    const user = data?.user || data;
    if (token) setToken(token);
    if (user) { setUserData(user); setUser(user); }
    setLoading(false);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    const token = data?.token || data?.access_token || data?.accessToken;
    const user = data?.user || data;
    if (token) setToken(token);
    if (user) { setUserData(user); setUser(user); }
    setLoading(false);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    clearUserData();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.updateProfile(payload);
    const merged = { ...user, ...updated };
    setUserData(merged);
    setUser(merged);
    return updated;
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
