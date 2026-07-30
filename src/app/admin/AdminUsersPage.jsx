import { useState, useEffect } from 'react';
import AdminTable from '../../components/shared/AdminTable';
import { Shield } from 'lucide-react';

const ACCENT = '#ef4444';

const PLAN_COLORS = { free: '#9ca3af', pro: '#818cf8', team: '#fbbf24' };
const STATUS_COLORS = { active: '#10b981', cancelled: '#ef4444', suspended: '#f59e0b', trial: '#06b6d4' };

const MOCK_USERS = [
  { id: 1, name: 'Sarah Chen', email: 'sarah@example.com', plan: 'Pro', status: 'active', joined: '2026-03-15', ai_requests: 482, last_active: '2h ago' },
  { id: 2, name: 'Marcus Williams', email: 'marcus@startup.io', plan: 'Team', status: 'active', joined: '2026-04-02', ai_requests: 1204, last_active: '1h ago' },
  { id: 3, name: 'Priya Sharma', email: 'priya@design.co', plan: 'Free', status: 'active', joined: '2026-05-10', ai_requests: 23, last_active: '4h ago' },
  { id: 4, name: 'Alex Johnson', email: 'alex.j@agency.com', plan: 'Pro', status: 'active', joined: '2026-03-28', ai_requests: 891, last_active: '30m ago' },
  { id: 5, name: 'Emma Davis', email: 'emma@freelance.net', plan: 'Free', status: 'cancelled', joined: '2026-01-20', ai_requests: 8, last_active: '3d ago' },
  { id: 6, name: 'James Wilson', email: 'james@corp.io', plan: 'Team', status: 'active', joined: '2026-02-14', ai_requests: 3420, last_active: '10m ago' },
  { id: 7, name: 'Yuki Tanaka', email: 'yuki@studio.jp', plan: 'Pro', status: 'trial', joined: '2026-07-01', ai_requests: 67, last_active: '1h ago' },
  { id: 8, name: 'Carlos Ruiz', email: 'carlos@dev.es', plan: 'Free', status: 'active', joined: '2026-06-22', ai_requests: 15, last_active: '2d ago' },
];

const FIELDS = [
  { key: 'name', label: 'User', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {row.name.split(' ').map(n => n[0]).join('').slice(0,2)}
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
      {v}
    </span>
  )},
  { key: 'ai_requests', label: 'AI Requests', sortable: true, render: v => (
    <span className="text-[12px] text-gray-300">{Number(v).toLocaleString()}</span>
  )},
  { key: 'joined', label: 'Joined', sortable: true, render: v => (
    <span className="text-[12px] text-gray-500">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  )},
  { key: 'last_active', label: 'Last Active', render: v => (
    <span className="text-[12px] text-gray-500">{v}</span>
  )},
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading] = useState(false);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        <AdminTable
          title="All Users"
          subtitle="Manage user accounts, plans, and permissions"
          fields={FIELDS}
          data={users}
          loading={loading}
          searchable
          searchPlaceholder="Search users by name or email…"
          exportable
          stats={[
            { label: 'Total Users', value: '12,847' },
            { label: 'Paid Users', value: '3,000', change: '+180 MoM', up: true },
            { label: 'Active (30d)', value: '8,294' },
            { label: 'New (7d)', value: '847', change: '+42 vs last wk', up: true },
          ]}
          actions={[
            { label: 'View', onClick: row => alert(`View ${row.name}`) },
            { label: 'Suspend', danger: true, onClick: row => alert(`Suspend ${row.name}`) },
          ]}
        />
      </div>
    </div>
  );
}
