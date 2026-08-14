import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import {
  Search, Loader2, AlertCircle, Eye,
  ChevronLeft, ChevronRight, X, Copy, Check,
  ShieldCheck, RefreshCw,
  UserX, UserCheck, UserCog, Trash2, Users
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
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>

        {/* Gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, #5B5FEF 0%, #8B5CF6 100%)',
          padding: '24px 20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <Avatar name={user.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>{user.name}</p>
              {user.is_admin && (
                <div style={{
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: 9999,
                  padding: '1px 7px',
                  fontSize: 10, fontWeight: 700,
                  color: 'white', letterSpacing: '0.04em',
                }}>ADMIN</div>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{user.email}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border)',
        }}>
          {[
            { label: 'Projects', value: user.projects_count ?? 0, color: 'var(--primary)' },
            { label: 'Reviews', value: user.reviews_count ?? 0, color: 'var(--primary)' },
            { label: 'Status', value: user.is_active ? 'Active' : 'Suspended', color: user.is_active ? 'var(--success)' : 'var(--error)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: '14px 12px',
              textAlign: 'center',
              borderRight: label !== 'Status' ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 2, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'User ID',    value: `#${user.id}` },
            { label: 'Created',    value: formatDate(user.created_at) },
            ...(user.last_activity ? [{ label: 'Last Active', value: formatDate(user.last_activity) }] : []),
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          padding: '14px 16px 16px',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {user.is_active ? (
            <button
              onClick={() => onAction('suspend')}
              disabled={actionLoading}
              style={{
                flex: 1, minWidth: 80,
                padding: '0.5rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                opacity: actionLoading ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              <UserX size={13} /> Suspend
            </button>
          ) : (
            <button
              onClick={() => onAction('activate')}
              disabled={actionLoading}
              style={{
                flex: 1, minWidth: 80,
                padding: '0.5rem',
                borderRadius: 8,
                border: '1px solid var(--success)',
                background: 'var(--success-light)',
                color: 'var(--success)',
                fontSize: 12, fontWeight: 600,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                opacity: actionLoading ? 0.5 : 1,
              }}
            >
              <UserCheck size={13} /> Activate
            </button>
          )}
          <button
            onClick={() => onAction('toggle_role')}
            disabled={actionLoading}
            style={{
              flex: 1, minWidth: 80,
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            <UserCog size={13} /> {user.is_admin ? 'Make User' : 'Make Admin'}
          </button>
          <button
            onClick={() => onAction('delete')}
            disabled={actionLoading}
            style={{
              flex: 1, minWidth: 80,
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'var(--error-light)',
              color: 'var(--error)',
              fontSize: 12, fontWeight: 600,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              opacity: actionLoading ? 0.5 : 1,
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(null);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        search: debouncedSearch,
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
  }, [token, debouncedSearch]);

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

  const handleDeleteFromTable = (user) => {
    setDeleteUserTarget(user);
    setConfirmModal({
      type: 'delete_user',
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}" (${user.email})? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      userId: user.id,
    });
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
      setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
      if (action === 'suspend') addToast({ type: 'success', message: 'User suspended' });
      else if (action === 'activate') addToast({ type: 'success', message: 'User activated' });
      else if (action === 'toggle_role') addToast({ type: 'success', message: data.user.is_admin ? 'User promoted to admin' : 'Admin demoted to user' });
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
    if (confirmModal.type === 'delete' || confirmModal.type === 'delete_user') {
      setActionLoading(true);
      try {
        const userId = confirmModal.type === 'delete_user' ? confirmModal.userId : selectedUser.id;
        const data = await api.adminDeleteUser(userId, token);
        if (data.message?.includes('last administrator')) {
          setConfirmModal({
            type: 'error', title: 'Action Blocked', message: data.message, confirmLabel: 'OK', variant: 'danger',
          });
          setActionLoading(false);
          return;
        }
        setConfirmModal(null);
        if (confirmModal.type === 'delete') {
          setSelectedUser(null);
        }
        setDeleteUserTarget(null);
        fetchUsers(page);
        addToast({ type: 'success', message: 'User deleted successfully' });
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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      } else {
        const el = document.createElement('textarea');
        el.value = email;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
    } catch {}
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  // ===== RENDER =====
  return (
    <div className="admin-page" style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="admin-page-content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', maxWidth: '100%' }}>

        {/* Header */}
        <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, width: '100%', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--primary)', padding: '8px 12px', borderRadius: 10 }}>
              <Users size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                All Users
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? (
                  <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
                ) : (
                  <>
                    <span style={{ background: 'var(--primary)', color: '#fff', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {total}
                    </span>
                    <span>user{total !== 1 ? 's' : ''} total</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchUsers(page)}
            className="admin-btn-icon"
            title="Refresh"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 8 }}
          >
            <RefreshCw size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search */}
        <div className="admin-search" style={{ marginBottom: 14, width: '100%', maxWidth: '100%' }}>
          <div className="admin-search-wrapper" style={{ position: 'relative' }}>
            <Search size={13} className="admin-search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="admin-search-input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)', fontSize: 13, width: '100%' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading users…</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" onClick={() => fetchUsers(1)}>Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <Eye size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No results found' : 'No users yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No users matching "${search}"` : 'Users will appear here once they register'}
            </p>
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
            <div className="admin-table-scroll" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Email', 'Role', 'Status', 'Projects', 'Reviews', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', fontSize: 10, fontWeight: 600,
                      color: 'var(--text-muted)', textAlign: 'left',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: 'var(--background)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    {/* User */}
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} size={30} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{u.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span title={u.email} style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {u.email}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); copyEmail(u.email); }} className="btn-icon" style={{ padding: 2, flexShrink: 0 }} title="Copy email">
                          {copiedEmail === u.email ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Copy size={11} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                      </div>
                    </td>
                    {/* Role */}
                    <td style={{ padding: '11px 12px' }}>
                      {u.is_admin
                        ? <Badge variant="purple"><ShieldCheck size={10} />Admin</Badge>
                        : <Badge variant="gray">User</Badge>}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '11px 12px' }}>
                      {u.is_active
                        ? <Badge variant="green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', flexShrink: 0 }} />Active</Badge>
                        : <Badge variant="red"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--error)', display: 'inline-block', flexShrink: 0 }} />Suspended</Badge>}
                    </td>
                    {/* Projects */}
                    <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', textAlign: 'center' }}>
                      {u.projects_count ?? 0}
                    </td>
                    {/* Reviews */}
                    <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', textAlign: 'center' }}>
                      {u.reviews_count ?? 0}
                    </td>
                    {/* Created */}
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(u.created_at)}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '11px 12px', minWidth: 80, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => navigate(`/admin/users/${u.id}`)} className="btn-icon" title="View" style={{ padding: 6 }}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleDeleteFromTable(u)} className="btn-icon" title="Delete" style={{ color: 'var(--error)', padding: 6 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Page {page} of {totalPages} · {total} users
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}>
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}>
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
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

    </div>
  );
}
