import { createContext, useContext, useState, useCallback } from 'react';

const InspectorAuthContext = createContext(null);

export function InspectorAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('inspector_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('inspector_token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspector/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');

      localStorage.setItem('inspector_token', data.token);
      localStorage.setItem('inspector_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password, password_confirmation) => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspector/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('inspector_token', data.token);
      localStorage.setItem('inspector_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/inspector/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      });
    } catch {}
    localStorage.removeItem('inspector_token');
    localStorage.removeItem('inspector_user');
    setToken(null);
    setUser(null);
  }, [token]);

  const updateProfile = useCallback(async (updates) => {
    const res = await fetch('/api/inspector/profile', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    localStorage.setItem('inspector_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, [token]);

  return (
    <InspectorAuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </InspectorAuthContext.Provider>
  );
}

export function useInspectorAuth() {
  const ctx = useContext(InspectorAuthContext);
  if (!ctx) throw new Error('useInspectorAuth must be used within InspectorAuthProvider');
  return ctx;
}
