import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, RefreshCw, Wand2, Download, Maximize2,
  ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X,
  Eye, Layout, Code, SplitSquareHorizontal, SlidersHorizontal,
  Layers, Sun, Monitor, Tablet, Smartphone, CheckCircle2,
  AlertCircle, ExternalLink, AlertTriangle
} from 'lucide-react';
import { ACCENT } from '../constants/theme';
import inspectorApi from '../../../utils/inspectorApi';

// ─── Compare Modes ────────────────────────────────────────────────────────────
const COMPARE_MODES = [
  { id: 'side_by_side', label: 'Side by Side', icon: SplitSquareHorizontal },
  { id: 'swipe',        label: 'Swipe',        icon: SlidersHorizontal },
  { id: 'overlay',      label: 'Overlay',       icon: Layers },
];

const DESIGN_STRENGTHS = [
  { id: 'light',   label: 'Light',   desc: 'Minor refinements' },
  { id: 'medium',  label: 'Medium',  desc: 'Noticeable modern redesign', default: true },
  { id: 'strong',  label: 'Strong',  desc: 'Professional SaaS redesign' },
];

const VIEWPORTS = [
  { id: 'desktop',  label: 'Desktop',  icon: Monitor,  width: '1440px' },
  { id: 'tablet',   label: 'Tablet',   icon: Tablet,   width: '768px' },
  { id: 'mobile',   label: 'Mobile',   icon: Smartphone, width: '390px' },
];

// ─── Build iframe HTML from generated code ─────────────────────────────────────
function buildIframeContent(generatedCode, supportingCode, viewportWidth) {
  const mainCode = generatedCode || '';
  const supportCode = supportingCode || '';

  // Extract body content - handle both default export and inline
  let bodyContent = mainCode;
  if (mainCode.includes('export default')) {
    const match = mainCode.match(/export default\s+function\s+\w+\s*\(\s*\)\s*\{([\s\S]*?)\n\}/);
    if (match) {
      bodyContent = match[1];
    }
  }

  // Try to extract the JSX return content
  let jsxContent = mainCode;
  const returnMatch = mainCode.match(/return\s*\(([\s\S]*?)\);?\s*$/);
  if (returnMatch) {
    jsxContent = returnMatch[1];
  }

  // Build a self-contained HTML with Tailwind
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config={
      theme:{
        extend:{
          fontFamily:{sans:['Inter','system-ui','sans-serif']}
        }
      }
    }
  </script>
  <style>
    *{font-family:'Inter',system-ui,sans-serif;box-sizing:border-box;margin:0;padding:0}
    body{background:var(--surface2);color:#f4f4f5;min-height:100vh}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Supporting/util code
    ${supportCode}

    // Main component - simplified rendering
    function renderApp() {
      const root = document.getElementById('root');

      // Detect if we have a full component or just JSX fragments
      const code = \`${mainCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

      // Simple approach: if it looks like a React component, extract and render
      // Otherwise just inject as-is (for pre-built HTML outputs)
      try {
        // Check if code contains React.createElement or JSX
        if (code.includes('createElement') || code.includes('<div') || code.includes('<')) {
          // Use a simple regex-based JSX to createElement converter for basic structures
          const html = code
            .replace(/className=/g, 'class=')
            .replace(/style=\{\{/g, 'style=')
            .replace(/\}\}/g, '}')
            .replace(/\{'/g, "'")
            .replace(/'\|"[\}\$]/g, '')
            // Remove curly braces that are JS expressions
            .replace(/\{[^}]+\}/g, (m) => {
              if (m.match(/^\{\d+\}$/)) return m.slice(1,-1); // numbers
              if (m.match(/^\{'[^']*'\}$/)) return m.slice(2,-2); // strings
              return '';
            });

          // Find the main container div and inject
          const match = code.match(/return\s*\(?\s*<div[^>]*>([\\s\\S]*?)<\/div>\s*\)?;?$/);
          if (match) {
            root.innerHTML = '<div style="padding:16px">' + match[1]
              .replace(/className=/g, 'class=')
              .replace(/<br\s*\/?>/gi, '<br/>')
              .replace(/\\n/g, ' ')
              .replace(/<([\\w-]+)([^>]*)>/g, (m, tag, attrs) => {
                // Clean common patterns
                attrs = attrs.replace(/\\{[^}]+\\}/g, '');
                return '<' + tag + attrs + '>';
              })
              + '</div>';
          } else {
            // Fallback: try to render as-is using DOMParser
            const doc = new DOMParser().parseFromString(code, 'text/html');
            const body = doc.body;
            if (body.firstChild) {
              root.appendChild(body.firstChild);
            } else {
              root.innerHTML = '<div style="padding:20px;color:#aaa;text-align:center">Preview unavailable</div>';
            }
          }
        } else {
          root.innerHTML = '<div style="padding:20px;color:#888">No renderable content</div>';
        }
      } catch(e) {
        root.innerHTML = '<div style="padding:20px;color:#f87171">Render error: ' + e.message + '</div>';
      }
    }

    renderApp();
  </script>
</body>
</html>`;
}

// ─── Swipe Compare ────────────────────────────────────────────────────────────
function SwipeCompare({ originalUrl, iframeUrl, imageUrl, zoom }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(50);

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    setPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-col-resize select-none rounded-xl"
      style={{ height: '100%', minHeight: 400 }}
      onMouseMove={e => handleMove(e)}
      onTouchMove={e => handleMove(e)}
      onMouseLeave={() => {}}
    >
      {/* Original (full) */}
      <div className="absolute inset-0">
        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" draggable={false} />
      </div>
      {/* Redesigned (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div style={{ width: `${100 / (position / 100)}%`, height: '100%' }}>
          {iframeUrl ? (
            <iframe src={iframeUrl} title="Redesigned" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="Redesigned" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
      </div>
      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/30 backdrop-blur-sm cursor-col-resize"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
          <SlidersHorizontal size={14} className="text-gray-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Side by Side Compare ─────────────────────────────────────────────────────
function SideBySideCompare({ originalUrl, iframeUrl, imageUrl, activeViewport }) {
  const vp = VIEWPORTS.find(v => v.id === activeViewport) || VIEWPORTS[0];
  return (
    <div className="flex w-full h-full gap-2 overflow-auto">
      {/* Original */}
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider shrink-0"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          Original
        </div>
        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden" style={{ background: 'var(--surface2)' }}>
          <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" draggable={false} />
        </div>
      </div>
      {/* Redesigned */}
      <div className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider shrink-0"
          style={{ background: 'var(--surface2)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          AI Redesigned
        </div>
        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden" style={{ background: 'var(--surface2)' }}>
          {iframeUrl ? (
            <iframe
              src={iframeUrl}
              title="Redesigned"
              className="border-0"
              style={{ width: vp.width, maxWidth: '100%', height: '600px' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
            />
          ) : (
            // Fallback: show imageUrl directly as img tag
            imageUrl ? (
              <img
                src={imageUrl}
                alt="Redesigned"
                className="max-w-full max-h-full object-contain"
                style={{ width: vp.width, maxWidth: '100%' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
                  <Wand2 size={22} style={{ color: ACCENT, opacity: 0.7 }} />
                </div>
                {redesign?.id ? (
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Redesign #{redesign.id} ready — generate code to preview</p>
                ) : (
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Generate React Code to see redesign</p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Overlay Compare ───────────────────────────────────────────────────────────
function OverlayCompare({ originalUrl, iframeUrl, imageUrl }) {
  const [opacity, setOpacity] = useState(50);
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" style={{ background: 'var(--surface2)' }}>
      {/* Base: redesigned */}
      <div className="absolute inset-0">
        {iframeUrl ? (
          <iframe src={iframeUrl} title="Redesigned" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Redesigned" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      {/* Overlay: original */}
      <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: opacity / 100 }}>
        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" draggable={false} />
      </div>
      {/* Opacity slider */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-xl backdrop-blur-xl"
        style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Original</span>
        <input
          type="range" min={0} max={100} value={opacity}
          onChange={e => setOpacity(Number(e.target.value))}
          className="w-32 accent-purple-500"
        />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{opacity}%</span>
      </div>
    </div>
  );
}

// ─── Main Compare Component ───────────────────────────────────────────────────
export default function Compare({
  screenshot,
  redesign,
  generatedCode,      // { generated_code, supporting_code }
  generatingRedesign,
  onGenerateRedesign,
  onRegenerateRedesign,
  onGenerateCode,    // callback to generate React code
  generatingCode,
}) {
  const [compareMode, setCompareMode] = useState('side_by_side');
  const [activeViewport, setActiveViewport] = useState('desktop');
  const [designStrength, setDesignStrength] = useState('medium');
  const [iframeUrl, setIframeUrl] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('generated'); // 'generated' | 'original'
  const [showFullscreen, setShowFullscreen] = useState(false);
  const iframeContainerRef = useRef(null);
  const [providerAvailable, setProviderAvailable] = useState(null); // null = checking, true = available, false = not available

  // Check provider availability on mount
  useEffect(() => {
    inspectorApi.getProviderStatus()
      .then(res => {
        if (res.success && res.has_working_provider) {
          setProviderAvailable(true);
        } else {
          setProviderAvailable(false);
        }
      })
      .catch(() => setProviderAvailable(false));
  }, []);

  const screenshotUrl = screenshot?.url;
  const hasRedesign = !!redesign?.image_url;
  const hasCode = generatedCode?.generated_code;

  // Build iframe content when code changes
  useEffect(() => {
    if (!hasCode) { setIframeUrl(null); return; }
    const html = buildIframeContent(generatedCode.generated_code, generatedCode.supporting_code);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [hasCode, generatedCode]);

  // Build iframe for filtered image redesign
  const [filteredIframeUrl, setFilteredIframeUrl] = useState(null);
  useEffect(() => {
    if (!redesign?.image_url) { setFilteredIframeUrl(null); return; }
    const html = `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:var(--surface2)}img{max-width:100%;max-height:100vh}body{justify-content:flex-start;padding:0}</style></head><body><img src="${redesign.image_url}" style="width:100%;height:auto"/></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setFilteredIframeUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [redesign?.image_url]);

  // Effective preview URL - prefer generated code iframe over filtered image
  const previewUrl = iframeUrl || (redesign?.image_url ? filteredIframeUrl : null);

  const handleGenerateRedesignAction = () => {
    if (onGenerateRedesign) onGenerateRedesign();
  };

  const handleRegenerateRedesignAction = () => {
    if (onRegenerateRedesign && redesign?.id) onRegenerateRedesign(redesign.id, designStrength);
  };

  const handleGenerateCode = () => {
    if (onGenerateCode) onGenerateCode(designStrength);
  };

  // Empty state — no screenshot
  if (!screenshotUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
          <Layout size={28} style={{ color: ACCENT, opacity: 0.7 }} />
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>No Screenshot Yet</h3>
        <p className="text-[13px] max-w-sm" style={{ color: 'var(--text-muted)' }}>
          Upload a screenshot in the Create Project page to start comparing.
        </p>
      </div>
    );
  }

  // No redesign + no code — show generate prompt
  if (!hasRedesign && !hasCode && !generatingRedesign && !generatingCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
          <Wand2 size={28} style={{ color: ACCENT, opacity: 0.7 }} />
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>AI UI Redesign</h3>
        <p className="text-[13px] max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Generate a React-based redesigned UI from your screenshot. The result renders as a live interface — not a filtered image.
        </p>

        {/* Design strength selector */}
        <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
          {DESIGN_STRENGTHS.map(s => (
            <button
              key={s.id}
              onClick={() => setDesignStrength(s.id)}
              className="px-4 py-2 rounded-xl text-[12px] font-medium transition-all"
              style={{
                background: designStrength === s.id ? `${ACCENT}18` : 'var(--surface2)',
                color: designStrength === s.id ? ACCENT : 'var(--text-muted)',
                border: `1px solid ${designStrength === s.id ? `${ACCENT}50` : 'var(--border)'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* Provider unavailable — show disabled button with explanation */}
          {providerAvailable === false && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-2xl max-w-sm"
              style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-left" style={{ color: 'var(--text-muted)' }}>
                No AI provider is configured for code generation. The server needs one of:{' '}
                <span style={{ color: 'var(--text)' }}>OPENCLAW_GATEWAY_TOKEN</span>,{' '}
                <span style={{ color: 'var(--text)' }}>OPENAI_API_KEY</span>, or{' '}
                <span style={{ color: 'var(--text)' }}>GROQ_API_KEY</span> in the server .env file.
              </p>
            </div>
          )}

          <button
            onClick={hasRedesign ? handleRegenerateRedesignAction : handleGenerateRedesignAction}
            disabled={generatingRedesign || generatingCode || providerAvailable === false}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: providerAvailable === false ? 'var(--surface3)' : ACCENT,
              boxShadow: providerAvailable === false ? 'none' : `0 4px 16px ${ACCENT}35`,
            }}
          >
            {generatingRedesign ? (
              <><Loader2 size={14} className="animate-spin" /> Enhancing...</>
            ) : generatingCode ? (
              <><Loader2 size={14} className="animate-spin" /> Generating...</>
            ) : providerAvailable === false ? (
              <><AlertTriangle size={14} /> Provider Unavailable</>
            ) : hasRedesign ? (
              <><Wand2 size={14} /> Regenerate Redesign</>
            ) : (
              <><Wand2 size={14} /> Generate Redesign</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Loading state — show different messages for redesign vs code generation
  if (generatingRedesign || generatingCode) {
    const isRedesign = generatingRedesign;
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}>
          <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          {isRedesign ? 'Enhancing Design...' : 'Generating React Code...'}
        </h3>
        <p className="text-[13px] max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {isRedesign
            ? 'Applying visual improvements to your screenshot. This may take a few seconds.'
            : 'GPT-4o is analyzing your screenshot and generating React code. This may take up to 30 seconds.'}
        </p>
        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={12} className="animate-spin" /> {isRedesign ? 'Improving UI design...' : 'Building redesigned UI...'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 flex-wrap gap-2"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>

        {/* Left: mode selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {COMPARE_MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setCompareMode(m.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: compareMode === m.id ? `${ACCENT}16` : 'transparent',
                  color: compareMode === m.id ? ACCENT : 'var(--text-muted)',
                }}
                title={m.label}
              >
                <Icon size={12} /> <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center: viewport selector (only for side-by-side) */}
        {compareMode === 'side_by_side' && (
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {VIEWPORTS.map(vp => {
              const Icon = vp.icon;
              return (
                <button
                  key={vp.id}
                  onClick={() => setActiveViewport(vp.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: activeViewport === vp.id ? `${ACCENT}16` : 'transparent',
                    color: activeViewport === vp.id ? ACCENT : 'var(--text-muted)',
                  }}
                  title={vp.label}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
        )}

        {/* Right: regenerate */}
        <div className="flex items-center gap-2">
          {/* Preview tab toggle */}
          {!hasCode && hasRedesign && (
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setActivePreviewTab('generated')}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: activePreviewTab === 'generated' ? `${ACCENT}16` : 'transparent',
                  color: activePreviewTab === 'generated' ? ACCENT : 'var(--text-muted)',
                }}
              >
                Filtered
              </button>
              <button
                onClick={() => setActivePreviewTab('original')}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: activePreviewTab === 'original' ? `${ACCENT}16` : 'transparent',
                  color: activePreviewTab === 'original' ? ACCENT : 'var(--text-muted)',
                }}
              >
                Original
              </button>
            </div>
          )}

          <button
            onClick={handleGenerateCode}
            disabled={generatingCode || !screenshotUrl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            title="Regenerate"
          >
            <RefreshCw size={11} /> {generatingCode ? 'Generating...' : 'Regenerate'}
          </button>

          {previewUrl && (
            <button
              onClick={() => setShowFullscreen(true)}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              title="Fullscreen"
            >
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Compare Area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden p-3" style={{ background: 'var(--bg)' }}>
        {compareMode === 'swipe' && screenshotUrl && (
          <SwipeCompare originalUrl={screenshotUrl} iframeUrl={previewUrl} imageUrl={redesign?.image_url} />
        )}
        {compareMode === 'side_by_side' && screenshotUrl && (
          <SideBySideCompare originalUrl={screenshotUrl} iframeUrl={previewUrl} imageUrl={redesign?.image_url} activeViewport={activeViewport} />
        )}
        {compareMode === 'overlay' && screenshotUrl && (
          <OverlayCompare originalUrl={screenshotUrl} iframeUrl={previewUrl} imageUrl={redesign?.image_url} />
        )}
      </div>

      {/* ── Design Strength (small footer) ──────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-t shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Redesign strength:</span>
          {DESIGN_STRENGTHS.map(s => (
            <button
              key={s.id}
              onClick={() => setDesignStrength(s.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: designStrength === s.id ? `${ACCENT}14` : 'transparent',
                color: designStrength === s.id ? ACCENT : 'var(--text-muted)',
                border: `1px solid ${designStrength === s.id ? `${ACCENT}40` : 'transparent'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {hasCode ? (
            <><CheckCircle2 size={11} style={{ color: '#22c55e' }} /> React Code ready</>
          ) : hasRedesign ? (
            <><Wand2 size={11} /> Filtered preview</>
          ) : (
            <><AlertCircle size={11} /> No redesign yet</>
          )}
        </div>
      </div>

      {/* ── Fullscreen Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showFullscreen && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--surface2)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-[14px] font-bold text-white">Fullscreen Preview</h3>
              <button
                onClick={() => setShowFullscreen(false)}
                className="p-2 rounded-xl text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe src={previewUrl} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms allow-modals" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
