import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { ScrollText, ArrowUpRight, ArrowDownRight, DollarSign, Activity, TrendingUp, TrendingDown, Filter } from 'lucide-react';

const ACCENT = '#ef4444';

const TYPE_COLORS = {
  charge: '#10b981',
  refund: '#ef4444',
  subscription: '#8b5cf6',
  payout: '#f59e0b',
  adjustment: '#06b6d4',
  fee: '#9ca3af',
};

const TYPE_ICONS = {
  charge: '↗',
  refund: '↙',
  subscription: '↻',
  payout: '⤓',
  adjustment: '⇆',
  fee: '−',
};

const STATUS_COLORS = {
  completed: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
  reversed: '#8b5cf6',
};

const TRANSACTIONS = [
  { id: 'txn_01HX3K', user: 'Sarah Chen',       type: 'charge',       amount: 19,   status: 'completed', date: '2026-07-24 09:42:18', method: 'Visa •• 4242', balance: 192.40 },
  { id: 'txn_01HX3L', user: 'Marcus Williams',  type: 'charge',       amount: 49,   status: 'completed', date: '2026-07-24 08:18:42', method: 'MC •• 8821',  balance: 98.20 },
  { id: 'txn_01HX3M', user: 'Acme Corp',         type: 'subscription', amount: 147,  status: 'completed', date: '2026-07-23 22:11:07', method: 'ACH',         balance: 1240.00 },
  { id: 'txn_01HX3N', user: 'Emma Davis',        type: 'charge',       amount: 19,   status: 'failed',    date: '2026-07-23 17:05:33', method: 'Visa •• 1111', balance: 0.00 },
  { id: 'txn_01HX3O', user: 'Carlos Ruiz',       type: 'refund',       amount: -19,  status: 'completed', date: '2026-07-23 09:14:50', method: 'Visa •• 0042', balance: 0.00 },
  { id: 'txn_01HX3P', user: 'James Wilson',      type: 'charge',       amount: 499,  status: 'completed', date: '2026-07-23 14:22:01', method: 'Wire',        balance: 4990.00 },
  { id: 'txn_01HX3Q', user: 'Platform Fees',     type: 'fee',          amount: -47,  status: 'completed', date: '2026-07-23 23:59:00', method: 'Stripe Fee',  balance: 12480.00 },
  { id: 'txn_01HX3R', user: 'Yuki Tanaka',       type: 'charge',       amount: 19,   status: 'pending',   date: '2026-07-23 12:00:00', method: 'JCB •• 8823', balance: 19.00 },
  { id: 'txn_01HX3S', user: 'Stripe Payout',     type: 'payout',       amount: -8420, status: 'completed', date: '2026-07-22 18:00:00', method: 'Bank',        balance: 0.00 },
  { id: 'txn_01HX3T', user: 'Global Tech Ltd',   type: 'charge',       amount: 999,  status: 'completed', date: '2026-07-22 23:48:15', method: 'Wire',        balance: 9990.00 },
  { id: 'txn_01HX3U', user: 'Support Credit',    type: 'adjustment',   amount: 20,   status: 'completed', date: '2026-07-22 16:30:00', method: 'Admin',       balance: 20.00 },
  { id: 'txn_01HX3V', user: 'Alex Johnson',      type: 'charge',       amount: 19,   status: 'reversed',  date: '2026-07-22 11:07:22', method: 'MC •• 4499',  balance: 0.00 },
];

const FIELDS = [
  { key: 'id', label: 'ID', render: v => (
    <span className="text-[11px] font-mono text-gray-500">{v}</span>
  )},
  { key: 'user', label: 'User', sortable: true, render: v => (
    <span className="text-[12px] font-semibold text-white">{v}</span>
  )},
  { key: 'type', label: 'Type', sortable: true, render: v => (
    <div className="flex items-center gap-1.5">
      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
        style={{ background: `${TYPE_COLORS[v]}20`, color: TYPE_COLORS[v] }}>
        {TYPE_ICONS[v]}
      </span>
      <span className="text-[11px] font-semibold capitalize" style={{ color: TYPE_COLORS[v] }}>{v}</span>
    </div>
  )},
  { key: 'amount', label: 'Amount', sortable: true, render: v => (
    <span className="text-[12px] font-bold font-mono" style={{ color: v >= 0 ? '#10b981' : '#ef4444' }}>
      {v >= 0 ? '+' : ''}${Math.abs(v).toLocaleString()}
    </span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
  { key: 'date', label: 'Date', sortable: true, render: v => (
    <span className="text-[11px] font-mono text-gray-400">{v}</span>
  )},
];

export default function AdminTransactionsPage() {
  const [data, setData] = useState(TRANSACTIONS);
  const [loading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const totalIn = TRANSACTIONS.filter(t => t.amount > 0 && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalOut = TRANSACTIONS.filter(t => t.amount < 0 && t.status === 'completed').reduce((s, t) => s + Math.abs(t.amount), 0);
  const netFlow = totalIn - totalOut;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">Financial Ledger</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Complete transaction history — charges, refunds, payouts, and adjustments
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'charge', 'refund', 'payout'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={typeFilter === t
                  ? { background: ACCENT, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Inflow',    value: `+$${totalIn.toLocaleString()}`, icon: ArrowUpRight,   color: '#10b981' },
            { label: 'Total Outflow',   value: `-$${totalOut.toLocaleString()}`,icon: ArrowDownRight, color: '#ef4444' },
            { label: 'Net Flow',        value: `${netFlow >= 0 ? '+' : '-'}$${Math.abs(netFlow).toLocaleString()}`, icon: Activity, color: netFlow >= 0 ? '#10b981' : '#ef4444' },
            { label: 'Transactions',    value: TRANSACTIONS.length.toString(),  icon: ScrollText,     color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Transaction Type Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {Object.keys(TYPE_COLORS).map(t => {
              const items = TRANSACTIONS.filter(tx => tx.type === t);
              const total = items.reduce((s, tx) => s + Math.abs(tx.amount), 0);
              return (
                <div key={t} className="p-3 rounded-xl border"
                  style={{ background: `${TYPE_COLORS[t]}08`, borderColor: `${TYPE_COLORS[t]}30` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[14px]" style={{ color: TYPE_COLORS[t] }}>{TYPE_ICONS[t]}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TYPE_COLORS[t] }}>{t}</span>
                  </div>
                  <div className="text-[16px] font-black text-white">${total.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">{items.length} entries</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions table */}
        <AdminTable
          title="All Transactions"
          subtitle="Full audit log of every financial movement"
          fields={FIELDS}
          data={typeFilter === 'all' ? data : data.filter(d => d.type === typeFilter)}
          loading={loading}
          searchable
          searchPlaceholder="Search by ID, user, or method…"
          exportable
          stats={[
            { label: 'Completed', value: TRANSACTIONS.filter(t => t.status === 'completed').length.toString() },
            { label: 'Pending',   value: TRANSACTIONS.filter(t => t.status === 'pending').length.toString() },
            { label: 'Failed',    value: TRANSACTIONS.filter(t => t.status === 'failed').length.toString() },
            { label: 'Reversed',  value: TRANSACTIONS.filter(t => t.status === 'reversed').length.toString() },
          ]}
          actions={[
            { label: 'View',   onClick: row => alert(`View ${row.id}`) },
            { label: 'Export', onClick: row => alert(`Export ${row.id}`) },
          ]}
        />
      </div>
    </div>
  );
}