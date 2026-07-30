import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AIProviderContext = createContext(null);

// ─── API helpers ────────────────────────────────────────────────────────────
function getToken() {
  try { return localStorage.getItem('ui-inspectore_token'); }
  catch { return null; }
}

async function fetchJson(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; }
  catch { data = { error: text || res.statusText }; }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function AIProviderProvider({ children }) {
  const [providers, setProviders] = useState({});     // { openai: {...}, minimax: {...} }
  const [primaryProvider, setPrimary] = useState(null);
  const [anyAvailable, setAnyAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJson('/api/admin/ai/providers');
      setProviders(data.providers || {});
      setPrimary(data.primary || null);
      // anyAvailable = at least one provider has available=true AND isPrimary
      const provs = data.providers || {};
      const available = Object.values(provs).some((p) => p.available && p.isActive);
      setAnyAvailable(available);
      setLastFetched(Date.now());
    } catch (err) {
      // Non-admin or unauthenticated → fall back to /api/ai/providers (no auth)
      try {
        const pub = await fetchJson('/api/ai/providers');
        const pubList = Array.isArray(pub.providers) ? pub.providers : [];
        const map = {};
        pubList.forEach((p) => {
          map[p.slug] = {
            name: p.slug,
            label: p.name,
            available: !!p.available,
            isPrimary: !!p.isPrimary,
            model: p.model,
            isActive: !!p.available, // assume active if available
          };
        });
        setProviders(map);
        const primary = pubList.find((p) => p.isPrimary);
        setPrimary(primary ? primary.slug : null);
        setAnyAvailable(pubList.some((p) => p.available));
        setLastFetched(Date.now());
      } catch (e2) {
        // Best-effort: assume available=true so UI doesn't block; pages will retry on demand
        setProviders({});
        setPrimary(null);
        setAnyAvailable(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount, and whenever the user logs in (token changes)
  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProviderAvailable = useCallback(
    (name) => {
      const p = providers?.[name];
      return !!(p && p.available && p.isActive);
    },
    [providers],
  );

  const value = {
    providers,
    primaryProvider,
    anyAvailable,
    loading,
    isProviderAvailable,
    refresh,
    lastFetched,
  };

  return <AIProviderContext.Provider value={value}>{children}</AIProviderContext.Provider>;
}

export function useAIProvider() {
  const ctx = useContext(AIProviderContext);
  if (!ctx) {
    // Graceful fallback when used outside the Provider
    return {
      providers: {},
      primaryProvider: null,
      anyAvailable: true,
      loading: false,
      isProviderAvailable: () => true,
      refresh: async () => {},
      lastFetched: 0,
    };
  }
  return ctx;
}

export default AIProviderContext;