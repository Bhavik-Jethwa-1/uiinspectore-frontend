import { useState, useEffect } from 'react';
import AdminTable from '../../components/shared/AdminTable';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle } from 'lucide-react';

const ACCENT = '#ef4444';

const PLAN_COLORS = { Free: '#9ca3af', Pro: '#818cf8', Team: '#fbbf24', Enterprise: '#ef4444' };
const STATUS_COLORS = { active: '#10b981', paused: '#f59e0b', cancelled: '#ef4444', trialing: '#06b6d4', past_due: '#f97316' };

const MOCK_SUBS = [
  { id: 'sub_01HK9', user: 'Sarah Chen', email: 'sarah@example.com', plan: 'Pro', status: 'active', started: '2026-03-15', renews: '2026-08-15', amount: 19, mrr: 19 },
  { id: 'sub_01HK10', user: 'Marcus Williams', email: 'marcus@startup.io', plan: 'Team', status: 'active', started: '2026-04-02', renews: '2026-08-02', amount: 49, mrr: 49 },
  { id: 'sub_01HK11', user: 'Acme Corp', email: 'billing@acme.com', plan: 'Team', status: 'active', started: '2026-02-14', renews: '2026-08-14', amount: 147, mrr: 147 },
  { id: 'sub_01HK12', user: 'Emma Davis', email: 'emma@freelance.net', plan: 'Pro', status: 'cancelled', started: '2025-11-20', renews: '—', amount: 19, mrr: 0 },
  { id: 'sub_01HK13', user: 'Yuki Tanaka', email: 'yuki@studio.jp', plan: 'Pro', status: 'trialing', started: '2026-07-01', renews: '2026-07-31', amount: 19, mrr: 0 },
  { id: 'sub_01HK14', user: 'James Wilson', email: 'james@corp.io', plan: 'Enterprise', status: 'active', started: '2026-01-10', renews: '2027-01-10', amount: 499, mrr: 499 },
  { id: 'sub_01HK15', user: 'Priya Sharma', email: 'priya@design.co', plan: 'Free', status: 'active', started: '2026-05-10', renews: '—', amount: 0, mrr: 0 },
  { id: 'sub_01HK16', user: 'Alex Johnson', email: 'alex.j@agency.com', plan: 'Pro', status: 'past_due', started: '2026-03-28', renews: '2026-07-28', amount: 19, mrr: 19 },
  { id: 'sub_01HK17', user: 'Global Tech Ltd', email: 'finance@globaltech.io', plan: 'Enterprise', status: 'active', started: '2025-09-22', renews: '2026-09-22', amount: 999, mrr: 999 },
  { id: 'sub_01HK18', user: 'Carlos Ruiz', email: 'carlos@dev.es', plan: 'Free', status: 'paused', started: '2026-06-22', renews: '—', amount: 0, mrr: 0 },
];

const PLAN_DISTRIBUTION = [
  { plan: 'Free',       count: 9847, pct: 76.6, color: '#9ca3af' },
  { plan: 'Pro',        count: 2471, pct: 19.2, color: '#818cf8' },
  { plan: 'Team',       count: 471,  pct: 3.7,  color: '#fbbf24' },
  { plan: 'Enterprise', count: 58,   pct: 0.5,  color: '#ef4444' },
];

const STATUS_BREAKDOWN = [
  { status: 'active',    count: 2104, pct: 87.2, color: '#10b981' },
  { status: 'trialing',  count: 142,  pct: 5.9,  color: '#06b6d4' },
  { status: 'past_due',  count: 87,   pct: 3.6,  color: '#f97316' },
  { status: 'paused',    count: 64,   pct: 2.6,  color: '#f59e0b' },
  { status: 'cancelled', count: 16,   pct: 0.7,  color: '#ef4444' },
];

const FIELDS = [
  { key: 'user', label: 'User', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {row.user.split(' ').map(n => n[0]).join('').slice(0,2)}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-white">{v}</div>
        <div className="text-[10px] text-gray-500">{row.email}</div>
      </div>
    </div>
  )},
  { key: 'plan', label: 'Plan', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${PLAN_COLORS[v] || '#9ca3af'}18`, color: PLAN_COLORS[v] || '#9ca3af' }}>
      {v}
    </span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1"
      style={{ background: `${STATUS_COLORS[v] || '#9ca3af'}15`, color: STATUS_COLORS[v] || '#9ca3af' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] || '#9ca3af' }} />
      {v.replace('_', ' ')}
    </span>
  )},
  { key: 'started', label: 'Started', sortable: true, render: v => (
    <span className="text-[12px] text-gray-300">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  )},
  { key: 'renews', label: 'Renews', render: v => (
    <span className="text-[12px] text-gray-300">{v === '—' ? '—' : new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  )},
  { key: 'amount', label: 'Amount', sortable: true, render: v => (
    <span className="text-[12px] font-bold text-white">${v}<span className="text-[10px] text-gray-500 font-normal">/mo</span></span>
  )},
];

function DistributionBar({ items }) {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.plan || item.status}>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="font-semibold capitalize" style={{ color: item.color }}>{item.plan || item.status.replace('_', ' ')}</span>
            <span className="text-gray-500">{item.count.toLocaleString()} ({item.pct}%)</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState(MOCK_SUBS);
  const [loading] = useState(false);

  // Compute totals
  const totalMrr = MOCK_SUBS.reduce((sum, s) => sum + s.mrr, 0);
  const activeCount = MOCK_SUBS.filter(s => s.status === 'active').length;
  const churnedCount = MOCK_SUBS.filter(s => s.status === 'cancelled').length;
  const churnRate = ((churnedCount / MOCK_SUBS.length) * 100).toFixed(1);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Recurring Revenue', value: `$${totalMrr.toLocaleString()}`, icon: DollarSign, color: '#10b981', change: '+12% MoM', up: true },
            { label: 'Active Subscriptions',      value: activeCount.toLocaleString(),     icon: Users,      color: '#6366f1', change: '+180 this mo', up: true },
            { label: 'Avg. Revenue / User',       value: '$23.40',                        icon: Activity,   color: '#8b5cf6', change: '+$1.20', up: true },
            { label: 'Cancellation Rate',         value: `${churnRate}%`,                 icon: AlertTriangle, color: '#ef4444', change: '-0.4%', up: false },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${!s.up ? 'rotate-180' : ''}`}
                  style={{ background: s.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.up ? '#10b981' : '#ef4444' }}>
                  {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {s.change}
                </div>
              </div>
              <div className="text-[24px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Plan distribution + status breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-white">Plan Distribution</h3>
              <CreditCard size={14} className="text-gray-500" />
            </div>
            <DistributionBar items={PLAN_DISTRIBUTION} />
          </div>

          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-white">Status Breakdown</h3>
              <Activity size={14} className="text-gray-500" />
            </div>
            <DistributionBar items={STATUS_BREAKDOWN} />
          </div>
        </div>

        {/* Subscriptions table */}
        <AdminTable
          title="All Subscriptions"
          subtitle="Active and historical subscription records"
          fields={FIELDS}
          data={subs}
          loading={loading}
          searchable
          searchPlaceholder="Search by user or email…"
          exportable
          stats={[
            { label: 'Total Subscriptions', value: MOCK_SUBS.length.toString() },
            { label: 'Total MRR',           value: `$${totalMrr.toLocaleString()}` },
            { label: 'Active Plans',        value: activeCount.toString(), change: '+5 today', up: true },
            { label: 'Cancelled',           value: churnedCount.toString(), change: '-1 this week', up: false },
          ]}
          actions={[
            { label: 'View',   onClick: row => alert(`View ${row.user}`) },
            { label: 'Cancel', danger: true, onClick: row => alert(`Cancel ${row.user}`) },
          ]}
        />
      </div>
    </div>
  );
}