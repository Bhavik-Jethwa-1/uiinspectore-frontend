import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import {
  Search, Loader2, AlertCircle, Eye, FolderOpen,
  RefreshCw, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import ConfirmModal from '../../components/ConfirmModal';
import { openAdminProject } from '../../utils/adminNav';

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const syncToUrl = useCallback((overrides = {}) => {
    const params = {};
    if (search) params.search = search;
    if (sort !== 'newest') params.sort = sort;
    if ((overrides.page || page) > 1) params.page = overrides.page || page;
    setSearchParams(params, { replace: true });
  }, [search, sort, page]);

  useEffect(() => { setPage(1); syncToUrl({ page: 1 }); }, [search, sort]);

  const loadProjects = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = { page: pageNum, per_page: 10, sort };
      if (search) params.search = search;
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
  }, [token, search, sort]);

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

  const handleDeleteProject = (project) => {
    setConfirmModal({
      type: 'delete_project',
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"?${project.reviews_count ? ` This project has ${project.reviews_count} review${project.reviews_count !== 1 ? 's' : ''} that will become orphaned.` : ''} This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      projectId: project.id,
      projectName: project.name,
      reviewsCount: project.reviews_count,
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

  return (
    <div className="admin-page" style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="admin-page-content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              All Projects
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {loading ? '…' : `${total} project${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <AdminReloadBtn onClick={() => loadProjects(page)} title="Refresh projects" />
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Admin</span>
          <span>/</span>
          <span>Projects</span>
        </div>

        {/* Search + Sort */}
        <div style={{ marginBottom: 14, width: '100%', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
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
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
              <option value="reviews_desc">Most Reviews</option>
              <option value="reviews_asc">Fewest Reviews</option>
            </select>
          </div>
        </div>

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
              {search ? 'No results found' : 'No projects yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {search ? `No projects matching "${search}"` : 'Projects will appear here once created'}
            </p>
          </div>
        ) : (
          <div className="card admin-table-container" style={{ overflow: 'hidden', width: '100%' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Owner', 'Reviews', 'Created', 'Actions'].map(h => {
                      const centerCols = ['Reviews', 'Actions'];
                      return (
                        <th key={h} style={{
                          padding: '10px 12px', fontSize: 10, fontWeight: 600,
                          color: 'var(--text-muted)', textAlign: centerCols.includes(h) ? 'center' : 'left',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: 'var(--background)', whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {/* Name */}
                      <td style={{ padding: '11px 12px' }}>
                        <span
                          title={p.name}
                          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {p.name}
                        </span>
                      </td>
                      {/* Owner — clickable to user detail */}
                      <td style={{ padding: '11px 12px' }}>
                        {p.user ? (
                          <button
                            onClick={() => navigate(`/admin/users/${p.user.id}`)}
                            title={`View ${p.user.name}'s profile`}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: 0, font: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
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
                      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                          {p.reviews_count ?? 0}
                        </span>
                      </td>
                      {/* Created */}
                      <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(p.created_at)}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '11px 12px', minWidth: 80, textAlign: 'center' }}>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total} projects
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => { const p = Math.max(1, page - 1); setPage(p); syncToUrl({ page: p }); }}
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
                    onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); syncToUrl({ page: p }); }}
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

      {/* Confirm Modal — uses shared ConfirmModal with ESC support */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
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
