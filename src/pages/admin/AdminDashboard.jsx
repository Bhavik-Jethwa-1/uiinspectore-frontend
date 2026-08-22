import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  Search, Eye, Loader2, AlertCircle, Users, FolderOpen, Star,
  AlertTriangle, ChevronRight, ChevronLeft, XCircle, Clock, TrendingUp,
  CheckCircle,
} from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import { openAdminReview, openAdminProject } from '../../utils/adminNav';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [failedReviews, setFailedReviews] = useState([]);
  const [analyzingReviews, setAnalyzingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    try {
      const data = await api.adminGetDashboard(token);
      setStats(data.stats);
      setRecentUsers(data.recent_users || []);
      setRecentReviews(data.recent_reviews || []);
      setRecentProjects(data.recent_projects || []);
      setFailedReviews(data.failed_reviews_list || []);
      const analyzing = await api.adminGetReviews(token, { status: 'analyzing', per_page: 5 });
      setAnalyzingReviews(analyzing.reviews || []);
    } catch (e) { addToast({ type: 'error', message: e?.message || 'Failed to load dashboard.' }); } finally { setLoading(false); }
  }

  useEffect(() => { if (token) loadDashboard(); }, [token]);

  useEffect(() => {
    if (!token || !search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await api.adminGetReviews(token, { search, page: searchPage, per_page: 10 });
        setSearchResults(data.reviews || []);
        setSearchTotal(data.total || 0);
        setSearchTotalPages(data.last_page || 1);
      } catch (e) { addToast({ type: 'error', message: e?.message || 'Search failed.' }); } finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [token, search, searchPage]);

  const badge = (status) => {
    const map = {
      completed: <span className="badge badge-green">Completed</span>,
      analyzing: <span className="badge badge-blue">Analyzing</span>,
      pending: <span className="badge badge-gray">Pending</span>,
      failed: <span className="badge badge-red">Failed</span>,
    };
    return map[status] || <span className="badge badge-gray">{status || '—'}</span>;
  };

  const scoreColor = (s) => {
    if (s == null) return 'var(--text-muted)';
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    const diff = Date.now() - dt.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  const fmtFull = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  };

  // Merge + sort recent activity
  const activity = [
    ...(recentUsers).map(u => ({ t: 'user', d: u, ts: u.created_at })),
    ...(recentReviews).map(r => ({ t: 'review', d: r, ts: r.created_at })),
    ...(recentProjects).map(p => ({ t: 'project', d: p, ts: p.created_at })),
  ]
    .filter(x => x.ts && x.d?.id != null)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, 12);

  const needsAttention = [
    stats?.failed_reviews > 0 && { label: 'Failed Reviews', count: stats.failed_reviews, color: 'var(--error)', bg: 'color-mix(in srgb, var(--error) 12%, transparent)', link: '/admin/reviews?status=failed', icon: <XCircle size={13} /> },
    stats?.analyzing_reviews > 0 && { label: 'Analyzing', count: stats.analyzing_reviews, color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 12%, transparent)', link: '/admin/reviews?status=analyzing', icon: <Clock size={13} /> },
    stats?.pending_reviews > 0 && { label: 'Pending Reviews', count: stats.pending_reviews, color: 'var(--text-secondary)', bg: 'var(--hover)', link: '/admin/reviews?status=pending', icon: <AlertTriangle size={13} /> },
  ].filter(Boolean);

  const s = stats;

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-page-title">Admin Control Center</h1>
            <p className="admin-page-subtitle" style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
              {s ? `${s.total_users} users · ${s.total_projects} projects · ${s.total_reviews} reviews` : 'Loading…'}
            </p>
          </div>
          <AdminReloadBtn onClick={loadDashboard} title="Refresh dashboard" />
        </div>

        {/* Stat Cards — use existing CSS grid */}
        {loading ? (
          <div className="stat-cards-grid" style={{ marginBottom: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stat-card" style={{ height: 88 }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--border)', margin: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="stat-cards-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Users</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={12} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>{s.total_users ?? 0}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{s.active_users ?? 0} active</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/projects')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Projects</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--success) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderOpen size={12} style={{ color: 'var(--success)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>{s.total_projects ?? 0}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>all time</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/reviews')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Reviews</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--warning) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={12} style={{ color: 'var(--warning)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>{s.total_reviews ?? 0}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{s.completed_reviews ?? 0} done</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/reviews?status=completed')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Avg Score</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={12} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>
                {s?.avg_score != null ? `${s.avg_score}%` : '—'}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>completed reviews</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/reviews?status=analyzing')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Analyzing</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--warning) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={12} style={{ color: 'var(--warning)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s?.analyzing_reviews > 0 ? 'var(--warning)' : 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>
                {s?.analyzing_reviews ?? 0}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>in progress</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/admin/reviews?status=failed')} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minWidth: 0, gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>Failed</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'color-mix(in srgb, var(--error) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={12} style={{ color: 'var(--error)' }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: s?.failed_reviews > 0 ? 'var(--error)' : 'var(--text-primary)', lineHeight: 1, margin: '0 0 4px' }}>
                {s?.failed_reviews ?? 0}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>need attention</p>
            </div>
          </div>
        )}

        {/* Needs Attention + Recent Activity */}
        <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, marginBottom: 24, alignItems: 'start' }}>
          {/* Needs Attention */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--error)' }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Needs Attention</h2>
            </div>
            {needsAttention.length === 0 ? (
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <CheckCircle size={18} style={{ color: 'var(--success)', margin: '0 auto 6px', display: 'block' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>All clear!</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No issues need attention.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {needsAttention.map(({ label, count, color, bg, link, icon }) => (
                  <div key={label} onClick={() => navigate(link)} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                    padding: '11px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color }}>{count}</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Activity</h2>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{activity.length} most recent</span>
            </div>
            <div className="card" style={{ padding: '4px 0' }}>
              {activity.length === 0 && !loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent activity.</p>
                </div>
              )}
              {activity.map((item, i) => {
                const last = i === activity.length - 1;
                if (item.t === 'user') return (
                  <div key={`u-${item.d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: last ? 'none' : '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={11} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/admin/users/${item.d.id}`); }}>{item.d.name || 'Unknown'}</span>
                        {' '}registered{item.d.is_admin ? ' as admin' : ''}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{item.d.email || ''}</p>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtDate(item.ts)}</span>
                  </div>
                );
                if (item.t === 'project') return (
                  <div key={`p-${item.d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: last ? 'none' : '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'color-mix(in srgb, var(--success) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderOpen size={11} style={{ color: 'var(--success)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Project <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/admin/projects/${item.d.id}`); }}>{item.d.name || 'Unknown'}</span> created
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{item.d.reviews_count ?? 0} review{(item.d.reviews_count ?? 0) !== 1 ? 's' : ''}</p>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtDate(item.ts)}</span>
                  </div>
                );
                return (
                  <div key={`r-${item.d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: last ? 'none' : '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'color-mix(in srgb, var(--warning) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Star size={11} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Review <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/admin/reviews/${item.d.id}`); }}>#{item.d.id ?? '?'}</span>
                        {item.d.project_name ? ` — ${item.d.project_name}` : ''}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{badge(item.d.status)}</p>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtDate(item.ts)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review Queue */}
        {(failedReviews.length > 0 || analyzingReviews.length > 0) && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Review Queue</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {failedReviews.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: 'color-mix(in srgb, var(--error) 10%, var(--surface))', borderBottom: '1px solid color-mix(in srgb, var(--error) 20%, var(--border))', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={12} style={{ color: 'var(--error)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)' }}>Failed Reviews</span>
                    <span style={{ fontSize: 11, color: 'var(--error)', opacity: 0.7 }}>({s?.failed_reviews ?? 0})</span>
                    <button onClick={() => navigate('/admin/reviews?status=failed')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 11, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
                      View all <ChevronRight size={11} />
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                      <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#', 'Project', 'Score', 'Date', ''].map(h => (
                          <th key={h} style={{ padding: '7px 12px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--background)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {failedReviews.slice(0, 5).map((r, i) => (
                          <tr key={r.id ?? i} style={{ borderBottom: i < Math.min(failedReviews.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--error)', whiteSpace: 'nowrap' }}>#{r.id ?? '—'}</td>
                            <td style={{ padding: '8px 12px', maxWidth: 120 }}>
                              {r.project_id ? (
                                <button onClick={() => openAdminProject(navigate, r.project_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{r.project_name || '—'}</span>
                                </button>
                              ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--error)', whiteSpace: 'nowrap' }}>{r.scores?.overall ?? '—'}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtFull(r.created_at)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}><button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" aria-label="View review" style={{ padding: 4 }}><Eye size={12} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {analyzingReviews.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: 'color-mix(in srgb, var(--warning) 10%, var(--surface))', borderBottom: '1px solid color-mix(in srgb, var(--warning) 20%, var(--border))', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)' }}>Analyzing Reviews</span>
                    <span style={{ fontSize: 11, color: 'var(--warning)', opacity: 0.7 }}>({s?.analyzing_reviews ?? 0})</span>
                    <button onClick={() => navigate('/admin/reviews?status=analyzing')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 11, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
                      View all <ChevronRight size={11} />
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                      <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#', 'Project', 'Goal', 'Date', ''].map(h => (
                          <th key={h} style={{ padding: '7px 12px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--background)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {analyzingReviews.slice(0, 5).map((r, i) => (
                          <tr key={r.id ?? i} style={{ borderBottom: i < Math.min(analyzingReviews.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>#{r.id ?? '—'}</td>
                            <td style={{ padding: '8px 12px', maxWidth: 120 }}>
                              {r.project_id ? (
                                <button onClick={() => openAdminProject(navigate, r.project_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{r.project_name || '—'}</span>
                                </button>
                              ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={{ padding: '8px 12px', fontSize: 10, color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.page_goal || undefined}>{r.page_goal || '—'}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtFull(r.created_at)}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}><button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" aria-label="View review" style={{ padding: 4 }}><Eye size={12} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Search Reviews</h2>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchPage(1); }}
              aria-label="Search reviews" placeholder="Search by project, user, or goal…"
              style={{
                paddingLeft: 34, paddingRight: 12, borderRadius: 8,
                width: '100%', fontSize: 13, height: 36,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          {searchLoading ? (
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 6px', display: 'block' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Searching…</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                  <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Project', 'User', 'Goal', 'Status', 'Score', 'Date', ''].map(h => (
                      <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--background)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {searchResults.map((r, i) => (
                      <tr key={r.id ?? i} style={{ borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>#{r.id ?? '—'}</td>
                        <td style={{ padding: '8px 12px', maxWidth: 120 }}>
                          {r.project_id ? (
                            <button onClick={() => openAdminProject(navigate, r.project_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{r.project_name || '—'}</span>
                            </button>
                          ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={r.user_name || ''}>{r.user_name || '—'}</span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.page_goal || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{badge(r.status)}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {r.scores?.overall != null ? (
                            <span style={{ fontSize: 11, fontWeight: 800, color: scoreColor(r.scores.overall) }}>{r.scores.overall}</span>
                          ) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtFull(r.created_at)}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}><button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" aria-label="View review" style={{ padding: 4 }}><Eye size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {searchTotalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {((searchPage - 1) * 10) + 1}–{Math.min(searchPage * 10, searchTotal)} of {searchTotal}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSearchPage(p => Math.max(1, p - 1))} disabled={searchPage <= 1} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: 11 }}>
                      <ChevronLeft size={11} /> Prev
                    </button>
                    <button onClick={() => setSearchPage(p => Math.min(searchTotalPages, p + 1))} disabled={searchPage >= searchTotalPages} className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: 11 }}>
                      Next <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : search.trim() ? (
            <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
              <AlertCircle size={18} style={{ color: 'var(--text-muted)', margin: '0 auto 6px', display: 'block' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>No results for "{search}"</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Try a different search term.</p>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
