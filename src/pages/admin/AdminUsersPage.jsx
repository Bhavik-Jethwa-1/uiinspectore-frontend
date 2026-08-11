// ADMIN_TEST_UNIQUE_987654321
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../utils/api';
import {
  Search, Loader2, AlertCircle, Eye, Trash2,
  ChevronLeft, ChevronRight, X, Copy, Check,
  UserCog, UserX, UserCheck, ShieldCheck, RefreshCw,
  ChevronDown, Users, Filter
} from 'lucide-react';

const DEBOUNCE_MS = 300;

function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function Avatar({ name, size = 32 }) {
  const initial = name?.[0]?.toUpperCase() || 'U';
  const colors = ['#5B5FEF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
  const color = colors[initial.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.38, fontWeight: 700, color }}>{initial}</span>
    </div>
  );
}

function Badge({ children, variant = 'gray' }) {
  const styles = {
    gray:   { background: 'var(--hover)',        color: 'var(--text-secondary)' },
    green:  { background: 'var(--success-light)',  color: 'var(--success)' },
    red:    { background: 'var(--error-light)',   color: 'var(--error)' },
    purple: { background: 'var(--primary-light)', color: 'var(--primary)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      ...(styles[variant] || styles.gray),
    }}>
      {children}
    </span>
  );
}

function ConfirmModal({ title, message, confirmLabel = 'Confirm', variant = 'danger', onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '1.5rem',
        maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-md)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn-secondary" disabled={loading}
            style={{ padding: '0.5rem 1rem', fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              background: variant === 'danger' ? 'var(--error)' : 'var(--primary)',
              color: '#fff', border: 'none', opacity: loading ? 0.6 : 1,
            }}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({ user, onClose, onAction, actionLoading }) {
  if (!user) return null;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', width: '100%', maxWidth: 440,
        boxShadow: 'var(--shadow-md)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user.name} size={40} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Email', value: user.email },
            { label: 'Role', value: user.is_admin ? <Badge variant="purple"><ShieldCheck size={10} />Admin</Badge> : <Badge variant="gray">User</Badge> },
            { label: 'Status', value: user.is_active ? <Badge variant="green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />Active</Badge> : <Badge variant="red"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }} />Suspended</Badge> },
            { label: 'Created', value: formatDate(user.created_at) },
            { label: 'Projects', value: user.projects_count ?? 0 },
            { label: 'Reviews', value: user.reviews_count ?? 0 },
            ...(user.last_activity ? [{ label: 'Last Activity', value: formatDate(user.last_activity) }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '0.75rem 1.25rem 1.25rem', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
          {user.is_active ? (
            <button
              className="btn-secondary" onClick={() => onAction('suspend')}
              disabled={actionLoading}
              style={{ fontSize: 12, padding: '0.4rem 0.875rem' }}
            >
              <UserX size={12} /> Suspend
            </button>
          ) : (
            <button
              className="btn-secondary" onClick={() => onAction('activate')}
              disabled={actionLoading}
              style={{ fontSize: 12, padding: '0.4rem 0.875rem' }}
            >
              <UserCheck size={12} /> Activate
            </button>
          )}
          <button
            className="btn-secondary" onClick={() => onAction('toggle_role')}
            disabled={actionLoading}
            style={{ fontSize: 12, padding: '0.4rem 0.875rem' }}
          >
            <UserCog size={12} /> {user.is_admin ? 'Make User' : 'Make Admin'}
          </button>
          <button
            onClick={() => onAction('delete')}
            disabled={actionLoading}
            style={{
              marginLeft: 'auto', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)',
              fontSize: 12, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
              background: 'var(--error-light)', color: 'var(--error)',
              border: '1px solid rgba(239,68,68,0.2)', opacity: actionLoading ? 0.6 : 1,
            }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none', padding: '0.35rem 2rem 0.35rem 0.625rem',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-primary)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={11} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

console.log("ADMIN_USERS_PAGE_LOADED"); console.log("ADMIN_USERS_PAGE_RENDERING"); export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, role, status, sort]);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        search: debouncedSearch,
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined,
        sort,
        page: pageNum,
      };
      const data = await api.adminGetUsers(token, params);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.last_page);
      setPage(data.current_page);
    } catch (e) {
      setError(e.message || 'Unable to load users. Try again.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, role, status, sort]);

  useEffect(() => { fetchUsers(page); }, [fetchUsers, page]);

  const fetchUserDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await api.adminGetUser(id, token);
      setSelectedUser(data.user);
    } catch (e) {
      setError(e.message || 'Unable to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (action === 'delete') {
        setConfirmModal({
          type: 'delete',
          title: 'Delete User',
          message: 'This will permanently delete the user and associated data.',
          confirmLabel: 'Delete',
          variant: 'danger',
        });
        setActionLoading(false);
        return;
      }
      const payload = {};
      if (action === 'suspend') payload.is_active = false;
      else if (action === 'activate') payload.is_active = true;
      else if (action === 'toggle_role') payload.is_admin = !selectedUser.is_admin;

      const data = await api.adminUpdateUser(selectedUser.id, payload, token);

      if (data.message?.includes('last administrator')) {
        setConfirmModal({
          type: 'error',
          title: 'Action Blocked',
          message: data.message,
          confirmLabel: 'OK',
          variant: 'danger',
        });
        setActionLoading(false);
        return;
      }

      setSelectedUser(data.user);
      // Update user in list
      setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
    } catch (e) {
      setConfirmModal({
        type: 'error',
        title: 'Action Failed',
        message: e.message || 'Something went wrong.',
        confirmLabel: 'OK',
        variant: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'error') {
      setConfirmModal(null);
      return;
    }
    if (confirmModal.type === 'delete') {
      setActionLoading(true);
      try {
        const data = await api.adminDeleteUser(selectedUser.id, token);
        if (data.message?.includes('last administrator')) {
          setConfirmModal({
            type: 'error', title: 'Action Blocked', message: data.message, confirmLabel: 'OK', variant: 'danger',
          });
          setActionLoading(false);
          return;
        }
        setConfirmModal(null);
        setSelectedUser(null);
        fetchUsers(page);
      } catch (e) {
        setConfirmModal({
          type: 'error', title: 'Delete Failed', message: e.message || 'Could not delete user.', confirmLabel: 'OK', variant: 'danger',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  // ===== RENDER =====
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              Users
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {loading ? '…' : `${total} user${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button
            onClick={() => fetchUsers(page)}
            className="btn-icon"
            title="Refresh"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <RefreshCw size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email or ID…"
              className="input"
              style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)', fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <SelectFilter label="Role" value={role}
              options={[{ value: 'all', label: 'All' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]}
              onChange={setRole} />
            <SelectFilter label="Status" value={status}
              options={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]}
              onChange={setStatus} />
            <SelectFilter label="Sort" value={sort}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'name_asc', label: 'Name A-Z' },
                { value: 'name_desc', label: 'Name Z-A' },
              ]}
              onChange={setSort} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading users…</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <AlertCircle size={18} style={{ color: 'var(--error)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
            <button onClick={() => fetchUsers(page)} className="btn-primary" style={{ fontSize: 13, padding: '0.5rem 1.25rem' }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No users found' : 'No users yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No users matching "${search}"` : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="card" style={{ overflow: 'hidden', display: 'none', ['@media (minWidth: 768px)']: { display: 'block' } }}
              className="hide-mobile">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Email', 'Role', 'Status', 'Projects', 'Reviews', 'Created', ''].map(h => (
                        <th key={h} style={{
                          padding: '10px 12px', fontSize: 10, fontWeight: 600,
                          color: 'var(--text-muted)', textAlign: 'left',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          background: 'var(--background)', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {/* User */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={u.name} size={30} />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.name}</p>
                              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>#{u.id}</p>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {u.email}
                            </span>
                            <button
                              onClick={() => copyEmail(u.email)}
                              className="btn-icon"
                              style={{ padding: 2, flexShrink: 0 }}
                              title="Copy email"
                            >
                              {copiedEmail === u.email ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Copy size={11} style={{ color: 'var(--text-muted)' }} />}
                            </button>
                          </div>
                        </td>
                        {/* Role */}
                        <td style={{ padding: '10px 12px' }}>
                          {u.is_admin
                            ? <Badge variant="purple"><ShieldCheck size={10} />Admin</Badge>
                            : <Badge variant="gray">User</Badge>}
                        </td>
                        {/* Status */}
                        <td style={{ padding: '10px 12px' }}>
                          {u.is_active
                            ? <Badge variant="green"><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />Active</Badge>
                            : <Badge variant="red"><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--error)', display: 'inline-block' }} />Suspended</Badge>}
                        </td>
                        {/* Projects */}
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                          {u.projects_count ?? 0}
                        </td>
                        {/* Reviews */}
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                          {u.reviews_count ?? 0}
                        </td>
                        {/* Created */}
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(u.created_at)}
                        </td>
                        {/* Actions */}
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => fetchUserDetail(u.id)}
                            className="btn-icon"
                            title="View"
                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="show-mobile-only">
              {users.map(u => (
                <div key={u.id} className="card" style={{ padding: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={34} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{u.id} · {formatDate(u.created_at)}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {u.is_admin ? <Badge variant="purple"><ShieldCheck size={10} />Admin</Badge> : <Badge variant="gray">User</Badge>}
                      {u.is_active ? <Badge variant="green">Active</Badge> : <Badge variant="red">Suspended</Badge>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{u.projects_count ?? 0}</span> projects ·{' '}
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{u.reviews_count ?? 0}</span> reviews
                      </span>
                    </div>
                    <button onClick={() => fetchUserDetail(u.id)} className="btn-primary" style={{ fontSize: 11, padding: '0.3rem 0.75rem' }}>
                      <Eye size={11} /> View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Page {page} of {totalPages} · {total} users
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: 12 }}
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: 12 }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={detailLoading ? { ...selectedUser } : selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={handleUserAction}
          actionLoading={actionLoading}
        />
      )}

      {/* Confirm / Error Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          variant={confirmModal.variant}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <style>{`
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
          .show-mobile-only { display: flex !important; }
        }
        @media (min-width: 768px) {
          .hide-mobile { display: table !important; }
          .show-mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
