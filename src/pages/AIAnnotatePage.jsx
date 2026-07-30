import { useRef, useEffect, useState, useCallback } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Highlighter, Pencil, ArrowRight,
  Trash2, Plus, Loader2, X, Check, Flag,
  MousePointer2, Save, Sparkles, Image as ImageIcon,
  Pen, MessageSquare, CheckCircle2, UploadCloud,
  PenLine, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TOOLS = [
  { id: 'critical', label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: Flag },
  { id: 'medium',   label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: MessageSquare },
  { id: 'good',     label: 'Good',     color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2 },
  { id: 'draw',     label: 'Freehand', color: '#7c5cff', bg: 'rgba(124,92,255,0.12)', icon: Pencil },
  { id: 'arrow',    label: 'Arrow',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: ArrowRight },
];

const SAMPLE_IMAGES = [
  { id: 'sample-1', name: 'Login Screen', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f4f4f8"/><rect x="280" y="120" width="240" height="260" rx="14" fill="white" stroke="%23e5e5ea" stroke-width="2"/><circle cx="400" cy="180" r="28" fill="%237c5cff"/><rect x="320" y="230" width="160" height="14" rx="3" fill="%23e5e5ea"/><rect x="320" y="270" width="160" height="32" rx="6" fill="white" stroke="%23e5e5ea" stroke-width="1.5"/><rect x="320" y="316" width="160" height="32" rx="6" fill="%237c5cff"/></svg>' },
  { id: 'sample-2', name: 'Dashboard', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23fafafa"/><rect x="0" y="0" width="180" height="500" fill="white" stroke="%23e5e5ea"/><rect x="20" y="30" width="120" height="14" rx="3" fill="%237c5cff"/><rect x="20" y="70" width="100" height="8" rx="2" fill="%23a1a1aa"/><rect x="220" y="30" width="170" height="90" rx="10" fill="white" stroke="%23e5e5ea"/><rect x="410" y="30" width="170" height="90" rx="10" fill="white" stroke="%23e5e5ea"/><rect x="600" y="30" width="170" height="90" rx="10" fill="white" stroke="%23e5e5ea"/><rect x="240" y="50" width="80" height="8" rx="2" fill="%23a1a1aa"/><rect x="240" y="76" width="60" height="20" rx="3" fill="%237c5cff"/></svg>' },
  { id: 'sample-3', name: 'Product Card', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23fff7ed"/><rect x="100" y="60" width="240" height="380" rx="14" fill="white" stroke="%23fde68a"/><rect x="120" y="80" width="200" height="180" rx="8" fill="%23fef3c7"/><circle cx="220" cy="170" r="40" fill="%23f59e0b"/><rect x="120" y="280" width="120" height="10" rx="2" fill="%23a1a1aa"/><rect x="120" y="300" width="180" height="14" rx="3" fill="%23171717"/><rect x="120" y="370" width="200" height="40" rx="8" fill="%23f59e0b"/></svg>' },
];

let nextId = 1;

const TOOL_HINTS = {
  critical: 'Click to place a Critical marker',
  medium: 'Click to place a Medium marker',
  good: 'Click to place a Good marker',
  draw: 'Click & drag to freehand draw',
  arrow: 'Click & drag to draw an arrow',
};

export default function AIAnnotatePage() {
  const { user } = useAuth();
  const { ask } = useConfirm();
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [tool, setTool] = useState('critical');
  const [image, setImage] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 800, h: 500 });
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [arrowStart, setArrowStart] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [screenshotId, setScreenshotId] = useState(null);

  const selectImage = (img) => {
    setImage(img);
    setScreenshotId(img.id || 'ss_' + Date.now());
    setAnnotations([]);
    setNoteFor(null);
    setNoteText('');
    setSaved(false);
  };

  const onImageLoad = (e) => {
    const el = e.target;
    setImgSize({ w: el.naturalWidth || el.clientWidth, h: el.naturalHeight || el.clientHeight });
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e) => {
    if (!image) return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    if (tool === 'arrow') { setArrowStart(p); return; }
    if (tool === 'critical' || tool === 'medium' || tool === 'good') {
      const id = nextId++;
      const t = TOOLS.find((x) => x.id === tool);
      const ann = { id, type: 'highlight', color: t.color, x: p.x - 28, y: p.y - 14, w: 56, h: 28, note: '', ts: Date.now() };
      setAnnotations((a) => [...a, ann]);
      setNoteFor(ann);
      setNoteText('');
      return;
    }
    if (tool === 'draw') {
      setDrawing(true);
      setCurrentPath({ color: TOOLS.find((x) => x.id === 'draw').color, points: [p] });
    }
  };

  const moveDraw = (e) => {
    if (!drawing || tool !== 'draw') return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    setCurrentPath((prev) => prev ? { ...prev, points: [...prev.points, p] } : prev);
  };

  const endDraw = (e) => {
    if (!image) return;
    if (tool === 'arrow' && arrowStart) {
      const p = getCanvasPoint(e);
      const color = TOOLS.find((x) => x.id === 'arrow').color;
      const id = nextId++;
      const ann = { id, type: 'arrow', color, x1: arrowStart.x, y1: arrowStart.y, x2: p.x, y2: p.y, note: '', _kept: true, ts: Date.now() };
      setAnnotations((a) => [...a, ann]);
      setArrowStart(null);
      return;
    }
    if (drawing && currentPath && currentPath.points.length > 1) {
      const id = nextId++;
      const ann = { id, type: 'path', color: currentPath.color, points: currentPath.points, note: '', _kept: true, ts: Date.now() };
      setAnnotations((a) => [...a, ann]);
      setNoteFor(ann);
      setNoteText('');
    }
    setDrawing(false);
    setCurrentPath(null);
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((a) => {
      if (a.type === 'highlight') {
        ctx.fillStyle = a.color + '40';
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        roundRect(ctx, a.x, a.y, a.w, a.h, 6);
        ctx.fill();
        ctx.stroke();
        if (a.note) {
          ctx.font = 'bold 11px Inter, sans-serif';
          const tw = ctx.measureText(a.note).width;
          ctx.fillStyle = a.color;
          ctx.fillRect(a.x + a.w / 2 - tw / 2 - 4, a.y + a.h + 4, tw + 8, 16);
          ctx.fillStyle = '#fff';
          ctx.fillText(a.note, a.x + a.w / 2 - tw / 2, a.y + a.h + 15);
        }
      } else if (a.type === 'arrow') {
        drawArrow(ctx, a.x1, a.y1, a.x2, a.y2, a.color);
      } else if (a.type === 'path') {
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        a.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    if (currentPath && currentPath.points.length > 1) {
      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      currentPath.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }, [annotations, currentPath]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !image) return;
    const observer = new ResizeObserver(() => {
      if (canvasRef.current && img) {
        canvasRef.current.width = img.clientWidth;
        canvasRef.current.height = img.clientHeight;
        redraw();
      }
    });
    observer.observe(img);
    return () => observer.disconnect();
  }, [image, redraw]);

  const saveAnnotations = async () => {
    if (!image || annotations.length === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('ui_inspectore_token');
      for (const ann of annotations) {
        const severityMap = { critical: 'critical', medium: 'medium', good: 'info' };
        const payload = {
          screenshot_id: screenshotId,
          type: ann.type === 'path' ? 'freehand' : ann.type,
          severity: severityMap[tool] || 'info',
          x: ann.x ?? ann.x1 ?? 0,
          y: ann.y ?? ann.y1 ?? 0,
          ...(ann.w ? { width: ann.w, height: ann.h } : {}),
          ...(ann.points ? { points: ann.points } : {}),
          color: ann.color,
          note: ann.note || null,
        };
        await api.post('/annotations', payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => null);
      }
    } catch (_) {}
    setSaving(false);
    setSaved(true);
  };

  const clearAll = async () => {
    if (!await ask({ title: 'Clear all annotations?', message: 'All current annotations will be removed.', confirmLabel: 'Clear', danger: true })) return;
    setAnnotations([]);
    setNoteFor(null);
    setNoteText('');
    setSaved(false);
  };

  const saveNote = () => {
    if (!noteFor) return;
    setAnnotations((prev) => prev.map((a) => a.id === noteFor.id ? { ...a, note: noteText.trim(), _kept: true } : a));
    setNoteFor(null);
    setNoteText('');
    setSaved(false);
  };

  const cancelNote = () => {
    if (!noteFor) return;
    setAnnotations((prev) => {
      const existing = prev.find((a) => a.id === noteFor.id);
      if (existing && !existing.note && !existing._kept) return prev.filter((a) => a.id !== noteFor.id);
      return prev;
    });
    setNoteFor(null);
    setNoteText('');
  };

  const deleteAnnotation = (id) => setAnnotations((prev) => prev.filter((a) => a.id !== id));

  const activeTool = TOOLS.find((t) => t.id === tool);
  const activeColor = activeTool?.color || '#7c5cff';

  return (
    <div className="ann-page">
      {/* Main layout */}
      <div className="ann-layout">
        {/* Left panel */}
        <div className="ann-left">

          {/* Step 1: Choose screenshot */}
          <div className="ann-section">
            <div className="ann-section-header">
              <div className="ann-step-num">1</div>
              <div>
                <h3 className="ann-section-title">Choose screenshot</h3>
                <p className="ann-section-sub">Upload or pick a sample</p>
              </div>
            </div>

            {/* Upload drop zone */}
            <label className="ann-upload-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) selectImage({ id: 'upload', name: f.name, url: URL.createObjectURL(f) });
                }}
                hidden
              />
              <div className="ann-upload-icon">
                <UploadCloud size={24} />
              </div>
              <div className="ann-upload-text">
                <span className="ann-upload-primary">Drop image here or click to browse</span>
                <span className="ann-upload-secondary">PNG, JPG — up to 10MB</span>
              </div>
            </label>

            {/* Sample images */}
            <div className="ann-sample-label">Or pick a sample</div>
            <div className="ann-sample-grid">
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.id}
                  className={`ann-sample-thumb ${image?.id === img.id ? 'active' : ''}`}
                  onClick={() => selectImage(img)}
                  title={img.name}
                >
                  <img src={img.url} alt={img.name} />
                  <span className="ann-sample-name">{img.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Pick tool */}
          <div className="ann-section">
            <div className="ann-section-header">
              <div className="ann-step-num">2</div>
              <div>
                <h3 className="ann-section-title">Pick a tool</h3>
                <p className="ann-section-sub">Severity marker, draw, or arrow</p>
              </div>
            </div>

            <div className="ann-tools-grid">
              {TOOLS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={`ann-tool-btn ${tool === t.id ? 'active' : ''}`}
                    style={{ '--tool-c': t.color, '--tool-bg': t.bg }}
                    onClick={() => setTool(t.id)}
                  >
                    <div className="ann-tool-icon">
                      <Icon size={16} />
                    </div>
                    <span className="ann-tool-label">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="ann-tool-hint" style={{ borderColor: activeColor + '40', color: activeColor }}>
              <Highlighter size={13} />
              <span>{TOOL_HINTS[tool]}</span>
            </div>

            <button
              className="ann-clear-btn"
              onClick={clearAll}
              disabled={annotations.length === 0}
            >
              <Trash2 size={13} />
              <span>Clear all annotations</span>
            </button>
          </div>
        </div>

        {/* Center canvas */}
        <div className="ann-center">
          <div className="ann-canvas-wrap">
            {/* Canvas toolbar */}
            <div className="ann-canvas-toolbar">
              <div className="ann-canvas-info">
                <ImageIcon size={14} />
                <span>{image ? image.name : 'No image selected'}</span>
              </div>
              <div className="ann-canvas-actions">
                <span className="ann-count-badge">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
                <button
                  className={`ann-save-btn ${saved ? 'saved' : ''}`}
                  onClick={saveAnnotations}
                  disabled={annotations.length === 0 || saving}
                >
                  {saving ? <Loader2 size={13} className="spin" />
                    : saved ? <Check size={13} />
                    : <Save size={13} />}
                  <span>{saving ? 'Saving…' : saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Note editor */}
            <AnimatePresence>
              {noteFor && (
                <motion.div
                  className="ann-note-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ borderTop: `2px solid ${noteFor.color}` }}
                >
                  <div className="ann-note-header">
                    <Flag size={11} style={{ color: noteFor.color }} />
                    <span>Add note — <em>{noteFor.type === 'highlight' ? 'highlight' : noteFor.type === 'arrow' ? 'arrow' : 'drawing'}</em></span>
                  </div>
                  <textarea
                    className="ann-note-input"
                    placeholder="Describe the issue or observation… (Ctrl+Enter to save)"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveNote();
                      if (e.key === 'Escape') cancelNote();
                    }}
                    rows={2}
                    autoFocus
                  />
                  <div className="ann-note-footer">
                    <span className="ann-note-hint">Esc to cancel</span>
                    <div className="ann-note-btns">
                      <button className="ann-btn-cancel" onClick={cancelNote}>Cancel</button>
                      <button className="ann-btn-save" onClick={saveNote} style={{ background: noteFor.color }}>
                        <Check size={11} /> Save note
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas area */}
            <div className="ann-canvas-area" ref={containerRef}>
              {!image ? (
                <div className="ann-empty">
                  <div className="ann-empty-icon">
                    <Layers size={36} strokeWidth={1.2} />
                  </div>
                  <h3>No screenshot selected</h3>
                  <p>Upload an image or pick a sample to start annotating</p>
                </div>
              ) : (
                <div className="ann-img-container">
                  <img
                    ref={imgRef}
                    src={image.url}
                    alt={image.name}
                    className="ann-img"
                    onLoad={onImageLoad}
                    draggable={false}
                  />
                  <canvas
                    ref={canvasRef}
                    className="ann-canvas-overlay"
                    onMouseDown={startDraw}
                    onMouseMove={moveDraw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={moveDraw}
                    onTouchEnd={endDraw}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="ann-right">
          <div className="ann-section ann-section-full">
            <div className="ann-section-header">
              <Sparkles size={14} style={{ color: '#7c5cff' }} />
              <h3 className="ann-section-title">Annotations</h3>
              <span className="ann-count-pill">{annotations.length}</span>
            </div>

            <div className="ann-list">
              {annotations.length === 0 ? (
                <div className="ann-list-empty">
                  <MousePointer2 size={24} strokeWidth={1.5} />
                  <p>Annotations will appear here as you draw</p>
                </div>
              ) : (
                annotations.map((a) => (
                  <div key={a.id} className="ann-item" style={{ borderLeftColor: a.color }}>
                    <div className="ann-item-dot" style={{ background: a.color }} />
                    <div className="ann-item-content">
                      <div className="ann-item-type">
                        {a.type === 'highlight' && 'Marker'}
                        {a.type === 'arrow' && 'Arrow'}
                        {a.type === 'path' && 'Drawing'}
                      </div>
                      {a.note && <div className="ann-item-note">{a.note}</div>}
                    </div>
                    <button className="ann-item-delete" onClick={() => deleteAnnotation(a.id)}>
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  const headLen = 14;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}
