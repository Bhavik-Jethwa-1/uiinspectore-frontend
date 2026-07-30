import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CreditCard, DollarSign, Zap, Image, FolderKanban,
  ArrowUpRight, ArrowDownRight, Loader2, Server, Activity,
  Shield, BarChart3, Monitor, MessageSquare, AlertCircle,
} from 'lucide-react';
import api from '../../utils/api';

const ACCENT = '#ef4444';

const PLAN_COLORS = {
  free: '#6b7280',
  pro: '#6366f1',
  team: '#f59e0b',
  enterprise: '#8b5cf6',
  other: '#374151',
};

function StatCard({ icon: Icon, label, value, change, up, color, delay, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border p-5 animate-pulse" style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(239,68,68,0.1)',
      }}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="w-14 h-5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="w-20 h-8 rounded-lg mb-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="w-24 h-4 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        borderColor: `${color}20`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${up ? '' : 'rotate-180'}`}
            style={{ background: up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: up ? '#10b981' : '#ef4444' }}>
            <ArrowUpRight size={10} /> {change}
          </div>
        )}
      </div>
      <div className="text-[28px] font-black text-white mb-0.5">{value}</div>
      <div className="text-[12px] text-gray-500">{label}</div>
    </motion.div>
  );
}

function MiniBar({ label, value, pct, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 text-[12px] text-gray-400 truncate">{label}</div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <div className="w-14 text-[11px] text-gray-500 text-right">{(value ?? 0).toLocaleString()}</div>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await api.adminAnalytics();
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const totals = data?.totals || {};
  const planDist = data?.plan_distribution || {};
  const totalUsers = Object.values(planDist).reduce((s, v) => s + (v || 0), 0);

  const stats = [
    { label: 'Total Users',     value: (totals.users || 0).toLocaleString(),  change: null,     up: true,  icon: Users,        color: '#6366f1' },
    { label: 'Projects',        value: (totals.projects || 0).toLocaleString(), change: null,    up: true,  icon: FolderKanban, color: '#f97316' },
    { label: 'Screens',        value: (totals.screens || 0).toLocaleString(), change: null,    up: true,  icon: Monitor,      color: '#06b6d4' },
    { label: 'AI Analyses',     value: (totals.analyses || 0).toLocaleString(), change: null,   up: true,  icon: Zap,          color: '#8b5cf6' },
    { label: 'Annotations',    value: (totals.annotations || 0).toLocaleString(), change: null,  up: true,  icon: AlertCircle,  color: '#10b981' },
    { label: 'Elements',        value: (totals.elements || 0).toLocaleString(), change: null,    up: true,  icon: BarChart3,    color: '#f59e0b' },
  ];

  const planBars = Object.entries(planDist)
    .filter(([k]) => k !== 'other')
    .map(([plan, count]) => ({
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      count: count || 0,
      pct: totalUsers > 0 ? Math.round(((count || 0) / totalUsers) * 100) : 0,
      color: PLAN_COLORS[plan] || PLAN_COLORS.other,
    }))
    .sort((a, b) => b.count - a.count);

  const recentProjects = (data?.recent_projects || []).slice(0, 6);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      

      <div className="p-6 space-y-6">
        {/* Welcome bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-black text-white">Overview</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Real-time platform metrics and activity
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live · {data?.generated_at ? new Date(data.generated_at).toLocaleTimeString() : ''}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading ? (
            stats.map((_, i) => <StatCard key={i} loading delay={i * 0.06} />)
          ) : (
            stats.map((card, i) => <StatCard key={card.label} {...card} delay={i * 0.06} />)
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-[13px] font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {error} — showing cached data below.
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Issue severity breakdown */}
            {data?.issue_severity && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border p-5"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-bold text-white">Issue Breakdown</h3>
                    <p className="text-[11px] text-gray-500">{totals.annotations || 0} total annotations</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'critical', label: 'Critical', color: '#ef4444' },
                    { key: 'high',     label: 'High',     color: '#f97316' },
                    { key: 'medium',   label: 'Medium',   color: '#f59e0b' },
                    { key: 'low',      label: 'Low',      color: '#10b981' },
                    { key: 'info',     label: 'Info',     color: '#6366f1' },
                    { key: 'other',    label: 'Other',    color: '#6b7280' },
                  ].map(s => {
                    const count = data.issue_severity[s.key] || 0;
                    return (
                      <div key={s.key} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-[12px] text-gray-400">{s.label}</span>
                        <span className="ml-auto text-[12px] font-bold" style={{ color: s.color }}>{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Recent projects */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-bold text-white">Recent Projects</h3>
                  <p className="text-[11px] text-gray-500">{totals.projects || 0} total projects</p>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <p className="text-[12px] text-gray-500 text-center py-6">No projects yet</p>
              ) : (
                <div className="space-y-2">
                  {recentProjects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <FolderKanban size={14} style={{ color: '#818cf8' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white truncate">{p.name || 'Untitled'}</div>
                        <div className="text-[10px] text-gray-500">ID: {p.id?.slice(0, 8)} · {timeAgo(p.updated_at)}</div>
                      </div>
                      <ArrowUpRight size={13} className="text-gray-600 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Plan distribution */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-white">Plan Distribution</h3>
                <span className="text-[11px] font-semibold text-gray-500">{totalUsers.toLocaleString()} users</span>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  ))}
                </div>
              ) : planBars.length === 0 ? (
                <p className="text-[12px] text-gray-500 text-center py-6">No user data</p>
              ) : (
                <div className="space-y-4">
                  {planBars.map(p => (
                    <div key={p.plan}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="font-semibold" style={{ color: p.color }}>{p.plan}</span>
                        <span className="text-gray-500">{p.count.toLocaleString()} ({p.pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Role distribution */}
            {data?.role_distribution && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border p-5"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
                <h3 className="text-[14px] font-bold text-white mb-4">User Roles</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Admins',   key: 'admin', color: '#ef4444' },
                    { label: 'Users',    key: 'user',  color: '#6366f1' },
                    { label: 'Other',    key: 'other', color: '#6b7280' },
                  ].map(r => {
                    const count = data.role_distribution[r.key] || 0;
                    return (
                      <div key={r.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                          <span className="text-[12px] text-gray-400">{r.label}</span>
                        </div>
                        <span className="text-[12px] font-bold" style={{ color: r.color }}>{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <h3 className="text-[14px] font-bold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Manage Users',    icon: Users,       to: '/admin/users',        color: '#6366f1' },
                  { label: 'View Plans',      icon: CreditCard,  to: '/admin/plans',        color: '#f59e0b' },
                  { label: 'AI Providers',   icon: Zap,         to: '/admin/ai-providers', color: '#8b5cf6' },
                  { label: 'Subscriptions',   icon: DollarSign,  to: '/admin/subscriptions',color: '#10b981' },
                  { label: 'System Logs',     icon: Server,      to: '/admin/logs',         color: '#ef4444' },
                ].map(item => (
                  <a key={item.to} href={`#${item.to}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all hover:bg-white/5"
                    style={{ color: item.color }}>
                    <item.icon size={14} />
                    {item.label}
                    <ArrowUpRight size={12} className="ml-auto opacity-50" />
                  </a>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
