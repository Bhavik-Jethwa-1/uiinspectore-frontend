import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Wand2, RefreshCw, Download, X, CheckCircle2,
  AlertCircle, Loader2, Image as ImageIcon, SlidersHorizontal,
  SplitSquareHorizontal, Layers, Maximize2, ZoomIn, ZoomOut,
  Monitor, Tablet, Smartphone, Trash2, ExternalLink, Eye
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { ACCENT } from './constants/theme';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = [
  { id: 'natural',      label: 'Natural',      desc: 'Realistic photography' },
  { id: 'vivid',       label: 'Vivid',        desc: 'Vibrant colors' },
  { id: 'anime',       label: 'Anime',        desc: 'Japanese animation style' },
  { id: 'cinematic',   label: 'Cinematic',    desc: 'Film still, dramatic lighting' },
  { id: 'digital_art', label: 'Digital Art', desc: 'Concept art, illustration' },
  { id: '3d',          label: '3D Render',    desc: 'Cinema 4D, octane render' },
];

const SIZES = [
  { id: '1024x1024', label: 'Square (1:1)',    icon: '□' },
  { id: '768x1344',  label: 'Portrait (9:16)', icon: '▯' },
  { id: '1344x768',  label: 'Landscape (16:9)', icon: '▬' },
  { id: '1024x1792', label: 'Phone (9:19)',   icon: '▯' },
];

const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet },
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone },
];

const COMPARE_MODES = [
  { id: 'side_by_side', label: 'Side by Side', icon: SplitSquareHorizontal },
  { id: 'swipe',        label: 'Swipe',        icon: SlidersHorizontal },
  { id: 'overlay',      label: 'Overlay',       icon: Layers },
];

// ─── Swipe Compare ────────────────────────────────────────────────────────────
function SwipeCompare({ originalUrl, generatedUrl }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    setPos(Math.max(0, Math.min(100, (x / r.width) * 100)));
  }, []);
  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-xl cursor-col-resize select-none"
      style={{ height: 480 }}
      onMouseMove={onMove} onTouchMove={onMove}>
      <div className="absolute inset-0">
        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" draggable={false} />
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        {generatedUrl && (
          <img src={generatedUrl} alt="Generated" className="h-full object-contain" draggable={false}
            style={{ width: `${100 / (pos / 100)}%` }} />
        )}
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/60"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <SlidersHorizontal size={12} className="text-gray-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Side by Side ─────────────────────────────────────────────────────────────
function SideBySideCompare({ originalUrl, generatedUrl, viewport }) {
  const vp = VIEWPORTS.find(v => v.id === viewport) || VIEWPORTS[0];
  const widths = { desktop: '100%', tablet: '768px', mobile: '390px' };
  return (
    <div className="flex gap-3 h-full overflow-auto">
      {[{ label: 'Original', url: originalUrl }, { label: 'Generated', url: generatedUrl }].map(item => (
        <div key={item.label} className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider shrink-0"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            {item.label}
          </div>
          <div className="flex-1 flex items-center justify-center p-3 overflow-auto" style={{ background: 'var(--surface2)', minHeight: 380 }}>
            {item.url ? (
              <img src={item.url} alt={item.label} className="max-w-full object-contain" style={{ maxHeight: 420 }} draggable={false} />
            ) : (
              <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>—</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Overlay Compare ──────────────────────────────────────────────────────────
function OverlayCompare({ originalUrl, generatedUrl }) {
  const [opacity, setOpacity] = useState(50);
  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height: 480, background: 'var(--surface2)' }}>
      <div className="absolute inset-0">
        {generatedUrl && <img src={generatedUrl} alt="Generated" className="w-full h-full object-contain" draggable={false} />}
      </div>
      <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: opacity / 100 }}>
        {originalUrl && <img src={originalUrl} alt="Original" className="w-full h-full object-contain" draggable={false} />}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Original</span>
        <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))}
          className="w-32 accent-purple-500" />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{opacity}%</span>
      </div>
    </div>
  );
}

// ─── Main ImageGeneratorPage ──────────────────────────────────────────────────
export default function ImageGeneratorPage() {
  const [selectedImage, setSelectedImage] = useState(null);   // { path, url }
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('natural');
  const [size, setSize] = useState('1024x1024');
  const [provider, setProvider] = useState('auto');
  const [generations, setGenerations] = useState([]);
  const [activeGen, setActiveGen] = useState(null);          // currently displayed generation
  const [compareMode, setCompareMode] = useState('side_by_side');
  const [viewport, setViewport] = useState('desktop');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [providerStatus, setProviderStatus] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load provider status
  useEffect(() => {
    inspectorApi.getImageProviders().then(res => {
      if (res.success) setProviderStatus(res.providers || []);
    }).catch(() => {});
  }, []);

  // Load generation history
  useEffect(() => {
    inspectorApi.getImageGenerations().then(res => {
      if (res.success && res.generations?.length > 0) {
        setGenerations(res.generations);
        if (!activeGen) setActiveGen(res.generations[0]);
      }
    }).catch(() => {});
  }, []);

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }, []);

  const handlePaste = useCallback((e) => {
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (item) {
      const file = item.getAsFile();
      if (file) handleFile(file);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleFile = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB'); return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await inspectorApi.uploadImage(formData);
      if (res.success) {
        setSelectedImage({ path: res.imagePath, url: res.imageUrl });
      } else {
        setError(res.error || 'Upload failed');
      }
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const [genStatus, setGenStatus] = useState(null); // 'generating' | 'completed' | 'failed'

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return; }
    setError(null);
    setGenStatus('generating');
    setLoading(true);
    try {
      if (selectedImage) setGenStatus('Uploading...');
      const res = await inspectorApi.generateImage({
        prompt: prompt.trim(),
        style,
        size,
        provider: provider === 'auto' ? null : provider,
        originalImagePath: selectedImage?.path,
      });
      if (res.success && res.generation) {
        setGenStatus('Saving...');
        const gen = res.generation;
        setActiveGen(gen);
        setGenerations(prev => [gen, ...prev.filter(g => g.id !== gen.id)]);
        setGenStatus('Completed');
        setTimeout(() => setGenStatus(null), 2000);
      } else {
        setGenStatus(null);
        setError(res.error || 'Provider unavailable. Try again.');
      }
    } catch (e) {
      setGenStatus(null);
      setError(e.message || 'Provider unavailable. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url, label) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.download = label || 'generated.png'; a.click();
  };

  const handleDelete = async (id) => {
    await inspectorApi.deleteImageGeneration(id);
    setGenerations(prev => prev.filter(g => g.id !== id));
    if (activeGen?.id === id) setActiveGen(null);
  };

  const originalUrl = activeGen?.originalImageUrl;
  const generatedUrl = activeGen?.generatedImageUrl;
  const bestProvider = providerStatus.find(p => p.available);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-black" style={{ color: 'var(--text)' }}>AI Image Generator</h1>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Generate and edit images with AI — multiple providers supported</p>
          </div>
          {/* Provider badges */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {providerStatus.map(p => (
              <div key={p.id} title={p.warning || (p.available ? 'Available' : 'Unavailable')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-default"
                style={{
                  background: p.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: p.available ? '#22c55e' : '#ef4444',
                  border: `1px solid ${p.available ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.available ? '#22c55e' : '#ef4444' }} />
                {p.name}
                {p.warning && <span className="text-[10px]" style={{ color: '#eab308' }}>⚠</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* ── LEFT: Upload + Prompt + Generate ─────────────────────── */}
          <div className="space-y-4">

            {/* Upload Zone */}
            <div
              className="relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer overflow-hidden"
              style={{
                borderColor: isDragging ? ACCENT : 'var(--border)',
                background: isDragging ? `${ACCENT}08` : 'var(--surface)',
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onPaste={e => { e.preventDefault(); handlePaste(e); }}
            >
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
                className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {selectedImage ? (
                <div className="relative">
                  <img src={selectedImage.url} alt="Selected"
                    className="max-h-64 mx-auto rounded-xl object-contain" />
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                    <X size={14} />
                  </button>
                  <p className="text-[12px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    Click or drag to replace • Ctrl+V to paste
                  </p>
                </div>
              ) : uploading ? (
                <div className="py-4">
                  <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: ACCENT }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
                    <Upload size={24} style={{ color: ACCENT, opacity: 0.7 }} />
                  </div>
                  <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                    Drop your image here
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    PNG, JPG, WEBP • Drag & drop, click to browse, or <kbd className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--surface2)' }}>Ctrl+V</kbd> to paste
                  </p>
                  {bestProvider && (
                    <p className="text-[11px] mt-2" style={{ color: '#22c55e' }}>
                      ✓ {bestProvider.name} available
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Prompt */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate or edit... e.g. 'Modern SaaS dashboard with dark sidebar, clean cards, purple accent colors'"
                className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none transition-all"
                rows={4}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = `${ACCENT}60`}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Style + Size row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                      style={{
                        background: style === s.id ? `${ACCENT}18` : 'var(--surface2)',
                        color: style === s.id ? ACCENT : 'var(--text-muted)',
                        border: `1px solid ${style === s.id ? `${ACCENT}50` : 'var(--border)'}`,
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map(s => (
                    <button key={s.id} onClick={() => setSize(s.id)}
                      className="px-3 py-2 rounded-xl text-[12px] font-medium transition-all text-left"
                      style={{
                        background: size === s.id ? `${ACCENT}18` : 'var(--surface2)',
                        color: size === s.id ? ACCENT : 'var(--text-muted)',
                        border: `1px solid ${size === s.id ? `${ACCENT}50` : 'var(--border)'}`,
                      }}>
                      <div>{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Provider selector */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Provider {provider === 'auto' ? '(Auto — best available)' : ''}
              </label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setProvider('auto')}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                  style={{
                    background: provider === 'auto' ? `${ACCENT}18` : 'var(--surface2)',
                    color: provider === 'auto' ? ACCENT : 'var(--text-muted)',
                    border: `1px solid ${provider === 'auto' ? `${ACCENT}50` : 'var(--border)'}`,
                  }}>
                  Auto
                </button>
                {providerStatus.map(p => (
                  <button key={p.id} onClick={() => setProvider(p.id)}
                    disabled={!p.available}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-30"
                    style={{
                      background: provider === p.id ? `${ACCENT}18` : 'var(--surface2)',
                      color: provider === p.id ? ACCENT : 'var(--text-muted)',
                      border: `1px solid ${provider === p.id ? `${ACCENT}50` : 'var(--border)'}`,
                    }}>
                    {p.name} {!p.available && '🔒'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px]"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[14px] font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: ACCENT, boxShadow: `0 4px 20px ${ACCENT}40` }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {genStatus || 'Generating...'}</>
              ) : (
                <><Wand2 size={16} /> Generate Image</>
              )}
            </button>
          </div>

          {/* ── RIGHT: History + Output ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Generation output */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {/* Compare toolbar */}
              {activeGen && (
                <div className="flex items-center gap-1 p-2 flex-wrap"
                  style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {COMPARE_MODES.map(m => {
                    const Icon = m.icon;
                    return (
                      <button key={m.id} onClick={() => setCompareMode(m.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                        style={{
                          background: compareMode === m.id ? `${ACCENT}16` : 'transparent',
                          color: compareMode === m.id ? ACCENT : 'var(--text-muted)',
                        }}>
                        <Icon size={11} />
                      </button>
                    );
                  })}
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => setShowFullscreen(true)} className="p-1.5 rounded-lg transition-all"
                      style={{ color: 'var(--text-muted)' }}>
                      <Maximize2 size={12} />
                    </button>
                    {generatedUrl && (
                      <button onClick={() => handleDownload(generatedUrl, 'generated.png')}
                        className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }}>
                        <Download size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Provider Warning Banner */}
              {(activeGen?.warning || (activeGen?.provider === 'pollinations')) && (
                <div className="flex items-start gap-2 px-4 py-2.5 text-[11px]"
                  style={{ background: 'rgba(234,179,8,0.1)', borderBottom: '1px solid rgba(234,179,8,0.2)', color: '#eab308' }}>
                  <AlertCircle size={12} className="mt-0.5 shrink-0" />
                  <span>
                    {activeGen?.warning || 'This provider does not support true UI redesign. Results may vary — it generates a new image based on the prompt, not an edit of the original.'}
                  </span>
                </div>
              )}

              {/* Compare area */}
              <div style={{ minHeight: 400 }}>
                {activeGen ? (
                  compareMode === 'swipe' ? (
                    <SwipeCompare originalUrl={originalUrl} generatedUrl={generatedUrl} />
                  ) : compareMode === 'side_by_side' ? (
                    <SideBySideCompare originalUrl={originalUrl} generatedUrl={generatedUrl} viewport={viewport} />
                  ) : (
                    <OverlayCompare originalUrl={originalUrl} generatedUrl={generatedUrl} />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
                      <ImageIcon size={24} style={{ color: ACCENT, opacity: 0.7 }} />
                    </div>
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      Upload an image and enter a prompt to generate an improved version
                    </p>
                  </div>
                )}
              </div>

              {/* Generation meta */}
              {activeGen && (
                <div className="px-4 py-3 text-[11px] flex items-center gap-2 flex-wrap"
                  style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {activeGen.provider && (
                    <span className="px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}12`, color: ACCENT }}>
                      {activeGen.provider}
                    </span>
                  )}
                  {activeGen.model && <span>{activeGen.model}</span>}
                  {activeGen.generationTimeMs && (
                    <span>{Math.round(activeGen.generationTimeMs / 1000)}s</span>
                  )}
                  {activeGen.costUsd != null && activeGen.costUsd > 0 && (
                    <span>${activeGen.costUsd.toFixed(4)}</span>
                  )}
                  {activeGen.revisedPrompt && (
                    <span className="truncate flex-1" title={activeGen.revisedPrompt}>
                      Prompt: {activeGen.revisedPrompt}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* History */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="px-4 py-3 text-[12px] font-bold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                History ({generations.length})
              </div>
              {generations.length === 0 ? (
                <div className="py-8 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  No generations yet
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {generations.map(gen => (
                    <button
                      key={gen.id}
                      onClick={() => setActiveGen(gen)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                      style={{
                        background: activeGen?.id === gen.id ? `${ACCENT}10` : 'transparent',
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={e => { if (activeGen?.id !== gen.id) e.currentTarget.style.background = 'var(--surface2)'; }}
                      onMouseLeave={e => { if (activeGen?.id !== gen.id) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        style={{ background: 'var(--surface2)' }}>
                        {gen.generatedImageUrl && (
                          <img src={gen.generatedImageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] truncate" style={{ color: 'var(--text)' }}>
                          {gen.prompt || 'No prompt'}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {gen.provider} • {gen.status} • {gen.createdAt ? new Date(gen.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(gen.id); }}
                        className="p-1 shrink-0 rounded-lg transition-all"
                        style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={11} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {showFullscreen && generatedUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--surface2)' }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-[14px] font-bold text-white">Fullscreen Preview</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(generatedUrl, 'generated.png')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white/70 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Download size={12} /> Download
                </button>
                <button onClick={() => setShowFullscreen(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto p-8">
              <img src={generatedUrl} alt="Generated" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
