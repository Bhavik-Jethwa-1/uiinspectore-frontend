import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Copy, Check, Download, ChevronDown, ChevronRight,
  Clock, Cpu, Zap, FileCode, FolderArchive, Loader2,
  AlertCircle, RefreshCw, BookOpen, List, ExternalLink,
  Layout, Monitor, Smartphone
} from 'lucide-react';
import { ACCENT } from '../constants/theme';

const FRAMEWORKS = [
  { id: 'react', label: 'React + Tailwind', icon: Code, color: '#61DAFB' },
];

const TABS = [
  { id: 'main', label: 'Main Component', icon: FileCode },
  { id: 'supporting', label: 'Supporting', icon: Layout, showIf: 'supporting' },
];

// ─── Code Highlighter (simple, no external lib) ──────────────────────────────
function HighlightedCode({ code, language = 'jsx' }) {
  // Very simple JSX highlighting — replace class names with colored spans
  const highlighted = code
    // Strings
    .replace(/(&#x27;|&#x60;|`|')([^'}`]+)(&#x27;|&#x60;|`|')/g, '<span style="color:#a8d8a8">$1$2$3</span>')
    // JSX tags
    .replace(/(&lt;\/?)([\w.]+)/g, '$1<span style="color:#ff7b72">$2</span>')
    .replace(/(&gt;)/g, '<span style="color:#ff7b72">$1</span>')
    // className=
    .replace(/className=/g, '<span style="color:#79c0ff">className</span>=')
    .replace(/class=/g, '<span style="color:#79c0ff">class</span>=')
    // Tailwind classes (after =" or inside template literal)
    .replace(/"([^"]*(?:tw-|bg-|text-|p-|m-|r-|shadow-|border-|flex-|grid-|items-|justify-|w-|h-|space-|gap-|font-|leading-|tracking-)[^"]*)"/g,
      '"<span style="color:#79c0ff">$1</span>"')
    // Comments
    .replace(/(\/\/[^\n]*)/g, '<span style="color:#8b949e;font-style:italic">$1</span>')
    // Keywords
    .replace(/\b(import|export|default|from|function|const|return|if|else|for|while|className|key|map|props)\b/g,
      '<span style="color:#ff7b72;font-weight:600">$1</span>')
    // React imports
    .replace(/\b(useState|useEffect|useRef|useCallback|useMemo)\b/g,
      '<span style="color:#d2a8ff">$1</span>')
    // Numbers
    .replace(/\b(\d+)(px|%|rem|em|ms|s)?\b/g,
      '<span style="color:#79c0ff">$1$2</span>')
    // HTML entities for display
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return (
    <pre
      className="text-[12px] leading-relaxed overflow-auto p-4 font-mono"
      style={{ color: '#e6edf3', background: 'transparent', margin: 0 }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

// ─── Download Button ─────────────────────────────────────────────────────────
function DownloadButton({ redesignId, code }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('inspector_token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008'}/api/inspector/codes/${redesignId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'ui-redesign.zip';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadZip}
      disabled={downloading || !code}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all disabled:opacity-40"
      style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; }}>
      {downloading ? <Loader2 size={12} className="animate-spin" /> : <FolderArchive size={12} />}
      Download ZIP
    </button>
  );
}

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all"
      style={{
        background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface2)',
        color: copied ? '#22c55e' : 'var(--text-muted)',
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'var(--surface3)'; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'var(--surface2)'; }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReactCode({ redesign, code, onGenerate, onLoading }) {
  const [activeTab, setActiveTab] = useState('main');
  const [loading, setLoading] = useState(onLoading || false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const hasSupporting = !!(code?.supporting_code);
  const visibleTabs = TABS.filter(t => !t.showIf || (t.showIf === 'supporting' && hasSupporting));

  const handleGenerate = useCallback(async () => {
    if (!redesign?.id) return;
    setGenerating(true);
    setError(null);
    setLoading(true);
    try {
      await onGenerate?.(redesign.id);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, [redesign?.id, onGenerate]);

  const framework = FRAMEWORKS[0];

  if (!code && !generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${ACCENT}12`, border: `1px dashed ${ACCENT}40` }}>
          <FileCode size={28} style={{ color: ACCENT, opacity: 0.7 }} />
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          Generate React Code
        </h3>
        <p className="text-[13px] max-w-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          AI will analyze your UI and generate a complete, production-ready React + Tailwind component that recreates and improves the interface.
        </p>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[14px] font-bold text-white"
          style={{
            background: ACCENT,
            boxShadow: `0 8px 32px ${ACCENT}35`,
          }}>
          <Zap size={15} />
          Generate React Code
        </button>
      </div>
    );
  }

  if (generating || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: `${ACCENT}40` }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-dashed"
              style={{ borderColor: `${ACCENT}60`, borderTopColor: ACCENT }}
            />
          </div>
        </div>
        <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text)' }}>
          Generating React Code...
        </h3>
        <p className="text-[13px] text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
          GPT-4o is analyzing your UI and writing production-ready React + Tailwind code. This takes about 10–30 seconds.
        </p>
        <div className="mt-6 flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <Cpu size={12} style={{ color: ACCENT }} /> GPT-4o
          </span>
          <span className="flex items-center gap-1.5">
            <Layout size={12} style={{ color: ACCENT }} /> React 18
          </span>
          <span className="flex items-center gap-1.5">
            <Monitor size={12} style={{ color: ACCENT }} /> Tailwind CSS
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
          <div className="flex-1">
            <p className="text-[13px] font-semibold" style={{ color: '#ef4444' }}>Code generation failed</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
          </div>
          <button onClick={handleGenerate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-white"
            style={{ background: ACCENT }}>
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!code?.generated_code) return null;

  const currentCode = activeTab === 'main' ? code.generated_code : (code.supporting_code || '');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${framework.color}15` }}>
            <framework.icon size={14} style={{ color: framework.color }} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{framework.label}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Production-ready component</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {code.generation_time_ms && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg"
              style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
              <Clock size={10} /> {Math.round(code.generation_time_ms / 1000)}s
            </span>
          )}
          {code.model && (
            <span className="text-[11px] px-2 py-1 rounded-lg"
              style={{ background: `${ACCENT}10`, color: ACCENT }}>
              {code.model}
            </span>
          )}
          <CopyButton text={currentCode} />
          <DownloadButton redesignId={redesign?.id} code={code} />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
        <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <BookOpen size={10} />
          {currentCode.length.toLocaleString()} chars
        </span>
        <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <List size={10} />
          {currentCode.split('\n').length} lines
        </span>
        {code.summary && (
          <span className="text-[11px] text-ellipsis overflow-hidden" style={{ color: 'var(--text-muted)' }}>
            {code.summary}
          </span>
        )}
      </div>

      {/* Tabs */}
      {visibleTabs.length > 1 && (
        <div className="flex items-center gap-1 px-5 pt-3 pb-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? `${ACCENT}15` : 'transparent',
                  color: activeTab === tab.id ? ACCENT : 'var(--text-muted)',
                }}>
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Code block */}
      <div className="flex-1 overflow-auto" style={{ background: '#0d1117' }}>
        <HighlightedCode code={currentCode} language="jsx" />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Paste into a React + Tailwind project to run
        </span>
        <div className="flex items-center gap-2">
          <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px]"
            style={{ color: ACCENT }}>
            <ExternalLink size={10} /> Tailwind Docs
          </a>
          <span className="text-[11px] px-2 py-1 rounded-lg font-mono"
            style={{ background: 'var(--surface3)', color: 'var(--text-muted)' }}>
            npx create-vite@latest
          </span>
        </div>
      </div>
    </div>
  );
}
