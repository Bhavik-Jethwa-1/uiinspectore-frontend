import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, Upload, Image as ImageIcon,
  LayoutGrid, Navigation, Box, Palette, FormInput, BarChart3,
  Check, Wand2, Eye, SplitSquareVertical, AlertCircle,
  UploadCloud, WandSparkles, RotateCcw, ZoomIn, ZoomOut,
  Maximize2, Download, ChevronLeft, ChevronRight, Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageGenerationService } from '../services/ImageService';
import api from '../utils/api';

const OPTIONS = [
  { id: 'layout',      label: 'Better Layout',      desc: 'Whitespace, hierarchy, rhythm.',      icon: LayoutGrid,   color: '#7c5cff', bg: 'rgba(124,92,255,0.12)' },
  { id: 'navigation',  label: 'Better Navigation',  desc: 'Paths, breadcrumbs, primary actions.', icon: Navigation,   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'components',  label: 'Better Components',  desc: 'Tokens, consistency, polish.',        icon: Box,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'colors',      label: 'Better Colors',       desc: 'Tokenized palette and contrast.',     icon: Palette,      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'forms',       label: 'Better Forms',        desc: 'Validation, states, autofill.',      icon: FormInput,    color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { id: 'dashboard',   label: 'Better Dashboard',   desc: 'KPIs, charts, nav structure.',        icon: BarChart3,    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
];

const SAMPLES = [
  { id: 's1', name: 'Login Screen', tags: ['auth', 'form'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23f4f4f8"/><rect x="100" y="30" width="200" height="165" rx="10" fill="white" stroke="%23e5e5ea" stroke-width="1.5"/><circle cx="200" cy="70" r="22" fill="%23ddd"/><rect x="130" y="105" width="140" height="10" rx="3" fill="%23d1d1d6"/><rect x="130" y="125" width="140" height="10" rx="3" fill="%23d1d1d6"/><rect x="130" y="155" width="140" height="28" rx="6" fill="%237c5cff"/></svg>',
  },
  { id: 's2', name: 'Dashboard', tags: ['admin', 'data'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23fafafa"/><rect x="0" y="0" width="80" height="225" fill="white" stroke="%23e5e5ea"/><rect x="95" y="20" width="120" height="70" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="225" y="20" width="120" height="70" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="95" y="105" width="250" height="100" rx="6" fill="white" stroke="%23e5e5ea"/></svg>',
  },
  { id: 's3', name: 'Mobile App', tags: ['mobile', 'consumer'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23fff7ed"/><rect x="130" y="10" width="140" height="205" rx="18" fill="white" stroke="%23fde68a" stroke-width="1.5"/><rect x="148" y="28" width="104" height="70" rx="6" fill="%23fef3c7"/><circle cx="200" cy="63" r="20" fill="%23f59e0b"/><rect x="152" y="108" width="96" height="8" rx="2" fill="%23d1d5db"/><rect x="152" y="122" width="80" height="8" rx="2" fill="%23d1d5db"/><rect x="152" y="165" width="96" height="30" rx="8" fill="%23f59e0b"/></svg>',
  },
  { id: 's4', name: 'E-commerce', tags: ['shop', 'product'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23f9f9ff"/><rect x="0" y="0" width="400" height="44" fill="white" stroke="%23e5e5ea"/><rect x="0" y="55" width="110" height="170" fill="white" stroke="%23e5e5ea"/><rect x="125" y="60" width="260" height="80" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="125" y="150" width="120" height="75" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="255" y="150" width="130" height="75" rx="6" fill="white" stroke="%23e5e5ea"/></svg>',
  },
  { id: 's5', name: 'Landing Page', tags: ['marketing', 'hero'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23f8f5ff"/><rect x="0" y="0" width="400" height="50" fill="white" stroke="%23e5e5ea"/><rect x="60" y="80" width="180" height="80" rx="8" fill="white" stroke="%23e5e5ea"/><rect x="260" y="70" width="120" height="100" rx="8" fill="%237c5cff" opacity="0.2"/><rect x="60" y="175" width="320" height="35" rx="8" fill="%237c5cff"/></svg>',
  },
  { id: 's6', name: 'Settings', tags: ['config', 'form'],
    thumb: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23f5f5f7"/><rect x="0" y="0" width="140" height="225" fill="white" stroke="%23e5e5ea"/><rect x="160" y="20" width="220" height="40" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="160" y="75" width="220" height="40" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="160" y="130" width="220" height="40" rx="6" fill="white" stroke="%23e5e5ea"/><rect x="160" y="185" width="100" height="30" rx="6" fill="%237c5cff"/></svg>',
  },
];

// ── MiniMax image-01 redesign prompts ──
function buildPrompt(type, sourceName) {
  const source = sourceName ? ` based on a ${sourceName.replace(/[_-]/g, ' ')} interface screenshot` : '';
  const prompts = {
    layout:     `Premium modern SaaS login page redesign${source}, split hero layout with left login card and right brand panel, clean whitespace, purple primary #7c5cff, white cards with subtle shadows, professional typography, high fidelity UI mockup, 4K render`,
    navigation: `Modern web app navigation redesign${source}, floating top navigation bar with logo and nav links, sidebar drawer, breadcrumb trail, active tab indicator in purple, clean white background, premium SaaS aesthetic, 4K UI mockup`,
    components: `Beautiful UI component library redesign${source}, consistent design system with buttons, inputs, cards, badges, toggles all using primary purple #7c5cff, modern SaaS aesthetic, pixel-perfect components on clean white background, 4K render`,
    colors:     `Modern design system color palette showcase${source}, UI showing primary purple #7c5cff secondary violet, accent pink #ec4899, semantic colors, card-based layout with buttons showing each color, professional presentation, 4K`,
    forms:      `Beautiful form redesign${source}, floating label inputs with green validation checkmarks, red error states, purple submit button, clean card layout, modern SaaS signup form with great UX, 4K UI mockup`,
    dashboard:  `Modern analytics dashboard redesign${source}, sidebar navigation, KPI cards showing $48,200 revenue + 2,841 users, area chart, data table, white cards on light gray background, professional purple #7c5cff accents, 4K UI mockup`,
  };
  return prompts[type] || prompts.layout;
}

async function generateAIPreview(type, sourceName) {
  const prompt = buildPrompt(type, sourceName);
  const seed = Math.floor(Math.random() * 99999);
  // Uses MiniMax image-01 via /api/ai/image
  const svc = new ImageGenerationService(user?.token);
  const result = await svc.generate(prompt, { size: '1024x1024', seed });
  if (!result.success || !result.images?.[0]) {
    throw new Error(result.error || 'Image generation failed');
  }
  return result.images[0];
}

function OriginalThumbSVG({ sample }) {
  return (
    <img src={sample.thumb} alt={sample.name}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
      draggable={false} />
  );
}

// ── 3-panel layout ──
export default function AIRedesignPage() {
  const { user } = useAuth();
  const [source, setSource] = useState(null);
  const [option, setOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [variants, setVariants] = useState([]);
  const [viewMode, setViewMode] = useState('ai'); // 'ai' | 'design'
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef(null);

  const selectedOpt = OPTIONS.find(o => o.id === option);
  const previewUrl = viewMode === 'ai' && aiImageUrl ? aiImageUrl
    : (result?.design ? null : null);

  const selectSample = (s) => {
    setSource(s);
    setResult(null);
    setAiImageUrl(null);
    setVariants([]);
    setError('');
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setSource({ id: 'u-' + Date.now(), name: f.name, url: reader.result, isCustom: true });
    reader.readAsDataURL(f);
  };

  const runRedesign = async () => {
    if (!source || !option) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAiImageUrl(null);
    setVariants([]);
    setSelectedVariant(0);
    setViewMode('ai');

    const stages = ['Analyzing screenshot…', 'Reading design patterns…', 'Generating design…', 'Rendering AI image…'];
    let i = 0;
    setStage(stages[0]);
    const ticker = setInterval(() => { i = Math.min(stages.length - 1, i + 1); setStage(stages[i]); }, 800);

    const finish = (designData) => {
      clearInterval(ticker);
      setStage('');
      setLoading(false);
      setResult({ design: designData });
    };

    const timeoutId = setTimeout(() => finish({}), 9000);

    try {
      let data = null;
      try {
        const payload = { type: option, image: source.name };
        if (source.isCustom && source.url) payload.image_data = source.url;
        data = await api.request('/ai/redesign', { method: 'POST', body: payload });
      } catch (_) {}

      clearTimeout(timeoutId);
      clearInterval(ticker);
      setStage('');

      const designData = (data && data.success && data.data) ? data.data : {};
      setResult({ design: designData });
    } catch (err) {
      clearTimeout(timeoutId);
      clearInterval(ticker);
      setStage('');
      setError(err.message || 'Redesign failed.');
    } finally {
      setLoading(false);
    }

    // Generate AI image variants
    setImgLoading(true);
    try {
      const urls = await Promise.all([
        generateAIPreview(option, source.name),
        generateAIPreview(option, source.name),
        generateAIPreview(option, source.name),
      ]);
      setVariants(urls);
      setAiImageUrl(urls[0]);
      setImgLoading(false);
    } catch (_) {
      setImgLoading(false);
    }
  };

  const regenerateVariant = async (idx) => {
    if (!option) return;
    setImgLoading(true);
    try {
      const url = await generateAIPreview(option, source?.name);
      const newVariants = [...variants];
      newVariants[idx] = url;
      setVariants(newVariants);
      if (selectedVariant === idx) setAiImageUrl(url);
    } catch (_) {}
    setImgLoading(false);
  };

  const downloadImage = () => {
    if (!aiImageUrl) return;
    const a = document.createElement('a');
    a.href = aiImageUrl;
    a.download = `redesign-${option}-${Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="redesign-page">
      <div className="redesign-layout">

        {/* ── LEFT PANEL ── */}
        <div className="redesign-left">

          {/* Source */}
          <div className="redesign-section">
            <div className="redesign-section-head">
              <div className="redesign-step-num">1</div>
              <div>
                <h3 className="redesign-section-title">Screenshot</h3>
                <p className="redesign-section-sub">Upload or pick sample</p>
              </div>
            </div>

            <label className="redesign-upload-zone">
              <input type="file" accept="image/*" hidden onChange={onFile} />
              <div className="redesign-upload-icon"><UploadCloud size={20} /></div>
              <span className="redesign-upload-primary">Drop image or click</span>
              <span className="redesign-upload-secondary">PNG, JPG, PDF</span>
            </label>

            <div className="redesign-sample-label">Sample screens</div>
            <div className="redesign-sample-grid">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  className={`redesign-sample-card ${source?.id === s.id ? 'active' : ''}`}
                  style={source?.id === s.id ? { '--ac': selectedOpt?.color || '#7c5cff' } : {}}
                  onClick={() => selectSample(s)}
                >
                  <div className="redesign-sample-thumb-wrap">
                    <img src={s.thumb} alt={s.name} className="redesign-sample-thumb" />
                    {source?.id === s.id && (
                      <div className="redesign-sample-check"><Check size={9} /></div>
                    )}
                  </div>
                  <span className="redesign-sample-name">{s.name}</span>
                  <div className="redesign-sample-tags">
                    {s.tags.map(t => <span key={t} className="redesign-tag">{t}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Redesign type */}
          <div className="redesign-section">
            <div className="redesign-section-head">
              <div className="redesign-step-num">2</div>
              <div>
                <h3 className="redesign-section-title">Redesign type</h3>
                <p className="redesign-section-sub">{option ? '1 selected' : 'Choose one focus'}</p>
              </div>
            </div>

            <div className="redesign-opt-grid">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    className={`redesign-opt-btn ${option === opt.id ? 'active' : ''}`}
                    style={{ '--oc': opt.color, '--ocb': opt.bg }}
                    onClick={() => setOption(opt.id)}
                  >
                    <div className="redesign-opt-icon"><Icon size={13} /></div>
                    <div className="redesign-opt-info">
                      <span className="redesign-opt-label">{opt.label}</span>
                      <span className="redesign-opt-desc">{opt.desc}</span>
                    </div>
                    {option === opt.id && <div className="redesign-opt-check"><Check size={9} /></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run */}
          <div className="redesign-section redesign-section-run">
            <button
              className="redesign-run-btn"
              onClick={runRedesign}
              disabled={!source || !option || loading}
            >
              {loading ? (
                <><Loader2 size={15} className="spin" /><span>{stage || 'Generating…'}</span></>
              ) : (
                <><WandSparkles size={15} /><span>Generate Redesign</span><Sparkles size={11} /></>
              )}
            </button>
            {error && (
              <div className="redesign-error">
                <AlertCircle size={11} /><span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Preview ── */}
        <div className="redesign-center">
          <div className="redesign-preview-topbar">
            <div className="redesign-preview-title">
              <SplitSquareVertical size={13} style={{ color: '#7c5cff' }} />
              <span>AI Redesign</span>
            </div>
            {variants.length > 0 && (
              <div className="redesign-center-badges">
                <span className="redesign-type-badge"
                  style={{ color: selectedOpt?.color, background: selectedOpt?.bg }}>
                  {selectedOpt?.label}
                </span>
                <span className="redesign-provider-badge">
                  <Sparkles size={9} /> MiniMax image-01
                </span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          {variants.length > 0 && (
            <div className="redesign-toolbar">
              <div className="redesign-view-tabs">
                <button
                  className={`redesign-tab ${viewMode === 'ai' ? 'active' : ''}`}
                  onClick={() => setViewMode('ai')}
                >
                  <Sparkles size={11} /> AI Preview
                </button>
                <button
                  className={`redesign-tab ${viewMode === 'design' ? 'active' : ''}`}
                  onClick={() => setViewMode('design')}
                >
                  <Code2 size={11} /> Design Code
                </button>
              </div>
              <div className="redesign-zoom-controls">
                <button className="redesign-icon-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                  <ZoomOut size={13} />
                </button>
                <span className="redesign-zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="redesign-icon-btn" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                  <ZoomIn size={13} />
                </button>
                <button className="redesign-icon-btn" onClick={() => setZoom(1)}>
                  <Maximize2 size={13} />
                </button>
                <button className="redesign-icon-btn" onClick={downloadImage} title="Download">
                  <Download size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="redesign-canvas">
            <AnimatePresence mode="wait">
              {!source && !loading && (
                <motion.div key="empty" className="redesign-canvas-empty"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="redesign-canvas-empty-icon">
                    <ImageIcon size={40} strokeWidth={1.2} />
                  </div>
                  <h3>Select a screenshot</h3>
                  <p>Upload or pick a sample, choose a redesign type, then generate.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div key="loading" className="redesign-canvas-loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="redesign-loading-orb" />
                  <Loader2 size={28} className="spin" style={{ color: selectedOpt?.color || '#7c5cff' }} />
                  <p className="redesign-loading-stage">{stage}</p>
                  <div className="redesign-loading-bar">
                    <div className="redesign-loading-bar-fill"
                      style={{ background: selectedOpt?.color || '#7c5cff' }} />
                  </div>
                </motion.div>
              )}

              {!loading && variants.length === 0 && source && option && (
                <motion.div key="ready" className="redesign-canvas-ready"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="redesign-ready-icon">
                    <WandSparkles size={36} />
                  </div>
                  <h3>Ready to redesign</h3>
                  <p>Click <strong>Generate Redesign</strong> to see the AI-powered redesign.</p>
                </motion.div>
              )}

              {!loading && viewMode === 'ai' && aiImageUrl && (
                <motion.div key="ai-preview" className="redesign-ai-preview"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                  <img
                    ref={imgRef}
                    src={aiImageUrl}
                    alt="AI Generated Redesign"
                    className="redesign-main-img"
                    onLoad={() => setImgLoading(false)}
                    onError={() => setImgLoading(false)}
                  />
                  {imgLoading && (
                    <div className="redesign-img-loading-overlay">
                      <Loader2 size={24} className="spin" style={{ color: '#7c5cff' }} />
                    </div>
                  )}
                </motion.div>
              )}

              {!loading && viewMode === 'design' && result?.design && (
                <motion.div key="design-view" className="redesign-design-view"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="redesign-design-header">
                    <Code2 size={14} style={{ color: '#7c5cff' }} />
                    <span>Generated Design Elements</span>
                    <span className="redesign-element-count">
                      {result.design.elements?.length || 0} components
                    </span>
                  </div>
                  <div className="redesign-element-list">
                    {(result.design.elements || []).slice(0, 20).map((el) => (
                      <div key={el.id} className="redesign-element-item">
                        <div className="redesign-element-type"
                          style={{ background: selectedOpt?.bg, color: selectedOpt?.color }}>
                          {el.type}
                        </div>
                        <div className="redesign-element-info">
                          <span className="redesign-element-text">{el.text || '(no text)'}</span>
                          <span className="redesign-element-meta">
                            {el.width}×{el.height}px · pos({el.x}, {el.y})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: Variants ── */}
        <div className="redesign-right">
          <div className="redesign-right-head">
            <div className="redesign-right-title">
              <Sparkles size={13} style={{ color: '#7c5cff' }} />
              <span>Variants</span>
              {variants.length > 0 && (
                <span className="redesign-var-count">{variants.length}</span>
              )}
            </div>
          </div>

          <div className="redesign-variant-list">
            {variants.length === 0 && !loading && (
              <div className="redesign-var-empty">
                <Wand2 size={28} strokeWidth={1.3} />
                <p>Generated variants will appear here</p>
              </div>
            )}

            {variants.map((url, i) => (
              <div key={i} className="redesign-var-item-wrap">
                <button
                  className={`redesign-var-item ${selectedVariant === i ? 'active' : ''}`}
                  style={selectedVariant === i ? { borderColor: selectedOpt?.color || '#7c5cff' } : {}}
                  onClick={() => { setSelectedVariant(i); setAiImageUrl(url); }}
                >
                  <img src={url} alt={`Variant ${i + 1}`} className="redesign-var-thumb" />
                  {selectedVariant === i && (
                    <div className="redesign-var-active-badge">
                      <Check size={9} />
                    </div>
                  )}
                </button>
                <div className="redesign-var-actions">
                  <button
                    className="redesign-var-action"
                    onClick={() => regenerateVariant(i)}
                    title="Regenerate this variant"
                  >
                    <RotateCcw size={11} />
                  </button>
                  <button
                    className="redesign-var-action"
                    onClick={() => { const a = document.createElement('a'); a.href = url; a.download = `redesign-${option}-v${i+1}.png`; a.target = '_blank'; a.click(); }}
                    title="Download"
                  >
                    <Download size={11} />
                  </button>
                </div>
                <span className="redesign-var-label">Variant {i + 1}</span>
              </div>
            ))}
          </div>

          {/* Original */}
          {source && (
            <div className="redesign-original-panel">
              <div className="redesign-original-head">
                <Eye size={11} />
                <span>Original</span>
              </div>
              <div className="redesign-original-preview">
                {source.isCustom ? (
                  <img src={source.url} alt="Original" className="redesign-original-img" />
                ) : (
                  <OriginalThumbSVG sample={source} />
                )}
              </div>
              <div className="redesign-original-name">{source.name}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
