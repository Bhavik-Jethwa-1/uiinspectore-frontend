/**
 * AIStudioPage — Professional Multi-Provider AI Chat Studio
 *
 * Layout:
 *   ┌──────────┬──────────────────────────────────────────┐
 *   │ SIDEBAR  │  CHAT AREA                              │
 *   │          │  ┌──────────────────────────────────┐  │
 *   │ New Chat │  │ TOP BAR: Provider | Model | Settings│
 *   │ Search   │  ├──────────────────────────────────┤  │
 *   │ History  │  │                                  │  │
 *   │ ────────  │  │  MESSAGE LIST                    │  │
 *   │ Folders  │  │  (provider, model, tokens, cost) │  │
 *   │          │  │                                  │  │
 *   │          │  ├──────────────────────────────────┤  │
 *   │          │  │ INPUT: textarea + attachments      │  │
 *   │          │  └──────────────────────────────────┘  │
 *   └──────────┴──────────────────────────────────────────┘
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Bot, User, RefreshCw, Copy, CheckCheck, Square, AlertCircle,
  Loader2, Plus, Search, Trash2, Edit3, Pin, PinOff, FolderOpen,
  ChevronDown, Settings, X, Clock, Zap, MessageSquare, Sparkles,
  FileText, Image, Paperclip, Upload, Mic, CornerDownLeft,
  Cpu, Key, Globe, RotateCcw, StopCircle, Maximize2, Minimize2,
  CheckCircle, AlertTriangle, ExternalLink, Code2, Trash,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// ─── Provider Definitions ────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'openai', label: 'OpenAI', color: '#10a37f',
    icon: '🟢',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    badge: 'OpenAI',
  },
  {
    id: 'anthropic', label: 'Anthropic', color: '#d97706',
    icon: '🟠',
    models: ['claude-opus-4', 'claude-sonnet-4', 'claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    badge: 'Anthropic',
  },
  {
    id: 'gemini', label: 'Google Gemini', color: '#4285f4',
    icon: '🔵',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    badge: 'Gemini',
  },
  {
    id: 'deepseek', label: 'DeepSeek', color: '#7c3aed',
    icon: '🟣',
    models: ['deepseek-chat', 'deepseek-coder'],
    badge: 'DeepSeek',
  },
  {
    id: 'groq', label: 'Groq', color: '#06b6d4',
    icon: '⚡',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'llama-3.1-8b-instant'],
    badge: 'Groq',
  },
  {
    id: 'minimax', label: 'MiniMax', color: '#f43f5e',
    icon: '🔴',
    models: ['MiniMax-M3', 'MiniMax-M2'],
    badge: 'MiniMax',
  },
  {
    id: 'mistral', label: 'Mistral', color: '#f97316',
    icon: '🟠',
    models: ['mistral-large', 'mistral-small', 'mistral-medium'],
    badge: 'Mistral',
  },
  {
    id: 'openrouter', label: 'OpenRouter', color: '#8b5cf6',
    icon: '🟣',
    models: ['openrouter/auto', 'openrouter/openai/gpt-4o', 'openrouter/anthropic/claude-sonnet'],
    badge: 'OpenRouter',
  },
  {
    id: 'ollama', label: 'Ollama (Local)', color: '#22c55e',
    icon: '🟢',
    models: ['llama3', 'llama3.1', 'mistral', 'codellama'],
    badge: 'Ollama',
  },
  {
    id: 'azure', label: 'Azure OpenAI', color: '#0078d4',
    icon: '🔷',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-35-turbo'],
    badge: 'Azure',
  },
];

const DEFAULT_PROVIDER = 'openai';
const DEFAULT_MODEL = 'gpt-4o';

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...args) {
  return args.filter(Boolean).join(' ');
}

function formatCost(cost) {
  if (!cost && cost !== 0) return null;
  return cost < 0.001 ? '<$0.001' : `$${cost.toFixed(4)}`;
}

function formatTokens(n) {
  if (!n) return null;
  return n.toLocaleString();
}

function formatLatency(ms) {
  if (!ms) return null;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─── Markdown Renderer ─────────────────────────────────────────────────────────
function MessageContent({ content }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-[var(--surface2)] hover:bg-[var(--surface3)] text-[var(--text-2)]"
        title="Copy"
      >
        {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
      </button>
      <div className="prose-invert prose-sm max-w-none
        prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-strong:text-[var(--text)]
        prose-code:text-[#e2e8f0] prose-code:bg-[#1e1e2e] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#0d0d14] prose-pre:border prose-pre:border-[var(--border)]
        prose-ul:text-[var(--text)] prose-ol:text-[var(--text)]
        prose-li:marker:text-[var(--text-2)]
        prose-a:text-[#7c5cff] prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-[var(--accent)] prose-blockquote:text-[var(--text-2)]
        prose-table:text-sm prose-table:border-collapse
        prose-th:border prose-th:border-[var(--border)] prose-th:bg-[var(--surface2)] prose-th:px-3 prose-th:py-2
        prose-td:border prose-td:border-[var(--border)] prose-td:px-3 prose-td:py-2
      ">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              if (inline) {
                return <code className={className} {...props}>{children}</code>;
              }
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              const code = String(children).replace(/\n$/, '');
              if (lang && hljs.getLanguage(lang)) {
                const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
                return (
                  <pre className={`${className} hljs language-${lang}`}>
                    <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
                  </pre>
                );
              }
              return <pre className={className}><code {...props}>{children}</code></pre>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// ─── Response Metadata Bar ────────────────────────────────────────────────────
function ResponseMeta({ meta }) {
  if (!meta) return null;
  return (
    <div className="flex items-center gap-3 text-[11px] text-[var(--text-2)] mt-2 flex-wrap">
      {meta.provider && (
        <span className="flex items-center gap-1">
          <Cpu size={10} />
          {meta.provider}
        </span>
      )}
      {meta.model && (
        <span className="flex items-center gap-1">
          <Sparkles size={10} />
          {meta.model}
        </span>
      )}
      {meta.latency_ms && (
        <span className="flex items-center gap-1">
          <Zap size={10} />
          {formatLatency(meta.latency_ms)}
        </span>
      )}
      {meta.input_tokens && (
        <span>↓ {formatTokens(meta.input_tokens)}</span>
      )}
      {meta.output_tokens && (
        <span>↑ {formatTokens(meta.output_tokens)}</span>
      )}
      {meta.total_tokens && (
        <span>≈ {formatTokens(meta.total_tokens)} tok</span>
      )}
      {meta.cost != null && (
        <span className="text-[var(--accent)]">~{formatCost(meta.cost)}</span>
      )}
      <span className="ml-auto">
        {meta.stopped === false && (
          <span className="text-yellow-500 flex items-center gap-1"><StopCircle size={10} /> stopped</span>
        )}
        {meta.error && (
          <span className="text-red-400 flex items-center gap-1"><AlertCircle size={10} /> error</span>
        )}
      </span>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Message({ message, onRegenerate, onContinue }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3 px-4 py-4', isUser ? 'bg-[var(--surface2)]' : '')}>
      {/* Avatar */}
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-bold',
        isUser ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface3)] text-[var(--text-2)]'
      )}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <MessageContent content={message.content} />
        {isAssistant && <ResponseMeta meta={message.metadata} />}

        {/* Actions for assistant messages */}
        {isAssistant && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRegenerate?.()}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
              title="Regenerate"
            >
              <RotateCcw size={11} /> Regenerate
            </button>
            <button
              onClick={() => onContinue?.()}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
              title="Continue"
            >
              <CornerDownLeft size={11} /> Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Provider Selector ────────────────────────────────────────────────────────
function ProviderSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PROVIDERS.find(p => p.id === value) || PROVIDERS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-[var(--border)] transition-all"
      >
        <span>{selected.icon}</span>
        <span>{selected.label}</span>
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--surface1)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:bg-[var(--surface2)] transition-all',
                p.id === value && 'bg-[var(--surface2)] text-[var(--accent)]'
              )}
            >
              <span>{p.icon}</span>
              <span className="flex-1 text-left">{p.label}</span>
              {p.id === value && <CheckCircle size={12} className="text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Model Selector ───────────────────────────────────────────────────────────
function ModelSelector({ provider, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const prov = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  const models = prov.models || [];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-[var(--border)] transition-all max-w-[160px]"
      >
        <span className="truncate">{value || prov.models[0] || 'Select model'}</span>
        <ChevronDown size={11} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[var(--surface1)] border border-[var(--border)] rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {models.map(m => (
            <button
              key={m}
              onClick={() => { onChange(m); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-[12px] hover:bg-[var(--surface2)] transition-all truncate',
                m === value && 'bg-[var(--surface2)] text-[var(--accent)]'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, onClose }) {
  return (
    <div className="absolute top-full right-0 mt-1 w-72 bg-[var(--surface1)] border border-[var(--border)] rounded-xl shadow-xl z-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-[var(--text)]">Chat Settings</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--surface2)]"><X size={14} /></button>
      </div>

      {/* Temperature */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[11px] font-medium text-[var(--text-2)]">Temperature</label>
          <span className="text-[11px] font-mono text-[var(--accent)]">{settings.temperature}</span>
        </div>
        <input
          type="range" min="0" max="2" step="0.1"
          value={settings.temperature}
          onChange={e => onChange({ ...settings, temperature: parseFloat(e.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
        <div className="flex justify-between text-[10px] text-[var(--text-2)] mt-0.5">
          <span>Precise</span><span>Creative</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[11px] font-medium text-[var(--text-2)]">Max Output Tokens</label>
          <span className="text-[11px] font-mono text-[var(--accent)]">{settings.maxTokens}</span>
        </div>
        <input
          type="range" min="256" max="16384" step="256"
          value={settings.maxTokens}
          onChange={e => onChange({ ...settings, maxTokens: parseInt(e.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Streaming */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[var(--text-2)]">Stream Responses</label>
        <button
          onClick={() => onChange({ ...settings, streaming: !settings.streaming })}
          className={cn(
            'w-9 h-5 rounded-full transition-all relative',
            settings.streaming ? 'bg-[var(--accent)]' : 'bg-[var(--surface3)]'
          )}
        >
          <span className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
            settings.streaming ? 'left-4.5' : 'left-0.5'
          )} />
        </button>
      </div>

      {/* System Prompt */}
      <div>
        <label className="text-[11px] font-medium text-[var(--text-2)] block mb-1">System Prompt</label>
        <textarea
          value={settings.systemPrompt}
          onChange={e => onChange({ ...settings, systemPrompt: e.target.value })}
          placeholder="Optional: Override the AI's behavior..."
          rows={3}
          className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-3 py-2 text-[12px] text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none focus:border-[var(--accent)] resize-none"
        />
      </div>
    </div>
  );
}

// ─── Chat Input ───────────────────────────────────────────────────────────────
function ChatInput({ onSend, onStop, streaming, disabled }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim(), files);
    setMessage('');
    setFiles([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...Array.from(newFiles).slice(0, 5 - prev.length)]);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="border-t border-[var(--border)] p-4">
      {/* Attachments preview */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[11px]">
              {f.type?.startsWith('image/') ? <Image size={11} /> : <FileText size={11} />}
              <span className="truncate max-w-[100px]">{f.name}</span>
              <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={10} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* File attach */}
        <label className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface2)] hover:bg-[var(--surface3)] border border-[var(--border)] cursor-pointer transition-all text-[var(--text-2)] hover:text-[var(--text)]">
          <Paperclip size={15} />
          <input type="file" className="hidden" multiple accept="image/*,.pdf,.txt,.md,.js,.ts,.jsx,.tsx,.css,.html,.json"
            onChange={e => addFiles(e.target.files)} />
        </label>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Studio… (Shift+Enter for new line, Enter to send)"
            rows={1}
            disabled={disabled}
            className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-12 text-[13px] text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none focus:border-[var(--accent)] resize-none leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '200px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
          />
          {/* Character count */}
          {message.length > 3000 && (
            <span className="absolute bottom-2 right-12 text-[10px] text-[var(--text-2)]">
              {message.length.toLocaleString()}
            </span>
          )}
        </div>

        {/* Send / Stop */}
        {streaming ? (
          <button
            onClick={onStop}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all"
            title="Stop"
          >
            <StopCircle size={16} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent)] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
            title="Send"
          >
            <Send size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onPin,
  collapsed,
  onToggleCollapse,
}) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const filtered = conversations.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (editingId !== null) inputRef.current?.focus();
  }, [editingId]);

  const startRename = (convo) => {
    setEditingId(convo.id);
    setEditValue(convo.title);
  };

  const commitRename = () => {
    if (editingId !== null && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  if (collapsed) {
    return (
      <div className="w-14 shrink-0 border-r border-[var(--border)] flex flex-col items-center py-3 gap-1">
        <button
          onClick={onNew}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent)] hover:opacity-90 text-white"
          title="New Chat"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)]"
          title="Expand sidebar"
        >
          <ChevronDown size={14} className="rotate-90" />
        </button>
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 w-full items-center mt-2">
          {conversations.slice(0, 20).map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all relative',
                c.id === activeId && 'bg-[var(--accent)] text-white',
                c.is_pinned && 'text-yellow-400'
              )}
              title={c.title}
            >
              <MessageSquare size={15} />
              {c.is_pinned && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yellow-400" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--bg)]">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)]">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-[13px] font-bold transition-all"
        >
          <Plus size={15} /> New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-3 py-2">
          <Search size={13} className="text-[var(--text-2)] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-[12px] text-[var(--text)] placeholder:text-[var(--text-2)] focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[12px] text-[var(--text-2)]">
            {search ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
        {filtered.map(convo => (
          <div
            key={convo.id}
            className={cn(
              'group flex items-center gap-2 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-all',
              convo.id === activeId
                ? 'bg-[var(--surface2)] text-[var(--text)]'
                : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
            )}
          >
            {/* Icon */}
            <MessageSquare size={13} className="shrink-0" />

            {/* Title */}
            <div className="flex-1 min-w-0">
              {editingId === convo.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                  className="w-full bg-transparent text-[12px] text-[var(--text)] focus:outline-none border-b border-[var(--accent)]"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="text-[12px] font-medium truncate block">{convo.title || 'New Chat'}</span>
              )}
              <span className="text-[10px] opacity-60">{timeAgo(convo.updated_at)}</span>
            </div>

            {/* Pin indicator */}
            {convo.is_pinned && <Pin size={10} className="text-yellow-400 shrink-0" />}

            {/* Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onPin(convo.id); }}
                className="p-1 rounded hover:bg-[var(--surface3)]"
                title={convo.is_pinned ? 'Unpin' : 'Pin'}
              >
                {convo.is_pinned ? <PinOff size={11} /> : <Pin size={11} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startRename(convo); }}
                className="p-1 rounded hover:bg-[var(--surface3)]"
                title="Rename"
              >
                <Edit3 size={11} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(convo.id); }}
                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Collapse button */}
      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[var(--text-2)] hover:bg-[var(--surface2)] text-[12px]"
        >
          <ChevronDown size={13} className="rotate-90" /> Collapse
        </button>
      </div>
    </div>
  );
}

// ─── Main AIStudioPage ────────────────────────────────────────────────────────
export default function AIStudioPage() {
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    systemPrompt: '',
  });

  // ── Load conversations on mount ─────────────────────────────────────────
  useEffect(() => {
    loadConversations();
  }, []);

  // ── Load messages when switching conversations ───────────────────────────
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // ── Auto-scroll to bottom ───────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── When provider changes, update model to first available ───────────────
  useEffect(() => {
    const prov = PROVIDERS.find(p => p.id === provider);
    if (prov && prov.models.length > 0) {
      setModel(prov.models[0]);
    }
  }, [provider]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/ai/studio/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setConversations(data.data);
    } catch (e) {
      console.error('Failed to load conversations:', e);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await fetch(`/api/ai/studio/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError('');
  };

  const handleSend = async (content, files) => {
    if (!content.trim() || loading) return;
    setError('');

    // Add user message immediately
    const userMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content,
      attachments: files?.length ? files.map(f => ({ name: f.name, type: f.type })) : null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (settings.streaming) {
        await handleStream(content);
      } else {
        await handleNonStream(content, files);
      }
    } catch (e) {
      setError(e.message || 'Failed to get response');
    }
  };

  const handleStream = async (content) => {
    setLoading(true);
    setStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    // Add placeholder for assistant
    const assistantId = 'temp-assistant-' + Date.now();
    let assistantContent = '';
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString() }
    ]);

    try {
      const body = {
        message: content,
        conversation_id: activeConversationId,
        provider,
        model,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
      };
      if (settings.systemPrompt) body.system_prompt = settings.systemPrompt;

      const res = await fetch('/api/ai/studio/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const text = decoder.decode(value, { stream: !done });
          // SSE: each line is "data: {...}"
          for (const line of text.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                setError(data.error);
                break;
              }
              if (data.delta !== undefined) {
                assistantContent += data.delta;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                ));
              }
              if (data.done) {
                // Update with final metadata
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        metadata: data.metadata || {},
                        id: data.message_id || m.id,
                      }
                    : m
                ));
                // Reload conversation list to get updated title
                loadConversations();
                // Set active conversation if new
                if (!activeConversationId) {
                  loadConversations().then(() => {
                    // Find the newest conversation
                    setTimeout(() => {
                      setConversations(prev => {
                        if (prev[0]?.title !== 'New Chat') return prev;
                        // try to find the one we just created
                        loadConversations();
                        return prev;
                      });
                    }, 500);
                  });
                }
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Stream failed');
        // Remove placeholder
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      setAbortController(null);
    }
  };

  const handleNonStream = async (content, files) => {
    setLoading(true);
    try {
      const body = {
        message: content,
        conversation_id: activeConversationId,
        provider,
        model,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        attachments: files?.map(f => ({ name: f.name, type: f.type })) || [],
      };
      if (settings.systemPrompt) body.system_prompt = settings.systemPrompt;

      const res = await fetch('/api/ai/studio/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.success) {
        setMessages(prev => [
          ...prev,
          data.data.user_message,
          data.data.assistant_message,
        ]);
        if (data.data.conversation?.id && !activeConversationId) {
          setActiveConversationId(data.data.conversation.id);
        }
        loadConversations();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    abortController?.abort();
    setStreaming(false);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await fetch(`/api/ai/studio/conversations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleRename = async (id, title) => {
    try {
      await fetch(`/api/ai/studio/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title }),
      });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    } catch (e) {
      console.error('Rename failed:', e);
    }
  };

  const handlePin = async (id) => {
    try {
      const res = await fetch(`/api/ai/studio/conversations/${id}/pin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, is_pinned: data.is_pinned } : c));
      }
    } catch (e) {
      console.error('Pin failed:', e);
    }
  };

  const handleRegenerate = () => {
    // Find last user message and re-send
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const userMsg = messages[messages.length - 1 - lastUserIdx];
    // Remove the last assistant message
    setMessages(prev => prev.slice(0, -1));
    handleSend(userMsg.content, userMsg.attachments);
  };

  const handleContinue = () => {
    // Just append a "continue" indicator — in a real implementation,
    // this would send a blank message to continue the last response
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistant) return;
    handleSend('Continue.', []);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => { setActiveConversationId(id); setError(''); }}
        onNew={handleNewChat}
        onDelete={handleDelete}
        onRename={handleRename}
        onPin={handlePin}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="shrink-0 border-b border-[var(--border)] px-4 py-2.5 flex items-center gap-3 bg-[var(--bg)] relative">
          {/* Provider */}
          <ProviderSelector value={provider} onChange={(p) => { setProvider(p); setError(''); }} />

          {/* Model */}
          <ModelSelector provider={provider} value={model} onChange={(m) => { setModel(m); setError(''); }} />

          {/* Divider */}
          <div className="w-px h-5 bg-[var(--border)]" />

          {/* Temperature badge */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border',
              settings.temperature < 0.3
                ? 'border-blue-500/30 text-blue-400'
                : settings.temperature > 1.0
                ? 'border-orange-500/30 text-orange-400'
                : 'border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--surface2)]'
            )}
            title="Temperature"
          >
            <Zap size={10} />
            {settings.temperature}
          </button>

          {/* Streaming indicator */}
          {streaming && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Generating…
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1">
              <AlertCircle size={11} />
              <span className="truncate max-w-[200px]">{error}</span>
              <button onClick={() => setError('')}><X size={10} /></button>
            </div>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                settingsOpen
                  ? 'bg-[var(--surface2)] text-[var(--accent)]'
                  : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
              )}
            >
              <Settings size={15} />
            </button>
            {settingsOpen && (
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                onClose={() => setSettingsOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface2)] flex items-center justify-center mb-4">
                <Bot size={28} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-[18px] font-bold text-[var(--text)] mb-1">
                {PROVIDERS.find(p => p.id === provider)?.label || 'AI Studio'}
              </h2>
              <p className="text-[13px] text-[var(--text-2)] max-w-md">
                Send a message to start chatting with{' '}
                <span className="text-[var(--accent)]">{model}</span>.
                Select a different provider or model from the top bar.
              </p>
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  'Explain this code to me',
                  'Help me write a React component',
                  'Debug this error',
                  'Write tests for my function',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt, [])}
                    className="text-[12px] px-3 py-1.5 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={msg.id || i} className="group hover:bg-[var(--surface1)] transition-colors">
              <Message
                message={msg}
                onRegenerate={handleRegenerate}
                onContinue={handleContinue}
              />
            </div>
          ))}

          {loading && !streaming && messages.length === 0 && (
            <div className="flex items-center gap-3 px-4 py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
              <span className="text-[13px] text-[var(--text-2)]">Thinking…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          streaming={streaming}
          disabled={loading && !streaming}
        />
      </div>
    </div>
  );
}
