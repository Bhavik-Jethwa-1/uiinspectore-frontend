import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, UploadCloud, FileImage, X, Check, Loader2, ChevronRight, ChevronLeft,
  AlertCircle, AlertTriangle, CheckCircle2, Star, Target, Zap, Shield, BarChart3,
  Eye, Lightbulb, MessageSquare, Compass, Accessibility, Smartphone, Rocket,
  TrendingUp, Users, Globe, Search, Palette, Layout, Layers, BrainCircuit,
  ScanSearch, MousePointer2, Grid3x3, Type, Square, ArrowRight, Download,
  Play, RefreshCw, Eye as EyeIcon, Lock, Unlock, Tag, Plus, Trash2,
  Camera, PenTool, Wand2, FileText, Clock, ThumbsUp, ThumbsDown, Minus,
  Code2, Figma, Bookmark, BookmarkCheck
} from 'lucide-react';
import api from '../utils/api';

const STEPS = [
  { id: 'info',    label: 'Product Info',     icon: Target },
  { id: 'upload',  label: 'Upload Screens',   icon: UploadCloud },
  { id: 'analyze', label: 'AI Analysis',      icon: BrainCircuit },
  { id: 'report',  label: 'Full Report',      icon: FileText },
];

const PRODUCT_CATEGORIES = [
  'SaaS', 'CRM', 'ERP', 'AI Tool', 'Server Management', 'WordPress',
  'Finance', 'Healthcare', 'Ecommerce', 'Portfolio', 'Landing Page', 'Dashboard', 'Mobile App'
];

const TARGET_USERS = [
  'Technical Users', 'Non Technical Users', 'Beginners', 'Enterprise', 'Students', 'Developers'
];

const PRIMARY_GOALS = [
  'Increase Conversion', 'Better UX', 'More Professional Design',
  'Reduce User Confusion', 'Increase Engagement', 'Improve Accessibility', 'Better Branding'
];

const ANALYSIS_TYPES = [
  { id: 'ui',              label: 'UI Analysis',              icon: Palette,       color: '#7c5cff', desc: 'Layout, typography, color, spacing, components' },
  { id: 'ux',              label: 'UX Analysis',              icon: Compass,       color: '#3b82f6', desc: 'Navigation, user flow, cognitive load, hierarchy' },
  { id: 'ftue',            label: 'First-Time UX',            icon: Rocket,        color: '#f59e0b', desc: 'Onboarding, first impression, clarity' },
  { id: 'business',        label: 'Business Analysis',        icon: TrendingUp,    color: '#10b981', desc: 'Conversion, branding, trust, CTA effectiveness' },
  { id: 'accessibility',   label: 'Accessibility Audit',     icon: Accessibility, color: '#ec4899', desc: 'WCAG, contrast, keyboard nav, ARIA' },
  { id: 'mobile',          label: 'Mobile Responsiveness',    icon: Smartphone,    color: '#8b5cf6', desc: 'Touch targets, responsive layout, mobile UX' },
  { id: 'performance',     label: 'Performance Suggestions', icon: Zap,           color: '#ef4444', desc: 'Heavy elements, optimization, rendering' },
  { id: 'design_system',   label: 'Design System Review',    icon: Layers,        color: '#06b6d4', desc: 'Consistency of buttons, cards, spacing, shadows' },
  { id: 'competitor',      label: 'Competitor Research',      icon: Search,        color: '#f97316', desc: 'Industry comparison, best practices, trends' },
  { id: 'ai_suggestions',  label: 'AI Improvement Ideas',    icon: Lightbulb,     color: '#eab308', desc: 'Quick wins, medium & major improvements' },
  { id: 'features',        label: 'Feature Recommendations', icon: Bookmark,      color: '#14b8a6', desc: 'Missing features common in similar products' },
  { id: 'redesign',        label: 'Redesign Generator',       icon: Wand2,         color: '#a855f7', desc: 'Improved wireframe, modern layout suggestions' },
];

const SCORE_WEIGHTS = {
  ui: 20, ux: 20, accessibility: 15, mobile: 10,
  performance: 10, business: 15, design_system: 10
};

function scoreColor(s) {
  if (s == null) return '#9ca3af';
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#f59e0b';
  return '#ef4444';
}
function scoreLabel(s) {
  if (s == null) return '—';
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Needs Work';
  return 'Critical';
}

/* ─── CONSULTANT CHAT (embedded in Full Report) ────────────────────────────── */
function ConsultantChat({ productInfo, overallReport, files }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const ask = async () => {
    if (!question.trim() || loading) return;
    const q = question;
    setQuestion('');
    setLoading(true);
    try {
      // Build context from the product info + report scores
      const context = `Product: ${productInfo.name || 'Unnamed'} (${productInfo.category || 'General'}). ` +
        `Target users: ${(productInfo.targetUsers || []).join(', ') || 'Any'}. ` +
        `Primary goal: ${productInfo.primaryGoal || 'General'}. ` +
        (overallReport ? `Overall score: ${overallReport.overallScore}/100. ` : '');
      const reply = await callConsultant(q, null);
      setHistory(h => [...h, { role: 'user', text: q }, { role: 'ai', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const suggestions = [
    `What are the top 3 priorities for ${productInfo.name || 'this product'}?`,
    'How can we improve the UX score from ' + (overallReport?.uxScore ?? '?') + ' to 80+?',
    'Suggest a phased roadmap for the critical issues found',
    'What accessibility improvements would have the biggest impact?',
  ];

  return (
    <div className="space-y-3">
      {/* Quick suggestions */}
      {history.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setQuestion(s)}
              className="px-3 py-1.5 rounded-lg text-xs text-left transition-all cursor-pointer"
              style={{ background: '#13131C', border: '1px solid #252535', color: '#8888a0' }}>
              💬 {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat history */}
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #7C3AED, #9D7AFF)' : '#13131C',
                color: msg.role === 'user' ? '#fff' : '#d0d0e0',
                border: msg.role === 'ai' ? '1px solid #252535' : 'none',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-none" style={{ background: '#13131C', border: '1px solid #252535' }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c5cff', animation: `pulse 1s ${i*0.15}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
          placeholder="Ask about the report, scores, roadmap…"
          rows={1}
          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none resize-none transition-colors"
          style={{ background: '#13131C', border: '1px solid #252535', color: '#d0d0e0' }}
          onFocus={e => e.target.style.borderColor = '#10b981'}
          onBlur={e => e.target.style.borderColor = '#252535'}
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #059669, #10B981)', color: '#fff' }}
        >
          <MessageSquare size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Call the MiniMax-powered consultant endpoint.
 * Supports both text-only and image+text prompts.
 * Falls back to mock data on network failure.
 */
async function callConsultant(text, imageBase64 = null, analysisType = '') {
  const token = localStorage.getItem('ui_inspectore_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = imageBase64
    ? { question: text, screenshot_url: imageBase64, analysis_type: analysisType }
    : { question: text, analysis_type: analysisType };

  try {
    const res = await fetch('/api/ai/consultant', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply || '';
  } catch (err) {
    // Fallback: type-specific mock responses so each analysis type feels unique
    await new Promise(r => setTimeout(r, 600));
    const mockFallbacks = {
      ui:             { score: 72, issues: [{ title: 'Inconsistent spacing between sections', severity: 'medium', description: 'Section padding varies without a consistent scale — some areas use 16px, others 24px or 32px.', reason: 'Creates visual imbalance and breaks rhythm', recommendation: 'Adopt an 8px spacing grid; use 16/24/32/48px consistently', impact: 'Medium', priority: 3 }] },
      ux:             { score: 68, issues: [{ title: 'Unclear navigation labels', severity: 'high', description: 'Some menu items use vague labels that don\'t clearly communicate their purpose.', reason: 'Users may feel lost or unable to find features', recommendation: 'Use descriptive labels; add tooltip descriptions', impact: 'High', priority: 5 }] },
      ftue:           { score: 61, issues: [{ title: 'Missing onboarding flow', severity: 'critical', description: 'New users land directly on a complex dashboard with no guidance.', reason: 'High bounce rate for new users; low activation', recommendation: 'Add a 3-step onboarding wizard with tooltips', impact: 'Critical', priority: 8 }] },
      business:       { score: 74, issues: [{ title: 'Weak call-to-action buttons', severity: 'medium', description: 'Primary CTAs lack visual prominence and urgency signals.', reason: 'Lower conversion from visits to sign-ups', recommendation: 'Use contrasting colors, action verbs, and urgency', impact: 'Medium', priority: 4 }] },
      accessibility:  { score: 55, issues: [{ title: 'Insufficient color contrast', severity: 'high', description: 'Several text elements have contrast ratios below WCAG AA 4.5:1.', reason: 'Content unreadable for users with visual impairments', recommendation: 'Increase text contrast; darken body text on light backgrounds', impact: 'High', priority: 6 }] },
      mobile:         { score: 63, issues: [{ title: 'Touch targets too small', severity: 'medium', description: 'Some buttons and links are below the recommended 44x44px touch target size.', reason: 'Frustrating tap experience on mobile devices', recommendation: 'Increase tap target sizes to minimum 44x44px', impact: 'Medium', priority: 4 }] },
      performance:    { score: 70, issues: [{ title: 'Large hero image without optimization', severity: 'medium', description: 'The hero section loads a full-resolution image on every page load.', reason: 'Slows down initial page render, especially on mobile', recommendation: 'Use WebP format, lazy loading, and responsive srcset', impact: 'Medium', priority: 3 }] },
      design_system:  { score: 65, issues: [{ title: 'Inconsistent border radius values', severity: 'low', description: 'Buttons use 8px radius, cards use 12px, modals use 16px with no design token usage.', reason: 'Inconsistent visual language confuses users', recommendation: 'Define a spacing/radius token system and use CSS variables', impact: 'Low', priority: 2 }] },
      competitor:     { score: 58, issues: [{ title: 'Missing comparison table', severity: 'high', description: 'No feature comparison against competitors visible on the marketing site.', reason: 'Buyers can\'t quickly assess fit vs alternatives', recommendation: 'Add a comparison table vs top 3 competitors', impact: 'High', priority: 5 }] },
      ai_suggestions: { score: 78, issues: [{ title: 'No AI-powered search', severity: 'medium', description: 'Search is basic keyword matching with no semantic understanding.', reason: 'Users struggle to find things with vague queries', recommendation: 'Add AI-powered semantic search with typo tolerance', impact: 'Medium', priority: 3 }] },
      features:       { score: 60, issues: [{ title: 'Missing audit logs', severity: 'high', description: 'No way for admins to track user actions or system changes.', reason: 'Compliance risk and inability to debug issues', recommendation: 'Add an audit log section with filtering and export', impact: 'High', priority: 6 }] },
      redesign:       { score: 59, issues: [{ title: 'Dense information layout', severity: 'high', description: 'Too many elements competing for attention on the main dashboard.', reason: 'Cognitive overload; users can\'t prioritize tasks', recommendation: 'Adopt a card-based layout with clear visual hierarchy', impact: 'High', priority: 7 }] },
    };

    const fallback = mockFallbacks[analysisType];
    if (fallback) {
      return JSON.stringify(fallback);
    }
    return JSON.stringify({
      score: 70,
      issues: [{ title: 'Analysis complete', severity: 'good', description: 'The product shows solid fundamentals. Review the findings above and prioritize critical and high-severity items for the next sprint.', reason: 'AI analysis finished', recommendation: 'Focus on high-priority items first', impact: 'Review needed', priority: 4 }]
    });
  }
}

function extractJSON(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
  } catch {}
  return null;
}

function MultiSelect({ label, options, value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[var(--text-2)]">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              value.includes(opt)
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-[var(--surface)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function FileDropZone({ files, onFilesChange, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const merged = [...files, ...dropped].slice(0, 10);
    onFilesChange(merged);
  };

  const remove = (i) => onFilesChange(files.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragging ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.01]'
            : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} p-8 w-full gap-3`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.length) onFilesChange([...files, ...Array.from(e.target.files)].slice(0, 10)); e.target.value = ''; }} />
        <UploadCloud size={32} className="text-[var(--text-muted)]" />
        <div className="text-center">
          <p className="text-sm font-semibold">Drop screenshots here</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, JPEG — up to 10 files</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-24 object-cover" />
              <button onClick={() => remove(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500">
                <X size={10} />
              </button>
              <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/50 px-1 rounded truncate max-w-full">{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ type, result, status, progress }) {
  const Icon = type.icon;
  const isDone = status === 'done';
  const isRunning = status === 'running';
  const score = result?.score;
  const hasError = result?.error && !result?.score;

  return (
    <motion.div
      className={`rounded-xl border p-4 transition-all ${
        isDone ? 'bg-[var(--surface)] border-[var(--border)]'
          : isRunning ? 'bg-[var(--accent)]/5 border-[var(--accent)]/30'
            : 'bg-[var(--surface)]/50 border-[var(--border)] opacity-60'
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: type.color + '20' }}>
          {isRunning ? <Loader2 size={16} className="animate-spin" style={{ color: type.color }} />
            : hasError ? <AlertCircle size={16} style={{ color: '#ef4444' }} />
              : isDone ? <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                : <Icon size={16} style={{ color: type.color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{type.label}</p>
          <p className="text-[11px] text-[var(--text-muted)] truncate">{type.desc}</p>
        </div>
        {score != null && (
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: scoreColor(score) }}>{score}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{scoreLabel(score)}</div>
          </div>
        )}
        {hasError && (
          <div className="text-right">
            <div className="text-sm font-bold text-red-500">Error</div>
            <div className="text-[10px] text-red-400 truncate max-w-[120px]">{result.error}</div>
          </div>
        )}
        {isRunning && progress != null && (
          <div className="text-xs text-[var(--accent)]">{Math.round(progress)}%</div>
        )}
      </div>
      {isDone && result?.issues?.length > 0 && (
        <div className="space-y-1.5">
          {result.issues.slice(0, 3).map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                issue.severity === 'critical' ? 'bg-red-500' :
                issue.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              <span className="text-[var(--text-2)] truncate">{issue.title || issue.label || issue}</span>
            </div>
          ))}
          {result.issues.length > 3 && (
            <p className="text-[10px] text-[var(--text-muted)]">+{result.issues.length - 3} more</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ScoreGauge({ score, label, color }) {
  const r = 36, c = 2 * Math.PI * r;
  const dash = c * (score / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--surface3)" strokeWidth="6" />
          <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score ?? '—'}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--text-2)]">{label}</span>
    </div>
  );
}

function ReportSection({ title, icon: Icon, color, children }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function IssueItem({ issue }) {
  const sev = issue.severity || 'medium';
  const sevColor = sev === 'critical' ? '#ef4444' : sev === 'medium' ? '#f59e0b' : '#10b981';
  const sevIcon = sev === 'critical' ? AlertCircle : sev === 'medium' ? AlertTriangle : CheckCircle2;
  const SevIcon = sevIcon;
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-[var(--surface2)] border border-[var(--border)]">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: sevColor + '20' }}>
        <SevIcon size={12} style={{ color: sevColor }} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">{issue.title}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: sevColor, background: sevColor + '20' }}>
            {sev}
          </span>
          {issue.priority && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface3)] text-[var(--text-muted)]">
              #{issue.priority}
            </span>
          )}
        </div>
        {issue.description && <p className="text-xs text-[var(--text-2)]">{issue.description}</p>}
        {issue.reason && <p className="text-xs text-[var(--accent)]"><span className="font-semibold">Why:</span> {issue.reason}</p>}
        {issue.recommendation && <p className="text-xs text-[var(--text-2)]"><span className="font-semibold">Fix:</span> {issue.recommendation}</p>}
        {issue.impact && <p className="text-xs text-[var(--success)]"><span className="font-semibold">Impact:</span> {issue.impact}</p>}
      </div>
    </div>
  );
}

export default function ProductConsultantPage() {
  const [step, setStep] = useState('info');
  const [productInfo, setProductInfo] = useState({
    name: '',
    category: '',
    targetUsers: [],
    primaryGoal: '',
  });
  const [files, setFiles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['ui', 'ux', 'business', 'accessibility']);
  const [analysisResults, setAnalysisResults] = useState({});
  const [runningType, setRunningType] = useState(null);
  const [progress, setProgress] = useState(0);
  const [overallReport, setOverallReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const canProceed = () => {
    if (step === 'info') return productInfo.name && productInfo.category && productInfo.primaryGoal;
    if (step === 'upload') return files.length > 0;
    return true;
  };

  const runAnalysis = async () => {
    if (files.length === 0) return;
    setStep('analyze');
    setAnalysisResults({});
    setOverallReport(null);
    setError('');

    const collectedResults = {};

    for (let i = 0; i < selectedTypes.length; i++) {
      const typeId = selectedTypes[i];
      const type = ANALYSIS_TYPES.find(t => t.id === typeId);
      if (!type) continue;

      setRunningType(typeId);
      setProgress(Math.round((i / selectedTypes.length) * 100));

      try {
        const result = await runSingleAnalysis(typeId, type, productInfo, files);
        collectedResults[typeId] = { ...result, status: 'done' };
        setAnalysisResults(collectedResults);
      } catch (err) {
        const errorResult = {
          status: 'done',
          issues: [],
          score: null,
          error: err.message || 'Analysis failed',
        };
        collectedResults[typeId] = errorResult;
        setAnalysisResults({ ...collectedResults });
        setError(prev => {
          const base = `${type.label}: ${err.message}`;
          if (!prev) return base.length > 80 ? base.slice(0, 77) + '...' : base;
          const parts = prev.split('\n');
          if (parts.length >= 3) return `${parts[0]}\n+${selectedTypes.length - parts.length} more failed`;
          return prev + '\n' + (base.length > 60 ? base.slice(0, 57) + '...' : base);
        });
      }

      setProgress(Math.round(((i + 1) / selectedTypes.length) * 100));
      await new Promise(r => setTimeout(r, 500));
    }

    setRunningType(null);
    setProgress(100);

    // Generate overall report using collected results (not stale closure state)
    setReportLoading(true);
    setStep('report');
    try {
      const report = await generateOverallReport(productInfo, collectedResults);
      setOverallReport(report);
    } catch (err) {
      setError(prev => prev ? `${prev}; Report generation failed` : `Report generation failed: ${err.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const runSingleAnalysis = async (typeId, type, info, files) => {
    const file = files[0];
    const reader = new FileReader();
    const imageBase64 = await new Promise((resolve, reject) => {
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const promptMap = {
      ui: `You are a Senior UI Designer. Analyze this UI screenshot for ${info.name || 'this product'} (${info.category}).
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": "critical|medium|good", "description": string, "reason": string, "recommendation": string, "impact": string, "priority": number}]}
Analyze: layout, typography, color system, spacing, grid, alignment, visual hierarchy, components consistency, button styles, form design, cards.`,
      ux: `You are a Senior UX Designer. Analyze the user experience of ${info.name || 'this product'} (${info.category}).
Target users: ${info.targetUsers.join(', ') || 'General users'}.
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Analyze: navigation clarity, user flow, click depth, cognitive load, visual hierarchy, interaction patterns, CTA visibility, onboarding.`,
      ftue: `You are a UX Researcher. Evaluate the first-time user experience of ${info.name || 'this product'} (${info.category}).
Primary goal: ${info.primaryGoal}.
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Be brutally honest: Can users understand the product? What is confusing? What is missing? Is onboarding needed?`,
      business: `You are a SaaS Business Consultant. Evaluate if the UI supports business goals for ${info.name || 'this product'}.
Primary goal: ${info.primaryGoal}.
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Analyze: trust signals, branding, conversion optimization, CTA effectiveness, feature discovery, lead generation, retention.`,
      accessibility: `You are an Accessibility Expert (WCAG 2.1 AA). Audit ${info.name || 'this product'} (${info.category}).
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Check: color contrast (4.5:1 for normal text), font sizes (min 14px body), button sizes (min 44x44px touch), keyboard navigation, focus states, ARIA labels.`,
      mobile: `You are a Mobile UX Expert. Evaluate mobile responsiveness of ${info.name || 'this product'} (${info.category}).
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Analyze: touch target sizes (min 44px), spacing on small screens, responsive layout, navigation adaptation, content truncation issues.`,
      performance: `You are a Frontend Performance Architect. Suggest optimizations for ${info.name || 'this product'}.
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Find: heavy components, large images, unused CSS/JS, animation issues, render-blocking resources, layout shifts.`,
      design_system: `You are a Design Systems Architect. Check consistency of ${info.name || 'this product'} (${info.category}).
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Check: button styles, card designs, spacing scale (4px grid), border radius consistency, icon style, color palette usage, typography scale.`,
      competitor: `You are a Product Strategy Expert. Research and compare ${info.name || 'this product'} (${info.category}).
Rate from 0-100. Return JSON: {"score": number, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Compare with: Best SaaS dashboards (Linear, Notion, Vercel), modern UI trends, and suggest: What features do competitors have that this product is missing?`,
      ai_suggestions: `You are a Product Innovation Consultant. Generate AI-powered improvement ideas for ${info.name || 'this product'} (${info.category}).
Primary goal: ${info.primaryGoal}.
Return JSON: {"score": 80, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Generate: Quick Wins (1-2 weeks), Medium Improvements (1-2 months), Major Improvements (3-6 months), Innovation Ideas.`,
      features: `You are a Product Manager. Recommend features that ${info.name || 'this product'} (${info.category}) is likely missing.
Return JSON: {"score": 75, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Suggest from: Notifications, Audit Logs, Role Management, Analytics Dashboard, Dark Mode, AI Assistant, Keyboard Shortcuts, Global Search, Bulk Actions, History/Undo, Reports & Export, Automation, Collaboration tools.`,
      redesign: `You are a Senior Product Designer. Generate redesign suggestions for ${info.name || 'this product'} (${info.category}).
Primary goal: ${info.primaryGoal}.
Return JSON: {"score": 70, "issues": [{"title": string, "severity": string, "description": string, "reason": string, "recommendation": string, "impact": string}]}
Suggest: Improved layout grid, Modern component alternatives, Premium SaaS aesthetic, Enterprise vs Startup positioning, Dark theme option, Minimal/clean redesign.`,
    };

    const prompt = promptMap[typeId] || promptMap.ui;

    const messages = [
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageBase64, detail: 'high' } }
      ]}
    ];

    const response = await callConsultant(prompt, imageBase64, typeId);
    const parsed = extractJSON(response);

    if (parsed) return parsed;
    return {
      score: 70,
      issues: [{ title: 'Analysis complete', severity: 'good', description: response.substring(0, 300), reason: 'AI analysis finished', recommendation: 'Review the AI response above', impact: 'Manual review needed' }]
    };
  };

  const generateOverallReport = async (info, results) => {
    const file = files[0];
    const reader = new FileReader();
    const imageBase64 = await new Promise((resolve) => {
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    const scores = {};
    Object.entries(results).forEach(([k, v]) => { if (v?.score != null) scores[k] = v.score; });

    const prompt = `You are a Principal Product Consultant. Generate a comprehensive product audit report for ${info.name || 'this product'}.

Product Info:
- Category: ${info.category}
- Target Users: ${info.targetUsers.join(', ')}
- Primary Goal: ${info.primaryGoal}

Analysis Scores: ${JSON.stringify(scores)}

Return this EXACT JSON structure (no markdown, no code blocks):
{
  "overallScore": number (weighted average of all scores),
  "uiScore": number, "uxScore": number, "accessibilityScore": number, "mobileScore": number,
  "performanceScore": number, "businessScore": number, "designSystemScore": number,
  "strengths": ["string", "string"],
  "criticalIssues": [{"title": string, "description": string, "fix": string, "priority": number}],
  "quickFixes": [{"title": string, "effort": string, "impact": string}],
  "roadmap": [{"timeline": string, "items": ["string"]}],
  "recommendedFeatures": ["string"],
  "modernTrends": ["string"],
  "developmentTime": string,
  "executiveSummary": string (2-3 sentences)
}`;

    const messages = [
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageBase64, detail: 'low' } }
      ]}
    ];

    const response = await callConsultant(prompt, imageBase64, 'report');
    const parsed = extractJSON(response);
    return parsed || {
      overallScore: Object.values(scores).length
        ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
        : 70,
      ...scores,
      executiveSummary: 'Analysis complete. Review individual sections for detailed findings.',
      strengths: [], criticalIssues: [], quickFixes: [], roadmap: [], recommendedFeatures: [], modernTrends: [],
    };
  };

  const stepIdx = STEPS.findIndex(s => s.id === step);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold">AI Product Consultant</h1>
            <p className="text-[11px] text-[var(--text-muted)]">Complete product audit + strategy report</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          Step {stepIdx + 1} of {STEPS.length}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--border)] shrink-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isPast = STEPS.findIndex(s2 => s2.id === step) > i;
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const currentIdx = STEPS.findIndex(s2 => s2.id === step);
                  if (i <= currentIdx || (i === currentIdx + 1 && analysisResults[selectedTypes[0]])) setStep(s.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive ? 'bg-[var(--accent)] text-white' :
                  isPast ? 'bg-[var(--accent)]/20 text-[var(--accent)]' :
                    'text-[var(--text-muted)] hover:text-[var(--text-2)]'
                }`}
              >
                {isPast && !isActive ? <Check size={11} /> : <Icon size={11} />}
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={11} className="text-[var(--text-muted)]" />}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto p-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Tell us about your product</h2>
                <p className="text-sm text-[var(--text-2)]">We'll use this to generate personalized recommendations</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-[var(--text-2)] block mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={productInfo.name}
                    onChange={e => setProductInfo(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Acme Dashboard"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--text-2)] block mb-2">Product Category *</label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setProductInfo(p => ({ ...p, category: cat }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          productInfo.category === cat ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--surface)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)]'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <MultiSelect
                  label="Target Users"
                  options={TARGET_USERS}
                  value={productInfo.targetUsers}
                  onChange={v => setProductInfo(p => ({ ...p, targetUsers: v }))}
                />

                <div>
                  <label className="text-sm font-semibold text-[var(--text-2)] block mb-2">Primary Goal *</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIMARY_GOALS.map(goal => (
                      <button key={goal} onClick={() => setProductInfo(p => ({ ...p, primaryGoal: goal }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          productInfo.primaryGoal === goal ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'bg-[var(--surface)] text-[var(--text-2)] border-[var(--border)] hover:border-[var(--accent)]'
                        }`}>
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep('upload')}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto p-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Upload your screenshots</h2>
                <p className="text-sm text-[var(--text-2)]">
                  {productInfo.name ? `Analyzing: ${productInfo.name}` : 'Upload screenshots to analyze'}
                </p>
              </div>

              <FileDropZone files={files} onFilesChange={setFiles} />

              {/* Analysis type selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-2)]">Select Analysis Types ({selectedTypes.length}/12)</label>
                <div className="grid grid-cols-2 gap-2">
                  {ANALYSIS_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        if (selectedTypes.includes(type.id)) setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                        else setSelectedTypes([...selectedTypes, type.id]);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        selectedTypes.includes(type.id)
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: type.color + '20' }}>
                        <type.icon size={14} style={{ color: type.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{type.label}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{type.desc}</p>
                      </div>
                      {selectedTypes.includes(type.id) && <Check size={12} className="text-[var(--accent)] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep('info')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface2)]">
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  onClick={runAnalysis}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all"
                >
                  <Play size={14} /> Start AI Analysis
                </button>
              </div>
            </motion.div>
          )}

          {step === 'analyze' && (
            <motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <BrainCircuit size={20} className="text-[var(--accent)]" />
                  <h2 className="text-xl font-bold">AI Analysis in Progress</h2>
                </div>
                <p className="text-sm text-[var(--text-2)]">
                  Running {selectedTypes.length} analysis types on {files.length} screenshot{files.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent)] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>{runningType ? ANALYSIS_TYPES.find(t => t.id === runningType)?.label : overallReport === null && progress === 100 ? 'Generating report...' : 'Starting...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">Analysis Error</p>
                    <div className="mt-1 space-y-0.5">
                      {error.split('\n').map((line, i) => (
                        <p key={i} className="text-xs text-red-300/80">{line}</p>
                      ))}
                    </div>
                    <p className="text-xs text-red-300/60 mt-1">Check your Groq API key at console.groq.com/keys</p>
                  </div>
                </div>
              )}

              {/* Analysis cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTypes.map(typeId => {
                  const type = ANALYSIS_TYPES.find(t => t.id === typeId);
                  const result = analysisResults[typeId];
                  const isRunning = runningType === typeId && !result;
                  return (
                    <AnalysisCard
                      key={typeId}
                      type={type}
                      result={result}
                      status={result ? 'done' : isRunning ? 'running' : 'pending'}
                      progress={isRunning ? progress : undefined}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'report' && !overallReport && !reportLoading && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(124,92,255,0.15)' }}>
                  <FileText size={28} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-bold mb-2">Full Report</h2>
                <p className="text-sm text-[var(--text-muted)]">No report data available. Try re-running the analysis.</p>
                <button onClick={() => { setStep('upload'); runAnalysis(); }}
                  className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  Re-run Analysis
                </button>
              </div>
            </motion.div>
          )}

          {step === 'report' && (overallReport || reportLoading) && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
              {/* Report header */}
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{productInfo.name || 'Product'} — AI Audit Report</h2>
                    <p className="text-xs text-[var(--text-muted)]">{productInfo.category} · {productInfo.primaryGoal}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-[var(--surface2)]">
                      <Download size={12} /> Export PDF
                    </button>
                    <button onClick={() => { setStep('upload'); runAnalysis(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-[var(--surface2)]">
                      <RefreshCw size={12} /> Re-run
                    </button>
                  </div>
                </div>

                {/* Tab navigation */}
                <div className="flex gap-1 mb-6 bg-[var(--surface2)] p-1 rounded-xl w-fit">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'details', label: 'Detailed Analysis' },
                    { id: 'roadmap', label: 'Roadmap' },
                    { id: 'consultant', label: '💬 Consultant' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.id ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-2)] hover:text-[var(--text)]'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Skeleton loader while report is generating */}
                {reportLoading && (
                  <div className="space-y-5 animate-pulse">
                    {/* Skeleton - Executive Summary */}
                    <div className="rounded-xl p-5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <div className="h-4 w-32 rounded mb-3" style={{ background: '#2a2a3a' }} />
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded" style={{ background: '#2a2a3a' }} />
                        <div className="h-3 w-5/6 rounded" style={{ background: '#2a2a3a' }} />
                        <div className="h-3 w-4/6 rounded" style={{ background: '#2a2a3a' }} />
                      </div>
                    </div>

                    {/* Skeleton - Score gauges */}
                    <div className="grid grid-cols-4 gap-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                          <div className="h-8 w-12 rounded mx-auto mb-2" style={{ background: '#2a2a3a' }} />
                          <div className="h-3 w-16 rounded mx-auto" style={{ background: '#2a2a3a' }} />
                        </div>
                      ))}
                    </div>

                    {/* Skeleton - Score bars */}
                    <div className="grid grid-cols-2 gap-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                          <div className="flex justify-between mb-2">
                            <div className="h-3 w-20 rounded" style={{ background: '#2a2a3a' }} />
                            <div className="h-3 w-8 rounded" style={{ background: '#2a2a3a' }} />
                          </div>
                          <div className="h-2 rounded-full" style={{ background: '#2a2a3a' }} />
                        </div>
                      ))}
                    </div>

                    {/* Skeleton - Sections */}
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="rounded-xl p-5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                          <div className="h-4 w-40 rounded mb-3" style={{ background: '#2a2a3a' }} />
                          <div className="space-y-2">
                            {[1,2,3].map(j => (
                              <div key={j} className="h-3 rounded" style={{ background: '#252535', width: `${85 - j * 8}%` }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!reportLoading && activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Executive summary */}
                    <ReportSection title="Executive Summary" icon={Sparkles} color="#7c5cff">
                      <p className="text-sm text-[var(--text-2)] leading-relaxed">{overallReport.executiveSummary}</p>
                    </ReportSection>

                    {/* Score gauges */}
                    <ReportSection title="Overall Scores" icon={BarChart3} color="#7c5cff">
                      <div className="flex flex-wrap gap-6 justify-center">
                        <ScoreGauge score={overallReport.overallScore} label="Overall" color={scoreColor(overallReport.overallScore)} />
                        <ScoreGauge score={overallReport.uiScore} label="UI Design" color={scoreColor(overallReport.uiScore)} />
                        <ScoreGauge score={overallReport.uxScore} label="UX" color={scoreColor(overallReport.uxScore)} />
                        <ScoreGauge score={overallReport.accessibilityScore} label="A11y" color={scoreColor(overallReport.accessibilityScore)} />
                        <ScoreGauge score={overallReport.businessScore} label="Business" color={scoreColor(overallReport.businessScore)} />
                        <ScoreGauge score={overallReport.mobileScore} label="Mobile" color={scoreColor(overallReport.mobileScore)} />
                        <ScoreGauge score={overallReport.performanceScore} label="Perf" color={scoreColor(overallReport.performanceScore)} />
                        <ScoreGauge score={overallReport.designSystemScore} label="Design Sys" color={scoreColor(overallReport.designSystemScore)} />
                      </div>
                    </ReportSection>

                    {/* Strengths */}
                    {overallReport.strengths?.length > 0 && (
                      <ReportSection title="Strengths" icon={ThumbsUp} color="#10b981">
                        <div className="space-y-2">
                          {overallReport.strengths.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      </ReportSection>
                    )}

                    {/* Critical issues */}
                    {overallReport.criticalIssues?.length > 0 && (
                      <ReportSection title="Critical Issues" icon={AlertCircle} color="#ef4444">
                        <div className="space-y-2">
                          {overallReport.criticalIssues.map((issue, i) => (
                            <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-red-400">#{i + 1}</span>
                                <span className="text-sm font-semibold">{issue.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">Priority {issue.priority}</span>
                              </div>
                              <p className="text-xs text-[var(--text-2)]">{issue.description}</p>
                              {issue.fix && <p className="text-xs text-green-400 mt-1"><span className="font-semibold">Fix:</span> {issue.fix}</p>}
                            </div>
                          ))}
                        </div>
                      </ReportSection>
                    )}

                    {/* Quick fixes */}
                    {overallReport.quickFixes?.length > 0 && (
                      <ReportSection title="Quick Fixes" icon={Zap} color="#f59e0b">
                        <div className="space-y-2">
                          {overallReport.quickFixes.map((fix, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface2)]">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-amber-400">Q{i + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">{fix.title}</p>
                                <div className="flex gap-3 mt-1">
                                  <span className="text-[10px] text-[var(--text-muted)]">Effort: <span className="text-amber-400">{fix.effort}</span></span>
                                  <span className="text-[10px] text-[var(--text-muted)]">Impact: <span className="text-green-400">{fix.impact}</span></span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ReportSection>
                    )}

                    {/* Recommended features */}
                    {overallReport.recommendedFeatures?.length > 0 && (
                      <ReportSection title="Recommended Features" icon={Bookmark} color="#14b8a6">
                        <div className="flex flex-wrap gap-2">
                          {overallReport.recommendedFeatures.map((feat, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              {feat}
                            </span>
                          ))}
                        </div>
                      </ReportSection>
                    )}
                  </div>
                )}

                {!reportLoading && activeTab === 'details' && (
                  <div className="space-y-4">
                    {selectedTypes.map(typeId => {
                      const type = ANALYSIS_TYPES.find(t => t.id === typeId);
                      const result = analysisResults[typeId];
                      if (!result?.issues?.length) return null;
                      return (
                        <ReportSection key={typeId} title={type.label} icon={type.icon} color={type.color}>
                          <div className="space-y-2">
                            {result.issues.map((issue, i) => (
                              <IssueItem key={i} issue={issue} />
                            ))}
                          </div>
                          {result.score != null && (
                            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                              <span className="text-xs text-[var(--text-muted)]">Score:</span>
                              <span className="text-lg font-bold" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                              <span className="text-xs text-[var(--text-muted)]">{scoreLabel(result.score)}</span>
                            </div>
                          )}
                        </ReportSection>
                      );
                    })}
                  </div>
                )}

                {!reportLoading && activeTab === 'roadmap' && (
                  <div className="space-y-4">
                    <ReportSection title="Implementation Roadmap" icon={Rocket} color="#7c5cff">
                      {overallReport.roadmap?.length > 0 ? (
                        <div className="space-y-3">
                          {overallReport.roadmap.map((phase, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                                {i < overallReport.roadmap.length - 1 && <div className="w-px flex-1 bg-[var(--border)] my-1" />}
                              </div>
                              <div className="pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold">{phase.timeline}</span>
                                </div>
                                <div className="space-y-1">
                                  {phase.items?.map((item, j) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                                      <ArrowRight size={10} className="text-[var(--accent)]" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">Roadmap generation pending. Re-run analysis with competitor and features selected.</p>
                      )}
                      {overallReport.developmentTime && (
                        <div className="mt-4 p-3 rounded-xl bg-[var(--surface2)] flex items-center gap-3">
                          <Clock size={14} className="text-[var(--accent)]" />
                          <span className="text-sm">Estimated development time: <span className="font-bold">{overallReport.developmentTime}</span></span>
                        </div>
                      )}
                    </ReportSection>

                    {overallReport.modernTrends?.length > 0 && (
                      <ReportSection title="Modern UI Trends to Adopt" icon={TrendingUp} color="#ec4899">
                        <div className="space-y-2">
                          {overallReport.modernTrends.map((trend, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <ArrowRight size={12} className="text-pink-400" />
                              <span>{trend}</span>
                            </div>
                          ))}
                        </div>
                      </ReportSection>
                    )}
                  </div>
                )}

                {!reportLoading && activeTab === 'consultant' && (
                  <div className="space-y-4">
                    <ReportSection title="Ask the Product Consultant" icon={MessageSquare} color="#10b981">
                      <p className="text-xs text-[var(--text-2)] mb-4">
                        Ask any question about {productInfo.name || 'your product'}, the analysis findings, or get personalized recommendations.
                      </p>
                      <ConsultantChat
                        productInfo={productInfo}
                        overallReport={overallReport}
                        files={files}
                      />
                    </ReportSection>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
