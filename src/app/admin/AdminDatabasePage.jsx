import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, HardDrive, Layers, Activity, Clock, CheckCircle2, AlertTriangle, Search, RefreshCw, TrendingUp, Zap } from 'lucide-react';

const ACCENT = '#ef4444';

const TABLES = [
  { name: 'users',          rows: 12847, size: '42 MB',  indexEfficiency: 98.4, ops: 1842, lastVacuum: '2h ago' },
  { name: 'projects',       rows: 8294,  size: '124 MB', indexEfficiency: 96.2, ops: 928,  lastVacuum: '4h ago' },
  { name: 'subscriptions',  rows: 1847,  size: '8 MB',   indexEfficiency: 99.1, ops: 184,  lastVacuum: '1h ago' },
  { name: 'payments',       rows: 12842, size: '68 MB',  indexEfficiency: 97.8, ops: 428,  lastVacuum: '3h ago' },
  { name: 'ai_requests',    rows: 184820, size: '512 MB', indexEfficiency: 94.6, ops: 2840, lastVacuum: '6h ago' },
  { name: 'screenshots',    rows: 42180, size: '2.4 GB', indexEfficiency: 95.3, ops: 1240, lastVacuum: '8h ago' },
  { name: 'templates',      rows: 184,   size: '4 MB',   indexEfficiency: 99.8, ops: 28,   lastVacuum: '12h ago' },
  { name: 'audit_logs',     rows: 184820, size: '284 MB', indexEfficiency: 92.1, ops: 820,  lastVacuum: '24h ago' },
  { name: 'feature_flags',  rows: 42,    size: '128 KB', indexEfficiency: 100,  ops: 4,    lastVacuum: '1d ago' },
  { name: 'sessions',       rows: 4284,  size: '18 MB',  indexEfficiency: 98.9, ops: 1842, lastVacuum: '2h ago' },
];

const POOL_STATUS = [
  { state: 'active',    count: 12, color: '#10b981' },
  { state: 'idle',      count: 18, color: '#06b6d4' },
  { state: 'idle in tx',count: 2,  color: '#f59e0b' },
  { state: 'waiting',   count: 0,  color: '#9ca3af' },
];

const SLOW_QUERIES = [
  { id: 1, query: 'SELECT * FROM ai_requests WHERE user_id = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT 50', duration: 1842, calls: 184, db: 'primary' },
  { id: 2, query: 'SELECT projects.*, COUNT(screenshots.id) FROM projects LEFT JOIN screenshots ON projects.id = screenshots.project_id GROUP BY projects.id', duration: 1248, calls: 84, db: 'primary' },
  { id: 3, query: 'UPDATE users SET plan = $1 WHERE id = $2', duration: 824, calls: 1240, db: 'primary' },
  { id: 4, query: 'SELECT * FROM templates WHERE category = $1 AND is_active = true', duration: 612, calls: 284, db: 'replica-1' },
  { id: 5, query: 'INSERT INTO audit_logs (user_id, action, resource, ip) VALUES ($1, $2, $3, $4)', duration: 484, calls: 4280, db: 'primary' },
];

const REPLICATION = [
  { name: 'primary',      role: 'writer',  lag: 0,    status: 'healthy', color: '#10b981' },
  { name: 'replica-1',    role: 'reader',  lag: 12,   status: 'healthy', color: '#10b981' },
  { name: 'replica-2',    role: 'reader',  lag: 18,   status: 'healthy', color: '#10b981' },
  { name: 'replica-eu',   role: 'reader',  lag: 84,   status: 'warning', color: '#f59e0b' },
];

export default function AdminDatabasePage() {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    const i = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(i);
  }, []);

  const totalRows = TABLES.reduce((s, t) => t.rows, 0);
  const totalSize = TABLES.reduce((s, t) => s + parseFloat(t.size), 0);
  const avgIndex = (TABLES.reduce((s, t) => s + t.indexEfficiency, 0) / TABLES.length).toFixed(1);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Database size={20} style={{ color: ACCENT }} /> PostgreSQL Cluster
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {TABLES.length} tables · {totalRows.toLocaleString()} total rows · 4 nodes
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Healthy · tick {tick}
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Tables',     value: TABLES.length.toString(),         icon: Layers,     color: '#8b5cf6' },
            { label: 'Total Rows',       value: totalRows.toLocaleString(),        icon: Database,   color: '#06b6d4' },
            { label: 'Avg Index Health', value: `${avgIndex}%`,                    icon: TrendingUp, color: '#10b981' },
            { label: 'Last Backup',      value: '4h 18m',                          icon: Clock,      color: '#f59e0b' },
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

        {/* Connection pool + Replication */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={14} className="text-gray-500" /> Connection Pool
              <span className="ml-auto text-[11px] text-gray-500 font-mono">32 / 50</span>
            </h3>
            <div className="space-y-2.5 mb-4">
              {POOL_STATUS.map(s => {
                const pct = (s.count / 32) * 100;
                return (
                  <div key={s.state}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-mono capitalize text-gray-400">{s.state}</span>
                      <span className="font-bold text-white">{s.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-gray-500 pt-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.06)' }}>
              <span className="font-mono">Pool exhausted:</span> 0 events in last 24h
            </div>
          </div>

          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-gray-500" /> Replication
            </h3>
            <div className="space-y-2.5">
              {REPLICATION.map(r => (
                <div key={r.name} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-mono font-bold text-white">{r.name}</div>
                    <div className="text-[10px] text-gray-500 capitalize">{r.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500">Lag</div>
                    <div className="text-[12px] font-bold font-mono" style={{ color: r.lag > 50 ? '#f59e0b' : '#10b981' }}>
                      {r.lag}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables list */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-white">Tables</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>Total size:</span>
              <span className="font-bold text-white">~3.5 GB</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  {['Table', 'Rows', 'Size', 'Index Eff.', 'Ops/min', 'Last Vacuum'].map(h => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLES.map((t, i) => (
                  <motion.tr
                    key={t.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(239,68,68,0.05)' }}>
                    <td className="px-3 py-2.5">
                      <span className="text-[12px] font-mono font-bold text-white">{t.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-gray-300 font-mono">{t.rows.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-[12px] text-gray-300 font-mono">{t.size}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${t.indexEfficiency}%`,
                            background: t.indexEfficiency > 95 ? '#10b981' : t.indexEfficiency > 90 ? '#f59e0b' : '#ef4444',
                          }} />
                        </div>
                        <span className="text-[11px] font-bold text-white">{t.indexEfficiency}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-gray-300 font-mono">{t.ops.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-[11px] text-gray-500">{t.lastVacuum}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow queries */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: '#f59e0b' }} /> Slow Queries
          </h3>
          <div className="space-y-2">
            {SLOW_QUERIES.map((q, i) => (
              <div key={q.id} className="p-3 rounded-xl border"
                style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-yellow-400">#{i + 1}</span>
                    <span className="text-[10px] font-mono text-gray-500">{q.db}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-gray-500">{q.calls.toLocaleString()} calls</span>
                    <span className="font-bold font-mono" style={{ color: q.duration > 1000 ? '#ef4444' : '#f59e0b' }}>
                      {q.duration}ms
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-gray-300 truncate">{q.query}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}