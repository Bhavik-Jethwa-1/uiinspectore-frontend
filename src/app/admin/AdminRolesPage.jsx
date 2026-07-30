import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Shield, Edit2, Trash2, Check, X, Users, Lock } from 'lucide-react';

const ACCENT = '#ef4444';

const ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full unrestricted access to all platform resources',
    color: '#ef4444',
    members: 3,
    isSystem: true,
    permissions: { read: true, write: true, delete: true, admin: true },
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Manage users, content, and platform operations',
    color: '#f97316',
    members: 7,
    isSystem: true,
    permissions: { read: true, write: true, delete: true, admin: false },
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Curate content, moderate users, and review reports',
    color: '#8b5cf6',
    members: 14,
    isSystem: true,
    permissions: { read: true, write: true, delete: false, admin: false },
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    color: '#06b6d4',
    members: 22,
    isSystem: true,
    permissions: { read: true, write: false, delete: false, admin: false },
  },
];

const ALL_PERMISSIONS = [
  { key: 'read',   label: 'Read',   description: 'View data, dashboards, and reports', color: '#06b6d4' },
  { key: 'write',  label: 'Write',  description: 'Create, update, and modify resources', color: '#10b981' },
  { key: 'delete', label: 'Delete', description: 'Permanently remove records and resources', color: '#f59e0b' },
  { key: 'admin',  label: 'Admin',  description: 'Manage roles, billing, and system config', color: '#ef4444' },
];

const RESOURCES = [
  { key: 'users',          label: 'Users' },
  { key: 'projects',       label: 'Projects' },
  { key: 'subscriptions',  label: 'Subscriptions' },
  { key: 'payments',       label: 'Payments' },
  { key: 'ai_models',      label: 'AI Models' },
  { key: 'audit_logs',     label: 'Audit Logs' },
  { key: 'feature_flags',  label: 'Feature Flags' },
  { key: 'settings',       label: 'Settings' },
];

// Detailed permission matrix per role
const PERMISSION_MATRIX = {
  super_admin: { users: ['read','write','delete','admin'], projects: ['read','write','delete','admin'], subscriptions: ['read','write','delete','admin'], payments: ['read','write','delete','admin'], ai_models: ['read','write','delete','admin'], audit_logs: ['read','write','delete','admin'], feature_flags: ['read','write','delete','admin'], settings: ['read','write','delete','admin'] },
  admin:       { users: ['read','write','delete'],           projects: ['read','write','delete'],          subscriptions: ['read','write','delete'],         payments: ['read','write','delete'],       ai_models: ['read','write'],                audit_logs: ['read','write'],              feature_flags: ['read','write'],              settings: ['read','write'] },
  editor:      { users: ['read','write'],                     projects: ['read','write','delete'],          subscriptions: ['read'],                          payments: ['read'],                          ai_models: ['read'],                        audit_logs: ['read'],                        feature_flags: ['read'],                       settings: [] },
  viewer:      { users: ['read'],                              projects: ['read'],                              subscriptions: ['read'],                          payments: ['read'],                          ai_models: ['read'],                        audit_logs: ['read'],                        feature_flags: ['read'],                       settings: [] },
};

function RoleCard({ role, delay, isSelected, onSelect }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={() => onSelect(role.id)}
      className="text-left rounded-2xl border p-5 transition-all w-full"
      style={{
        background: isSelected ? `${role.color}08` : 'rgba(255,255,255,0.02)',
        borderColor: isSelected ? `${role.color}50` : 'rgba(239,68,68,0.1)',
      }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${role.color}20`, border: `1px solid ${role.color}40` }}>
            <Shield size={18} style={{ color: role.color }} />
          </div>
          <div>
            <div className="text-[15px] font-black text-white">{role.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users size={10} className="text-gray-500" />
              <span className="text-[10px] text-gray-500">{role.members} members</span>
              {role.isSystem && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Lock size={9} /> system role
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); alert('Edit role'); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 hover:text-white transition-all">
          <Edit2 size={11} />
        </button>
      </div>
      <p className="text-[11px] text-gray-400">{role.description}</p>

      {/* Permission pills */}
      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        {Object.entries(role.permissions).filter(([k, v]) => v).map(([k]) => {
          const p = ALL_PERMISSIONS.find(x => x.key === k);
          return (
            <span key={k} className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{ background: `${p.color}15`, color: p.color }}>
              {p.label}
            </span>
          );
        })}
      </div>
    </motion.button>
  );
}

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [roles, setRoles] = useState(ROLES);

  const selected = roles.find(r => r.id === selectedRole);
  const matrix = PERMISSION_MATRIX[selectedRole] || {};
  const totalMembers = roles.reduce((s, r) => s + r.members, 0);

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Key size={20} style={{ color: ACCENT }} /> Role-Based Access Control
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Define what each role can do — {roles.length} roles · {totalMembers} total members
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
            style={{ background: ACCENT, color: '#fff' }}>
            <Plus size={14} /> Add Role
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Roles',     value: roles.length.toString(),    icon: Shield,    color: '#8b5cf6' },
            { label: 'Total Members',   value: totalMembers.toString(),    icon: Users,     color: '#06b6d4' },
            { label: 'System Roles',    value: roles.filter(r => r.isSystem).length.toString(), icon: Lock, color: '#f59e0b' },
            { label: 'Custom Roles',    value: roles.filter(r => !r.isSystem).length.toString(), icon: Key, color: '#10b981' },
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

        {/* Role cards */}
        <div>
          <h3 className="text-[14px] font-bold text-white mb-3">Select a role to view permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((r, i) => (
              <RoleCard
                key={r.id}
                role={r}
                delay={i * 0.05}
                isSelected={selectedRole === r.id}
                onSelect={setSelectedRole}
              />
            ))}
          </div>
        </div>

        {/* Permission matrix for selected role */}
        {selected && (
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${selected.color}30` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                  <Shield size={14} style={{ color: selected.color }} />
                  {selected.name} — Permission Matrix
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                  <Edit2 size={11} /> Edit
                </button>
                {!selected.isSystem && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    <Trash2 size={11} /> Delete
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-left">Resource</th>
                    {ALL_PERMISSIONS.map(p => (
                      <th key={p.key} className="px-3 py-2.5 text-center">
                        <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.label}</div>
                        <div className="text-[9px] text-gray-600 font-normal normal-case mt-0.5">{p.description}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map(r => {
                    const perms = matrix[r.key] || [];
                    return (
                      <tr key={r.key} style={{ borderBottom: '1px solid rgba(239,68,68,0.05)' }}>
                        <td className="px-3 py-2.5 text-[12px] font-mono font-bold text-white">{r.label}</td>
                        {ALL_PERMISSIONS.map(p => (
                          <td key={p.key} className="px-3 py-2.5 text-center">
                            {perms.includes(p.key) ? (
                              <span className="inline-flex w-6 h-6 rounded-md items-center justify-center"
                                style={{ background: `${p.color}20` }}>
                                <Check size={13} style={{ color: p.color }} />
                              </span>
                            ) : (
                              <span className="inline-flex w-6 h-6 rounded-md items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <X size={12} className="text-gray-700" />
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}