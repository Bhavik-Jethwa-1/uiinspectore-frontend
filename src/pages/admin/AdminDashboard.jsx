import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Eye, Loader2, AlertCircle, RefreshCw, Users, FolderOpen, Star, AlertTriangle } from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import { openAdminReview } from '../../utils/adminNav';

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (token) loadStats();
  }, [token]);

  async function loadStats() {
    try {
      const data = await api.adminGetDashboard(token);
      setStats(data.stats);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadReviews();
  }, [token, page, search]);

  async function loadReviews() {
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      const data = await api.adminGetReviews(token, params);
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.last_page);
    } catch {}
  }

  const filtered = reviews;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-green">Completed</span>;
      case 'analyzing':
        return <span className="badge badge-blue">Analyzing</span>;
      case 'pending':
        return <span className="badge badge-gray">Pending</span>;
      case 'failed':
        return <span className="badge badge-red">Failed</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'var(--primary)' },
    { label: 'Total Projects', value: stats.total_projects, icon: FolderOpen, color: 'var(--success)' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: 'var(--warning)' },
    { label: 'Avg Score', value: stats.avg_score ?? '—', icon: Star, color: 'var(--primary)' },
    { label: 'Pending', value: stats.pending_reviews, icon: AlertTriangle, color: 'var(--warning)' },
    { label: 'Failed', value: stats.failed_reviews, icon: AlertCircle, color: 'var(--error)' },
  ] : [];

  return (
    <div className="admin-page" style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="admin-page-content" style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header + Refresh */}
        <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              Overview
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {stats ? `${stats.total_users} users · ${stats.total_projects} projects · ${stats.total_reviews} reviews` : 'Loading...'}
            </p>
          </div>
          <AdminReloadBtn onClick={loadStats} title="Refresh dashboard" />
        </div>

        {/* Stats Cards */}
        {!loading && stats && (
          <div className="stat-cards-grid">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card stat-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className="stat-icon" style={{ width: 24, height: 24, borderRadius: 6, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={12} style={{ color }} />
                  </div>
                </div>
                <p className="stat-value" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
                <p className="stat-label" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading stats */}
        {loading && (
          <div className="stat-cards-grid" style={{ opacity: 0.5 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ padding: '14px', height: 80 }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--border)', margin: 'auto' }} />
              </div>
            ))}
          </div>
        )}

        {/* Reviews Table */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Recent Reviews</h2>
        </div>

        {/* Search */}
        <div className="admin-search" style={{ marginBottom: 12, width: '100%', maxWidth: '100%' }}>
          <div className="admin-search-wrapper" style={{ position: 'relative' }}>
            <Search size={13} className="admin-search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search reviews..."
              className="admin-search-input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)', width: '100%' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <AlertCircle size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No results found' : 'No reviews yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No reviews matching "${search}"` : 'Reviews will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
            <div className="admin-table-scroll" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 0 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Project', 'User', 'Goal', 'Status', 'Score', 'Date', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px', fontSize: 10, fontWeight: 600,
                      color: 'var(--text-muted)', textAlign: 'left',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      background: 'var(--background)', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                    <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 120 }}>
                      <span className="truncate" style={{ display: 'block' }}>{r.project_name || '—'}</span>
                    </td>
                    {/* User */}
                    <td style={{ padding: '11px 12px' }}>
                      <span
                        title={r.user_name || ''}
                        style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', cursor: 'default' }}
                      >
                        {r.user_name || '—'}
                      </span>
                    </td>
                    {/* Goal */}
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 160 }}>
                      <span
                        title={r.page_goal || ''}
                        style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}
                      >
                        {r.page_goal || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>{getStatusBadge(r.status)}</td>
                    <td style={{ padding: '11px 12px' }}>
                      {r.scores?.overall ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(r.scores.overall) }}>
                          {r.scores.overall}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(r.created_at)}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View">
                        <Eye size={13} />
                      </button>
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
                  Page {page} of {totalPages} · {total} reviews
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
