import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Key, Activity, AlertTriangle, CheckCircle2, Save, Eye, EyeOff, RotateCw } from 'lucide-react';

const ACCENT = '#ef4444';

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LPU inference for Llama & Mixtral models',
    color: '#f97316',
    logo: '⚡',
    endpoint: 'https://api.groq.com/openai/v1',
    apiKeyMasked: 'gsk_••••••••••••••••3xQk',
    rateLimit: 30,
    rateUsed: 18,
    dailyRequests: 8420,
    dailyLimit: 50000,
    status: true,
    models: 4,
    avgLatency: 92,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, DALL-E, embeddings',
    color: '#10b981',
    logo: '🧠',
    endpoint: 'https://api.openai.com/v1',
    apiKeyMasked: 'sk-••••••••••••••••Hb21',
    rateLimit: 60,
    rateUsed: 42,
    dailyRequests: 24180,
    dailyLimit: 200000,
    status: true,
    models: 8,
    avgLatency: 412,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Unified API to 100+ models (Claude, Gemini, Llama…)',
    color: '#6366f1',
    logo: '🌐',
    endpoint: 'https://openrouter.ai/api/v1',
    apiKeyMasked: 'sk-or-••••••••••••••9Ty5',
    rateLimit: 20,
    rateUsed: 9,
    dailyRequests: 4820,
    dailyLimit: 5000,
    status: true,
    models: 124,
    avgLatency: 720,
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    description: 'Specialized UI/UX multimodal model',
    color: '#ef4444',
    logo: '✨',
    endpoint: 'https://api.minimax.chat/v1',
    apiKeyMasked: 'sk-mm-••••••••••••••xQ7P',
    rateLimit: 50,
    rateUsed: 27,
    dailyRequests: 14420,
    dailyLimit: 100000,
    status: true,
    models: 3,
    avgLatency: 248,
  },
];

function ProviderCard({ provider, delay }) {
  const [enabled, setEnabled] = useState(provider.status);
  const [showKey, setShowKey] = useState(false);
  const usagePct = (provider.dailyRequests / provider.dailyLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[20px]"
            style={{ background: `${provider.color}18`, border: `1px solid ${provider.color}30` }}>
            {provider.logo}
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white">{provider.name}</h3>
            <p className="text-[11px] text-gray-500">{provider.description}</p>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => setEnabled(!enabled)}
          className="relative w-11 h-6 rounded-full transition-all"
          style={{ background: enabled ? provider.color : 'rgba(255,255,255,0.1)' }}>
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
            style={{ left: enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* Endpoint */}
      <div className="mb-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Endpoint</label>
        <div className="mt-1 px-3 py-2 rounded-lg font-mono text-[11px] text-gray-400"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {provider.endpoint}
        </div>
      </div>

      {/* API key */}
      <div className="mb-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">API Key</label>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg font-mono text-[11px] text-gray-300"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {showKey ? provider.apiKeyMasked.replace(/•/g, 'a') : provider.apiKeyMasked}
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* Rate limit */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500">Rate Limit</span>
          <span className="font-bold text-white">{provider.rateUsed} / {provider.rateLimit} req/s</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full" style={{
            width: `${(provider.rateUsed / provider.rateLimit) * 100}%`,
            background: provider.color,
          }} />
        </div>
      </div>

      {/* Daily usage */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500">Daily Quota</span>
          <span className="font-bold text-white">{provider.dailyRequests.toLocaleString()} / {provider.dailyLimit.toLocaleString()}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full" style={{
            width: `${usagePct}%`,
            background: usagePct > 80 ? '#ef4444' : usagePct > 60 ? '#f59e0b' : provider.color,
          }} />
        </div>
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.08)' }}>
        <div>
          <div className="text-[10px] text-gray-500">Models</div>
          <div className="text-[13px] font-bold text-white">{provider.models}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Avg Latency</div>
          <div className="text-[13px] font-bold text-white">{provider.avgLatency}ms</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500">Status</div>
          <div className="text-[13px] font-bold flex items-center gap-1" style={{ color: enabled ? '#10b981' : '#9ca3af' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: enabled ? '#10b981' : '#9ca3af' }} />
            {enabled ? 'Active' : 'Off'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminAISettingsPage() {
  const [providers, setProviders] = useState(PROVIDERS);
  const [savedAt, setSavedAt] = useState(null);

  const totalRequests = providers.reduce((sum, p) => sum + p.dailyRequests, 0);
  const activeProviders = providers.filter(p => p.status).length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">AI Provider Configuration</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Manage API keys, rate limits, and routing across {providers.length} providers
            </p>
          </div>
          <button
            onClick={() => setSavedAt(new Date())}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Save size={14} /> Save Changes
          </button>
        </div>

        {/* Status banner */}
        <div className="rounded-2xl border p-4 flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <div className="flex-1">
            <div className="text-[12px] font-bold text-white">All AI providers operational</div>
            <div className="text-[11px] text-gray-500">
              {activeProviders} of {providers.length} active · {totalRequests.toLocaleString()} requests today · last health check 2 minutes ago
            </div>
          </div>
          {savedAt && (
            <div className="text-[11px] text-green-400 font-semibold">
              Saved {savedAt.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Providers',  value: activeProviders.toString(),         icon: Zap,       color: '#10b981' },
            { label: 'Total Models',      value: providers.reduce((s,p)=>s+p.models,0).toString(), icon: Activity, color: '#8b5cf6' },
            { label: 'Requests Today',    value: totalRequests.toLocaleString(),     icon: Activity,  color: '#06b6d4' },
            { label: 'Avg Latency',       value: `${Math.round(providers.reduce((s,p)=>s+p.avgLatency,0)/providers.length)}ms`, icon: Activity, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Provider cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {providers.map((p, i) => <ProviderCard key={p.id} provider={p} delay={i * 0.1} />)}
        </div>

        {/* Routing rules */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
            <Key size={14} className="text-gray-500" /> Default Routing Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { task: 'Chat / Conversation',     primary: 'OpenAI',     fallback: 'OpenRouter', icon: '💬' },
              { task: 'Image Generation',        primary: 'OpenAI',     fallback: 'MiniMax',    icon: '🎨' },
              { task: 'Code Generation',         primary: 'Groq',       fallback: 'OpenRouter', icon: '⚡' },
              { task: 'UI Analysis',             primary: 'MiniMax',    fallback: 'OpenAI',     icon: '✨' },
              { task: 'Embeddings',              primary: 'OpenAI',     fallback: '—',          icon: '🔢' },
              { task: 'Long Context (100k+)',    primary: 'OpenRouter', fallback: 'OpenAI',     icon: '📄' },
            ].map(r => (
              <div key={r.task} className="p-3 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.08)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[16px]">{r.icon}</span>
                  <span className="text-[12px] font-semibold text-white">{r.task}</span>
                </div>
                <div className="text-[10px] text-gray-500">
                  Primary: <span className="text-white font-semibold">{r.primary}</span>
                </div>
                <div className="text-[10px] text-gray-500">
                  Fallback: <span className="text-gray-300 font-semibold">{r.fallback}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}