import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanSearch, Compass, Network, LayoutDashboard, RouteIcon, Search,
  Filter as FilterIcon, Inbox, Loader2, AlertCircle, AlertTriangle,
  CheckCircle2, CheckCircle, XCircle, BarChart3, Play, RefreshCw,
  ChevronDown, Sparkles, Image as ImageIcon, Smartphone,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ANALYSIS_TYPES = [
  { id: 'review',               label: 'Review',               icon: ScanSearch,       color: '#7c5cff' },
  { id: 'navigation',           label: 'Navigation',           icon: Compass,          color: '#7c5cff' },
  { id: 'information-architecture', label: 'Information Architecture', icon: Network,  color: '#7c5cff' },
  { id: 'dashboard',            label: 'Dashboard',            icon: LayoutDashboard,  color: '#7c5cff' },
  { id: 'user-journey',         label: 'User Journey',         icon: RouteIcon,        color: '#7c5cff' },
  { id: 'search',               label: 'Search',               icon: Search,           color: '#7c5cff' },
  { id: 'filters',              label: 'Filters',              icon: FilterIcon,       color: '#7c5cff' },
  { id: 'empty-states',         label: 'Empty States',         icon: Inbox,            color: '#7c5cff' },
  { id: 'loading-states',       label: 'Loading States',       icon: Loader2,          color: '#7c5cff' },
  { id: 'error-states',         label: 'Error States',         icon: AlertCircle,      color: '#ef4444' },
  { id: 'success-states',       label: 'Success States',       icon: CheckCircle,      color: '#10b981' },
  { id: 'form-ux',              label: 'Form UX',              icon: FormInput,        color: '#7c5cff' },
  { id: 'mobile-ux',            label: 'Mobile UX',            icon: Smartphone,       color: '#7c5cff' },
];

const UX_CATEGORIES = [
  'navigation', 'wayfinding', 'onboarding', 'flow', 'input',
  'feedback', 'discoverability', 'accessibility', 'mobile', 'forms',
];

const scoreColor = (score) => {
  if (score == null) return '#9ca3af';
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

const scoreLabel = (score) => {
  if (score == null) return '—';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs work';
  return 'Critical';
};

const severityMeta = {
  critical: { color: '#ef4444', icon: AlertCircle,   label: 'Critical' },
  medium:   { color: '#f59e0b', icon: AlertTriangle, label: 'Medium'   },
  good:     { color: '#10b981', icon: CheckCircle2,  label: 'Good'     },
};

// Inline fallback icon for "FormInput" (used in UX category list)
// Use the same component path as UI page (FormInput) but to keep import surface lean,
// we re-import inside the icon list.
import { FormInput } from 'lucide-react';

function ScoreCircle({ score, size = 96, accent = '#7c5cff' }) {
  const color = scoreColor(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score == null ? 0 : Math.max(0, Math.min(100, score));
  const offset = circumference - (value / 100) * circumference;
  const id = `ux-circle-${size}-${accent.replace('#', '')}`;

  return (
    <div className="ux-score-circle" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={6}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${id})`}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ux-score-circle-text" style={{ color }}>
        {score ?? '—'}
      </div>
    </div>
  );
}

function AnalysisCard({ type, score, selected, onClick }) {
  const Icon = type.icon;
  return (
    <motion.button
      className={`ux-analysis-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ '--accent': type.color }}
    >
      <div className="ux-analysis-icon">
        <Icon size={20} />
      </div>
      <div className="ux-analysis-title">{type.label}</div>
      <ScoreCircle score={score} size={68} accent={type.color} />
      <div className="ux-analysis-label" style={{ color: scoreColor(score) }}>
        {scoreLabel(score)}
      </div>
      {selected && <div className="ux-analysis-check" />}
    </motion.button>
  );
}

function IssueRow({ issue }) {
  const sev = severityMeta[issue.severity] || severityMeta.medium;
  const Icon = sev.icon;
  const tags = Array.isArray(issue.tags)
    ? issue.tags
    : (issue.category ? [issue.category] : []);

  return (
    <div className="ux-issue">
      <div className="issue-severity" style={{
        background: sev.color,
        boxShadow: issue.severity === 'critical' ? `0 0 6px ${sev.color}80` : 'none',
      }} />
      <div className="issue-content">
        <div className="ux-issue-head">
          <Icon size={13} style={{ color: sev.color }} />
          <span className="ux-issue-title">{issue.title || issue.problem || 'Untitled issue'}</span>
          <span className="ux-issue-sev" style={{ color: sev.color }}>{sev.label}</span>
        </div>
        {issue.description && (
          <div className="issue-desc">{issue.description}</div>
        )}
        <div className="ux-issue-meta">
          {tags.map((t) => (
            <span key={t} className="ux-issue-tag">#{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UXAnalysisPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [screens, setScreens] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  const [activeScreen, setActiveScreen] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['review']);
  const [scores, setScores] = useState({});
  const [issues, setIssues] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.listProjects();
        const list = Array.isArray(res) ? res : (res.items || res.projects || []);
        setProjects(list);
        if (list.length) {
          setActiveProject(list[0].id);
          const firstScreens = list[0].screens || [];
          setScreens(firstScreens);
          if (firstScreens.length) setActiveScreen(firstScreens[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeProject) { setScreens([]); setActiveScreen(''); return; }
    const p = projects.find((x) => x.id === activeProject);
    const list = p?.screens || [];
    setScreens(list);
    if (list.length && !list.find((s) => s.id === activeScreen)) {
      setActiveScreen(list[0].id);
    } else if (!list.length) {
      setActiveScreen('');
    }
  }, [activeProject, projects, activeScreen]);

  const toggleType = (id) => {
    setSelectedTypes((prev) => {
      if (id === 'review') return ['review'];
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev.filter((x) => x !== 'review'), id];
    });
  };

  const runAnalysis = async () => {
    if (!activeScreen) {
      setError('Please select a screenshot to analyze.');
      return;
    }
    setRunning(true);
    setError('');
    setIssues([]);
    try {
      // We don't have a dedicated UX endpoint, so reuse the AI screenshot analysis
      // and let the backend tag UX-style issues, or fall back to a graceful UX pass.
      const data = await api.analyzeScreenshot({
        screen_id: activeScreen,
        project_id: activeProject,
        types: selectedTypes,
        perspective: 'ux',
      });

      const result = data?.result || data || {};
      const nextScores = result.scores || {};
      let nextIssues = [];

      if (Array.isArray(result.issues)) {
        nextIssues = result.issues;
      } else if (Array.isArray(data?.issues)) {
        nextIssues = data.issues;
      } else if (Array.isArray(data)) {
        nextIssues = data;
      }

      // If the backend returned no UX-tagged issues, synthesize from scores so the
      // UX grid still surfaces something useful — without fabricating harmful detail.
      if (nextIssues.length === 0 && Object.keys(nextScores).length) {
        nextIssues = Object.entries(nextScores).map(([key, value]) => ({
          id: `${key}-${value}`,
          title: key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: `Score for ${key}: ${value}`,
          severity: value >= 80 ? 'good' : value >= 60 ? 'medium' : 'critical',
          tags: [key.split('-')[0]],
        }));
      }

      setScores(nextScores);
      setIssues(nextIssues);
    } catch (err) {
      setError(err.message || 'Analysis failed — please try again.');
    } finally {
      setRunning(false);
    }
  };

  const stats = useMemo(() => {
    const critical = issues.filter((i) => i.severity === 'critical').length;
    const medium = issues.filter((i) => i.severity === 'medium').length;
    const good = issues.filter((i) => i.severity === 'good').length;
    const overall = issues.length
      ? Math.round(
          issues.reduce((acc, i) => {
            if (i.severity === 'good') return acc + 90;
            if (i.severity === 'medium') return acc + 65;
            return acc + 30;
          }, 0) / issues.length
        )
      : null;
    return { critical, medium, good, overall };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (filter === 'all') return issues;
    return issues.filter((i) => i.severity === filter);
  }, [issues, filter]);

  const currentScreen = screens.find((s) => s.id === activeScreen);

  return (
    <div className="module-page">
      <header className="module-header">
        <div className="module-badge"><Sparkles size={11} /> Module 9</div>
        <h1 className="module-title">UX Analysis</h1>
        <p className="module-subtitle">Review navigation, flows and user experience</p>
      </header>

      {/* Selector + run */}
      <div className="module-card ux-run-card">
        <div className="ux-run-grid">
          <div className="ux-run-field">
            <label className="label">Project</label>
            <div className="ux-select">
              <select
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                disabled={loading}
              >
                {projects.length === 0 && <option value="">No projects yet</option>}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="ux-run-field">
            <label className="label">Screenshot to analyze</label>
            <div className="ux-select">
              <select
                value={activeScreen}
                onChange={(e) => setActiveScreen(e.target.value)}
                disabled={!screens.length}
              >
                {screens.length === 0 && <option value="">No screenshots</option>}
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `Screen ${s.id?.slice(0, 6)}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="ux-run-actions">
            <button
              className="btn btn-primary"
              onClick={runAnalysis}
              disabled={running || !activeScreen}
            >
              {running ? (
                <><Loader2 size={14} className="up-spin" /> Analyzing…</>
              ) : (
                <><Play size={14} /> Run Analysis</>
              )}
            </button>
            {(issues.length > 0 || Object.keys(scores).length > 0) && !running && (
              <button className="btn btn-ghost" onClick={runAnalysis}>
                <RefreshCw size={14} /> Re-run
              </button>
            )}
          </div>
        </div>

        {currentScreen && (currentScreen.url || currentScreen.thumbnail) && (
          <div className="ux-screen-preview">
            <img src={currentScreen.url || currentScreen.thumbnail} alt={currentScreen.name} />
            <div className="ux-screen-preview-meta">
              <div className="ux-screen-preview-name">{currentScreen.name}</div>
              <div className="ux-screen-preview-sub">Selected for analysis</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="ux-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Analysis grid */}
      <h2 className="module-section-title">Analysis types</h2>
      <div className="ux-grid">
        {ANALYSIS_TYPES.map((t) => (
          <AnalysisCard
            key={t.id}
            type={t}
            score={scores[t.id] ?? scores[t.label?.toLowerCase()]}
            selected={selectedTypes.includes(t.id)}
            onClick={() => toggleType(t.id)}
          />
        ))}
      </div>

      {/* Results */}
      {(issues.length > 0 || stats.overall != null) && (
        <>
          <h2 className="module-section-title">Results</h2>

          <div className="ux-summary">
            <div className="ux-summary-overall">
              <div className="ux-summary-label">Overall UX</div>
              <ScoreCircle score={stats.overall} size={96} accent="#7c5cff" />
              <div className="ux-summary-sub" style={{ color: scoreColor(stats.overall) }}>
                {scoreLabel(stats.overall)}
              </div>
            </div>
            <div className="ux-summary-stats">
              <div className="ux-summary-stat critical">
                <AlertCircle size={14} />
                <span>{stats.critical} Critical</span>
              </div>
              <div className="ux-summary-stat medium">
                <AlertTriangle size={14} />
                <span>{stats.medium} Medium</span>
              </div>
              <div className="ux-summary-stat good">
                <CheckCircle2 size={14} />
                <span>{stats.good} Good</span>
              </div>
            </div>
            <div className="ux-summary-categories">
              <div className="ux-summary-categories-label">Categories</div>
              <div className="ux-summary-categories-list">
                {UX_CATEGORIES.map((c) => (
                  <span key={c} className="ux-summary-cat">#{c}</span>
                ))}
              </div>
            </div>
            <div className="ux-summary-filter">
              {[
                { id: 'all',      label: 'All' },
                { id: 'critical', label: 'Critical' },
                { id: 'medium',   label: 'Medium' },
                { id: 'good',     label: 'Good' },
              ].map((f) => (
                <button
                  key={f.id}
                  className={`filter-tab ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="module-card">
            {filteredIssues.length === 0 ? (
              <div className="ux-empty">
                <CheckCircle2 size={22} />
                <div className="ux-empty-title">Nothing here</div>
                <div className="ux-empty-sub">No issues match this filter.</div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredIssues.map((issue, idx) => (
                  <motion.div
                    key={issue.id || `${issue.title}-${idx}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.02 }}
                  >
                    <IssueRow issue={issue} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

      {!running && issues.length === 0 && !error && (
        <div className="module-card ux-empty ux-empty-large">
          <BarChart3 size={28} />
          <div className="ux-empty-title">Run an analysis to see results</div>
          <div className="ux-empty-sub">
            Pick a screenshot, choose an analysis type and click <strong>Run Analysis</strong>.
          </div>
        </div>
      )}

      {user && (
        <div className="ux-foot">
          <ImageIcon size={11} /> Signed in as <strong>{user.name || user.email}</strong>
        </div>
      )}
    </div>
  );
}