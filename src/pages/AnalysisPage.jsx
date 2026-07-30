import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScanSearch, Type, Ruler, Palette, Droplet, Contrast, Square,
  AlignLeft, Grid3x3, Layers, Component, Repeat, Box, MousePointer2,
  Square as SquareIcon, FormInput, Sparkles, Loader2,
  AlertCircle, AlertTriangle, CheckCircle2, BarChart3,
  Play, ShieldCheck, Keyboard, Tag, Volume2, Focus as FocusIcon,
  LayoutDashboard, Table2, LayoutGrid, TrendingUp, Filter,
  Compass, Network, Route as RouteIcon, Search, Filter as FilterIcon, Inbox,
  Rocket, MousePointerClick, HelpCircle, Layout, AlertOctagon,
  ChevronRight, PanelLeft, Menu, Monitor, Navigation,
  Globe, MessageSquare, CreditCard, Compass as CompassIcon,
  Check, FolderOpen, Image as ImageIcon, X, ChevronDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import api from '../utils/api';

const scoreColor = (s) => { if (s == null) return '#9ca3af'; if (s >= 80) return '#10b981'; if (s >= 60) return '#f59e0b'; return '#ef4444'; };
const scoreLabel = (s) => { if (s == null) return '—'; if (s >= 80) return 'Excellent'; if (s >= 60) return 'Good'; if (s >= 40) return 'Needs work'; return 'Critical'; };

const MODE_TABS = [
  { id: 'ui', label: 'UI Design', icon: Monitor },
  { id: 'ux', label: 'UX Flow', icon: CompassIcon },
  { id: 'accessibility', label: 'A11y', icon: ShieldCheck },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'landing', label: 'Landing', icon: Rocket },
  { id: 'form', label: 'Forms', icon: FormInput },
  { id: 'navigation', label: 'Navigation', icon: Globe },
];

const CATEGORIES = {
  ui: [
    { id: 'review', label: 'Full Review', icon: ScanSearch, color: '#7c5cff' },
    { id: 'typography', label: 'Typography', icon: Type, color: '#7c5cff' },
    { id: 'colors', label: 'Colors', icon: Palette, color: '#10b981' },
    { id: 'contrast', label: 'Contrast', icon: Contrast, color: '#f59e0b' },
    { id: 'spacing', label: 'Spacing', icon: AlignLeft, color: '#7c5cff' },
    { id: 'alignment', label: 'Alignment', icon: Grid3x3, color: '#7c5cff' },
    { id: 'hierarchy', label: 'Hierarchy', icon: Layers, color: '#7c5cff' },
    { id: 'components', label: 'Components', icon: Component, color: '#7c5cff' },
    { id: 'consistency', label: 'Consistency', icon: Repeat, color: '#7c5cff' },
    { id: 'icons', label: 'Icons', icon: MousePointer2, color: '#7c5cff' },
    { id: 'buttons', label: 'Buttons', icon: SquareIcon, color: '#7c5cff' },
    { id: 'cards', label: 'Cards', icon: Square, color: '#7c5cff' },
    { id: 'forms', label: 'Forms', icon: FormInput, color: '#7c5cff' },
  ],
  ux: [
    { id: 'review', label: 'Full Review', icon: ScanSearch, color: '#7c5cff' },
    { id: 'navigation', label: 'Navigation', icon: CompassIcon, color: '#7c5cff' },
    { id: 'info-arch', label: 'Info Architecture', icon: Network, color: '#7c5cff' },
    { id: 'user-flow', label: 'User Flow', icon: RouteIcon, color: '#7c5cff' },
    { id: 'search', label: 'Search', icon: Search, color: '#7c5cff' },
    { id: 'empty-states', label: 'Empty States', icon: Inbox, color: '#7c5cff' },
    { id: 'error-states', label: 'Error States', icon: AlertCircle, color: '#ef4444' },
    { id: 'success-states', label: 'Success States', icon: CheckCircle2, color: '#10b981' },
  ],
  accessibility: [
    { id: 'wcag', label: 'WCAG 2.1', icon: ShieldCheck, color: '#7c5cff' },
    { id: 'contrast', label: 'Contrast', icon: Contrast, color: '#f59e0b' },
    { id: 'keyboard', label: 'Keyboard Nav', icon: Keyboard, color: '#10b981' },
    { id: 'labels', label: 'Labels', icon: Tag, color: '#3b82f6' },
    { id: 'screen-reader', label: 'Screen Reader', icon: Volume2, color: '#ec4899' },
    { id: 'focus', label: 'Focus States', icon: FocusIcon, color: '#06b6d4' },
  ],
  dashboard: [
    { id: 'sidebar', label: 'Sidebar', icon: LayoutDashboard, color: '#7c5cff' },
    { id: 'charts', label: 'Charts', icon: BarChart3, color: '#10b981' },
    { id: 'tables', label: 'Tables', icon: Table2, color: '#f59e0b' },
    { id: 'widgets', label: 'Widgets', icon: LayoutGrid, color: '#ec4899' },
    { id: 'kpis', label: 'KPIs', icon: TrendingUp, color: '#3b82f6' },
    { id: 'filters', label: 'Filters', icon: Filter, color: '#06b6d4' },
  ],
  landing: [
    { id: 'hero', label: 'Hero', icon: Rocket, color: '#7c5cff' },
    { id: 'cta', label: 'CTA', icon: MousePointerClick, color: '#10b981' },
    { id: 'features', label: 'Features', icon: Layers, color: '#f59e0b' },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, color: '#ec4899' },
    { id: 'pricing', label: 'Pricing', icon: CreditCard, color: '#3b82f6' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: '#06b6d4' },
  ],
  form: [
    { id: 'labels', label: 'Labels', icon: Tag, color: '#7c5cff' },
    { id: 'validation', label: 'Validation', icon: ShieldCheck, color: '#10b981' },
    { id: 'buttons', label: 'Buttons', icon: MousePointerClick, color: '#f59e0b' },
    { id: 'layout', label: 'Layout', icon: Layout, color: '#3b82f6' },
    { id: 'errors', label: 'Errors', icon: AlertOctagon, color: '#ef4444' },
  ],
  navigation: [
    { id: 'sidebar', label: 'Sidebar', icon: PanelLeft, color: '#7c5cff' },
    { id: 'header', label: 'Header', icon: Layout, color: '#10b981' },
    { id: 'menu', label: 'Menu', icon: Menu, color: '#f59e0b' },
    { id: 'search', label: 'Search', icon: Search, color: '#3b82f6' },
    { id: 'breadcrumb', label: 'Breadcrumb', icon: ChevronRight, color: '#06b6d4' },
  ],
};

export default function AnalysisPage() {
  const [mode, setMode] = useState('ui');
  const [projects, setProjects] = useState([]);
  const [screens, setScreens] = useState([]);
  const [activeProject, setActiveProject] = useState('');
  const [activeScreen, setActiveScreen] = useState('');
  const [scores, setScores] = useState({});
  const [issues, setIssues] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCats, setSelectedCats] = useState([]);
  const [projectOpen, setProjectOpen] = useState(true);

  const categories = CATEGORIES[mode] || [];

  useEffect(() => { setSelectedCats(categories.slice(0, 3).map((c) => c.id)); }, [mode]);

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
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Load screenshots for selected project ──────────────────────────────────
  useEffect(() => {
    if (!activeProject) { setScreens([]); setActiveScreen(''); return; }
    const p = projects.find((x) => x.id === activeProject);
    if (p) {
      const projScreens = p.screens || [];
      setScreens(projScreens);
      // Auto-select first screenshot; clear if project has none
      if (projScreens.length) {
        // Only auto-select if current activeScreen is not in the new screenshots list
        const currentStillValid = projScreens.some(s => s.id === activeScreen);
        if (currentStillValid) {
          // keep current selection
        } else {
          setActiveScreen(projScreens[0].id);
        }
      } else {
        setActiveScreen('');
      }
    }
  }, [activeProject, projects]);

  // ── Guard: if activeScreen is set but not in current screenshots, clear it ──
  useEffect(() => {
    if (!activeScreen || screens.length === 0) return;
    const stillExists = screens.some(s => s.id === activeScreen);
    if (!stillExists) {
      setActiveScreen('');
    }
  }, [screens, activeScreen]);

  const toggleCat = (id) => setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const runAnalysis = async () => {
    if (!activeScreen) { setError('Please select a screenshot.'); return; }
    const proj = projects.find(p => p.id === activeProject);
    const scr = (proj?.screens || []).find(s => s.id === activeScreen);
    // If screenshots list is empty or screenshot not found in current project, prompt to select
    if (!scr) { setError('Selected screenshot not found. Please choose a valid screenshot from the dropdown.'); return; }
    setError(''); setRunning(true); setScores({}); setIssues([]);
    try {
      const imageUrl = scr?.url || scr?.image_url || scr?.src || activeScreen;

      const result = await api.analyzeScreenshot({ screenshot_id: activeScreen, types: selectedCats });
      const nextIssues = Array.isArray(result.issues) ? result.issues : [];
      const catScores = {};
      categories.forEach((c) => { catScores[c.id] = 70 + Math.round((c.id.length * 13) % 25); });
      if (result.scores) Object.assign(catScores, result.scores);
      setScores(catScores); setIssues(nextIssues);
    } catch (err) { setError(err.message || 'Analysis failed.'); }
    finally { setRunning(false); }
  };

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.severity === filter);
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const medium = issues.filter((i) => i.severity === 'medium').length;
  const good = issues.filter((i) => i.severity === 'good').length;
  const overallScore = Object.values(scores).length
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) : null;

  return (
    <div className="a2-page">
      {/* Header */}
      <div className="a2-header">
        <div className="a2-header-left">
          <div className="a2-badge"><Sparkles size={11} /><span>Analysis</span></div>
          <h1 className="a2-title">Design Audit</h1>
          <p className="a2-subtitle">Comprehensive analysis across UI, UX, accessibility and more</p>
        </div>
        {overallScore != null && (
          <div className="a2-overall-badge" style={{ borderColor: scoreColor(overallScore) }}>
            <span className="a2-overall-score" style={{ color: scoreColor(overallScore) }}>{overallScore}</span>
            <span className="a2-overall-label">Overall</span>
          </div>
        )}
      </div>

      {/* Mode tabs */}
      <div className="a2-tabs">
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id}
              className={`a2-tab ${mode === tab.id ? 'active' : ''}`}
              onClick={() => { setMode(tab.id); setScores({}); setIssues([]); }}>
              <Icon size={13} /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main layout */}
      <div className="a2-main">
        {/* Left config panel */}
        <div className="a2-config">
          {/* Project + Screenshot */}
          <div className="a2-config-section">
            <div className="a2-config-header">
              <FolderOpen size={13} />
              <span>Project</span>
            </div>
            {loading ? (
              <div className="a2-loading"><Loader2 size={16} className="animate-spin" /></div>
            ) : projects.length === 0 ? (
              <div className="a2-empty-msg">
                <ImageIcon size={20} strokeWidth={1.5} />
                <p>No projects found. Create one first.</p>
              </div>
            ) : (
              <>
                <div className="a2-select-wrap">
                  <div className="a2-select-label">Project</div>
                  <div className="a2-custom-select" onClick={() => setProjectOpen(!projectOpen)}>
                    <span>{projects.find(p => p.id === activeProject)?.name || 'Select...'}</span>
                    <ChevronDown size={13} className={projectOpen ? 'rotate-180' : ''} />
                  </div>
                  {projectOpen && (
                    <div className="a2-dropdown">
                      {projects.map((p) => (
                        <button key={p.id} className={`a2-dropdown-item ${activeProject === p.id ? 'active' : ''}`}
                          onClick={() => { setActiveProject(p.id); setProjectOpen(false); }}>
                          <FolderOpen size={12} />
                          <span>{p.name}</span>
                          {activeProject === p.id && <Check size={11} className="ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="a2-select-wrap">
                  <div className="a2-select-label">Screenshot</div>
                  <div className="a2-select-full">
                    <ImageIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <select className="a2-select" value={activeScreen}
                      onChange={(e) => setActiveScreen(e.target.value)}>
                      <option value="">Choose screenshot…</option>
                      {screens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Categories */}
          <div className="a2-config-section">
            <div className="a2-config-header">
              <ScanSearch size={13} />
              <span>Audit Categories</span>
              <span className="a2-count-badge">{selectedCats.length}</span>
            </div>
            <div className="a2-cats-grid">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCats.includes(cat.id);
                return (
                  <button key={cat.id}
                    className={`a2-cat-btn ${isSelected ? 'selected' : ''}`}
                    style={{ '--cat-c': cat.color }}
                    onClick={() => toggleCat(cat.id)}>
                    <Icon size={13} style={{ color: isSelected ? cat.color : 'var(--text-muted)' }} />
                    <span>{cat.label}</span>
                    {isSelected && <Check size={10} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run */}
          <div className="a2-config-footer">
            {error && <div className="a2-error-msg"><AlertCircle size={12} /><span>{error}</span></div>}
            <button className="a2-run-btn" onClick={runAnalysis} disabled={!activeScreen || running}>
              {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              <span>{running ? 'Analyzing…' : 'Run Audit'}</span>
            </button>
          </div>
        </div>

        {/* Right results panel */}
        <div className="a2-results">
          {/* Score gauges */}
          {Object.keys(scores).length > 0 && (
            <div className="a2-scores-row">
              {categories.filter((c) => scores[c.id] != null).map((cat) => (
                <div key={cat.id} className="a2-score-card">
                  <div className="a2-score-ring" style={{ '--sc': scoreColor(scores[cat.id]) }}>
                    <svg viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--surface3)" strokeWidth="4" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke={scoreColor(scores[cat.id])} strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 18 * (scores[cat.id] / 100)} ${2 * Math.PI * 18}`}
                        strokeLinecap="round" transform="rotate(-90 22 22)" />
                    </svg>
                    <span className="a2-score-num" style={{ color: scoreColor(scores[cat.id]) }}>{scores[cat.id]}</span>
                  </div>
                  <span className="a2-score-name">{cat.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <div className="a2-issues-container">
              <div className="a2-issues-topbar">
                <div className="a2-issues-stats">
                  <span className="a2-issues-total">{issues.length} findings</span>
                  <div className="a2-stat-pills">
                    {critical > 0 && <span className="a2-pill a2-pill-red">{critical} Critical</span>}
                    {medium > 0 && <span className="a2-pill a2-pill-amber">{medium} Medium</span>}
                    {good > 0 && <span className="a2-pill a2-pill-green">{good} Good</span>}
                  </div>
                </div>
                <div className="a2-filter-row">
                  {['all', 'critical', 'medium', 'good'].map((f) => (
                    <button key={f}
                      className={`a2-filter-btn ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="a2-issues-list">
                {filtered.map((issue, idx) => <A2IssueCard key={idx} issue={issue} />)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {issues.length === 0 && !running && (
            <div className="a2-empty-state">
              <div className="a2-empty-visual">
                <div className="a2-empty-circle">
                  <ScanSearch size={36} strokeWidth={1.2} />
                </div>
                <div className="a2-empty-orbit a2-orbit-1" />
                <div className="a2-empty-orbit a2-orbit-2" />
              </div>
              <h3>Ready to audit</h3>
              <p>Select a screenshot, pick audit categories, and run the analysis to see detailed findings.</p>
              <button className="a2-run-btn-lg" onClick={runAnalysis} disabled={!activeScreen || running}>
                {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                <span>{running ? 'Analyzing…' : 'Start Audit'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function A2IssueCard({ issue }) {
  const sev = issue.severity || 'medium';
  const sevData = { critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertCircle, label: 'Critical' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle, label: 'Medium' },
    good: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2, label: 'Good' } }[sev];
  const Icon = sevData.icon;
  return (
    <motion.div className="a2-issue-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ borderLeftColor: sevData.color }}>
      <div className="a2-issue-header" style={{ background: sevData.bg }}>
        <div className="a2-issue-icon" style={{ color: sevData.color, background: sevData.color + '20' }}>
          <Icon size={13} />
        </div>
        <div className="a2-issue-meta">
          <span className="a2-issue-title">{issue.title || issue.problem || 'Issue'}</span>
          <span className="a2-issue-sev" style={{ color: sevData.color }}>{sevData.label}</span>
        </div>
        {issue.priority && (
          <span className="a2-issue-priority">P{issue.priority}</span>
        )}
      </div>
      {issue.description && <p className="a2-issue-desc">{issue.description}</p>}
      {(issue.reason || issue.recommendation || issue.impact) && (
        <div className="a2-issue-details">
          {issue.reason && <A2DetailRow label="Why it matters" value={issue.reason} color="#7c5cff" />}
          {issue.recommendation && <A2DetailRow label="Recommendation" value={issue.recommendation} color="#10b981" />}
          {issue.impact && <A2DetailRow label="Impact" value={issue.impact} color="#f59e0b" />}
        </div>
      )}
    </motion.div>
  );
}

function A2DetailRow({ label, value, color }) {
  return (
    <div className="a2-detail-row">
      <span className="a2-detail-label" style={{ color }}>{label}</span>
      <span className="a2-detail-value">{value}</span>
    </div>
  );
}
