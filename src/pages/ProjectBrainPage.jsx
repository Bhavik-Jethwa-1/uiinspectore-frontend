import { useState, useEffect, useRef } from 'react';
import {
  Brain, Upload, FileText, Image, Link2, Send, Sparkles,
  Bot, User, Loader2, Trash2, Plus, Network, Layers,
  File, Search, Zap, ChevronRight, Archive,
} from 'lucide-react';

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Dashboard Redesign', color: '#7c5cff', files: 12, nodes: 24 },
  { id: 'p2', name: 'Mobile App v2', color: '#ff6b9d', files: 8, nodes: 18 },
  { id: 'p3', name: 'E-commerce Web', color: '#60a5fa', files: 21, nodes: 37 },
];

const DEMO_FILES = [
  { id: 'f1', name: 'screenshot-dashboard.png', type: 'image', size: '2.4 MB', status: 'indexed' },
  { id: 'f2', name: 'user-flows.pdf', type: 'doc', size: '890 KB', status: 'indexed' },
  { id: 'f3', name: 'wireframes.fig', type: 'design', size: '4.1 MB', status: 'indexed' },
  { id: 'f4', name: 'meeting-notes.md', type: 'doc', size: '12 KB', status: 'indexed' },
];

const DEMO_NODES = [
  { id: 'n1', label: 'Login Screen', color: '#7c5cff', rels: 5, type: 'screen' },
  { id: 'n2', label: 'Dashboard Overview', color: '#60a5fa', rels: 8, type: 'screen' },
  { id: 'n3', label: 'User Profile', color: '#34d399', rels: 3, type: 'screen' },
  { id: 'n4', label: 'Navigation Flow', color: '#f59e0b', rels: 6, type: 'concept' },
  { id: 'n5', label: 'Settings Panel', color: '#ff6b9d', rels: 2, type: 'screen' },
  { id: 'n6', label: 'Data Visualisation', color: '#a78bfa', rels: 4, type: 'concept' },
];

const DEMO_CONNECTIONS = [
  { from: 'Login Screen', to: 'Dashboard Overview' },
  { from: 'Dashboard Overview', to: 'User Profile' },
  { from: 'Dashboard Overview', to: 'Navigation Flow' },
  { from: 'User Profile', to: 'Settings Panel' },
  { from: 'Dashboard Overview', to: 'Data Visualisation' },
  { from: 'Login Screen', to: 'Navigation Flow' },
];

const DEMO_MESSAGES = [
  {
    id: 'm1',
    role: 'ai',
    text: 'Project brain ready. I\'ve indexed 12 files — 4 screenshots, 6 design notes, 2 user flows. Ask me anything about this project.',
    ts: Date.now() - 60000,
  },
];

const DEMO_REPLIES = [
  'Based on the uploaded screenshots, your dashboard uses a 3-column layout with consistent 16px spacing. The navigation pattern follows a sidebar → content → detail flow.',
  'I found 3 related screens: Dashboard Overview, User Profile, and Settings Panel — all share the same purple accent color (#7c5cff) and similar card-based layout.',
  'Your wireframes mention a "quick actions" pattern in the header. This connects to the floating action button in the mobile screenshots — a consistency issue to review.',
  'The user flow document shows 5 entry points into the dashboard. I can see the login → dashboard path is the primary one, with 3 secondary shortcuts from the sidebar.',
];

let msgId = 10;

export default function ProjectBrainPage() {
  const [activeProject, setActiveProject] = useState('p1');
  const [files, setFiles] = useState(DEMO_FILES);
  const [nodes, setNodes] = useState(DEMO_NODES);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollerRef = useRef(null);

  const project = DEMO_PROJECTS.find((p) => p.id === activeProject) || DEMO_PROJECTS[0];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages]);

  const doSend = () => {
    const trimmed = input.trim();
    if (!trimmed || thinking) return;
    const userMsg = { id: 'u-' + (msgId++), role: 'user', text: trimmed, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
      setMessages((m) => [...m, { id: 'a-' + (msgId++), role: 'ai', text: reply, ts: Date.now() }]);
      setThinking(false);
    }, 1400 + Math.random() * 700);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const newNodes = [
        ...DEMO_NODES,
        { id: 'n7', label: 'Analytics View', color: '#f59e0b', rels: 3, type: 'screen' },
        { id: 'n8', label: 'Color System', color: '#34d399', rels: 7, type: 'concept' },
      ];
      setNodes(newNodes);
      setAnalyzing(false);
      setMessages((m) => [...m, {
        id: 'a-' + (msgId++),
        role: 'ai',
        text: 'Analysis complete. I found 8 nodes and 35 connections across your project. New patterns discovered: a consistent color system and 2 new screens you hadn\'t linked yet.',
        ts: Date.now(),
      }]);
    }, 2800);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getFileIcon = (type) => {
    if (type === 'image') return Image;
    if (type === 'design') return Layers;
    return FileText;
  };

  const totalRels = nodes.reduce((acc, n) => acc + n.rels, 0);

  return (
    <div className="module-page pb-page">

      {/* Hero */}
      <div className="pb-hero">
        <div className="pb-hero-badge">
          <Brain size={11} /> Project Brain · AI Knowledge Graph
        </div>
        <h1 className="pb-hero-title">
          Your project's <span>connected brain</span>
        </h1>
        <p className="pb-hero-sub">
          Drop your designs, notes, and screenshots — AI reads everything, maps every connection,
          and answers questions across your entire project in seconds.
        </p>
        <div className="pb-projects-bar">
          {DEMO_PROJECTS.map((p) => (
            <button
              key={p.id}
              className={`pb-project-chip ${activeProject === p.id ? 'active' : ''}`}
              onClick={() => setActiveProject(p.id)}
              style={activeProject === p.id ? { borderColor: p.color, boxShadow: `0 0 14px ${p.color}33` } : {}}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="pb-layout">

        {/* LEFT — Upload & Files */}
        <div className="pb-upload-panel">
          <div className="pb-panel-head">
            <div className="pb-panel-title">
              <Archive size={14} color="#a78bfa" />
              Project Files
            </div>
            <span className="pb-panel-count">{files.length}</span>
          </div>

          {/* Drop Zone */}
          <div
            className={`pb-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
          >
            <div className="pb-drop-icon">
              <Upload size={18} />
            </div>
            <div className="pb-drop-text">Drop files here</div>
            <div className="pb-drop-sub">PNG · JPG · PDF · MD · Figma</div>
          </div>

          {/* File List */}
          <div className="pb-file-list">
            {files.map((f) => {
              const Icon = getFileIcon(f.type);
              return (
                <div key={f.id} className="pb-file-item">
                  <div className="pb-file-icon">
                    <Icon size={14} />
                  </div>
                  <div className="pb-file-info">
                    <div className="pb-file-name">{f.name}</div>
                    <div className="pb-file-meta">{f.size} · {f.status}</div>
                  </div>
                  <button className="pb-file-del">
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Analyze Button */}
          <button
            className="pb-analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Build Knowledge Graph
              </>
            )}
          </button>

          {/* Brain Stats */}
          <div className="pb-brain-stats">
            <div className="pb-stat-card">
              <div className="pb-stat-num">{nodes.length}</div>
              <div className="pb-stat-label">Nodes</div>
            </div>
            <div className="pb-stat-card">
              <div className="pb-stat-num">{totalRels}</div>
              <div className="pb-stat-label">Connections</div>
            </div>
            <div className="pb-stat-card">
              <div className="pb-stat-num">{files.length}</div>
              <div className="pb-stat-label">Files</div>
            </div>
            <div className="pb-stat-card">
              <div className="pb-stat-num">3</div>
              <div className="pb-stat-label">Concepts</div>
            </div>
          </div>
        </div>

        {/* CENTER — Knowledge Graph */}
        <div className="pb-graph-panel">
          <div className="pb-panel-head">
            <div className="pb-panel-title">
              <Network size={14} color="#a78bfa" />
              Knowledge Graph
            </div>
            <span className="pb-panel-count">{nodes.length} nodes</span>
          </div>
          <div className="pb-graph-body">
            {/* Nodes */}
            {nodes.map((node) => (
              <div key={node.id} className="pb-node">
                <div className="pb-node-dot" style={{ background: node.color }} />
                <div className="pb-node-label">{node.label}</div>
                <div className="pb-node-rels">{node.rels} links</div>
                <ChevronRight size={12} style={{ color: 'rgba(124,92,255,0.3)' }} />
              </div>
            ))}

            {/* Connections */}
            <div className="pb-connections">
              {DEMO_CONNECTIONS.slice(0, Math.min(nodes.length - 1, 5)).map((c, i) => (
                <div key={i} className="pb-conn">
                  <div className="pb-conn-dot" />
                  <span style={{ fontSize: '10.5px' }}>{c.from}</span>
                  <ChevronRight size={9} style={{ color: 'rgba(124,92,255,0.3)' }} />
                  <span style={{ fontSize: '10.5px' }}>{c.to}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(124,92,255,0.1)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                {nodes.length} screens & concepts · {totalRels} connections mapped
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Chat */}
        <div className="pb-chat-panel">
          <div className="pb-panel-head">
            <div className="pb-panel-title">
              <Bot size={14} color="#a78bfa" />
              Project Chat
            </div>
          </div>

          <div className="pb-chat-msgs" ref={scrollerRef}>
            {messages.map((m) => (
              <div key={m.id} className={`pb-chat-msg ${m.role}`}>
                <div className={`pb-chat-av ${m.role}`}>
                  {m.role === 'ai' ? <Bot size={10} /> : <User size={10} />}
                </div>
                <div className={`pb-chat-bub ${m.role}`}>
                  {m.text.split('\n').map((l, i) => <p key={i} style={{ margin: 0 }}>{l}</p>)}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="pb-chat-msg ai">
                <div className="pb-chat-av ai"><Bot size={10} /></div>
                <div className="pb-chat-bub ai">
                  <div className="pb-thinking">
                    <div className="pb-dots"><span /><span /><span /></div>
                    Thinking…
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="pb-quick-qs">
            {[
              'Show all screens',
              'Find inconsistencies',
              'Color palette used',
              'Navigation flow',
            ].map((q) => (
              <button key={q} className="pb-quick-q" onClick={() => setInput(q)}>
                <Sparkles size={8} /> {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="pb-chat-input-row">
            <textarea
              className="pb-chat-input"
              placeholder="Ask about this project…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } }}
              rows={1}
            />
            <button className="pb-chat-send" onClick={doSend} disabled={!input.trim() || thinking}>
              <Send size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* How It Works */}
      <div className="pb-how">
        <h2 className="pb-how-title">How it works</h2>
        <div className="pb-how-steps">
          <div className="pb-how-step">
            <div className="pb-how-num">1</div>
            <div className="pb-how-step-title">
              <Upload size={13} style={{ display: 'inline', marginRight: '5px', color: '#7c5cff' }} />
              Upload
            </div>
            <div className="pb-how-step-desc">
              Drop screenshots, design files, PDFs, and notes. Any format — AI reads it all.
            </div>
          </div>
          <div className="pb-how-step">
            <div className="pb-how-num">2</div>
            <div className="pb-how-step-title">
              <Sparkles size={13} style={{ display: 'inline', marginRight: '5px', color: '#7c5cff' }} />
              Index
            </div>
            <div className="pb-how-step-desc">
              AI processes every file, extracts components, patterns, and relationships automatically.
            </div>
          </div>
          <div className="pb-how-step">
            <div className="pb-how-num">3</div>
            <div className="pb-how-step-title">
              <Network size={13} style={{ display: 'inline', marginRight: '5px', color: '#7c5cff' }} />
              Connect
            </div>
            <div className="pb-how-step-desc">
              Nodes are created for every screen, component, and concept — linked by relationships.
            </div>
          </div>
          <div className="pb-how-step">
            <div className="pb-how-num">4</div>
            <div className="pb-how-step-title">
              <Bot size={13} style={{ display: 'inline', marginRight: '5px', color: '#7c5cff' }} />
              Ask
            </div>
            <div className="pb-how-step-desc">
              Chat with your project brain. Find inconsistencies, get explanations, trace any flow.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
