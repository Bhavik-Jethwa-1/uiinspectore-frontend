import { useEffect, useMemo, useState } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, FolderOpen, Tag, Link2, FileText, Users,
  Edit3, Copy, Archive, Trash2, MoreVertical, Clock, Image as ImageIcon,
  AlertCircle, Layers, Hash, ChevronDown, ChevronRight, X, Check,
  BarChart3, Activity, UserCircle, GitBranch, Globe, UploadCloud,
  Square, CheckSquare,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import UploadPage from './UploadPage';

const PROJECT_TEMPLATES = [
  { id: 'web-app',    name: 'Web Application',  icon: Globe,    desc: 'Full SaaS product surface' },
  { id: 'mobile-app', name: 'Mobile App',       icon: Layers,   desc: 'iOS / Android screens' },
  { id: 'landing',    name: 'Landing Page',     icon: FileText, desc: 'Marketing site' },
  { id: 'dashboard',  name: 'Analytics Dash',   icon: BarChart3,desc: 'Charts & KPIs' },
  { id: 'ecommerce',  name: 'E-commerce',       icon: Tag,      desc: 'Product listings, cart' },
  { id: 'portal',     name: 'Customer Portal',  icon: Users,    desc: 'Authenticated area' },
];

const CATEGORIES = [
  { id: 'design-system', name: 'Design System', count: 12 },
  { id: 'mobile',        name: 'Mobile',        count: 8  },
  { id: 'web',           name: 'Web App',       count: 21 },
  { id: 'landing',       name: 'Landing',       count: 6  },
  { id: 'internal',      name: 'Internal',      count: 4  },
];

const TAGS = [
  'redesign', 'mobile-first', 'accessibility', 'dark-mode',
  'prototype', 'production', 'design-system', 'a-b-test',
];

const STATUS_COLORS = {
  active:    'active',
  archived:  'pending',
  draft:     'critical',
  review:    'active',
  complete:  'active',
};

// Shared sub-component styles (Tailwind utilities)
const BTN_BASE = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-transparent transition-all duration-150 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_PRIMARY_STYLE = { background: 'linear-gradient(135deg, var(--accent), var(--accent-pink))', boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)' };
const BTN_GHOST = `${BTN_BASE} bg-transparent text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]`;
const INPUT_CLS = 'w-full border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--surface2)] text-[var(--text)] outline-none transition-all duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(124,92,255,0.15)]';
const LABEL_CLS = 'block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[var(--text-2)] flex items-center gap-1.5';
const FIELD_CLS = 'flex flex-col';

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'pending';
  const palette = {
    active:   'bg-emerald-500/10 text-emerald-400',
    pending:  'bg-amber-500/10 text-amber-400',
    critical: 'bg-red-500/10 text-red-400',
  };
  const colors = palette[cls] || palette.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${colors}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {status}
    </span>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [template, setTemplate] = useState('web-app');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags([...tags, t]);
    setTagInput('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        url: url.trim() || null,
        template,
        tags,
        screens: [],
      });
    } catch (err) {
      setSubmitting(false);
      alert(err.message || 'Failed to create project');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/65 backdrop-blur-md z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[20px] w-full max-w-[480px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-[10px] bg-[linear-gradient(135deg,rgba(124,92,255,0.2),rgba(255,107,157,0.15))] border border-[var(--border)] flex items-center justify-center text-[var(--accent-hover)] flex-shrink-0">
            <FolderOpen size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-bold leading-tight">Create new project</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Set up the basics — you can change everything later.</p>
          </div>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Project name <span className="text-red-500 ml-0.5">*</span></label>
            <input
              type="text"
              className={INPUT_CLS}
              placeholder="e.g. Checkout redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Description</label>
            <textarea
              className={INPUT_CLS + ' resize-y min-h-[80px] leading-relaxed'}
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}><Link2 size={11} /> Live URL (optional)</label>
            <input
              type="url"
              className={INPUT_CLS}
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Template</label>
            <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
              {PROJECT_TEMPLATES.map((t) => {
                const Icon = t.icon;
                const active = template === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg)] border-[1.5px] rounded-[10px] cursor-pointer transition-colors text-[var(--text)] text-left font-sans hover:border-[rgba(124,92,255,0.4)] ${
                      active ? 'border-[#7c5cff] bg-[rgba(124,92,255,0.06)]' : 'border-[var(--border)]'
                    }`}
                  >
                    <Icon size={14} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-[var(--text)]">{t.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)] overflow-hidden text-ellipsis whitespace-nowrap">{t.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}><Tag size={11} /> Tags</label>
            <div className="flex flex-wrap gap-1.5 items-center bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] px-2.5 py-2 min-h-[42px] focus-within:border-[#7c5cff] focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.1)]">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] text-[#7c5cff] rounded-full text-[11px] font-semibold">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="flex bg-transparent border-none text-inherit cursor-pointer p-0 rounded-full">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-[var(--text)] text-[13px] font-sans placeholder:text-[var(--text-muted)]"
                placeholder={tags.length ? 'Add another…' : 'Type and press Enter'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2 bg-black/20">
          <button className={BTN_GHOST} onClick={onClose}>Cancel</button>
          <button
            className={BTN_BASE + ' text-white'}
            style={BTN_PRIMARY_STYLE}
            onClick={submit}
            disabled={!name.trim() || submitting}
          >
            {submitting ? (
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.16s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.32s' }}></span>
              </span>
            ) : (
              <><Plus size={14} /> Create project</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditProjectModal({ project, onClose, onSave }) {
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [url, setUrl] = useState(project.url || '');
  const [status, setStatus] = useState(project.status || 'active');
  const [tags, setTags] = useState(project.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        url: url.trim() || null,
        status,
        tags,
      });
    } catch (err) {
      setSaving(false);
      alert(err.message || 'Failed to save');
    }
  };

  const addTag = (raw) => {
    const t = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags([...tags, t]);
    setTagInput('');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/65 backdrop-blur-md z-[100] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-[20px] w-full max-w-[480px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-[10px] bg-[linear-gradient(135deg,rgba(124,92,255,0.2),rgba(255,107,157,0.15))] border border-[var(--border)] flex items-center justify-center text-[var(--accent-hover)] flex-shrink-0">
            <Edit3 size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-bold leading-tight">Edit project</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Update the project details.</p>
          </div>
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Project name</label>
            <input
              type="text"
              className={INPUT_CLS}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Description</label>
            <textarea
              className={INPUT_CLS + ' resize-y min-h-[80px] leading-relaxed'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}><Link2 size={11} /> Live URL</label>
            <input
              type="url"
              className={INPUT_CLS}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}>Status</label>
            <div className="flex flex-wrap gap-1.5">
              {['active', 'draft', 'review', 'archived'].map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3.5 py-1.5 rounded-full bg-[var(--bg)] border-[1.5px] text-xs font-semibold cursor-pointer capitalize transition-all font-sans hover:text-[var(--text)] ${
                      active
                        ? 'border-[#7c5cff] bg-[rgba(124,92,255,0.08)] text-[#7c5cff]'
                        : 'border-[var(--border)] text-[var(--text-muted)]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={FIELD_CLS}>
            <label className={LABEL_CLS}><Tag size={11} /> Tags</label>
            <div className="flex flex-wrap gap-1.5 items-center bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] px-2.5 py-2 min-h-[42px] focus-within:border-[#7c5cff] focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.1)]">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] text-[#7c5cff] rounded-full text-[11px] font-semibold">
                  {t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="flex bg-transparent border-none text-inherit cursor-pointer p-0 rounded-full">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-[var(--text)] text-[13px] font-sans placeholder:text-[var(--text-muted)]"
                placeholder={tags.length ? 'Add another…' : 'Type and press Enter'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-2 bg-black/20">
          <button className={BTN_GHOST} onClick={onClose}>Cancel</button>
          <button
            className={BTN_BASE + ' text-white'}
            style={BTN_PRIMARY_STYLE}
            onClick={submit}
            disabled={!name.trim() || saving}
          >
            {saving ? (
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.16s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0.32s' }}></span>
              </span>
            ) : (
              <><Check size={14} /> Save changes</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, onOpen, onEdit, onDuplicate, onArchive, onDelete, isSelected, onToggle }) {
  const [menu, setMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const screens = project.screens || [];
  const issueCount = project.issue_count ?? screens.reduce((acc, s) => acc + (s.issue_count || 0), 0);

  // Reset image error when thumbnail changes (e.g., after upload)
  useEffect(() => {
    setImgError(false);
  }, [project.thumbnail]);

  return (
    <motion.div
      className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-150 relative hover:border-[#7c5cff] hover:shadow-[0_6px_20px_rgba(124,92,255,0.12)]"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <div className="relative aspect-video bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden">
        {project.thumbnail && !imgError ? (
          <img src={project.thumbnail} alt="" className="w-full h-full object-cover block" onError={() => setImgError(true)} />
        ) : (
          <div className="absolute inset-0 grid grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] gap-1 p-2 bg-[linear-gradient(135deg,#f8f9ff,#ede9fe)]">
            <div className="rounded row-span-2 bg-[rgba(124,92,255,0.22)]" />
            <div className="rounded bg-[rgba(255,107,157,0.20)]" />
            <div className="rounded bg-[rgba(124,92,255,0.14)]" />
            <div className="col-start-2 row-start-2 rounded bg-[rgba(245,158,11,0.18)]" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge status={project.status || 'active'} />
        </div>
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.9)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center cursor-pointer backdrop-blur-md hover:bg-white transition-colors"
          onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}
          aria-label="Project actions"
        >
          <MoreVertical size={16} />
        </button>
        <button
          className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all border-2 ${
            isSelected
              ? 'bg-[#7c5cff] border-[#7c5cff] text-white shadow-[0_2px_8px_rgba(124,92,255,0.4)]'
              : 'bg-black/40 backdrop-blur-md border-white/60 hover:bg-black/60 hover:border-white'
          }`}
          onClick={(e) => { e.stopPropagation(); onToggle(project.id); }}
          aria-label={isSelected ? 'Deselect project' : 'Select project'}
        >
          {isSelected ? <Check size={14} strokeWidth={3} /> : <Square size={14} />}
        </button>
        <AnimatePresence>
          {menu && (
            <>
              <div className="fixed inset-0 z-[9]" onClick={(e) => { e.stopPropagation(); setMenu(false); }} />
              <motion.div
                className="absolute top-10 right-2 bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[12px] p-1 min-w-[180px] shadow-[0_12px_32px_rgba(0,0,0,0.18)] z-10"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-2 border-none bg-transparent rounded-lg text-[var(--text)] text-[13px] font-medium cursor-pointer text-left transition-colors font-sans hover:bg-[rgba(124,92,255,0.08)] hover:text-[#7c5cff]"
                  onClick={() => { setMenu(false); onOpen(); }}
                >
                  <FolderOpen size={14} /> Open
                </button>
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-2 border-none bg-transparent rounded-lg text-[var(--text)] text-[13px] font-medium cursor-pointer text-left transition-colors font-sans hover:bg-[rgba(124,92,255,0.08)] hover:text-[#7c5cff]"
                  onClick={() => { setMenu(false); onEdit(); }}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-2 border-none bg-transparent rounded-lg text-[var(--text)] text-[13px] font-medium cursor-pointer text-left transition-colors font-sans hover:bg-[rgba(124,92,255,0.08)] hover:text-[#7c5cff]"
                  onClick={() => { setMenu(false); onDuplicate(); }}
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-2 border-none bg-transparent rounded-lg text-[var(--text)] text-[13px] font-medium cursor-pointer text-left transition-colors font-sans hover:bg-[rgba(124,92,255,0.08)] hover:text-[#7c5cff]"
                  onClick={() => { setMenu(false); onArchive(); }}
                >
                  <Archive size={14} /> {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-2 border-none bg-transparent rounded-lg text-[var(--text)] text-[13px] font-medium cursor-pointer text-left transition-colors font-sans hover:bg-[rgba(239,68,68,0.08)] hover:text-[#ef4444]"
                  onClick={() => { setMenu(false); onDelete(); }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3.5 pt-3 pb-3.5">
        <div className="text-sm font-bold text-[var(--text)] mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{project.name}</div>
        {project.description && (
          <div className="text-xs text-[var(--text-muted)] mb-2 overflow-hidden text-ellipsis line-clamp-1">{project.description}</div>
        )}
        <div className="flex flex-wrap gap-2.5 text-[11px] text-[var(--text-muted)] font-medium">
          <span className="inline-flex items-center gap-1"><ImageIcon size={11} /> {screens.length} {screens.length === 1 ? 'screen' : 'screens'}</span>
          {issueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[#ef4444]"><AlertCircle size={11} /> {issueCount} issues</span>
          )}
          <span className="inline-flex items-center gap-1"><Clock size={11} /> {formatRelative(project.updated_at || project.created_at)}</span>
        </div>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.tags.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] font-semibold text-[#7c5cff] bg-[rgba(124,92,255,0.08)] border border-[rgba(124,92,255,0.18)] px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function formatRelative(input) {
  if (!input) return 'just now';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return 'recently';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function Accordion({ title, icon: Icon, defaultOpen = false, count, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] overflow-hidden">
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3.5 bg-transparent border-none text-[var(--text)] text-sm font-bold cursor-pointer text-left font-sans transition-colors hover:bg-[rgba(124,92,255,0.04)]"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={14} />
        <span className="flex-1">{title}</span>
        {typeof count === 'number' && (
          <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-full">{count}</span>
        )}
        <span className="text-[var(--text-muted)] flex">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ask } = useConfirm();
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('projects'); // 'projects' | 'screenshots'
  const [selectedIds, setSelectedIds] = useState(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, tplRes] = await Promise.allSettled([
        api.listProjects(),
        api.listTemplates(),
      ]);
      if (projRes.status === 'fulfilled') {
        const list = Array.isArray(projRes.value)
          ? projRes.value
          : (projRes.value.items || projRes.value.projects || []);
        setProjects(list);
      } else {
        setProjects([]);
      }
      if (tplRes.status === 'fulfilled') {
        const list = Array.isArray(tplRes.value)
          ? tplRes.value
          : (tplRes.value.items || tplRes.value.templates || []);
        setTemplates(list);
      } else {
        setTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const archived = projects.filter((p) => p.status === 'archived').length;
    const memberSet = new Set();
    projects.forEach((p) => {
      (p.members || []).forEach((m) => memberSet.add(m.user_id || m.id || m.email));
      if (p.owner_id) memberSet.add(p.owner_id);
    });
    if (user?.id) memberSet.add(user.id);
    return { total, active, archived, members: memberSet.size };
  }, [projects, user]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'archived' && p.status !== 'archived') return false;
      if (filter === 'active' && p.status !== 'active') return false;
      if (filter === 'draft' && p.status !== 'draft') return false;
      return true;
    });
  }, [projects, search, filter]);

  const handleCreate = async (payload) => {
    const created = await api.createProject(payload);
    setShowCreate(false);
    setProjects((list) => [created, ...list]);
    navigate(`/app/editor/${created.id}`);
  };

  const handleSaveEdit = async (payload) => {
    if (!editing) return;
    const updated = await api.updateProject(editing.id, payload);
    setProjects((list) => list.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
    setEditing(null);
  };

  const handleOpen = (p) => {
    if (p.id) navigate(`/app/editor/${p.id}`);
  };

  const handleEdit = (p) => setEditing(p);

  const handleDuplicate = async (p) => {
    const copy = await api.createProject({
      name: `${p.name} (Copy)`,
      description: p.description,
      tags: p.tags || [],
      template: p.template,
      url: p.url,
      screens: p.screens || [],
    });
    setProjects((list) => [copy, ...list]);
  };

  const handleArchive = async (p) => {
    const next = p.status === 'archived' ? 'active' : 'archived';
    await api.updateProject(p.id, { status: next });
    setProjects((list) =>
      list.map((x) => (x.id === p.id ? { ...x, status: next } : x))
    );
  };

  const handleDelete = async (p) => {
    if (!await ask({ title: 'Delete project?', message: `"${p.name}" will be permanently deleted. This cannot be undone.`, confirmLabel: 'Delete', danger: true })) return;
    await api.deleteProject(p.id);
    setProjects((list) => list.filter((x) => x.id !== p.id));
    setSelectedIds((s) => { const n = new Set(s); n.delete(p.id); return n; });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!await ask({ title: `Delete ${ids.length} project${ids.length > 1 ? 's' : ''}?`, message: `${ids.length} project${ids.length > 1 ? 's' : ''} will be permanently deleted. This cannot be undone.`, confirmLabel: 'Delete all', danger: true })) return;
    await Promise.all(ids.map((id) => api.deleteProject(id)));
    setProjects((list) => list.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  return (
    <div className="py-8 px-8 max-w-[1400px] mx-auto max-md:p-4">
      <header className="mb-8">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] text-[#7c5cff] text-[11px] font-bold tracking-[0.05em] uppercase mb-2.5">
          <FolderOpen size={11} /> Workspace
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[28px] font-extrabold text-[var(--text)] mb-1.5 tracking-[-0.02em] leading-tight">Projects</h1>
            <p className="text-sm text-[var(--text-muted)] m-0">Manage your UX research projects</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {filtered.length > 0 && (
              <button
                onClick={selectAll}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] border text-[13px] font-semibold transition-all ${
                  selectedIds.size === filtered.length && filtered.length > 0
                    ? 'bg-[#7c5cff] border-[#7c5cff] text-white shadow-[0_2px_8px_rgba(124,92,255,0.3)]'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:border-[#7c5cff]'
                }`}
                title={selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
              >
                {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                {selectedIds.size === filtered.length ? 'Deselect all' : `Select all (${filtered.length})`}
              </button>
            )}
            <label className="flex items-center gap-1.5 bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[10px] px-3 py-2 sm:w-[260px] w-full transition-colors focus-within:border-[#7c5cff] focus-within:shadow-[0_0_0_3px_rgba(124,92,255,0.1)] max-sm:w-full">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[var(--text)] text-[13px] w-full font-sans placeholder:text-[var(--text-muted)]"
              />
            </label>
            <button
              className={BTN_BASE + ' text-white'}
              style={BTN_PRIMARY_STYLE}
              onClick={() => setShowCreate(true)}
            >
              <Plus size={14} /> New Project
            </button>
          </div>
        </div>
      </header>

      {/* View tabs */}
      <div className="flex gap-1 mb-5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-xl p-1.5 w-fit">
        <button
          onClick={() => setView('projects')}
          className={`flex items-center gap-1.5 px-4 py-2 bg-transparent border-none rounded-lg text-[13px] font-semibold font-['Inter',sans-serif] cursor-pointer transition-all whitespace-nowrap ${
            view === 'projects'
              ? 'bg-[rgba(124,92,255,0.25)] text-[#c4b0ff] shadow-[0_0_0_1px_rgba(124,92,255,0.4)]'
              : 'text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.7)]'
          }`}
        >
          <FolderOpen size={14} /> Projects
        </button>
        <button
          onClick={() => setView('screenshots')}
          className={`flex items-center gap-1.5 px-4 py-2 bg-transparent border-none rounded-lg text-[13px] font-semibold font-['Inter',sans-serif] cursor-pointer transition-all whitespace-nowrap ${
            view === 'screenshots'
              ? 'bg-[rgba(124,92,255,0.25)] text-[#c4b0ff] shadow-[0_0_0_1px_rgba(124,92,255,0.4)]'
              : 'text-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.7)]'
          }`}
        >
          <UploadCloud size={14} /> Screenshots
        </button>
      </div>

      {view === 'screenshots' ? (
        <div className="mt-4" style={{ height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
          <div className="h-full overflow-y-auto">
            <UploadPage />
          </div>
        </div>
      ) : (      <>
      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            className="mb-4 px-4 py-3 bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.25)] rounded-[14px] flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-[#7c5cff]" />
              <span className="text-[13px] font-semibold text-[var(--text)]">
                {selectedIds.size} project{selectedIds.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#ef4444] text-[12px] font-semibold hover:bg-[rgba(239,68,68,0.2)] transition-colors"
                onClick={handleBulkDelete}
              >
                <Trash2 size={13} /> Delete selected
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                onClick={() => setSelectedIds(new Set())}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] p-4 flex items-center gap-3.5 transition-all duration-150 hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-px">
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(124,92,255,0.1)] text-[#7c5cff] flex items-center justify-center flex-shrink-0">
            <FolderOpen size={16} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-[-0.02em]">{stats.total}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Total Projects</div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] p-4 flex items-center gap-3.5 transition-all duration-150 hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-px">
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(16,185,129,0.1)] text-[#10b981] flex items-center justify-center flex-shrink-0">
            <Activity size={16} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-[-0.02em]">{stats.active}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Active</div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] p-4 flex items-center gap-3.5 transition-all duration-150 hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-px">
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(245,158,11,0.1)] text-[#f59e0b] flex items-center justify-center flex-shrink-0">
            <Archive size={16} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-[-0.02em]">{stats.archived}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Archived</div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] p-4 flex items-center gap-3.5 transition-all duration-150 hover:border-[rgba(124,92,255,0.4)] hover:-translate-y-px">
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[rgba(124,92,255,0.1)] text-[#7c5cff] flex items-center justify-center flex-shrink-0">
            <Users size={16} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[var(--text)] leading-none tracking-[-0.02em]">{stats.members}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Team Members</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-5 mb-4 flex items-center justify-between gap-3 px-3.5 py-2.5">
        <div className="flex gap-1 bg-transparent rounded-[10px]">
          {[
            { id: 'all',      label: 'All' },
            { id: 'active',   label: 'Active' },
            { id: 'draft',    label: 'Drafts' },
            { id: 'archived', label: 'Archived' },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg bg-transparent border-[1.5px] text-xs font-semibold cursor-pointer transition-all font-sans ${
                  active
                    ? 'border-[rgba(124,92,255,0.2)] bg-[rgba(124,92,255,0.1)] text-[#7c5cff]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Project list */}
      <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-[0.06em] mt-6 mb-3">Your projects</h2>

      {loading ? (
        <div className="grid gap-3.5 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--surface)] border-[1.5px] border-[var(--border)] rounded-[14px] overflow-hidden pointer-events-none">
              <div className="skeleton w-full aspect-video" />
              <div className="skeleton h-3 mt-2.5 rounded-md" style={{ width: '70%' }} />
              <div className="skeleton h-3 mt-2.5 rounded-md w-2/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-5 mb-4 flex flex-col items-center gap-2 p-14 text-center text-[var(--text-muted)]">
          <FolderOpen size={28} />
          <div className="text-base font-bold text-[var(--text)]">No projects yet</div>
          <div className="text-[13px] mb-2">Create your first project to get started.</div>
          <button
            className={BTN_BASE + ' text-white'}
            style={BTN_PRIMARY_STYLE}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} /> Create project
          </button>
        </div>
      ) : (
        <motion.div className="grid gap-3.5 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }} layout>
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={() => handleOpen(p)}
              onEdit={() => handleEdit(p)}
              onDuplicate={() => handleDuplicate(p)}
              onArchive={() => handleArchive(p)}
              onDelete={() => handleDelete(p)}
              isSelected={selectedIds.has(p.id)}
              onToggle={toggleSelect}
            />
          ))}
        </motion.div>
      )}

      {/* Library sections */}
      <h2 className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-[0.06em] mt-6 mb-3">Library</h2>
      <div className="flex flex-col gap-2.5">
        <Accordion title="Templates" icon={FileText} count={templates.length || PROJECT_TEMPLATES.length} defaultOpen>
          <div className="flex flex-col gap-2">
            {(templates.length ? templates : PROJECT_TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.desc }))).map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] transition-colors hover:border-[rgba(124,92,255,0.4)]">
                <div className="w-8 h-8 rounded-lg bg-[rgba(124,92,255,0.1)] text-[#7c5cff] flex items-center justify-center flex-shrink-0">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[var(--text)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{t.description || t.category || 'Project template'}</div>
                </div>
                <button className={BTN_GHOST + ' text-xs px-2.5 py-1'} onClick={() => setShowCreate(true)}>
                  Use
                </button>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Categories" icon={Hash} count={CATEGORIES.length}>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2.5 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] transition-colors cursor-pointer hover:border-[#7c5cff]">
                <span className="text-[13px] font-semibold text-[var(--text)]">{c.name}</span>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">{c.count}</span>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion title="Tags" icon={Tag} count={TAGS.length}>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <span key={t} className="text-xs font-semibold text-[#7c5cff] bg-[rgba(124,92,255,0.08)] border border-[rgba(124,92,255,0.18)] px-2.5 py-1 rounded-full cursor-pointer transition-all hover:bg-[rgba(124,92,255,0.15)] hover:-translate-y-px">#{t}</span>
            ))}
          </div>
        </Accordion>

        <Accordion title="Team Members" icon={UserCircle} count={stats.members}>
          <div className="flex flex-col gap-2">
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px]">
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }}
                >
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[var(--text)]">{user.name || 'You'}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{user.email}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Owner</span>
              </div>
            )}
            {projects.flatMap((p) => p.members || []).slice(0, 6).map((m, i) => (
              <div key={m.id || m.email || i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px]">
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }}
                >
                  {(m.name || m.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-[var(--text)]">{m.name || m.email}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{m.email || m.role || 'Member'}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400">{m.role || 'Member'}</span>
              </div>
            ))}
            {stats.members <= 1 && (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg)] border-[1.5px] border-dashed border-[var(--border)] rounded-[10px]">
                Invite teammates from project settings.
              </div>
            )}
          </div>
        </Accordion>

        <Accordion title="Project Timeline" icon={GitBranch}>
          <div className="relative pl-3.5">
            <div className="absolute left-1 top-1.5 bottom-1.5 w-0.5 bg-[var(--border)]" aria-hidden="true" />
            <div className="flex flex-col gap-3">
              {projects.slice(0, 6).map((p) => (
                <div key={p.id} className="relative flex items-start gap-3 pl-3">
                  <div
                    className="absolute -left-3.5 top-1.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: '#7c5cff', boxShadow: '0 0 0 3px var(--surface)' }}
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[var(--text)]">{p.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Created {formatRelative(p.created_at)} · Updated {formatRelative(p.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="p-4 text-center text-xs text-[var(--text-muted)] bg-[var(--bg)] border-[1.5px] border-dashed border-[var(--border)] rounded-[10px]">
                  No timeline events yet.
                </div>
              )}
            </div>
          </div>
        </Accordion>

        <Accordion title="Project Status" icon={BarChart3}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text)]">
              <span><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-[#10b981]" /> Active</span>
              <span>{stats.active}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text)]">
              <span><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-[#f59e0b]" /> Archived</span>
              <span>{stats.archived}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text)]">
              <span><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-[#7c5cff]" /> Drafts</span>
              <span>{projects.filter((p) => p.status === 'draft').length}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg)] border-[1.5px] border-[var(--border)] rounded-[10px] text-[13px] font-semibold text-[var(--text)]">
              <span><span className="inline-block w-2 h-2 rounded-full mr-2 align-middle bg-[#3b82f6]" /> In review</span>
              <span>{projects.filter((p) => p.status === 'review').length}</span>
            </div>
          </div>
        </Accordion>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
        {editing && (
          <EditProjectModal
            project={editing}
            onClose={() => setEditing(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}