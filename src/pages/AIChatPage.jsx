import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageGenerationService } from '../services/ImageService';
import { useAIProvider } from '../context/AIProviderContext';
import { getUserData } from '../utils/api';
import {
  Send, User, Bot, RefreshCw, Copy, CheckCheck, Square, AlertCircle,
  Settings, MessageSquare, Loader2, Cpu, X, Eye, EyeOff,
  Download, Sparkles, Zap, ImagePlus, Image, ExternalLink,
  Paperclip, FileText, ZoomIn, ZoomOut, Maximize2, Clock, Trash2,
  Plus, Search, Calendar, Hash, PanelLeftClose,
  ChevronDown, Shield, Edit3, CheckCircle, Globe, Star, StarOff,
  Palette, Accessibility, BarChart3, Code2,
  Pin, Archive, ArchiveRestore, RotateCcw, MoreVertical, MoreHorizontal,
  ArrowDownAZ, Clock3, ArrowUpDown, Heart, FileDown, DownloadCloud,
  CornerDownLeft, Filter, SortAsc, Inbox, Layers, Mic, Volume2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// ─── AI Agent Definitions ───────────────────────────────────────────────
const AI_AGENTS = [
  {
    id: 'general',
    name: 'General Assistant',
    icon: Bot,
    color: '#7c5cff',
    desc: 'Code, design, research & anything you need',
  },
  {
    id: 'ui-design',
    name: 'UI Design Agent',
    icon: Palette,
    color: '#ff6b9d',
    desc: 'UI layouts, components, color systems & typography',
  },
  {
    id: 'ux-research',
    name: 'UX Research Agent',
    icon: Search,
    color: '#3b82f6',
    desc: 'User research, personas, journey maps & usability audits',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Agent',
    icon: Accessibility,
    color: '#10b981',
    desc: 'WCAG compliance, a11y audits & inclusive design',
  },
  {
    id: 'conversion',
    name: 'Conversion Agent',
    icon: BarChart3,
    color: '#f59e0b',
    desc: 'Funnels, CTAs, A/B tests & growth strategies',
  },
  {
    id: 'code-review',
    name: 'Code Review Agent',
    icon: Search,
    color: '#3b82f6',
    desc: 'React, CSS, performance & best practices review',
  },
  {
    id: 'image-gen',
    name: 'Image Gen Agent',
    icon: Image,
    color: '#8b5cf6',
    desc: 'AI image generation, mockups & visual concepts',
  },
];

// ─── API — Unified AI services ──────────────────────────────────────────────
const api = {
  // Chat — routed to ChatService via AIGatewayController
  streamChat: (token, body) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/chat/stream/ui', { method: 'POST', headers, body: JSON.stringify(body) });
  },
  chat: (token, body) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/chat/ui', { method: 'POST', headers, body: JSON.stringify(body) }).then(r => r.json());
  },
  // Image — routed to ImageGenerationService (NEVER uses chat endpoint)
  image: (token, body) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/image', { method: 'POST', headers, body: JSON.stringify(body) }).then(r => r.json());
  },
  // Available models list (provider-agnostic, like Gemini/OpenAI models API)
  models: (token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/models', { headers }).then(r => r.json());
  },
  // Settings
  settings: (token) => fetch('/api/ai/settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  saveSettings: (token, data) => fetch('/api/ai/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(r => r.json()),

  // ─── AI Studio — Conversations (Enterprise) ────────────────────────────────
  listConversations: (token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/studio/conversations', { headers }).then(r => r.json());
  },
  createConversation: (token, data) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/studio/conversations', { method: 'POST', headers, body: JSON.stringify(data || {}) }).then(r => r.json());
  },
  updateConversation: (token, id, data) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}`, { method: 'PUT', headers, body: JSON.stringify(data || {}) }).then(r => r.json());
  },
  deleteConversation: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}`, { method: 'DELETE', headers }).then(r => r.json());
  },
  pinConversation: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/pin`, { method: 'POST', headers }).then(r => r.json());
  },
  archiveConv: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/archive`, { method: 'POST', headers }).then(r => r.json());
  },
  restoreConv: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/restore`, { method: 'POST', headers }).then(r => r.json());
  },
  favoriteConv: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/favorite`, { method: 'POST', headers }).then(r => r.json());
  },
  duplicateConv: (token, id) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/duplicate`, { method: 'POST', headers }).then(r => r.json());
  },
  exportConv: (token, id, format = 'json') => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api/ai/studio/conversations/${id}/export/${format}`, { headers }).then(r => r.json());
  },
  clearHistory: (token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch('/api/ai/studio/history', { method: 'DELETE', headers }).then(r => r.json());
  },
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'ui_inspectore_chat_history';
const MAX_HISTORY = 50;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function persistHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY))); } catch {}
}

function makeTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New conversation';
  const text = (first.text || first.content || '').trim();
  return text.length > 48 ? text.slice(0, 48).trimEnd() + '…' : text;
}

function newConversation(messages = []) {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: makeTitle(messages),
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    provider: '',
    model: '',
    remoteId: null, // backend conversation id once synced
  };
}

// Convert a backend conversation to the local shape
function fromRemote(c) {
  return {
    id: `remote-${c.id}`,
    remoteId: c.id,
    title: c.title || 'New Chat',
    messages: [], // loaded lazily
    createdAt: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
    updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : Date.now(),
    isPinned: !!c.is_pinned,
    isFavorite: !!c.is_favorite,
    isArchived: !!c.is_archived,
    provider: c.provider || '',
    model: c.model || '',
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const IMG_ORIGIN = (typeof window !== 'undefined' ? window.location.origin : '');
function resolveImgUrl(url) {
  if (!url) return url;
  if ((url.startsWith('/') && !url.startsWith('//')) || url.startsWith('data:')) return url;
  return IMG_ORIGIN + '/' + url.replace(/^\//, '');
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMsgTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── ROBOT MASCOT ─────────────────────────────────────────────────────────────
function RobotMascot({ isListening = false }) {
  return (
    <div className="relative flex flex-col items-center py-6 px-4">
      {/* Glowing platform */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute -inset-4 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }} />
        {/* Platform */}
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #1a3a4a 0%, #0d1f2d 60%, #060d14 100%)',
            boxShadow: '0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1), inset 0 -4px 12px rgba(0,0,0,0.5)',
            border: '2px solid rgba(34,211,238,0.4)',
          }}>
          {/* Robot body */}
          <svg viewBox="0 0 100 110" width="90" height="99" className="drop-shadow-lg">
            {/* Antenna */}
            <line x1="50" y1="8" x2="50" y2="22" stroke="#5a8a9a" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="6" r="4" fill="#22d3ee" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
              <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Head */}
            <rect x="22" y="20" width="56" height="46" rx="14" fill="url(#headGrad)" />
            <defs>
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8f4f8" />
                <stop offset="100%" stopColor="#b8d4dc" />
              </linearGradient>
            </defs>

            {/* Headphone band */}
            <path d="M22 38 Q22 18 50 18 Q78 18 78 38" fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
            {/* Headphone ear cups */}
            <rect x="14" y="30" width="10" height="18" rx="5" fill="#22d3ee" opacity="0.85" />
            <rect x="76" y="30" width="10" height="18" rx="5" fill="#22d3ee" opacity="0.85" />

            {/* Eyes */}
            <ellipse cx="38" cy="40" rx="7" ry="8" fill="#0d1f2d" />
            <ellipse cx="62" cy="40" rx="7" ry="8" fill="#0d1f2d" />
            <ellipse cx="38" cy="40" rx="4.5" ry="5" fill="#22d3ee" opacity="0.95">
              <animate attributeName="opacity" values="0.95;0.5;0.95" dur="3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="62" cy="40" rx="4.5" ry="5" fill="#22d3ee" opacity="0.95">
              <animate attributeName="opacity" values="0.95;0.5;0.95" dur="3s" repeatCount="indefinite" />
            </ellipse>
            {/* Eye shine */}
            <circle cx="36" cy="38" r="1.5" fill="white" opacity="0.7" />
            <circle cx="60" cy="38" r="1.5" fill="white" opacity="0.7" />

            {/* Smile */}
            <path d="M40 54 Q50 60 60 54" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

            {/* Chest plate */}
            <rect x="35" y="70" width="30" height="24" rx="6" fill="url(#chestGrad)" />
            <defs>
              <linearGradient id="chestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f0f5" />
                <stop offset="100%" stopColor="#a8c8d4" />
              </linearGradient>
            </defs>
            {/* "A" letter on chest */}
            <text x="50" y="86" textAnchor="middle" fontSize="12" fontWeight="700" fill="#22d3ee" fontFamily="Arial Black, Arial">A</text>
          </svg>
        </div>
      </div>

      {/* "I'm listening" speech bubble */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-0 right-0 flex flex-col items-center"
          >
            <div className="relative px-3 py-1.5 rounded-2xl rounded-tl-sm"
              style={{
                background: 'rgba(124,92,255,0.15)',
                border: '1px solid rgba(124,92,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}>
              {/* Sound wave animation */}
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-0.5 rounded-full"
                    style={{
                      height: i % 2 === 0 ? 10 : 16,
                      background: '#22d3ee',
                      animation: `soundwave 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                    }} />
                ))}
              </div>
            </div>
            <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'rgba(156,163,175,0.8)' }}>I'm listening…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── COSMIC BACKGROUND ───────────────────────────────────────────────────────
function CosmicBackground({ children }) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#050510' }}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, #0d1035 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #1a0a30 0%, transparent 40%), radial-gradient(ellipse at 60% 80%, #0a1525 0%, transparent 50%)',
      }} />
      {/* Nebula clouds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c5cff 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #ff6b9d 0%, transparent 70%)', filter: 'blur(80px)' }} />
      {/* Stars — static dots */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 32%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 40% 8%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 85% 60%, rgba(124,92,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 60% 75%, rgba(34,211,238,0.7) 0%, transparent 100%),
          radial-gradient(1px 1px at 80% 85%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.7) 0%, transparent 100%),
          radial-gradient(2px 2px at 48% 55%, rgba(255,107,157,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 72% 48%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 28% 58%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 90% 12%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(1px 1px at 65% 92%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 18% 40%, rgba(34,211,238,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 72%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 42% 22%, rgba(255,255,255,0.7) 0%, transparent 100%)
        `,
      }} />
      {/* Twinkling stars via CSS animation */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(2px 2px at 22% 18%, white 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 67% 35%, rgba(200,200,255,0.9) 0%, transparent 100%),
          radial-gradient(2px 2px at 88% 78%, rgba(200,220,255,0.8) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 12% 88%, white 0%, transparent 100%),
          radial-gradient(2px 2px at 50% 65%, rgba(180,200,255,0.7) 0%, transparent 100%)
        `,
        animation: 'twinkle 4s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes soundwave {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1.2); }
        }
      `}</style>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

// ─── CODE BLOCK ──────────────────────────────────────────────────────────────
function CodeBlock({ children, className, ...props }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  useEffect(() => {
    if (ref.current && match) { ref.current.innerHTML = children; hljs.highlightElement(ref.current); }
  }, [children, match]);

  return (
    <div className="relative group rounded-xl overflow-hidden" style={{ background: '#0d1117' }}>
      {match && (
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #21262d' }}>
          <span className="text-[11px] font-medium" style={{ color: '#8b949e' }}>{match[1]}</span>
          <button onClick={() => { navigator.clipboard.writeText(String(children)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-all"
            style={{ color: copied ? '#3fb950' : '#8b949e', background: 'transparent' }}>
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm"><code ref={ref} className={className}>{children}</code></pre>
    </div>
  );
}

// ─── MARKDOWN ────────────────────────────────────────────────────────────────
function Markdown({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      code({ node, className, children, ...p }) {
        const isInline = !className && !String(children).includes('\n');
        if (isInline) return <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono" style={{ background: 'rgba(124,92,255,0.1)', color: '#c4b5fd' }} {...p}>{children}</code>;
        return <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>;
      },
      a({ href, children }) { return <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: '#9d7aff' }}>{children}</a>; },
      table({ children }) { return <div className="overflow-x-auto"><table className="w-full text-sm border-collapse my-3" style={{ border: '1px solid #2a2a35' }}>{children}</table></div>; },
      th({ children }) { return <th className="text-left px-3 py-2 text-xs font-semibold" style={{ background: '#1a1a26', color: '#9090a8', borderBottom: '1px solid #2a2a35' }}>{children}</th>; },
      td({ children }) { return <td className="px-3 py-2" style={{ color: '#d0d0e0', borderBottom: '1px solid #2a2a35' }}>{children}</td>; },
      ul({ children }) { return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>; },
      ol({ children }) { return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>; },
      blockquote({ children }) { return <blockquote className="border-l-4 pl-4 my-2 italic" style={{ borderColor: '#7c5cff', color: '#9090a8' }}>{children}</blockquote>; },
      h1({ children }) { return <h1 className="text-xl font-bold mt-4 mb-2" style={{ color: '#f0f0fa' }}>{children}</h1>; },
      h2({ children }) { return <h2 className="text-lg font-bold mt-3 mb-2" style={{ color: '#f0f0fa' }}>{children}</h2>; },
      h3({ children }) { return <h3 className="text-base font-semibold mt-2 mb-1" style={{ color: '#f0f0fa' }}>{children}</h3>; },
      p({ children }) { return <p className="my-2 leading-relaxed" style={{ color: '#e0e0f0' }}>{children}</p>; },
      strong({ children }) { return <strong style={{ color: '#f0f0fa' }}>{children}</strong>; },
      em({ children }) { return <em style={{ color: '#c0c0d0' }}>{children}</em>; },
      hr() { return <hr className="my-4" style={{ borderColor: '#2a2a35' }} />; },
    }}>{content}</ReactMarkdown>
  );
}

// ─── MESSAGE ACTIONS ──────────────────────────────────────────────────────────
function MessageActions({ message, onRegenerate, onCopy, copied, onImageClick }) {
  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onRegenerate} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8b9b' }} title="Regenerate">
        <RefreshCw size={11} /> Regenerate
      </button>
      <button onClick={onCopy} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.05)', color: copied ? '#3fb950' : '#8b8b9b' }} title="Copy">
        {copied ? <CheckCheck size={11} /> : <Copy size={11} />} {copied ? 'Copied!' : 'Copy'}
      </button>
      {message.imageUrl && (
        <button onClick={onImageClick} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8b9b' }} title="View fullscreen">
          <Eye size={11} /> View
        </button>
      )}
    </div>
  );
}

// ─── CHAT MESSAGE ─────────────────────────────────────────────────────────────
function ChatMessage({ message, onRegenerate, index, onImageClick }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(message.text || message.content || '').then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #7c5cff, #a855f7)', boxShadow: '0 0 12px rgba(124,92,255,0.4)' }}>
          <User size={13} color="#fff" />
        </div>
      ) : (
        /* Robot avatar icon for AI */
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="14" height="12" rx="3" fill="rgba(34,211,238,0.3)" stroke="#22d3ee" strokeWidth="1.2" />
            <circle cx="9" cy="10" r="1.5" fill="#22d3ee" />
            <circle cx="15" cy="10" r="1.5" fill="#22d3ee" />
            <path d="M9 14 Q12 16 15 14" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <line x1="12" y1="2" x2="12" y2="4" stroke="#5a8a9a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="1.5" r="1" fill="#22d3ee" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {message.imageUrl && (
          <div className="rounded-xl overflow-hidden cursor-pointer group/image relative"
            style={{ maxWidth: 320, background: '#1a1a26', border: '1px solid #2a2a3a' }}
            onClick={() => onImageClick(resolveImgUrl(message.imageUrl))}>
            <img src={resolveImgUrl(message.imageUrl)} alt="Generated" className="w-full object-cover max-h-64" style={{ display: 'block' }} />
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
              <div className="flex flex-col items-center gap-1">
                <Maximize2 size={22} color="#fff" />
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Click to expand</span>
              </div>
            </div>
          </div>
        )}

        {isUser ? (
          <div>
            <div className="px-4 py-3 rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg, #7c5cff, #a855f7)', color: '#fff', borderRadius: '20px 20px 6px 20px', lineHeight: 1.6, boxShadow: '0 4px 16px rgba(124,92,255,0.25)' }}>
              {message.text || message.content}
            </div>
            {/* Attachment display */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`flex gap-2 mt-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                {message.attachments.map((att, i) => {
                  const isImage = att.type?.startsWith('image/') || (att.preview && !att.type);
                  if (isImage && att.preview) {
                    return (
                      <div key={att.id || i} className="relative group rounded-xl overflow-hidden cursor-pointer"
                        style={{ width: 72, height: 72, background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)' }}
                        onClick={() => onImageClick?.(att.preview)}>
                        <img src={att.preview} alt={att.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: 'rgba(0,0,0,0.5)' }}>
                          <Maximize2 size={14} color="#fff" />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={att.id || i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FileText size={12} style={{ color: '#c4b5fd' }} />
                      <span className="max-w-[80px] truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{att.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* AI bubble — dark cosmic style */
          <div className="group rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(14,16,30,0.9)',
              border: '1px solid rgba(124,92,255,0.2)',
              borderRadius: '20px 20px 20px 6px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,92,255,0.05)',
              backdropFilter: 'blur(12px)',
            }}>
            {message.text || message.content ? (
              <div className="text-sm leading-relaxed" style={{ lineHeight: 1.7 }}><Markdown content={message.text || message.content} /></div>
            ) : message.error ? (
              <div className="flex items-start gap-2 text-red-400 text-sm"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{message.error}</span></div>
            ) : null}

            {/* Reaction bar — thumbs up/down + copy + regenerate */}
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 8 }}>
              {/* Volume */}
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }} title="Listen">
                <Volume2 size={11} />
              </button>
              {/* Copy */}
              <button onClick={copyText}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', color: copied ? '#3fb950' : '#6b7280' }} title="Copy">
                {copied ? <CheckCheck size={11} /> : <Copy size={11} />} {copied ? 'Copied!' : 'Copy'}
              </button>
              {/* Regenerate */}
              <button onClick={() => onRegenerate(index)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }} title="Regenerate">
                <RefreshCw size={11} />
              </button>
              {/* Thumbs down */}
              <button
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }} title="Dislike">
                <span style={{ fontSize: 12 }}>👎</span>
              </button>
              {/* Thumbs up */}
              <button
                onClick={() => setLiked(l => !l)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                style={{ background: liked ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)', color: liked ? '#22d3ee' : '#6b7280' }} title="Like">
                <span style={{ fontSize: 12 }}>👍</span>
              </button>
              {/* View image */}
              {message.imageUrl && (
                <button onClick={() => onImageClick(resolveImgUrl(message.imageUrl))}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }} title="View fullscreen">
                  <Eye size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          {!isUser && (message.model || message.provider) && (
            <span className="text-[10px] px-1" style={{ color: '#4a5568' }}>{message.provider} · {message.model}</span>
          )}
          <span className="text-[10px]" style={{ color: '#374151' }}>{formatMsgTime(message.ts)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── LIGHTBOX ───────────────────────────────────────────────────────────────
function Lightbox({ imageUrl, prompt, onClose, onRegenerate }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [zoom, setZoom] = useState(1);

  const zoomIn  = () => setZoom(z => Math.min(z + 0.5, 4));
  const zoomOut = () => setZoom(z => Math.max(z - 0.5, 0.5));
  const zoomReset = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }} onClick={onClose}>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between z-10 px-5 py-4"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', pointerEvents: 'auto' }}
        onClick={e => e.stopPropagation()}>
        {prompt && <p className="text-xs max-w-lg truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{prompt}</p>}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={zoomOut} className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}><ZoomOut size={16} /></button>
          <button onClick={zoomReset} className="px-2 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>{Math.round(zoom * 100)}%</button>
          <button onClick={zoomIn} className="p-2 rounded-lg transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}><ZoomIn size={16} /></button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="p-2 rounded-lg transition-all hover:opacity-70"
              style={{ background: 'rgba(124,92,255,0.3)', color: '#9d7aff' }}><RefreshCw size={16} /></button>
          )}
          <button onClick={onClose} className="p-2 rounded-full transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}><X size={18} /></button>
        </div>
      </div>

      <div className="flex items-center justify-center w-full h-full overflow-auto"
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        onClick={e => { if (zoom <= 1) { e.stopPropagation(); onClose(); } }}
        onWheel={e => { if (e.ctrlKey) { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(4, z - e.deltaY * 0.002))); } }}>
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin" style={{ color: '#9d7aff' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Loading image…</p>
          </div>
        )}
        {imgError && (
          <div className="flex flex-col items-center gap-4 p-10 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <AlertCircle size={36} style={{ color: '#ef4444' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Image failed to load from CDN</p>
            <div className="flex gap-3">
              <a href={resolveImgUrl(imageUrl)} target="_blank" rel="noreferrer" className="text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                <ExternalLink size={13} className="inline mr-1" /> Open URL
              </a>
              {onRegenerate && (
                <button onClick={onRegenerate} className="text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ background: 'rgba(124,92,255,0.4)', color: '#fff' }}>
                  <RefreshCw size={13} className="inline mr-1" /> Regenerate
                </button>
              )}
            </div>
          </div>
        )}
        {!imgError && (
          <img src={resolveImgUrl(imageUrl)} alt="Fullscreen" className="object-contain rounded-xl transition-transform duration-200"
            style={{
              maxWidth: '95vw', maxHeight: '85vh', width: zoom > 1 ? 'auto' : '100%', height: zoom > 1 ? 'auto' : '100%',
              transform: `scale(${zoom})`, transformOrigin: 'center center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              display: imgLoaded ? 'block' : 'none',
              pointerEvents: zoom > 1 ? 'none' : 'auto',
            }}
            onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)}
            onClick={e => { e.stopPropagation(); onClose(); }} />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-5 py-4 z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', pointerEvents: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <a href={resolveImgUrl(imageUrl)} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(8px)' }}>
          <ExternalLink size={13} /> Open
        </a>
        <a href={resolveImgUrl(imageUrl)} download={`ai-image-${Date.now()}.png`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-90"
          style={{ background: 'rgba(124,92,255,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}>
          <Download size={13} /> Download
        </a>
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ──────────────────────────────────────────────────────────
function SettingsPanel({ onClose, onClearHistory }) {
  const token = localStorage.getItem('ui-inspectore_token');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await api.saveSettings(token, {});
    setLoading(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#13131C', border: '1px solid #252535' }}>
        <div className="sticky top-0 z-10 flex items-start justify-between px-6 pt-6 pb-5" style={{ background: '#13131C' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#F0F0FA' }}>Settings</h2>
            <p className="text-xs mt-1" style={{ color: '#6B6B7B' }}>AI is configured server-side</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: '#1C1C28', color: '#8B8B9B' }}><X size={16} /></button>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)' }}><Bot size={12} color="#fff" /></div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium block" style={{ color: '#e0e0f0' }}>MiniMax Chat</span>
              <span className="text-[11px]" style={{ color: '#4a9a7a' }}>MiniMax-M3 · Free via gateway</span>
            </div>
            <CheckCheck size={13} style={{ color: '#4a9a7a' }} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: '#1a1a28', border: '1px solid #2a2a3a' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)' }}><Bot size={12} color="#fff" /></div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium block" style={{ color: '#e0e0f0' }}>MiniMax Image</span>
              <span className="text-[11px]" style={{ color: '#9090a8' }}>image-01 model · server-side</span>
            </div>
            <CheckCheck size={13} style={{ color: '#4a9a7a' }} />
          </div>

          {/* ─── Danger Zone: Clear All History ────────────────────────── */}
          <div className="pt-3 mt-2" style={{ borderTop: '1px solid #252535' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a5a6b' }}>
              Danger Zone
            </p>
            <button onClick={() => { onClose?.(); setTimeout(() => onClearHistory?.(), 100); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
              <span className="flex items-center gap-2">
                <Trash2 size={12} /> Clear All History
              </span>
              <span style={{ color: '#9a3636', fontSize: 10 }}>permanent</span>
            </button>
            <p className="text-[10px] mt-1.5" style={{ color: '#4a4a5b' }}>
              Removes every conversation. You can undo for 30 seconds after.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: '1px solid #252535' }}>
            {saved && <span className="text-xs flex items-center gap-1" style={{ color: '#10a37f' }}><CheckCheck size={11} /> Saved</span>}
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #9D7AFF)', color: '#fff', boxShadow: '0 4px 16px rgba(124,92,255,0.25)' }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
              {loading ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY SIDEBAR ─────────────────────────────────────────────────────────

// ─── Conversation Context Menu (⋮) ────────────────────────────────────────
function ConversationContextMenu({ conv, onClose, onAction, anchorRect }) {
  const [exportOpen, setExportOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const escHandler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [onClose]);

  // Position the menu near the anchor, but flip if it'd clip off-screen
  const top = (anchorRect?.bottom ?? 0) + 4;
  const left = Math.min((anchorRect?.right ?? 0) - 220, (typeof window !== 'undefined' ? window.innerWidth : 1024) - 240);

  const handle = (key) => (e) => {
    e?.stopPropagation?.();
    onAction(key);
    onClose();
  };

  const Item = ({ icon: Icon, label, color = '#c0c0d0', onClick, hoverBg = 'rgba(124,92,255,0.12)', hoverColor = '#fff', shortcut }) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors text-left"
      style={{ color }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color; }}>
      <Icon size={13} />
      <span className="flex-1">{label}</span>
      {shortcut && <span style={{ color: '#5a5a6b', fontSize: 10 }}>{shortcut}</span>}
    </button>
  );

  return (
    <div ref={menuRef}
      className="fixed z-[60] rounded-xl py-1.5"
      style={{
        top,
        left: Math.max(8, left),
        width: 220,
        background: '#13131C',
        border: '1px solid #2a2a3a',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,255,0.06)',
      }}
      onClick={e => e.stopPropagation()}>
      <Item icon={MessageSquare} label="Open" onClick={handle('open')} hoverColor="#9d7aff" />
      <Item icon={Edit3} label="Rename" onClick={handle('rename')} />
      <div style={{ height: 1, background: '#1e1e2a', margin: '4px 0' }} />
      <Item icon={Pin} label={conv.isPinned ? 'Unpin' : 'Pin to top'}
            color={conv.isPinned ? '#9d7aff' : '#c0c0d0'}
            onClick={handle('pin')} hoverColor="#9d7aff" />
      <Item icon={Heart} label={conv.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            color={conv.isFavorite ? '#ef4444' : '#c0c0d0'}
            onClick={handle('favorite')} hoverColor="#ef4444" />
      <Item icon={Copy} label="Duplicate" onClick={handle('duplicate')} hoverColor="#9d7aff" />
      <Item icon={conv.isArchived ? ArchiveRestore : Archive}
            label={conv.isArchived ? 'Restore from archive' : 'Archive'}
            onClick={handle('archive')} />
      <div style={{ position: 'relative' }}>
        <Item icon={DownloadCloud} label="Export" onClick={(e) => { e.stopPropagation(); setExportOpen(o => !o); }} hoverColor="#9d7aff" />
        {exportOpen && (
          <div className="absolute right-full top-0 mr-1 rounded-xl py-1.5"
            style={{ width: 160, background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <Item icon={FileText} label="JSON"   onClick={handle('export-json')} />
            <Item icon={FileText} label="Markdown" onClick={handle('export-md')} />
            <Item icon={FileText} label="HTML"   onClick={handle('export-html')} />
          </div>
        )}
      </div>
      <div style={{ height: 1, background: '#1e1e2a', margin: '4px 0' }} />
      <Item icon={Trash2} label="Delete" color="#ef4444" onClick={handle('delete')}
            hoverBg="rgba(239,68,68,0.12)" hoverColor="#ef4444" />
    </div>
  );
}

// ─── Confirm Dialog (Delete / Clear) ───────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="rounded-2xl p-6 max-w-sm w-full"
        style={{ background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: destructive ? 'rgba(239,68,68,0.12)' : 'rgba(124,92,255,0.12)',
              border: `1px solid ${destructive ? 'rgba(239,68,68,0.25)' : 'rgba(124,92,255,0.25)'}` }}>
            {destructive ? <AlertCircle size={16} style={{ color: '#ef4444' }} /> : <Trash2 size={16} style={{ color: '#9d7aff' }} />}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold" style={{ color: '#f0f0fa' }}>{title}</h3>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#9090a8' }}>{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: '#1a1a26', color: '#9090a8', border: '1px solid #2a2a3a' }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={destructive
              ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 4px 16px rgba(239,68,68,0.25)' }
              : { background: 'linear-gradient(135deg, #7c5cff, #9d7aff)', color: '#fff', boxShadow: '0 4px 16px rgba(124,92,255,0.25)' }}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Undo Toast ────────────────────────────────────────────────────────────
function UndoToast({ item, remaining, onUndo, onDismiss }) {
  if (!item) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="absolute left-3 right-3 bottom-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl z-30"
      style={{ background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 12px 36px rgba(0,0,0,0.55)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
        <Trash2 size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium truncate" style={{ color: '#e0e0f0' }}>
          {item.label || 'Conversation deleted'}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#5a5a6b' }}>
          Undo available · {remaining}s
        </p>
      </div>
      <button onClick={onUndo}
        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90 flex items-center gap-1.5"
        style={{ background: 'rgba(124,92,255,0.15)', color: '#9d7aff', border: '1px solid rgba(124,92,255,0.3)' }}>
        <CornerDownLeft size={11} /> Undo
      </button>
      <button onClick={onDismiss}
        className="p-1 rounded-lg transition-all hover:opacity-70"
        style={{ background: 'transparent', color: '#5a5a6b' }}>
        <X size={11} />
      </button>
    </motion.div>
  );
}

// ─── HISTORY SIDEBAR (Enterprise) ──────────────────────────────────────────
function HistorySidebar({
  history, activeId, onSelect, onNew, collapsed, onToggle,
  sortMode, onSortChange,
  filterMode, onFilterChange,
  onContextAction,
  onClearAll,
  undoItem, undoRemaining, onUndo, onDismissUndo,
  messageCounts, // optional { convId: count } map for sort-by-messages
  isListening = false, // whether the AI is listening (for mascot)
}) {
  const [search, setSearch] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [menuFor, setMenuFor] = useState(null); // conv
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Search & sort ──────────────────────────────────────────────────────
  const filtered = search.trim()
    ? history.filter(c => (c.title || '').toLowerCase().includes(search.toLowerCase()))
    : history;

  // Filter mode: all, archived, favorites, unpinned
  const displayList = filtered.filter(c => {
    if (filterMode === 'archived')  return !!c.isArchived;
    if (filterMode === 'favorites') return !!c.isFavorite;
    if (filterMode === 'unpinned')  return !c.isPinned && !c.isArchived;
    return true; // 'all' — but pinned/favorites handled in their own sections
  });

  // Apply sort
  const sorted = [...displayList].sort((a, b) => {
    if (sortMode === 'oldest')      return (a.updatedAt || 0) - (b.updatedAt || 0);
    if (sortMode === 'alpha')       return (a.title || '').localeCompare(b.title || '');
    if (sortMode === 'messages') {
      const ac = messageCounts?.[a.id] ?? (a.messages?.length || 0);
      const bc = messageCounts?.[b.id] ?? (b.messages?.length || 0);
      return bc - ac;
    }
    return (b.updatedAt || 0) - (a.updatedAt || 0); // recent
  });

  // ─── Grouping ───────────────────────────────────────────────────────────
  const pinned   = sorted.filter(c => c.isPinned && !c.isArchived);
  const favs     = sorted.filter(c => c.isFavorite && !c.isPinned && !c.isArchived);
  const regular  = sorted.filter(c => !c.isPinned && !c.isFavorite && !c.isArchived);
  const archived = sorted.filter(c => c.isArchived);

  const groupByDate = (list) => {
    const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
    list.forEach(c => {
      const d = new Date(c.updatedAt);
      const diffDays = Math.floor((new Date() - d) / 86400000);
      const key = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? 'This Week' : 'Older';
      groups[key].push(c);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  };

  const regularGroups = groupByDate(regular);

  const openMenu = (conv, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuFor(conv);
    setMenuAnchor({ bottom: rect.bottom, right: rect.right });
  };

  const closeMenu = () => { setMenuFor(null); setMenuAnchor(null); };

  const handleMenuAction = (key) => {
    if (!menuFor) return;
    if (key === 'rename') {
      setRenamingId(menuFor.id);
      setRenameValue(menuFor.title);
      closeMenu();
      return;
    }
    onContextAction(key, menuFor);
    closeMenu();
  };

  const commitRename = (id) => {
    onContextAction('rename', { id, title: renameValue });
    setRenamingId(null);
    setRenameValue('');
  };

  // ─── Collapsed state ─────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="shrink-0 flex flex-col items-center py-4 gap-3"
        style={{ width: 56, background: 'rgba(8,8,20,0.85)', borderRight: '1px solid rgba(124,92,255,0.1)', backdropFilter: 'blur(12px)' }}>
        {/* Mini mascot */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="14" height="12" rx="3" fill="rgba(34,211,238,0.3)" stroke="#22d3ee" strokeWidth="1.2" />
            <circle cx="9" cy="10" r="1.5" fill="#22d3ee" />
            <circle cx="15" cy="10" r="1.5" fill="#22d3ee" />
            <path d="M9 14 Q12 16 15 14" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <line x1="12" y1="2" x2="12" y2="4" stroke="#5a8a9a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="1.5" r="1" fill="#22d3ee" />
          </svg>
        </div>
        <button onClick={onNew} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: 'rgba(124,92,255,0.15)', color: '#9d7aff' }} title="New chat">
          <Plus size={18} />
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onToggle} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: '#1a1a26', color: '#8b8b9b' }} title="Show chat history">
          <PanelLeftClose size={16} />
        </button>
      </div>
    );
  }

  // ─── Conversation item renderer ─────────────────────────────────────────
  const renderItem = (conv) => {
    const isActive = activeId === conv.id;
    const isRenaming = renamingId === conv.id;
    return (
      <div key={conv.id}
        className="group relative flex items-start gap-2 px-3 py-2 mx-2 rounded-xl cursor-pointer transition-all"
        style={{
          background: isActive ? 'rgba(124,92,255,0.08)' : 'transparent',
          borderLeft: isActive ? '2px solid #7c5cff' : '2px solid transparent',
        }}
        onClick={() => { if (!isRenaming) onSelect(conv.id); }}>
        <div className="shrink-0 mt-0.5 relative">
          {conv.isFavorite ? (
            <Heart size={12} style={{ color: '#ef4444', fill: '#ef4444' }} />
          ) : (
            <Hash size={12} style={{ color: isActive ? '#9d7aff' : '#4a4a5b' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input autoFocus
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(conv.id);
                if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
              }}
              onBlur={() => commitRename(conv.id)}
              className="w-full text-xs font-medium px-1 py-0.5 rounded outline-none"
              style={{ background: '#1a1a26', border: '1px solid #7c5cff', color: '#e0e0f0' }} />
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                {conv.isPinned && <Pin size={9} style={{ color: '#9d7aff', flexShrink: 0 }} />}
                <p className="text-xs font-medium truncate" style={{ color: isActive ? '#e0e0f0' : '#9090a8' }}>
                  {conv.title}
                </p>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: '#5a5a6b' }}>
                {messageCounts?.[conv.id] ?? conv.messages?.length ?? 0} msg{(messageCounts?.[conv.id] ?? conv.messages?.length ?? 0) !== 1 ? 's' : ''} · {formatTime(conv.updatedAt)}
              </p>
            </>
          )}
        </div>
        {!isRenaming && (
          <button onClick={(e) => openMenu(conv, e)}
            className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:opacity-100"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8b9b' }}
            title="More actions">
            <MoreVertical size={12} />
          </button>
        )}
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, label, count, color = '#5a5a6b' }) => (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
      {Icon && <Icon size={10} style={{ color }} />}
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
      {typeof count === 'number' && (
        <span className="text-[9px] px-1.5 rounded-full" style={{ background: 'rgba(124,92,255,0.12)', color: '#9d7aff' }}>
          {count}
        </span>
      )}
    </div>
  );

  const sortLabel = { recent: 'Recent', oldest: 'Oldest', alpha: 'A–Z', messages: 'Most messages' }[sortMode] || 'Recent';
  const filterLabel = { all: 'All', favorites: 'Favorites', archived: 'Archived', unpinned: 'Unpinned' }[filterMode] || 'All';

  return (
    <div className="shrink-0 relative flex flex-col"
      style={{
        width: 280,
        background: 'rgba(8,8,20,0.75)',
        borderRight: '1px solid rgba(124,92,255,0.1)',
        backdropFilter: 'blur(16px)',
      }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e2a' }}>
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: '#9d7aff' }} />
          <span className="text-xs font-semibold" style={{ color: '#9090a8' }}>History</span>
          {history.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(124,92,255,0.15)', color: '#9d7aff' }}>
              {history.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onNew} className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ background: 'rgba(124,92,255,0.15)', color: '#9d7aff' }} title="New chat">
            <Plus size={14} />
          </button>
          <button onClick={onToggle} className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ background: '#1a1a26', color: '#6b6b7b' }} title="Collapse">
            <PanelLeftClose size={14} />
          </button>
        </div>
      </div>

      {/* ─── Robot Mascot ──────────────────────────────────────────────── */}
      <RobotMascot isListening={isListening} />

      {/* ─── Search ──────────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e1e2a' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: '#1a1a26', border: '1px solid #252535' }}>
            <Search size={12} style={{ color: '#5a5a6b' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="bg-transparent text-xs outline-none flex-1" style={{ color: '#c0c0d0' }} />
            {search && <button onClick={() => setSearch('')} style={{ color: '#5a5a6b' }}><X size={11} /></button>}
          </div>
        </div>
      )}

      {/* ─── Sort & Filter row ───────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ borderBottom: '1px solid #1e1e2a' }}>
          {/* Sort */}
          <div ref={sortRef} className="relative">
            <button onClick={() => { setShowSortMenu(s => !s); setShowFilterMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all hover:opacity-80"
              style={{ background: '#1a1a26', color: '#8b8b9b', border: '1px solid #252535' }}
              title="Sort">
              <SortAsc size={10} /> {sortLabel}
            </button>
            {showSortMenu && (
              <div className="absolute left-0 top-full mt-1 z-30 rounded-xl py-1"
                style={{ minWidth: 140, background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {[
                  { id: 'recent',   label: 'Recent',        icon: Clock3 },
                  { id: 'oldest',   label: 'Oldest',        icon: Clock },
                  { id: 'alpha',    label: 'Alphabetical',  icon: ArrowDownAZ },
                  { id: 'messages', label: 'Most messages', icon: Layers },
                ].map(s => (
                  <button key={s.id}
                    onClick={() => { onSortChange(s.id); setShowSortMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors hover:bg-white/[0.04]"
                    style={{ color: sortMode === s.id ? '#9d7aff' : '#c0c0d0' }}>
                    <s.icon size={11} />
                    <span className="flex-1">{s.label}</span>
                    {sortMode === s.id && <CheckCheck size={10} style={{ color: '#9d7aff' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div ref={filterRef} className="relative">
            <button onClick={() => { setShowFilterMenu(f => !f); setShowSortMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all hover:opacity-80"
              style={{ background: '#1a1a26', color: '#8b8b9b', border: '1px solid #252535' }}
              title="Filter">
              <Filter size={10} /> {filterLabel}
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 top-full mt-1 z-30 rounded-xl py-1"
                style={{ minWidth: 140, background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                {[
                  { id: 'all',       label: 'All',         icon: Inbox },
                  { id: 'favorites', label: 'Favorites',   icon: Heart },
                  { id: 'archived',  label: 'Archived',    icon: Archive },
                  { id: 'unpinned',  label: 'Unpinned',    icon: Pin },
                ].map(f => (
                  <button key={f.id}
                    onClick={() => { onFilterChange(f.id); setShowFilterMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors hover:bg-white/[0.04]"
                    style={{ color: filterMode === f.id ? '#9d7aff' : '#c0c0d0' }}>
                    <f.icon size={11} />
                    <span className="flex-1">{f.label}</span>
                    {filterMode === f.id && <CheckCheck size={10} style={{ color: '#9d7aff' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── List ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.2)' }}>
              <MessageSquare size={18} style={{ color: '#7c5cff' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#6b6b7b' }}>No conversations yet</p>
            <p className="text-[11px] mt-1" style={{ color: '#4a4a5b' }}>Start chatting and they'll appear here</p>
          </div>
        )}

        {history.length > 0 && displayList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-xs" style={{ color: '#6b6b7b' }}>No matches for current filter</p>
            <button onClick={() => onFilterChange('all')}
              className="mt-2 text-[11px] px-3 py-1 rounded-lg"
              style={{ background: 'rgba(124,92,255,0.1)', color: '#9d7aff' }}>
              Reset filter
            </button>
          </div>
        )}

        {/* Pinned section */}
        {pinned.length > 0 && (
          <>
            <SectionHeader icon={Pin} label="Pinned" count={pinned.length} color="#9d7aff" />
            {pinned.map(renderItem)}
          </>
        )}

        {/* Favorites section */}
        {favs.length > 0 && (
          <>
            <SectionHeader icon={Heart} label="Favorites" count={favs.length} color="#ef4444" />
            {favs.map(renderItem)}
          </>
        )}

        {/* Date-grouped regular */}
        {regularGroups.map(([group, convs]) => (
          <div key={group}>
            <SectionHeader icon={Calendar} label={group} count={convs.length} />
            {convs.map(renderItem)}
          </div>
        ))}

        {/* Archived section (only when filter is all) */}
        {filterMode === 'all' && archived.length > 0 && (
          <>
            <SectionHeader icon={Archive} label="Archived" count={archived.length} color="#5a5a6b" />
            {archived.map(renderItem)}
          </>
        )}
      </div>

      {/* ─── Bottom action ────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="p-3" style={{ borderTop: '1px solid #1e1e2a' }}>
          <button onClick={onClearAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-70"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
            <Trash2 size={12} /> Clear all history
          </button>
        </div>
      )}

      {/* Context menu */}
      {menuFor && (
        <ConversationContextMenu conv={menuFor} anchorRect={menuAnchor}
          onClose={closeMenu} onAction={handleMenuAction} />
      )}

      {/* Undo toast */}
      {undoItem && (
        <UndoToast item={undoItem} remaining={undoRemaining}
          onUndo={onUndo} onDismiss={onDismissUndo} />
      )}
    </div>
  );
}

// ─── QUICK ACTIONS ───────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'SQL injection check', prompt: 'Review this code for SQL injection vulnerabilities and suggest fixes' },
  { label: 'React performance', prompt: 'How can I optimize this React component for better performance?' },
  { label: 'XSS vulnerability', prompt: 'Find potential XSS vulnerabilities in this code' },
  { label: 'Auth best practices', prompt: 'What are the authentication best practices for this code?' },
  { label: 'N+1 query fix', prompt: 'Identify and fix N+1 query problems in this code' },
  { label: 'API design review', prompt: 'Review this REST API design for improvements' },
];

// ─── NO-PROVIDER OVERLAY ────────────────────────────────────────────────────────────────────────────────────────
function NoProviderOverlay({ onGoToSettings }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      style={{ background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(16px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(124,92,255,0.06) 100%)',
          border: '1px solid rgba(239,68,68,0.2)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 40px rgba(239,68,68,0.08)',
        }}
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={28} style={{ color: '#ef4444' }} />
        </div>
        <h2 className="text-[20px] font-black text-white mb-2">No AI Provider Available</h2>
        <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
          OpenAI is not configured. Please add an API key in the Admin Settings to enable AI features.
        </p>
        <button
          onClick={onGoToSettings}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
          style={{ background: '#ef4444', color: 'white', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}
        >
          <Settings size={14} />
          Go to AI Settings
        </button>
        <p className="text-[10px] text-gray-600 mt-4">
          All AI features (chat, vision, image generation) are disabled until a provider is configured.
        </p>
      </motion.div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function AIChatPage() {
  const token = localStorage.getItem('ui-inspectore_token');
  const navigate = useNavigate();
  const ai = useAIProvider();
  const currentUser = getUserData();

  const [conv, setConv] = useState(newConversation());
  const [history, setHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxPrompt, setLightboxPrompt] = useState(null);
  const [imageMode, setImageMode] = useState(false);
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageGenerating, setImageGenerating] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('MiniMax-M3');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('general');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ id: null, name: '', provider: 'groq', api_key: '', base_url: '', default_model: '', capabilities: '', is_default: false });
  const [addSaving, setAddSaving] = useState(false);
  const [addShowKey, setAddShowKey] = useState(false);
  const [addError, setAddError] = useState('');
  const [userAgents, setUserAgents] = useState([]);
  const [userAgentsLoading, setUserAgentsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]); // [{file, preview, name, size, type, dataUrl}]
  // ─── Enterprise Conversation Management state ────────────────────────
  const [sortMode, setSortMode]             = useState('recent');     // recent|oldest|alpha|messages
  const [filterMode, setFilterMode]         = useState('all');        // all|favorites|archived|unpinned
  const [undoItem, setUndoItem]             = useState(null);         // { id, snapshot, label, timeoutId, expiresAt }
  const [undoRemaining, setUndoRemaining]   = useState(0);
  const [confirmDialog, setConfirmDialog]   = useState(null);         // { title, message, confirmLabel, destructive, onConfirm }
  const [messageCounts, setMessageCounts]   = useState({});           // { convId: count } for sort
  const fileInputRef = useRef(null);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const selectedModelRef = useRef(selectedModel);
  useEffect(() => { selectedModelRef.current = selectedModel; }, [selectedModel]);

  // Keep refs in sync for use inside async callbacks
  const convRef = useRef(conv);
  const historyRef = useRef([]);
  useEffect(() => { convRef.current = conv; }, [conv]);
  useEffect(() => { historyRef.current = history; }, [history]);

  const messages = conv.messages;

  // Image generation provider info based on selected model
  const imgGenLabel = (() => {
    const entry = availableModels.find(m => m.id === selectedModelRef.current);
    if (!entry) return 'MiniMax image-01';
    if (entry.provider === 'openai') return 'OpenAI DALL-E 3';
    if (entry.isAgent) return `${entry.name} (${entry.provider})`;
    return `${entry.provider?.toUpperCase() || 'MiniMax'} ${entry.model || 'image-01'}`;
  })();

  // Load available models + user agents on mount
  useEffect(() => {
    Promise.all([
      api.models(token),
      token ? fetch('/api/ai/agents', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ agents: [] })) : Promise.resolve({ agents: [] }),
    ]).then(([data, agentData]) => {
      const all = [];

      // System models from API
      if (data?.models) {
        Object.entries(data.models).forEach(([provider, models]) => {
          models.forEach(m => all.push({ ...m, provider, isAgent: false }));
        });
      }

      // User's own agents
      if (agentData?.agents) {
        agentData.agents.forEach(a => {
          if (!a.is_enabled) return;
          const modelName = a.default_model || `${a.provider}/${a.name}`;
          all.push({
            id:           `agent_${a.id}`,
            name:         `${a.name} (${a.provider_label || a.provider})`,
            provider:     a.provider,
            model:        a.default_model,
            capabilities: a.capabilities || [],
            isAgent:      true,
            agentId:      a.id,
            is_default:  a.is_default,
          });
        });
      }

      setAvailableModels(all);

      // Auto-select preferred (user default agent takes priority)
      const defaultAgent = all.find(m => m.is_default);
      const preferredSystem = data?.preferred
        ? all.find(m => !m.isAgent && m.id === data.preferred.model && m.provider === data.preferred.provider)
        : null;
      setSelectedModel((defaultAgent || preferredSystem || all[0])?.id || 'MiniMax-M3');
    }).catch(() => {});
  }, []);

  // Load history
  useEffect(() => {
    const saved = loadHistory();
    setHistory(saved);
    if (saved.length > 0) setConv(saved[0]);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, 50);
  }, []);

  // Update conv and history together
  const updateConv = useCallback((updated) => {
    const next = { ...convRef.current, ...updated, updatedAt: Date.now() };
    setConv(next);
    setHistory(h => {
      const idx = h.findIndex(c => c.id === convRef.current.id);
      if (idx >= 0) { const nh = [...h]; nh[idx] = next; persistHistory(nh); return nh; }
      const nextH = [next, ...h];
      persistHistory(nextH);
      return nextH;
    });
  }, []);

  const stopGeneration = () => { abortRef.current?.abort(); setIsStreaming(false); };

  // ─── ATTACHMENTS ───────────────────────────────────────────────────────────
  const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB per file
  const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total
  const ACCEPTED_TYPES = {
    'image/jpeg': true, 'image/png': true, 'image/gif': true,
    'image/webp': true, 'image/svg+xml': true,
    'text/plain': true, 'text/csv': true,
    'text/html': true, 'text/css': true, 'text/javascript': true,
    'text/markdown': true, 'application/json': true,
    'application/pdf': true,
    // Code files
    'text/x-python': true, 'text/x-java': true, 'text/x-c': true,
    'text/x-c++': true, 'text/x-csharp': true, 'text/x-ruby': true,
    'text/x-php': true, 'text/x-go': true, 'text/x-rust': true,
    'text/x-swift': true, 'text/x-kotlin': true,
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = ''; // Reset input

    // Check total size
    const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0);
    const newTotal = files.reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + newTotal > MAX_TOTAL_SIZE) {
      alert(`Total attachment size exceeds ${MAX_TOTAL_SIZE / 1024 / 1024}MB limit.`);
      return;
    }

    files.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        alert(`${file.name} exceeds ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB limit.`);
        return;
      }
      const isAccepted = ACCEPTED_TYPES[file.type] || file.type.startsWith('text/') || file.name.match(/\.(py|java|c|cpp|h|rb|php|go|rs|swift|kt|js|jsx|ts|tsx|vue|svelte|sql|sh|yaml|yml|toml|ini|csv|md|txt|html|css|json|xml|pdf)$/i);
      if (!isAccepted) {
        alert(`File type not supported: ${file.type || file.name}`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const isImage = file.type.startsWith('image/');
        const newAtt = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl, // base64 data URL
          preview: isImage ? dataUrl : null, // thumbnail for images
        };
        setAttachments(prev => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  // ─── SEND ─────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, msgAttachments = null) => {
    // Use provided attachments or fall back to current state
    const currentAttachments = msgAttachments ?? attachments;
    const hasAttachments = currentAttachments.length > 0;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      ts: Date.now(),
      ...(hasAttachments ? { attachments: currentAttachments } : {}),
    };
    const baseMsgs = convRef.current.messages;
    const newTitle = convRef.current.title === 'New conversation'
      ? makeTitle([...baseMsgs, userMsg]) : convRef.current.title;
    updateConv({ messages: [...baseMsgs, userMsg], title: newTitle });
    setInput('');
    setIsStreaming(true);
    scrollToBottom();

    // Detect if selected model is a user agent
    const selectedId = selectedModelRef.current;
    const isAgent = selectedId.startsWith('agent_');
    const agentId = isAgent ? parseInt(selectedId.replace('agent_', '')) : null;
    const selectedModelEntry = availableModels.find(m => m.id === selectedId);

    const body = {
      ...(agentId ? { agent_id: agentId } : { provider: selectedModelEntry?.provider || 'minimax', model: selectedModelEntry?.id || selectedId }),
      messages: [
        ...baseMsgs.slice(-20).map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text || m.content || '' })),
        { role: 'user', content: text },
      ],
      ...(hasAttachments ? {
        attachments: currentAttachments.map(a => ({
          filename: a.name,
          mime: a.type,
          data: a.dataUrl.split(',')[1], // strip base64 prefix
        })),
      } : {}),
      max_tokens: 2000, temperature: 0.7, user_name: currentUser?.name || null,
    };

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const response = await api.streamChat(token, body);
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', full = '';
      const sid = `a-${Date.now()}`;
      updateConv({ messages: [...convRef.current.messages, { id: sid, role: 'ai', text: '', model: selectedModelRef.current, provider: (isAgent ? (selectedModelEntry?.provider || 'agent') : (selectedModelEntry?.provider || 'minimax')), ts: Date.now() }] });

      while (true) {
        const { done, value } = await reader.read();
        if (done || ctrl.signal.aborted) break;
        try { buffer += decoder.decode(value, { stream: true }); } catch { continue; }
        const lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (const raw of lines) {
          const l = raw.trim();
          if (!l || !l.startsWith('data: ') || l === 'data: [DONE]' || l === 'data: data: [DONE]') continue;
          const data = l.slice(6);
          if (data === '[DONE]') continue;
          try {
            const p = JSON.parse(data);
            if (p.error) { updateConv({ messages: [...convRef.current.messages, { id: sid, role: 'ai', error: p.error, ts: Date.now() }] }); break; }
            if (p.delta !== undefined) {
              full += p.delta;
              updateConv({ messages: [...convRef.current.messages, { id: sid, role: 'ai', text: full, model: selectedModelRef.current, provider: (isAgent ? (selectedModelEntry?.provider || 'agent') : (selectedModelEntry?.provider || 'minimax')), ts: Date.now() }] });
              scrollToBottom();
            }
          } catch {}
        }
        if (ctrl.signal.aborted) break;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          const r = await api.chat(token, body);
          updateConv({ messages: [...convRef.current.messages, { id: `a-${Date.now()}`, role: 'ai', text: r.reply || r.error || 'No response', error: r.error, model: selectedModelRef.current, provider: (isAgent ? (selectedModelEntry?.provider || 'agent') : (selectedModelEntry?.provider || 'minimax')), ts: Date.now() }] });
        } catch {
          updateConv({ messages: [...convRef.current.messages, { id: `e-${Date.now()}`, role: 'ai', error: err.message || 'Request failed', model: selectedModelRef.current, provider: (isAgent ? (selectedModelEntry?.provider || 'agent') : (selectedModelEntry?.provider || 'minimax')), ts: Date.now() }] });
        }
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      scrollToBottom();
      if (hasAttachments) setAttachments([]); // Clear attachments after send
    }
  }, [token, scrollToBottom, updateConv, attachments]);

  // ─── IMAGE ────────────────────────────────────────────────────────────────
  const generateImage = useCallback(async (prompt) => {
    if (!prompt.trim() || imageGenerating) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: prompt, ts: Date.now() };
    const baseMsgs = convRef.current.messages;
    updateConv({ messages: [...baseMsgs, userMsg], title: convRef.current.title === 'New conversation' ? makeTitle([...baseMsgs, userMsg]) : convRef.current.title });
    setInput('');
    setImageGenerating(true);
    scrollToBottom();

    // Detect selected provider/model for image generation
    const selectedId = selectedModelRef.current;
    const selectedEntry = availableModels.find(m => m.id === selectedId);
    const isAgent = selectedId.startsWith('agent_');

    // Determine image provider and model
    let imgProvider = 'minimax';
    let imgModel = 'image-01';
    if (selectedEntry) {
      if (selectedEntry.provider === 'openai' || isAgent && selectedEntry.provider === 'openai') {
        imgProvider = 'openai';
        imgModel = 'dall-e-3';
      } else if (isAgent) {
        // User's custom agent — use its provider
        imgProvider = selectedEntry.provider || 'minimax';
        imgModel = selectedEntry.model || imgModel;
      }
    }

    const svc = new ImageGenerationService(token);
    const result = await svc.generate(prompt, { size: imageSize, n: 1, provider: imgProvider, model: imgModel });

    if (!result.success) {
      updateConv({ messages: [...convRef.current.messages, { id: `e-${Date.now()}`, role: 'ai', error: result.error || 'Image failed.', ts: Date.now() }] });
    } else {
      updateConv({ messages: [...convRef.current.messages, { id: `a-${Date.now()}`, role: 'ai', text: prompt, imageUrl: resolveImgUrl(result.images[0]), model: result.model || imgModel, provider: result.provider || imgProvider, ts: Date.now() }] });
    }
    setImageGenerating(false);
    scrollToBottom();
  }, [token, imageSize, imageGenerating, scrollToBottom, updateConv]);

  const regenerateMessage = (index) => {
    const targetMsg = conv.messages[index];
    if (!targetMsg || targetMsg.role !== 'user') return;
    updateConv({ messages: conv.messages.slice(0, index) });
    setTimeout(() => sendMessage(targetMsg.text || targetMsg.content), 100);
  };

  const loadConversation = (id) => {
    if (!id) { setConv(newConversation()); return; }
    const f = history.find(c => c.id === id);
    if (f) setConv(f);
  };

  // ─── ENTERPRISE: Delete with undo + remote sync ────────────────────────────
  const clearUndoTimer = () => {
    if (undoItem?.timerId) clearTimeout(undoItem.timerId);
  };

  const beginUndoCountdown = (item) => {
    setUndoItem(item);
    setUndoRemaining(30);
    const tick = setInterval(() => {
      setUndoRemaining(r => {
        if (r <= 1) { clearInterval(tick); return 0; }
        return r - 1;
      });
    }, 1000);
    const timerId = setTimeout(() => {
      clearInterval(tick);
      setUndoItem(null);
      setUndoRemaining(0);
    }, 30000);
    // Replace item with one that includes the timerId so we can clear it on undo
    setUndoItem(prev => prev ? { ...prev, timerId } : prev);
  };

  const dismissUndo = () => {
    clearUndoTimer();
    setUndoItem(null);
    setUndoRemaining(0);
  };

  const performDelete = (id, opts = {}) => {
    const target = history.find(c => c.id === id);
    if (!target) return;

    // Snapshot for undo
    const snapshot = { ...target, messages: [...(target.messages || [])] };
    const label = target.title || 'Conversation deleted';

    // Optimistic remove
    setHistory(h => { const nh = h.filter(c => c.id !== id); persistHistory(nh); return nh; });
    if (conv.id === id) {
      const rem = historyRef.current.filter(c => c.id !== id);
      setConv(rem.length > 0 ? rem[0] : newConversation());
    }

    // Remote delete if it has a backend id
    if (target.remoteId && token) {
      api.deleteConversation(token, target.remoteId).catch(() => {
        // Silent fail — item is already gone locally
      });
    }

    // Begin undo window (unless explicitly skipped, e.g. for clearHistory)
    if (!opts.skipUndo) {
      beginUndoCountdown({ snapshot, label });
    }
  };

  const undoDelete = () => {
    if (!undoItem?.snapshot) return;
    const snap = undoItem.snapshot;
    clearUndoTimer();
    setHistory(h => {
      // Re-insert at original position if possible, else prepend
      const exists = h.find(c => c.id === snap.id);
      if (exists) return h;
      const next = [snap, ...h];
      persistHistory(next);
      return next;
    });
    setUndoItem(null);
    setUndoRemaining(0);
  };

  // ─── ENTERPRISE: Context menu handlers ───────────────────────────────────
  const handleSidebarAction = async (action, payload) => {
    const conv = action === 'rename' ? history.find(c => c.id === payload.id) : payload;
    if (!conv && action !== 'rename') return;
    if (action === 'rename' && !payload?.id) return;

    if (action === 'open') {
      loadConversation(conv.id);
      return;
    }

    if (action === 'rename') {
      const newTitle = (payload.title || '').trim();
      if (!newTitle || newTitle === conv?.title) return;
      // Local update first
      setHistory(h => {
        const next = h.map(c => c.id === payload.id ? { ...c, title: newTitle, updatedAt: Date.now() } : c);
        persistHistory(next);
        return next;
      });
      if (conv?.id === convRef.current?.id) {
        setConv(c => ({ ...c, title: newTitle }));
      }
      // Remote update
      if (conv?.remoteId && token) {
        api.updateConversation(token, conv.remoteId, { title: newTitle }).catch(() => {});
      }
      return;
    }

    if (action === 'pin') {
      const newVal = !conv.isPinned;
      setHistory(h => {
        const next = h.map(c => c.id === conv.id ? { ...c, isPinned: newVal } : c);
        persistHistory(next);
        return next;
      });
      if (conv?.remoteId && token) {
        api.pinConversation(token, conv.remoteId).catch(() => {});
      }
      return;
    }

    if (action === 'favorite') {
      const newVal = !conv.isFavorite;
      setHistory(h => {
        const next = h.map(c => c.id === conv.id ? { ...c, isFavorite: newVal } : c);
        persistHistory(next);
        return next;
      });
      if (conv?.remoteId && token) {
        api.favoriteConv(token, conv.remoteId).catch(() => {});
      }
      return;
    }

    if (action === 'archive') {
      const newVal = !conv.isArchived;
      setHistory(h => {
        const next = h.map(c => c.id === conv.id ? { ...c, isArchived: newVal } : c);
        persistHistory(next);
        return next;
      });
      if (conv?.remoteId && token) {
        api.archiveConv(token, conv.remoteId).catch(() => {});
      }
      return;
    }

    if (action === 'restore') {
      setHistory(h => {
        const next = h.map(c => c.id === conv.id ? { ...c, isArchived: false } : c);
        persistHistory(next);
        return next;
      });
      if (conv?.remoteId && token) {
        api.restoreConv(token, conv.remoteId).catch(() => {});
      }
      return;
    }

    if (action === 'duplicate') {
      const dup = {
        ...conv,
        id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: (conv.title || 'Conversation') + ' (Copy)',
        messages: [...(conv.messages || [])],
        isPinned: false, isFavorite: false, isArchived: false,
        createdAt: Date.now(), updatedAt: Date.now(),
        remoteId: null,
      };
      setHistory(h => {
        const next = [dup, ...h];
        persistHistory(next);
        return next;
      });
      if (conv?.remoteId && token) {
        api.duplicateConv(token, conv.remoteId).then(res => {
          if (res?.data?.id) {
            setHistory(h => {
              const next = h.map(c => c.id === dup.id ? { ...c, remoteId: res.data.id } : c);
              persistHistory(next);
              return next;
            });
          }
        }).catch(() => {});
      }
      return;
    }

    if (action === 'delete') {
      setConfirmDialog({
        type: 'delete-one',
        title: 'Delete conversation?',
        message: `"${conv.title}" will be removed. You can undo this from the sidebar for 30 seconds.`,
        confirmLabel: 'Delete',
        destructive: true,
        onConfirm: () => { performDelete(conv.id); setConfirmDialog(null); },
      });
      return;
    }

    // Export variants
    const exportMatch = action?.match(/^export-(json|md|html|markdown)$/);
    if (exportMatch && conv?.remoteId && token) {
      const fmt = exportMatch[1] === 'md' ? 'markdown' : exportMatch[1] === 'markdown' ? 'markdown' : exportMatch[1];
      try {
        const res = await api.exportConv(token, conv.remoteId, fmt);
        if (res?.success) {
          const filename = `${(conv.title || 'conversation').replace(/[^\w\d-]+/g, '_').slice(0, 60)}.${fmt === 'markdown' ? 'md' : fmt}`;
          const blob = new Blob([res.content], { type: fmt === 'html' ? 'text/html' : fmt === 'markdown' ? 'text/markdown' : 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = filename;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } catch (err) {
        console.error('Export failed', err);
      }
      return;
    }

    // Fallback for export without a remote id — export local JSON
    if (action === 'export-json' && !conv?.remoteId) {
      try {
        const data = JSON.stringify({ conversation: conv, messages: conv.messages || [] }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${(conv.title || 'conversation').replace(/[^\w\d-]+/g, '_').slice(0, 60)}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (err) {
        console.error('Export failed', err);
      }
    }
  };

  const performClearHistory = () => {
    // Snapshot current history for potential undo
    const snapshot = history.slice();
    const snapshotCounts = { ...messageCounts };

    setHistory([]);
    persistHistory([]);
    setMessageCounts({});
    setConv(newConversation());

    // Remote clear
    if (token) {
      api.clearHistory(token).catch(() => {});
    }

    // Begin undo window
    beginUndoCountdown({
      snapshot,
      labelCounts: snapshotCounts,
      label: `Cleared ${snapshot.length} conversation${snapshot.length !== 1 ? 's' : ''}`,
      isClearAll: true,
    });
  };

  const requestClearHistory = () => {
    setConfirmDialog({
      type: 'clear-all',
      title: 'Clear all chat history?',
      message: `This will permanently remove all ${history.length} conversation${history.length !== 1 ? 's' : ''}. You can undo from the sidebar for 30 seconds.`,
      confirmLabel: 'Clear everything',
      destructive: true,
      onConfirm: () => { performClearHistory(); setConfirmDialog(null); },
    });
  };

  // Undo for clear history
  const undoClear = () => {
    if (!undoItem?.snapshot) return;
    const snap = undoItem.snapshot;
    clearUndoTimer();
    setHistory(snap);
    persistHistory(snap);
    if (undoItem.labelCounts) setMessageCounts(undoItem.labelCounts);
    setUndoItem(null);
    setUndoRemaining(0);
  };

  // Wrapper that handles both single-delete undo and clear-history undo
  const undoFromToast = () => {
    if (undoItem?.isClearAll) undoClear();
    else undoDelete();
  };

  const startNewChat = () => setConv(newConversation());

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && (input.trim() || attachments.length > 0)) sendMessage(input.trim());
    }
  };

  // ─── ADD AGENT ────────────────────────────────────────────────────────────────
  const loadUserAgents = useCallback(async () => {
    if (!token) return;
    setUserAgentsLoading(true);
    try {
      const res = await fetch('/api/ai/agents', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUserAgents(data.agents || []);
    } catch { setUserAgents([]); }
    finally { setUserAgentsLoading(false); }
  }, [token]);

  // Load agents when modal opens
  useEffect(() => {
    if (showAgentModal) loadUserAgents();
  }, [showAgentModal, loadUserAgents]);

  const openCreateAgent = () => {
    setAddForm({ id: null, name: '', provider: 'groq', api_key: '', base_url: '', default_model: '', capabilities: '', is_default: false });
    setAddError('');
    setShowAddForm(true);
  };

  const openEditAgent = (agent) => {
    setAddForm({
      id: agent.id,
      name: agent.name,
      provider: agent.provider,
      api_key: '',
      base_url: agent.base_url || '',
      default_model: agent.default_model || '',
      capabilities: (agent.capabilities || []).join(', '),
      is_default: agent.is_default,
    });
    setAddError('');
    setShowAddForm(true);
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.provider) return;
    setAddSaving(true);
    setAddError('');
    const payload = {
      name: addForm.name,
      provider: addForm.provider,
      base_url: addForm.base_url || undefined,
      default_model: addForm.default_model || undefined,
      capabilities: addForm.capabilities ? addForm.capabilities.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      is_enabled: true,
      is_default: addForm.is_default,
    };
    if (addForm.api_key.trim()) payload.api_key = addForm.api_key.trim();
    try {
      const url = addForm.id ? `/api/ai/agents/${addForm.id}` : '/api/ai/agents';
      const method = addForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) { setAddError(data.error); }
      else {
        setAddForm({ id: null, name: '', provider: 'groq', api_key: '', base_url: '', default_model: '', capabilities: '', is_default: false });
        setShowAddForm(false);
        await loadUserAgents();
        // Refresh models
        const modelData = await api.models(token);
        const all = [];
        if (modelData?.models) {
          Object.entries(modelData.models).forEach(([provider, models]) => {
            models.forEach(m => all.push({ ...m, provider, isAgent: false }));
          });
        }
        if (modelData?.agents) {
          modelData.agents.forEach(a => {
            if (!a.is_enabled) return;
            all.push({ id: `agent_${a.id}`, name: `${a.name} (${a.provider})`, provider: a.provider, model: a.default_model, isAgent: true, agentId: a.id, is_default: a.is_default });
          });
        }
        setAvailableModels(all);
      }
    } catch (err) {
      setAddError('Failed to save agent: ' + err.message);
    } finally {
      setAddSaving(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!confirm('Delete this agent?')) return;
    await fetch(`/api/ai/agents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await loadUserAgents();
  };

  const handleSetDefaultAgent = async (id) => {
    await fetch(`/api/ai/agents/${id}/default`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    await loadUserAgents();
  };

  const showNoProviderOverlay = !ai.loading && ai.anyAvailable === false;

  return (
    <CosmicBackground>
      {showNoProviderOverlay && (
        <NoProviderOverlay onGoToSettings={() => navigate('/admin/ai-providers')} />
      )}
      <div className="flex" style={{ height: '100vh', pointerEvents: showNoProviderOverlay ? 'none' : 'auto', opacity: showNoProviderOverlay ? 0.3 : 1 }}>
      {/* Sidebar */}
      <HistorySidebar history={history} activeId={conv.id}
        onSelect={loadConversation} onNew={startNewChat}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)}
        sortMode={sortMode} onSortChange={setSortMode}
        filterMode={filterMode} onFilterChange={setFilterMode}
        onContextAction={handleSidebarAction}
        onClearAll={requestClearHistory}
        undoItem={undoItem} undoRemaining={undoRemaining}
        onUndo={undoFromToast} onDismissUndo={dismissUndo}
        messageCounts={messageCounts}
        isListening={isStreaming} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #7c5cff, #ff6b9d, #7c5cff)', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }} />

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: '1px solid rgba(124,92,255,0.1)',
            background: 'rgba(10,10,25,0.7)',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c5cff, #ff6b9d)' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: '#f0f0fa' }}>{conv.title}</h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', animation: 'pulse 2s infinite' }} />
                {availableModels.length > 0 ? (
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="text-xs rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                    style={{ background: '#1e1e2a', color: '#9D7AFF', border: '1px solid #3a3a4a' }}
                  >
                    {Object.entries(
                      availableModels.reduce((acc, m) => {
                        (acc[m.provider] = acc[m.provider] || []).push(m);
                        return acc;
                      }, {})
                    ).map(([provider, models]) => (
                      <optgroup key={provider} label={provider.toUpperCase()}>
                        {models.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.is_default ? '(default)' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs" style={{ color: '#6b6b7b' }}>MiniMax-M3 · Free</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <button onClick={stopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Square size={12} /> Stop
              </button>
            )}
            {/* AI Agents Button */}
            <button onClick={() => setShowAgentModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: AI_AGENTS.find(a => a.id === selectedAgent)?.color + '18',
                color: AI_AGENTS.find(a => a.id === selectedAgent)?.color,
                border: `1px solid ${AI_AGENTS.find(a => a.id === selectedAgent)?.color}40`,
              }}>
              {(() => { const IconC = AI_AGENTS.find(a => a.id === selectedAgent)?.icon; return IconC ? <IconC size={14} /> : null; })()}
              <span className="hidden md:inline">Agents</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(124,92,255,0.08)', color: '#9D7AFF', border: '1px solid rgba(124,92,255,0.15)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c5cff, #9d7aff)' }}>
                  <User size={12} color="#fff" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="font-semibold text-[11px]" style={{ color: '#c0b0ff' }}>{currentUser.name}</span>
                  <span className="text-[10px]" style={{ color: '#7c5cff' }}>{currentUser.email}</span>
                </div>
                <span className="md:hidden font-semibold text-[11px]" style={{ color: '#c0b0ff' }}>{currentUser.name?.split(' ')[0]}</span>
              </div>
            )}

            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(124,92,255,0.1)', color: '#9D7AFF', border: '1px solid rgba(124,92,255,0.2)' }}>
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
          <div className="max-w-3xl mx-auto p-5 space-y-6" style={{ background: 'transparent' }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {/* Robot mascot + greeting */}
                <div className="relative mb-8">
                  <RobotMascot isListening={false} />
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#f0f0fa' }}>Welcome{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''} 👋</h2>
                <p className="text-sm max-w-md mb-6" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  Your AI coding assistant is ready. Ask anything about code, architecture, security, or generate AI images.
                </p>
                <div className="w-full max-w-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(148,163,184,0.5)' }}>Try asking about</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_ACTIONS.map(a => (
                      <button key={a.label}
                        onClick={() => sendMessage(a.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all hover:opacity-80 hover:scale-105"
                        style={{ background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(124,92,255,0.25)', color: 'rgba(200,200,220,0.85)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                        <Zap size={10} style={{ color: '#22d3ee' }} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i}
                onRegenerate={regenerateMessage}
                onImageClick={(url) => {
                  const found = messages.find(m => m.imageUrl === url);
                  setLightboxImage(url);
                  setLightboxPrompt(found?.text || found?.content || '');
                }}
              />
            ))}

            {isStreaming && (
              <div className="flex gap-3">
                {/* Robot avatar */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="4" width="14" height="12" rx="3" fill="rgba(34,211,238,0.3)" stroke="#22d3ee" strokeWidth="1.2" />
                    <circle cx="9" cy="10" r="1.5" fill="#22d3ee" />
                    <circle cx="15" cy="10" r="1.5" fill="#22d3ee" />
                    <path d="M9 14 Q12 16 15 14" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <line x1="12" y1="2" x2="12" y2="4" stroke="#5a8a9a" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="12" cy="1.5" r="1" fill="#22d3ee" />
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(14,16,30,0.9)',
                    border: '1px solid rgba(124,92,255,0.2)',
                    borderRadius: '20px 20px 20px 6px',
                    backdropFilter: 'blur(12px)',
                  }}>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="h-2 w-20 rounded-full animate-pulse" style={{ background: 'rgba(124,92,255,0.2)', animationDelay: '0ms' }} />
                      <div className="h-2 w-16 rounded-full animate-pulse" style={{ background: 'rgba(124,92,255,0.2)', animationDelay: '150ms' }} />
                      <div className="h-2 w-12 rounded-full animate-pulse" style={{ background: 'rgba(124,92,255,0.2)', animationDelay: '300ms' }} />
                    </div>
                    <div className="h-2 w-28 rounded-full animate-pulse" style={{ background: 'rgba(124,92,255,0.2)', animationDelay: '100ms' }} />
                    <div className="h-2 w-20 rounded-full animate-pulse" style={{ background: 'rgba(124,92,255,0.2)', animationDelay: '250ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 p-4"
          style={{
            borderTop: '1px solid rgba(124,92,255,0.08)',
            background: 'rgba(8,8,20,0.6)',
            backdropFilter: 'blur(16px)',
          }}>
          <div className="max-w-3xl mx-auto">
            {/* Mode toggle */}
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => setImageMode(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: !imageMode ? 'linear-gradient(135deg, #7C3AED, #9D7AFF)' : '#1a1a26',
                  border: `1px solid ${!imageMode ? '#7C3AED' : '#2a2a35'}`, color: !imageMode ? '#fff' : '#6B6B7B' }}>
                <MessageSquare size={15} /> AI Chat
              </button>
              <button onClick={() => setImageMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: imageMode ? 'linear-gradient(135deg, #10a37f, #0e8f6c)' : '#1a1a26',
                  border: `1px solid ${imageMode ? '#10a37f' : '#2a2a35'}`, color: imageMode ? '#fff' : '#6B6B7B' }}>
                <ImagePlus size={15} /> Image Gen
              </button>
              {imageMode && (
                <select value={imageSize} onChange={e => setImageSize(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs outline-none ml-2"
                  style={{ background: '#1a1a26', border: '1px solid #10a37f', color: '#10a37f' }}>
                  <option value="1024x1024">1024×1024</option>
                  <option value="1024x1792">1024×1792</option>
                  <option value="1792x1024">1792×1024</option>
                  <option value="512x512">512×512</option>
                </select>
              )}
            </div>

            {imageMode && (
              <div className="mb-3 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                style={{ background: 'rgba(16,163,127,0.1)', border: '1px solid #10a37f', color: '#10a37f' }}>
                <ImagePlus size={13} />
                Describe the image you want — {imgGenLabel} will generate it
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,.html,.css,.js,.jsx,.ts,.tsx,.vue,.svelte,.py,.java,.c,.cpp,.h,.cs,.rb,.php,.go,.rs,.swift,.kt,.sql,.sh,.yaml,.yml,.toml,.ini,.csv,.json,.xml"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment chips */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div key={att.id}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl text-xs"
                    style={{ background: '#1a1a26', border: '1px solid #3a3a4a' }}>
                    {att.preview ? (
                      <img src={att.preview} alt={att.name} className="w-6 h-6 rounded-lg object-cover" />
                    ) : (
                      <FileText size={13} style={{ color: '#9d7aff' }} />
                    )}
                    <span className="max-w-[120px] truncate" style={{ color: '#c0c0d0' }}>{att.name}</span>
                    <span style={{ color: '#5a5a6b' }}>{formatFileSize(att.size)}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="flex items-center justify-center w-5 h-5 rounded-lg transition-all hover:opacity-70"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                      title="Remove"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {attachments.length > 1 && (
                  <button
                    onClick={() => setAttachments([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] transition-all hover:opacity-70"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <Trash2 size={11} /> Clear all
                  </button>
                )}
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={imageMode
                  ? (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!imageGenerating && input.trim()) generateImage(input.trim()); } }
                  : handleKeyDown
                }
                placeholder={imageMode ? 'Describe the image you want to generate…' : 'Ask anything…'}
                rows={1}
                className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none"
                style={{
                  background: 'rgba(15,15,30,0.85)',
                  border: `2px solid ${imageMode ? 'rgba(16,163,127,0.5)' : 'rgba(124,92,255,0.3)'}`,
                  color: '#e0e0f0',
                  maxHeight: 140,
                  overflowY: 'auto',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                }}
              />
              {/* Left icon buttons — paperclip + mic */}
              {!imageMode && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)' }}
                    title="Attach files"
                  >
                    <Paperclip size={16} />
                  </button>
                  <button
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.7)' }}
                    title="Voice input (coming soon)"
                  >
                    <Mic size={16} />
                  </button>
                </>
              )}
              {/* Send / Generate button with sparkles */}
              <button
                onClick={() => {
                  if (imageMode) { if (!imageGenerating && input.trim()) generateImage(input.trim()); }
                  else { if (!isStreaming && (input.trim() || attachments.length > 0)) sendMessage(input.trim()); }
                }}
                disabled={(imageMode ? imageGenerating : isStreaming) || !(input.trim() || (!imageMode && attachments.length > 0))}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-90"
                style={{
                  background: imageMode
                    ? 'linear-gradient(135deg, #10a37f, #0e8f6c)'
                    : 'linear-gradient(135deg, #7c5cff, #22d3ee)',
                  boxShadow: imageMode
                    ? '0 4px 16px rgba(16,163,127,0.3)'
                    : '0 4px 16px rgba(124,92,255,0.3)',
                }}>
                {imageMode
                  ? (imageGenerating ? <Loader2 size={16} className="animate-spin" color="#fff" /> : <Sparkles size={16} color="#fff" />)
                  : (isStreaming ? <Loader2 size={16} className="animate-spin" color="#fff" /> : <Sparkles size={16} color="#fff" />)
                }
              </button>
            </div>
            <p className="text-[11px] text-center mt-2" style={{ color: 'rgba(148,163,184,0.4)' }}>
              {imageMode ? `✨ ${imgGenLabel} · Native AI, no web search` : 'MiniMax-M3 · Free via gateway · responses may be inaccurate'}
            </p>
          </div>
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} onClearHistory={requestClearHistory} />}

      {/* AI Agents Modal — Full Agent Manager */}
      {showAgentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => { setShowAgentModal(false); setShowAddForm(false); }}
        >
          <div
            className="rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            style={{ background: '#13131C', border: '1px solid #2a2a3a', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{ background: 'rgba(124,92,255,0.2)' }}>
                  <Bot size={18} style={{ color: '#9D7AFF' }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: '#f0f0fa' }}>AI Agents</h2>
                  <p className="text-[11px]" style={{ color: '#6b6b7b' }}>Manage agents — built-in & custom</p>
                </div>
              </div>
              <button onClick={() => { setShowAgentModal(false); setShowAddForm(false); }}
                className="p-2 rounded-lg cursor-pointer transition-all hover:opacity-70"
                style={{ background: '#1a1a26' }}>
                <X size={16} style={{ color: '#6b6b7b' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">

              {/* ── Agent Form (add / edit) ── */}
              {showAddForm ? (
                <form onSubmit={handleAddAgent} className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: '#9D7AFF' }}>
                      {addForm.id ? 'Edit Agent' : 'New Agent'}
                    </h3>
                    <button type="button" onClick={() => { setShowAddForm(false); setAddError(''); }}
                      className="text-[11px] px-3 py-1 rounded-lg cursor-pointer transition-all hover:opacity-70"
                      style={{ background: '#1a1a26', color: '#6b6b7b', border: '1px solid #2a2a3a' }}>
                      Cancel
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>Agent Name *</label>
                      <input value={addForm.name}
                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. My SEO Assistant" required
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }} />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>Provider *</label>
                      <select value={addForm.provider}
                        onChange={e => setAddForm(f => ({ ...f, provider: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }}>
                        <option value="openai">OpenAI</option><option value="groq">Groq</option>
                        <option value="anthropic">Anthropic</option><option value="gemini">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option><option value="deepseek">DeepSeek</option>
                        <option value="mistral">Mistral AI</option><option value="ollama">Ollama</option>
                        <option value="xai">xAI</option><option value="azure">Azure OpenAI</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>API Key {addForm.id ? '(leave blank to keep existing)' : ''}</label>
                      <div className="relative">
                        <input type={addShowKey ? 'text' : 'password'} value={addForm.api_key}
                          onChange={e => setAddForm(f => ({ ...f, api_key: e.target.value }))}
                          placeholder={addForm.id ? '••••••••' : 'sk-...'}
                          className="w-full rounded-xl px-3 py-2 pr-9 text-sm outline-none"
                          style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }} />
                        <button type="button" onClick={() => setAddShowKey(v => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer">
                          {addShowKey ? <EyeOff size={13} style={{ color: '#6b6b7b' }} />
                            : <Eye size={13} style={{ color: '#6b6b7b' }} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>Base URL <span style={{ color: '#4a4a5b' }}>(optional)</span></label>
                      <input value={addForm.base_url}
                        onChange={e => setAddForm(f => ({ ...f, base_url: e.target.value }))}
                        placeholder="https://api.openai.com/v1"
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }} />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>Default Model</label>
                      <input value={addForm.default_model}
                        onChange={e => setAddForm(f => ({ ...f, default_model: e.target.value }))}
                        placeholder="gpt-4o / llama-3.3-70b-versatile"
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }} />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: '#6b6b7b' }}>Capabilities <span style={{ color: '#4a4a5b' }}>(comma-separated)</span></label>
                      <input value={addForm.capabilities}
                        onChange={e => setAddForm(f => ({ ...f, capabilities: e.target.value }))}
                        placeholder="chat, image, code"
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ background: '#1a1a26', border: '1px solid #2a2a3a', color: '#e0e0f0' }} />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setAddForm(f => ({ ...f, is_default: !f.is_default }))}
                        className="relative w-9 h-5 rounded-full transition-all cursor-pointer"
                        style={{ background: addForm.is_default ? '#7c5cff' : '#2a2a3a' }}>
                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                          style={{ left: addForm.is_default ? '18px' : '2px' }} />
                      </div>
                      <span className="text-xs" style={{ color: '#9090a8' }}>Set as default for new chats</span>
                    </label>

                    {addError && (
                      <div className="text-[11px] px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {addError}
                      </div>)}

                    <button type="submit" disabled={addSaving || !addForm.name}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #7c5cff, #9D7AFF)', color: '#fff' }}>
                      {addSaving
                        ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                        : <><Plus size={14} /> {addForm.id ? 'Update Agent' : 'Add Agent'}</>}
                    </button>

                    <div className="flex items-start gap-2 pt-1">
                      <Shield size={11} style={{ color: '#6b6b7b' }} className="shrink-0 mt-0.5" />
                      <p className="text-[10px]" style={{ color: '#4a4a5b', lineHeight: 1.5 }}>
                        API keys are encrypted and only decrypted when making requests.
                      </p>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {/* + Add Agent button */}
                  <button onClick={openCreateAgent}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl mb-3 cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'rgba(124,92,255,0.08)', border: '1px dashed rgba(124,92,255,0.3)', color: '#9D7AFF' }}>
                    <Plus size={15} /><span className="text-xs font-medium">Add New Agent</span>
                  </button>

                  {/* Loading */}
                  {userAgentsLoading && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={20} className="animate-spin" style={{ color: '#7c5cff' }} />
                    </div>
                  )}

                  {/* Built-in Agents */}
                  {!userAgentsLoading && (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a4a5b' }}>Built-in</p>
                      <div className="flex flex-col gap-1.5 mb-4">
                        {AI_AGENTS.map(agent => {
                          const isActive = agent.id === selectedAgent;
                          return (
                            <button key={agent.id}
                              onClick={() => { setSelectedAgent(agent.id); setShowAgentModal(false); }}
                              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-lg"
                              style={{ background: isActive ? agent.color + '12' : '#1a1a26', borderColor: isActive ? agent.color : '#2a2a3a', borderWidth: isActive ? '2px' : '1px' }}>
                              <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                                style={{ background: agent.color + '20' }}>
                                <agent.icon size={18} style={{ color: agent.color }} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-xs font-semibold" style={{ color: isActive ? agent.color : '#f0f0fa' }}>{agent.name}</span>
                              </div>
                              {isActive
                                ? <CheckCircle size={14} style={{ color: agent.color }} />
                                : <ChevronDown size={14} style={{ color: '#4a4a5b' }} className="rotate-[-90deg]" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* User Agents */}
                      {userAgents.length > 0 && (
                        <>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#4a4a5b' }}>My Agents</p>
                          <div className="flex flex-col gap-1.5 mb-2">
                            {userAgents.map(agent => {
                              const isActive = agent.is_default;
                              const agentColor = '#9D7AFF';
                              return (
                                <div key={agent.id}
                                  className="flex items-center gap-2 p-3 rounded-xl border"
                                  style={{ background: isActive ? 'rgba(124,92,255,0.08)' : '#1a1a26', borderColor: isActive ? agentColor : '#2a2a3a', borderWidth: isActive ? '2px' : '1px' }}>
                                  {/* Icon */}
                                  <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                                    style={{ background: agentColor + '20' }}>
                                    <Bot size={15} style={{ color: agentColor }} />
                                  </div>

                                  {/* Info */}
                                  <button
                                    onClick={() => { setSelectedAgent(`agent_${agent.id}`); setShowAgentModal(false); }}
                                    className="flex-1 text-left cursor-pointer">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold" style={{ color: isActive ? agentColor : '#f0f0fa' }}>{agent.name}</span>
                                      {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: agentColor + '25', color: agentColor }}>Default</span>}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Globe size={9} style={{ color: '#4a4a5b' }} />
                                      <span className="text-[10px]" style={{ color: '#6b6b7b' }}>{agent.provider}</span>
                                      {agent.default_model && <><span style={{ color: '#4a4a5b' }}>·</span><span className="text-[10px]" style={{ color: '#4a4a5b' }}>{agent.default_model}</span></>}
                                    </div>
                                  </button>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {!agent.is_default && (
                                      <button onClick={() => handleSetDefaultAgent(agent.id)}
                                        className="p-1.5 rounded-lg cursor-pointer transition-all hover:opacity-70"
                                        title="Set as default"
                                        style={{ background: 'transparent', color: '#4a4a5b' }}>
                                        <Star size={12} />
                                      </button>
                                    )}
                                    <button onClick={() => openEditAgent(agent)}
                                      className="p-1.5 rounded-lg cursor-pointer transition-all hover:opacity-70"
                                      title="Edit"
                                      style={{ background: 'transparent', color: '#4a4a5b' }}>
                                      <Edit3 size={12} />
                                    </button>
                                    <button onClick={() => handleDeleteAgent(agent.id)}
                                      className="p-1.5 rounded-lg cursor-pointer transition-all hover:opacity-70"
                                      title="Delete"
                                      style={{ background: 'transparent', color: '#ef4444' }}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {userAgents.length === 0 && !userAgentsLoading && token && (
                        <p className="text-[11px] text-center py-3" style={{ color: '#4a4a5b' }}>
                          No custom agents yet. Add one to get started.
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <Lightbox imageUrl={lightboxImage} prompt={lightboxPrompt}
          onClose={() => { setLightboxImage(null); setLightboxPrompt(null); }}
          onRegenerate={lightboxPrompt ? (() => { const p = lightboxPrompt; setLightboxImage(null); setLightboxPrompt(null); generateImage(p); }) : undefined}
        />
      )}

      {/* Enterprise — Confirm Dialog (Delete / Clear History) */}
      {confirmDialog && (
        <ConfirmDialog
          open={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          destructive={confirmDialog.destructive}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      </div>
    </CosmicBackground>
  );
}
