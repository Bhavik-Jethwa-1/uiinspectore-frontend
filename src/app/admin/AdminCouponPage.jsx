import { useState, useEffect } from 'react';
import AdminTable from '../../components/shared/AdminTable';
import { Gift, Plus, Copy, TrendingUp, Ticket, DollarSign, Users } from 'lucide-react';

const ACCENT = '#ef4444';

const TYPE_COLORS = { percent: '#8b5cf6', fixed: '#10b981' };
const STATUS_COLORS = { active: '#10b981', expired: '#ef4444', disabled: '#9ca3af', exhausted: '#f59e0b' };

const COUPONS = [
  { id: 1, code: 'LAUNCH50',       type: 'percent', value: 50, uses: 184,  maxUses: 500,  expires: '2026-08-31', status: 'active',    created: '2026-06-15', discount: '$1,847' },
  { id: 2, code: 'SUMMER25',       type: 'percent', value: 25, uses: 412,  maxUses: 1000, expires: '2026-09-01', status: 'active',    created: '2026-06-01', discount: '$3,420' },
  { id: 3, code: 'WELCOME10',      type: 'fixed',   value: 10, uses: 1284, maxUses: 5000, expires: '2026-12-31', status: 'active',    created: '2026-01-10', discount: '$12,840' },
  { id: 4, code: 'TEAM20',         type: 'percent', value: 20, uses: 87,   maxUses: 200,  expires: '2026-08-15', status: 'active',    created: '2026-07-01', discount: '$842' },
  { id: 5, code: 'BLACKFRIDAY',    type: 'percent', value: 70, uses: 500,  maxUses: 500,  expires: '2026-11-29', status: 'exhausted', created: '2025-11-25', discount: '$6,930' },
  { id: 6, code: 'STUDENT15',      type: 'percent', value: 15, uses: 234,  maxUses: 1000, expires: '2026-12-31', status: 'active',    created: '2026-02-14', discount: '$1,170' },
  { id: 7, code: 'PARTNER100',     type: 'fixed',   value: 100, uses: 12,  maxUses: 50,  expires: '2026-10-31', status: 'active',    created: '2026-05-20', discount: '$1,200' },
  { id: 8, code: 'EASTER2025',     type: 'percent', value: 30, uses: 184,  maxUses: 500,  expires: '2025-04-30', status: 'expired',   created: '2025-03-25', discount: '$1,840' },
  { id: 9, code: 'VIPONLY',        type: 'fixed',   value: 50, uses: 0,    maxUses: 100, expires: '2026-12-31', status: 'disabled',  created: '2026-07-10', discount: '$0' },
  { id: 10, code: 'ANNUAL30',      type: 'percent', value: 30, uses: 47,  maxUses: 200,  expires: '2026-12-31', status: 'active',    created: '2026-06-22', discount: '$1,410' },
];

const FIELDS = [
  { key: 'code', label: 'Code', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-mono font-bold text-white px-2 py-1 rounded-md"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(239,68,68,0.3)' }}>
        {v}
      </span>
      <button
        onClick={() => navigator.clipboard?.writeText(v)}
        className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
        <Copy size={11} />
      </button>
    </div>
  )},
  { key: 'type', label: 'Type', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase"
        style={{ background: `${TYPE_COLORS[v]}18`, color: TYPE_COLORS[v] }}>
        {v === 'percent' ? '%' : '$'}
      </span>
      <span className="text-[12px] font-bold text-white">
        {v === 'percent' ? `${row.value}%` : `$${row.value}`}
      </span>
    </div>
  )},
  { key: 'uses', label: 'Uses', sortable: true, render: (v, row) => (
    <div className="w-32">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-white font-semibold">{v}</span>
        <span className="text-gray-500">/ {row.maxUses.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{
          width: `${Math.min(100, (v / row.maxUses) * 100)}%`,
          background: (v / row.maxUses) > 0.8 ? '#ef4444' : (v / row.maxUses) > 0.5 ? '#f59e0b' : '#10b981',
        }} />
      </div>
    </div>
  )},
  { key: 'expires', label: 'Expires', sortable: true, render: v => (
    <span className="text-[12px] text-gray-300 font-mono">
      {new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
];

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState(COUPONS);
  const [loading] = useState(false);

  const activeCount = COUPONS.filter(c => c.status === 'active').length;
  const totalUses = COUPONS.reduce((sum, c) => sum + c.uses, 0);
  const totalDiscount = COUPONS.reduce((sum, c) => sum + parseFloat(c.discount.replace(/[$,]/g, '')), 0);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white">Discount Coupons</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Create and manage promotional codes, percent discounts, and partner deals
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Create Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Coupons',   value: activeCount.toString(),         icon: Gift,       color: '#10b981' },
            { label: 'Total Codes',      value: COUPONS.length.toString(),      icon: Ticket,     color: '#8b5cf6' },
            { label: 'Total Redemptions',value: totalUses.toLocaleString(),     icon: Users,      color: '#06b6d4' },
            { label: 'Total Discount',   value: `$${totalDiscount.toLocaleString()}`, icon: DollarSign, color: '#fbbf24' },
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

        {/* Coupon table */}
        <AdminTable
          title="All Coupons"
          subtitle="Active, expired, and disabled promotional codes"
          fields={FIELDS}
          data={coupons}
          loading={loading}
          searchable
          searchPlaceholder="Search by code…"
          exportable
          stats={[
            { label: 'Active',     value: COUPONS.filter(c => c.status === 'active').length.toString() },
            { label: 'Exhausted',  value: COUPONS.filter(c => c.status === 'exhausted').length.toString() },
            { label: 'Expired',    value: COUPONS.filter(c => c.status === 'expired').length.toString() },
            { label: 'Disabled',   value: COUPONS.filter(c => c.status === 'disabled').length.toString() },
          ]}
          actions={[
            { label: 'Edit',   onClick: row => alert(`Edit ${row.code}`) },
            { label: 'Delete', danger: true, onClick: row => alert(`Delete ${row.code}`) },
          ]}
        />
      </div>
    </div>
  );
}