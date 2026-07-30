import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileImage, FileText, FolderInput, Layers, History,
  X, Check, AlertCircle, Loader2, Trash2, Eye, RefreshCw,
  Plus, Image as ImageIcon, ChevronDown, ChevronRight,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SUPPORTED_FORMATS = [
  { id: 'png',  label: 'PNG',  mime: 'image/png'  },
  { id: 'jpg',  label: 'JPG',  mime: 'image/jpeg' },
  { id: 'jpeg', label: 'JPEG', mime: 'image/jpeg' },
  { id: 'pdf',  label: 'PDF',  mime: 'application/pdf' },
];

const UPLOAD_MODES = [
  { id: 'multiple', label: 'Multiple Upload', icon: Layers,      desc: 'Select several files at once' },
  { id: 'batch',    label: 'Batch Upload',    icon: FileImage,   desc: 'Same metadata for every file' },
  { id: 'folder',   label: 'Folder Upload',   icon: FolderInput, desc: 'Upload an entire folder' },
  { id: 'version',  label: 'Version Upload',  icon: History,     desc: 'New revision of an existing screen' },
];

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

function DropZone({ onFiles, disabled }) {
  const inputRef = useRef(null);
  const folderRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const open = (kind = 'file') => {
    if (disabled) return;
    if (kind === 'folder' && folderRef.current) folderRef.current.click();
    else if (inputRef.current) inputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const items = e.dataTransfer.items;
    if (items && items.length && items[0].webkitGetAsEntry) {
      const files = [];
      let pending = 0;
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          pending++;
          walkEntry(entry, files, () => { pending--; if (pending === 0) onFiles(files); });
        }
      }
      if (pending === 0) onFiles(files);
    } else {
      onFiles(Array.from(e.dataTransfer.files || []));
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
        dragging
          ? 'border-[var(--accent)] bg-[rgba(124,92,255,0.06)] scale-[1.01]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[rgba(124,92,255,0.03)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} p-8 w-full gap-3`}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => open('file')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.length) { onFiles(Array.from(e.target.files)); e.target.value = ''; } }}
      />
      <input
        ref={folderRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.length) { onFiles(Array.from(e.target.files)); e.target.value = ''; } }}
      />

      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        animate={{ scale: dragging ? 1.02 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="w-14 h-14 rounded-xl bg-[var(--surface2)] flex items-center justify-center text-[var(--text-2)]">
          <UploadCloud size={28} />
        </div>
        <div className="text-[15px] font-semibold text-[var(--text)]">Drop screenshots here or click to browse</div>
        <div className="text-[13px] text-[var(--text-muted)]">PNG, JPG, JPEG and PDF files up to 25 MB each</div>

        <div className="flex flex-wrap gap-1 justify-center">
          {SUPPORTED_FORMATS.map((f) => (
            <span key={f.id} className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--surface2)] text-[var(--text-2)]">{f.label}</span>
          ))}
        </div>

        <div className="flex gap-2 mt-1">
          <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); open('file'); }}>
            <Plus size={14} /> Choose files
          </button>
          <button type="button" className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); open('folder'); }}>
            <FolderInput size={14} /> Upload folder
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function walkEntry(entry, files, done) {
  if (entry.isFile) {
    entry.file((file) => {
      if (/\.(png|jpe?g|pdf|webp)$/i.test(file.name)) files.push(file);
      done();
    }, done);
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const readBatch = () => {
      reader.readEntries(async (entries) => {
        if (!entries.length) { done(); return; }
        let pending = entries.length;
        for (const e of entries) walkEntry(e, files, () => { pending--; if (pending === 0) readBatch(); });
      });
    };
    readBatch();
  } else {
    done();
  }
}

function UploadItem({ item, onCancel, onRemove, onRetry }) {
  const isDone = item.status === 'done';
  const isError = item.status === 'error';
  const isUploading = item.status === 'uploading' || item.status === 'pending';

  return (
    <motion.div
      className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-b-0"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      layout
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--surface2)] overflow-hidden flex items-center justify-center flex-shrink-0">
        {item.preview ? (
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.file?.type?.includes('pdf') ? <FileText size={16} /> : <ImageIcon size={16} />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold text-[var(--text)] truncate" title={item.file?.name}>{item.file?.name || item.name}</span>
          <span className="text-[13px] text-[var(--text-muted)] flex-shrink-0">{formatBytes(item.file?.size ?? item.size)}</span>
        </div>

        <div className="mt-1">
          <div className={`h-1.5 bg-[var(--surface3)] rounded-full overflow-hidden ${isError ? 'bg-red-500/20' : isDone ? 'bg-green-500/20' : ''}`}>
            <motion.div
              className={`h-full rounded-full ${isError ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.progress || 0}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[12px] text-[var(--text-muted)] flex items-center gap-1">
              {isError ? (
                <><AlertCircle size={11} className="text-red-500" /> {item.error || 'Failed'}</>
              ) : isDone ? (
                <><Check size={11} className="text-green-500" /> Uploaded</>
              ) : (
                <>{Math.round(item.progress || 0)}%
                  {isUploading && <Loader2 size={11} className="animate-spin" />}
                </>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              {item.version && <span className="text-[11px] text-[var(--text-muted)]">v{item.version}</span>}
              {item.project && <span className="text-[11px] text-[var(--text-muted)]">{item.project}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {isUploading && (
          <button className="w-7 h-7 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface3)] transition-colors" onClick={() => onCancel(item.id)} title="Cancel">
            <X size={13} />
          </button>
        )}
        {isError && (
          <button className="w-7 h-7 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface3)] transition-colors" onClick={() => onRetry(item.id)} title="Retry">
            <RefreshCw size={13} />
          </button>
        )}
        {(isDone || isError) && (
          <button className="w-7 h-7 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => onRemove(item.id)} title="Remove">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ScreenshotCard({ screen, onRemove }) {
  const handleRemove = () => onRemove && onRemove(screen.id, screen.project_id);
  return (
    <motion.div
      className="m-4 group"
      whileHover={{ y: -2 }}
      layout
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--surface2)] mb-2">
        {screen.url || screen.thumbnail ? (
          <img src={screen.url || screen.thumbnail} alt={screen.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <ImageIcon size={20} />
          </div>
        )}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-semibold">
          {screen.version ? `v${screen.version}` : 'v1'}
        </div>
        {onRemove && (
          <button
            className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            onClick={handleRemove}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[var(--text)] truncate">{screen.name}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-0.5 truncate">
            {screen.project_name || 'Project'} · {formatBytes(screen.size)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CollapsibleSection({ title, icon: Icon, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[var(--surface2)] transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={14} className="text-[var(--text-muted)] flex-shrink-0" />
        <span className="text-[14px] font-semibold text-[var(--text)] flex-1">{title}</span>
        {typeof count === 'number' && (
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--surface2)] text-[11px] font-semibold text-[var(--text-muted)]">{count}</span>
        )}
        <span className="text-[var(--text-muted)]">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UploadPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  const [mode, setMode] = useState('multiple');
  const [items, setItems] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const countersRef = useRef({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.listProjects();
        const list = Array.isArray(res) ? res : (res.items || res.projects || []);
        setProjects(list);
        if (list.length && !activeProject) setActiveProject(list[0].id);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projectScreens = useMemo(() => {
    if (!activeProject) return [];
    const p = projects.find((x) => x.id === activeProject);
    return (p?.screens || []).filter((s) => /\.(png|jpe?g|webp|pdf)$/i.test(s.url || s.name || ''));
  }, [projects, activeProject]);

  const addFiles = (files) => {
    const next = files.slice(0, 50 - items.length).map((file) => {
      const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const project = projects.find((p) => p.id === activeProject);
      const existingCount = projectScreens.filter((s) => (s.name || '').startsWith(file.name.replace(/\.[^.]+$/, ''))).length;
      const version = existingCount + 1;
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        preview,
        project: project?.name || null,
        version: mode === 'version' ? version : 1,
      };
    });
    setItems((prev) => [...prev, ...next]);
    if (next.length) startUploads(next);
  };

  const startUploads = (queue) => {
    queue.forEach((it) => uploadOne(it));
  };

  const uploadOne = (item) => {
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading', progress: 0 } : x)));

    const tick = setInterval(() => {
      setItems((prev) => prev.map((x) => {
        if (x.id !== item.id) return x;
        if (x.status !== 'uploading') return x;
        const inc = 6 + Math.random() * 14;
        const next = Math.min(92, (x.progress || 0) + inc);
        return { ...x, progress: next };
      }));
    }, 250);

    countersRef.current[item.id] = { cancelled: false, tick };

    const fd = new FormData();
    fd.append('file', item.file);
    fd.append('name', item.name);
    if (activeProject) fd.append('project_id', activeProject);
    if (item.version) fd.append('version', String(item.version));

    api.upload(activeProject
      ? `/projects/${activeProject}/screenshots/upload`
      : '/projects/0/screenshots/upload', {
      method: 'POST',
      body: fd,
    })
      .then(async (res) => {
        if (!res.ok) {
          let data = null;
          try { data = await res.json(); } catch { /* ignore */ }
          throw new Error(data?.detail || data?.message || `Upload failed (${res.status})`);
        }
        let data = null;
        try { data = await res.json(); } catch { data = null; }
        clearInterval(tick);
        setItems((prev) => prev.map((x) => (x.id === item.id
          ? { ...x, status: 'done', progress: 100, screen: data?.screen || data }
          : x)));
        if (data?.screen) {
          setScreens((prev) => [data.screen, ...prev]);
        }
      })
      .catch((err) => {
        clearInterval(tick);
        setItems((prev) => prev.map((x) => (x.id === item.id
          ? { ...x, status: 'error', error: err.message || 'Upload failed' }
          : x)));
      });
  };

  const cancelUpload = (id) => {
    countersRef.current[id] && (countersRef.current[id].cancelled = true);
    clearInterval(countersRef.current[id]?.tick);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const retryUpload = (id) => {
    const item = items.find((x) => x.id === id);
    if (item) uploadOne({ ...item, status: 'pending', progress: 0, error: null });
  };

  const removeItem = (id) => {
    const item = items.find((x) => x.id === id);
    if (item?.preview) URL.revokeObjectURL(item.preview);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const removeScreenshot = async (screenId, projectId) => {
    // Remove from local screens state immediately
    setScreens((prev) => prev.filter((s) => s.id !== screenId));
    // Try to delete from backend if it has a project_id
    if (projectId) {
      try {
        await api.deleteScreen(projectId, screenId);
      } catch {
        // Already removed from UI above
      }
    }
  };

  const clearCompleted = () => {
    setItems((prev) => {
      prev.filter((x) => x.status === 'done').forEach((x) => x.preview && URL.revokeObjectURL(x.preview));
      return prev.filter((x) => x.status !== 'done');
    });
  };

  const totalUploading = items.filter((x) => x.status === 'uploading').length;
  const totalDone = items.filter((x) => x.status === 'done').length;
  const totalErrors = items.filter((x) => x.status === 'error').length;

  return (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <header className="px-7 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)] text-[var(--accent)] text-[11px] font-bold tracking-wide w-fit mb-2">
          <UploadCloud size={11} /> Module 5
        </div>
        <h1 className="text-[22px] font-bold text-[var(--text)] leading-tight">Screenshot Upload</h1>
        <p className="text-[13px] text-[var(--text-2)] mt-1">Bring your designs in — analyze, review and compare them in one place.</p>
      </header>

      {/* Target project */}
      <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-4 max-md:flex-col">
        <div className="flex-1 min-w-0">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">Target project</label>
          <div className="relative">
            <select
              value={activeProject}
              onChange={(e) => setActiveProject(e.target.value)}
              disabled={loading}
              className="w-full appearance-none bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 pr-8 text-[14px] text-[var(--text)] outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {projects.length === 0 && <option value="">No projects yet</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
        <div className="flex-shrink-0 pt-5">
          {user && (
            <span className="text-[12px] text-[var(--text-muted)]">Uploading as <strong className="text-[var(--text)]">{user.name || user.email}</strong></span>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div className="mx-4 mb-3">
        <DropZone onFiles={addFiles} disabled={items.length >= 50} />
      </div>

      {/* Upload options */}
      <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="text-[15px] font-bold text-[var(--text)] mb-0.5">Upload options</div>
        <div className="text-[13px] text-[var(--text-2)] mb-3">Pick how files should be grouped and stored.</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {UPLOAD_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full font-inherit ${
                  isActive
                    ? 'border-[var(--accent)] bg-[rgba(124,92,255,0.08)]'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/50'
                }`}
                onClick={() => setMode(m.id)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-[rgba(124,92,255,0.15)] text-[var(--accent)]' : 'bg-[var(--surface2)] text-[var(--text-2)]'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text)]">{m.label}</div>
                  <div className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-snug">{m.desc}</div>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-white flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload progress section title */}
      <div className="px-7 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Upload progress
          {items.length > 0 && (
            <span className="ml-2 normal-case text-[11px] font-medium tracking-normal">
              {totalDone}/{items.length} done
              {totalUploading > 0 && ` · ${totalUploading} active`}
              {totalErrors > 0 && ` · ${totalErrors} failed`}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[12px] font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors" onClick={clearCompleted}>
            <Trash2 size={11} /> Clear completed
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px]">
          <AlertCircle size={14} className="inline mr-2" />{error}
        </div>
      )}

      {/* Upload items */}
      {items.length === 0 ? (
        <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <UploadCloud size={24} className="text-[var(--text-muted)]" />
          <div className="text-[18px] font-bold text-[var(--text)]">No uploads yet</div>
          <div className="text-[14px] text-[var(--text-2)] max-w-xs">Drop files above to start uploading.</div>
        </div>
      ) : (
        <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <AnimatePresence>
            {items.map((item) => (
              <UploadItem
                key={item.id}
                item={item}
                onCancel={cancelUpload}
                onRemove={removeItem}
                onRetry={retryUpload}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Screenshots section */}
      <div className="px-7 pt-3 pb-1 flex items-center justify-between flex-shrink-0">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Screenshots in this project
          <span className="ml-2 normal-case text-[11px] font-medium tracking-normal">{projectScreens.length + screens.length}</span>
        </div>
      </div>

      {projectScreens.length === 0 && screens.length === 0 ? (
        <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
          <ImageIcon size={24} className="text-[var(--text-muted)]" />
          <div className="text-[18px] font-bold text-[var(--text)]">No screenshots yet</div>
          <div className="text-[14px] text-[var(--text-2)] max-w-xs">Uploaded screenshots will appear here.</div>
        </div>
      ) : (
        <div className="mx-4 mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[...screens, ...projectScreens].map((s) => (
              <ScreenshotCard key={s.id} screen={s} onRemove={s.project_id ? removeScreenshot : null} />
            ))}
          </div>
        </div>
      )}

      {/* Library sections */}
      <div className="px-4 mt-2 mb-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 pt-4 pb-2">Library</div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">

          {/* Version history */}
          <CollapsibleSection title="Version history" icon={History} count={projectScreens.length}>
            {projectScreens.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center text-[var(--text-muted)] text-[13px]">
                No versions yet — upload to start a new revision.
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border)]">
                {projectScreens.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[var(--text)] truncate">{s.name}</div>
                      <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{formatBytes(s.size)} · v{s.version || 1}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm flex-shrink-0"><Eye size={11} /> View</button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Supported formats */}
          <CollapsibleSection title="Supported formats" icon={FileText} count={SUPPORTED_FORMATS.length} defaultOpen>
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {SUPPORTED_FORMATS.map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface2)] flex items-center justify-center flex-shrink-0">
                    <FileImage size={14} className="text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[var(--text)]">{f.label}</div>
                    <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{f.mime}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[11px] font-semibold border border-green-500/20">Supported</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

        </div>
      </div>

    </div>
  );
}
