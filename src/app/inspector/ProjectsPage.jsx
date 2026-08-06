import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, FolderOpen, Clock, MoreHorizontal, Trash2, Eye,
  Copy, Archive, Edit3, Image, Loader2, Sparkles
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { ACCENT } from './constants/theme';

function ProjectMenu({ project, onDelete }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
        onBlur={() => setTimeout(() => setOpen(false), 150)}>
        <MoreHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-xl border shadow-xl z-20 py-1 min-w-[140px]"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
          <button onClick={() => { navigate(`/inspector/projects/${project.id}`); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[12px] hover:bg-white/5 text-left"
            style={{ color: 'var(--text-muted)' }}>
            <Eye size={12} /> Open
          </button>
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/inspector/projects/${project.id}`); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[12px] hover:bg-white/5 text-left"
            style={{ color: 'var(--text-muted)' }}>
            <Copy size={12} /> Copy Link
          </button>
          <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
          <button onClick={() => { onDelete(project.id); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-[12px] hover:bg-white/5 text-left"
            style={{ color: '#ef4444' }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, delay = 0 }) {
  const navigate = useNavigate();
  const screenshot = project.screenshots?.[0];
  const review = project.latest_review;
  const score = review?.scores?.overall;

  const statusLabel = {
    draft: { label: 'Draft', color: 'var(--text-muted)' },
    reviewing: { label: 'Analyzing…', color: '#f59e0b' },
    reviewed: { label: 'Reviewed', color: '#22c55e' },
  }[project.status] || { label: project.status, color: 'var(--text-muted)' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate(`/inspector/projects/${project.id}`)}
      className="group rounded-2xl border p-4 cursor-pointer transition-all hover:border-opacity-100 relative"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderOpacity: 0.6 }}
    >
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video" style={{ background: 'var(--surface2)' }}>
        {screenshot?.url ? (
          <img src={screenshot.url} alt={project.name}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={22} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          </div>
        )}
        {score != null && (
          <div className="absolute bottom-2 right-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {score}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-[13px] font-semibold truncate mb-1.5" style={{ color: 'var(--text)' }}>{project.name}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <Clock size={10} />
          {timeAgo(project.updated_at)}
        </div>
        <span className="text-[10px] font-medium" style={{ color: statusLabel.color }}>{statusLabel.label}</span>
      </div>

      {/* Hover actions */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ProjectMenu project={project} onDelete={() => {}} />
      </div>
    </motion.div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="rounded-xl aspect-video mb-3 skeleton" />
      <div className="h-4 rounded skeleton mb-2" style={{ width: '70%' }} />
      <div className="h-3 rounded skeleton" style={{ width: '40%' }} />
    </div>
  );
}

export default function InspectorProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | reviewed | draft
  const navigate = useNavigate();

  const loadProjects = () => {
    inspectorApi.getProjects()
      .then(data => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await inspectorApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const filtered = filter === 'all' ? projects
    : filter === 'reviewed' ? projects.filter(p => p.status === 'reviewed')
    : projects.filter(p => p.status !== 'reviewed');

  return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>Projects</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button onClick={() => navigate('/inspector/projects/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: ACCENT }}>
            <Plus size={15} /> New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-6">
          {[['all', 'All'], ['reviewed', 'Reviewed'], ['draft', 'In Progress']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{
                background: filter === val ? `${ACCENT}15` : 'transparent',
                color: filter === val ? ACCENT : 'var(--text-muted)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface2)' }}>
              <FolderOpen size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
              {filter === 'all' ? 'No projects yet' : `No ${filter} projects`}
            </p>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'Upload your first UI screenshot to get started' : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/inspector/projects/new')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: ACCENT }}>
                <Plus size={14} /> Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p, i) => (
              <div key={p.id}>
                <ProjectCard project={p} delay={i * 0.03} />
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

