import { useState, useEffect } from 'react';
import AdminTable from '../../components/shared/AdminTable';
import { Zap, Power, PowerOff, TrendingUp, DollarSign, Activity, Cpu } from 'lucide-react';

const ACCENT = '#ef4444';

const PROVIDER_COLORS = {
  Groq: '#f97316',
  OpenAI: '#10b981',
  'OpenRouter': '#6366f1',
  MiniMax: '#ef4444',
};

const MODELS = [
  { id: 1, model: 'llama-3.1-70b-versatile',   provider: 'Groq',        status: 'enabled',  inputPrice: 0.00059, outputPrice: 0.00079, dailyLimit: 50000,  used: 8420,  context: '128k', tier: 'premium' },
  { id: 2, model: 'mixtral-8x7b-32768',         provider: 'Groq',        status: 'enabled',  inputPrice: 0.00024, outputPrice: 0.00024, dailyLimit: 100000, used: 18420, context: '32k',  tier: 'standard' },
  { id: 3, model: 'gpt-4o',                     provider: 'OpenAI',      status: 'enabled',  inputPrice: 0.005,   outputPrice: 0.015,   dailyLimit: 200000, used: 142000, context: '128k', tier: 'premium' },
  { id: 4, model: 'gpt-4o-mini',                provider: 'OpenAI',      status: 'enabled',  inputPrice: 0.00015, outputPrice: 0.0006,  dailyLimit: 500000, used: 198420, context: '128k', tier: 'standard' },
  { id: 5, model: 'dall-e-3',                   provider: 'OpenAI',      status: 'enabled',  inputPrice: 0.04,    outputPrice: 0,       dailyLimit: 5000,   used: 2840,  context: 'image', tier: 'premium' },
  { id: 6, model: 'claude-3.5-sonnet',          provider: 'OpenRouter',  status: 'enabled',  inputPrice: 0.003,   outputPrice: 0.015,   dailyLimit: 20000,  used: 14280, context: '200k', tier: 'premium' },
  { id: 7, model: 'gemini-1.5-pro',             provider: 'OpenRouter',  status: 'enabled',  inputPrice: 0.00125, outputPrice: 0.005,   dailyLimit: 30000,  used: 18420, context: '1M',   tier: 'premium' },
  { id: 8, model: 'minimax-ui-multimodal',      provider: 'MiniMax',     status: 'enabled',  inputPrice: 0.002,   outputPrice: 0.006,   dailyLimit: 100000, used: 74420, context: '128k', tier: 'premium' },
  { id: 9, model: 'minimax-ui-fast',            provider: 'MiniMax',     status: 'enabled',  inputPrice: 0.0008,  outputPrice: 0.0024,  dailyLimit: 200000, used: 124800, context: '64k',  tier: 'standard' },
  { id: 10, model: 'whisper-large-v3',          provider: 'OpenAI',      status: 'disabled', inputPrice: 0.006,   outputPrice: 0,       dailyLimit: 1000,   used: 0,     context: 'audio', tier: 'standard' },
];

const FIELDS = [
  { key: 'model', label: 'Model', sortable: true, render: (v, row) => (
    <div>
      <div className="text-[12px] font-semibold text-white font-mono">{v}</div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{
            background: row.tier === 'premium' ? 'rgba(245,158,11,0.15)' : 'rgba(156,163,175,0.15)',
            color: row.tier === 'premium' ? '#fbbf24' : '#9ca3af',
          }}>
          {row.tier}
        </span>
        <span className="text-[9px] text-gray-500">{row.context}</span>
      </div>
    </div>
  )},
  { key: 'provider', label: 'Provider', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${PROVIDER_COLORS[v] || '#9ca3af'}18`, color: PROVIDER_COLORS[v] || '#9ca3af' }}>
      {v}
    </span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1"
      style={{ background: v === 'enabled' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: v === 'enabled' ? '#10b981' : '#ef4444' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: v === 'enabled' ? '#10b981' : '#ef4444' }} />
      {v}
    </span>
  )},
  { key: 'inputPrice', label: 'Price / 1K (in)', sortable: true, render: (v, row) => (
    <div>
      <div className="text-[12px] text-white font-mono">${v.toFixed(5)}</div>
      <div className="text-[10px] text-gray-500 font-mono">${row.outputPrice.toFixed(5)} out</div>
    </div>
  )},
  { key: 'dailyLimit', label: 'Daily Limit', sortable: true, render: (v, row) => (
    <div className="w-32">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-500">{row.used.toLocaleString()}</span>
        <span className="text-gray-500">{v.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{
          width: `${Math.min(100, (row.used / v) * 100)}%`,
          background: (row.used / v) > 0.8 ? '#ef4444' : (row.used / v) > 0.6 ? '#f59e0b' : '#10b981',
        }} />
      </div>
    </div>
  )},
];

export default function AdminAIModelsPage() {
  const [models, setModels] = useState(MODELS);
  const [loading] = useState(false);

  const toggleModel = (id) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'enabled' ? 'disabled' : 'enabled' } : m));
  };

  const enabledCount = MODELS.filter(m => m.status === 'enabled').length;
  const totalRequests = MODELS.reduce((s, m) => s + m.used, 0);
  const totalCostEst = MODELS.reduce((s, m) => s + (m.used * (m.inputPrice + m.outputPrice) / 2), 0);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">AI Model Registry</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Enable, disable, and configure pricing for {models.length} models across 4 providers
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Models',     value: MODELS.length.toString(),                          icon: Cpu,       color: '#8b5cf6' },
            { label: 'Enabled',          value: enabledCount.toString(),                            icon: Zap,       color: '#10b981' },
            { label: 'Requests (24h)',   value: totalRequests.toLocaleString(),                     icon: Activity,  color: '#06b6d4' },
            { label: 'Est. Daily Cost',  value: `$${totalCostEst.toFixed(2)}`,                      icon: DollarSign,color: '#fbbf24' },
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

        {/* Models table */}
        <AdminTable
          title="Model Registry"
          subtitle="Enable, disable, and tune pricing across providers"
          fields={FIELDS}
          data={models}
          loading={loading}
          searchable
          searchPlaceholder="Search by model name or provider…"
          exportable
          stats={[
            { label: 'Premium Tier',  value: MODELS.filter(m => m.tier === 'premium').length.toString() },
            { label: 'Standard Tier', value: MODELS.filter(m => m.tier === 'standard').length.toString() },
            { label: 'Disabled',      value: MODELS.filter(m => m.status === 'disabled').length.toString() },
            { label: 'Providers',     value: Object.keys(PROVIDER_COLORS).length.toString() },
          ]}
          actions={[
            { label: 'Enable',  onClick: row => toggleModel(row.id) },
            { label: 'Disable', danger: true, onClick: row => toggleModel(row.id) },
            { label: 'Edit',    onClick: row => alert(`Edit ${row.model}`) },
          ]}
        />
      </div>
    </div>
  );
}