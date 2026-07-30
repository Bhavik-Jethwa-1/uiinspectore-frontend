import { useState, useEffect, useMemo } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo, Plus, X, Calendar, User, AlertCircle, Sparkles, Loader2,
  Trash2, GripVertical, MessageSquare, Paperclip, CheckCircle2,
  Clock, Circle, ArrowRight, Wand2, Filter
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLUMNS = [
  { id: 'todo',       label: 'Todo',        dot: 'todo' },
  { id: 'in_progress', label: 'In Progress', dot: 'progress' },
  { id: 'done',       label: 'Done',        dot: 'done' },
];

const PRIORITY_META = {
  high:   { label: 'High',   className: 'high' },
  medium: { label: 'Medium', className: 'medium' },
  low:    { label: 'Low',    className: 'low' },
};

const AVATAR_PALETTE = ['#7c5cff', '#ff6b9d', '#00d4ff', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

function avatarColor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join('') || '?';
}

const DEMO_TASKS = [
  { id: 't1', title: 'Fix CTA contrast on hero section', priority: 'high',   status: 'todo',        assignee: 'Maya Chen',     due: '2026-07-18', project: 'Onboarding v3', comments: 3 },
  { id: 't2', title: 'Standardize button heights across forms', priority: 'medium', status: 'todo',        assignee: 'Diego Alvarez', due: '2026-07-22', project: 'Design system', comments: 1 },
  { id: 't3', title: 'Add focus indicators to interactive elements', priority: 'high', status: 'todo',        assignee: 'Priya Shah',    due: '2026-07-20', project: 'A11y', comments: 5 },
  { id: 't4', title: 'Improve mobile touch targets (min 44px)', priority: 'medium', status: 'in_progress', assignee: 'Aiko Tanaka',   due: '2026-07-16', project: 'Mobile pass', comments: 2 },
  { id: 't5', title: 'Reduce hero copy by 20% on mobile', priority: 'low',    status: 'in_progress', assignee: 'Diego Alvarez', due: '2026-07-25', project: 'Pricing', comments: 0 },
  { id: 't6', title: 'Refactor color tokens to semantic naming', priority: 'medium', status: 'in_progress', assignee: 'Jonas Weber',   due: '2026-07-19', project: 'Design system', comments: 4 },
  { id: 't7', title: 'Replace low-contrast placeholder text', priority: 'high',   status: 'done',        assignee: 'Maya Chen',     due: '2026-07-12', project: 'Onboarding v3', comments: 2 },
  { id: 't8', title: 'Add skip-to-content link on all pages', priority: 'medium', status: 'done',        assignee: 'Priya Shah',    due: '2026-07-10', project: 'A11y', comments: 1 },
  { id: 't9', title: 'Document new spacing scale', priority: 'low',    status: 'done',        assignee: 'Diego Alvarez', due: '2026-07-08', project: 'Design system', comments: 0 },
];

export default function TasksPage() {
  const { user } = useAuth();
  const { ask } = useConfirm();
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showConvert, setShowConvert] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [draft, setDraft] = useState({ title: '', priority: 'medium', assignee: user?.name || 'Unassigned', due: '' });
  const [convertForm, setConvertForm] = useState({ issueId: '', title: '', priority: 'high', assignee: user?.name || 'Unassigned', due: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.request('/tasks').catch(() => null);
        if (Array.isArray(data?.tasks) && data.tasks.length) setTasks(data.tasks);
      } catch {}
    })();
  }, []);

  const assignees = useMemo(() => {
    const set = new Set(tasks.map(t => t.assignee));
    return Array.from(set);
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t =>
      (filterAssignee === 'all' || t.assignee === filterAssignee) &&
      (filterPriority === 'all' || t.priority === filterPriority)
    );
  }, [tasks, filterAssignee, filterPriority]);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    for (const t of filtered) g[t.status]?.push(t);
    return g;
  }, [filtered]);

  const moveTask = async (taskId, newStatus) => {
    const prev = tasks.find(t => t.id === taskId);
    setTasks(curr => curr.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.request(`/tasks/${taskId}`, { method: 'PATCH', body: { status: newStatus } }).catch(() => null);
    } catch {}
  };

  const handleDrop = (e, col) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragging;
    if (id) moveTask(id, col);
    setDragging(null);
  };

  const removeTask = async (id) => {
    if (!await ask({ title: 'Delete task?', message: 'This task will be permanently removed.', confirmLabel: 'Delete', danger: true })) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    api.request(`/tasks/${id}`, { method: 'DELETE' }).catch(() => null);
  };

  const addTask = async (col) => {
    if (!draft.title.trim()) return;
    setBusy(true);
    try {
      const data = await api.request('/tasks', {
        method: 'POST',
        body: { ...draft, status: col },
      }).catch(() => null);
      const newTask = data?.task || {
        id: `t-${Date.now()}`,
        title: draft.title.trim(),
        priority: draft.priority,
        status: col,
        assignee: draft.assignee || 'Unassigned',
        due: draft.due || null,
        project: 'General',
        comments: 0,
      };
      setTasks(prev => [newTask, ...prev]);
      setDraft({ title: '', priority: 'medium', assignee: user?.name || 'Unassigned', due: '' });
      setAddingTo(null);
    } finally {
      setBusy(false);
    }
  };

  const convertIssue = async () => {
    if (!convertForm.title.trim()) return;
    setBusy(true);
    try {
      const data = await api.request('/tasks/convert-issue', {
        method: 'POST',
        body: convertForm,
      }).catch(() => null);
      const newTask = data?.task || {
        id: `t-${Date.now()}`,
        ...convertForm,
        status: 'todo',
        project: 'From issue',
        comments: 0,
      };
      setTasks(prev => [newTask, ...prev]);
      setShowConvert(false);
      setConvertForm({ issueId: '', title: '', priority: 'high', assignee: user?.name || 'Unassigned', due: '' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-badge"><ListTodo size={11} /> Task Management</div>
        <h1 className="module-title">Tasks</h1>
        <p className="module-subtitle">Convert AI issues into tasks, assign and track.</p>
      </div>

      <div className="tk-toolbar">
        <div className="tk-filter">
          <Filter size={12} color="var(--text-muted)" />
          <span className="tk-filter-label">Assignee</span>
          <select className="input" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="all">All</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="tk-filter">
          <span className="tk-filter-label">Priority</span>
          <select className="input" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div style={{ flex: 1 }} />

        <button className="btn btn-secondary" onClick={() => setShowConvert(true)}>
          <Wand2 size={14} /> Convert Issue to Task
        </button>
      </div>

      <div className="tk-board">
        {COLUMNS.map(col => (
          <div
            key={col.id}
            className="tk-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="tk-col-head">
              <h4 className="tk-col-title">
                <span className={`tk-col-dot ${col.dot}`} />
                {col.label}
              </h4>
              <span className="tk-col-count">{grouped[col.id].length}</span>
            </div>

            <div className="tk-cards">
              <AnimatePresence>
                {grouped[col.id].map(t => {
                  const pm = PRIORITY_META[t.priority] || PRIORITY_META.low;
                  const overdue = t.due && new Date(t.due) < new Date() && t.status !== 'done';
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      draggable
                      onDragStart={(e) => {
                        setDragging(t.id);
                        e.dataTransfer.setData('text/plain', t.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                      className={`tk-card ${dragging === t.id ? 'dragging' : ''}`}
                    >
                      <div className="tk-card-top">
                        <span className={`tk-card-priority ${pm.className}`}>{pm.label}</span>
                        <span className="tk-card-id">#{t.id.slice(-4).toUpperCase()}</span>
                      </div>
                      <p className="tk-card-title">{t.title}</p>
                      <div className="tk-card-bottom">
                        <div className="tk-assignee">
                          <div className="tk-mini-avatar" style={{ background: avatarColor(t.assignee) }}>
                            {initials(t.assignee)}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{t.assignee}</span>
                        </div>
                        {t.due && (
                          <span className={`tk-due ${overdue ? 'overdue' : ''}`}>
                            <Calendar size={10} /> {new Date(t.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div className="tk-card-actions">
                        <button onClick={() => moveTask(t.id, col.id === 'done' ? 'todo' : col.id === 'in_progress' ? 'done' : 'in_progress')}>
                          <ArrowRight size={10} /> Move
                        </button>
                        <button>
                          <MessageSquare size={10} /> {t.comments || 0}
                        </button>
                        <button onClick={() => removeTask(t.id)} style={{ marginLeft: 'auto' }}>
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {addingTo === col.id ? (
                <div className="tk-add-form">
                  <input
                    className="input"
                    placeholder="Task title…"
                    value={draft.title}
                    autoFocus
                    onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(col.id); if (e.key === 'Escape') setAddingTo(null); }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    <select className="input" value={draft.priority} onChange={(e) => setDraft(d => ({ ...d, priority: e.target.value }))}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <input className="input" placeholder="Assignee" value={draft.assignee} onChange={(e) => setDraft(d => ({ ...d, assignee: e.target.value }))} />
                    <input className="input" type="date" value={draft.due} onChange={(e) => setDraft(d => ({ ...d, due: e.target.value }))} />
                  </div>
                  <div className="tk-add-form-actions">
                    <button className="btn btn-ghost" type="button" onClick={() => setAddingTo(null)}>Cancel</button>
                    <button className="btn btn-primary" type="button" onClick={() => addTask(col.id)} disabled={busy || !draft.title.trim()}>
                      {busy ? <Loader2 size={12} className="spin" /> : <Plus size={12} />} Add
                    </button>
                  </div>
                </div>
              ) : (
                <button className="tk-add-card" onClick={() => { setAddingTo(col.id); setDraft(d => ({ ...d, assignee: user?.name || d.assignee })); }}>
                  <Plus size={12} /> Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showConvert && (
          <motion.div
            className="tk-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConvert(false)}
          >
            <motion.div
              className="tk-modal"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="tk-modal-title">
                  <Wand2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Convert Issue to Task
                </h3>
                <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowConvert(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="tk-modal-field">
                <label>Issue ID (optional)</label>
                <input className="input" placeholder="e.g. UI-142" value={convertForm.issueId} onChange={(e) => setConvertForm(f => ({ ...f, issueId: e.target.value }))} />
              </div>
              <div className="tk-modal-field">
                <label>Task title</label>
                <input className="input" placeholder="Fix CTA contrast ratio" value={convertForm.title} onChange={(e) => setConvertForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div className="tk-modal-field">
                  <label>Priority</label>
                  <select className="input" value={convertForm.priority} onChange={(e) => setConvertForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="tk-modal-field">
                  <label>Assignee</label>
                  <input className="input" value={convertForm.assignee} onChange={(e) => setConvertForm(f => ({ ...f, assignee: e.target.value }))} />
                </div>
                <div className="tk-modal-field">
                  <label>Due date</label>
                  <input className="input" type="date" value={convertForm.due} onChange={(e) => setConvertForm(f => ({ ...f, due: e.target.value }))} />
                </div>
              </div>

              <div className="tk-modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowConvert(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={convertIssue} disabled={busy || !convertForm.title.trim()}>
                  {busy ? <Loader2 size={12} className="spin" /> : <Wand2 size={12} />} Convert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}