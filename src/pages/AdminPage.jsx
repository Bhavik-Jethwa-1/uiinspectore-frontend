import { useState, useEffect, useMemo } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { motion } from 'framer-motion';
import {
  Shield, Users, FolderKanban, Sparkles, TrendingUp, Edit3, Trash2,
  BarChart3, Activity, Settings as SettingsIcon, Terminal, Search,
  MoreHorizontal, Eye, Pause, Play, Loader2
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_PALETTE = ['#7c5cff', '#ff6b9d', '#00d4ff', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

function avatarColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}

const DEMO_USERS = [
  { id: 'u1', name: 'Maya Chen',      email: 'maya@acme.io',   plan: 'pro',        status: 'active',    joinedAt: '2026-01-12' },
  { id: 'u2', name: 'Diego Alvarez',  email: 'diego@acme.io',  plan: 'team',       status: 'active',    joinedAt: '2026-01-22' },
  { id: 'u3', name: 'Priya Shah',     email: 'priya@acme.io',  plan: 'pro',        status: 'active',    joinedAt: '2026-02-04' },
  { id: 'u4', name: 'Jonas Weber',    email: 'jonas@acme.io',  plan: 'free',       status: 'invited',   joinedAt: '2026-07-10' },
  { id: 'u5', name: 'Aiko Tanaka',    email: 'aiko@acme.io',   plan: 'enterprise', status: 'active',    joinedAt: '2026-03-19' },
  { id: 'u6', name: 'Lucas Müller',   email: 'lucas@acme.io',  plan: 'pro',        status: 'suspended', joinedAt: '2026-04-08' },
];

const DEMO_FLAGS = [
  { id: 'beta', name: 'Beta Program', desc: 'Give users access to experimental features.', on: true },
  { id: 'ai-autodesign', name: 'AI Autodesigner', desc: 'Enable the AI-driven design generator.', on: true },
  { id: 'voice', name: 'Voice Notes', desc: 'Allow voice notes on comments (beta).', on: false },
  { id: 'sso', name: 'SSO Required', desc: 'Force SSO login for all workspace members.', on: false },
  { id: 'audit-log', name: 'Audit Logs', desc: 'Persist detailed audit logs for compliance.', on: true },
  { id: 'export', name: 'PDF Exports', desc: 'Allow exporting reports as PDFs.', on: true },
];

const DEMO_LOGS = [
  { time: '10:42:18', level: 'info',    msg: 'user.login — maya@acme.io' },
  { time: '10:41:55', level: 'success', msg: 'report.generated — onboarding-v3 (pdf)' },
  { time: '10:40:12', level: 'info',    msg: 'project.created — Pricing v2' },
  { time: '10:38:01', level: 'warn',    msg: 'rate_limit — 92% of plan used' },
  { time: '10:35:44', level: 'info',    msg: 'integration.connect — slack' },
  { time: '10:33:09', level: 'error',   msg: 'ai.error — timeout on vision_agent (5s)' },
  { time: '10:31:22', level: 'success', msg: 'user.invite — jonas@acme.io' },
  { time: '10:28:50', level: 'info',    msg: 'task.create — Fix CTA contrast' },
  { time: '10:25:11', level: 'info',    msg: 'comment.add — @diego on Onboarding v3' },
  { time: '10:21:37', level: 'warn',    msg: 'billing.warning — renewal in 5 days' },
];

const DEMO_STATS = {
  totalUsers: 248,
  activeProjects: 1247,
  totalAnalyses: 18492,
  aiThisMonth: 92410,
  totalUsersDelta: 6.2,
  projectsDelta: 4.1,
  analysesDelta: 12.8,
  aiDelta: 18.3,
};

const DAY_LABELS = ['Jul 9', 'Jul 10', 'Jul 11', 'Jul 12', 'Jul 13', 'Jul 14', 'Jul 15'];

export default function AdminPage() {
  const { user } = useAuth();
  const { ask } = useConfirm();
  const [users, setUsers] = useState(DEMO_USERS);
  const [flags, setFlags] = useState(DEMO_FLAGS);
  const [logs] = useState(DEMO_LOGS);
  const [stats, setStats] = useState(DEMO_STATS);
  const [aiUsage, setAiUsage] = useState([8200, 11400, 9800, 13200, 14100, 16800, 18910]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.request('/admin/overview').catch(() => null);
        if (data) {
          if (Array.isArray(data.users) && data.users.length) setUsers(data.users);
          if (Array.isArray(data.flags) && data.flags.length) setFlags(data.flags);
          if (data.stats) setStats(s => ({ ...s, ...data.stats }));
          if (Array.isArray(data.aiUsage) && data.aiUsage.length) setAiUsage(data.aiUsage);
        }
      } catch {}
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const toggleFlag = async (id) => {
    setFlags(curr => curr.map(f => f.id === id ? { ...f, on: !f.on } : f));
    try {
      await api.request(`/admin/flags/${id}`, { method: 'PATCH', body: { on: !flags.find(f => f.id === id)?.on } });
    } catch {}
  };

  const removeUser = async (u) => {
    if (!await ask({ title: 'Delete user?', message: `${u.name} will be permanently removed.`, confirmLabel: 'Delete', danger: true })) return;
    setUsers(prev => prev.filter(x => x.id !== u.id));
    api.request(`/admin/users/${u.id}`, { method: 'DELETE' }).catch(() => null);
  };

  const toggleStatus = (u) => {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' } : x));
    api.request(`/admin/users/${u.id}/status`, { method: 'PATCH' }).catch(() => null);
  };

  const maxAi = Math.max(...aiUsage);

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-badge"><Shield size={11} /> Admin Panel</div>
        <h1 className="module-title">Admin</h1>
        <p className="module-subtitle">User management, AI usage, billing and system analytics.</p>
      </div>

      {/* Stats */}
      <div className="ad-stats">
        <StatCard icon={Users} color="#7c5cff" label="Total Users" value={stats.totalUsers.toLocaleString()} delta={stats.totalUsersDelta} />
        <StatCard icon={FolderKanban} color="#00d4ff" label="Active Projects" value={stats.activeProjects.toLocaleString()} delta={stats.projectsDelta} />
        <StatCard icon={Activity} color="#ff6b9d" label="Total Analyses" value={stats.totalAnalyses.toLocaleString()} delta={stats.analysesDelta} />
        <StatCard icon={Sparkles} color="#10b981" label="AI Requests (mo)" value={stats.aiThisMonth.toLocaleString()} delta={stats.aiDelta} />
      </div>

      {/* Users + AI chart */}
      <div className="ad-grid">
        <div className="ad-panel">
          <h3><Users size={14} /> User management</h3>
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 32, fontSize: 12 }}
              placeholder="Search users by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="ad-users">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="ad-user-cell">
                        <div className="ad-mini-avatar" style={{ background: avatarColor(u.email) }}>{initials(u.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`ad-plan-pill ${u.plan}`}>{u.plan}</span></td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        <span className={`ad-status-dot ${u.status}`} />
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(u.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="ad-row-actions">
                        <button title="Edit" onClick={() => setEditing(u)}><Edit3 size={11} /></button>
                        <button title={u.status === 'suspended' ? 'Resume' : 'Suspend'} onClick={() => toggleStatus(u)}>
                          {u.status === 'suspended' ? <Play size={11} /> : <Pause size={11} />}
                        </button>
                        <button className="danger" title="Delete" onClick={() => removeUser(u)}><Trash2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No users match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ad-panel">
          <h3><BarChart3 size={14} /> AI usage — last 7 days</h3>
          <div className="ad-ai-chart">
            {aiUsage.map((v, i) => (
              <div key={i} className="ad-ai-bar-col">
                <div className="ad-ai-bar" style={{ height: `${(v / maxAi) * 100}%` }}>
                  <span className="ad-ai-bar-value">{(v / 1000).toFixed(1)}k</span>
                </div>
                <span className="ad-ai-bar-label">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 12, background: 'var(--surface2)', borderRadius: 10, fontSize: 12, color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text)' }}>Peak:</strong> {DAY_LABELS[aiUsage.indexOf(maxAi)]} ({maxAi.toLocaleString()} requests) — mostly Vision Agent.
          </div>
        </div>
      </div>

      {/* Feature flags + System logs */}
      <h3 className="module-section-title">Feature flags</h3>
      <div className="ad-flags">
        {flags.map((f) => (
          <motion.div
            key={f.id}
            whileHover={{ y: -1 }}
            className="ad-flag"
          >
            <div className="ad-flag-info">
              <span className="ad-flag-name">{f.name}</span>
              <span className="ad-flag-desc">{f.desc}</span>
            </div>
            <button
              className={`ad-toggle ${f.on ? 'on' : ''}`}
              onClick={() => toggleFlag(f.id)}
              aria-label={f.on ? 'Disable' : 'Enable'}
            />
          </motion.div>
        ))}
      </div>

      <h3 className="module-section-title">System logs</h3>
      <div className="ad-logs">
        {logs.map((l, i) => (
          <div key={i} className="ad-log-row">
            <span className="ad-log-time">{l.time}</span>
            <span className={`ad-log-level ${l.level}`}>{l.level}</span>
            <span className="ad-log-msg">{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, delta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="ad-stat"
    >
      <div className="ad-stat-icon" style={{ background: `${color}1a`, color }}>
        <Icon size={18} />
      </div>
      <div className="ad-stat-value">{value}</div>
      <div className="ad-stat-label">{label}</div>
      {typeof delta === 'number' && (
        <span className={`ad-stat-delta ${delta >= 0 ? 'up' : 'down'}`}>
          <TrendingUp size={10} /> {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      )}
    </motion.div>
  );
}