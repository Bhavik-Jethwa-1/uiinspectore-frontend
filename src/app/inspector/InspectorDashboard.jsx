import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Sparkles, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import InspectorLayout from './layouts/InspectorLayout';
import { ACCENT } from './constants/theme';

export default function InspectorDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    inspectorApi.getProjects()
      .then(data => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: ACCENT },
    { label: 'Reviews Done', value: projects.filter(p => p.status === 'reviewed').length, icon: Sparkles, color: '#10b981' },
    { label: 'Pending Review', value: projects.filter(p => p.status === 'draft' || p.status === 'reviewing').length, icon: TrendingUp, color: '#f59e0b' },
  ];

  const recentProjects = projects.slice(0, 6);

  return (
    <InspectorLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[20px] sm:text-[24px] font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>AI-powered UI/UX review platform</p>
          </div>
          <Link to="/inspector/projects/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: ACCENT }}>
            <Plus size={16} /> New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${s.color}20` }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>{loading ? '—' : s.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>Recent Projects</h2>
            <Link to="/inspector/projects" className="text-[12px] font-medium flex items-center gap-1" style={{ color: ACCENT }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin opacity-50" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--border)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}15` }}>
                <FolderOpen size={22} style={{ color: ACCENT }} />
              </div>
              <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>No projects yet</h3>
              <p className="text-[13px] mb-5" style={{ color: 'var(--text-muted)' }}>Upload a UI screenshot and get AI-powered review instantly</p>
              <Link to="/inspector/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{ background: ACCENT }}>
                <Plus size={14} /> Create your first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border p-4 cursor-pointer transition-all hover:border-opacity-100"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderOpacity: 0.6 }}
                  onClick={() => navigate(`/inspector/projects/${project.id}`)}>
                  {/* Screenshot preview */}
                  <div className="w-full rounded-xl mb-3 overflow-hidden flex items-center justify-center"
                    style={{ height: 120, background: 'var(--surface2)' }}>
                    {project.screenshots?.[0] ? (
                      <img src={project.screenshots[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FolderOpen size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold truncate mb-1" style={{ color: 'var(--text)' }}>{project.name}</h3>
                  <p className="text-[11px] truncate mb-2" style={{ color: 'var(--text-muted)' }}>{project.description || 'No description'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                      background: project.status === 'reviewed' ? '#D1FAE5' : '#FEF3C7',
                      color: project.status === 'reviewed' ? '#065F46' : '#92400E',
                    }}>
                      {project.status === 'reviewed' ? 'Reviewed' : project.status === 'reviewing' ? 'Analyzing…' : 'Draft'}
                    </span>
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </InspectorLayout>
  );
}
