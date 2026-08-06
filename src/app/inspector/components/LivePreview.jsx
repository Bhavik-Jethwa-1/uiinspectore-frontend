import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Tablet, Smartphone, Maximize2, RotateCcw,
  Loader2, AlertCircle, ExternalLink, ZoomIn, ZoomOut,
  Eye, Code, Wand2, RefreshCw, X, CheckCircle2
} from 'lucide-react';
import { ACCENT } from '../constants/theme';

const VIEWPORTS = [
  { id: 'desktop',  label: 'Desktop',  icon: Monitor,    width: '100%',  height: '100%' },
  { id: 'tablet',   label: 'Tablet',  icon: Tablet,     width: '768px', height: '1024px' },
  { id: 'mobile',   label: 'Mobile',  icon: Smartphone, width: '390px', height: '844px' },
];

// ─── HTML Builder ─────────────────────────────────────────────────────────────
function buildPreviewHtml(reactCode, supportingCode) {
  const combinedCode = supportingCode
    ? `${supportingCode}\n\n${reactCode}`
    : reactCode;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UI Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          },
        },
      },
    }
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    ${combinedCode}
  </script>
</body>
</html>`;
}

// ─── Preview iframe ───────────────────────────────────────────────────────────
function PreviewFrame({ html, viewport, onLoad, onError }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!html || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Write the HTML into the iframe
    doc.open();
    doc.write(html);
    doc.close();

    // Notify when loaded
    iframe.onload = () => onLoad?.();

  }, [html]);

  const scale = viewport.id === 'desktop' ? 1 : (viewport.id === 'tablet' ? 0.75 : 0.5);
  const isScaled = viewport.id !== 'desktop';

  return (
    <div
      className="relative overflow-auto bg-gray-100 flex items-start justify-center"
      style={{ minHeight: 600 }}
    >
      <div
        className="transition-all duration-300 origin-top"
        style={{
          width: isScaled ? viewport.width : '100%',
          transform: isScaled ? `scale(${scale})` : 'none',
          minHeight: isScaled ? parseInt(viewport.height) * (1/scale) : '100%',
        }}
      >
        <iframe
          ref={iframeRef}
          className="w-full border-0"
          style={{
            height: isScaled ? viewport.height : '100%',
            minHeight: 600,
            display: 'block',
          }}
          sandbox="allow-scripts"
          title="Live Preview"
          onError={onError}
        />
      </div>
    </div>
  );
}

// ─── Loading Overlay ─────────────────────────────────────────────────────────
function PreviewSkeleton({ viewport }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 500 }}>
      <div className="relative mb-6">
        <div className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: `${ACCENT}40` }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2 border-dashed"
            style={{ borderColor: `${ACCENT}60`, borderTopColor: ACCENT }}
          />
        </div>
      </div>
      <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        Rendering Live Preview...
      </p>
      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
        Transpiling React + Tailwind in sandbox
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LivePreview({ code, onLoading, redesign, onGenerate, generating }) {
  const [viewport, setViewport]     = useState(VIEWPORTS[0]);
  const [loading, setLoading]       = useState(false);
  const [loaded, setLoaded]         = useState(false);
  const [error, setError]           = useState(null);
  const [html, setHtml]             = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [zoom, setZoom]             = useState(100);

  const buildHtml = useCallback(() => {
    if (!code?.generated_code) return null;
    return buildPreviewHtml(code.generated_code, code.supporting_code);
  }, [code]);

  useEffect(() => {
    if (!code?.generated_code) return;
    setLoading(true);
    setLoaded(false);
    setError(null);

    const newHtml = buildHtml();
    setHtml(newHtml);

    // Small delay to show loading state
    const timer = setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, buildHtml]);

  const handleRefresh = () => {
    setLoading(true);
    setLoaded(false);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setLoaded(true);
    }, 1000);
  };

  // Empty state
  if (!code && !loading && !onLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
          <Eye size={28} style={{ color: ACCENT, opacity: 0.7 }} />
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          Live Preview
        </h3>
        <p className="text-[13px] max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Generate React code to see your redesigned UI rendered live here — with responsive Desktop / Tablet / Mobile preview.
        </p>
        {redesign && onGenerate && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: ACCENT }}
          >
            {generating ? (
              <><Loader2 size={14} className="animate-spin" /> Generating...</>
            ) : (
              <><Wand2 size={14} /> Generate React Code</>
            )}
          </button>
        )}
        {!redesign && (
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Generate a redesign first from the Screenshot Preview tab.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

        {/* Viewport switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--surface2)' }}>
          {VIEWPORTS.map(vp => {
            const Icon = vp.icon;
            return (
              <button
                key={vp.id}
                onClick={() => setViewport(vp)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: viewport.id === vp.id ? 'var(--surface)' : 'transparent',
                  color: viewport.id === vp.id ? ACCENT : 'var(--text-muted)',
                  boxShadow: viewport.id === vp.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                <Icon size={13} />
                <span className="hidden sm:inline">{vp.label}</span>
                {viewport.id === vp.id && (
                  <span className="text-[10px] opacity-60">{vp.width}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ background: 'var(--surface2)' }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="p-1 rounded hover:bg-[var(--surface3)] transition-all">
              <ZoomOut size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
            <span className="text-[11px] w-10 text-center font-medium"
              style={{ color: 'var(--text-muted)' }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="p-1 rounded hover:bg-[var(--surface3)] transition-all">
              <ZoomIn size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Overlay toggle */}
          <button
            onClick={() => setShowOverlay(o => !o)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all"
            style={{
              background: showOverlay ? `${ACCENT}15` : 'var(--surface2)',
              color: showOverlay ? ACCENT : 'var(--text-muted)',
            }}>
            <CheckCircle2 size={12} />
            Grid
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; }}>
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Viewport size indicator */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text-muted)' }}>
        <span>{viewport.label} · {viewport.width}</span>
        {loaded && (
          <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
            <CheckCircle2 size={10} /> Rendered
          </span>
        )}
      </div>

      {/* Preview area */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          minHeight: 'min(600px, 60vh)',
        }}
      >
        {/* Grid overlay */}
        {showOverlay && (
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(124,92,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124,92,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
        )}

        {loading ? (
          <PreviewSkeleton viewport={viewport} />
        ) : html ? (
          <PreviewFrame
            html={html}
            viewport={viewport}
            onLoad={() => { setLoaded(true); setLoading(false); }}
            onError={() => { setError('Preview failed to render'); setLoading(false); }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <p className="text-[13px] ml-2" style={{ color: 'var(--text-muted)' }}>
              No code to preview
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t text-[11px] shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)', color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <Code size={10} />
          React {code?.generated_code ? `· ${code.generated_code.length.toLocaleString()} chars` : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Wand2 size={10} />
          Tailwind CSS · Rendered in sandbox
        </span>
      </div>
    </div>
  );
}
