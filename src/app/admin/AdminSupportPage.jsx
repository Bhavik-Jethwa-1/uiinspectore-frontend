import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { Headphones, Plus, Clock, CheckCircle2, AlertTriangle, MessageSquare, User, Flag } from 'lucide-react';

const ACCENT = '#ef4444';

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', icon: '🔴' },
  high:     { bg: 'rgba(249,115,22,0.15)', color: '#f97316', icon: '🟠' },
  medium:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: '🟡' },
  low:      { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', icon: '🟢' },
};

const STATUS_COLORS = {
  open:     '#06b6d4',
  pending:  '#f59e0b',
  resolved: '#10b981',
  closed:   '#9ca3af',
};

const TICKETS = [
  { id: 'TKT-1284', user: 'Sarah Chen',     email: 'sarah@example.com',   subject: 'Cannot export to Figma after Pro upgrade', priority: 'high',     status: 'open',     assigned: 'Marcus T.',  created: '2026-07-24 09:42', lastReply: '12m ago', replies: 4 },
  { id: 'TKT-1283', user: 'James Wilson',   email: 'james@corp.io',       subject: 'SSO login redirects to blank page',        priority: 'critical', status: 'open',     assigned: 'Alex K.',     created: '2026-07-24 08:18', lastReply: '32m ago', replies: 7 },
  { id: 'TKT-1282', user: 'Emma Davis',     email: 'emma@freelance.net',  subject: 'Refund for duplicate Pro charge',          priority: 'medium',   status: 'pending',  assigned: 'Sarah L.',   created: '2026-07-23 22:11', lastReply: '1h ago',  replies: 2 },
  { id: 'TKT-1281', user: 'Yuki Tanaka',    email: 'yuki@studio.jp',      subject: 'How to enable Japanese in templates',     priority: 'low',      status: 'open',     assigned: 'Unassigned', created: '2026-07-23 17:05', lastReply: '2h ago',  replies: 1 },
  { id: 'TKT-1280', user: 'Acme Corp',      email: 'billing@acme.com',    subject: 'Invoice missing VAT number for EU entity', priority: 'medium',   status: 'pending',  assigned: 'Marcus T.',  created: '2026-07-23 14:22', lastReply: '3h ago',  replies: 3 },
  { id: 'TKT-1279', user: 'Carlos Ruiz',    email: 'carlos@dev.es',       subject: 'API rate limit at 10 req/s on Pro plan',   priority: 'high',     status: 'resolved', assigned: 'Alex K.',     created: '2026-07-23 09:14', lastReply: '4h ago',  replies: 8 },
  { id: 'TKT-1278', user: 'Priya Sharma',   email: 'priya@design.co',     subject: 'Suggestion: dark mode for template gallery', priority: 'low',     status: 'open',     assigned: 'Unassigned', created: '2026-07-22 23:48', lastReply: '8h ago',  replies: 1 },
  { id: 'TKT-1277', user: 'Alex Johnson',   email: 'alex.j@agency.com',   subject: 'AI redesign produces blank canvas',        priority: 'critical', status: 'pending',  assigned: 'Sarah L.',   created: '2026-07-22 18:30', lastReply: '12h ago', replies: 5 },
  { id: 'TKT-1276', user: 'Global Tech Ltd', email: 'finance@globaltech.io', subject: 'Custom Enterprise plan inquiry',         priority: 'medium',   status: 'open',     assigned: 'Marcus T.',  created: '2026-07-22 11:07', lastReply: '1d ago',  replies: 2 },
  { id: 'TKT-1275', user: 'Marcus Williams', email: 'marcus@startup.io',  subject: 'Team member cannot accept invite',         priority: 'low',      status: 'resolved', assigned: 'Alex K.',     created: '2026-07-21 16:42', lastReply: '2d ago',  replies: 4 },
];

const FIELDS = [
  { key: 'id', label: 'Ticket #', sortable: true, render: v => (
    <span className="text-[11px] font-mono font-bold" style={{ color: ACCENT }}>{v}</span>
  )},
  { key: 'user', label: 'User', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {row.user.split(' ').map(n => n[0]).join('').slice(0,2)}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-white">{v}</div>
        <div className="text-[10px] text-gray-500">{row.email}</div>
      </div>
    </div>
  )},
  { key: 'subject', label: 'Subject', sortable: true, render: (v, row) => (
    <div>
      <div className="text-[12px] text-white font-medium">{v}</div>
      <div className="flex items-center gap-2 mt-0.5">
        <MessageSquare size={9} className="text-gray-600" />
        <span className="text-[10px] text-gray-500">{row.replies} replies · {row.lastReply}</span>
      </div>
    </div>
  )},
  { key: 'priority', label: 'Priority', sortable: true, render: v => {
    const p = PRIORITY_COLORS[v];
    return (
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1.5 capitalize"
        style={{ background: p.bg, color: p.color }}>
        <span className="text-[10px]">{p.icon}</span>
        {v}
      </span>
    );
  }},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
  { key: 'assigned', label: 'Assigned To', render: v => (
    <span className={`text-[12px] font-semibold ${v === 'Unassigned' ? 'text-yellow-400' : 'text-white'}`}>
      {v}
    </span>
  )},
  { key: 'created', label: 'Created', sortable: true, render: v => (
    <span className="text-[11px] font-mono text-gray-400">{v}</span>
  )},
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(TICKETS);
  const [loading] = useState(false);
  const [filter, setFilter] = useState('all');

  const openCount = TICKETS.filter(t => t.status === 'open').length;
  const criticalCount = TICKETS.filter(t => t.priority === 'critical').length;
  const avgFirstResponse = '14 min';

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Headphones size={20} style={{ color: ACCENT }} /> Customer Support
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {openCount} open · {criticalCount} critical · avg first response {avgFirstResponse}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'open', 'pending', 'resolved'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all"
                style={filter === s
                  ? { background: ACCENT, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {s}
              </button>
            ))}
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ml-2"
              style={{ background: ACCENT, color: '#fff' }}>
              <Plus size={14} /> New Ticket
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Open Tickets',      value: openCount.toString(),           icon: MessageSquare, color: '#06b6d4' },
            { label: 'Critical',          value: criticalCount.toString(),       icon: AlertTriangle, color: '#ef4444' },
            { label: 'Avg First Response',value: avgFirstResponse,                icon: Clock,         color: '#8b5cf6' },
            { label: 'Resolution Rate',   value: '94.2%',                         icon: CheckCircle2,  color: '#10b981' },
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

        {/* Priority distribution */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Priority Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(PRIORITY_COLORS).map(p => {
              const items = TICKETS.filter(t => t.priority === p);
              const c = PRIORITY_COLORS[p];
              return (
                <div key={p} className="p-3 rounded-xl border" style={{ background: c.bg, borderColor: `${c.color}30` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[12px]">{c.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider capitalize" style={{ color: c.color }}>{p}</span>
                  </div>
                  <div className="text-[20px] font-black text-white">{items.length}</div>
                  <div className="text-[10px] text-gray-500">{((items.length / TICKETS.length) * 100).toFixed(0)}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets table */}
        <AdminTable
          title="All Tickets"
          subtitle="Customer support queue with priority routing"
          fields={FIELDS}
          data={filter === 'all' ? tickets : tickets.filter(t => t.status === filter)}
          loading={loading}
          searchable
          searchPlaceholder="Search by ID, user, or subject…"
          exportable
          stats={[
            { label: 'Open',      value: TICKETS.filter(t => t.status === 'open').length.toString() },
            { label: 'Pending',   value: TICKETS.filter(t => t.status === 'pending').length.toString() },
            { label: 'Resolved',  value: TICKETS.filter(t => t.status === 'resolved').length.toString() },
            { label: 'Unassigned',value: TICKETS.filter(t => t.assigned === 'Unassigned').length.toString() },
          ]}
          actions={[
            { label: 'Open',    onClick: row => alert(`Open ${row.id}`) },
            { label: 'Assign',  onClick: row => alert(`Assign ${row.id}`) },
            { label: 'Close',   danger: true, onClick: row => alert(`Close ${row.id}`) },
          ]}
        />
      </div>
    </div>
  );
}