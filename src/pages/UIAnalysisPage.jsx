import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanSearch, Type, Ruler, Palette, Droplet, Contrast, Square,
  AlignLeft, Grid3x3, Layers, Component, Repeat, Box, MousePointer2,
  Square as SquareIcon, FormInput, Sparkles, Loader2, ChevronDown,
  AlertCircle, AlertTriangle, CheckCircle2, BarChart3, Image as ImageIcon,
  Play, RefreshCw,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ANALYSIS_TYPES = [
  { id: 'review',         label: 'Review',          icon: ScanSearch,    color: '#7c5cff' },
  { id: 'typography',     label: 'Typography',      icon: Type,          color: '#7c5cff' },
  { id: 'font-sizes',     label: 'Font Sizes',      icon: Ruler,         color: '#7c5cff' },
  { id: 'colors',         label: 'Colors',          icon: Palette,       color: '#10b981' },
  { id: 'color-harmony',  label: 'Color Harmony',   icon: Droplet,       color: '#10b981' },
  { id: 'contrast',       label: 'Contrast',        icon: Contrast,      color: '#f59e0b' },
  { id: 'white-space',    label: 'White Space',     icon: Square,        color: '#7c5cff' },
  { id: 'spacing',        label: 'Spacing',         icon: AlignLeft,     color: '#7c5cff' },
  { id: 'alignment',      label: 'Alignment',       icon: Grid3x3,       color: '#7c5cff' },
  { id: 'grid',           label: 'Grid',            icon: Grid3x3,       color: '#7c5cff' },
  { id: 'hierarchy',      label: 'Visual Hierarchy',icon: Layers,        color: '#7c5cff' },
  { id: 'components',     label: 'Components',      icon: Component,     color: '#7c5cff' },
  { id: 'consistency',    label: 'Consistency',     icon: Repeat,        color: '#7c5cff' },
  { id: 'shadows',        label: 'Shadows',         icon: Box,           color: '#7c5cff' },
  { id: 'icons',          label: 'Icons',           icon: MousePointer2, color: '#7c5cff' },
  { id: 'buttons',        label: 'Buttons',         icon: SquareIcon,    color: '#7c5cff' },
  { id: 'cards',          label: 'Cards',           icon: Square,        color: '#7c5cff' },
  { id: 'forms',          label: 'Forms',           icon: FormInput,     color: '#7c5cff' },
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

function AnalysisCard({ type, score, selected, onClick }) {
  const Icon = type.icon;
  const color = scoreColor(score);
  return (
    <motion.button
      className={`ui-analysis-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{
        '--accent': type.color,
      }}
    >
      <div className="ui-analysis-icon">
        <Icon size={20} />
      </div>
      <div className="ui-analysis-title">{type.label}</div>
      <div className="ui-analysis-score" style={{ color }}>{score ?? '—'}</div>
      <div className="ui-analysis-label" style={{ color }}>{scoreLabel(score)}</div>
      {selected && <div className="ui-analysis-check" />}
    </motion.button>
  );
}

function IssueRow({ issue }) {
  const sev = severityMeta[issue.severity] || severityMeta.medium;
  const Icon = sev.icon;
  return (
    <div className="ui-issue">
      <div className="issue-severity" style={{
        background: sev.color,
        boxShadow: issue.severity === 'critical' ? `0 0 6px ${sev.color}80` : 'none',
      }} />
      <div className="issue-content">
        <div className="ui-issue-head">
          <Icon size={13} style={{ color: sev.color }} />
          <span className="ui-issue-title">{issue.title || issue.problem || 'Untitled issue'}</span>
          <span className="ui-issue-sev" style={{ color: sev.color }}>{sev.label}</span>
        </div>
        {issue.description && (
          <div className="issue-desc">{issue.description}</div>
        )}
        <div className="ui-issue-grid">
          {issue.problem && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Problem</div>
              <div className="ui-issue-block-body">{issue.problem}</div>
            </div>
          )}
          {issue.reason && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Why it matters</div>
              <div className="ui-issue-block-body">{issue.reason}</div>
            </div>
          )}
          {issue.business_impact && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Business impact</div>
              <div className="ui-issue-block-body">{issue.business_impact}</div>
            </div>
          )}
          {issue.recommendation && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Recommendation</div>
              <div className="ui-issue-block-body">{issue.recommendation}</div>
            </div>
          )}
          {issue.expected_result && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Expected result</div>
              <div className="ui-issue-block-body">{issue.expected_result}</div>
            </div>
          )}
          {issue.category && (
            <div className="ui-issue-block">
              <div className="ui-issue-block-label">Category</div>
              <div className="ui-issue-block-body"><span className="issue-category">{issue.category}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UIAnalysisPage() {
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
  const [filter, setFilter] = useState('all'); // all | critical | medium | good

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
      if (id === 'review') return ['review']; // single-select for analysis
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
      const data = await api.analyzeScreenshot({
        screen_id: activeScreen,
        project_id: activeProject,
        types: selectedTypes,
      });

      // Normalize response — backend may return { scores, issues } or { result: { scores, issues } }
      const result = data?.result || data || {};
      const nextScores = result.scores || {};
      const nextIssues = Array.isArray(result.issues) ? result.issues
        : Array.isArray(data?.issues) ? data.issues
        : Array.isArray(data) ? data
        : [];

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
        <div className="module-badge"><Sparkles size={11} /> Module 8</div>
        <h1 className="module-title">UI Analysis</h1>
        <p className="module-subtitle">Review typography, colors, spacing and components</p>
      </header>

      {/* Selector + run */}
      <div className="module-card ui-run-card">
        <div className="ui-run-grid">
          <div className="ui-run-field">
            <label className="label">Project</label>
            <div className="ui-select">
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

          <div className="ui-run-field">
            <label className="label">Screenshot to analyze</label>
            <div className="ui-select">
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

          <div className="ui-run-actions">
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
          <div className="ui-screen-preview">
            <img src={currentScreen.url || currentScreen.thumbnail} alt={currentScreen.name} />
            <div className="ui-screen-preview-meta">
              <div className="ui-screen-preview-name">{currentScreen.name}</div>
              <div className="ui-screen-preview-sub">Selected for analysis</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="ui-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Analysis grid */}
      <h2 className="module-section-title">Analysis types</h2>
      <div className="ui-grid">
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

          <div className="ui-summary">
            <div className="ui-summary-overall">
              <div className="ui-summary-label">Overall</div>
              <div className="ui-summary-score" style={{ color: scoreColor(stats.overall) }}>
                {stats.overall ?? '—'}
              </div>
              <div className="ui-summary-sub" style={{ color: scoreColor(stats.overall) }}>
                {scoreLabel(stats.overall)}
              </div>
            </div>
            <div className="ui-summary-stats">
              <div className="ui-summary-stat critical">
                <AlertCircle size={14} />
                <span>{stats.critical} Critical</span>
              </div>
              <div className="ui-summary-stat medium">
                <AlertTriangle size={14} />
                <span>{stats.medium} Medium</span>
              </div>
              <div className="ui-summary-stat good">
                <CheckCircle2 size={14} />
                <span>{stats.good} Good</span>
              </div>
            </div>
            <div className="ui-summary-filter">
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
              <div className="ui-empty">
                <CheckCircle2 size={22} />
                <div className="ui-empty-title">Nothing here</div>
                <div className="ui-empty-sub">No issues match this filter.</div>
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

      {/* Empty hint when no analysis run yet */}
      {!running && issues.length === 0 && !error && (
        <div className="module-card ui-empty ui-empty-large">
          <BarChart3 size={28} />
          <div className="ui-empty-title">Run an analysis to see results</div>
          <div className="ui-empty-sub">
            Pick a screenshot, choose an analysis type and click <strong>Run Analysis</strong>.
          </div>
        </div>
      )}

      {user && (
        <div className="ui-foot">
          <ImageIcon size={11} /> Signed in as <strong>{user.name || user.email}</strong>
        </div>
      )}
    </div>
  );
}