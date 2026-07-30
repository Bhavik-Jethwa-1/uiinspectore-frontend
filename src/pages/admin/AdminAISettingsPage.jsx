import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Eye, EyeOff, Save, CheckCircle2, XCircle, Loader2, Power, PowerOff,
  Sparkles, Zap, RefreshCw, Settings as SettingsIcon, Shield, AlertCircle, Cpu, Brain,
} from 'lucide-react';
import { getToken } from '../../utils/api';

const ACCENT = '#7c5cff';

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const OPENAI_MODELS = [
  { id: 'gpt-4o',        label: 'GPT-4o' },
  { id: 'gpt-4o-mini',   label: 'GPT-4o mini' },
  { id: 'gpt-4-turbo',   label: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash',  label: 'Gemini 2.0 Flash' },
  { id: 'gemini-1.5-flash',  label: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro',    label: 'Gemini 1.5 Pro' },
  { id: 'gemini-pro',         label: 'Gemini Pro' },
];

// Mask an API key as "sk-****abcd" style
function maskKey(k) {
  if (!k) return '';
  const trimmed = String(k).trim();
  if (trimmed.length < 8) return '••••';
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

// ─── Provider card ──────────────────────────────────────────────────────────
function ProviderCard({ provider, info, onSave, isPrimary, onSetPrimary }) {
  const isOpenAI  = provider === 'openai';
  const isGemini  = provider === 'gemini';
  const [enabled, setEnabled] = useState(info?.isActive ?? false);
  const [apiKey, setApiKey]       = useState('');
  const [showKey, setShowKey]     = useState(false);
  const [model, setModel]         = useState(info?.model || (isGemini ? 'gemini-2.0-flash' : 'gpt-4o'));
  const [saving, setSaving]       = useState(false);
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: bool, message: string }
  const [savedOk, setSavedOk]     = useState(false);

  // Reset enabled state when info changes
  useEffect(() => { setEnabled(info?.isActive ?? false); }, [info?.isActive]);

  const handleSave = async () => {
    setSaving(true); setSavedOk(false); setTestResult(null);
    try {
      const payload = {
        [provider]: {
          isActive: enabled,
          ...(isOpenAI || isGemini ? { model } : {}),
          ...((isOpenAI || isGemini) && apiKey ? { apiKey } : {}),
        },
      };
      const res = await apiFetch('/admin/ai/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res?.success) {
        setSavedOk(true);
        setApiKey('');
        setTimeout(() => setSavedOk(false), 3000);
        onSave?.(res.settings);
      }
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await apiFetch('/admin/ai/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: apiKey || 'use-existing',
          model,
        }),
      });
      if (res?.success) {
        setTestResult({ success: true, message: `Connected — model: ${res.model}` });
      } else {
        setTestResult({ success: false, message: res?.error || 'Invalid API key' });
      }
    } catch (e) {
      // If no key supplied, the server will reject with 400 about required field.
      setTestResult({ success: false, message: e.data?.error || e.message });
    } finally {
      setTesting(false);
    }
  };

  const status = !info?.available
    ? 'not-configured'
    : enabled
      ? 'active'
      : 'disabled';

  const statusMeta = {
    'not-configured': { label: 'Not configured', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
    'active':         { label: 'Connected',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    'disabled':       { label: 'Disabled',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  }[status];

  const iconColor = isOpenAI ? '#10b981' : isGemini ? '#8b5cf6' : '#ef4444';
  const Icon = isOpenAI ? Brain : Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.15)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}30` }}>
            <Icon size={20} style={{ color: iconColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-white">{info?.label || (isOpenAI ? 'OpenAI' : isGemini ? 'Google Gemini' : provider)}</h3>
              {isPrimary && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(124,92,255,0.2)', color: '#9d7aff' }}>Primary</span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {info?.description || (isOpenAI ? 'GPT-4o, GPT-4 Turbo, DALL-E — multi-model' : isGemini ? 'Gemini 2.0 Flash, 1.5 Pro, vision & reasoning' : 'Native image generation, vision via gateway')}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{ background: statusMeta.bg, color: statusMeta.color }}>
          {statusMeta.label}
        </span>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between py-3 px-3 rounded-xl mb-3"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div>
          <div className="text-[12px] font-semibold text-white">Enable this provider</div>
          <div className="text-[10px] text-gray-500">When enabled, this provider can serve AI requests</div>
        </div>
        <button
          onClick={() => setEnabled(v => !v)}
          className="w-11 h-6 rounded-full relative transition-colors shrink-0"
          style={{ background: enabled ? '#10b981' : 'rgba(255,255,255,0.1)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
            style={{ left: enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* OpenAI + Gemini fields */}
      {(isOpenAI || isGemini) && (
        <>
          <div className="mb-3">
            <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={info?.available ? '•••••••••••••••• (set)' : 'sk-...'}
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-[12px] font-mono text-white outline-none transition-colors focus:ring-2"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                title={showKey ? 'Hide' : 'Show'}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-1.5 font-mono">
              Stored as: {maskKey(info?.available ? apiKey || 'sk-***configured***' : apiKey)}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">
              Model
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {(isOpenAI ? OPENAI_MODELS : GEMINI_MODELS).map(m => (
                <option key={m.id} value={m.id} style={{ background: '#0d0d1a' }}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Test */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handleTest}
              disabled={testing || !apiKey}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-40"
              style={{ background: 'rgba(124,92,255,0.12)', color: '#9d7aff', border: '1px solid rgba(124,92,255,0.25)' }}
            >
              {testing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              Test Connection
            </button>
            {testResult && (
              <div className="flex items-center gap-1.5 text-[11px]"
                style={{ color: testResult.success ? '#10b981' : '#ef4444' }}>
                {testResult.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {testResult.message}
              </div>
            )}
          </div>
        </>
      )}

      {/* MiniMax always-available note */}
      {!isOpenAI && !isGemini && (
        <div className="rounded-xl p-3 mb-3 flex items-start gap-2"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Shield size={13} className="text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-gray-400">
            <span className="text-emerald-300 font-semibold">Always available</span> when
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded mx-1"
              style={{ background: 'rgba(255,255,255,0.05)' }}>MINIMAX_API_KEY</span>
            is configured in <span className="font-mono">.env</span>. Use the toggle above to enable/disable routing through this provider.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          {savedOk && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={11} /> Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isPrimary && enabled && info?.available && (
            <button
              onClick={onSetPrimary}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
              style={{ background: 'rgba(124,92,255,0.12)', color: '#9d7aff', border: '1px solid rgba(124,92,255,0.25)' }}
            >
              Set as Primary
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-40"
            style={{ background: ACCENT, color: 'white' }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Primary provider card ──────────────────────────────────────────────────
function PrimarySelector({ providers, primary, onSetPrimary, saving }) {
  return (
    <div className="rounded-2xl border p-5"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.15)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)' }}>
          <SettingsIcon size={20} style={{ color: '#9d7aff' }} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-white">Primary Provider</h3>
          <p className="text-[11px] text-gray-500">All chat, vision, and image requests go here first. Falls back to others if unavailable.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(providers).map(([slug, info]) => {
          const isPrimary = slug === primary;
          const available = info.available && info.isActive;
          return (
            <button
              key={slug}
              onClick={() => !isPrimary && available && onSetPrimary(slug)}
              disabled={saving || !available || isPrimary}
              className="rounded-xl p-3 text-left transition-all disabled:cursor-not-allowed"
              style={{
                background: isPrimary ? 'rgba(124,92,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: isPrimary ? '1px solid rgba(124,92,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                opacity: (!available && !isPrimary) ? 0.5 : 1,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-white">{info.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {available ? <span className="text-emerald-400">Available</span> : <span className="text-amber-400">Not available</span>}
                  </div>
                </div>
                {isPrimary && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(124,92,255,0.3)', color: '#c4b5fd' }}>Active</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function AdminAISettingsPage() {
  const [providers, setProviders]   = useState({});
  const [primary, setPrimary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiFetch('/admin/ai/providers');
      setProviders(data.providers || {});
      setPrimary(data.primary || null);
    } catch (e) {
      setError(e.message || 'Failed to load AI providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSetPrimary = async (slug) => {
    setSaving(true); setError(null);
    try {
      const res = await apiFetch('/admin/ai/settings', {
        method: 'PUT',
        body: JSON.stringify({ primary: slug }),
      });
      if (res?.success) {
        setPrimary(slug);
        load();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const anyAvailable = Object.values(providers).some(p => p.available && p.isActive);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">AI Provider Settings</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Configure AI providers — choose your primary provider and manage API keys
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <div className="text-[12px] text-red-300">{error}</div>
          </div>
        )}

        {/* Stats / status banner */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border p-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Providers</div>
              <div className="text-[20px] font-black text-white">{Object.keys(providers).length}</div>
            </div>
            <div className="rounded-2xl border p-4"
              style={{ background: anyAvailable ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                       borderColor: anyAvailable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Status</div>
              <div className="flex items-center gap-2">
                {anyAvailable
                  ? <><CheckCircle2 size={16} className="text-emerald-400" /><span className="text-[14px] font-bold text-emerald-400">Ready</span></>
                  : <><XCircle size={16} className="text-red-400" /><span className="text-[14px] font-bold text-red-400">No provider</span></>}
              </div>
            </div>
            <div className="rounded-2xl border p-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Primary</div>
              <div className="text-[14px] font-bold text-white capitalize">{primary || '—'}</div>
            </div>
            <div className="rounded-2xl border p-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Active</div>
              <div className="text-[14px] font-bold text-white">
                {Object.values(providers).filter(p => p.isActive && p.available).length}
                <span className="text-gray-500 text-[11px] font-normal"> / {Object.keys(providers).length}</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* Primary selector */}
            <PrimarySelector providers={providers} primary={primary} onSetPrimary={handleSetPrimary} saving={saving} />

            {/* Provider cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(providers).map(([slug, info]) => (
                <ProviderCard
                  key={slug}
                  provider={slug}
                  info={info}
                  isPrimary={slug === primary}
                  onSave={load}
                  onSetPrimary={() => handleSetPrimary(slug)}
                />
              ))}
            </div>

            {/* Help footer */}
            <div className="rounded-2xl p-4 text-[11px] text-gray-400 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong className="text-gray-300">How it works:</strong> All AI features (chat, vision, image generation) route
              through the primary provider. If that provider fails or is unavailable, requests automatically fall back
              to the next available provider. API keys are stored in <code className="px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(255,255,255,0.05)' }}>.env</code> and never returned to the client.
              The provider is selected per-request based on availability, so your users always get the best experience.
            </div>
          </>
        )}
      </div>
    </div>
  );
}