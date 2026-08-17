import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Loader2, AlertCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronRight size={11} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%) rotate(90deg)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      // ONE aggregated API call — no N+1 queries
      const params = { page: pg, per_page: 10 };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      if (sort) params.sort = sort;
      const data = await api.adminGetReviews(token, params);
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.last_page);
      setPage(data.current_page);
    } catch (e) {
      setError(e.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [token, search, status, sort]);

  useEffect(() => { setPage(1); }, [search, status, sort]);
  useEffect(() => { loadReviews(page); }, [loadReviews, page]);

  const filtered = reviews.filter(r =>
    r.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.page_goal?.toLowerCase().includes(search.toLowerCase()) ||
    String(r.id)?.includes(search)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge badge-green">Completed</span>;
      case 'analyzing': return <span className="badge badge-blue">Analyzing</span>;
      case 'pending': return <span className="badge badge-gray">Pending</span>;
      case 'failed': return <span className="badge badge-red">Failed</span>;
      default: return <span className="badge badge-gray">{status || 'Unknown'}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              All Reviews
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {loading ? '…' : `${total} review${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button onClick={() => loadReviews(page)} className="admin-btn-icon" title="Refresh" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
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
              placeholder="Search by project or goal…"
              className="input"
              style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)', fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <SelectFilter label="Status" value={status}
              options={[{ value: 'all', label: 'All' }, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'analyzing', label: 'Analyzing' }]}
              onChange={setStatus} />
            <SelectFilter label="Sort" value={sort}
              options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'score_high', label: 'Score ↑' }, { value: 'score_low', label: 'Score ↓' }]}
              onChange={setSort} />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading reviews…</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" onClick={() => loadReviews(1)}>Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <Star size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search || status !== 'all' ? 'No results found' : 'No reviews yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search || status !== 'all' ? `No reviews matching "${search || status}"` : 'Reviews will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="card admin-table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Project', 'User', 'Goal', 'Status', 'Score', 'Date', ''].map(h => (
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
                {reviews.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                    <td style={{ padding: '11px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.project_name}
                    </td>
                    {/* User */}
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }} title={r.user_name || ''}>
                        {r.user_name || '—'}
                      </span>
                    </td>
                    {/* Goal */}
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 160 }}>
                      <span
                        title={r.page_goal || ''}
                        style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
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
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(r.created_at)}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <Link to={`/review/${r.id}`} className="btn-icon" title="View review">
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
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
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
                  >
                    Next <ChevronRight size={12} />
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
