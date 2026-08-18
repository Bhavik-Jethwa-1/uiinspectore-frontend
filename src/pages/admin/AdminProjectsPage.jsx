import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import {
  Search, Loader2, AlertCircle, Eye, FolderOpen,
  RefreshCw, ChevronLeft, ChevronRight, Trash2, Filter, X, ChevronDown
} from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import ConfirmModal from '../../components/ConfirmModal';
import { openAdminProject } from '../../utils/adminNav';

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
        <ChevronDown size={10} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const syncToUrl = useCallback((overrides = {}) => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (sort !== 'newest') params.sort = sort;
    if ((overrides.page || page) > 1) params.page = overrides.page || page;
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, sort, page]);

  useEffect(() => { setPage(1); syncToUrl({ page: 1 }); }, [search, statusFilter, sort]);

  const loadProjects = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, per_page: 20, sort };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.adminGetProjects(token, params);
      setProjects(data.projects);
      setTotal(data.total);
      setTotalPages(data.last_page);
      setPage(data.current_page);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, sort]);

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    setPage(pageFromUrl);
    loadProjects(pageFromUrl);
  }, [searchParams]);

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  const ucFirst = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const handleDeleteProject = (project) => {
    setConfirmModal({
      type: 'delete_project',
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"?${project.reviews_count ? ` This project has ${project.reviews_count} review${project.reviews_count !== 1 ? 's' : ''} that will become orphaned.` : ''} This action cannot be undone.`,
      details: [
        { label: 'Project', value: project.name },
        { label: 'Reviews', value: `${project.reviews_count ?? 0}` },
        { label: 'Owner', value: project.user?.name || '—' },
      ],
      confirmLabel: 'Delete',
      variant: 'danger',
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'delete_project') {
      setActionLoading(true);
      try {
        await api.adminDeleteProject(confirmModal.projectId, token);
        setConfirmModal(null);
        loadProjects(page);
        addToast({ type: 'success', message: `Project "${confirmModal.projectName}" deleted successfully.` });
      } catch (e) {
        addToast({ type: 'error', message: e.message || 'Failed to delete project.' });
        setConfirmModal(null);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const activeFilterCount = [statusFilter !== 'all', sort !== 'newest'].filter(Boolean).length;
  const hasActiveFilters = search || activeFilterCount > 0;
  const clearAllFilters = () => { setStatusFilter('all'); setSort('newest'); setSearch(''); };

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, padding: 0 }}>Admin</button>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Projects</span>
        </div>

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-page-title">All Projects</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {loading ? '…' : `${total} project${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <AdminReloadBtn onClick={() => loadProjects(page)} title="Refresh projects" />
        </div>

        {/* Search + Filters */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              style={{
                paddingLeft: 32, paddingRight: 12, borderRadius: 'var(--radius-sm)',
                fontSize: 13, width: '100%', height: 36,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <SelectFilter label="Status" value={statusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'failed', label: 'Failed' },
                { value: 'no-reviews', label: 'No Reviews' },
              ]}
              onChange={v => { setStatusFilter(v); setPage(1); syncToUrl({ page: 1 }); }} />
            <SelectFilter label="Sort" value={sort}
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
                { value: 'name_asc', label: 'Name A–Z' },
                { value: 'name_desc', label: 'Name Z–A' },
                { value: 'reviews_desc', label: 'Most Reviews' },
                { value: 'reviews_asc', label: 'Fewest Reviews' },
              ]}
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
            {statusFilter !== 'all' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Status: {statusFilter === 'no-reviews' ? 'No Reviews' : ucFirst(statusFilter.replace('-', ' '))}
                <button onClick={() => { setStatusFilter('all'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
            {sort !== 'newest' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Sort: {sort === 'oldest' ? 'Oldest' : sort === 'name_asc' ? 'Name A–Z' : sort === 'name_desc' ? 'Name Z–A' : sort === 'reviews_desc' ? 'Most Reviews' : 'Fewest Reviews'}
                <button onClick={() => { setSort('newest'); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '48px 0', textAlign: 'center' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading projects…</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <AlertCircle size={20} style={{ color: 'var(--error)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Something went wrong</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
            <button className="btn-primary" onClick={() => loadProjects(1)}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
              <FolderOpen size={20} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search || activeFilterCount > 0 ? 'No results found' : 'No projects yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search || activeFilterCount > 0 ? 'Try changing your search or filters' : 'Projects will appear here once created'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', minWidth: 800 }}>
              <colgroup>
                <col style={{ width: 160 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[
                    { label: 'Project', width: 160 },
                    { label: 'Owner' },
                    { label: 'Reviews', width: 70 },
                    { label: 'Avg Score', width: 80 },
                    { label: 'Last Review', width: 100 },
                    { label: 'Status', width: 90 },
                    { label: 'Created', width: 100 },
                    { label: 'Actions', width: 80 },
                  ].map(({ label, width }) => {
                    const centerCols = ['Reviews', 'Avg Score', 'Status', 'Actions'];
                    return (
                      <th key={label} style={{
                        padding: '8px 10px', fontSize: 10, fontWeight: 600,
                        color: 'var(--text-muted)', textAlign: centerCols.includes(label) ? 'center' : 'left',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: 'var(--background)', whiteSpace: 'nowrap',
                        ...(width ? { width: width } : {}),
                      }}>
                        {label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const scoreColor = p.avg_score != null
                    ? (p.avg_score >= 80 ? 'var(--success)' : p.avg_score >= 60 ? 'var(--warning)' : 'var(--error)')
                    : 'var(--text-muted)';
                  const statusVariant = p.status === 'active' ? 'green' : p.status === 'failed' ? 'red' : p.status === 'in-progress' ? 'yellow' : 'gray';
                  const statusLabel = p.status === 'no-reviews' ? 'No Reviews' : ucFirst(p.status ?? '');
                  return (
                    <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {/* Name */}
                      <td style={{ padding: '8px 10px', width: 160 }}>
                        <span title={p.name} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                      </td>
                      {/* Owner — clickable */}
                      <td style={{ padding: '8px 10px', width: 130, overflow: 'hidden' }}>
                        {p.user ? (
                          <button
                            onClick={() => navigate(`/admin/users/${p.user.id}`)}
                            title={`View ${p.user.name}'s profile`}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: 0, font: 'inherit', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              maxWidth: '100%',
                            }}
                          >
                            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                              {p.user.name}
                            </span>
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      {/* Reviews count */}
                      <td style={{ padding: '8px 10px', textAlign: 'center', width: 70 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                          {p.reviews_count ?? 0}
                        </span>
                      </td>
                      {/* Avg Score */}
                      <td style={{ padding: '8px 10px', textAlign: 'center', width: 80 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor }}>
                          {p.avg_score != null ? p.avg_score : '—'}
                        </span>
                      </td>
                      {/* Last Review */}
                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', width: 100 }}>
                        {p.last_review_date ? formatDate(p.last_review_date) : '—'}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '8px 10px', textAlign: 'center', width: 90 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 9999,
                          fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                          background: statusVariant === 'green' ? 'var(--success-light)' :
                            statusVariant === 'red' ? 'var(--error-light)' :
                            statusVariant === 'yellow' ? 'color-mix(in srgb, var(--warning) 15%, transparent)' :
                            'var(--hover)',
                          color: statusVariant === 'green' ? 'var(--success)' :
                            statusVariant === 'red' ? 'var(--error)' :
                            statusVariant === 'yellow' ? 'var(--warning)' :
                            'var(--text-secondary)',
                        }}>
                          {statusLabel}
                        </span>
                      </td>
                      {/* Created Date */}
                      <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', width: 100 }}>
                        {formatDate(p.created_at)}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '8px 10px', width: 80, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button
                            onClick={() => openAdminProject(navigate, p.id)}
                            className="btn-icon"
                            title="View project"
                            style={{ padding: 5 }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p)}
                            className="btn-icon"
                            title="Delete project"
                            style={{ color: 'var(--error)', padding: 5 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total} projects
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

      {/* Confirm Modal */}
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
