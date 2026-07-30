import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Activity, CheckCircle2, XCircle, Clock, AlertTriangle, Layers, Zap, Loader2 } from 'lucide-react';

const ACCENT = '#ef4444';

const WORKERS = [
  { name: 'email-send',       processed: 4820, failed: 12,  waiting: 4,   active: 2,  avgWait: 124,  status: 'healthy', color: '#10b981' },
  { name: 'image-generation', processed: 1240, failed: 8,   waiting: 18,  active: 6,  avgWait: 2840, status: 'healthy', color: '#10b981' },
  { name: 'ai-redesign',      processed: 920,  failed: 4,   waiting: 12,  active: 4,  avgWait: 4280, status: 'healthy', color: '#10b981' },
  { name: 'webhook-delivery', processed: 1842, failed: 28,  waiting: 2,   active: 1,  avgWait: 84,   status: 'warning', color: '#f59e0b' },
  { name: 'export-pdf',       processed: 142,  failed: 0,   waiting: 0,   active: 0,  avgWait: 0,    status: 'idle',    color: '#9ca3af' },
  { name: 'thumbnail-gen',    processed: 3840, failed: 18,  waiting: 6,   active: 3,  avgWait: 420,  status: 'healthy', color: '#10b981' },
  { name: 'payment-sync',     processed: 824,  failed: 2,   waiting: 0,   active: 0,  avgWait: 0,    status: 'idle',    color: '#9ca3af' },
  { name: 'analytics-agg',    processed: 184,  failed: 0,   waiting: 84,  active: 2,  avgWait: 1240, status: 'busy',    color: '#8b5cf6' },
];

const RECENT_FAILURES = [
  { id: 1, queue: 'webhook-delivery', job: 'POST /v1/stripe/webhook',     error: 'Connection timeout after 30s',    attempts: 3, lastTry: '2m ago' },
  { id: 2, queue: 'image-generation', job: 'user_8821 redesign #4',      error: 'OpenAI rate limit exceeded (429)', attempts: 2, lastTry: '4m ago' },
  { id: 3, queue: 'webhook-delivery', job: 'POST /v1/github/event',      error: 'TLS handshake failed',            attempts: 3, lastTry: '6m ago' },
  { id: 4, queue: 'image-generation', job: 'user_4229 logo #2',          error: 'GPU OOM (out of memory)',         attempts: 1, lastTry: '8m ago' },
  { id: 5, queue: 'webhook-delivery', job: 'POST /v1/slack/notify',      error: 'Channel not found (404)',         attempts: 3, lastTry: '12m ago' },
  { id: 6, queue: 'email-send',       job: 'welcome user_10K',            error: 'Invalid template variable',       attempts: 1, lastTry: '18m ago' },
];

const STATUS_BADGES = {
  healthy: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', icon: CheckCircle2 },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', icon: AlertTriangle },
  idle:    { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af', icon: Clock },
  busy:    { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6', icon: Loader2 },
};

function WorkerCard({ worker, delay }) {
  const total = worker.waiting + worker.active;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border p-4"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${worker.color}15` }}>
            <Zap size={14} style={{ color: worker.color }} />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-white font-mono truncate">{worker.name}</div>
            <div className="text-[10px] text-gray-500 capitalize">{worker.status}</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
          style={{ background: STATUS_BADGES[worker.status].bg, color: STATUS_BADGES[worker.status].color }}>
          {worker.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[9px] text-gray-500">Processed</div>
          <div className="text-[14px] font-black text-white">{worker.processed.toLocaleString()}</div>
        </div>
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[9px] text-gray-500">Failed</div>
          <div className="text-[14px] font-black" style={{ color: worker.failed > 0 ? '#ef4444' : '#10b981' }}>{worker.failed}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] pt-3 border-t"
        style={{ borderColor: 'rgba(239,68,68,0.06)' }}>
        <div>
          <span className="text-gray-500">Depth: </span>
          <span className="font-bold text-white">{total}</span>
          <span className="text-gray-500"> ({worker.active} active)</span>
        </div>
        <div>
          <span className="text-gray-500">Avg: </span>
          <span className="font-bold font-mono text-white">{worker.avgWait}ms</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminQueuePage() {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    const i = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(i);
  }, []);

  const totalProcessed = WORKERS.reduce((s, w) => s + w.processed, 0);
  const totalFailed = WORKERS.reduce((s, w) => s + w.failed, 0);
  const totalWaiting = WORKERS.reduce((s, w) => s + w.waiting + w.active, 0);
  const avgWait = Math.round(WORKERS.reduce((s, w) => s + w.avgWait, 0) / WORKERS.length);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Sliders size={20} style={{ color: ACCENT }} /> Background Jobs
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Live overview of {WORKERS.length} worker queues — auto-refreshes every 2s
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live · tick {tick}
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Jobs Today',       value: totalProcessed.toLocaleString(), icon: CheckCircle2, color: '#10b981', change: '+420 last hr' },
            { label: 'Failed Jobs',      value: totalFailed.toString(),          icon: XCircle,       color: '#ef4444', change: '-8 last hr' },
            { label: 'Queue Depth',      value: totalWaiting.toString(),         icon: Layers,        color: '#8b5cf6', change: '+12 now' },
            { label: 'Avg Wait Time',    value: `${avgWait}ms`,                  icon: Clock,         color: '#f59e0b', change: '-32ms' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div className="text-[10px] font-semibold text-gray-500">{s.change}</div>
              </div>
              <div className="text-[26px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Worker grid */}
        <div>
          <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
            <Activity size={14} className="text-gray-500" /> Worker Queues
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {WORKERS.map((w, i) => <WorkerCard key={w.name} worker={w} delay={i * 0.05} />)}
          </div>
        </div>

        {/* Recent failures */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: '#f59e0b' }} /> Recent Failures
            </h3>
            <button
              className="text-[11px] font-semibold"
              style={{ color: ACCENT }}>Retry All</button>
          </div>
          <div className="space-y-2">
            {RECENT_FAILURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <XCircle size={13} style={{ color: '#ef4444' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono font-bold text-white">{f.queue}</span>
                    <span className="text-[10px] text-gray-600">·</span>
                    <span className="text-[11px] font-mono text-gray-400">{f.job}</span>
                  </div>
                  <div className="text-[11px] text-red-400 font-mono truncate">{f.error}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-500">Attempts</div>
                  <div className="text-[12px] font-bold text-white">{f.attempts}/3</div>
                </div>
                <div className="text-right shrink-0 w-16">
                  <div className="text-[10px] text-gray-500">Last try</div>
                  <div className="text-[11px] text-gray-400">{f.lastTry}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}