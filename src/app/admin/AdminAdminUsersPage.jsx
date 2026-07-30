import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { UserCog, Plus, Shield, Mail, Clock, Activity, Key, Edit2, UserX, UserCheck } from 'lucide-react';

const ACCENT = '#ef4444';

const ROLE_COLORS = {
  'Super Admin': { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  'Admin':       { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  'Editor':      { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  'Viewer':      { bg: 'rgba(6,182,212,0.15)',  color: '#06b6d4' },
};

const STATUS_COLORS = {
  active:   '#10b981',
  inactive: '#9ca3af',
  locked:   '#ef4444',
};

const ADMIN_USERS = [
  { id: 1, name: 'Aria Montgomery',  email: 'aria@uiinspectore.com',   role: 'Super Admin', status: 'active',   lastLogin: '2026-07-24 09:42', loginCount: 1842, mfaEnabled: true,  created: '2024-08-12' },
  { id: 2, name: 'Marcus Thornton',  email: 'marcus@uiinspectore.com',  role: 'Admin',       status: 'active',   lastLogin: '2026-07-24 08:18', loginCount: 942,  mfaEnabled: true,  created: '2024-09-21' },
  { id: 3, name: 'Alex Kovacs',      email: 'alex@uiinspectore.com',    role: 'Admin',       status: 'active',   lastLogin: '2026-07-23 22:11', loginCount: 624,  mfaEnabled: true,  created: '2024-11-04' },
  { id: 4, name: 'Sarah Lin',        email: 'sarah.lin@uiinspectore.com', role: 'Admin',     status: 'active',   lastLogin: '2026-07-23 17:05', loginCount: 480,  mfaEnabled: true,  created: '2025-01-15' },
  { id: 5, name: 'David Park',       email: 'david@uiinspectore.com',   role: 'Editor',      status: 'active',   lastLogin: '2026-07-24 07:30', loginCount: 284,  mfaEnabled: true,  created: '2025-03-22' },
  { id: 6, name: 'Lena Brooks',      email: 'lena@uiinspectore.com',    role: 'Editor',      status: 'active',   lastLogin: '2026-07-23 14:22', loginCount: 198,  mfaEnabled: false, created: '2025-04-18' },
  { id: 7, name: 'Hiroshi Sato',     email: 'hiroshi@uiinspectore.com', role: 'Editor',      status: 'active',   lastLogin: '2026-07-22 11:07', loginCount: 142,  mfaEnabled: true,  created: '2025-05-30' },
  { id: 8, name: 'Maya Singh',       email: 'maya@uiinspectore.com',    role: 'Viewer',      status: 'active',   lastLogin: '2026-07-24 06:15', loginCount: 88,   mfaEnabled: true,  created: '2025-07-09' },
  { id: 9, name: 'Tom Reynolds',     email: 'tom@uiinspectore.com',     role: 'Viewer',      status: 'inactive', lastLogin: '2026-06-14 16:42', loginCount: 24,   mfaEnabled: false, created: '2025-09-01' },
  { id: 10, name: 'Nina Patel',      email: 'nina@uiinspectore.com',    role: 'Viewer',      status: 'active',   lastLogin: '2026-07-23 09:14', loginCount: 56,   mfaEnabled: true,  created: '2025-10-22' },
];

const FIELDS = [
  { key: 'name', label: 'Admin User', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {row.name.split(' ').map(n => n[0]).join('').slice(0,2)}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-white flex items-center gap-1.5">
          {v}
          {row.mfaEnabled && (
            <span title="2FA enabled" className="text-green-400">
              <Key size={9} />
            </span>
          )}
        </div>
        <div className="text-[10px] text-gray-500">{row.email}</div>
      </div>
    </div>
  )},
  { key: 'role', label: 'Role', sortable: true, render: v => {
    const r = ROLE_COLORS[v] || { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' };
    return (
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1"
        style={{ background: r.bg, color: r.color }}>
        <Shield size={9} />
        {v}
      </span>
    );
  }},
  { key: 'lastLogin', label: 'Last Login', sortable: true, render: v => (
    <div>
      <div className="text-[11px] text-white font-mono">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      <div className="text-[10px] text-gray-500 font-mono">{new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  )},
  { key: 'loginCount', label: 'Logins', sortable: true, render: v => (
    <span className="text-[12px] font-bold text-white">{v.toLocaleString()}</span>
  )},
  { key: 'mfaEnabled', label: 'MFA', render: v => (
    v
      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Enabled</span>
      : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Disabled</span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
];

export default function AdminAdminUsersPage() {
  const [admins, setAdmins] = useState(ADMIN_USERS);
  const [loading] = useState(false);

  const activeCount = ADMIN_USERS.filter(a => a.status === 'active').length;
  const mfaCount = ADMIN_USERS.filter(a => a.mfaEnabled).length;
  const superAdminCount = ADMIN_USERS.filter(a => a.role === 'Super Admin').length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <UserCog size={20} style={{ color: ACCENT }} /> Admin Users
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Manage internal team members with admin panel access
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Invite Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Admins',  value: ADMIN_USERS.length.toString(),     icon: UserCog,    color: '#8b5cf6' },
            { label: 'Active',        value: activeCount.toString(),             icon: UserCheck,  color: '#10b981' },
            { label: 'MFA Enabled',   value: `${mfaCount}/${ADMIN_USERS.length}`, icon: Key,      color: '#06b6d4' },
            { label: 'Super Admins',  value: superAdminCount.toString(),         icon: Shield,     color: '#ef4444' },
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

        {/* Security alert if any admin lacks MFA */}
        {mfaCount < ADMIN_USERS.length && (
          <div className="rounded-2xl border p-4 flex items-center gap-3"
            style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <Shield size={18} className="text-yellow-400 shrink-0" />
            <div className="flex-1">
              <div className="text-[12px] font-bold text-white">
                {ADMIN_USERS.length - mfaCount} admin{ADMIN_USERS.length - mfaCount !== 1 ? 's' : ''} without MFA enabled
              </div>
              <div className="text-[11px] text-gray-500">
                Multi-factor authentication is strongly recommended for all admin accounts
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
              Enforce MFA
            </button>
          </div>
        )}

        {/* Admin users table */}
        <AdminTable
          title="All Admin Users"
          subtitle="Internal team members with admin panel access"
          fields={FIELDS}
          data={admins}
          loading={loading}
          searchable
          searchPlaceholder="Search by name or email…"
          exportable
          stats={[
            { label: 'Active',       value: activeCount.toString() },
            { label: 'Inactive',     value: ADMIN_USERS.filter(a => a.status === 'inactive').length.toString() },
            { label: 'MFA Enabled',  value: `${mfaCount}/${ADMIN_USERS.length}` },
            { label: 'Super Admins', value: superAdminCount.toString() },
          ]}
          actions={[
            { label: 'Edit',   onClick: row => alert(`Edit ${row.name}`) },
            { label: 'Reset',  onClick: row => alert(`Reset password for ${row.name}`) },
            { label: 'Remove', danger: true, onClick: row => alert(`Remove ${row.name}`) },
          ]}
        />
      </div>
    </div>
  );
}