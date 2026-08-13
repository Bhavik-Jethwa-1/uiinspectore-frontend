import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, ShieldCheck, Clock, CheckCircle,
  XCircle, Loader2, AlertCircle, ExternalLink, Eye, FileText,
  Activity, Settings, LayoutGrid, Star, RefreshCw, Plus, Pencil, Trash2, Save, X,
  Ban, UserCheck, RotateCcw, EyeOff, Bell, BellOff, Palette, Globe, Clock8, Sparkles, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const TABS = ['Overview', 'Projects', 'Activity', 'Settings'];

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Pagination state
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [projectsLastPage, setProjectsLastPage] = useState(1);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [activitiesLastPage, setActivitiesLastPage] = useState(1);
  const [tabLoading, setTabLoading] = useState(false);

  // Fetch full user data (overview + current page of projects + activities)
  async function fetchUserDetail(pPage, aPage) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminGetUser(id, token, { projects_page: pPage, activities_page: aPage });
      setUser(data.user);
      setProjects(data.projects?.data || []);
      setProjectsTotal(data.projects?.total || 0);
      setProjectsPage(data.projects?.current_page || 1);
      setProjectsLastPage(data.projects?.last_page || 1);
      setActivities(data.activities?.data || []);
      setActivitiesTotal(data.activities?.total || 0);
      setActivitiesPage(data.activities?.current_page || 1);
      setActivitiesLastPage(data.activities?.last_page || 1);
      setSettings(data.settings || {});
    } catch (err) {
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  function fetchProjectsPage(page) {
    setProjectsPage(page);
    fetchUserDetail(page, activitiesPage);
  }

  function fetchActivitiesPage(page) {
    setActivitiesPage(page);
    fetchUserDetail(projectsPage, page);
  }

  useEffect(() => {
    fetchUserDetail(1, 1);
  }, [id]);

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 12 }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary)' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => navigate('/admin/users')} className="btn-ghost" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={14} /> Back to Users
        </button>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: 12 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{error}</p>
          <button onClick={fetchUserDetail} className="btn-primary" style={{ marginTop: 12 }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/users')}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, padding: '6px 0' }}
        >
          <ArrowLeft size={14} /> Back to All Users
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5B5FEF, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 18, fontWeight: 800, flexShrink: 0,
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{user.name}</h2>
              {user.is_admin && (
                <span style={{
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  Admin
                </span>
              )}
              <span style={{
                background: user.is_active ? 'var(--success-light)' : 'var(--error-light)',
                color: user.is_active ? 'var(--success)' : 'var(--error)',
                borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 600,
              }}>
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>{user.email}</p>
          </div>
          <button
            onClick={fetchUserDetail}
            className="btn-icon"
            title="Refresh"
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, borderBottom: '1px solid var(--border)',
        marginBottom: 20,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab === 'Overview' && <User size={13} />}
            {tab === 'Projects' && <LayoutGrid size={13} />}
            {tab === 'Activity' && <Activity size={13} />}
            {tab === 'Settings' && <Settings size={13} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab user={user} />}
      {activeTab === 'Projects' && (
        <ProjectsTab
          projects={projects}
          currentPage={projectsPage}
          lastPage={projectsLastPage}
          total={projectsTotal}
          perPage={10}
          onPage={fetchProjectsPage}
          onViewReview={(reviewId) => navigate(`/admin/reviews?review=${reviewId}`)}
        />
      )}
      {activeTab === 'Activity' && (
        <ActivityTab
          activities={activities}
          currentPage={activitiesPage}
          lastPage={activitiesLastPage}
          total={activitiesTotal}
          perPage={10}
          onPage={fetchActivitiesPage}
        />
      )}
      {activeTab === 'Settings' && <SettingsTab user={user} settings={settings} token={token} userId={id} onUpdateSettings={setSettings} onUpdateUser={setUser} />}
    </div>
  );
}

function OverviewTab({ user }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const statCards = [
    { label: 'Projects', value: user.projects_count ?? 0, color: 'var(--primary)' },
    { label: 'Reviews', value: user.reviews_count ?? 0, color: 'var(--primary)' },
    { label: 'Status', value: user.is_active ? 'Active' : 'Suspended', color: user.is_active ? 'var(--success)' : 'var(--error)' },
  ];

  const infoRows = [
    { label: 'User ID', value: `#${user.id}` },
    { label: 'Email', value: user.email },
    { label: 'Role', value: user.is_admin ? 'Administrator' : 'User' },
    { label: 'Account Status', value: user.is_active ? 'Active' : 'Suspended' },
    { label: 'Registered', value: formatDate(user.created_at) },
    { label: 'Last Updated', value: formatDate(user.updated_at) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>User Information</p>
        </div>
        <div style={{ padding: '4px 0' }}>
          {infoRows.map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, lastPage, total, perPage, onPage }) {
  if (lastPage <= 1) return null;
  const range = 2;
  const pages = [];
  for (let i = Math.max(1, currentPage - range); i <= Math.min(lastPage, currentPage + range); i++) {
    pages.push(i);
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 0', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {total === 0 ? 'No results' : `${((currentPage - 1) * perPage) + 1}–${Math.min(currentPage * perPage, total)} of ${total}`}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
            opacity: currentPage <= 1 ? 0.4 : 1,
          }}
        >‹</button>
        {pages[0] > 1 && <><button onClick={() => onPage(1)} style={{ ...pageBtnStyle, opacity: 1 }}>1</button>{pages[0] > 2 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span>}</>}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            style={{
              ...pageBtnStyle,
              background: p === currentPage ? 'var(--primary)' : 'var(--surface)',
              color: p === currentPage ? 'white' : 'var(--text-primary)',
              borderColor: p === currentPage ? 'var(--primary)' : 'var(--border)',
              opacity: 1,
            }}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < lastPage && <><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span><button onClick={() => onPage(lastPage)} style={{ ...pageBtnStyle, opacity: 1 }}>{lastPage}</button></>}
        <button
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage >= lastPage}
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: currentPage >= lastPage ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage >= lastPage ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
            opacity: currentPage >= lastPage ? 0.4 : 1,
          }}
        >›</button>
      </div>
    </div>
  );
}

const pageBtnStyle = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 11, fontWeight: 600,
};

function ProjectsTab({ projects, onViewReview, currentPage, lastPage, total, perPage, onPage }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const statusColors = {
    pending: { bg: 'var(--warning-light)', color: 'var(--warning)' },
    analyzing: { bg: 'var(--primary-light)', color: 'var(--primary)' },
    completed: { bg: 'var(--success-light)', color: 'var(--success)' },
    failed: { bg: 'var(--error-light)', color: 'var(--error)' },
  };

  if (projects.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
          <LayoutGrid size={20} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No projects yet</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This user hasn't created any projects.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {projects.map((project) => (
        <div key={project.id} className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: 2 }}>{project.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Created {formatDate(project.created_at)} · Updated {formatDate(project.updated_at)}
              </p>
            </div>
            <span style={{
              background: 'var(--primary-light)', color: 'var(--primary)',
              borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700,
            }}>
              {project.reviews_count} {project.reviews_count === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          {project.description && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{project.description}</p>
          )}

          {project.reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Reviews</p>
              {project.reviews.map(review => {
                const sc = statusColors[review.status] || statusColors.pending;
                return (
                  <div key={review.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--background)', borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>#{review.id}</span>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>
                        {review.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{review.persona?.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(review.created_at)}</span>
                      <button
                        onClick={() => onViewReview(review.id)}
                        className="btn-icon"
                        style={{ padding: 3 }}
                        title="View Review"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} perPage={perPage} onPage={onPage} />
    </div>
  );
}

function ActivityTab({ activities, currentPage, lastPage, total, perPage, onPage }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const actionIcons = {
    login: <CheckCircle size={13} style={{ color: 'var(--success)' }} />,
    project_created: <FileText size={13} style={{ color: 'var(--primary)' }} />,
    review_completed: <Star size={13} style={{ color: 'var(--warning)' }} />,
    review_created: <FileText size={13} style={{ color: 'var(--secondary)' }} />,
    screenshot_uploaded: <FileText size={13} style={{ color: 'var(--text-muted)' }} />,
    settings_changed: <Settings size={13} style={{ color: 'var(--accent)' }} />,
  };

  if (activities.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
          <Activity size={20} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No activity recorded</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This user's actions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '4px 0' }}>
        {activities.map((activity, i, arr) => (
          <div key={activity.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              {actionIcons[activity.action] || <Activity size={13} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 2 }}>
                {activity.description || activity.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
              {activity.meta && Object.keys(activity.meta).length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                  {JSON.stringify(activity.meta)}
                </p>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatDate(activity.created_at)}
            </span>
          </div>
        ))}
      </div>
      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} perPage={perPage} onPage={onPage} />
    </div>
  );
}

function SettingsTab({ user, settings, token, userId, onUpdateSettings, onUpdateUser }) {
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const s = settings || {};

  function showMsg(msg, type = 'info') {
    setActionMsg({ text: msg, type });
    setTimeout(() => setActionMsg(null), 4000);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure contexts (HTTP)
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showMsg('Copy failed — select the text manually.', 'error');
    }
  }

  async function saveSetting(key, value) {
    setSaving(true);
    try {
      const data = await api.adminUpdateUserSetting(userId, key, String(value ?? ''), token);
      onUpdateSettings(data.settings);
      showMsg('Setting saved.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to save setting.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(key, currentValue) {
    const newVal = currentValue === '1' || currentValue === 'true' ? '0' : '1';
    await saveSetting(key, newVal);
  }

  async function handleSelect(key, value) {
    await saveSetting(key, value);
  }

  async function handleRoleToggle() {
    setActionLoading('role');
    try {
      const newVal = !user.is_admin;
      await api.adminUpdateUser(userId, { is_admin: newVal }, token);
      onUpdateUser({ ...user, is_admin: newVal });
      showMsg(newVal ? 'User promoted to admin.' : 'User demoted to regular user.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to update role.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspend() {
    if (!confirm(`Suspend ${user?.name}? They will not be able to log in.`)) return;
    setActionLoading('suspend');
    try {
      await api.adminSuspendUser(userId, token);
      onUpdateUser({ ...user, is_active: false });
      showMsg('User suspended.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to suspend user.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleActivate() {
    setActionLoading('activate');
    try {
      await api.adminActivateUser(userId, token);
      onUpdateUser({ ...user, is_active: true });
      showMsg('User activated.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to activate user.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword() {
    if (!confirm(`Reset password for ${user?.name}? A temporary password will be shown.`)) return;
    setActionLoading('reset_password');
    setTempPassword(null);
    try {
      const data = await api.adminResetPassword(userId, token);
      setTempPassword(data.temp_password);
      showMsg('Password reset. Temporary password shown below.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to reset password.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPreferences() {
    if (!confirm(`Reset all preferences for ${user?.name}? This cannot be undone.`)) return;
    setActionLoading('reset_prefs');
    try {
      await api.adminResetPreferences(userId, token);
      onUpdateSettings({});
      showMsg('User preferences reset to defaults.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to reset preferences.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  const PERSONAS = [
    { value: 'first_time', label: 'First-time user' },
    { value: 'non_technical', label: 'Non-technical user' },
    { value: 'junior_developer', label: 'Junior developer' },
    { value: 'developer', label: 'Developer' },
    { value: 'devops', label: 'DevOps engineer' },
    { value: 'designer', label: 'Product designer' },
    { value: 'manager', label: 'Product manager' },
    { value: 'custom', label: 'Custom' },
  ];

  const THEMES = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Berlin', 'Europe/Paris',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland',
  ];

  const boolLabel = (v) => v === '1' || v === 'true' ? 'Enabled' : 'Disabled';
  const boolIcon = (v) => v === '1' || v === 'true' ? <CheckCircle size={11} style={{ color: 'var(--success)' }} /> : <XCircle size={11} style={{ color: 'var(--text-muted)' }} />;

  function SettingRow({ label, icon, children, borderBottom = true }) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '9px 16px',
        borderBottom: borderBottom ? '1px solid var(--border)' : 'none',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {icon && <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
    );
  }

  function SelectBtn({ value, options, onChange, disabled }) {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled || saving}
        className="select"
        style={{ fontSize: 11, padding: '3px 22px 3px 6px' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value || ''}>{o.label}</option>
        ))}
      </select>
    );
  }

  function ToggleBtn({ value, onToggle, disabled }) {
    return (
      <button
        onClick={() => onToggle()}
        disabled={disabled || saving}
        className={`btn-icon ${value === '1' || value === 'true' ? '' : 'disabled'}`}
        title={value === '1' || value === 'true' ? 'Click to disable' : 'Click to enable'}
        style={{
          color: value === '1' || value === 'true' ? 'var(--success)' : 'var(--text-muted)',
          opacity: (disabled || saving) ? 0.5 : 1,
        }}
      >
        {value === '1' || value === 'true' ? <CheckCircle size={14} /> : <XCircle size={14} />}
      </button>
    );
  }

  function SectionHeader({ title }) {
    return (
      <div style={{
        padding: '8px 16px 6px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </p>
      </div>
    );
  }

  const userIsActive = user?.is_active;
  const userIsAdmin = user?.is_admin;
  const emailVerified = !!user?.email_verified_at;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Action feedback */}
      {actionMsg && (
        <div style={{
          padding: '8px 12px', borderRadius: 7, fontSize: 12,
          background: actionMsg.type === 'error' ? 'var(--error-light)' : 'var(--success-light)',
          color: actionMsg.type === 'error' ? 'var(--error)' : 'var(--success)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {actionMsg.type === 'error' ? <XCircle size={13} /> : <CheckCircle size={13} />}
          {actionMsg.text}
        </div>
      )}

      {/* Temp password display */}
      {tempPassword && (
        <div className="card" style={{ padding: '12px 14px', background: 'var(--warning-light)', border: '1px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--warning)', margin: 0 }}>Temporary Password</p>
            <button
              onClick={() => copyToClipboard(tempPassword)}
              className="btn-icon"
              title="Copy to clipboard"
              style={{ color: copied ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
          <code style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{tempPassword}</code>
          <p style={{ fontSize: 10, color: 'var(--warning)', margin: 0 }}>Share with the user securely. Copy and close — this will not be shown again.</p>
        </div>
      )}

      {/* ACCOUNT */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <SectionHeader title="ACCOUNT" />
        <div style={{ padding: '4px 0' }}>
          <SettingRow label="Account Status" icon={<CheckCircle size={12} />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: userIsActive ? 'var(--success)' : 'var(--error)' }}>
                {userIsActive ? 'Active' : 'Suspended'}
              </span>
              {userIsActive ? (
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading === 'suspend'}
                  className="btn-icon"
                  title="Suspend user"
                  style={{ color: 'var(--error)' }}
                >
                  {actionLoading === 'suspend' ? <Loader2 size={12} className="animate-spin" /> : <Ban size={13} />}
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={actionLoading === 'activate'}
                  className="btn-icon"
                  title="Activate user"
                  style={{ color: 'var(--success)' }}
                >
                  {actionLoading === 'activate' ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={13} />}
                </button>
              )}
            </div>
          </SettingRow>

          <SettingRow label="Email Verified" icon={<Mail size={12} />}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {boolIcon(emailVerified ? '1' : '0')}
              <span style={{ fontSize: 11, color: emailVerified ? 'var(--success)' : 'var(--text-muted)' }}>
                {emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </SettingRow>

          <SettingRow label="Allow Login" icon={<Eye size={12} />}>
            <ToggleBtn
              value={userIsActive ? '1' : '0'}
              onToggle={userIsActive ? handleSuspend : handleActivate}
            />
          </SettingRow>

          <SettingRow label="Role" icon={<ShieldCheck size={12} />} borderBottom={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: userIsAdmin ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {userIsAdmin ? 'Admin' : 'User'}
              </span>
              <button
                onClick={handleRoleToggle}
                disabled={actionLoading === 'role' || saving}
                className="btn-icon"
                title={userIsAdmin ? 'Demote to User' : 'Promote to Admin'}
              >
                {actionLoading === 'role' ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
              </button>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <SectionHeader title="PREFERENCES" />
        <div style={{ padding: '4px 0' }}>
          <SettingRow label="Theme" icon={<Palette size={12} />}>
            <SelectBtn
              value={s.theme || 'system'}
              options={THEMES}
              onChange={v => handleSelect('theme', v)}
            />
          </SettingRow>

          <SettingRow label="Language" icon={<Globe size={12} />}>
            <SelectBtn
              value={s.language || 'en'}
              options={[{ value: 'en', label: 'English' }]}
              onChange={v => handleSelect('language', v)}
            />
          </SettingRow>

          <SettingRow label="Timezone" icon={<Clock8 size={12} />}>
            <SelectBtn
              value={s.timezone || 'UTC'}
              options={TIMEZONES.map(tz => ({ value: tz, label: tz }))}
              onChange={v => handleSelect('timezone', v)}
            />
          </SettingRow>

          <SettingRow label="Email Notifications" icon={<Bell size={12} />}>
            <ToggleBtn
              value={s.email_notifications ?? '1'}
              onToggle={() => handleToggle('email_notifications', s.email_notifications)}
            />
          </SettingRow>

          <SettingRow label="Review Completion" icon={<Bell size={12} />} borderBottom={false}>
            <ToggleBtn
              value={s.review_notifications ?? '1'}
              onToggle={() => handleToggle('review_notifications', s.review_notifications)}
            />
          </SettingRow>
        </div>
      </div>

      {/* AI REVIEW */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <SectionHeader title="AI REVIEW" />
        <div style={{ padding: '4px 0' }}>
          <SettingRow label="AI Review" icon={<Sparkles size={12} />}>
            <ToggleBtn
              value={s.ai_review_enabled ?? '1'}
              onToggle={() => handleToggle('ai_review_enabled', s.ai_review_enabled)}
            />
          </SettingRow>

          <SettingRow label="Reviewer Persona" icon={<User size={12} />}>
            <SelectBtn
              value={s.reviewer_persona || 'first_time'}
              options={PERSONAS}
              onChange={v => handleSelect('reviewer_persona', v)}
            />
          </SettingRow>

          <SettingRow label="Daily Review Limit" icon={<LayoutGrid size={12} />}>
            <input
              type="number"
              value={s.daily_review_limit || ''}
              onChange={e => handleSelect('daily_review_limit', e.target.value)}
              className="input"
              style={{ width: 60, fontSize: 11, padding: '3px 6px' }}
              min="1"
              max="999"
              placeholder="—"
            />
          </SettingRow>

          <SettingRow label="Allow Retry" icon={<RotateCcw size={12} />} borderBottom={false}>
            <ToggleBtn
              value={s.allow_retry ?? '1'}
              onToggle={() => handleToggle('allow_retry', s.allow_retry)}
            />
          </SettingRow>
        </div>
      </div>

      {/* ADMIN ACTIONS */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <SectionHeader title="ADMIN ACTIONS" />
        <div style={{ padding: '4px 0' }}>
          <SettingRow label="Reset Password" icon={<RotateCcw size={12} />}>
            <button
              onClick={handleResetPassword}
              disabled={actionLoading === 'reset_password'}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '0.25rem 0.6rem' }}
            >
              {actionLoading === 'reset_password' ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
              Reset
            </button>
          </SettingRow>

          <SettingRow label="Reset Preferences" icon={<RefreshCw size={12} />} borderBottom={false}>
            <button
              onClick={handleResetPreferences}
              disabled={actionLoading === 'reset_prefs'}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '0.25rem 0.6rem', color: 'var(--error)' }}
            >
              {actionLoading === 'reset_prefs' ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Reset
            </button>
          </SettingRow>
        </div>
      </div>

    </div>
  );
}
