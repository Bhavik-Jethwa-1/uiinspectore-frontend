import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, Search, RefreshCw, Trash2, Eye,
  ChevronLeft, ChevronRight, AlertCircle, Loader2, X,
  Star, Clock, CheckCircle, XCircle, Image as ImageIcon
} from 'lucide-react';

const ACCENT = '#7c5cff';

function StatusBadge({ status }) {
  const configs = {
    active:    { color: '#22c55e', label: 'Active' },
    draft:     { color: '#6b7280', label: 'Draft' },
    archived:  { color: '#f97316', label: 'Archived' },
    deleted:   { color: '#ef4444', label: 'Deleted' },
  };
  const cfg = configs[status] || configs.draft;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border)' }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const perPage = 10;

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('inspector_token');
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/admin/inspector/projects?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error('Admin access required');
        if (res.status === 404) throw new Error('Endpoint not found');
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setProjects(json.projects || json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.total_pages || Math.ceil((json.total || 0) / perPage));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project? All associated reviews and screenshots will also be deleted.')) return;
    setActionLoading(projectId);
    try {
      const token = localStorage.getItem('inspector_token');
      const res = await fetch(`/api/admin/inspector/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchProjects();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Projects</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${total} total projects`}
          </p>
        </div>
        <button onClick={fetchProjects}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ background: 'rgba(124,92,255,0.1)', color: ACCENT }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by project name or owner..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-[13px]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.05)' }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-red-400">{error}</p>
          </div>
          <button onClick={fetchProjects} className="text-[11px] underline" style={{ color: 'var(--text-muted)' }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Project', 'Owner', 'Status', 'Reviews', 'Screenshots', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FolderOpen size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No projects found</p>
                  </td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id} className="border-b last:border-0 transition-colors hover:opacity-80"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(124,92,255,0.1)' }}>
                          <FolderOpen size={16} style={{ color: ACCENT }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{project.name}</p>
                          {project.description && (
                            <p className="text-[11px] truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: ACCENT }}>
                          {project.owner_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-[12px]" style={{ color: 'var(--text)' }}>
                          {project.owner_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} style={{ color: '#f59e0b' }} />
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>
                          {project.reviews_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ImageIcon size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          {project.screenshots_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={actionLoading === project.id}
                          className="p-1.5 rounded-lg transition-opacity hover:opacity-70 disabled:opacity-50"
                          style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border transition-opacity disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border transition-opacity disabled:opacity-30"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
