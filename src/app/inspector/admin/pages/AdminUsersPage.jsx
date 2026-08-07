import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, RefreshCw, Shield, ShieldOff,
  Trash2, Eye, EyeOff, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Loader2, X
} from 'lucide-react';

const ACCENT = '#7c5cff';
const ADMIN_ACCENT = '#ef4444';

function StatusBadge({ status }) {
  const configs = {
    active:    { color: '#22c55e', label: 'Active' },
    suspended:  { color: '#ef4444', label: 'Suspended' },
    pending:    { color: '#f59e0b', label: 'Pending' },
  };
  const cfg = configs[status] || configs.pending;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {status === 'active' && <CheckCircle size={10} />}
      {status === 'suspended' && <XCircle size={10} />}
      {status === 'pending' && <AlertCircle size={10} />}
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const configs = {
    admin:       { color: '#ef4444', label: 'Admin' },
    super_admin:  { color: '#f97316', label: 'Super Admin' },
    user:         { color: ACCENT, label: 'User' },
  };
  const cfg = configs[role] || configs.user;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        </td>
      ))}
    </tr>
  );
}

function UserModal({ user, onClose, onUpdate }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('inspector_token');
      const res = await fetch(`/api/admin/inspector/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onUpdate();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>Edit User</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border text-[13px]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              type="email"
              className="w-full px-3 py-2 rounded-xl border text-[13px]"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-[13px]"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border text-[13px]"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
              style={{ background: ACCENT, color: '#fff' }}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const perPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('inspector_token');
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/inspector/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Admin access required');
        if (res.status === 404) throw new Error('Endpoint not found');
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setUsers(json.users || []);
      setTotal(json.total || 0);
      setTotalPages(json.total_pages || Math.ceil((json.total || 0) / perPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('inspector_token');
      const res = await fetch(`/api/admin/inspector/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('inspector_token');
      const res = await fetch(`/api/admin/inspector/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Users</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${total} total users`}
          </p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ background: 'rgba(124,92,255,0.1)', color: ACCENT }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-[13px]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.05)' }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-red-400">{error}</p>
          </div>
          <button onClick={fetchUsers} className="text-[11px] underline" style={{ color: 'var(--text-muted)' }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['User', 'Role', 'Status', 'Joined', 'Projects', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b last:border-0 transition-colors hover:opacity-80"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                          style={{ background: user.role === 'admin' || user.role === 'super_admin' ? ADMIN_ACCENT : ACCENT }}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{user.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium" style={{ color: 'var(--text)' }}>
                      {user.projects_count || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                          style={{ color: ACCENT, background: 'rgba(124,92,255,0.1)' }}
                          title="Edit">
                          <Eye size={14} />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleAction(user.id, 'suspend')}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-50"
                            style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
                            title="Suspend">
                            <ShieldOff size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user.id, 'activate')}
                            disabled={actionLoading === user.id}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-50"
                            style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}
                            title="Activate">
                            <Shield size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-50"
                          style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border transition-opacity disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border transition-opacity disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}
