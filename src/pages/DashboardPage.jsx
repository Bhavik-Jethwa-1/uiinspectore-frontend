import { useEffect, useState, useRef } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, FolderOpen, Sparkles, Clock, MoreVertical,
  Trash2, Edit3, Copy, Filter, ArrowUpRight, Image as ImageIcon,
  Zap, LayoutGrid, TrendingUp, Eye, Wand2, ChevronRight, Star,
  Activity, Layers, RefreshCw, X, CheckSquare, Square,
} from 'lucide-react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import CreateProjectModal from '../components/ui/CreateProjectModal';

const ACCENT   = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const ACCENT_CYAN = '#00d4ff';
const SUCCESS  = '#10b981';

const btnBase = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-transparent transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0';
const btnPrimary = `${btnBase} text-white [background:linear-gradient(135deg,${ACCENT},${ACCENT_PINK})] [box-shadow:0_4px_16px_rgba(124,92,255,0.4)] hover:[box-shadow:0_8px_28px_rgba(124,92,255,0.55)]`;
const btnSecondary = `${btnBase} bg-[var(--surface2)] text-[var(--text)] border-[var(--border)] hover:bg-[#22223a] hover:border-[rgba(124,92,255,0.3)]`;
const btnGhost = `${btnBase} bg-transparent text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]`;
const btnAccentCyan = `${btnBase} text-white [background:linear-gradient(135deg,#0891b2,#00d4ff)] [box-shadow:0_4px_16px_rgba(0,212,255,0.35)] hover:[box-shadow:0_8px_28px_rgba(0,212,255,0.5)]`;

/* ─── Project Placeholder Thumbnail ────────────────────────────────────────── */
function ProjectPlaceholder({ name, projectId }) {
  // Generate a stable, beautiful SVG thumbnail from the project name
  const seed = name
    ? name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : (projectId || 1);

  // Color pairs — rich SaaS palettes
  const palettes = [
    ['#7c5cff', '#ff6b9d'], // purple-pink
    ['#10b981', '#06b6d4'], // green-cyan
    ['#f59e0b', '#ef4444'], // amber-red
    ['#3b82f6', '#8b5cf6'], // blue-violet
    ['#ec4899', '#f43f5e'], // pink-rose
    ['#14b8a6', '#22d3ee'], // teal-cyan
    ['#f97316', '#fbbf24'], // orange-amber
    ['#6366f1', '#818cf8'], // indigo-light
  ];
  const [c1, c2] = palettes[seed % palettes.length];

  // Generate a mini dashboard UI in SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
    <defs>
      <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f0f1a"/>
        <stop offset="50%" stop-color="#13101f"/>
        <stop offset="100%" stop-color="#0d0d1a"/>
      </linearGradient>
      <linearGradient id="grad${seed}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="glow${seed}">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="400" height="225" fill="url(#bg${seed})"/>

    <!-- Sidebar -->
    <rect x="0" y="0" width="90" height="225" fill="#1a1a2e" opacity="0.8"/>
    <rect x="8" y="16" width="50" height="14" rx="7" fill="${c1}" opacity="0.9"/>
    <rect x="8" y="42" width="74" height="10" rx="5" fill="${c1}" opacity="0.25"/>
    <rect x="8" y="60" width="74" height="10" rx="5" fill="rgba(255,255,255,0.08)"/>
    <rect x="8" y="78" width="74" height="10" rx="5" fill="rgba(255,255,255,0.08)"/>
    <rect x="8" y="96" width="74" height="10" rx="5" fill="rgba(255,255,255,0.08)"/>
    <rect x="8" y="114" width="74" height="10" rx="5" fill="rgba(255,255,255,0.08)"/>

    <!-- Topbar -->
    <rect x="90" y="0" width="310" height="32" fill="#1a1a2e" opacity="0.6"/>
    <rect x="100" y="10" width="60" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
    <circle cx="370" cy="16" r="10" fill="${c1}" opacity="0.9"/>

    <!-- Stat cards row -->
    <rect x="100" y="42" width="88" height="52" rx="10" fill="#1e1e32" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <rect x="108" y="50" width="35" height="14" rx="7" fill="${c1}" opacity="0.85" filter="url(#glow${seed})"/>
    <rect x="108" y="70" width="55" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
    <rect x="108" y="82" width="40" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>

    <rect x="196" y="42" width="88" height="52" rx="10" fill="#1e1e32" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <rect x="204" y="50" width="35" height="14" rx="7" fill="${c2}" opacity="0.8"/>
    <rect x="204" y="70" width="55" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
    <rect x="204" y="82" width="40" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>

    <rect x="292" y="42" width="88" height="52" rx="10" fill="#1e1e32" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <rect x="300" y="50" width="35" height="14" rx="7" fill="${c1}" opacity="0.6"/>
    <rect x="300" y="70" width="55" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
    <rect x="300" y="82" width="40" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>

    <!-- Chart card -->
    <rect x="100" y="104" width="180" height="100" rx="12" fill="#1e1e32" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <rect x="112" y="114" width="60" height="8" rx="4" fill="rgba(255,255,255,0.12)"/>
    <!-- Bar chart -->
    <rect x="114" y="170" width="14" height="22" rx="3" fill="${c1}" opacity="0.7"/>
    <rect x="134" y="158" width="14" height="34" rx="3" fill="${c1}" opacity="0.85"/>
    <rect x="154" y="148" width="14" height="44" rx="3" fill="${c1}"/>
    <rect x="174" y="155" width="14" height="37" rx="3" fill="${c1}" opacity="0.9"/>
    <rect x="194" y="140" width="14" height="52" rx="3" fill="${c2}" opacity="0.9"/>
    <rect x="214" y="130" width="14" height="62" rx="3" fill="${c2}"/>
    <rect x="234" y="145" width="14" height="47" rx="3" fill="${c1}" opacity="0.8"/>
    <rect x="254" y="135" width="14" height="57" rx="3" fill="${c2}" opacity="0.85"/>

    <!-- List card -->
    <rect x="292" y="104" width="88" height="100" rx="12" fill="#1e1e32" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <rect x="300" y="114" width="50" height="7" rx="3.5" fill="rgba(255,255,255,0.12)"/>
    <rect x="300" y="128" width="72" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>
    <rect x="300" y="142" width="65" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>
    <rect x="300" y="156" width="72" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>
    <rect x="300" y="170" width="55" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>
    <rect x="300" y="184" width="68" height="8" rx="4" fill="rgba(255,255,255,0.07)"/>

    <!-- Bottom CTA -->
    <rect x="100" y="212" width="88" height="8" rx="4" fill="url(#grad${seed})" opacity="0.8"/>
  </svg>`;

  const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return (
    <img
      src={dataUri}
      alt={name}
      className="w-full h-full object-cover"
      onError={(e) => { e.currentTarget.style.display='none'; }}
    />
  );
}

/* ─── Animated Counter ─────────────────────────────────────────────────────── */
function CountUp({ target, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const start = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    start.current = null;
    const step = (ts) => {
      if (!start.current) start.current = ts;
      const p = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return <>{val.toLocaleString()}</>;
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3"
      style={{
        background: `linear-gradient(135deg, ${color}14 0%, ${color}06 100%)`,
        borderColor: `${color}28`,
        boxShadow: `0 4px 20px ${color}10`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    >
      {/* Glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: color }} />

      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {sub && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
            {sub}
          </span>
        )}
      </div>

      <div>
        <div className="text-[28px] font-black tracking-tighter" style={{ color }}>
          <CountUp target={value} />
        </div>
        <div className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--text-2)' }}>{label}</div>
      </div>
    </motion.div>
  );
}

/* ─── Project Card ───────────────────────────────────────────────────────── */
function ProjectCard({ project, onOpen, onDelete, onDuplicate, isSelected, onToggle, index = 0 }) {
  const [menu, setMenu] = useState(false);
  const timeAgo = formatDistanceToNow(
    new Date(project.updated_at || project.created_at || Date.now()),
    { addSuffix: true }
  );
  const screenCount = project.screens?.length || project.screen_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="group relative bg-[var(--surface)] rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        borderColor: isSelected ? ACCENT : 'var(--border)',
        boxShadow: isSelected
          ? `0 0 0 2px ${ACCENT}44, 0 8px 40px rgba(124,92,255,0.15)`
          : '0 0 0 1px transparent',
      }}
      whileHover={{ y: -4 }}
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] relative overflow-hidden" onClick={onOpen} style={{ cursor: 'pointer' }}>
        {project.thumbnail ? (
          <img src={project.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display='none'; }} />
        ) : (
          <ProjectPlaceholder name={project.name} projectId={project.id} />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-[13px] shadow-lg cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
            Open <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Selection checkbox */}
        <button
          className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 z-10"
          style={{
            background: isSelected ? ACCENT : 'rgba(0,0,0,0.5)',
            border: `1.5px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.3)'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: isSelected ? `0 0 0 2px ${ACCENT}44` : 'none',
          }}
          onClick={(e) => { e.stopPropagation(); onToggle(project.id); }}
          title={isSelected ? 'Deselect' : 'Select'}
        >
          {isSelected ? (
            <CheckSquare size={15} color="#fff" />
          ) : (
            <Square size={15} color="rgba(255,255,255,0.6)" />
          )}
        </button>

        {/* Screen count badge */}
        {screenCount > 0 && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            {screenCount} screen{screenCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Menu button */}
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/70"
          onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}
        >
          <MoreVertical size={15} />
        </button>
        <AnimatePresence>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenu(false); }} />
              <motion.div
                className="absolute top-10 right-2 z-20 bg-[var(--surface2)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden min-w-[170px]"
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                onClick={(e) => e.stopPropagation()}
              >
                {[
                  { icon: Edit3,   label: 'Open',       action: () => { setMenu(false); onOpen(); },      color: 'var(--text)' },
                  { icon: Copy,    label: 'Duplicate',  action: () => { setMenu(false); onDuplicate(); },  color: 'var(--text)' },
                  { icon: Trash2,  label: 'Delete',     action: () => { setMenu(false); onDelete(); },    color: 'var(--danger)' },
                ].map(({ icon: Icon2, label, action, color }) => (
                  <button
                    key={label}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-left transition-colors hover:bg-white/[0.04]"
                    style={{ color }}
                    onClick={action}
                  >
                    <Icon2 size={14} /> {label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Card footer */}
      <div className="px-4 pt-3 pb-3.5" onClick={onOpen} style={{ cursor: 'pointer' }}>
        <div className="text-[13px] font-bold truncate mb-2" style={{ color: 'var(--text)' }}>{project.name}</div>
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeAgo}</span>
          <div className="flex items-center gap-1.5">
            {project.ai_generated && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${ACCENT}18`, color: ACCENT }}>
                <Sparkles size={9} /> AI
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Template Card ──────────────────────────────────────────────────────── */
function TemplateCard({ template, onUse, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[rgba(124,92,255,0.35)] hover:shadow-[0_6px_30px_rgba(124,92,255,0.12)]"
      onClick={() => onUse(template)}
      whileHover={{ y: -3 }}
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display='none'; }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #13131f, #1c1028)' }}>
            <div className="relative w-[65%] h-[60%]">
              {[0, 1, 2].map((i) => (
                <div key={i}
                  className="absolute w-full h-full rounded-xl border border-white/10 shadow-xl"
                  style={{
                    background: ['rgba(124,92,255,0.3)', 'rgba(255,107,157,0.25)', 'rgba(0,212,255,0.2)'][i],
                    transform: `rotate(${-12 + i * 12}deg) translateY(${-3 + i * 5}px)`,
                    zIndex: 3 - i,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[12px] font-bold shadow-lg"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
            Use Template <ChevronRight size={12} />
          </div>
        </div>
      </div>
      <div className="px-3.5 pt-2.5 pb-3">
        <div className="text-[12px] font-bold truncate mb-0.5" style={{ color: 'var(--text)' }}>{template.name || 'Template'}</div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{template.category || template.description || 'Template'}</div>
      </div>
    </motion.div>
  );
}

/* ─── Recent Activity Item ──────────────────────────────────────────────── */
function ActivityItem({ icon: Icon, color, text, time }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}18` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] truncate" style={{ color: 'var(--text-2)' }}>{text}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{time}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const { user } = useAuth();
  const { ask } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, tplRes] = await Promise.allSettled([api.listProjects(), api.listTemplates()]);
      if (projRes.status === 'fulfilled') {
        const list = Array.isArray(projRes.value) ? projRes.value : (projRes.value.items || projRes.value.projects || []);
        setProjects(list);
      } else setProjects([]);
      if (tplRes.status === 'fulfilled') {
        const list = Array.isArray(tplRes.value) ? tplRes.value : (tplRes.value.items || tplRes.value.templates || []);
        setTemplates(list.slice(0, 8));
      } else setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = projects.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'archived' && !p.archived) return false;
    if (filter === 'recent') {
      const days = (Date.now() - new Date(p.updated_at || p.created_at || 0).getTime()) / 86400000;
      if (days > 7) return false;
    }
    return true;
  });

  const totalScreens = projects.reduce((s, p) => s + (p.screens?.length || p.screen_count || 0), 0);
  const recentProjects = projects.filter(p => {
    const days = (Date.now() - new Date(p.updated_at || p.created_at || 0).getTime()) / 86400000;
    return days <= 2;
  });

  const handleCreate = async (payload) => {
    const created = await api.createProject(payload);
    setShowCreate(false);
    navigate(`/app/editor/${created.id}`);
  };

  const handleDelete = async (p) => {
    if (!await ask({ title: 'Delete project?', message: `"${p.name}" will be permanently deleted.`, confirmLabel: 'Delete', danger: true })) return;
    await api.deleteProject(p.id);
    setProjects((list) => list.filter((x) => x.id !== p.id));
  };

  const handleDuplicate = async (p) => {
    const copy = await api.createProject({ name: `${p.name} (Copy)`, screens: p.screens || [] });
    setProjects((list) => [copy, ...list]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const names = filtered.filter((p) => selectedIds.includes(p.id)).map((p) => p.name);
    const joined = names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    if (!await ask({ title: 'Delete projects?', message: `${selectedIds.length} project${selectedIds.length !== 1 ? 's' : ''} (${joined}) will be permanently deleted.`, confirmLabel: `Delete ${selectedIds.length}`, danger: true })) return;
    await Promise.allSettled(selectedIds.map((id) => api.deleteProject(id)));
    setProjects((list) => list.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleUseTemplate = async (tpl) => {
    const project = await api.createProject({ name: tpl.name || 'New from template', template_id: tpl.id, screens: tpl.screens || [] });
    navigate(`/app/editor/${project.id}`);
  };

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-6 pt-8 pb-6" style={{
        background: `linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 40%, #12071f 100%)`,
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Ambient glows */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[80px] pointer-events-none" style={{ background: `${ACCENT}25` }} />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full blur-[70px] pointer-events-none" style={{ background: `${ACCENT_PINK}20` }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 max-w-7xl mx-auto">
          {/* Left: Welcome */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_PINK})` }}>
                <LayoutGrid size={14} color="#fff" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: `${ACCENT}` }}>Dashboard</span>
            </div>
            <h1 className="text-[22px] sm:text-[28px] font-black tracking-tight mb-1.5 leading-tight" style={{ color: 'var(--text)' }}>
              Welcome back, {user?.name || user?.first_name || user?.email?.split('@')[0] || 'there'}
            </h1>
            <p className="text-[12px] sm:text-[13px]" style={{ color: 'var(--text-muted)' }}>
              {projects.length === 0
                ? 'Ready to build something amazing? Start a new project or let AI generate your design.'
                : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''} — ${recentProjects.length} updated in the last 2 days.`}
            </p>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <button className={btnSecondary} onClick={() => navigate('/app/autodesigner')}>
              <Sparkles size={14} style={{ color: ACCENT }} /> AI Generate
            </button>
            <button className={btnAccentCyan} onClick={() => navigate('/app/premium-autodesigner')}>
              <Wand2 size={14} /> Premium AI
            </button>
            <button className={btnPrimary} onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <div className="relative max-w-7xl mx-auto mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={LayoutGrid} label="Total Projects"  value={projects.length}        color={ACCENT}      delay={0.0} />
          <StatCard icon={Layers}     label="Total Screens"   value={totalScreens}           color={ACCENT_CYAN} delay={0.08} />
          <StatCard icon={Zap}        label="AI Generations"   value={projects.filter(p => p.ai_generated).length} color={ACCENT_PINK} delay={0.16} />
          <StatCard icon={Activity}  label="Active This Week" value={recentProjects.length}   color={SUCCESS}     delay={0.24} />
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              className="flex items-center gap-3 p-3 mb-5 rounded-2xl border"
              style={{
                background: `linear-gradient(135deg, rgba(248,113,113,0.08), rgba(124,92,255,0.06))`,
                borderColor: 'rgba(248,113,113,0.25)',
                boxShadow: '0 4px 20px rgba(248,113,113,0.1)',
              }}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
            >
              {/* Selected count */}
              <div className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[13px] text-white shrink-0"
                  style={{ background: ACCENT }}>
                  {selectedIds.length}
                </div>
                <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                  {selectedIds.length === filtered.length ? 'All selected' : `selected`}
                </span>
              </div>

              {/* Select / Deselect all */}
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                {selectedIds.length === filtered.length ? <><Square size={12} /> Deselect all</> : <><CheckSquare size={12} /> Select all</>}
              </button>

              {/* Clear selection */}
              <button
                onClick={clearSelection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              >
                <X size={12} /> Clear
              </button>

              {/* Divider */}
              <div className="w-px h-6" style={{ background: 'var(--border)' }} />

              {/* Bulk delete */}
              <button
                onClick={bulkDeleteSelected}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#ef4444', boxShadow: '0 2px 10px rgba(239,68,68,0.3)' }}
              >
                <Trash2 size={13} /> Delete {selectedIds.length > 1 ? `${selectedIds.length} projects` : 'project'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <label className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex-1 text-[var(--text-muted)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.12)] transition-all min-w-0">
            <Search size={15} />
            <input
              type="text" placeholder="Search projects…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] min-w-0" style={{ color: 'var(--text)' }}
            />
          </label>
          <div className="flex gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shrink-0">
            {[['all','All'],['recent','Recent'],['archived','Archived']].map(([f, label]) => (
              <button key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150"
                style={filter === f
                  ? { background: ACCENT, color: '#fff', boxShadow: `0 2px 8px ${ACCENT}44` }
                  : { color: 'var(--text-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shrink-0" title="More filters">
            <Filter size={15} />
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] mb-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                <div className="skeleton aspect-[16/10]" />
                <div className="px-4 pt-3 pb-3.5 space-y-2">
                  <div className="skeleton h-3.5 rounded-lg" style={{ width: '65%' }} />
                  <div className="skeleton h-2.5 rounded-lg" style={{ width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => setShowCreate(true)} hasProjects={projects.length > 0} search={search} filter={filter} onClear={() => { setSearch(''); setFilter('all'); }} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                  {filter === 'all' ? 'All Projects' : filter === 'recent' ? 'Recent Projects' : 'Archived Projects'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                  {filtered.length}
                </span>
              </div>
              <button className="text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={load}
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>
            <motion.div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] mb-12" layout>
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i}
                  isSelected={selectedIds.includes(p.id)}
                  onToggle={toggleSelect}
                  onOpen={() => navigate(`/app/editor/${p.id}`)}
                  onDelete={() => handleDelete(p)}
                  onDuplicate={() => handleDuplicate(p)}
                />
              ))}
            </motion.div>
          </>
        )}

        {/* Templates Section */}
        {!loading && templates.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-bold mb-0.5" style={{ color: 'var(--text)' }}>Start from a Template</h2>
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Ready-to-use designs — click any to get started</p>
              </div>
              <button className="text-[12px] font-semibold flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => navigate('/app/templates')}>
                Browse all <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {templates.map((tpl, i) => (
                <TemplateCard key={tpl.id} template={tpl} index={i} onUse={handleUseTemplate} />
              ))}
            </div>
          </section>
        )}

        {/* Empty: show quick-start suggestions */}
        {!loading && projects.length === 0 && (
          <section>
            <h2 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Start</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Wand2,    title: 'AI Autodesigner',   desc: 'Describe your idea — AI generates the UI',      color: ACCENT_PINK, href: '/app/autodesigner' },
                { icon: Sparkles, title: 'Premium AI Designer', desc: 'Multi-step AI pipeline with code export',  color: ACCENT,      href: '/app/premium-autodesigner' },
                { icon: Plus,     title: 'Blank Project',     desc: 'Start from scratch with a clean canvas',      color: SUCCESS,     onClick: () => setShowCreate(true) },
              ].map(({ icon: Icon, title, desc, color, href, onClick }) => (
                <motion.div
                  key={title}
                  className="rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${color}0e, ${color}05)`, borderColor: `${color}25` }}
                  onClick={onClick || (() => navigate(href))}
                  whileHover={{ y: -3 }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div className="text-[14px] font-bold mb-1" style={{ color }}>{title}</div>
                  <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────────────────── */
function EmptyState({ onCreate, hasProjects, search, filter, onClear }) {
  const isFiltered = search || filter !== 'all';
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed mb-10"
      style={{ borderColor: 'var(--border-strong)', background: 'var(--surface)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative w-[100px] h-[100px] flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full blur-[30px]" style={{ background: `${ACCENT}25` }} />
        <FolderOpen size={48} strokeWidth={1.2} style={{ color: ACCENT }} />
      </div>
      <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text)' }}>
        {isFiltered ? 'No matching projects' : 'No projects yet'}
      </h3>
      <p className="text-[13px] max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {isFiltered
          ? `No projects match "${search || filter}". Try a different search or filter.`
          : 'Create your first project to get started. Or let AI generate something amazing.'}
      </p>
      {!isFiltered && (
        <div className="flex gap-3">
          <button className={btnPrimary} onClick={onCreate}>
            <Plus size={16} /> Blank Project
          </button>
          <button className={btnSecondary} onClick={() => window.location.href = '/app/autodesigner'}>
            <Sparkles size={14} style={{ color: ACCENT_PINK }} /> AI Generate
          </button>
        </div>
      )}
      {isFiltered && (
        <button
          className="mt-2 px-5 py-2 rounded-xl text-[13px] font-semibold border transition-all hover:bg-[var(--surface2)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          onClick={onClear}
        >
          ✕ Clear filters
        </button>
      )}
    </motion.div>
  );
}
