import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Plus, Edit2, Power, PowerOff, Eye, EyeOff, Sliders, CheckCircle2, XCircle } from 'lucide-react';

const ACCENT = '#ef4444';

const FLAGS = [
  { id: 1, name: 'new-ai-redesign-v2',    description: 'New multimodal redesign pipeline using Claude 3.5',         status: 'enabled',  rollout: 25,   environments: ['dev', 'staging'],          enabled: true,  lastModified: '2h ago' },
  { id: 2, name: 'figma-bidirectional',   description: 'Two-way sync with Figma files',                              status: 'enabled',  rollout: 100,  environments: ['dev', 'staging', 'prod'],  enabled: true,  lastModified: '1d ago' },
  { id: 3, name: 'team-workspaces',         description: 'Multi-workspace support for Team plan',                      status: 'enabled',  rollout: 100,  environments: ['prod'],                     enabled: true,  lastModified: '5d ago' },
  { id: 4, name: 'experimental-voice',     description: 'Voice-driven UI redesign (alpha)',                            status: 'disabled', rollout: 0,    environments: ['dev'],                       enabled: false, lastModified: '12h ago' },
  { id: 5, name: 'crypto-export',          description: 'Export designs as NFT metadata JSON',                         status: 'disabled', rollout: 0,    environments: [],                            enabled: false, lastModified: '3d ago' },
  { id: 6, name: 'enterprise-sso',         description: 'SAML 2.0 SSO for Enterprise customers',                       status: 'enabled',  rollout: 100,  environments: ['prod'],                     enabled: true,  lastModified: '2w ago' },
  { id: 7, name: 'ai-component-gen',        description: 'Generate React components from screenshots',                  status: 'enabled',  rollout: 50,   environments: ['dev', 'staging', 'prod'],  enabled: true,  lastModified: '4h ago' },
  { id: 8, name: 'dark-mode-gallery',       description: 'Dark theme for template gallery',                              status: 'enabled',  rollout: 100,  environments: ['prod'],                     enabled: true,  lastModified: '1w ago' },
  { id: 9, name: 'beta-animations',         description: 'Lottie + Rive animation support in designs',                  status: 'enabled',  rollout: 10,   environments: ['staging'],                  enabled: true,  lastModified: '6h ago' },
  { id: 10, name: 'webhook-v2',             description: 'New HMAC-signed webhook format with retries',                status: 'disabled', rollout: 0,    environments: [],                            enabled: false, lastModified: '2d ago' },
];

const ENV_COLORS = { dev: '#06b6d4', staging: '#f59e0b', prod: '#ef4444' };

function FlagCard({ flag, delay, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: flag.enabled ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)',
      }}>

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: flag.enabled ? `${ACCENT}20` : 'rgba(255,255,255,0.05)' }}>
            <Flag size={16} style={{ color: flag.enabled ? ACCENT : '#9ca3af' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-mono font-bold text-white truncate">{flag.name}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{flag.description}</div>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onToggle(flag.id)}
          className="relative w-11 h-6 rounded-full transition-all shrink-0 ml-2"
          style={{ background: flag.enabled ? ACCENT : 'rgba(255,255,255,0.1)' }}>
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
            style={{ left: flag.enabled ? '22px' : '2px' }}
          />
        </button>
      </div>

      {/* Rollout progress */}
      {flag.enabled && flag.rollout > 0 && flag.rollout < 100 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="text-gray-500">Gradual Rollout</span>
            <span className="font-bold text-white">{flag.rollout}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full" style={{ width: `${flag.rollout}%`, background: ACCENT }} />
          </div>
        </div>
      )}

      {flag.enabled && flag.rollout === 100 && (
        <div className="mb-3 flex items-center gap-1.5 text-[10px] text-green-400">
          <CheckCircle2 size={10} /> Fully rolled out to all users
        </div>
      )}

      {!flag.enabled && (
        <div className="mb-3 flex items-center gap-1.5 text-[10px] text-gray-500">
          <XCircle size={10} /> Disabled — no users affected
        </div>
      )}

      {/* Environments */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {flag.environments.length > 0 ? (
          flag.environments.map(e => (
            <span key={e} className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{ background: `${ENV_COLORS[e]}15`, color: ENV_COLORS[e] }}>
              {e}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-gray-600 italic">no environments</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.08)' }}>
        <span className="text-[10px] text-gray-500">Modified {flag.lastModified}</span>
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white transition-all"
            title="Edit">
            <Edit2 size={11} />
          </button>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white transition-all"
            title="View usage">
            <Sliders size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleFlag = (id) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled, status: !f.enabled ? 'enabled' : 'disabled' } : f));
  };

  const enabledCount = FLAGS.filter(f => f.enabled).length;
  const inProd = FLAGS.filter(f => f.environments.includes('prod')).length;
  const inRollout = FLAGS.filter(f => f.enabled && f.rollout > 0 && f.rollout < 100).length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Flag size={20} style={{ color: ACCENT }} /> Feature Flags
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Toggle, rollout, and target features across {FLAGS.length} flags in 3 environments
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Create Flag
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Flags',     value: FLAGS.length.toString(),   icon: Flag,        color: '#8b5cf6' },
            { label: 'Enabled',         value: enabledCount.toString(),   icon: Power,       color: '#10b981' },
            { label: 'In Production',   value: inProd.toString(),         icon: CheckCircle2,color: '#ef4444' },
            { label: 'Gradual Rollout', value: inRollout.toString(),      icon: Sliders,     color: '#f59e0b' },
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

        {/* Flag cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {flags.map((f, i) => (
            <FlagCard key={f.id} flag={f} delay={i * 0.05} onToggle={toggleFlag} />
          ))}
        </div>
      </div>
    </div>
  );
}