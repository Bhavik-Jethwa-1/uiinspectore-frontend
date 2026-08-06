import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCw, Wand2, Download, Eye, Maximize2,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X,
  CheckCircle2, Sparkles, AlertCircle,
  SlidersHorizontal, SplitSquareHorizontal, Layers,
  RotateCcw, Image as ImageIcon, Check,
  Eye as EyeIcon, Layout, Code
} from 'lucide-react';
import { ACCENT } from '../constants/theme';

// ─── Compare Modes ────────────────────────────────────────────────────────────
const COMPARE_MODES = [
  { id: 'swipe',         label: 'Swipe',         icon: SlidersHorizontal },
  { id: 'side_by_side',  label: 'Side by Side',  icon: SplitSquareHorizontal },
  { id: 'overlay',       label: 'Overlay',        icon: Layers },
];

const DESIGN_STYLES = [
  { id: 'modern_saas',    label: 'Modern SaaS' },
  { id: 'minimal',        label: 'Minimal' },
  { id: 'glassmorphism',  label: 'Glassmorphism' },
  { id: 'enterprise',     label: 'Enterprise' },
  { id: 'dark',           label: 'Dark' },
];

// ─── Generation Steps ─────────────────────────────────────────────────────────
const GEN_STEPS = [
  { id: 'vision',    label: 'Analyzing Screenshot',   desc: 'Loading your screenshot and preparing filter parameters' },
  { id: 'prompt',    label: 'Applying Adjustments', desc: 'Applying brightness, contrast, and sharpness adjustments' },
  { id: 'generate',  label: 'Enhancing Image',       desc: 'Enhancing your screenshot with professional finishing touches' },
  { id: 'finalize',  label: 'Finalizing',           desc: 'Saving and preparing comparison view' },
];

function getStepStatus(currentId, stepId) {
  const order = GEN_STEPS.map(s => s.id);
  const cur = order.indexOf(currentId);
  const tgt = order.indexOf(stepId);
  if (tgt < cur) return 'done';
  if (tgt === cur) return 'active';
  return 'pending';
}

// ─── Error Card (simplified) ───────────────────────────────────────────────────
function ErrorCard({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(239,68,68,0.3)',
        boxShadow: '0 8px 32px rgba(239,68,68,0.08)',
      }}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(239,68,68,0.12)' }}>
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold mb-1" style={{ color: 'var(--text)' }}>
            Image generation unavailable
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {error?.error || error?.message || 'The service is temporarily unavailable. Please try again.'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}30` }}>
            <RefreshCw size={13} /> Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Live Progress ────────────────────────────────────────────────────────────
function LiveProgress({ step }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
          <Sparkles size={16} style={{ color: ACCENT }} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>AI is redesigning your UI</h3>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {step === 'vision' && 'Using GPT Vision to analyze your screenshot — layout, components, design issues'}
            {step === 'prompt' && 'Building a precise edit prompt — preserving layout, defining style improvements'}
            {step === 'generate' && 'GPT Image is editing your screenshot — keeping layout intact, improving style'}
            {step === 'finalize' && 'Finalizing and saving your redesigned screenshot'}
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {GEN_STEPS.map((s, i) => {
          const status = getStepStatus(step, s.id);
          const isActive = status === 'active';
          const isDone = status === 'done';

          return (
            <div key={s.id} className="flex items-start gap-4 relative">
              {i < GEN_STEPS.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px"
                  style={{
                    background: isDone
                      ? `linear-gradient(to bottom, ${ACCENT}, ${ACCENT}40)`
                      : 'var(--border)',
                  }}
                />
              )}

              <div className="relative z-10">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${ACCENT}20` }}>
                    <Check size={16} style={{ color: ACCENT }} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${ACCENT}20`, border: `2px solid ${ACCENT}60` }}>
                    <Loader2 size={16} style={{ color: ACCENT }} className="animate-spin" />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--surface2)', border: '2px solid var(--border)' }}>
                    <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  </div>
                )}
              </div>

              <div className="pt-1.5 pb-8">
                <div className="text-[13px] font-bold"
                  style={{ color: isDone ? ACCENT : isActive ? 'var(--text)' : 'var(--text-muted)' }}>
                  {s.label}
                </div>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {s.desc}
                  </motion.p>
                )}
                {isDone && <p className="text-[11px] mt-0.5" style={{ color: ACCENT, opacity: 0.7 }}>Complete ✓</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HTML Builder for Code Preview ───────────────────────────────────────────
function buildPreviewHtml(reactCode, supportingCode) {
  const combined = supportingCode ? `${supportingCode}\n\n${reactCode}` : reactCode;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body{margin:0;box-sizing:border-box;font-family:Inter,system-ui,sans-serif}*,*::before,*::after{box-sizing:border-box}</style>
</head>
<body><div id="root"></div>
<script type="text/babel" data-presets="react">
${combined}
</script></body>
</html>`;
}

// ─── Code Preview Compare (uses iframe with React render) ──────────────────────
function CodePreviewCompare({ originalUrl, previewHtml }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!previewHtml || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    doc.open(); doc.write(previewHtml); doc.close();
  }, [previewHtml]);

  return (
    <div className="grid grid-cols-2 gap-4" style={{ minHeight: 480 }}>
      {/* Original screenshot */}
      <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
          Original
        </div>
        {originalUrl && (
          <img src={originalUrl} alt="Original" className="w-full h-full object-contain" style={{ minHeight: 480 }} />
        )}
      </div>
      {/* Code-rendered preview */}
      <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: `${ACCENT}99`, color: '#fff' }}>
          Code Preview
        </div>
        <iframe
          ref={iframeRef}
          className="w-full rounded-2xl"
          style={{ height: 480, border: 0, display: 'block', background: 'var(--bg)' }}
          sandbox="allow-scripts"
          title="Code Preview"
        />
      </div>
    </div>
  );
}

// ─── Swipe Compare ────────────────────────────────────────────────────────────
function SwipeCompare({ originalUrl, redesignedUrl }) {
  const [swipeX, setSwipeX] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSwipeX(Math.max(2, Math.min(98, x)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden select-none cursor-col-resize"
      style={{ background: 'var(--bg)', maxHeight: '520px', userSelect: 'none' }}
      onMouseMove={e => dragging.current && handleMove(e.clientX)}
      onMouseDown={e => { dragging.current = true; handleMove(e.clientX); }}
      onMouseUp={() => dragging.current = false}
      onMouseLeave={() => dragging.current = false}
    >
      <img src={originalUrl} alt="Original"
        className="w-full max-h-[520px] object-contain pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - swipeX}% 0 0)` }}
        draggable={false}
      />
      <div className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${swipeX}%)` }}>
        <img src={redesignedUrl} alt="Filtered"
          className="w-full max-h-[520px] object-contain pointer-events-none"
          draggable={false}
        />
      </div>
      <div className="absolute top-0 bottom-0 w-1 cursor-col-resize"
        style={{
          left: `${swipeX}%`, transform: 'translateX(-50%)',
          background: ACCENT,
          boxShadow: `0 0 16px ${ACCENT}80`,
        }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: ACCENT, boxShadow: `0 2px 12px ${ACCENT}60` }}>
          <ChevronLeft size={12} className="text-white" />
          <ChevronRight size={12} className="text-white -ml-1" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>ORIGINAL</div>
      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md"
        style={{ background: `${ACCENT}cc`, color: '#fff' }}>AI IMPROVED</div>
    </div>
  );
}

// ─── Side by Side ─────────────────────────────────────────────────────────────
function SideBySideCompare({ originalUrl, redesignedUrl }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { url: originalUrl, label: 'Original', accent: false },
        { url: redesignedUrl, label: 'Filtered', accent: true },
      ].map(({ url, label, accent }) => (
        <div key={label} className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--bg)' }}>
          <img src={url} alt={label} className="w-full max-h-[520px] object-contain" />
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md"
            style={{ background: accent ? `${ACCENT}cc` : 'rgba(0,0,0,0.7)', color: '#fff' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Overlay Compare ──────────────────────────────────────────────────────────
function OverlayCompare({ originalUrl, redesignedUrl }) {
  const [opacity, setOpacity] = useState(50);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--bg)', maxHeight: '520px' }}>
      <img src={originalUrl} alt="Original"
        className="w-full max-h-[520px] object-contain pointer-events-none"
        style={{ opacity: 1 - opacity / 100 }}
        draggable={false}
      />
      <img src={redesignedUrl} alt="Filtered"
        className="absolute inset-0 w-full h-full max-h-[520px] object-contain pointer-events-none transition-opacity duration-200"
        style={{ opacity: opacity / 100 }}
        draggable={false}
      />
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>ORIGINAL</span>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Original</span>
          <input type="range" min={0} max={100} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: ACCENT }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>AI</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md"
          style={{ background: `${ACCENT}cc`, color: '#fff' }}>AI IMPROVED</span>
      </div>
    </div>
  );
}

// ─── Zoomable Image ───────────────────────────────────────────────────────────
function ZoomableImage({ src, alt }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPan = useRef({ x: 0, panX: 0, panY: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(4, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    startPan.current = { x: e.clientX, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: startPan.current.panX + (e.clientX - startPan.current.x), y: startPan.current.panY + (e.clientY - startPan.current.y) });
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{ background: 'var(--bg)', maxHeight: '520px', cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsPanning(false)}
      onMouseLeave={() => setIsPanning(false)}
    >
      <div style={{
        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
        transition: isPanning ? 'none' : 'transform 0.2s ease',
      }}>
        <img src={src} alt={alt} className="w-full max-h-[520px] object-contain pointer-events-none" draggable={false} />
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
          className="p-1.5 rounded-lg backdrop-blur-md transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}><ZoomOut size={13} /></button>
        <span className="text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(4, z + 0.25))}
          className="p-1.5 rounded-lg backdrop-blur-md transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}><ZoomIn size={13} /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 rounded-lg backdrop-blur-md transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}><RotateCcw size={13} /></button>
      </div>
    </div>
  );
}

// ─── AI Improvement Summary ────────────────────────────────────────────────────
function AISummaryCard({ redesign }) {
  const improved = redesign?.improved_items || [];
  const preserved = redesign?.unchanged_items || [];
  const analysis = redesign?.vision_analysis;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
            <Sparkles size={14} style={{ color: ACCENT }} />
          </div>
          <h3 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Filter Improvements</h3>
          {redesign?.provider && (
            <span className="ml-auto text-[11px] px-2 py-1 rounded-lg font-medium"
              style={{ background: `${ACCENT}10`, color: ACCENT }}>
              via {redesign.provider === 'gpt_image' ? 'GPT Image' : redesign.provider}
            </span>
          )}
        </div>
      </div>

      {/* Vision Analysis — what the AI saw */}
      {analysis && analysis.layout && (
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <EyeIcon size={12} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
              Filter Analysis
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {analysis.layout}
          </p>
          {analysis.components?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {analysis.components.slice(0, 12).map((c, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded-lg"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#22c55e' }}>
              Improved
            </span>
          </div>
          <div className="space-y-1.5">
            {improved.length > 0 ? improved.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <Check size={10} style={{ color: '#22c55e' }} />
                </div>
                <span className="text-[12px]" style={{ color: 'var(--text)' }}>{item}</span>
              </motion.div>
            )) : (
              <p className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>Design improvements applied</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layout size={13} style={{ color: ACCENT }} />
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
              Preserved
            </span>
          </div>
          <div className="space-y-1.5">
            {preserved.length > 0 ? preserved.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (improved.length + i) * 0.04 }}
                className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${ACCENT}15` }}>
                  <span className="text-[10px]" style={{ color: ACCENT }}>━</span>
                </div>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{item}</span>
              </motion.div>
            )) : (
              <p className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>Layout preserved exactly</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fullscreen Modal ─────────────────────────────────────────────────────────
function FullscreenModal({ originalUrl, redesignedUrl, mode, onClose }) {
  const [compareMode, setCompareMode] = useState(mode || 'side_by_side');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-bold text-white">Full Preview</h2>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {COMPARE_MODES.map(m => (
              <button key={m.id} onClick={() => setCompareMode(m.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: compareMode === m.id ? ACCENT : 'transparent',
                  color: compareMode === m.id ? '#fff' : 'rgba(255,255,255,0.6)',
                }}>
                <m.icon size={12} /> {m.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {compareMode === 'swipe' && <SwipeCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
        {compareMode === 'side_by_side' && <SideBySideCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
        {compareMode === 'overlay' && <OverlayCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
      </div>
    </motion.div>
  );
}

// ─── Download Menu ─────────────────────────────────────────────────────────────
function DownloadMenu({ originalUrl, redesignedUrl }) {
  const [open, setOpen] = useState(false);

  const download = async (url, filename) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <Download size={13} /> Download
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 rounded-xl py-1 z-20 min-w-[180px]"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {originalUrl && (
              <button onClick={() => download(originalUrl, 'original.png')}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <ImageIcon size={12} /> Original Screenshot
              </button>
            )}
            {redesignedUrl && (
              <button onClick={() => download(redesignedUrl, 'ai-improved.png')}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                <Wand2 size={12} /> Filtered Preview
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main VisualCompare Component ─────────────────────────────────────────────
export default function VisualCompare({
  screenshot,
  redesign,
  generatingRedesign,
  onGenerateRedesign,
  onRegenerateRedesign,
  review,
  redesignError,
  generatedCode,   // React-rendered code for code preview mode
}) {
  const [compareMode, setCompareMode] = useState('swipe');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [previewSource, setPreviewSource] = useState('ai_image'); // 'ai_image' | 'code_preview'
  const [genStep, setGenStep] = useState('vision');
  const [currentDesignStyle, setCurrentDesignStyle] = useState(
    redesign?.design_style || 'modern_saas'
  );

  // Advance progress steps while generating
  useEffect(() => {
    if (!generatingRedesign) { setGenStep('vision'); return; }
    const sequence = ['vision', 'prompt', 'generate', 'finalize'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) { setGenStep(sequence[i]); i++; }
      else { clearInterval(interval); }
    }, 5000);
    return () => clearInterval(interval);
  }, [generatingRedesign]);

  const handleGenerate = async () => {
    if (!screenshot?.url) return;
    await onGenerateRedesign(currentDesignStyle);
  };

  const handleRetry = async () => {
    if (generatingRedesign) return; // Guard: prevent double-click
    if (redesign?.id) { await onRegenerateRedesign(redesign.id, currentDesignStyle); }
    else { await onGenerateRedesign(currentDesignStyle); }
  };

  // Original image URL: prefer redesign's original_image_path, fallback to screenshot
  const originalUrl = redesign?.original_image_path || screenshot?.url;
  const redesignedUrl = redesign?.image_url;

  // Which right panel to show: AI image or React code preview
  const showCodePreview = previewSource === 'code_preview' && generatedCode?.generated_code;

  // Build preview HTML for the iframe
  const previewHtml = showCodePreview && generatedCode
    ? buildPreviewHtml(generatedCode.generated_code, generatedCode.supporting_code)
    : null;

  // ─── Completed state ─────────────────────────────────────────────────────────
  if (redesign?.status === 'completed' && redesignedUrl) {
    return (
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Style:</span>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {DESIGN_STYLES.map(ds => (
                <button key={ds.id} onClick={() => setCurrentDesignStyle(ds.id)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: currentDesignStyle === ds.id ? ACCENT : 'transparent',
                    color: currentDesignStyle === ds.id ? '#fff' : 'var(--text-muted)',
                  }}>
                  {ds.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Preview:</span>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setPreviewSource('ai_image')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: previewSource === 'ai_image' ? ACCENT : 'transparent',
                  color: previewSource === 'ai_image' ? '#fff' : 'var(--text-muted)',
                }}>
                <Sparkles size={11} /> Filtered
              </button>
              {generatedCode?.generated_code && (
                <button
                  onClick={() => setPreviewSource('code_preview')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: previewSource === 'code_preview' ? ACCENT : 'transparent',
                    color: previewSource === 'code_preview' ? '#fff' : 'var(--text-muted)',
                  }}>
                  <Code size={11} /> Code Preview
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {COMPARE_MODES.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setCompareMode(m.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                    style={{
                      background: compareMode === m.id ? `${ACCENT}16` : 'transparent',
                      color: compareMode === m.id ? ACCENT : 'var(--text-muted)',
                    }}>
                    <Icon size={12} /> {m.label}
                  </button>
                );
              })}
            </div>

            <DownloadMenu originalUrl={originalUrl} redesignedUrl={redesignedUrl} />

            <button onClick={() => setShowFullscreen(true)}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Maximize2 size={14} />
            </button>

            <button onClick={handleRetry}
              disabled={generatingRedesign}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <RefreshCw size={13} /> {generatingRedesign ? 'Generating…' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Screenshot Filter Banner — CLEAR DISCLAIMER */}
        <div className="mx-6 mt-2 px-4 py-3 rounded-xl text-[12px] flex items-start gap-3"
          style={{ background: '#2a1a00', border: '1px solid #f59e0b', color: '#fde68a' }}>
          <span style={{ color: '#f59e0b', fontSize: '16px', lineHeight: 1 }}>⚠️</span>
          <div>
            <b style={{ color: '#fbbf24' }}>Screenshot Filter (Pillow)</b> — This applies a basic image filter (contrast, brightness, sharpening) to your screenshot.
            <br />It is <b>not AI redesign</b>. For a true redesigned UI, use the <b>React Code</b> tab to generate actual React + Tailwind code.
          </div>
        </div>

        {/* Comparison */}
        <div>
          {showCodePreview && previewHtml ? (
            <CodePreviewCompare originalUrl={originalUrl} previewHtml={previewHtml} />
          ) : (
            <>
              {compareMode === 'swipe' && <SwipeCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
              {compareMode === 'side_by_side' && <SideBySideCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
              {compareMode === 'overlay' && <OverlayCompare originalUrl={originalUrl} redesignedUrl={redesignedUrl} />}
            </>
          )}
        </div>

        {/* AI Summary with Vision Analysis */}
        <AISummaryCard redesign={redesign} />

        {/* Fullscreen */}
        <AnimatePresence>
          {showFullscreen && (
            <FullscreenModal
              originalUrl={originalUrl}
              redesignedUrl={redesignedUrl}
              mode={compareMode}
              onClose={() => setShowFullscreen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Generating state ───────────────────────────────────────────────────────
  if (generatingRedesign) {
    return (
      <div className="max-w-md mx-auto">
        <LiveProgress step={genStep} />
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  const displayError = redesignError || (redesign?.status === 'failed' ? redesign : null);
  if (displayError) {
    return (
      <div className="max-w-lg mx-auto">
        <ErrorCard
          error={displayError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // ─── Initial / Empty state ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Generate card */}
      <div className="rounded-2xl p-6 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
          <Wand2 size={28} style={{ color: ACCENT, opacity: 0.7 }} />
        </div>

        <h3 className="text-[16px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          Apply Screenshot Filter
        </h3>
        <p className="text-[13px] max-w-sm mx-auto mb-1" style={{ color: 'var(--text-muted)' }}>
          Applies a brightness, contrast, and sharpness filter to your screenshot.
        </p>
        <p className="text-[12px] max-w-sm mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          This is a basic image filter, <b>not AI redesign</b>.
        </p>
        <p className="text-[12px] max-w-sm mx-auto mb-6" style={{ color: '#f59e0b' }}>
          For true AI redesign, use the <b>React Code</b> tab → generates real React + Tailwind code.
        </p>

        {/* Design style picker */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {DESIGN_STYLES.map(ds => (
            <button key={ds.id} onClick={() => setCurrentDesignStyle(ds.id)}
              className="px-3 py-2 rounded-xl text-[12px] font-medium border transition-all"
              style={{
                borderColor: currentDesignStyle === ds.id ? ACCENT : 'var(--border)',
                background: currentDesignStyle === ds.id ? `${ACCENT}15` : 'transparent',
                color: currentDesignStyle === ds.id ? ACCENT : 'var(--text-muted)',
              }}>
              {ds.label}
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!screenshot?.url}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-[14px] font-bold text-white mx-auto transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: screenshot?.url ? ACCENT : 'var(--surface2)',
            color: screenshot?.url ? '#fff' : 'var(--text-muted)',
            boxShadow: screenshot?.url ? `0 8px 32px ${ACCENT}35` : 'none',
          }}>
          <Wand2 size={15} /> Apply Filter
        </button>

        {!screenshot?.url && (
          <p className="text-[12px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Upload a screenshot first
          </p>
        )}
      </div>
    </div>
  );
}
