import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import {
  Search, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Copy, Check,
  ShieldCheck, RefreshCw, X,
  UserX, UserCheck, UserCog, Trash2, Users, ChevronDown, User,
  MoreHorizontal, Ban, LogIn
} from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import ConfirmModal from '../../components/ConfirmModal';

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

function Badge({ children, variant = 'gray', dot = false }) {
  const styles = {
    gray:   { background: 'var(--hover)',        color: 'var(--text-secondary)' },
    green:  { background: 'var(--success-light)',  color: 'var(--success)' },
    red:    { background: 'var(--error-light)',   color: 'var(--error)' },
    purple: { background: 'var(--primary-light)', color: 'var(--primary)' },
    yellow: { background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 4,
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      ...(styles[variant] || styles.gray),
    }}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'currentColor', flexShrink: 0,
      }} />}
      {children}
    </span>
  );
}

function OverflowMenu({ user, onAction, actionLoading, currentUserId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isSelf = currentUserId === user.id;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    // Defer listener so the click that opened the menu doesn't immediately close it
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const items = [
    {
      label: 'View Details',
      icon: <Eye size={13} />,
      onClick: () => { onAction('view'); setOpen(false); },
      disabled: false,
    },
    { divider: true },
    user.is_active ? {
      label: 'Suspend Account',
      icon: <Ban size={13} />,
      onClick: () => { onAction('suspend'); setOpen(false); },
      disabled: actionLoading || isSelf,
      variant: 'danger',
    } : {
      label: 'Activate Account',
      icon: <UserCheck size={13} />,
      onClick: () => { onAction('activate'); setOpen(false); },
      disabled: actionLoading,
      variant: 'success',
    },
    {
      label: user.is_admin ? 'Remove Admin' : 'Make Admin',
      icon: <UserCog size={13} />,
      onClick: () => { onAction('toggle_role'); setOpen(false); },
      disabled: actionLoading || isSelf,
      variant: 'default',
    },
    { divider: true },
    user.allow_login === false ? {
      label: 'Allow Login',
      icon: <LogIn size={13} />,
      onClick: () => { onAction('allow_login'); setOpen(false); },
      disabled: actionLoading || isSelf,
      variant: 'default',
    } : {
      label: 'Block Login',
      icon: <Ban size={13} />,
      onClick: () => { onAction('block_login'); setOpen(false); },
      disabled: actionLoading || isSelf,
      variant: 'warning',
    },
    { divider: true },
    {
      label: 'Delete User',
      icon: <Trash2 size={13} />,
      onClick: () => { onAction('delete'); setOpen(false); },
      disabled: actionLoading || isSelf,
      variant: 'danger',
    },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="btn-icon"
        title="More actions"
        aria-label="More actions"
        aria-expanded={open}
        style={{ padding: 5 }}
      >
        <MoreHorizontal size={14} />
      </button>
      {open && createPortal((
        <div
          ref={node => {
            // Position dropdown below the button
            if (node && ref.current) {
              const btn = ref.current.getBoundingClientRect();
              node.style.top = `${btn.bottom + 4}px`;
              node.style.right = `${window.innerWidth - btn.right}px`;
              node.style.left = 'auto';
            }
          }}
          style={{
            position: 'fixed', zIndex: 9999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            minWidth: 180, padding: '4px',
          }}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={`div-${i}`} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                disabled={item.disabled}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'transparent', fontSize: 12, fontWeight: 600,
                  color: item.disabled ? 'var(--text-muted)' :
                    item.variant === 'danger' ? 'var(--error)' :
    item.variant === 'success' ? 'var(--success)' :
    item.variant === 'warning' ? 'var(--warning)' :
    'var(--text-primary)',
                  opacity: item.disabled ? 0.5 : 1,
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      ), document.body)}
    </div>
  );
}

function UserDetailModal({ user, onClose, onAction, actionLoading, currentUserId }) {
  if (!user) return null;
  const isSelf = currentUserId === user.id;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const formatRelative = (d) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(d);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16,
        border: '1px solid var(--border)',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Gradient header */}
        <div style={{
          background: 'var(--primary)',
          padding: '24px 20px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Avatar name={user.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>{user.name}</p>
              {user.is_admin && (
                <div style={{
                  background: 'rgba(255,255,255,0.25)', borderRadius: 9999, padding: '1px 7px',
                  fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.04em',
                }}>ADMIN</div>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
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
            { label: 'Last Active', value: formatRelative(user.last_activity), color: 'var(--text-secondary)' },
          ].map(({ label, value, color }, i, arr) => (
            <div key={label} style={{
              padding: '14px 12px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color, marginBottom: 2, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Info rows */}
        <div style={{ padding: '4px 20px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'User ID', value: `#${user.id}` },
            { label: 'Created', value: formatDate(user.created_at) },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Status badges row */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {user.is_active
            ? <Badge variant="green" dot>Active</Badge>
            : <Badge variant="red" dot>Suspended</Badge>}
          {user.allow_login !== false
            ? <Badge variant="green" dot>Login Allowed</Badge>
            : <Badge variant="yellow" dot>Login Blocked</Badge>}
        </div>

        {/* Self-protection banner */}
        {isSelf && (
          <div style={{
            margin: '0 16px 12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 2 }}>
              This is your current admin account.
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
              Self-destructive and privilege-changing actions are disabled.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '14px 16px 16px', display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {user.is_active ? (
            <button onClick={() => onAction('suspend')} disabled={actionLoading || isSelf}
              title={isSelf ? 'You cannot change your own status' : undefined}
              style={{
                flex: 1, minWidth: 80, padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, cursor: actionLoading || isSelf ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                opacity: actionLoading || isSelf ? 0.5 : 1,
              }}>
              <UserX size={13} /> Suspend
            </button>
          ) : (
            <button onClick={() => onAction('activate')} disabled={actionLoading || isSelf}
              style={{
                flex: 1, minWidth: 80, padding: '0.5rem', borderRadius: 8, border: '1px solid var(--success)',
                background: 'var(--success-light)', color: 'var(--success)',
                fontSize: 12, fontWeight: 600, cursor: actionLoading || isSelf ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                opacity: actionLoading || isSelf ? 0.5 : 1,
              }}>
              <UserCheck size={13} /> Activate
            </button>
          )}
          <button onClick={() => onAction('toggle_role')} disabled={actionLoading || isSelf}
            style={{
              flex: 1, minWidth: 80, padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: actionLoading || isSelf ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              opacity: actionLoading || isSelf ? 0.5 : 1,
            }}>
            <UserCog size={13} /> {user.is_admin ? 'Make User' : 'Make Admin'}
          </button>
          {!isSelf && (
            <button onClick={() => onAction('delete')} disabled={actionLoading}
              style={{
                flex: 1, minWidth: 80, padding: '0.5rem', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'var(--error-light)', color: 'var(--error)',
                fontSize: 12, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                opacity: actionLoading ? 0.5 : 1,
              }}>
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {label && <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            padding: '0.35rem 2rem 0.35rem 0.625rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer', outline: 'none',
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={10} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const { addToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(null);

  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // Sync state → URL params
  const syncToUrl = useCallback((overrides = {}) => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (role !== 'all') params.role = role;
    if (status !== 'all') params.status = status;
    if (sort !== 'newest') params.sort = sort;
    if ((overrides.page || page) > 1) params.page = overrides.page || page;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, role, status, sort, page]);

  // Sync state → URL on filter/sort/search changes
  useEffect(() => {
    setPage(1);
    syncToUrl({ page: 1 });
  }, [debouncedSearch, role, status, sort]);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum };
      if (debouncedSearch) params.search = debouncedSearch;
      if (role !== 'all') params.role = role;
      if (status !== 'all') params.status = status;
      if (sort !== 'newest') params.sort = sort;
      const data = await api.adminGetUsers(token, params);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.last_page);
      setPage(data.current_page);
    } catch (e) {
      setError(e.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, role, status, sort]);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    setPage(pageFromUrl);
    fetchUsers(pageFromUrl);
  }, [searchParams]);

  const fetchUserDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await api.adminGetUser(id, token);
      setSelectedUser(data.user);
    } catch (e) {
      addToast({ type: 'error', message: 'Unable to load user details.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteFromTable = (user) => {
    setConfirmModal({
      type: 'delete_user',
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      details: [
        { label: 'User', value: user.name },
        { label: 'Email', value: user.email },
      ],
      confirmLabel: 'Delete',
      variant: 'danger',
      userId: user.id,
      userName: user.name,
    });
  };

  const handleUserAction = async (action) => {
    if (!selectedUser) return;

    if (action === 'view') {
      navigate(`/admin/users/${selectedUser.id}`);
      return;
    }

    if (action === 'delete') {
      setConfirmModal({
        type: 'delete',
        title: 'Delete User',
        message: `Are you sure you want to delete "${selectedUser.name}"? This will permanently remove this account and all associated data. This action cannot be undone.`,
        details: [
          { label: 'User', value: selectedUser.name },
          { label: 'Email', value: selectedUser.email },
        ],
        confirmLabel: 'Delete',
        variant: 'danger',
      });
      return;
    }

    if (action === 'allow_login' || action === 'block_login') {
      const willBlock = action === 'block_login';
      setConfirmModal({
        type: 'allow_login',
        title: willBlock ? 'Block Login?' : 'Allow Login?',
        message: willBlock
          ? `"${selectedUser.name}" will no longer be able to sign in. They can be unblocked at any time.`
          : `"${selectedUser.name}" will be able to sign in again.`,
        details: [
          { label: 'User', value: selectedUser.name },
          { label: 'Email', value: selectedUser.email },
        ],
        confirmLabel: willBlock ? 'Block Login' : 'Allow Login',
        variant: 'warning',
        action,
        userName: selectedUser.name,
      });
      return;
    }

    if (action === 'suspend') {
      setConfirmModal({
        type: 'suspend',
        title: 'Suspend User',
        message: `Are you sure you want to suspend "${selectedUser.name}"? They will no longer be able to access the application.`,
        details: [
          { label: 'User', value: selectedUser.name },
          { label: 'Email', value: selectedUser.email },
        ],
        confirmLabel: 'Suspend',
        variant: 'danger',
      });
      return;
    }

    if (action === 'activate') {
      setConfirmModal({
        type: 'activate',
        title: 'Activate User',
        message: `Are you sure you want to activate "${selectedUser.name}"? They will regain access to the application.`,
        details: [
          { label: 'User', value: selectedUser.name },
          { label: 'Email', value: selectedUser.email },
        ],
        confirmLabel: 'Activate',
        variant: 'primary',
      });
      return;
    }

    if (action === 'toggle_role') {
      setConfirmModal({
        type: 'toggle_role',
        title: 'Change User Role',
        message: selectedUser.is_admin
          ? `Are you sure you want to remove admin privileges from "${selectedUser.name}"? They will become a regular user.`
          : `Are you sure you want to make "${selectedUser.name}" an administrator? They will have full access to the Admin Panel.`,
        details: [
          { label: 'User', value: selectedUser.name },
          { label: 'Current Role', value: selectedUser.is_admin ? 'Admin' : 'User' },
          { label: 'New Role', value: selectedUser.is_admin ? 'User' : 'Admin' },
        ],
        confirmLabel: 'Change Role',
        variant: 'warning',
      });
      return;
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'error') { setConfirmModal(null); return; }
    setActionLoading(true);
    try {
      if (confirmModal.type === 'delete' || confirmModal.type === 'delete_user') {
        const userId = confirmModal.type === 'delete_user' ? confirmModal.userId : selectedUser?.id;
        await api.adminDeleteUser(userId, token);
        setConfirmModal(null);
        setSelectedUser(null);
        fetchUsers(page);
        addToast({ type: 'success', message: `User deleted successfully.` });
        return;
      }
      if (confirmModal.type === 'allow_login') {
        const newVal = confirmModal.action === 'block_login' ? false : true;
        const data = await api.adminUpdateUser(selectedUser.id, { allow_login: newVal }, token);
        setSelectedUser(data.user);
        setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
        setConfirmModal(null);
        addToast({ type: 'success', message: newVal ? `"${selectedUser.name}" can now log in` : `"${selectedUser.name}" is now blocked from logging in` });
        return;
      }
      if (confirmModal.type === 'suspend') {
        const data = await api.adminSuspendUser(selectedUser.id, token);
        setSelectedUser(prev => ({ ...prev, is_active: false }));
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_active: false } : u));
        setConfirmModal(null);
        addToast({ type: 'success', message: `"${selectedUser.name}" suspended successfully.` });
        return;
      }
      if (confirmModal.type === 'activate') {
        const data = await api.adminActivateUser(selectedUser.id, token);
        setSelectedUser(prev => ({ ...prev, is_active: true }));
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_active: true } : u));
        setConfirmModal(null);
        addToast({ type: 'success', message: `"${selectedUser.name}" activated successfully.` });
        return;
      }
      if (confirmModal.type === 'toggle_role') {
        const data = await api.adminUpdateUser(selectedUser.id, { is_admin: !selectedUser.is_admin }, token);
        if (data.message?.includes('last administrator')) {
          setConfirmModal({ type: 'error', title: 'Action Blocked', message: data.message, confirmLabel: 'OK', variant: 'danger' });
          setActionLoading(false);
          return;
        }
        setSelectedUser(data.user);
        setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
        setConfirmModal(null);
        addToast({ type: 'success', message: data.user.is_admin ? `"${data.user.name}" promoted to admin` : `"${data.user.name}" demoted to user` });
        return;
      }
    } catch (e) {
      setConfirmModal({ type: 'error', title: 'Action Failed', message: e.message || 'Something went wrong.', confirmLabel: 'OK', variant: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const copyEmail = (email) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      }
    } catch {}
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  const formatRelative = (d) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(d);
  };

  const activeFilterCount = [role !== 'all', status !== 'all'].filter(Boolean).length;
  const clearAllFilters = () => { setRole('all'); setStatus('all'); setSort('newest'); setSearch(''); };
  const hasActiveFilters = debouncedSearch || activeFilterCount > 0 || sort !== 'newest';

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }}>Admin</button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Users</span>
        </div>

        {/* Header */}
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'var(--primary)', padding: '8px 12px', borderRadius: 10 }}>
              <Users size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 className="admin-page-title">All Users</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {loading ? 'Loading…' : (
                  <>
                    <span style={{ background: 'var(--primary)', color: '#fff', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                      {total}
                    </span>
                    {' '}user{total !== 1 ? 's' : ''} total
                  </>
                )}
              </p>
            </div>
          </div>
          <AdminReloadBtn onClick={() => fetchUsers(page)} title="Refresh users" />
        </div>

        {/* Search + Filters */}
        <div style={{ marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: '100%', padding: '0.45rem 2.5rem 0.45rem 32px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-primary)', outline: 'none',
                borderRadius: 'var(--radius-sm)', fontSize: 13,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
                  borderRadius: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <SelectFilter label="" value={role}
              options={[{ value: 'all', label: 'All Roles' }, { value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]}
              onChange={v => { setRole(v); setPage(1); syncToUrl({ page: 1 }); }} />
            <span style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />
            <SelectFilter label="" value={status}
              options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]}
              onChange={v => { setStatus(v); setPage(1); syncToUrl({ page: 1 }); }} />
            <span style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />
            <SelectFilter label="" value={sort}
              options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'name_asc', label: 'Name A–Z' }, { value: 'name_desc', label: 'Name Z–A' }, { value: 'last_active', label: 'Last Active' }]}
              onChange={v => { setSort(v); setPage(1); syncToUrl({ page: 1 }); }} />
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.625rem',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-secondary)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {role !== 'all' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Role: {role === 'admin' ? 'Admin' : 'User'}
                <button onClick={() => { setRole('all'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
            {status !== 'all' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: status === 'active' ? 'var(--success-light)' : 'var(--error-light)', color: status === 'active' ? 'var(--success)' : 'var(--error)' }}>
                Status: {status === 'active' ? 'Active' : 'Suspended'}
                <button onClick={() => { setStatus('all'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

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
              <User size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search || activeFilterCount > 0 ? 'No results found' : 'No users yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search || activeFilterCount > 0 ? 'Try changing your search or filters' : 'Users will appear here once they register'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflow: 'visible', width: '100%' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {[
                      { label: 'User', width: 200 },
                      { label: 'Email', width: 220 },
                      { label: 'Role' },
                      { label: 'Status' },
                      { label: 'Projects' },
                      { label: 'Reviews' },
                      { label: 'Created', width: 100 },
                      { label: 'Last Active', width: 110 },
                      { label: 'Actions', width: 60 },
                    ].map(({ label, width }) => {
                      const centerCols = ['Projects', 'Reviews', 'Actions'];
                      return (
                        <th key={label} style={{
                          padding: '10px 12px', fontSize: 10, fontWeight: 600,
                          color: 'var(--text-muted)', textAlign: centerCols.includes(label) ? 'center' : 'left',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: 'var(--surface)', whiteSpace: 'nowrap',
                          borderBottom: '2px solid var(--border)',
                          position: 'sticky', top: 0, zIndex: 2,
                          ...(width ? { minWidth: width } : {}),
                        }}>{label}</th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {/* User */}
                      <td style={{ padding: '10px 12px', minWidth: 200 }}>
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          aria-label={`View ${u.name}'s profile`}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                        >
                          <Avatar name={u.name} size={30} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200, display: 'block', textAlign: 'left', textDecoration: 'none', transition: 'color 0.12s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                          >{u.name}</span>
                        </button>
                      </td>
                      {/* Email */}
                      <td style={{ padding: '10px 12px', minWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {u.email}
                          </span>
                          <button onClick={e => { e.stopPropagation(); copyEmail(u.email); }} className="btn-icon" style={{ padding: 2, flexShrink: 0 }} title="Copy email">
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
                      {/* Account Status */}
                      <td style={{ padding: '10px 12px' }}>
                        {u.is_active
                          ? <Badge variant="green" dot>Active</Badge>
                          : <Badge variant="red" dot>Suspended</Badge>}
                      </td>
                      {/* Projects */}
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', textAlign: 'center' }}>
                        {u.projects_count ?? 0}
                      </td>
                      {/* Reviews */}
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--primary)', textAlign: 'center' }}>
                        {u.reviews_count ?? 0}
                      </td>
                      {/* Created */}
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: 100 }}>
                        {formatDate(u.created_at)}
                      </td>
                      {/* Last Active */}
                      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: 110 }}>
                        {formatRelative(u.last_activity)}
                      </td>
                      {/* Actions — More menu */}
                      <td style={{ padding: '10px 12px', minWidth: 48, textAlign: 'center' }}>
                        <OverflowMenu
                          user={u}
                          onAction={handleUserAction}
                          actionLoading={actionLoading}
                          currentUserId={currentUser?.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total} users
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); syncToUrl({ page: p }); }} disabled={page <= 1}
                    className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}>
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); syncToUrl({ page: p }); }} disabled={page >= totalPages}
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
          currentUserId={currentUser?.id}
        />
      )}

      {/* Confirm / Error Modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          details={confirmModal.details}
          confirmLabel={confirmModal.confirmLabel}
          variant={confirmModal.variant || 'danger'}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
