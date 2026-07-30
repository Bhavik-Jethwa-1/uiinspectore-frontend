import { useState, useEffect } from 'react';
import AdminTable from '../../components/shared/AdminTable';
import { DollarSign, CheckCircle2, XCircle, Clock, RefreshCw, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

const ACCENT = '#ef4444';

const STATUS_COLORS = {
  paid: '#10b981',
  failed: '#ef4444',
  pending: '#f59e0b',
  refunded: '#8b5cf6',
  disputed: '#f97316',
};

const PAYMENTS = [
  { id: 'pay_01HK2N', user: 'Sarah Chen',       email: 'sarah@example.com',  plan: 'Pro',         amount: 19,   status: 'paid',     date: '2026-07-24 09:42', method: 'Visa •• 4242' },
  { id: 'pay_01HK2O', user: 'Marcus Williams',  email: 'marcus@startup.io',  plan: 'Team',        amount: 49,   status: 'paid',     date: '2026-07-24 08:18', method: 'MC •• 8821' },
  { id: 'pay_01HK2P', user: 'Acme Corp',         email: 'billing@acme.com',   plan: 'Team x3',    amount: 147,  status: 'paid',     date: '2026-07-23 22:11', method: 'ACH Transfer' },
  { id: 'pay_01HK2Q', user: 'Emma Davis',        email: 'emma@freelance.net', plan: 'Pro',         amount: 19,   status: 'failed',   date: '2026-07-23 17:05', method: 'Visa •• 1111' },
  { id: 'pay_01HK2R', user: 'James Wilson',      email: 'james@corp.io',      plan: 'Enterprise',  amount: 499,  status: 'paid',     date: '2026-07-23 14:22', method: 'Wire' },
  { id: 'pay_01HK2S', user: 'Yuki Tanaka',       email: 'yuki@studio.jp',     plan: 'Pro',         amount: 19,   status: 'pending',  date: '2026-07-23 12:00', method: 'JCB •• 8823' },
  { id: 'pay_01HK2T', user: 'Carlos Ruiz',       email: 'carlos@dev.es',      plan: 'Pro',         amount: 19,   status: 'refunded', date: '2026-07-23 09:14', method: 'Visa •• 0042' },
  { id: 'pay_01HK2U', user: 'Global Tech Ltd',   email: 'finance@globaltech.io', plan: 'Enterprise', amount: 999, status: 'paid',    date: '2026-07-22 23:48', method: 'Wire' },
  { id: 'pay_01HK2V', user: 'Priya Sharma',      email: 'priya@design.co',    plan: 'Free',        amount: 0,    status: 'paid',     date: '2026-07-22 18:30', method: '—' },
  { id: 'pay_01HK2W', user: 'Alex Johnson',      email: 'alex.j@agency.com',  plan: 'Pro',         amount: 19,   status: 'disputed', date: '2026-07-22 11:07', method: 'MC •• 4499' },
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
    <span className="text-[12px] text-gray-300">{v}</span>
  )},
  { key: 'amount', label: 'Amount', sortable: true, render: v => (
    <span className="text-[12px] font-bold text-white">${v.toLocaleString()}</span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
  { key: 'date', label: 'Date', sortable: true, render: v => (
    <span className="text-[12px] text-gray-400 font-mono">{v}</span>
  )},
];

const STAT_CARDS = [
  { label: 'Total Revenue (30d)', value: '$34,290', change: '+12%',   up: true,  icon: DollarSign,  color: '#10b981' },
  { label: 'Successful',          value: '1,847',   change: '+8%',    up: true,  icon: CheckCircle2, color: '#10b981' },
  { label: 'Failed',              value: '142',     change: '-3%',    up: false, icon: XCircle,      color: '#ef4444' },
  { label: 'Pending',             value: '38',      change: '+12',    up: true,  icon: Clock,        color: '#f59e0b' },
];

export default function AdminPaymentsPage() {
  const [data, setData] = useState(PAYMENTS);
  const [loading] = useState(false);

  const successfulTotal = PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const failedTotal     = PAYMENTS.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s, i) => (
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

        {/* Method breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-5 lg:col-span-1"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard size={14} className="text-gray-500" /> Payment Methods
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Visa',     pct: 48.2, color: '#1a1f71', amount: '$16,520' },
                { name: 'Mastercard', pct: 26.7, color: '#eb001b', amount: '$9,155'  },
                { name: 'ACH',       pct: 14.1, color: '#06b6d4', amount: '$4,830'  },
                { name: 'Wire',      pct: 8.4,  color: '#f59e0b', amount: '$2,880'  },
                { name: 'JCB',       pct: 2.6,  color: '#8b5cf6', amount: '$905'    },
              ].map(m => (
                <div key={m.name}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className="text-gray-500">{m.pct}% · {m.amount}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5 lg:col-span-2"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4">Recent Activity</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}>
                <div className="text-[11px] text-gray-500 mb-1">Successful Volume</div>
                <div className="text-[18px] font-black text-green-400">${successfulTotal.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 mt-1">across {PAYMENTS.filter(p => p.status === 'paid').length} payments</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
                <div className="text-[11px] text-gray-500 mb-1">Failed Volume</div>
                <div className="text-[18px] font-black" style={{ color: ACCENT }}>${failedTotal.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 mt-1">{PAYMENTS.filter(p => p.status === 'failed').length} declined transactions</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
                <div className="text-[11px] text-gray-500 mb-1">Refunded</div>
                <div className="text-[18px] font-black text-purple-400">${PAYMENTS.filter(p => p.status === 'refunded').reduce((s,p) => s + p.amount, 0)}</div>
                <div className="text-[10px] text-gray-500 mt-1">{PAYMENTS.filter(p => p.status === 'refunded').length} refund events</div>
              </div>
            </div>
            <div className="mt-4 text-[11px] text-gray-500">
              <span className="font-mono text-gray-400">Tip:</span> Failed payments are automatically retried with exponential backoff over 7 days.
            </div>
          </div>
        </div>

        {/* Payments table */}
        <AdminTable
          title="All Payments"
          subtitle="Stripe & Razorpay transaction history"
          fields={FIELDS}
          data={data}
          loading={loading}
          searchable
          searchPlaceholder="Search by user, email, or payment ID…"
          exportable
          stats={[
            { label: 'Total Volume',   value: `$${(successfulTotal + failedTotal).toLocaleString()}` },
            { label: 'Success Rate',   value: '92.4%', change: '+0.8%', up: true },
            { label: 'Avg Ticket',     value: '$18.60' },
            { label: 'Failed (24h)',   value: '4', change: '-2', up: false },
          ]}
          actions={[
            { label: 'View',    onClick: row => alert(`View ${row.id}`) },
            { label: 'Refund',  danger: true, onClick: row => alert(`Refund ${row.id}`) },
          ]}
        />
      </div>
    </div>
  );
}