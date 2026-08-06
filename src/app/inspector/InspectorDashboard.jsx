import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FolderOpen, Sparkles, ArrowRight, Upload, Clock,
  ChevronRight, Image, Zap, TrendingUp
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { useInspectorAuth } from '../../contexts/InspectorAuthContext';
import { ACCENT } from './constants/theme';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-lg ${className}`} style={{ background: 'var(--surface2)' }} />;
}

// ─── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[18px] font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Welcome Card ───────────────────────────────────────────────────────────
function WelcomeCard({ userName, onQuickUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a1625 0%, #0f1623 100%)', border: '1px solid rgba(124,92,255,0.2)' }}
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${ACCENT}40, transparent)`, transform: 'translate(30%, -30%)' }} />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold mb-1" style={{ color: '#ffffff' }}>
              Good {getTimeOfDay()}, {userName?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              Ready to review your UI? Upload a screenshot to get started.
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${ACCENT}20` }}>
            <Sparkles size={20} style={{ color: ACCENT }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            onClick={onQuickUpload}
            className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: ACCENT }}
          >
            <Upload size={15} /> Upload Screenshot
          </button>
          <Link to="/inspector/projects/new"
            className="flex items-center whitespace-nowrap gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Create Project <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ─── Quick Upload ────────────────────────────────────────────────────────────
function QuickUploadCard({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group"
      style={{ borderColor: dragging ? ACCENT : 'var(--border)' }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
        style={{ background: dragging ? `${ACCENT}20` : 'var(--surface2)' }}>
        <Upload size={22} style={{ color: dragging ? ACCENT : 'var(--text-muted)' }} />
      </div>
      <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text)' }}>
        Drop your screenshot here
      </p>
      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
        or click to browse — PNG, JPG, WEBP
      </p>
    </motion.div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────
function ProjectCard({ project, delay = 0 }) {
  const navigate = useNavigate();
  const review = project.review;
  const score = review?.scores?.overall;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => navigate(`/inspector/projects/${project.id}`)}
      className="group rounded-2xl border p-4 cursor-pointer transition-all hover:border-opacity-100"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video"
        style={{ background: 'var(--surface2)' }}>
        {project.screenshots?.[0]?.url ? (
          <img src={project.screenshots[0].url} alt={project.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image size={24} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
        )}
        {score != null && (
          <div className="absolute bottom-2 right-2">
            <ScoreRing score={score} size={44} stroke={4} />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-[13px] font-semibold truncate mb-1" style={{ color: 'var(--text)' }}>
        {project.name}
      </h3>
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <Clock size={10} />
        {timeAgo(project.updated_at)}
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

// ─── Continue Card ───────────────────────────────────────────────────────────
function ContinueCard({ project }) {
  const navigate = useNavigate();
  const review = project.review;
  const score = review?.scores?.overall;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
      onClick={() => navigate(`/inspector/projects/${project.id}`)}
      className="rounded-2xl border p-5 cursor-pointer transition-all hover:border-opacity-100 flex items-center gap-4"
      style={{ background: 'var(--surface)', borderColor: score ? 'var(--border)' : ACCENT }}
    >
      {project.screenshots?.[0]?.url ? (
        <img src={project.screenshots[0].url} alt={project.name}
          className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface2)' }}>
          <Image size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium mb-1" style={{ color: ACCENT }}>Continue where you left off</p>
        <h3 className="text-[14px] font-semibold truncate mb-1" style={{ color: 'var(--text)' }}>{project.name}</h3>
        <div className="flex items-center gap-3">
          {score != null && (
            <span className="text-[12px] font-medium" style={{ color: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
              {score}/100
            </span>
          )}
          {review ? (
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>View analysis</span>
          ) : (
            <span className="text-[11px]" style={{ color: ACCENT }}>Finish review</span>
          )}
        </div>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
    </motion.div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
      {action && (
        <button onClick={onAction}
          className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: ACCENT }}>
          {action} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Stats Row ───────────────────────────────────────────────────────────────
function StatsRow({ projects }) {
  const reviewed = projects.filter(p => p.status === 'reviewed').length;
  const pending = projects.filter(p => p.status === 'draft' || p.status === 'reviewing').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {[
        { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: ACCENT },
        { label: 'Reviews Done', value: reviewed, icon: Sparkles, color: '#22c55e' },
        { label: 'In Progress', value: pending, icon: TrendingUp, color: '#f59e0b' },
      ].map((stat) => (
        <div key={stat.label} className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
            style={{ background: `${stat.color}15` }}>
            <stat.icon size={14} style={{ color: stat.color }} />
          </div>
          <div className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function InspectorDashboard() {
  const { user } = useInspectorAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    inspectorApi.getProjects()
      .then(data => setProjects(data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickUpload = () => navigate('/inspector/projects/new');

  const recentProjects = projects.slice(0, 6);
  const lastProject = projects.find(p => p.status !== 'reviewed');

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Welcome */}
      <WelcomeCard userName={user?.name || "there"} onQuickUpload={handleQuickUpload} />

      {/* Continue last */}
      {!loading && lastProject && (
        <div className="mt-5">
          <ContinueCard project={lastProject} />
        </div>
      )}

      {/* Stats */}
      <div className="mt-6">
        <SectionHeader title="Overview" />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
          </div>
        ) : (
          <StatsRow projects={projects} />
        )}
      </div>

      {/* Recent Projects */}
      <div className="mt-8">
        <SectionHeader title="Recent Projects" action="View all" onAction={() => navigate('/inspector/projects')} />
        {loading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--surface2)' }}>
              <FolderOpen size={22} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text)' }}>No projects yet</p>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-muted)' }}>Upload your first screenshot to get started</p>
            <button onClick={handleQuickUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: ACCENT }}>
              <Plus size={14} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentProjects.map((p, i) => <ProjectCard key={p.id} project={p} delay={i * 0.04} />)}
          </div>
        )}
      </div>
    </div>
  );
}
