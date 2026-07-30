import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, Monitor, Smartphone, Tablet, Loader2, ArrowRight,
  RefreshCw, Check, X, ChevronRight, Layout, MessageSquare, Send,
  Bot, User, Star, Clock, Trash2, Download, Eye, ZoomIn, Code2,
  Sun, Moon, Palette, Type, LayoutGrid, Accessibility, Zap,
  Wand, Image, GitBranch, Maximize, Copy, CheckCheck, Heart,
  BarChart3, Lightbulb, Layers, Info, AlertCircle, WandIcon,
} from 'lucide-react';
import {
  analyzeRequirements, optimizePrompt, generateDesigns, analyzeDesign,
  redesign, generateCode, loadHistory, saveDesign, deleteDesign, toggleFavorite, regenerateDesign,
  APP_TYPES, DESIGN_STYLES, INDUSTRIES, COMPLEXITY_LEVELS, IMAGE_SIZES, CODE_FRAMEWORKS,
} from '../utils/autoDesignerApi';

const STEPS = [
  { id: 'configure', label: 'Configure',   icon: Layout },
  { id: 'optimize',  label: 'Optimize',   icon: WandIcon },
  { id: 'generate',  label: 'Generate',   icon: Sparkles },
  { id: 'results',   label: 'Results',    icon: Image },
];

const ACCENT = '#7c5cff';
const ACCENT_PINK = '#ff6b9d';
const ACCENT_CYAN = '#00d4ff';
const SUCCESS = '#10b981';
const DANGER = '#f87171';
const WARN = '#fbbf24';

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PremiumAutoDesignerPage() {
  const [activeTab, setActiveTab] = useState('new'); // new | history | favorites
  const [step, setStep] = useState('configure');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar — History & Favorites */}
      {sidebarOpen && (
        <HistorySidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenResults={setStep}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'rgba(124,92,255,0.04)' }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}>
              <LayoutGrid size={16} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.15)' }}>
              <Sparkles size={14} style={{ color: ACCENT }} />
            </div>
            <span className="text-[13px] font-bold" style={{ color: ACCENT }}>AI Auto Designer</span>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <TabBtn active={activeTab === 'new'} onClick={() => setActiveTab('new')} icon={Wand2} label="New Design" />
            <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={Clock} label="History" />
            <TabBtn active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} icon={Heart} label="Favorites" />
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'new' ? (
              <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WizardController step={step} setStep={setStep} />
              </motion.div>
            ) : (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HistoryGrid activeTab={activeTab} onOpenResults={setStep} setActiveTab={setActiveTab} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
      style={active
        ? { background: 'rgba(124,92,255,0.15)', color: ACCENT }
        : { color: 'var(--text-muted)' }
      }
    >
      <Icon size={12} /> {label}
    </button>
  );
}

// ─── Step Progress Bar ──────────────────────────────────────────────────────

function StepProgress({ step, setStep }) {
  const currentIdx = STEPS.findIndex(s => s.id === step);

  return (
    <div className="flex items-center justify-start lg:justify-center gap-0 px-4 lg:px-6 py-5 border-b shrink-0 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
      {STEPS.map((s, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => isDone && setStep(s.id)}
              disabled={!isDone && !isActive}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer disabled:cursor-default"
              style={
                isActive ? { background: 'rgba(124,92,255,0.15)', color: ACCENT } :
                isDone  ? { background: 'rgba(16,185,129,0.1)', color: SUCCESS } :
                         { color: 'var(--text-muted)' }
              }
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${isDone ? '' : ''}`}
                style={isActive ? { background: ACCENT, color: '#fff' } :
                       isDone  ? { background: SUCCESS, color: '#fff' } :
                                 { background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                {isDone ? <Check size={10} /> : <Icon size={10} />}
              </div>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className="w-6 lg:w-12 h-px mx-1 shrink-0" style={{ background: i < currentIdx ? SUCCESS : 'var(--border)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Wizard Controller ───────────────────────────────────────────────────────

function WizardController({ step, setStep }) {
  return (
    <div className="flex flex-col h-full">
      <StepProgress step={step} setStep={setStep} />
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'configure' && <ConfigureStep onNext={() => setStep('optimize')} key="configure" />}
          {step === 'optimize'  && <OptimizeStep  onBack={() => setStep('configure')} onGenerate={() => setStep('generate')} key="optimize" />}
          {step === 'generate' && <GenerateStep onResults={() => setStep('results')} key="generate" />}
          {step === 'results'  && <ResultsStep  onBack={() => setStep('generate')} onNew={() => setStep('configure')} key="results" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Configure Step ─────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  projectName: '',
  description: '',
  appType: 'Dashboard',
  targetUsers: '',
  industry: 'Technology',
  brandPersonality: '',
  primaryColor: '#7c5cff',
  secondaryColor: '#ff6b9d',
  theme: 'dark',
  designStyle: 'Modern SaaS',
  responsive: ['desktop'],
  complexity: 'professional',
  screens: 1,
};

function ConfigureStep({ onNext }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [errors, setErrors] = useState({});

  const update = (key, val) => setConfig(c => ({ ...c, [key]: val }));

  const toggleResponsive = (device) => {
    setConfig(c => ({
      ...c,
      responsive: c.responsive.includes(device)
        ? c.responsive.filter(d => d !== device)
        : [...c.responsive, device],
    }));
  };

  const validate = () => {
    const e = {};
    if (!config.description.trim()) e.description = 'Please describe your project';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Save to session for next step
      sessionStorage.setItem('ad_config', JSON.stringify(config));
      onNext();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Page title */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold mb-1">Design Configuration</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Tell us about your project — the more detail, the better the designs.
        </p>
      </div>

      {/* Grid: left = main config, right = quick picks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Project Name */}
          <FormField label="Project Name" hint="Optional">
            <input
              value={config.projectName}
              onChange={e => update('projectName', e.target.value)}
              placeholder="e.g. ServerAvatar Dashboard"
              className="ad-input"
            />
          </FormField>

          {/* Description */}
          <FormField label="Project Description" hint="Be specific" required error={errors.description}>
            <textarea
              value={config.description}
              onChange={e => update('description', e.target.value)}
              placeholder="e.g. A premium dark SaaS hosting management dashboard with server monitoring, SSL management, domain management, analytics widgets, team collaboration, and billing integration."
              rows={4}
              className="ad-input resize-none"
            />
          </FormField>

          {/* App Type + Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Application Type">
              <select value={config.appType} onChange={e => update('appType', e.target.value)} className="ad-input">
                {APP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Industry">
              <select value={config.industry} onChange={e => update('industry', e.target.value)} className="ad-input">
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </FormField>
          </div>

          {/* Target Users + Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Target Users" hint="Optional">
              <input
                value={config.targetUsers}
                onChange={e => update('targetUsers', e.target.value)}
                placeholder="e.g. DevOps teams, SaaS founders"
                className="ad-input"
              />
            </FormField>
            <FormField label="Complexity">
              <select value={config.complexity} onChange={e => update('complexity', e.target.value)} className="ad-input">
                {COMPLEXITY_LEVELS.map(c => (
                  <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Brand Personality */}
          <FormField label="Brand Personality" hint="Optional">
            <input
              value={config.brandPersonality}
              onChange={e => update('brandPersonality', e.target.value)}
              placeholder="e.g. Bold, playful, trustworthy, minimal"
              className="ad-input"
            />
          </FormField>

          {/* Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={e => update('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  style={{ background: 'transparent' }}
                />
                <input
                  value={config.primaryColor}
                  onChange={e => update('primaryColor', e.target.value)}
                  className="ad-input flex-1"
                  placeholder="#7c5cff"
                />
              </div>
            </FormField>
            <FormField label="Secondary Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={e => update('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  style={{ background: 'transparent' }}
                />
                <input
                  value={config.secondaryColor}
                  onChange={e => update('secondaryColor', e.target.value)}
                  className="ad-input flex-1"
                  placeholder="#ff6b9d"
                />
              </div>
            </FormField>
          </div>

          {/* Theme */}
          <FormField label="Theme">
            <div className="flex gap-2">
              {['dark', 'light', 'auto'].map(t => (
                <button
                  key={t}
                  onClick={() => update('theme', t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer border transition-all"
                  style={config.theme === t
                    ? { background: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.4)', color: ACCENT }
                    : { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {t === 'dark' ? <Moon size={13} /> : t === 'light' ? <Sun size={13} /> : <Palette size={13} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </FormField>

          {/* Design Style */}
          <FormField label="Design Style">
            <div className="flex flex-wrap gap-2">
              {DESIGN_STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => update('designStyle', s)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border transition-all"
                  style={config.designStyle === s
                    ? { background: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.4)', color: ACCENT }
                    : { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {config.designStyle === s && <Check size={9} className="inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          {/* Responsive */}
          <FormField label="Responsive Platforms">
            <div className="flex flex-col sm:flex-row gap-3">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'tablet',  icon: Tablet,  label: 'Tablet' },
                { id: 'mobile',  icon: Smartphone, label: 'Mobile' },
              ].map(d => {
                const Icon = d.icon;
                const active = config.responsive.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleResponsive(d.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-semibold cursor-pointer border transition-all"
                    style={active
                      ? { background: 'rgba(124,92,255,0.12)', borderColor: 'rgba(124,92,255,0.35)', color: ACCENT }
                      : { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                    }
                  >
                    <Icon size={14} />
                    {d.label}
                    {active && <Check size={10} />}
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* Screens */}
          <FormField label={`Number of Screens: ${config.screens}`}>
            <input
              type="range" min="1" max="8" value={config.screens}
              onChange={e => update('screens', parseInt(e.target.value))}
              className="w-full accent-[#7c5cff]"
            />
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span>1 Screen</span><span>8 Screens</span>
            </div>
          </FormField>
        </div>

        {/* Right: AI suggestions panel */}
        <div className="space-y-4">
          <AISuggestionsPanel config={config} />
          <ColorPreview config={config} />
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white cursor-pointer transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)', boxShadow: '0 4px 20px rgba(124,92,255,0.35)' }}
        >
          <WandIcon size={15} /> Continue to Optimization <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── AI Suggestions Panel ──────────────────────────────────────────────────

function AISuggestionsPanel({ config }) {
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    if (!config.description.trim()) { setError('Add a description first'); return; }
    setLoading(true); setError('');
    try {
      const data = await analyzeRequirements(config);
      if (data.brief) setBrief(data.brief);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <Bot size={13} style={{ color: ACCENT }} />
        <span className="text-[12px] font-bold">AI Requirements Analysis</span>
      </div>

      {!brief && !loading && (
        <button
          onClick={runAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all"
          style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.25)', color: ACCENT }}
        >
          <Sparkles size={11} /> Analyze Requirements with AI
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 size={14} className="animate-spin" style={{ color: ACCENT }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Analyzing…</span>
        </div>
      )}

      {error && (
        <p className="text-[11px] px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', color: DANGER }}>{error}</p>
      )}

      {brief && (
        <div className="space-y-3 text-[11px]">
          {brief.projectType && (
            <div>
              <span className="font-semibold" style={{ color: ACCENT }}>Type: </span>
              <span style={{ color: 'var(--text-muted)' }}>{brief.projectType}</span>
            </div>
          )}
          {brief.coreFeatures?.length > 0 && (
            <div>
              <span className="font-semibold" style={{ color: ACCENT }}>Core Features:</span>
              <ul className="mt-1 space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                {brief.coreFeatures.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <Check size={9} style={{ color: SUCCESS, marginTop: '2px', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {brief.designRequirements?.mood && (
            <div>
              <span className="font-semibold" style={{ color: ACCENT }}>Mood: </span>
              <span style={{ color: 'var(--text-muted)' }}>{brief.designRequirements.mood}</span>
            </div>
          )}
          {brief.referenceBrands?.length > 0 && (
            <div>
              <span className="font-semibold" style={{ color: ACCENT }}>Inspiration: </span>
              <span style={{ color: 'var(--text-muted)' }}>{brief.referenceBrands.slice(0, 4).join(', ')}</span>
            </div>
          )}
          <button onClick={() => setBrief(null)}
            className="text-[10px] cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Color Preview ───────────────────────────────────────────────────────────

function ColorPreview({ config }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <Palette size={13} style={{ color: ACCENT }} />
        <span className="text-[12px] font-bold">Color Palette</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { color: config.primaryColor, label: 'Primary' },
          { color: config.secondaryColor, label: 'Secondary' },
          { color: config.theme === 'dark' ? '#0d0d14' : '#ffffff', label: 'Background', textColor: config.theme === 'dark' ? '#fff' : '#000' },
        ].map(({ color, label, textColor }) => (
          <div key={label} className="space-y-1">
            <div
              className="h-12 rounded-xl border"
              style={{ background: color, borderColor: 'var(--border)' }}
            />
            <span className="text-[9px] block text-center" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Form Field ─────────────────────────────────────────────────────────────

function FormField({ label, hint, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
        {label}
        {required && <span style={{ color: DANGER }}>*</span>}
        {hint && <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px]" style={{ color: DANGER }}>
          <AlertCircle size={9} className="inline mr-1" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Optimize Step ───────────────────────────────────────────────────────────

function OptimizeStep({ onBack, onGenerate }) {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ad_config') || '{}'); }
    catch { return {}; }
  });

  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState('');
  const [original, setOriginal] = useState(config.description || '');
  const [selectedSize, setSelectedSize] = useState('1792x1024');
  const [variations, setVariations] = useState(1);
  const [size, setSize] = useState('1792x1024');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const runOptimization = async () => {
    if (!original.trim()) { setError('Please enter a description first'); return; }
    setOptimizing(true); setError('');
    try {
      const data = await optimizePrompt({
        userPrompt: original,
        designStyle: config.designStyle,
        theme: config.theme,
        primaryColor: config.primaryColor,
        appType: config.appType,
      });
      setOptimized(data.optimized || data.optimized_prompt || original);
    } catch (e) {
      setError(e.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    if (!optimized.trim()) { setError('Please optimize the prompt first'); return; }
    setLoading(true); setError(''); setProgress(0);
    abortRef.current = new AbortController();

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 90));
    }, 800);

    try {
      const data = await generateDesigns({
        optimizedPrompt: optimized,
        variations,
        size,
        style: config.designStyle,
        theme: config.theme,
      }, { signal: abortRef.current.signal });

      clearInterval(progressInterval);
      setProgress(100);

      if (!data.success || !data.designs?.length) {
        setError(data.errors?.[0] || 'Generation failed. Please try again.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('ad_designs', JSON.stringify(data.designs));
      sessionStorage.setItem('ad_config', JSON.stringify({ ...config, optimizedPrompt: optimized }));
      setTimeout(() => onGenerate(), 800);
    } catch (e) {
      clearInterval(progressInterval);
      if (e.name !== 'AbortError') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold mb-1">Prompt Optimization</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Our AI transforms your description into a professional design prompt.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original + Optimized */}
        <div className="space-y-4">
          {/* Original */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Type size={12} style={{ color: ACCENT }} />
              <span className="text-[12px] font-bold">Your Description</span>
            </div>
            <textarea
              value={original}
              onChange={e => setOriginal(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Describe what you want to build…"
            />
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.15)' }}>
              <WandIcon size={14} style={{ color: ACCENT }} />
            </div>
          </div>

          {/* Optimized */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--surface2)', border: '1px solid rgba(124,92,255,0.3)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={12} style={{ color: ACCENT }} />
              <span className="text-[12px] font-bold">Optimized Design Prompt</span>
            </div>
            {optimized ? (
              <p className="text-[12px] leading-relaxed px-3 py-2 rounded-xl" style={{ background: 'rgba(124,92,255,0.06)', color: 'var(--text-2)', border: '1px solid rgba(124,92,255,0.15)' }}>
                "{optimized}"
              </p>
            ) : (
              <p className="text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                Click "Optimize with AI" to transform your description…
              </p>
            )}
            <button
              onClick={runOptimization}
              disabled={optimizing || !original.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold cursor-pointer disabled:opacity-40 transition-all"
              style={{ background: 'rgba(124,92,255,0.12)', border: '1px solid rgba(124,92,255,0.3)', color: ACCENT }}
            >
              {optimizing
                ? <><Loader2 size={10} className="animate-spin" /> Optimizing…</>
                : <><Sparkles size={10} /> Optimize with AI</>
              }
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-[11px]" style={{ background: 'rgba(248,113,113,0.08)', color: DANGER }}>
              <AlertCircle size={12} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        {/* Right: Generation settings */}
        <div className="space-y-4">
          {/* Variations */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Layers size={12} style={{ color: ACCENT }} />
              <span className="text-[12px] font-bold">Image Variations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[1, 2, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setVariations(n)}
                  className="py-2.5 rounded-xl text-[12px] font-bold cursor-pointer border transition-all"
                  style={variations === n
                    ? { background: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.4)', color: ACCENT }
                    : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {n} {n === 1 ? 'Variation' : 'Variations'}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Maximize size={12} style={{ color: ACCENT }} />
              <span className="text-[12px] font-bold">Image Size</span>
            </div>
            <div className="space-y-2">
              {IMAGE_SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] cursor-pointer border transition-all text-left"
                  style={size === s.value
                    ? { background: 'rgba(124,92,255,0.12)', borderColor: 'rgba(124,92,255,0.35)', color: ACCENT }
                    : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: size === s.value ? ACCENT : 'var(--border)' }}>
                    {size === s.value && <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ACCENT }} />}
                  </div>
                  <div>
                    <span className="font-semibold">{s.label}</span>
                    <span className="ml-2 text-[10px]">{s.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-muted)' }}>Generating designs…</span>
                <span style={{ color: ACCENT }}>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_PINK})` }} />
              </div>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                Using MiniMax Image-01 — this may take 20-40 seconds
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !optimized.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-bold text-white cursor-pointer disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)', boxShadow: '0 4px 20px rgba(124,92,255,0.35)' }}
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
              : <><Sparkles size={14} /> Generate {variations > 1 ? `${variations} Designs` : 'Design'}</>
            }
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer" style={{ color: 'var(--text-muted)' }}>
          <ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} /> Back
        </button>
      </div>
    </div>
  );
}

// ─── Generate Step ─────────────────────────────────────────────────────────

function GenerateStep({ onResults }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.12)' }}>
        <Sparkles size={28} style={{ color: ACCENT }} className="animate-pulse" />
      </div>
      <h2 className="text-xl font-extrabold">Generation Complete</h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your designs are ready!</p>
      <div className="flex justify-center">
        <button
          onClick={onResults}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white cursor-pointer transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
        >
          <Image size={14} /> View Results <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Results Step ──────────────────────────────────────────────────────────

function ResultsStep({ onBack, onNew }) {
  const [designs, setDesigns] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ad_designs') || '[]'); }
    catch { return []; }
  });
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ad_config') || '{}'); }
    catch { return {}; }
  });
  const [activeDesign, setActiveDesign] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [code, setCode] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [framework, setFramework] = useState('react');
  const [lightbox, setLightbox] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState({});

  const analyzeOne = async (design) => {
    setActiveDesign(design.id);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const data = await analyzeDesign(design.imageUrl, design.prompt);
      setAnalysis(data.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
      setActiveDesign(null);
    }
  };

  const generateCodeForDesign = async (design) => {
    setActiveDesign(design.id);
    setGeneratingCode(true);
    setCode(null);
    try {
      const data = await generateCode(design.imageUrl, design.prompt, framework, '');
      setCode(data.code);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCode(false);
      setActiveDesign(null);
    }
  };

  const handleSave = async (design) => {
    setSaving(true);
    try {
      await saveDesign({
        id: design.id,
        prompt: design.prompt,
        imageUrl: design.imageUrl,
        style: config.designStyle,
        theme: config.theme,
        size: design.size,
      });
      setSaved(s => ({ ...s, [design.id]: true }));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const ScoreBar = ({ label, value, color }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-full px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-extrabold">Generated Designs</h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {designs.length} design{designs.length !== 1 ? 's' : ''} generated — click any to analyze, redesign, or export code
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <ArrowRight size={11} style={{ transform: 'rotate(180deg)' }} /> Generate More
          </button>
          <button onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[11px] font-bold text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)' }}>
            <WandIcon size={11} /> New Design
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Design Gallery */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designs.map((design, i) => (
              <DesignCard
                key={design.id}
                design={design}
                index={i}
                isActive={activeDesign === design.id}
                isSaved={saved[design.id]}
                onAnalyze={() => analyzeOne(design)}
                onSave={() => handleSave(design)}
                onRegenerate={async () => {
                  const result = await redesign(design.imageUrl, 'Improve overall quality', design.size, config.theme);
                  if (result.success) {
                    const newDesign = { ...design, id: uniqId(), imageUrl: result.improvedUrl, prompt: result.improvedPrompt };
                    setDesigns(d => [...d, newDesign]);
                  }
                }}
                onGenerateCode={() => generateCodeForDesign(design)}
                onPreview={() => setLightbox(design.imageUrl)}
                analysis={activeDesign === design.id && !analyzing ? analysis : null}
                analyzing={activeDesign === design.id && analyzing}
              />
            ))}
          </div>
        </div>

        {/* Right: Analysis + Code */}
        <div className="space-y-4 xl:col-span-1 mt-4 xl:mt-0">
          {/* Overall scores */}
          {analysis && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <BarChart3 size={13} style={{ color: ACCENT }} />
                <span className="text-[12px] font-bold">Design Analysis</span>
              </div>
              {analysis.overallScore && (
                <div className="text-center py-2">
                  <span className="text-4xl font-black" style={{ color: ACCENT }}>{analysis.overallScore}</span>
                  <span className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>/100</span>
                </div>
              )}
              <div className="space-y-2.5">
                {analysis.scores && Object.entries(analysis.scores).map(([key, val]) => (
                  <ScoreBar key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={val} color={val >= 80 ? SUCCESS : val >= 60 ? WARN : DANGER} />
                ))}
              </div>
              {analysis.strengths?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: SUCCESS }}>✓ Strengths</p>
                  <ul className="space-y-0.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Check size={9} className="shrink-0 mt-1" style={{ color: SUCCESS }} />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.criticalIssues?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: DANGER }}>⚠ Issues</p>
                  <ul className="space-y-0.5">
                    {analysis.criticalIssues.map((s, i) => (
                      <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: 'var(--text-muted)' }}>
                        <AlertCircle size={9} className="shrink-0 mt-1" style={{ color: DANGER }} />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Code panel */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Code2 size={12} style={{ color: ACCENT }} />
                <span className="text-[12px] font-bold">Code Export</span>
              </div>
              <select
                value={framework}
                onChange={e => setFramework(e.target.value)}
                className="text-[10px] px-2 py-1 rounded-lg outline-none cursor-pointer"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {CODE_FRAMEWORKS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="p-4">
              {generatingCode ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 size={16} className="animate-spin" style={{ color: ACCENT }} />
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Generating code…</span>
                </div>
              ) : code ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {code.split('\n').length} lines
                    </span>
                    <button onClick={copyCode}
                      className="flex items-center gap-1 text-[10px] cursor-pointer"
                      style={{ color: copiedCode ? SUCCESS : ACCENT }}>
                      {copiedCode ? <><CheckCheck size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[10px] leading-relaxed overflow-auto max-h-64 p-3 rounded-xl"
                    style={{ background: '#0d0d14', color: '#a0a0b8', fontFamily: 'ui-monospace, monospace' }}>
                    {code.slice(0, 2000)}{code.length > 2000 && '…'}
                  </pre>
                </div>
              ) : (
                <p className="text-[11px] text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Click "Generate Code" on any design to export production-ready code.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-10 right-0 text-[12px] cursor-pointer" style={{ color: 'rgba(255,255,255,0.6)' }}
              onClick={() => setLightbox(null)}>✕ Close</button>
            <img src={lightbox} alt="Design preview" className="w-full rounded-2xl border-2 border-white/10" />
            <div className="flex justify-center gap-3 mt-4">
              <a href={lightbox} download={`design-${Date.now()}.jpg`} target="_blank" rel="noopener"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-bold text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)' }}>
                <Download size={13} /> Download HD
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Design Card ───────────────────────────────────────────────────────────

function DesignCard({ design, index, isActive, isSaved, onAnalyze, onSave, onRegenerate, onGenerateCode, onPreview, analysis, analyzing }) {
  const [hovered, setHovered] = useState(false);
  const id = design.id || `d_${index}`;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden relative group cursor-pointer"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative" style={{ background: '#0d0d14' }}>
        <img
          src={design.imageUrl}
          alt={`Design ${index + 1}`}
          className="w-full object-cover"
          style={{ maxHeight: '280px' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        {/* Hover overlay */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <button onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-white cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <Eye size={11} /> Preview
          </button>
          <button onClick={onAnalyze}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-white cursor-pointer"
            style={{ background: 'rgba(124,92,255,0.7)' }}>
            <BarChart3 size={11} /> Analyze
          </button>
        </div>
        {/* Index badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
          #{index + 1}
        </div>
        {/* Loading overlay */}
        {(isActive && analyzing) && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-1.5 flex-wrap">
        <ActionBtn icon={BarChart3} label="Analyze" onClick={onAnalyze} />
        <ActionBtn icon={WandIcon} label="Redesign" onClick={onRegenerate} />
        <ActionBtn icon={Code2} label="Code" onClick={onGenerateCode} />
        <ActionBtn icon={isSaved ? Heart : Heart} label={isSaved ? 'Saved' : 'Save'} onClick={onSave}
          style={{ color: isSaved ? ACCENT_PINK : 'var(--text-muted)' }} />
        <ActionBtn icon={Download} label="Download" onClick={() => window.open(design.imageUrl, '_blank')} />
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, style }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer transition-colors"
      style={{ background: 'var(--surface)', color: style?.color || 'var(--text-muted)', ...style }}
      title={label}>
      <Icon size={10} /> {label}
    </button>
  );
}

// ─── History Grid ───────────────────────────────────────────────────────────

function HistoryGrid({ activeTab, onOpenResults, setActiveTab }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await loadHistory();
      setItems(activeTab === 'favorites' ? (data.favorites || []) : (data.history || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [activeTab]);

  const handleDelete = async (id) => {
    try { await deleteDesign(id); setItems(i => i.filter(x => x.id !== id)); } catch (e) {}
  };
  const handleFavorite = async (id) => {
    try { await toggleFavorite(id); setItems(i => i.map(x => x.id === id ? { ...x, isFavorite: !x.isFavorite } : x)); } catch (e) {}
  };
  const handleRegenerate = async (item) => {
    try {
      const newDesign = await regenerateDesign(item);
      setItems(i => i.map(x => x.id === item.id ? { ...x, imageUrl: newDesign.imageUrl } : x));
    } catch (e) { console.error('Regenerate failed:', e); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
    </div>;
  }

  if (items.length === 0) {
    return <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.1)' }}>
        {activeTab === 'favorites' ? <Heart size={24} style={{ color: ACCENT }} /> : <Clock size={24} style={{ color: ACCENT }} />}
      </div>
      <p className="text-[14px] font-bold">{activeTab === 'favorites' ? 'No favorites yet' : 'No design history'}</p>
      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
        {activeTab === 'favorites' ? 'Heart any design to save it here' : 'Generate your first design to see it here'}
      </p>
      <button onClick={() => setActiveTab('new')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)' }}>
        <WandIcon size={12} /> Start Creating
      </button>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <HistoryCard
            key={item.id}
            item={item}
            onDelete={() => handleDelete(item.id)}
            onFavorite={() => handleFavorite(item.id)}
            onRegenerate={() => handleRegenerate(item)}
          />
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ item, onDelete, onFavorite, onRegenerate }) {
  const [regenerating, setRegenerating] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <div style={{ background: '#0d0d14' }}>
        <img src={item.imageUrl} alt={item.prompt} className="w-full object-cover" style={{ maxHeight: '180px' }}
          onError={e => { e.target.style.opacity = '0.3'; }} />
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.prompt}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => { setRegenerating(true); onRegenerate().finally(() => setRegenerating(false)); }}
              className="p-1.5 rounded-lg cursor-pointer transition-colors" style={{ color: regenerating ? ACCENT : 'var(--text-muted)' }}
              title="Regenerate image">
              {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            </button>
            <button onClick={onFavorite}
              className="p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: item.isFavorite ? ACCENT_PINK : 'var(--text-muted)' }}>
              <Heart size={12} fill={item.isFavorite ? ACCENT_PINK : 'transparent'} />
            </button>
            <button onClick={() => window.open(item.imageUrl, '_blank')}
              className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--text-muted)' }}>
              <Download size={12} />
            </button>
            <button onClick={onDelete}
              className="p-1.5 rounded-lg cursor-pointer" style={{ color: DANGER }}>
              <Trash2 size={12} />
            </button>
          </div>
          {item.style && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(124,92,255,0.12)', color: ACCENT }}>
              {item.style}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── History Sidebar ────────────────────────────────────────────────────────

function HistorySidebar({ activeTab, setActiveTab, onOpenResults }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory().then(d => {
      setItems(d.history || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const favorites = items.filter(i => i.isFavorite).slice(0, 5);
  const recent = items.slice(0, 8);

  return (
    <div className="w-64 border-r flex flex-col shrink-0 overflow-hidden hidden lg:flex" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: ACCENT }} />
          <span className="text-[12px] font-bold">Quick Access</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {favorites.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
              <Heart size={8} className="inline mr-1" style={{ color: ACCENT_PINK }} />Favorites
            </p>
            {favorites.map(item => (
              <button key={item.id} onClick={() => { sessionStorage.setItem('ad_designs', JSON.stringify([item])); onOpenResults('results'); }}
                className="w-full flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors text-left"
                style={{ color: 'var(--text-muted)' }}>
                <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0"
                  onError={e => { e.target.style.opacity = '0.3'; }} />
                <span className="text-[10px] truncate flex-1">{item.prompt || item.style || 'Design'}</span>
              </button>
            ))}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--text-muted)' }}>Recent</p>
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin" style={{ color: ACCENT }} /></div>
          ) : recent.length === 0 ? (
            <p className="text-[10px] text-center py-2" style={{ color: 'var(--text-muted)' }}>No recent designs</p>
          ) : recent.map(item => (
            <button key={item.id} onClick={() => { sessionStorage.setItem('ad_designs', JSON.stringify([item])); onOpenResults('results'); }}
              className="w-full flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors text-left"
              style={{ color: 'var(--text-muted)' }}>
              <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0"
                onError={e => { e.target.style.opacity = '0.3'; }} />
              <span className="text-[10px] truncate flex-1">{item.prompt?.slice(0, 40) || item.style || 'Design'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function uniqId() { return 'design_' + Math.random().toString(36).slice(2, 11); }
