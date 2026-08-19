import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Loader2, AlertCircle, Eye, RefreshCw, ChevronLeft, ChevronRight, Filter, Star, X } from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import { openAdminReview, openAdminProject, openAdminUser } from '../../utils/adminNav';

function SelectFilter({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  // Sync state → URL params
  const syncToUrl = useCallback((overrides = {}) => {
    const params = {};
    if (search) params.search = search;
    if (status !== 'all') params.status = status;
    if (sort !== 'newest') params.sort = sort;
    if ((overrides.page || page) > 1) params.page = overrides.page || page;
    setSearchParams(params, { replace: true });
  }, [search, status, sort, page, setSearchParams]);

  // Reset to page 1 when filters/sort/search change
  useEffect(() => { setPage(1); syncToUrl({ page: 1 }); }, [search, status, sort]);

  const loadReviews = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = { page: pg, per_page: 20 };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      if (sort !== 'newest') params.sort = sort;
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

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    setPage(pageFromUrl);
    loadReviews(pageFromUrl);
  }, [searchParams]);

  const getStatusBadge = (s) => {
    switch (s) {
      case 'completed': return <span className="badge badge-green">Completed</span>;
      case 'analyzing': return <span className="badge badge-blue">Analyzing</span>;
      case 'pending': return <span className="badge badge-gray">Pending</span>;
      case 'failed': return <span className="badge badge-red">Failed</span>;
      default: return <span className="badge badge-gray">{s || 'Unknown'}</span>;
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

  const activeFilterCount = [status !== 'all', sort !== 'newest'].filter(Boolean).length;
  const hasActiveFilters = search || activeFilterCount > 0;
  const clearAllFilters = () => { setStatus('all'); setSort('newest'); setSearch(''); syncToUrl({ page: 1 }); };

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }}>Admin</button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Reviews</span>
        </div>

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-page-title">All Reviews</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {loading ? '…' : `${total} review${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <AdminReloadBtn onClick={() => loadReviews(page)} title="Refresh reviews" />
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by project or goal…"
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
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <SelectFilter label="Status" value={status}
              options={[
                { value: 'all', label: 'All' },
                { value: 'completed', label: 'Completed' },
                { value: 'analyzing', label: 'Analyzing' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
              ]}
              onChange={v => { setStatus(v); setPage(1); syncToUrl({ page: 1 }); }} />
            <SelectFilter label="Sort" value={sort}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'score_high', label: 'Highest Score' },
                { value: 'score_low', label: 'Lowest Score' },
              ]}
              onChange={v => { setSort(v); setPage(1); syncToUrl({ page: 1 }); }} />
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0.35rem 0.625rem', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {status !== 'all' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                <button onClick={() => { setStatus('all'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
            {sort !== 'newest' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Sort: {sort === 'oldest' ? 'Oldest' : sort === 'score_high' ? 'Highest Score' : 'Lowest Score'}
                <button onClick={() => { setSort('newest'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

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
              {search || status !== 'all' || sort !== 'newest' ? 'No results found' : 'No reviews yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search || status !== 'all' || sort !== 'newest'
                ? 'Try changing your search or filters'
                : 'Reviews will appear here once created'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
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
                {reviews.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                    {/* Project — clickable */}
                    <td style={{ padding: '11px 12px', maxWidth: 140 }}>
                      {r.project_id ? (
                        <button
                          onClick={() => openAdminProject(navigate, r.project_id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            font: 'inherit', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                            {r.project_name || '—'}
                          </span>
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    {/* User — clickable to admin user detail */}
                    <td style={{ padding: '11px 12px', maxWidth: 120 }}>
                      {r.user_id && r.user_name ? (
                        <button
                          onClick={() => openAdminUser(navigate, r.user_id)}
                          title={`View ${r.user_name}'s profile`}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            font: 'inherit', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                            {r.user_name}
                          </span>
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    {/* Goal */}
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 160 }}>
                      <span title={r.page_goal || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      <button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" style={{ padding: 5 }}>
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total} reviews
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => { const p = Math.max(1, page - 1); setPage(p); syncToUrl({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page <= 1}
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
                  >
                    <ChevronLeft size={12} /> Prev
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); syncToUrl({ page: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
