import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Send, Download, RefreshCw, Trash2,
  Maximize2, X, ChevronDown, AlertCircle, CheckCircle2,
  Wand2, Image as ImageIcon, Clock, Zap, ExternalLink,
  RotateCcw, Eye, Wifi, WifiOff, Info, ChevronRight,
  Monitor, Smartphone, Square, Columns, SlidersHorizontal,
  Star, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import inspectorApi from '../utils/inspectorApi';
import { ACCENT } from '../app/inspector/constants/theme';

// ─── Provider Logos / Colors ─────────────────────────────────────────────────
const PROVIDER_META = {
  pollinations:  { label: 'Pollinations AI', color: '#22c55e', icon: '🌿', description: 'Free text-to-image, no API key required' },
  huggingface:  { label: 'HuggingFace',   color: '#f97316', icon: '🤗', description: 'Free tier, img2img capable' },
};

// ─── Image Sizes ──────────────────────────────────────────────────────────────
const SIZES = [
  { id: '256x256',    label: '256×256',   icon: Square,       desc: 'Square (fast)' },
  { id: '512x512',    label: '512×512',   icon: Square,       desc: 'Square HD' },
  { id: '1024x1024',  label: '1024×1024', icon: Square,       desc: 'Square Ultra' },
  { id: '1792x1024',  label: '1792×1024', icon: Monitor,      desc: 'Landscape Wide' },
  { id: '1024x1792',  label: '1024×1792', icon: Smartphone,   desc: 'Portrait' },
];

const ASPECT_RATIOS = [
  { id: '1:1',   label: '1:1',   icon: Square,     desc: 'Square' },
  { id: '16:9',  label: '16:9',  icon: Monitor,     desc: 'Landscape' },
  { id: '9:16',  label: '9:16',  icon: Smartphone,  desc: 'Portrait' },
  { id: '4:3',   label: '4:3',   icon: Columns,     desc: 'Standard' },
  { id: '3:4',   label: '3:4',   icon: Columns,     desc: 'Portrait Std' },
];

const QUALITIES = [
  { id: 'standard', label: 'Standard', desc: 'Fast, good quality' },
  { id: 'hd',       label: 'HD',       desc: 'Maximum detail' },
];

const STYLES = [
  { id: 'vivid',   label: 'Vivid',   desc: 'Bold, colorful, dramatic' },
  { id: 'natural', label: 'Natural', desc: 'Realistic, photographic' },
];

const PROMPTS_EXAMPLES = [
  'A serene mountain lake at sunrise with mist rising from the water',
  'A futuristic cyberpunk city at night with neon lights reflecting in the rain',
  'An minimalist Scandinavian living room with natural wood and white walls',
  'A cute robot sitting on a park bench reading a book, soft lighting',
  'Close-up of a gourmet burger with melted cheese and crispy fries',
];

// ─── Generation Card ──────────────────────────────────────────────────────────
function GenerationCard({ gen, onDelete, onRegenerate, onDownload, onPreview }) {
  const [deleting, setDeleting] = useState(false);

  const isFailed   = gen.status === 'failed';
  const isGenerating = gen.status === 'generating' || gen.status === 'pending';
  const isCompleted = gen.status === 'completed';
  const provider = PROVIDER_META[gen.provider] || { label: gen.provider, color: ACCENT, icon: '⚡' };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(gen.id);
    setDeleting(false);
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden border group"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#080810]" style={{ minHeight: 240 }}>
        {isCompleted && gen.image_url ? (
          <>
            <img
              src={gen.image_url}
              alt={gen.prompt}
              className="w-full h-full object-contain cursor-pointer"
              onClick={onPreview}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 flex items-center justify-center gap-2">
              <button onClick={onPreview}
                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all">
                <Eye size={16} />
              </button>
              <button onClick={onDownload}
                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all">
                <Download size={16} />
              </button>
              <button onClick={onRegenerate}
                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all">
                <RotateCcw size={16} />
              </button>
            </div>
          </>
        ) : isFailed ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
            <p className="text-[13px] text-center" style={{ color: 'var(--text-muted)' }}>
              {gen.error_message || 'Generation failed'}
            </p>
            <button onClick={onRegenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white"
              style={{ background: ACCENT }}>
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 size={28} style={{ color: ACCENT }} className="animate-spin" />
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Generating...
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Provider + size + time */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[11px] font-semibold px-2 py-1 rounded-lg"
            style={{ background: `${provider.color}15`, color: provider.color }}>
            {provider.label}
          </span>
          {gen.size && (
            <span className="text-[11px] px-2 py-1 rounded-lg"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
              {gen.size}
            </span>
          )}
          {gen.quality && gen.quality !== 'standard' && (
            <span className="text-[11px] px-2 py-1 rounded-lg font-semibold"
              style={{ background: `${ACCENT}15`, color: ACCENT }}>
              {gen.quality.toUpperCase()}
            </span>
          )}
          {gen.generation_time_ms && (
            <span className="text-[11px] px-2 py-1 rounded-lg flex items-center gap-1"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
              <Clock size={10} /> {Math.round(gen.generation_time_ms / 1000)}s
            </span>
          )}
        </div>

        {/* Prompt */}
        <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {gen.prompt}
        </p>
      </div>

      {/* Actions */}
      {isCompleted && (
        <div className="flex items-center gap-1 px-4 pb-4">
          <button onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
            <Download size={11} /> Download
          </button>
          <button onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
            <RotateCcw size={11} /> Regenerate
          </button>
          <button onClick={handleDelete}
            disabled={deleting}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all hover:bg-red-500/10"
            style={{ color: deleting ? '#ef4444' : 'var(--text-muted)' }}>
            <Trash2 size={11} /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {isFailed && (
        <div className="flex items-center gap-1 px-4 pb-4">
          <button onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium text-white transition-all"
            style={{ background: ACCENT }}>
            <RotateCcw size={11} /> Try Again
          </button>
          <button onClick={handleDelete}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all hover:bg-red-500/10"
            style={{ color: '#ef4444' }}>
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Fullscreen Preview ──────────────────────────────────────────────────────
function FullscreenPreview({ image, prompt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
        <X size={20} />
      </button>

      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        src={image}
        alt={prompt}
        className="max-w-full max-h-full object-contain rounded-2xl"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      />

      {prompt && (
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/60 text-[12px] max-w-2xl mx-auto text-center">{prompt}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Provider Selector ────────────────────────────────────────────────────────
function ProviderSelector({ providers, selected, onChange }) {
  const [open, setOpen] = useState(false);

  const working = providers.filter(p => p.working);
  const bestProvider = providers.find(p => p.id === selected);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
        }}>
        {bestProvider ? (
          <>
            <span>{bestProvider.icon || '⚡'}</span>
            <span>{PROVIDER_META[bestProvider.id]?.label || bestProvider.id}</span>
          </>
        ) : (
          <><WifiOff size={12} /> Select Provider</>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 rounded-xl py-1 z-20 min-w-[240px] overflow-hidden"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {working.length > 0 ? working.map(p => {
              const meta = PROVIDER_META[p.id] || { label: p.id, color: ACCENT, icon: '⚡' };
              return (
                <button key={p.id}
                  onClick={() => { onChange(p.id); setOpen(false); }}
                  className="flex items-start gap-3 w-full px-3 py-3 text-left transition-colors"
                  style={{ background: selected === p.id ? `${meta.color}10` : 'transparent' }}
                  onMouseEnter={e => { if (selected !== p.id) e.currentTarget.style.background = 'var(--surface3)'; }}
                  onMouseLeave={e => { if (selected !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${meta.color}20` }}>
                    <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{meta.label}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{meta.description}</div>
                    {p.id === 'pollinations' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold mt-0.5 inline-block"
                        style={{ background: `${meta.color}15`, color: meta.color }}>RECOMMENDED</span>
                    )}
                  </div>
                  {selected === p.id && <CheckCircle2 size={14} style={{ color: meta.color, flexShrink: 0, marginTop: 2 }} />}
                </button>
              );
            }) : (
              <div className="px-3 py-4 text-center">
                <AlertCircle size={20} style={{ color: '#ef4444', margin: '0 auto 8px' }} />
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No providers configured</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ size, setSize, quality, setQuality, style, setStyle, provider, providers, setProvider }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
        <SlidersHorizontal size={12} /> Settings
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 top-full mt-2 rounded-2xl p-4 z-30 min-w-[320px]"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Size */}
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Image Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                {SIZES.map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.id} onClick={() => setSize(s.id)}
                      className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[11px] font-medium transition-all"
                      style={{
                        background: size === s.id ? `${ACCENT}15` : 'var(--surface)',
                        border: `1px solid ${size === s.id ? ACCENT : 'var(--border)'}`,
                        color: size === s.id ? ACCENT : 'var(--text-muted)',
                      }}>
                      <Icon size={14} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Quality</label>
              <div className="flex gap-1.5">
                {QUALITIES.map(q => (
                  <button key={q.id} onClick={() => setQuality(q.id)}
                    className="flex-1 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
                    style={{
                      background: quality === q.id ? `${ACCENT}15` : 'var(--surface)',
                      border: `1px solid ${quality === q.id ? ACCENT : 'var(--border)'}`,
                      color: quality === q.id ? ACCENT : 'var(--text-muted)',
                    }}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-4">
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Style</label>
              <div className="flex gap-1.5">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className="flex-1 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
                    style={{
                      background: style === s.id ? `${ACCENT}15` : 'var(--surface)',
                      border: `1px solid ${style === s.id ? ACCENT : 'var(--border)'}`,
                      color: style === s.id ? ACCENT : 'var(--text-muted)',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Provider</label>
              <ProviderSelector providers={providers} selected={provider} onChange={setProvider} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIImageGeneratorPage() {
  const { user } = useAuth();

  const [prompt, setPrompt]     = useState('');
  const [generating, setGenerating] = useState(false);
  const [generations, setGenerations] = useState([]);
  const [error, setError]       = useState('');
  const [size, setSize]         = useState('1024x1024');
  const [quality, setQuality]   = useState('standard');
  const [style, setStyle]       = useState('vivid');
  const [provider, setProvider]  = useState('auto');
  const [providers, setProviders]= useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [showExamples, setShowExamples] = useState(false);

  const inputRef = useRef(null);

  // Load providers on mount
  useEffect(() => {
    inspectorApi.getImageProviders()
      .then(data => {
        if (data.success) {
          setProviders(data.providers || []);
          if (data.best_provider && data.best_provider !== 'none') {
            setProvider(data.best_provider);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Load initial history
  useEffect(() => {
    inspectorApi.getImageHistory(1, 12)
      .then(data => {
        if (data.success) {
          setGenerations(data.generations || []);
          setHasMore(data.pagination?.current_page < data.pagination?.last_page);
          setHistoryPage(1);
        }
      })
      .catch(() => {});
  }, []);

  const loadMore = async () => {
    const nextPage = historyPage + 1;
    const data = await inspectorApi.getImageHistory(nextPage, 12);
    if (data.success) {
      setGenerations(prev => [...prev, ...(data.generations || [])]);
      setHasMore(nextPage < (data.pagination?.last_page || 1));
      setHistoryPage(nextPage);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;

    setError('');
    setGenerating(true);
    setShowExamples(false);

    try {
      const data = await inspectorApi.generateImage({
        prompt: prompt.trim(),
        provider: provider === 'auto' ? undefined : provider,
        size,
        quality,
        style,
      });

      if (data.success) {
        setGenerations(prev => [data.generation, ...prev]);
        setPrompt('');
        inputRef.current?.focus();
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message || 'Network error — please try again');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    await inspectorApi.deleteImage(id);
    setGenerations(prev => prev.filter(g => g.id !== id));
  };

  const handleRegenerate = async (gen) => {
    setError('');
    setGenerating(true);

    // Mark it as generating optimistically
    setGenerations(prev => prev.map(g =>
      g.id === gen.id ? { ...g, status: 'generating' } : g
    ));

    try {
      const data = await inspectorApi.regenerateImage(gen.id, {
        provider: provider === 'auto' ? undefined : provider,
        size,
        quality,
        style,
      });

      if (data.success) {
        setGenerations(prev => prev.map(g => g.id === gen.id ? data.generation : g));
      } else {
        setGenerations(prev => prev.map(g =>
          g.id === gen.id ? { ...g, status: 'failed', error_message: data.error } : g
        ));
        setError(data.error || 'Regeneration failed');
      }
    } catch (err) {
      setGenerations(prev => prev.map(g =>
        g.id === gen.id ? { ...g, status: 'failed', error_message: err.message } : g
      ));
      setError(err.message || 'Network error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (gen) => {
    if (!gen.image_url) return;
    try {
      const res = await fetch(gen.image_url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ai-image-${gen.id}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(gen.image_url, '_blank');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const workingProviders = providers.filter(p => p.working);
  const noProvider = workingProviders.length === 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
              <Sparkles size={20} style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-[20px] font-bold" style={{ color: 'var(--text)' }}>AI Image Generator</h1>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                Create images with free AI providers
              </p>
            </div>
          </div>
        </div>

        {/* No Provider Warning */}
        {noProvider && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#f59e0b)' }}>No image provider configured</p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Both Pollinations AI and HuggingFace Inference are completely free to use.
              </p>
            </div>
          </div>
        )}

        {/* Provider Status Bar */}
        {workingProviders.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Available:</span>
            {workingProviders.map(p => {
              const meta = PROVIDER_META[p.id] || { label: p.id, color: ACCENT, icon: '⚡' };
              return (
                <div key={p.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: `${meta.color}12`, color: meta.color }}>
                  {p.working ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {meta.label}
                </div>
              );
            })}
            {providers.filter(p => p.working).length === 0 && (
              <span className="text-[11px]" style={{ color: '#ef4444' }}>No working providers</span>
            )}
          </div>
        )}

        {/* Main Grid: Input + History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Input Panel */}
          <div className="lg:col-span-2 space-y-4">

            {/* Prompt Input */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 shrink-0"
                  style={{ background: `${ACCENT}15` }}>
                  <Wand2 size={15} style={{ color: ACCENT }} />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>Describe your image</h2>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    Be specific about subject, style, mood, lighting, composition
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative mb-4">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="A majestic mountain landscape at golden hour with a calm lake reflecting the peaks..."
                  rows={4}
                  className="w-full rounded-2xl px-4 py-3 text-[14px] resize-none outline-none transition-all"
                  style={{
                    background: 'var(--bg)',
                    border: `1px solid var(--border)`,
                    color: 'var(--text)',
                  }}
                  onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}20`; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />

                {/* Character count */}
                <div className="absolute bottom-3 right-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {prompt.length}/4000
                </div>
              </div>

              {/* Examples */}
              <div className="mb-4">
                <button onClick={() => setShowExamples(!showExamples)}
                  className="text-[11px] font-semibold mb-2 flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}>
                  <Sparkles size={11} /> Try an example
                  <ChevronRight size={11} className={`transition-transform ${showExamples ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1.5 pt-1">
                        {PROMPTS_EXAMPLES.map((ex, i) => (
                          <button key={i}
                            onClick={() => { setPrompt(ex); setShowExamples(false); inputRef.current?.focus(); }}
                            className="text-left px-3 py-2.5 rounded-xl text-[12px] transition-all"
                            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                            {ex}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <SettingsPanel
                  size={size} setSize={setSize}
                  quality={quality} setQuality={setQuality}
                  style={style} setStyle={setStyle}
                  provider={provider} providers={providers}
                  setProvider={setProvider}
                />
                <span className="text-[11px] ml-auto flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  ⌘↵ to generate
                </span>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: '#ef4444' }}>Generation Failed</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="ml-auto" style={{ color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating || noProvider}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{
                  background: (prompt.trim() && !generating && !noProvider) ? ACCENT : 'var(--surface2)',
                  color: (prompt.trim() && !generating && !noProvider) ? '#fff' : 'var(--text-muted)',
                  boxShadow: (prompt.trim() && !generating && !noProvider) ? `0 8px 32px ${ACCENT}35` : 'none',
                }}>
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate Image</>
                )}
              </button>
            </div>

            {/* Current Generation Result */}
            <AnimatePresence>
              {generating && generations[0]?.status === 'generating' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl overflow-hidden border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="aspect-square bg-[#080810] flex items-center justify-center" style={{ minHeight: 360 }}>
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 rounded-full border-2 border-dashed mx-auto mb-4"
                        style={{ borderColor: `${ACCENT}60`, borderTopColor: ACCENT }}
                      />
                      <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
                        AI is creating your image
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Using {PROVIDER_META[provider]?.label || provider}...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: History Panel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                History
              </h2>
              <span className="text-[11px] px-2 py-1 rounded-lg" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                {generations.length} images
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {generations.map(gen => (
                  <GenerationCard
                    key={gen.id}
                    gen={gen}
                    onDelete={handleDelete}
                    onRegenerate={handleRegenerate}
                    onDownload={handleDownload}
                    onPreview={() => gen.image_url && setPreviewImage(gen.image_url)}
                  />
                ))}
              </AnimatePresence>

              {generations.length === 0 && (
                <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}>
                  <ImageIcon size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 12px' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No images yet</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                    Your generated images will appear here
                  </p>
                </div>
              )}

              {hasMore && generations.length > 0 && (
                <button onClick={loadMore}
                  className="w-full py-3 rounded-xl text-[12px] font-semibold transition-all"
                  style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  Load more...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      <AnimatePresence>
        {previewImage && (
          <FullscreenPreview
            image={previewImage}
            prompt={generations.find(g => g.image_url === previewImage)?.prompt}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
