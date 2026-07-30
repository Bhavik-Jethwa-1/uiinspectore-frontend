import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { Eye, Shield, Filter, Download, AlertTriangle, Activity, User } from 'lucide-react';

const ACCENT = '#ef4444';

const ACTION_COLORS = {
  'user.login':           '#10b981',
  'user.logout':          '#9ca3af',
  'user.created':         '#8b5cf6',
  'user.deleted':         '#ef4444',
  'user.updated':         '#06b6d4',
  'subscription.created': '#10b981',
  'subscription.cancelled':'#f59e0b',
  'payment.success':      '#10b981',
  'payment.failed':       '#ef4444',
  'admin.role_changed':   '#f97316',
  'admin.settings_updated':'#f97316',
  'feature_flag.toggled': '#8b5cf6',
};

const AUDIT_LOGS = [
  { id: 1, timestamp: '2026-07-24T11:02:18.421Z', user: 'admin@uiinspectore.com', action: 'admin.settings_updated', resource: 'ai_providers/openai', ip: '192.168.1.42',  ua: 'Chrome 127 / macOS', severity: 'info' },
  { id: 2, timestamp: '2026-07-24T10:58:42.103Z', user: 'sarah@example.com',     action: 'user.login',              resource: 'session',            ip: '73.94.21.18',   ua: 'Safari 17 / iOS',   severity: 'info' },
  { id: 3, timestamp: '2026-07-24T10:42:09.872Z', user: 'admin@uiinspectore.com', action: 'user.deleted',            resource: 'user/u_8842',        ip: '192.168.1.42',  ua: 'Chrome 127 / macOS', severity: 'warning' },
  { id: 4, timestamp: '2026-07-24T10:21:55.611Z', user: 'marcus@startup.io',     action: 'subscription.created',   resource: 'sub_01HK10',         ip: '98.21.49.7',    ua: 'Firefox 128 / Win', severity: 'info' },
  { id: 5, timestamp: '2026-07-24T09:58:33.244Z', user: 'admin@uiinspectore.com', action: 'feature_flag.toggled',   resource: 'flag/new-ai-redesign', ip: '192.168.1.42', ua: 'Chrome 127 / macOS', severity: 'info' },
  { id: 6, timestamp: '2026-07-24T09:42:18.998Z', user: 'james@corp.io',          action: 'payment.failed',         resource: 'pay_01HK2Q',         ip: '45.83.220.91',  ua: 'Edge 127 / Win',   severity: 'warning' },
  { id: 7, timestamp: '2026-07-24T09:14:50.337Z', user: 'admin@uiinspectore.com', action: 'admin.role_changed',     resource: 'user/u_9921 -> editor', ip: '192.168.1.42', ua: 'Chrome 127 / macOS', severity: 'warning' },
  { id: 8, timestamp: '2026-07-24T08:48:22.115Z', user: 'carlos@dev.es',          action: 'user.login',             resource: 'session',            ip: '88.21.40.122',  ua: 'Chrome 127 / Linux', severity: 'info' },
  { id: 9, timestamp: '2026-07-24T08:21:09.984Z', user: 'system',                 action: 'subscription.cancelled', resource: 'sub_01HK12',         ip: '127.0.0.1',     ua: 'Cron / system',    severity: 'info' },
  { id: 10, timestamp: '2026-07-24T07:55:41.220Z', user: 'admin@uiinspectore.com',action: 'user.created',           resource: 'user/u_10K',         ip: '192.168.1.42',  ua: 'Chrome 127 / macOS', severity: 'info' },
  { id: 11, timestamp: '2026-07-24T07:32:18.778Z', user: 'priya@design.co',       action: 'user.login',             resource: 'session',            ip: '49.36.122.41',  ua: 'Chrome 127 / Android', severity: 'info' },
  { id: 12, timestamp: '2026-07-24T06:48:09.501Z', user: 'admin@uiinspectore.com',action: 'payment.failed',         resource: 'pay_01HK2Q retry 2',  ip: '192.168.1.42',  ua: 'API call',         severity: 'critical' },
];

const SEVERITY_COLORS = {
  info:     { bg: 'rgba(6,182,212,0.15)',   color: '#06b6d4' },
  warning:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  critical: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
};

const FIELDS = [
  { key: 'timestamp', label: 'Timestamp', sortable: true, render: v => (
    <div className="font-mono">
      <div className="text-[11px] text-white">{new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
      <div className="text-[10px] text-gray-500">{new Date(v).toLocaleTimeString('en-US', { hour12: false })}.{String(new Date(v).getMilliseconds()).padStart(3, '0')}Z</div>
    </div>
  )},
  { key: 'user', label: 'User', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: v === 'system' ? 'rgba(156,163,175,0.2)' : `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {v === 'system' ? '⚙' : v.slice(0, 1).toUpperCase()}
      </div>
      <span className="text-[12px] text-white font-mono">{v}</span>
    </div>
  )},
  { key: 'action', label: 'Action', sortable: true, render: v => (
    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
      style={{ background: `${ACTION_COLORS[v] || '#9ca3af'}15`, color: ACTION_COLORS[v] || '#9ca3af' }}>
      {v}
    </span>
  )},
  { key: 'resource', label: 'Resource', render: v => (
    <span className="text-[11px] font-mono text-gray-400">{v}</span>
  )},
  { key: 'ip', label: 'IP Address', render: v => (
    <span className="text-[11px] font-mono text-gray-300">{v}</span>
  )},
  { key: 'severity', label: 'Severity', render: v => {
    const s = SEVERITY_COLORS[v] || SEVERITY_COLORS.info;
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
        style={{ background: s.bg, color: s.color }}>
        {v}
      </span>
    );
  }},
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState(AUDIT_LOGS);
  const [loading] = useState(false);
  const [severity, setSeverity] = useState('all');

  const criticalCount = AUDIT_LOGS.filter(l => l.severity === 'critical').length;
  const warningCount = AUDIT_LOGS.filter(l => l.severity === 'warning').length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Eye size={20} style={{ color: ACCENT }} /> Audit Trail
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Immutable record of every privileged action — {AUDIT_LOGS.length} events in the last 24h
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <Download size={12} /> Export
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <Filter size={12} /> Filters
            </button>
          </div>
        </div>

        {/* Severity summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Events (24h)', value: AUDIT_LOGS.length.toString(),     icon: Activity,       color: '#8b5cf6' },
            { label: 'Info',               value: AUDIT_LOGS.filter(l => l.severity === 'info').length.toString(),     icon: Shield,         color: '#06b6d4' },
            { label: 'Warnings',           value: warningCount.toString(),          icon: AlertTriangle,  color: '#f59e0b' },
            { label: 'Critical',           value: criticalCount.toString(),         icon: AlertTriangle,  color: '#ef4444' },
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

        {/* Severity filter */}
        <div className="rounded-2xl border p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Filter:</span>
          {['all', 'info', 'warning', 'critical'].map(s => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
              style={severity === s
                ? { background: ACCENT, color: '#fff' }
                : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
              }>
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-[11px] text-gray-500 font-mono">
            Showing {severity === 'all' ? AUDIT_LOGS.length : AUDIT_LOGS.filter(l => l.severity === severity).length} of {AUDIT_LOGS.length}
          </span>
        </div>

        {/* Audit table */}
        <AdminTable
          title="Event Log"
          subtitle="Cryptographically signed, append-only audit trail"
          fields={FIELDS}
          data={severity === 'all' ? logs : logs.filter(l => l.severity === severity)}
          loading={loading}
          searchable
          searchPlaceholder="Search by user, action, or resource…"
          exportable
          stats={[
            { label: 'Admin Actions',   value: AUDIT_LOGS.filter(l => l.user.includes('admin')).length.toString() },
            { label: 'User Logins',     value: AUDIT_LOGS.filter(l => l.action === 'user.login').length.toString() },
            { label: 'Unique IPs',      value: new Set(AUDIT_LOGS.map(l => l.ip)).size.toString() },
            { label: 'Failed Payments', value: AUDIT_LOGS.filter(l => l.action === 'payment.failed').length.toString() },
          ]}
          actions={[
            { label: 'View',    onClick: row => alert(`View event ${row.id}`) },
            { label: 'Replay',  onClick: row => alert(`Replay ${row.id}`) },
          ]}
        />
      </div>
    </div>
  );
}