import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Loader2, Trash2, ArrowRight } from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import InspectorLayout from './layouts/InspectorLayout';
import { ACCENT } from './constants/theme';

export default function InspectorProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    inspectorApi.getProjects()
      .then(data => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its reviews?')) return;
    setDeleting(id);
    try {
      await inspectorApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete project');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <InspectorLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[20px] sm:text-[24px] font-bold" style={{ color: 'var(--text)' }}>Projects</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/inspector/projects/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: ACCENT }}>
            <Plus size={16} /> New Project
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-[13px] outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin opacity-50" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--border)' }}>
            <FolderOpen size={28} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px' }} />
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              {search ? 'No projects match your search' : 'No projects yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(project => (
              <div key={project.id}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all hover:border-opacity-100"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderOpacity: 0.6 }}
                onClick={() => navigate(`/inspector/projects/${project.id}`)}>

                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--surface2)' }}>
                  {project.screenshots?.[0] ? (
                    <img src={project.screenshots[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FolderOpen size={20} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] sm:text-[14px] font-bold truncate" style={{ color: 'var(--text)' }}>{project.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium" style={{
                      background: project.status === 'reviewed' ? '#D1FAE5' : '#FEF3C7',
                      color: project.status === 'reviewed' ? '#065F46' : '#92400E',
                    }}>
                      {project.status === 'reviewed' ? 'Reviewed' : project.status === 'reviewing' ? 'Analyzing…' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {project.description || 'No description'} {project.screenshots?.length ? `• ${project.screenshots.length} screenshot${project.screenshots.length !== 1 ? 's' : ''}` : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {project.review && (
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[14px] font-bold" style={{ color: ACCENT }}>{project.review.scores?.overall ?? '—'}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  )}
                  <button onClick={e => handleDelete(e, project.id)}
                    className="p-2 rounded-lg opacity-50 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                    disabled={deleting === project.id}>
                    {deleting === project.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} className="text-red-400" />}
                  </button>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InspectorLayout>
  );
}
