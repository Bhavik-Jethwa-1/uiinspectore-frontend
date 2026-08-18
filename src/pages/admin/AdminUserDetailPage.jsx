import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, ShieldCheck, Clock, CheckCircle,
  XCircle, Loader2, AlertCircle, Eye, FileText,
  Activity, Settings, LayoutGrid, Star, RefreshCw, FolderOpen,
  Ban, UserCheck, RotateCcw, Copy, Check, Palette, FolderX, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { openAdminReview } from '../../utils/adminNav';
import ConfirmModal from '../../components/ConfirmModal';
import UserDetailSkeleton from '../../components/admin/UserDetailSkeleton';

const TABS = ['Overview', 'Projects', 'Activity', 'Settings'];

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user: currentAuthUser } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [activeTab, setActiveTab] = useState('Overview');

  // Pagination state
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [projectsLastPage, setProjectsLastPage] = useState(1);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [activitiesLastPage, setActivitiesLastPage] = useState(1);

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

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

  const isSelf = currentAuthUser?.id === user?.id;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-content">
          <UserDetailSkeleton />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page-content">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-ghost"
            style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <ArrowLeft size={14} /> Back to Users
          </button>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--error)', marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{error}</p>
            <button onClick={() => fetchUserDetail(1, 1)} className="btn-primary" style={{ marginTop: 12 }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const avatarInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Breadcrumb — same style as Projects page */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }}
          >
            Admin
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/admin/users')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }}
          >
            Users
          </button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</span>
        </div>

        {/* Page Header — mirrors Projects page structure */}
        <div className="admin-header">
          {/* Left: identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'var(--primary)',
              flexShrink: 0,
            }}>
              {avatarInitial}
            </div>
            {/* Name + email + meta */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <h1 className="admin-page-title" style={{ margin: 0 }}>{user.name}</h1>
                {user.is_admin && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '1px 7px', borderRadius: 9999,
                    fontSize: 10, fontWeight: 700,
                    background: 'var(--primary-light)', color: 'var(--primary)',
                  }}>
                    Admin
                  </span>
                )}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '1px 7px', borderRadius: 9999,
                  fontSize: 10, fontWeight: 700,
                  background: user.is_active ? 'var(--success-light)' : 'var(--error-light)',
                  color: user.is_active ? 'var(--success)' : 'var(--error)',
                }}>
                  {user.is_active ? 'Active' : 'Suspended'}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '1px 7px', borderRadius: 9999,
                  fontSize: 10, fontWeight: 700,
                  background: (user.settings?.allow_login === '0' || user.settings?.allow_login === false)
                    ? 'var(--hover)' : 'var(--success-light)',
                  color: (user.settings?.allow_login === '0' || user.settings?.allow_login === false)
                    ? 'var(--text-secondary)' : 'var(--success)',
                }}>
                  {(user.settings?.allow_login === '0' || user.settings?.allow_login === false) ? 'Login Blocked' : 'Login Allowed'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {user.email}
                {user.last_activity ? ` · Last active ${formatRelative(user.last_activity)}` : ''}
                {user.created_at ? ` · Joined ${formatDate(user.created_at)}` : ''}
              </p>
            </div>
          </div>

          {/* Right: Quick Actions + Refresh */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {!isSelf && (
              <>
                <button
                  onClick={() => { setActiveTab('Projects'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '5px 10px', height: 32, gap: 4 }}
                  title="View Projects"
                  aria-label="View Projects"
                >
                  <FolderOpen size={12} />
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => { setActiveTab('Activity'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '5px 10px', height: 32, gap: 4 }}
                  title="View Activity"
                  aria-label="View Activity"
                >
                  <Activity size={12} />
                  <span>Activity</span>
                </button>
              </>
            )}
            <button
              onClick={() => fetchUserDetail(1, 1)}
              className="btn-icon"
              title="Refresh"
              aria-label="Refresh user data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tabs — same style as other pages */}
        {isMobile ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>Section</span>
              <select
                value={activeTab}
                onChange={e => { setActiveTab(e.target.value); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', padding: '2px 0',
                }}
                aria-label="Select tab"
              >
                {TABS.map(tab => <option key={tab} value={tab}>{tab}</option>)}
              </select>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          </div>
        ) : (
          <div className="admin-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'Overview' && <User size={13} />}
                {tab === 'Projects' && <LayoutGrid size={13} />}
                {tab === 'Activity' && <Activity size={13} />}
                {tab === 'Settings' && <Settings size={13} />}
                <span>{tab}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'Overview' && (
          <OverviewTab user={user} onTabChange={handleTabChange} />
        )}
        {activeTab === 'Projects' && (
          <ProjectsTab
            projects={projects}
            currentPage={projectsPage}
            lastPage={projectsLastPage}
            total={projectsTotal}
            perPage={10}
            onPage={fetchProjectsPage}
            onViewReview={(reviewId) => openAdminReview(navigate, reviewId)}
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
        {activeTab === 'Settings' && (
          <SettingsTab
            user={user}
            settings={settings}
            token={token}
            userId={id}
            isSelf={isSelf}
            onUpdateSettings={setSettings}
            onUpdateUser={setUser}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Overview Tab                                            */
/* ─────────────────────────────────────────────────────── */

function OverviewTab({ user, onTabChange }) {
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  function formatRelative(d) {
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
  }

  const infoRows = [
    { label: 'User ID', value: '#' + user.id },
    { label: 'Email', value: user.email },
    { label: 'Role', value: user.is_admin ? 'Administrator' : 'User' },
    { label: 'Account Status', value: user.is_active ? 'Active' : 'Suspended' },
    { label: 'Registered', value: formatDate(user.created_at) },
    { label: 'Last Updated', value: formatDate(user.updated_at) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Quick Stats — compact row like Projects page */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {[
          {
            label: 'Projects',
            value: user.projects_count ?? 0,
            icon: <LayoutGrid size={13} style={{ color: 'var(--primary)' }} />,
            action: () => onTabChange('Projects'),
          },
          {
            label: 'Reviews',
            value: user.reviews_count ?? 0,
            icon: <Star size={13} style={{ color: 'var(--warning)' }} />,
            action: () => onTabChange('Projects'),
          },
          {
            label: 'Last Active',
            value: formatRelative(user.last_activity),
            icon: <Activity size={13} style={{ color: 'var(--text-muted)' }} />,
            action: () => onTabChange('Activity'),
          },
        ].map(({ label, value, icon, action }) => (
          <div
            key={label}
            onClick={action}
            className="card"
            style={{
              padding: '12px 14px',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.transform = '';
            }}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); action(); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              {icon}
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* User Information — same card style as Projects info rows */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--background)',
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
          }}>
            User Information
          </p>
        </div>
        <div style={{ padding: '4px 0' }}>
          {infoRows.map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 16px',
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

/* ─────────────────────────────────────────────────────── */
/* Projects Tab                                            */
/* ─────────────────────────────────────────────────────── */

function Pagination({ currentPage, lastPage, total, perPage, onPage }) {
  if (lastPage <= 1) return null;
  const range = 2;
  const pages = [];
  for (let i = Math.max(1, currentPage - range); i <= Math.min(lastPage, currentPage + range); i++) {
    pages.push(i);
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
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 0', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {total === 0 ? 'No results' : `${((currentPage - 1) * perPage) + 1}–${Math.min(currentPage * perPage, total)} of ${total}`}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          onClick={() => onPage(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{ ...pageBtnStyle, opacity: currentPage <= 1 ? 0.4 : 1 }}
        >‹</button>
        {pages[0] > 1 && <><button onClick={() => onPage(1)} style={pageBtnStyle}>1</button>{pages[0] > 2 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span>}</>}
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
        {pages[pages.length - 1] < lastPage && <><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span><button onClick={() => onPage(lastPage)} style={pageBtnStyle}>{lastPage}</button></>}
        <button
          onClick={() => onPage(currentPage + 1)}
          disabled={currentPage >= lastPage}
          style={{ ...pageBtnStyle, opacity: currentPage >= lastPage ? 0.4 : 1 }}
        >›</button>
      </div>
    </div>
  );
}

function ProjectsTab({ projects, onViewReview, currentPage, lastPage, total, perPage, onPage }) {
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

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

          {project.reviews && project.reviews.length > 0 && (
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
                        aria-label={`View Review #${review.id}`}
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

/* ─────────────────────────────────────────────────────── */
/* Activity Tab                                            */
/* ─────────────────────────────────────────────────────── */

function ActivityTab({ activities, currentPage, lastPage, total, perPage, onPage }) {
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  function getDateGroup(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - activityDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function getTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  const grouped = [];
  let lastGroup = null;
  for (const activity of activities) {
    const group = getDateGroup(activity.created_at);
    if (group !== lastGroup) {
      grouped.push({ type: 'header', label: group, id: `header-${group}-${Math.random()}` });
      lastGroup = group;
    }
    grouped.push({ type: 'activity', ...activity });
  }

  const actionIcons = {
    login: <CheckCircle size={13} style={{ color: 'var(--success)' }} />,
    project_created: <FileText size={13} style={{ color: 'var(--primary)' }} />,
    review_completed: <Star size={13} style={{ color: 'var(--warning)' }} />,
    review_created: <FileText size={13} style={{ color: 'var(--secondary)' }} />,
    screenshot_uploaded: <FileText size={13} style={{ color: 'var(--text-muted)' }} />,
    settings_changed: <Settings size={13} style={{ color: 'var(--accent)' }} />,
    admin_user_updated: <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />,
    admin_user_deleted: <FolderX size={13} style={{ color: 'var(--error)' }} />,
    admin_project_deleted: <FolderX size={13} style={{ color: 'var(--error)' }} />,
    admin_user_suspended: <FolderX size={13} style={{ color: 'var(--warning)' }} />,
    admin_user_activated: <UserCheck size={13} style={{ color: 'var(--success)' }} />,
  };

  function formatMeta(activity) {
    if (!activity.meta || Object.keys(activity.meta).length === 0) return null;
    const m = activity.meta;
    const parts = [];
    if (m.setting_key) {
      const key = m.setting_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (m.value !== undefined) parts.push(`${key}: ${m.value}`);
      else if (m.new_value !== undefined) parts.push(`${key}: ${m.new_value} → ${m.old_value}`);
      else parts.push(key);
    }
    if (m.target_user_id && !activity.description?.includes(`User #${m.target_user_id}`)) {
      parts.push(`User #${m.target_user_id}`);
    }
    if (m.project_id) parts.push(`Project #${m.project_id}`);
    if (m.review_id) parts.push(`Review #${m.review_id}`);
    if (m.remaining_admins !== undefined) parts.push(`${m.remaining_admins} admin(s) remaining`);
    if (parts.length === 0) {
      const filtered = Object.entries(m).filter(([, v]) => v !== null && v !== undefined).slice(0, 3);
      return filtered.map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ');
    }
    return parts.join(' · ');
  }

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
        {grouped.map((item) => {
          if (item.type === 'header') {
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px 6px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--background)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {item.label}
                </span>
              </div>
            );
          }
          const activity = item;
          return (
            <div key={activity.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {actionIcons[activity.action] || <Activity size={13} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 2 }}>
                  {activity.description || activity.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
                {formatMeta(activity) && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                    {formatMeta(activity)}
                  </p>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {getTime(activity.created_at)}
              </span>
            </div>
          );
        })}
      </div>
      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} perPage={perPage} onPage={onPage} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* Settings Tab                                            */
/* ─────────────────────────────────────────────────────── */

const MODAL_TYPES = {
  NONE: null,
  CONFIRM_UPDATE: 'CONFIRM_UPDATE',
  DELETE_SETTING: 'DELETE_SETTING',
  ADD_SETTING: 'ADD_SETTING',
  SUSPEND_USER: 'SUSPEND_USER',
  ACTIVATE_USER: 'ACTIVATE_USER',
  DISABLE_LOGIN: 'DISABLE_LOGIN',
  ENABLE_LOGIN: 'ENABLE_LOGIN',
  CHANGE_ROLE: 'CHANGE_ROLE',
  RESET_PASSWORD: 'RESET_PASSWORD',
  RESET_PREFERENCES: 'RESET_PREFERENCES',
};

function SettingsTab({ user, settings, token, userId, isSelf, onUpdateSettings, onUpdateUser }) {
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [copied, setCopied] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const s = settings || {};

  function showMsg(msg, type = 'info') {
    setActionMsg({ text: msg, type });
    setTimeout(() => setActionMsg(null), 4000);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
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

  function openModal(type, data = null) {
    setModalType(type);
    setModalData(data);
  }

  function closeModal() {
    if (actionLoading) return;
    setModalType(null);
    setModalData(null);
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

  async function handleToggleConfirm() {
    const { key, currentValue } = modalData;
    const newVal = currentValue === '1' || currentValue === 'true' ? '0' : '1';
    closeModal();
    await saveSetting(key, newVal);
  }

  async function handleSelectConfirm() {
    const { key, newActualValue } = modalData;
    closeModal();
    await saveSetting(key, newActualValue);
  }

  async function handleAddSettingConfirm() {
    const { key, value } = modalData;
    closeModal();
    await saveSetting(key, value);
  }

  async function handleDeleteSettingConfirm() {
    const { key, label } = modalData;
    closeModal();
    setActionLoading('delete_' + key);
    try {
      await api.adminDeleteUserSetting(userId, key, token);
      const data = await api.adminGetUser(userId, token, {});
      onUpdateSettings(data.settings || {});
      showMsg(`"${label}" setting deleted.`, 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to delete setting.', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspendConfirm() {
    closeModal();
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

  async function handleActivateConfirm() {
    closeModal();
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

  async function handleDisableLoginConfirm() {
    closeModal();
    setSaving(true);
    try {
      const data = await api.adminUpdateUserSetting(userId, 'allow_login', '0', token);
      onUpdateSettings(data.settings);
      showMsg('Login access disabled.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to disable login access.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleEnableLoginConfirm() {
    closeModal();
    setSaving(true);
    try {
      const data = await api.adminUpdateUserSetting(userId, 'allow_login', '1', token);
      onUpdateSettings(data.settings);
      showMsg('Login access enabled.', 'success');
    } catch (err) {
      showMsg(err.message || 'Failed to enable login access.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleToggleConfirm() {
    closeModal();
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

  async function handleResetPasswordConfirm() {
    closeModal();
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

  async function handleResetPreferencesConfirm() {
    closeModal();
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

  function handleToggle(key, currentValue) {
    const newVal = currentValue === '1' || currentValue === 'true' ? '0' : '1';
    const label = SETTING_LABELS[key] || key;
    openModal(MODAL_TYPES.CONFIRM_UPDATE, {
      key,
      type: 'toggle',
      currentValue: currentValue === '1' || currentValue === 'true' ? 'Enabled' : 'Disabled',
      newValue: newVal === '1' || newVal === 'true' ? 'Enabled' : 'Disabled',
      label,
      newActualValue: newVal,
    });
  }

  function handleSelect(key, value, currentValue) {
    const label = SETTING_LABELS[key] || key;
    const currentLabel = SETTING_VALUE_LABELS[key]?.[currentValue] || currentValue || 'Not set';
    const newLabel = SETTING_VALUE_LABELS[key]?.[value] || value;
    openModal(MODAL_TYPES.CONFIRM_UPDATE, {
      key,
      type: 'select',
      currentValue: currentLabel,
      newValue: newLabel,
      label,
      newActualValue: value,
    });
  }

  function handleAddSetting(key, value) {
    const label = SETTING_LABELS[key] || key;
    const newLabel = SETTING_VALUE_LABELS[key]?.[value] || value;
    openModal(MODAL_TYPES.ADD_SETTING, {
      key,
      value,
      label,
      valueLabel: newLabel,
    });
  }

  function handleDeleteSetting(key, label) {
    openModal(MODAL_TYPES.DELETE_SETTING, {
      key,
      label,
      currentValue: s[key] || 'Not set',
    });
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

  const SETTING_LABELS = {
    theme: 'Theme',
    language: 'Language',
    timezone: 'Timezone',
    email_notifications: 'Email Notifications',
    review_notifications: 'Review Completion',
    ai_review_enabled: 'AI Review',
    reviewer_persona: 'Reviewer Persona',
    daily_review_limit: 'Daily Review Limit',
    allow_retry: 'Allow Retry',
    allow_login: 'Allow Login',
  };

  const SETTING_DESCRIPTIONS = {
    theme: 'Controls the appearance of the user\'s application.',
    language: 'Controls the language used by this user\'s application.',
    timezone: 'Controls how dates and times are displayed for this user.',
    email_notifications: 'Controls whether the user receives application emails.',
    review_notifications: 'Controls whether the user receives notifications when a review is completed.',
    ai_review_enabled: 'Controls whether this user can use AI-powered UI review.',
    reviewer_persona: 'Controls the default reviewer persona used during AI analysis.',
    daily_review_limit: 'Controls the maximum number of reviews this user can create per day.',
    allow_retry: 'Controls whether this user can retry failed review uploads.',
    allow_login: 'Controls whether this user is allowed to log in to the application.',
  };

  const SETTING_VALUE_LABELS = {
    theme: { light: 'Light', dark: 'Dark', system: 'System' },
    language: { en: 'English' },
    timezone: Object.fromEntries(TIMEZONES.map(tz => [tz, tz])),
    reviewer_persona: Object.fromEntries(PERSONAS.map(p => [p.value, p.label])),
  };

  function SettingItem({ label, description, children, borderBottom = true }) {
    return (
      <div
        style={{
          padding: '13px 20px',
          borderBottom: borderBottom ? '1px solid var(--border)' : 'none',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</div>
            {description && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</div>}
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
        </div>
      </div>
    );
  }

  function SectionHeader({ title }) {
    return (
      <div style={{
        padding: '8px 16px 6px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          {title}
        </p>
      </div>
    );
  }

  const userIsActive = user?.is_active;
  const userIsAdmin = user?.is_admin;

  function renderModal() {
    if (!modalType) return null;

    switch (modalType) {

      case MODAL_TYPES.CONFIRM_UPDATE: {
        const { key, type, label, currentValue, newValue } = modalData;
        return (
          <ConfirmModal
            title="Confirm Changes"
            message={`You are about to update "${label}" for this user.`}
            details={[
              { label: 'Setting', value: label },
              { label: 'Current value', value: currentValue },
              { label: 'New value', value: newValue },
            ]}
            confirmLabel="Save Changes"
            variant="primary"
            onConfirm={handleSelectConfirm}
            onCancel={closeModal}
            loading={saving}
          />
        );
      }

      case MODAL_TYPES.ADD_SETTING: {
        const { key, label, valueLabel } = modalData;
        return (
          <ConfirmModal
            title="Add Setting"
            message={`You are about to add a new setting for this user.`}
            details={[
              { label: 'Setting', value: label },
              { label: 'Value', value: valueLabel },
            ]}
            confirmLabel="Create Setting"
            variant="primary"
            onConfirm={handleAddSettingConfirm}
            onCancel={closeModal}
            loading={saving}
          />
        );
      }

      case MODAL_TYPES.DELETE_SETTING: {
        const { key, label, currentValue } = modalData;
        return (
          <ConfirmModal
            title="Delete Setting"
            message={`You are about to permanently delete "${label}" for this user. This action cannot be undone.`}
            details={[
              { label: 'Setting', value: label },
              { label: 'Current value', value: currentValue },
            ]}
            confirmLabel="Delete"
            variant="danger"
            onConfirm={handleDeleteSettingConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'delete_' + key}
          />
        );
      }

      case MODAL_TYPES.SUSPEND_USER:
        return (
          <ConfirmModal
            title="Suspend User"
            message={`Are you sure you want to suspend ${user?.name}? The user will no longer be able to access the application.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Email', value: user?.email },
            ]}
            confirmLabel="Suspend User"
            variant="danger"
            onConfirm={handleSuspendConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'suspend'}
          />
        );

      case MODAL_TYPES.ACTIVATE_USER:
        return (
          <ConfirmModal
            title="Activate User"
            message={`Are you sure you want to activate ${user?.name}? The user will regain access to the application.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Email', value: user?.email },
            ]}
            confirmLabel="Activate User"
            variant="primary"
            onConfirm={handleActivateConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'activate'}
          />
        );

      case MODAL_TYPES.DISABLE_LOGIN:
        return (
          <ConfirmModal
            title="Block Login"
            message={`Are you sure you want to block login access for "${user?.name}"? The user will not be able to sign in until you unblock them.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Email', value: user?.email },
            ]}
            confirmLabel="Block Login"
            variant="warning"
            onConfirm={handleDisableLoginConfirm}
            onCancel={closeModal}
            loading={saving}
          />
        );

      case MODAL_TYPES.ENABLE_LOGIN:
        return (
          <ConfirmModal
            title="Allow Login"
            message={`Are you sure you want to allow login access for "${user?.name}"? The user will be able to sign in again.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Email', value: user?.email },
            ]}
            confirmLabel="Allow Login"
            variant="primary"
            onConfirm={handleEnableLoginConfirm}
            onCancel={closeModal}
            loading={saving}
          />
        );

      case MODAL_TYPES.CHANGE_ROLE: {
        const newRole = !userIsAdmin;
        return (
          <ConfirmModal
            title="Change User Role"
            message={`You are about to change the role for ${user?.name}. ${newRole ? 'They will become an Administrator with full access.' : 'They will become a regular User with standard access.'}`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Current Role', value: userIsAdmin ? 'Admin' : 'User' },
              { label: 'New Role', value: newRole ? 'Admin' : 'User' },
            ]}
            confirmLabel="Change Role"
            variant="warning"
            onConfirm={handleRoleToggleConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'role'}
          />
        );
      }

      case MODAL_TYPES.RESET_PASSWORD:
        return (
          <ConfirmModal
            title="Reset Password"
            message={`Are you sure you want to reset the password for ${user?.name}? A temporary password will be generated and displayed.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Email', value: user?.email },
            ]}
            confirmLabel="Reset Password"
            variant="warning"
            onConfirm={handleResetPasswordConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'reset_password'}
          />
        );

      case MODAL_TYPES.RESET_PREFERENCES: {
        return (
          <ConfirmModal
            title="Reset User Preferences"
            message={`This will reset all of this user's preferences to application defaults. This action cannot be undone.`}
            details={[
              { label: 'User', value: user?.name },
              { label: 'Affected settings', value: '9 preferences' },
            ]}
            confirmLabel="Reset Preferences"
            variant="danger"
            onConfirm={handleResetPreferencesConfirm}
            onCancel={closeModal}
            loading={actionLoading === 'reset_prefs'}
          />
        );
      }

      default:
        return null;
    }
  }

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
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '14px 20px',
          background: 'color-mix(in srgb, var(--primary) 15%, var(--surface))',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.03em' }}>ACCOUNT</span>
        </div>

        {/* Self-protection banner */}
        {isSelf && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 16px',
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <User size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>
                This is your current admin account.
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Self-destructive and privilege-changing actions are disabled for your own account.
              </p>
            </div>
          </div>
        )}

        <div>
          {/* Account Status */}
          <SettingItem label="Account Status" description="Controls whether this account is active or suspended.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: userIsActive ? 'var(--success)' : 'var(--error)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: userIsActive ? 'var(--success)' : 'var(--error)' }}>
                {userIsActive ? 'Active' : 'Suspended'}
              </span>
              {userIsActive ? (
                <button
                  onClick={() => openModal(MODAL_TYPES.SUSPEND_USER)}
                  disabled={actionLoading === 'suspend' || isSelf}
                  className="btn-secondary"
                  title={isSelf ? 'Cannot suspend your own account' : 'Suspend this account'}
                  style={{ fontSize: 11, padding: '4px 10px', color: 'var(--error)', borderColor: 'var(--error)', opacity: isSelf ? 0.5 : 1 }}
                >
                  {actionLoading === 'suspend' ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                  Suspend
                </button>
              ) : (
                <button
                  onClick={() => openModal(MODAL_TYPES.ACTIVATE_USER)}
                  disabled={actionLoading === 'activate'}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px', color: 'var(--success)', borderColor: 'var(--success)' }}
                >
                  {actionLoading === 'activate' ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                  Activate
                </button>
              )}
            </div>
          </SettingItem>

          {/* Allow Login */}
          <SettingItem label="Allow Login" description="Controls whether this user is allowed to sign in. Independent of Account Status.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: (s.allow_login === '1' || s.allow_login === true) ? 'var(--success)' : 'var(--text-muted)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.allow_login === '1' || s.allow_login === true) ? 'var(--success)' : 'var(--text-muted)' }}>
                {(s.allow_login === '1' || s.allow_login === true) ? 'Allowed' : 'Blocked'}
              </span>
              <button
                onClick={() => openModal((s.allow_login === '1' || s.allow_login === true) ? MODAL_TYPES.DISABLE_LOGIN : MODAL_TYPES.ENABLE_LOGIN)}
                disabled={saving}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {(s.allow_login === '1' || s.allow_login === true) ? 'Block' : 'Allow'}
              </button>
            </div>
          </SettingItem>

          {/* Role */}
          <SettingItem label="Role" description="Controls whether this user has admin privileges." borderBottom={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: userIsAdmin ? 'var(--primary)' : 'var(--text-secondary)' }}>
                {userIsAdmin ? 'Administrator' : 'User'}
              </span>
              {!isSelf && (
                <button
                  onClick={() => openModal(MODAL_TYPES.CHANGE_ROLE)}
                  disabled={actionLoading === 'role'}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                >
                  {actionLoading === 'role' ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                  {userIsAdmin ? 'Remove Admin' : 'Make Admin'}
                </button>
              )}
            </div>
          </SettingItem>
        </div>
      </div>

      {/* PREFERENCES */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '14px 20px',
          background: 'color-mix(in srgb, var(--accent) 15%, var(--surface))',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Palette size={16} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.03em' }}>PREFERENCES</span>
        </div>
        <div>
          {/* Theme */}
          <SettingItem label={SETTING_LABELS.theme} description={SETTING_DESCRIPTIONS.theme}>
            <ConfirmSelect
              value={s.theme || 'system'}
              options={THEMES}
              onChange={val => handleSelect('theme', val, s.theme || 'system')}
              disabled={saving}
              settingKey="theme"
              currentValue={s.theme || 'system'}
            />
          </SettingItem>

          {/* Timezone */}
          <SettingItem label={SETTING_LABELS.timezone} description={SETTING_DESCRIPTIONS.timezone}>
            <ConfirmSelect
              value={s.timezone || ''}
              options={[{ value: '', label: 'Not set' }, ...TIMEZONES.map(tz => ({ value: tz, label: tz }))]}
              onChange={val => handleSelect('timezone', val, s.timezone || '')}
              disabled={saving}
              settingKey="timezone"
              currentValue={s.timezone || ''}
            />
          </SettingItem>

          {/* Language */}
          <SettingItem label={SETTING_LABELS.language} description={SETTING_DESCRIPTIONS.language}>
            <ConfirmSelect
              value={s.language || ''}
              options={[
                { value: '', label: 'Not set' },
                { value: 'en', label: 'English' },
              ]}
              onChange={val => handleSelect('language', val, s.language || '')}
              disabled={saving}
              settingKey="language"
              currentValue={s.language || ''}
            />
          </SettingItem>

          {/* Email Notifications */}
          <SettingItem label={SETTING_LABELS.email_notifications} description={SETTING_DESCRIPTIONS.email_notifications}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.email_notifications === '1' || s.email_notifications === true) ? 'var(--success)' : 'var(--text-muted)' }}>
                {(s.email_notifications === '1' || s.email_notifications === true) ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => handleToggle('email_notifications', s.email_notifications ?? '1')}
                disabled={saving}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {(s.email_notifications === '1' || s.email_notifications === true) ? 'Disable' : 'Enable'}
              </button>
            </div>
          </SettingItem>

          {/* Review Notifications */}
          <SettingItem label={SETTING_LABELS.review_notifications} description={SETTING_DESCRIPTIONS.review_notifications}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.review_notifications === '1' || s.review_notifications === true) ? 'var(--success)' : 'var(--text-muted)' }}>
                {(s.review_notifications === '1' || s.review_notifications === true) ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => handleToggle('review_notifications', s.review_notifications ?? '1')}
                disabled={saving}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {(s.review_notifications === '1' || s.review_notifications === true) ? 'Disable' : 'Enable'}
              </button>
            </div>
          </SettingItem>

          {/* AI Review */}
          <SettingItem label={SETTING_LABELS.ai_review_enabled} description={SETTING_DESCRIPTIONS.ai_review_enabled}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.ai_review_enabled === '1' || s.ai_review_enabled === true) ? 'var(--success)' : 'var(--text-muted)' }}>
                {(s.ai_review_enabled === '1' || s.ai_review_enabled === true) ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => handleToggle('ai_review_enabled', s.ai_review_enabled ?? '1')}
                disabled={saving}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {(s.ai_review_enabled === '1' || s.ai_review_enabled === true) ? 'Disable' : 'Enable'}
              </button>
            </div>
          </SettingItem>

          {/* Reviewer Persona */}
          <SettingItem label={SETTING_LABELS.reviewer_persona} description={SETTING_DESCRIPTIONS.reviewer_persona}>
            <ConfirmSelect
              value={s.reviewer_persona || ''}
              options={[{ value: '', label: 'Not set' }, ...PERSONAS]}
              onChange={val => handleSelect('reviewer_persona', val, s.reviewer_persona || '')}
              disabled={saving}
              settingKey="reviewer_persona"
              currentValue={s.reviewer_persona || ''}
            />
          </SettingItem>

          {/* Daily Review Limit */}
          <SettingItem label={SETTING_LABELS.daily_review_limit} description={SETTING_DESCRIPTIONS.daily_review_limit}>
            <input
              type="number"
              value={s.daily_review_limit || ''}
              onBlur={e => {
                const val = e.target.value;
                const current = s.daily_review_limit || '';
                if (val !== current) {
                  handleSelect('daily_review_limit', val, current);
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } }}
              className="input"
              style={{ width: 70, fontSize: 12, padding: '4px 8px' }}
              min="1"
              max="999"
              placeholder="—"
            />
          </SettingItem>

          {/* Allow Retry */}
          <SettingItem label={SETTING_LABELS.allow_retry} description={SETTING_DESCRIPTIONS.allow_retry} borderBottom={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: (s.allow_retry === '1' || s.allow_retry === true) ? 'var(--success)' : 'var(--text-muted)' }}>
                {(s.allow_retry === '1' || s.allow_retry === true) ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => handleToggle('allow_retry', s.allow_retry ?? '1')}
                disabled={saving}
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {(s.allow_retry === '1' || s.allow_retry === true) ? 'Disable' : 'Enable'}
              </button>
            </div>
          </SettingItem>
        </div>
      </div>

      {/* ADMIN ACTIONS */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '14px 20px',
          background: 'color-mix(in srgb, var(--primary) 15%, var(--surface))',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="white" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.03em' }}>ADMIN ACTIONS</span>
        </div>
        <div>
          <SettingItem label="Reset Password" description="Generate a new temporary password for this user.">
            <button
              onClick={() => openModal(MODAL_TYPES.RESET_PASSWORD)}
              disabled={actionLoading === 'reset_password'}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '4px 12px' }}
            >
              {actionLoading === 'reset_password' ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
              Reset
            </button>
          </SettingItem>

          <SettingItem label="Reset Preferences" description="Reset all preferences to application defaults." borderBottom={false}>
            <button
              onClick={() => openModal(MODAL_TYPES.RESET_PREFERENCES)}
              disabled={actionLoading === 'reset_prefs'}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '4px 12px', color: 'var(--error)', borderColor: 'var(--error)' }}
            >
              {actionLoading === 'reset_prefs' ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              Reset
            </button>
          </SettingItem>
        </div>
      </div>

      {renderModal()}
    </div>
  );
}

// ConfirmSelect component for settings that need confirmation
function ConfirmSelect({ value, options, onChange, disabled, settingKey, currentValue }) {
  function handleChange(e) {
    const newVal = e.target.value;
    if (newVal !== currentValue) {
      onChange(newVal);
    }
  }
  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      className="select"
      style={{ fontSize: 11, padding: '3px 22px 3px 6px' }}
    >
      {options.map(o => <option key={o.value} value={o.value || ''}>{o.label}</option>)}
    </select>
  );
}
