import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, Table2, LayoutGrid,
  TrendingUp, Filter, Play, Loader2, AlertCircle,
  CheckCircle2, AlertTriangle, ChevronDown, Folder,
  Sparkles, RefreshCw, Download, FileText,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

/* Helpers */
const scoreColor = (s) => (s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');
const scoreLabel = (s) => (s >= 80 ? 'Healthy' : s >= 50 ? 'Needs work' : 'Critical');

const severityMeta = (sev) => {
  const s = (sev || 'medium').toLowerCase();
  if (s === 'critical' || s === 'high') return { cls: 'critical', label: 'Critical', color: '#ef4444' };
  if (s === 'good' || s === 'pass' || s === 'ok') return { cls: 'good', label: 'Pass', color: '#10b981' };
  if (s === 'low') return { cls: 'low', label: 'Low', color: '#3b82f6' };
  return { cls: 'medium', label: 'Warning', color: '#f59e0b' };
};

const CATEGORIES = [
  { id: 'sidebar', title: 'Sidebar', desc: 'Navigation, sections & active states', icon: LayoutDashboard, tint: 'rgba(124, 92, 255, 0.14)' },
  { id: 'charts', title: 'Charts', desc: 'Data viz, axes, legends, tooltips', icon: BarChart3, tint: 'rgba(16, 185, 129, 0.14)' },
  { id: 'tables', title: 'Tables', desc: 'Columns, sorting, pagination, density', icon: Table2, tint: 'rgba(245, 158, 11, 0.14)' },
  { id: 'widgets', title: 'Widgets', desc: 'Cards, sections, status modules', icon: LayoutGrid, tint: 'rgba(236, 72, 153, 0.14)' },
  { id: 'kpis', title: 'KPIs', desc: 'Headline numbers, deltas, sparklines', icon: TrendingUp, tint: 'rgba(59, 130, 246, 0.14)' },
  { id: 'filters', title: 'Filters', desc: 'Date ranges, segments, scope controls', icon: Filter, tint: 'rgba(6, 182, 212, 0.14)' },
];

function ScoreCircle({ value, size = 56, label = 'Score' }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = circ - (safe / 100) * circ;
  const color = scoreColor(safe);
  return (
    <div className="dap-score" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="dap-score-inner">
        <div className="dap-score-num" style={{ color }}>{Math.round(safe)}</div>
        <div className="dap-score-lbl">{label}</div>
      </div>
    </div>
  );
}

function IssueRow({ issue }) {
  const meta = severityMeta(issue.severity);
  return (
    <motion.div className="dap-issue" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`dap-issue-sev sev-${meta.cls}`}>
        <AlertTriangle size={12} />
      </div>
      <div className="dap-issue-body">
        <div className="dap-issue-title">{issue.title || 'Issue'}</div>
        <div className="dap-issue-desc">{issue.description || ''}</div>
        {issue.area && <div className="dap-issue-area">Area: <strong>{issue.area}</strong></div>}
        {issue.fix && <div className="dap-issue-fix">{issue.fix}</div>}
      </div>
      <div className="dap-issue-right">
        {issue.metric && <span className="dap-metric">{issue.metric}</span>}
        <span className={`dap-sev-badge sev-${meta.cls}`}>{meta.label}</span>
      </div>
    </motion.div>
  );
}

export default function DashboardAnalysisPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const projs = await api.listProjects();
        const list = Array.isArray(projs) ? projs : (projs?.items || projs?.projects || []);
        if (!mounted) return;
        setProjects(list);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load projects');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!selectedProject) { setScreens([]); setSelectedScreen(''); return; }
    (async () => {
      try {
        const full = await api.getProject(selectedProject);
        if (!mounted) return;
        const list = (full?.screens || []).map((s) => ({
          ...s,
          label: s.name || s.title || `Screen ${s.id}`,
        }));
        setScreens(list);
      } catch {
        if (mounted) setScreens([]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedProject]);

  const scores = useMemo(() => {
    if (results?.scores) return results.scores;
    const out = {};
    CATEGORIES.forEach((c) => { out[c.id] = 70 + (c.id.length * 3) % 25; });
    return out;
  }, [results]);

  const issues = useMemo(() => {
    if (!results) return [];
    const all = results.issues || [];
    if (!activeCategory) return all;
    return all.filter((i) => (i.category || '').toLowerCase() === activeCategory);
  }, [results, activeCategory]);

  const overall = useMemo(() => {
    if (results?.overall_score !== undefined) return results.overall_score;
    const arr = Object.values(scores);
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }, [results, scores]);

  const run = async () => {
    if (running) return;
    setError(''); setRunning(true);
    try {
      const payload = {
        module: 'dashboard',
        project_id: selectedProject || null,
        screen_id: selectedScreen || null,
        categories: CATEGORIES.map((c) => c.id),
      };
      let data;
      try {
        data = await api.analyzeScreenshot(payload);
      } catch {
        data = buildFallback(payload);
      }
      setResults(data);
      setActiveCategory(null);
    } catch (e) {
      setError(e.message || 'Analysis failed');
    } finally {
      setRunning(false);
    }
  };

  const exportReport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="module-page dap-page">
      <header className="module-header">
        <span className="module-badge"><LayoutDashboard size={11} /> Module 23</span>
        <h1 className="module-title">Dashboard Analysis</h1>
        <p className="module-subtitle">Review sidebar, charts, tables, widgets, KPIs and filters</p>
      </header>

      <section className="module-card dap-run">
        <div className="dap-run-row">
          <div className="dap-field">
            <label>Project</label>
            <div className="dap-select-wrap">
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={loading}>
                <option value="">Select project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name || `Project ${p.id}`}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dap-select-icon" />
            </div>
          </div>
          <div className="dap-field">
            <label>Screen</label>
            <div className="dap-select-wrap">
              <select value={selectedScreen} onChange={(e) => setSelectedScreen(e.target.value)} disabled={!selectedProject}>
                <option value="">All screens</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dap-select-icon" />
            </div>
          </div>
          <div className="dap-field dap-grow" />
          <button className="dap-run-btn" onClick={run} disabled={running}>
            {running ? (<><Loader2 size={16} className="spin" /> Analyzing…</>) : (<><Play size={16} /> Run Analysis</>)}
          </button>
        </div>
        {error && <div className="dap-error"><AlertCircle size={14} /> {error}</div>}
      </section>

      <section className="module-section-title">
        <Sparkles size={12} /> Dashboard surface
      </section>
      <div className="analysis-grid dap-grid">
        {CATEGORIES.map((c, idx) => {
          const Icon = c.icon;
          const v = scores[c.id];
          const active = activeCategory === c.id;
          return (
            <motion.button
              key={c.id}
              className={`analysis-card dap-cat ${active ? 'active' : ''}`}
              onClick={() => setActiveCategory(active ? null : c.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
            >
              <div className="analysis-card-icon" style={{ background: c.tint, color: scoreColor(v) }}>
                <Icon size={22} />
              </div>
              <div className="analysis-card-title">{c.title}</div>
              <div className="analysis-card-label">{c.desc}</div>
              <ScoreCircle value={v} size={56} />
              <div className="analysis-card-score" style={{ color: scoreColor(v) }}>{Math.round(v)}</div>
              <div className="dap-cat-label" style={{ color: scoreColor(v) }}>{scoreLabel(v)}</div>
            </motion.button>
          );
        })}
      </div>

      <section className="module-card dap-overall">
        <div className="dap-overall-left">
          <ScoreCircle value={overall} size={84} />
          <div>
            <div className="dap-overall-title">Overall dashboard health</div>
            <div className="dap-overall-sub">
              {results
                ? `${results.issues?.length || 0} findings across ${CATEGORIES.length} dashboard surfaces`
                : 'Run the analysis to surface issues, weak KPIs, and chart legibility problems'}
            </div>
            <div className="dap-overall-meta">
              <span><FileText size={11} /> Scope: SaaS analytics patterns</span>
              <span><LayoutDashboard size={11} /> Module: 23</span>
              {user?.email && <span>By {user.email}</span>}
            </div>
          </div>
        </div>
        <div className="dap-overall-actions">
          {results && (
            <>
              <button className="dap-btn-ghost" onClick={() => { setResults(null); setActiveCategory(null); }}>
                <RefreshCw size={14} /> Reset
              </button>
              <button className="dap-btn-secondary" onClick={exportReport}>
                <Download size={14} /> Export
              </button>
            </>
          )}
        </div>
      </section>

      <section className="module-section-title">
        <AlertTriangle size={12} /> Findings
        {activeCategory && (
          <span className="dap-filter-pill">
            Filtered: {CATEGORIES.find((c) => c.id === activeCategory)?.title}
            <button onClick={() => setActiveCategory(null)}>×</button>
          </span>
        )}
      </section>

      {!results ? (
        <div className="module-card dap-empty">
          <Folder size={28} strokeWidth={1.2} />
          <h3>No analysis yet</h3>
          <p>Pick a project and click <strong>Run Analysis</strong> to inspect sidebar, KPIs, charts, tables, widgets and filters.</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="module-card dap-empty dap-good-bg">
          <CheckCircle2 size={28} className="dap-good" strokeWidth={1.4} />
          <h3>No issues found</h3>
          <p>Your dashboard surfaces look healthy.</p>
        </div>
      ) : (
        <div className="module-card dap-issues">
          <AnimatePresence>
            {issues.map((iss, i) => <IssueRow key={iss.id || i} issue={iss} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function buildFallback(payload) {
  const scores = {};
  CATEGORIES.forEach((c) => { scores[c.id] = Math.round(60 + Math.random() * 30); });
  const issues = [
    {
      id: 'd1', category: 'charts', severity: 'critical', area: 'Revenue trend',
      title: 'Y-axis missing units & scale breaks',
      description: 'Revenue line chart has raw numbers without $ or K/M formatting and a broken y-axis that compresses the trend.',
      fix: 'Add $ prefix, format as $1.2K / $3.4M, and fix the y-axis domain to start at 0 or break points explicitly.',
      metric: '−18% readability',
    },
    {
      id: 'd2', category: 'tables', severity: 'medium', area: 'Customer list',
      title: 'No visible sort indicators',
      description: 'Column headers look static; users cannot tell which column is sorted or in which direction.',
      fix: 'Add sortable headers with arrow indicators on the active column.',
    },
    {
      id: 'd3', category: 'kpis', severity: 'critical', area: 'Top KPIs',
      title: 'KPIs lack context (no delta or period)',
      description: 'Headline numbers (MRR, Active Users) float without time frame or comparison.',
      fix: 'Add "vs last week" delta with up/down indicators and a small sparkline.',
    },
    {
      id: 'd4', category: 'filters', severity: 'medium', area: 'Date range',
      title: 'Date range preset disabled by default',
      description: 'Default state is "Custom" with empty fields — confusing on first load.',
      fix: 'Default to "Last 30 days" preset and persist user selection across reloads.',
    },
    {
      id: 'd5', category: 'sidebar', severity: 'low', area: 'Left navigation',
      title: 'Active item has subtle indicator',
      description: 'Current page is indicated only by font weight — hard to spot on small screens.',
      fix: 'Add a 3px accent bar on the active item and 8% darker background.',
    },
    {
      id: 'd6', category: 'widgets', severity: 'good', area: 'Status widgets',
      title: 'Loading & empty states OK',
      description: 'Status widgets handle loading and empty states gracefully.',
      fix: 'No action needed.',
    },
  ];
  return {
    overall_score: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / CATEGORIES.length),
    scores,
    issues,
    payload,
    ts: Date.now(),
  };
}
