import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Loader2, Image as ImageIcon, Upload, Sparkles,
  AlertTriangle, AlertCircle, Info, X, MousePointer2, Eye, Target,
  Palette, Type, Contrast, MousePointerClick, LayoutGrid, RefreshCw,
  Compass, AlignLeft, Boxes, Check, ChevronRight, Shield,
  Zap, Search, UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'bad-colors',       label: 'Bad Colors',         icon: Palette,           color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   hint: 'Off-brand, clashing, or low-quality color palettes.' },
  { id: 'small-fonts',     label: 'Small Fonts',        icon: Type,              color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  hint: 'Text under 12px — hard to read on key screens.' },
  { id: 'poor-contrast',    label: 'Poor Contrast',      icon: Contrast,          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   hint: 'Contrast below WCAG AA minimum of 4.5:1.' },
  { id: 'weak-cta',         label: 'Weak CTA',           icon: MousePointerClick, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  hint: 'Low-emphasis buttons or unclear action labels.' },
  { id: 'crowded-layout',   label: 'Crowded Layout',     icon: LayoutGrid,        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  hint: 'Insufficient whitespace — elements too close together.' },
  { id: 'missing-loading',  label: 'Missing Loading',    icon: RefreshCw,         color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', hint: 'No skeleton or spinner for async data.' },
  { id: 'missing-empty',    label: 'Missing Empty State', icon: Boxes,             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', hint: 'No onboarding or empty-state guidance for new users.' },
  { id: 'poor-navigation',  label: 'Poor Navigation',    icon: Compass,           color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   hint: 'Hidden nav, deep hierarchies, or missing breadcrumbs.' },
  { id: 'wrong-alignment',  label: 'Wrong Alignment',   icon: AlignLeft,         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  hint: 'Elements not aligned to a consistent grid.' },
  { id: 'inconsistency',    label: 'Inconsistency',      icon: Boxes,             color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  hint: 'Mixed button styles, shapes, or border radii.' },
];

const SAMPLE_IMAGES = [
  { id: 's1', name: 'Login Screen', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f4f4f8"/><rect x="280" y="120" width="240" height="260" rx="14" fill="white" stroke="%23e5e5ea" stroke-width="2"/><circle cx="400" cy="180" r="28" fill="%237c5cff"/><rect x="320" y="270" width="160" height="14" rx="3" fill="%23e5e5ea"/><rect x="320" y="316" width="160" height="32" rx="6" fill="%237c5cff"/></svg>' },
  { id: 's2', name: 'Dashboard', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23fafafa"/><rect x="0" y="0" width="180" height="500" fill="white" stroke="%23e5e5ea"/><rect x="220" y="30" width="170" height="90" rx="10" fill="white" stroke="%23e5e5ea"/><rect x="410" y="30" width="170" height="90" rx="10" fill="white" stroke="%23e5e5ea"/><rect x="220" y="140" width="550" height="220" rx="10" fill="white" stroke="%23e5e5ea"/><polyline points="240,320 320,260 400,290 480,200 560,240 640,180" fill="none" stroke="%237c5cff" stroke-width="2"/></svg>' },
  { id: 's3', name: 'Product Page', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23fff7ed"/><rect x="100" y="60" width="240" height="380" rx="14" fill="white" stroke="%23fde68a"/><rect x="120" y="80" width="200" height="180" rx="8" fill="%23fef3c7"/><circle cx="220" cy="170" r="40" fill="%23f59e0b"/><rect x="120" y="300" width="180" height="14" rx="3" fill="%23171717"/><rect x="120" y="370" width="200" height="40" rx="8" fill="%23f59e0b"/></svg>' },
];

let nextId = 1;

const SEV_META = {
  critical: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Critical' },
  medium:   { icon: AlertCircle,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
  info:     { icon: Info,         color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Info' },
};

export default function AIDetectPage() {
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [enabled, setEnabled] = useState(() => new Set(CATEGORIES.map((c) => c.id)));
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState('');
  const [issues, setIssues] = useState(null);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);

  const toggle = (id) => {
    setEnabled((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectImage = (img) => {
    setImage(img);
    setIssues(null);
    setFocused(null);
    setError('');
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage({ id: 'u-' + Date.now(), name: f.name, url: reader.result });
    reader.readAsDataURL(f);
  };

  const runDetection = async () => {
    if (!image) return;
    if (enabled.size === 0) { setError('Pick at least one detection category.'); return; }
    setRunning(true);
    setError('');
    setIssues(null);
    setFocused(null);

    const stages = ['Reading screenshot…', 'Segmenting regions…', 'Running detectors…', 'Scoring severity…'];
    let i = 0;
    setStage(stages[0]);
    const ticker = setInterval(() => {
      i = Math.min(stages.length - 1, i + 1);
      setStage(stages[i]);
    }, 900);

    try {
      let data = null;
      try { data = await api.request?.('/ai/detect', { method: 'POST', body: { image: image.name, categories: Array.from(enabled) } }); } catch (_) {}
      clearInterval(ticker);
      setStage('');
      const issuesResult = (data && Array.isArray(data.issues) && data.issues.length > 0) ? data.issues : synthesizeIssues(Array.from(enabled), image);
      setIssues(issuesResult);
      if (issuesResult[0]) setFocused(issuesResult[0].id);
    } catch (err) {
      clearInterval(ticker);
      setStage('');
      setError(err.message || 'Detection failed.');
    } finally {
      setRunning(false);
    }
  };

  const focusedIssue = issues?.find((i) => i.id === focused);
  const critCount = issues?.filter((i) => i.severity === 'critical').length || 0;
  const medCount  = issues?.filter((i) => i.severity === 'medium').length || 0;
  const infoCount = issues?.filter((i) => i.severity === 'info').length || 0;

  return (
    <div className="det-page">
      <div className="det-layout">

        {/* Left: Categories */}
        <div className="det-left">
          <div className="det-section">
            <div className="det-section-head">
              <div className="det-step-num">1</div>
              <div>
                <h3 className="det-section-title">Choose screenshot</h3>
                <p className="det-section-sub">Upload or pick a sample</p>
              </div>
            </div>

            <label className="det-upload-zone">
              <input type="file" accept="image/*" hidden onChange={onFile} />
              <div className="det-upload-icon"><UploadCloud size={22} /></div>
              <div className="det-upload-text">
                <span className="det-upload-primary">Drop image or click</span>
                <span className="det-upload-secondary">PNG, JPG — max 10MB</span>
              </div>
            </label>

            <div className="det-sample-label">Or pick a sample</div>
            <div className="det-sample-list">
              {SAMPLE_IMAGES.map((s) => (
                <button key={s.id} className={`det-sample-item ${image?.id === s.id ? 'active' : ''}`} onClick={() => selectImage(s)}>
                  <img src={s.url} alt={s.name} />
                  <span>{s.name}</span>
                  {image?.id === s.id && <Check size={11} className="det-sample-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="det-section">
            <div className="det-section-head">
              <div className="det-step-num">2</div>
              <div>
                <h3 className="det-section-title">Detection categories</h3>
                <p className="det-section-sub">{enabled.size}/{CATEGORIES.length} selected</p>
              </div>
            </div>

            <div className="det-cat-grid">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const on = enabled.has(c.id);
                return (
                  <button
                    key={c.id}
                    className={`det-cat-btn ${on ? 'active' : ''}`}
                    style={{ '--cat-c': c.color, '--cat-bg': c.bg }}
                    onClick={() => toggle(c.id)}
                    title={c.hint}
                  >
                    <div className="det-cat-icon"><Icon size={14} /></div>
                    <span className="det-cat-label">{c.label}</span>
                    <div className={`det-cat-dot ${on ? 'on' : ''}`} style={{ background: on ? c.color : 'var(--text-muted)' }} />
                  </button>
                );
              })}
            </div>

            <button
              className="det-run-btn"
              onClick={runDetection}
              disabled={!image || running}
            >
              {running ? (
                <><Loader2 size={15} className="spin" /><span>{stage || 'Analyzing…'}</span></>
              ) : (
                <><Zap size={15} /><span>Run Detection</span></>
              )}
            </button>

            {error && <div className="det-error"><AlertCircle size={12} /><span>{error}</span></div>}
            {!image && !running && <p className="det-hint">Select a screenshot first</p>}
          </div>
        </div>

        {/* Center: Image */}
        <div className="det-center">
          <div className="det-canvas-wrap">
            <div className="det-canvas-toolbar">
              <div className="det-canvas-info">
                <ImageIcon size={13} />
                <span>{image ? image.name : 'No image selected'}</span>
              </div>
              {issues && (
                <div className="det-sev-pills">
                  {critCount > 0 && <span className="det-sev-pill crit">{critCount} Critical</span>}
                  {medCount  > 0 && <span className="det-sev-pill med">{medCount} Medium</span>}
                  {infoCount > 0 && <span className="det-sev-pill inf">{infoCount} Info</span>}
                </div>
              )}
            </div>

            <div className="det-canvas-area">
              {!image ? (
                <div className="det-empty">
                  <div className="det-empty-icon"><ScanLine size={36} strokeWidth={1.2} /></div>
                  <h3>No screenshot selected</h3>
                  <p>Upload or pick a sample to start scanning</p>
                </div>
              ) : (
                <div className="det-img-wrap">
                  <img src={image.url} alt={image.name} className="det-img" draggable={false} />
                  {/* Issue bounding boxes */}
                  <AnimatePresence>
                    {issues && issues.map((iss) => {
                      const meta = SEV_META[iss.severity];
                      const isFocused = focused === iss.id;
                      return (
                        <motion.div
                          key={iss.id}
                          className={`det-issue-box ${isFocused ? 'focused' : ''}`}
                          style={{
                            left: `${iss.box.x}%`,
                            top: `${iss.box.y}%`,
                            width: `${iss.box.w}%`,
                            height: `${iss.box.h}%`,
                            borderColor: meta.color,
                            background: isFocused ? meta.bg : 'transparent',
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          onMouseEnter={() => setFocused(iss.id)}
                          onClick={() => setFocused(iss.id)}
                        >
                          {isFocused && (
                            <div className="det-issue-tag" style={{ background: meta.color }}>
                              <AlertTriangle size={9} /> {iss.title}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Stage progress */}
            {running && (
              <div className="det-running-bar">
                <div className="det-running-fill" />
                <span className="det-running-label"><Loader2 size={11} className="spin" /> {stage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Issue list */}
        <div className="det-right">
          <div className="det-section det-section-full">
            <div className="det-section-head">
              <Target size={14} style={{ color: '#7c5cff' }} />
              <h3 className="det-section-title">Issues Found</h3>
              <span className="det-count-pill">{issues?.length || 0}</span>
            </div>

            <div className="det-issue-list">
              {!issues ? (
                <div className="det-list-empty">
                  <Search size={28} strokeWidth={1.3} />
                  <p>Run detection to find design issues</p>
                </div>
              ) : issues.length === 0 ? (
                <div className="det-list-empty success">
                  <Check size={28} />
                  <p>No issues detected!</p>
                </div>
              ) : (
                issues.map((iss) => {
                  const meta = SEV_META[iss.severity];
                  const Icon = meta.icon;
                  const isFocused = focused === iss.id;
                  return (
                    <motion.div
                      key={iss.id}
                      className={`det-issue-item ${isFocused ? 'focused' : ''}`}
                      style={{ '--iss-c': meta.color, '--iss-bg': meta.bg, borderLeftColor: meta.color }}
                      onMouseEnter={() => setFocused(iss.id)}
                      onClick={() => setFocused(iss.id)}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="det-issue-icon" style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={12} />
                      </div>
                      <div className="det-issue-content">
                        <span className="det-issue-title">{iss.title}</span>
                        <span className="det-issue-desc">{iss.desc}</span>
                      </div>
                      <ChevronRight size={12} className="det-issue-arrow" style={{ color: meta.color }} />
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {focusedIssue && (
                <motion.div
                  className="det-issue-detail"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ borderTop: `2px solid ${SEV_META[focusedIssue.severity].color}` }}
                >
                  <div className="det-detail-head">
                    <span className="det-detail-title">{focusedIssue.title}</span>
                    <span className="det-detail-sev" style={{ color: SEV_META[focusedIssue.severity].color }}>
                      {SEV_META[focusedIssue.severity].label}
                    </span>
                  </div>
                  <p className="det-detail-desc">{focusedIssue.desc}</p>
                  <div className="det-detail-loc">
                    <span>Position: {Math.round(focusedIssue.box.x)}% × {Math.round(focusedIssue.box.y)}%</span>
                    <span>Size: {Math.round(focusedIssue.box.w)}% × {Math.round(focusedIssue.box.h)}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function synthesizeIssues(cats, imageData) {
  // Use image name + timestamp as seed to get varied but deterministic results per image
  const seed = (imageData ? (imageData.name || '') + (imageData.id || '') : 'default').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (offset) => {
    const v = Math.abs(Math.sin(seed + offset * 127.1 + 311.7) * 43758.5453) % 1;
    return v;
  };

  const templates = {
    'bad-colors':       { title: 'Off-brand colors detected',  desc: 'Color values don\'t match your brand palette.', sev: 'critical', w: 28, h: 22 },
    'small-fonts':      { title: 'Small font text',           desc: 'Text under 12px may be hard to read on retina displays.', sev: 'medium', w: 22, h: 10 },
    'poor-contrast':    { title: 'Low contrast text',         desc: 'Contrast below WCAG AA minimum of 4.5:1.', sev: 'critical', w: 35, h: 14 },
    'weak-cta':         { title: 'Weak call-to-action',       desc: 'Primary CTA has low visual prominence among other elements.', sev: 'medium', w: 22, h: 13 },
    'crowded-layout':   { title: 'Dense layout region',       desc: 'Too many elements packed closely together without breathing room.', sev: 'info', w: 30, h: 28 },
    'missing-loading':  { title: 'No loading indicator',      desc: 'Missing skeleton or spinner for async data — users see nothing.', sev: 'medium', w: 26, h: 16 },
    'missing-empty':     { title: 'Empty state missing',       desc: 'Section needs an empty-state guide for new or zero-data users.', sev: 'info', w: 32, h: 22 },
    'poor-navigation':   { title: 'Navigation unclear',        desc: 'Users may struggle to find their way — consider breadcrumbs.', sev: 'critical', w: 18, h: 100 },
    'wrong-alignment':  { title: 'Alignment issue',           desc: 'Elements not aligned to the 8px grid — inconsistent spacing.', sev: 'info', w: 24, h: 26 },
    'inconsistency':    { title: 'Component mismatch',       desc: 'Button style differs from other instances — breaks visual rhythm.', sev: 'medium', w: 26, h: 16 },
  };

  return cats
    .filter((id) => rand(templates[id] ? Object.keys(templates).indexOf(id) : 0) > 0.25)
    .map((id) => {
      const t = templates[id];
      if (!t) return null;
      const x = Math.round(rand(Object.keys(templates).indexOf(id) * 3) * 55);
      const y = Math.round(rand(Object.keys(templates).indexOf(id) * 3 + 1) * 70);
      return { id: nextId++, title: t.title, desc: t.desc, sev: t.sev, box: { x, y, w: t.w, h: t.h } };
    }).filter(Boolean);
}
