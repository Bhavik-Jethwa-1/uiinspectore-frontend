import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Wallet, CreditCard, Loader2, RefreshCw,
  TrendingUp, Users, Zap, AlertCircle, DollarSign,
  CheckCircle2, XCircle, Clock, ArrowUpRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ACCENT = '#7c5cff';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#ef4444';

const METRIC_STYLES = [
  { bg: `${ACCENT}15`, color: ACCENT },
  { bg: `${SUCCESS}15`, color: SUCCESS },
  { bg: `${WARNING}15`, color: WARNING },
  { bg: `${DANGER}15`, color: DANGER },
];

function StatCard({ label, value, sub, icon: Icon, style }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: style.bg }}>
          <Icon size={20} style={{ color: style.color }} />
        </div>
      </div>
      <p className="text-[24px] font-black mb-0.5" style={{ color: style.color }}>{value}</p>
      <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{label}</p>
      {sub && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function MiniTable({ title, data, columns }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{title}</p>
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr style={{ color: 'var(--text-muted)' }}>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-2 font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row, i) => (
            <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2.5" style={{ color: 'var(--text)' }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(!data || data.length === 0) && (
        <p className="text-center py-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>No data</p>
      )}
    </div>
  );
}

export default function AdminBillingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ui-inspectore_token');
      const res = await fetch('/api/admin/billing/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Try legacy analytics
        const res2 = await fetch('/api/admin/billing/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res2.ok) setData(await res2.json());
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const fmtUSD = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  const fmtNum = (n) => n != null ? Number(n).toLocaleString() : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
        <AlertCircle size={32} className="mx-auto mb-2" />
        <p>Could not load billing data. Make sure you have admin access.</p>
        <button onClick={load} className="mt-3 px-4 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ background: ACCENT }}>
          Retry
        </button>
      </div>
    );
  }

  const w = data.wallet || {};
  const r = data.revenue || {};
  const ai = data.ai_usage || {};
  const daily = data.daily_revenue || [];
  const dist = data.balance_distribution || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Billing Dashboard</h2>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Platform-wide wallet revenue and AI usage analytics</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[var(--surface2)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Wallet Balance" value={fmtUSD(w.total_balance)} sub="Available across all users" icon={Wallet} style={METRIC_STYLES[0]} />
        <StatCard label="Today's Revenue" value={fmtUSD(r.today)} sub="Wallet top-ups today" icon={TrendingUp} style={METRIC_STYLES[1]} />
        <StatCard label="Monthly Revenue" value={fmtUSD(r.month)} sub={`${fmtUSD(r.today)} today`} icon={DollarSign} style={METRIC_STYLES[2]} />
        <StatCard label="Monthly AI Cost" value={fmtUSD(ai.month_cost)} sub={`${fmtNum(ai.total_calls)} total calls`} icon={Zap} style={METRIC_STYLES[3]} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Payments" value={r.pending_payments ?? '—'} sub="Awaiting confirmation" icon={Clock} style={{ bg: `${WARNING}15`, color: WARNING }} />
        <StatCard label="Failed Payments" value={r.failed_payments ?? '—'} sub="Failed transactions" icon={XCircle} style={{ bg: `${DANGER}15`, color: DANGER }} />
        <StatCard label="Total Refunds" value={fmtUSD(r.total_refunds)} sub="All time" icon={ArrowUpRight} style={{ bg: `${ACCENT}15`, color: ACCENT }} />
        <StatCard label="Total Reserved" value={fmtUSD(w.total_reserved)} sub="In-flight AI calls" icon={CreditCard} style={{ bg: '#f3f4f615', color: '#6b7280' }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'revenue', 'users', 'models'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all"
            style={{
              background: activeTab === tab ? ACCENT : 'var(--surface)',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${activeTab === tab ? ACCENT : 'var(--border)'}`,
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Charts & Tables */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Daily Revenue Chart */}
          {daily.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-[14px] font-bold mb-4" style={{ color: 'var(--text)' }}>Daily Revenue — Last 30 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                    labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="amount" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Balance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <MiniTable title="Revenue by Provider" data={data.revenue_by_provider} columns={[
              { key: 'provider', label: 'Provider', render: (v) => <span className="capitalize font-semibold">{v}</span> },
              { key: 'total_calls', label: 'Calls', render: (v) => fmtNum(v) },
              { key: 'total_cost', label: 'Revenue', render: (v) => <span className="font-bold" style={{ color: DANGER }}>{fmtUSD(v)}</span> },
            ]} />
            <MiniTable title="Revenue by Feature" data={data.revenue_by_feature} columns={[
              { key: 'feature', label: 'Feature', render: (v) => <span className="capitalize">{v}</span> },
              { key: 'total_calls', label: 'Calls', render: (v) => fmtNum(v) },
              { key: 'total_cost', label: 'Revenue', render: (v) => <span className="font-bold" style={{ color: DANGER }}>{fmtUSD(v)}</span> },
            ]} />
          </div>

          {/* Recent Topups */}
          <MiniTable title="Recent Top-ups" data={data.recent_topups?.slice(0, 8)} columns={[
            { key: 'id', label: 'ID', render: (v) => <span className="text-[11px] opacity-60">#{v}</span> },
            { key: ['user', 'name'], label: 'User', render: (_, row) => <span>{row.user?.name || row.user?.email || '—'}</span> },
            { key: 'amount', label: 'Amount', render: (v) => <span className="font-bold" style={{ color: SUCCESS }}>{fmtUSD(v)}</span> },
            { key: 'provider', label: 'Provider', render: (v) => <span className="capitalize text-[11px]">{v}</span> },
            { key: 'status', label: 'Status', render: (v) => (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{
                background: v === 'completed' ? `${SUCCESS}15` : v === 'pending' ? `${WARNING}15` : `${DANGER}15`,
                color: v === 'completed' ? SUCCESS : v === 'pending' ? WARNING : DANGER,
              }}>{v}</span>
            )},
            { key: 'created_at', label: 'Date', render: (v) => <span className="text-[11px]">{new Date(v).toLocaleDateString()}</span> },
          ]} />
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MiniTable title="Top Spending Users" data={data.top_spending_users} columns={[
            { key: ['user', 'name'], label: 'User', render: (_, row) => <div><p className="font-semibold">{row.user?.name || '—'}</p><p className="text-[11px] opacity-60">{row.user?.email}</p></div> },
            { key: 'lifetime_spent', label: 'Total Spent', render: (v) => <span className="font-bold" style={{ color: DANGER }}>{fmtUSD(v)}</span> },
            { key: 'current_balance', label: 'Balance', render: (v) => <span>{fmtUSD(v)}</span> },
          ]} />
          <MiniTable title="Top Up Users" data={data.top_up_users} columns={[
            { key: ['user', 'name'], label: 'User', render: (_, row) => <div><p className="font-semibold">{row.user?.name || '—'}</p><p className="text-[11px] opacity-60">{row.user?.email}</p></div> },
            { key: 'lifetime_purchased', label: 'Total Purchased', render: (v) => <span className="font-bold" style={{ color: SUCCESS }}>{fmtUSD(v)}</span> },
            { key: 'current_balance', label: 'Balance', render: (v) => <span>{fmtUSD(v)}</span> },
          ]} />
        </div>
      )}

      {activeTab === 'users' && (
        <MiniTable title="Top Spending Users" data={data.top_spending_users} columns={[
          { key: ['user', 'name'], label: 'User', render: (_, row) => <div><p className="font-semibold">{row.user?.name || '—'}</p><p className="text-[11px] opacity-60">{row.user?.email}</p></div> },
          { key: 'lifetime_spent', label: 'Total Spent', render: (v) => <span className="font-bold" style={{ color: DANGER }}>{fmtUSD(v)}</span> },
          { key: 'lifetime_purchased', label: 'Total Purchased', render: (v) => <span>{fmtUSD(v)}</span> },
          { key: 'current_balance', label: 'Balance', render: (v) => <span className="font-semibold">{fmtUSD(v)}</span> },
        ]} />
      )}

      {activeTab === 'models' && (
        <MiniTable title="Most Used AI Models" data={data.top_models} columns={[
          { key: 'model', label: 'Model', render: (v) => <span className="text-[12px]">{v}</span> },
          { key: 'provider', label: 'Provider', render: (v) => <span className="capitalize text-[11px] px-2 py-0.5 rounded" style={{ background: `${ACCENT}15`, color: ACCENT }}>{v}</span> },
          { key: 'total_calls', label: 'Calls', render: (v) => fmtNum(v) },
          { key: 'total_cost', label: 'Revenue', render: (v) => <span className="font-bold" style={{ color: DANGER }}>{fmtUSD(v)}</span> },
        ]} />
      )}
    </div>
  );
}
