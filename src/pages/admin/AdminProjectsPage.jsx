import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Search, Loader2, AlertCircle, Eye, FolderOpen, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';

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

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProjects = useCallback(async (pg = 1) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      // ONE aggregated API call — admin-only endpoint with user data (no N+1)
      const params = { page: pg, per_page: 10 };
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
  }, [token, search]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { loadProjects(page); }, [loadProjects, page]);

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  };

  const handleDeleteProject = (project) => {
    setConfirmModal({
      type: 'delete_project',
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      projectId: project.id,
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
      } catch (e) {
        setConfirmModal({
          ...confirmModal,
          message: e.message || 'Failed to delete project. Please try again.',
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="admin-page" style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div className="admin-page-content" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, width: '100%' }}>
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

        {/* Search */}
        <div className="admin-search" style={{ marginBottom: 14, width: '100%', maxWidth: '100%' }}>
          <div className="admin-search-wrapper" style={{ position: 'relative' }}>
            <Search size={13} className="admin-search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="admin-search-input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)', fontSize: 13, width: '100%' }}
            />
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
          <div className="card admin-table-container" style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
            <div className="admin-table-scroll" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 0 }}>
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
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      {p.user ? (
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.user.name}</span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                        {p.reviews_count ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td style={{ padding: '11px 12px', minWidth: 80, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Link to={`/projects/${p.id}`} className="btn-icon" title="View project" style={{ padding: 6 }}>
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleDeleteProject(p)} className="btn-icon" title="Delete" style={{ color: 'var(--error)', padding: 6 }}>
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
                  Page {page} of {totalPages} · {total} projects
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

        {/* Confirm Modal */}
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
    </div>
  );
}
