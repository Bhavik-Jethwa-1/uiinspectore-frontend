import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Loader2, ChevronDown, ChevronUp, Filter,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Sparkles, Tag, ArrowUp, ArrowDown, Minus, RefreshCw,
  Search, Zap, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ── Best free text AI: Pollinations (no key needed)
async function generateAISuggestions(projectName, categories) {
  const catLabels = categories.join(', ');
  const prompt = `You are an expert UX/UI design consultant. For the project "${projectName}", generate exactly 6 specific, actionable UX improvement suggestions focused on: ${catLabels}.

For each suggestion, return a JSON object with:
- id: number (1-6)
- category: one of: ${catLabels}
- title: short actionable title (max 8 words)
- problem: specific UX problem found (1 sentence)
- reason: why this matters for users (1 sentence)
- impact: severity: "high" | "medium" | "low"
- recommendation: specific fix to implement (1-2 sentences)

Return ONLY a valid JSON array with exactly 6 items. Example:
[{"id":1,"category":"forms","title":"Add real-time validation","problem":"Form shows errors only after submission","reason":"Users feel frustrated when their input is rejected","impact":"high","recommendation":"Add inline validation as users type with helpful error messages."}]`;

  try {
    const encoded = encodeURIComponent(prompt);
    const res = await fetch(`https://text.pollinations.ai/${encoded}?model=openai&json=true`);
    if (res.ok) {
      const text = await res.text().catch(() => null);
      if (text) {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    }
  } catch (_) {}

  // Fallback: seeded local suggestions
  return buildLocalSuggestions(projectName, categories);
}

// ── Local fallback with seeded variety
function buildLocalSuggestions(projectName, categories) {
  const seed = (projectName || 'default').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (offset) => {
    const v = Math.abs(Math.sin(seed + offset * 127.1 + 311.7) % 1);
    return v;
  };

  const pool = [
    { category: 'forms',       title: 'Add floating label inputs',        problem: 'Static placeholder text disappears when users start typing.', reason: 'Users lose context of what field they\'re filling without the label visible.', impact: 'high',   recommendation: 'Convert placeholders to floating labels that animate above the field when focused.' },
    { category: 'forms',       title: 'Show inline validation feedback',  problem: 'Errors appear only after form submission, forcing users to re-guess.', reason: 'Immediate feedback reduces form completion time by up to 50%.', impact: 'high',   recommendation: 'Validate each field on blur with green checkmarks and red inline messages.' },
    { category: 'forms',       title: 'Auto-focus first error field',      problem: 'After validation errors, users must manually find and fix each field.', reason: 'Guiding users to the first error saves time and reduces frustration.', impact: 'medium', recommendation: 'On failed submission, auto-scroll and focus the first invalid field.' },
    { category: 'navigation',   title: 'Add breadcrumb navigation',         problem: 'Users get lost in deep pages with no way to backtrack easily.', reason: 'Breadcrumbs provide orientation and a quick escape route from nested views.', impact: 'high',   recommendation: 'Show full breadcrumb trail at the top of every inner page with clickable ancestors.' },
    { category: 'navigation',   title: 'Highlight active nav item',          problem: 'Current page isn\'t visually distinguished in the sidebar nav.', reason: 'Without visual cue, users can\'t tell where they are in the app.', impact: 'medium', recommendation: 'Use a bold/background style on the current nav item and disable its link.' },
    { category: 'navigation',   title: 'Add keyboard shortcuts overlay',    problem: 'Power users have no discoverable way to navigate faster.', reason: 'Keyboard shortcuts reduce mouse dependency and speed up frequent tasks.', impact: 'low',    recommendation: 'Add a ? shortcut that shows an overlay with all available keyboard shortcuts.' },
    { category: 'colors',       title: 'Increase CTA button contrast',      problem: 'Primary buttons don\'t meet WCAG AA 4.5:1 contrast ratio.', reason: 'Low contrast fails accessibility standards and makes CTAs hard to see.', impact: 'high',   recommendation: 'Darken button text or lighten button background until ratio exceeds 4.5:1.' },
    { category: 'colors',       title: 'Use semantic color tokens',         problem: 'Colors are hardcoded throughout, making rebranding impossible.', reason: 'Token-based colors allow one-line theme changes across the entire product.', impact: 'medium', recommendation: 'Define semantic tokens: --color-action: #7c5cff, --color-danger: #ef4444, and use them everywhere.' },
    { category: 'colors',       title: 'Add dark mode color palette',     problem: 'The interface is only designed for light mode.', reason: 'Users in low-light environments experience eye strain without dark mode.', impact: 'medium', recommendation: 'Define a dark-mode palette with inverted surfaces and softer accent colors.' },
    { category: 'components',   title: 'Standardize border radius tokens',  problem: 'Buttons, cards, and inputs all use inconsistent corner radii.', reason: 'Inconsistent radius creates a disjointed, unprofessional visual rhythm.', impact: 'medium', recommendation: 'Define 3 radius tokens: --radius-sm: 4px, --radius-md: 8px, --radius-lg: 16px and apply consistently.' },
    { category: 'components',   title: 'Add skeleton loading states',      problem: 'Async content shows blank space or spinners, causing layout shift.', reason: 'Skeleton screens maintain layout and signal activity without the spinner wait feel.', impact: 'high',   recommendation: 'Replace all loading spinners with shimmer skeleton components matching the content shape.' },
    { category: 'components',   title: 'Unify button style variants',      problem: 'There are 7 different button styles with no consistent pattern.', reason: 'Too many variants dilute brand identity and confuse users about hierarchy.', impact: 'low',    recommendation: 'Consolidate to 3 variants: Primary (filled), Secondary (outline), Ghost (text only).' },
    { category: 'layout',       title: 'Add consistent 8px spacing grid',  problem: 'Spacing between elements is arbitrary and visually inconsistent.', reason: 'An 8px grid creates visual rhythm and makes layouts feel intentional.', impact: 'medium', recommendation: 'Audit all padding/margin values and snap them to multiples of 8 (8, 16, 24, 32, 48).' },
    { category: 'layout',       title: 'Reduce hero section height',       problem: 'Above-the-fold content requires excessive scrolling to reach main features.', reason: 'Reducing hero from 80vh to ~50vh surfaces more content without scrolling.', impact: 'low',    recommendation: 'Shrink hero image or remove it on desktop; keep concise headline above 600px total height.' },
    { category: 'empty-states', title: 'Design first-use empty states',    problem: 'New users see blank screens with no guidance on how to get started.', reason: 'Empty states are the best place to onboard and show users their next action.', impact: 'high',   recommendation: 'Replace all empty screens with illustrations + headline + single primary CTA button.' },
    { category: 'empty-states', title: 'Add "no results" state to search',  problem: 'Failed searches show an empty list with no explanation or next step.', reason: 'A "no results" message with suggestions prevents user abandonment.', impact: 'medium', recommendation: 'Show "No results for [query]" with a "Clear filters" or "Try different keywords" CTA.' },
    { category: 'performance',  title: 'Lazy-load below-fold images',       problem: 'All images load at once, delaying LCP and increasing bandwidth.', reason: 'Images below the fold shouldn\'t block initial page render.', impact: 'high',   recommendation: 'Add loading="lazy" to all non-hero images and use WebP format.' },
    { category: 'performance',  title: 'Add skeleton for async data',       problem: 'Charts and tables load with visible delay, showing blank space.', reason: 'Skeleton loaders reduce perceived wait time and prevent layout shift.', impact: 'medium', recommendation: 'Wrap all async data regions in a shimmer skeleton matching content dimensions.' },
    { category: 'a11y',         title: 'Add ARIA labels to icon buttons',  problem: 'Icon-only buttons have no accessible name for screen readers.', reason: 'Without ARIA labels, screen reader users can\'t understand button purpose.', impact: 'high',   recommendation: 'Add aria-label="Close dialog" or aria-label="Delete item" to all icon buttons.' },
    { category: 'a11y',         title: 'Ensure all interactive elements keyboard-accessible', problem: 'Some modals and dropdowns can\'t be operated with Tab/Escape keys.', reason: 'Keyboard navigation is a WCAG requirement and helps power users.', impact: 'high',   recommendation: 'Test every flow using only keyboard. Add tabIndex, onKeyDown handlers, and focus traps to modals.' },
    { category: 'a11y',         title: 'Add skip-to-content link',         problem: 'Screen reader users must tab through all nav items before reaching content.', reason: 'A skip link lets users jump directly to main content.', impact: 'medium', recommendation: 'Add <a href="#main">Skip to content</a> as the first focusable element on every page.' },
    { category: 'dashboard',    title: 'Show data freshness timestamp',    problem: 'Users can\'t tell if dashboard data is current or stale.', reason: 'Outdated data without context leads to poor business decisions.', impact: 'medium', recommendation: 'Add "Last updated: 3 minutes ago" timestamp to all dashboard data sections.' },
    { category: 'dashboard',    title: 'Add export to CSV/PDF',             problem: 'Users can\'t take dashboard data offline for reports.', reason: 'Export functionality enables users to share data in their preferred format.', impact: 'low',    recommendation: 'Add a "Export" dropdown to chart and table sections with CSV and PDF options.' },
    { category: 'onboarding',   title: 'Add tooltips to first-use features', problem: 'New users don\'t understand what certain UI elements do.', reason: 'Contextual tooltips reduce support tickets and speed up feature discovery.', impact: 'medium', recommendation: 'Identify 5 key UI elements and add dismissible tooltip tour on first visit.' },
    { category: 'onboarding',   title: 'Progress indicator for setup wizard', problem: 'Multi-step setup flows show no progress, making completion feel distant.', reason: 'Progress bars increase completion rates by giving users a visible finish line.', impact: 'medium', recommendation: 'Add a step indicator (1 of 4) with completed step checkmarks at the top of the wizard.' },
  ];

  const priorities = ['high', 'medium', 'low'];
  const selectedCats = categories.length > 0 ? categories : ['forms', 'navigation', 'colors', 'components', 'layout', 'empty-states'];

  const filtered = pool.filter(s => selectedCats.includes(s.category));
  const scored = filtered.map((s, i) => ({ ...s, _score: rand(i) }));
  scored.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.impact] !== priorityOrder[b.impact]) {
      return priorityOrder[a.impact] - priorityOrder[b.impact];
    }
    return a._score - b._score;
  });

  return scored.slice(0, 7).map((s, i) => ({ ...s, id: i + 1 }));
}

const CATEGORIES = [
  { id: 'forms',       label: 'Forms',        icon: '📋', color: '#7c5cff' },
  { id: 'navigation',  label: 'Navigation',   icon: '🧭', color: '#3b82f6' },
  { id: 'colors',      label: 'Colors',        icon: '🎨', color: '#10b981' },
  { id: 'components',  label: 'Components',   icon: '🧩', color: '#f59e0b' },
  { id: 'layout',      label: 'Layout',        icon: '📐', color: '#ec4899' },
  { id: 'empty-states',label: 'Empty States', icon: '📭', color: '#06b6d4' },
  { id: 'performance', label: 'Performance',  icon: '⚡', color: '#8b5cf6' },
  { id: 'a11y',        label: 'Accessibility',icon: '♿', color: '#14b8a6' },
  { id: 'dashboard',   label: 'Dashboard',     icon: '📊', color: '#f97316' },
  { id: 'onboarding',   label: 'Onboarding',    icon: '🚀', color: '#84cc16' },
];

const IMPACT_META = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: AlertTriangle,  arrow: '↑' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Minus,          arrow: '—' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2,   arrow: '↓' },
};

export default function AISuggestionsPage() {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [selectedCats, setSelectedCats] = useState(['forms', 'navigation', 'colors']);
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [source, setSource] = useState('local');

  const toggleCat = (id) => {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const runSuggestions = async () => {
    if (selectedCats.length === 0) return;
    const name = projectName.trim() || 'My Project';
    setLoading(true);
    setExpanded({});
    setSuggestions([]);

    // Run AI generation in background
    setAiLoading(true);
    try {
      const aiResults = await generateAISuggestions(name, selectedCats);
      setSuggestions(aiResults);
      setSource('ai');
    } catch (_) {}
    setAiLoading(false);
    setLoading(false);
  };

  const refreshSuggestion = async (id) => {
    const name = projectName.trim() || 'My Project';
    const cat = suggestions.find(s => s.id === id)?.category || selectedCats[0];
    const fresh = await buildLocalSuggestions(name + ' variant', [cat]);
    setSuggestions(prev => prev.map(s => s.id === id ? { ...fresh[0], id } : s));
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === 'all') return true;
    return s.impact === filter;
  });

  const counts = suggestions.reduce((acc, s) => {
    acc[s.impact] = (acc[s.impact] || 0) + 1;
    return acc;
  }, {});

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...filteredSuggestions].sort(
    (a, b) => priorityOrder[a.impact] - priorityOrder[b.impact]
  );

  return (
    <div className="sug-page">
      {/* Header */}
      <div className="sug-header">
        <div className="sug-header-left">
          <div className="sug-header-icon"><Lightbulb size={18} /></div>
          <div>
            <h2 className="sug-header-title">AI Suggestions</h2>
            <p className="sug-header-sub">Smart UX recommendations powered by AI analysis</p>
          </div>
        </div>
        <div className="sug-header-right">
          {source === 'ai' && !aiLoading && (
            <div className="sug-ai-badge">
              <Sparkles size={11} /> AI-generated
            </div>
          )}
          {aiLoading && (
            <div className="sug-ai-badge loading">
              <Loader2 size={11} className="spin" /> Generating…
            </div>
          )}
        </div>
      </div>

      <div className="sug-layout">

        {/* ── LEFT PANEL ── */}
        <div className="sug-left">
          <div className="sug-widget">
            <div className="sug-widget-label">
              <BookOpen size={11} />
              Project name
            </div>
            <input
              className="sug-text-input"
              placeholder="My SaaS App"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runSuggestions()}
            />
          </div>

          <div className="sug-widget">
            <div className="sug-widget-label">
              <Filter size={11} />
              Focus areas
            </div>
            <div className="sug-cat-list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`sug-cat-btn ${selectedCats.includes(cat.id) ? 'active' : ''}`}
                  style={selectedCats.includes(cat.id) ? { '--cc': cat.color, '--ccb': cat.color + '1e' } : {}}
                  onClick={() => toggleCat(cat.id)}
                >
                  <span className="sug-cat-icon">{cat.icon}</span>
                  <span className="sug-cat-label">{cat.label}</span>
                  {selectedCats.includes(cat.id) && <CheckCircle2 size={11} style={{ color: cat.color, marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="sug-widget">
            <div className="sug-widget-label">
              <Zap size={11} />
              Priority filter
            </div>
            <div className="sug-filter-row">
              {['all', 'high', 'medium', 'low'].map(f => {
                const meta = IMPACT_META[f];
                const Icon = meta?.icon || Filter;
                return (
                  <button
                    key={f}
                    className={`sug-filter-btn ${filter === f ? 'active' : ''}`}
                    style={filter === f && meta ? { '--fc': meta.color, '--fcb': meta.bg } : {}}
                    onClick={() => setFilter(f)}
                  >
                    {f !== 'all' && <Icon size={10} />}
                    <span>{f === 'all' ? 'All' : meta?.label}</span>
                    {counts[f] > 0 && <span className="sug-filter-count">{counts[f]}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {sorted.length > 0 && (
            <div className="sug-widget sug-stats">
              <div className="sug-stats-title">Priority breakdown</div>
              {Object.entries(counts).sort((a, b) => priorityOrder[a[0]] - priorityOrder[b[0]]).map(([k, v]) => {
                const pct = Math.round((v / suggestions.length) * 100);
                const meta = IMPACT_META[k];
                return (
                  <div key={k} className="sug-stat-row">
                    <div className="sug-stat-label" style={{ color: meta?.color }}>
                      <span>{meta?.arrow}</span> {meta?.label}
                    </div>
                    <div className="sug-stat-track">
                      <div className="sug-stat-fill" style={{ width: `${pct}%`, background: meta?.color }} />
                    </div>
                    <div className="sug-stat-num">{v}</div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="sug-run-btn"
            onClick={runSuggestions}
            disabled={selectedCats.length === 0 || loading}
          >
            {loading ? (
              <><Loader2 size={14} className="spin" /><span>Generating…</span></>
            ) : (
              <><Sparkles size={14} /><span>Get AI Suggestions</span></>
            )}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="sug-right">
          <div className="sug-list">
            {sorted.length === 0 && !loading && (
              <div className="sug-empty">
                <div className="sug-empty-icon">
                  <Lightbulb size={36} strokeWidth={1.3} />
                </div>
                <h3>No suggestions yet</h3>
                <p>Select focus areas and click <strong>Get AI Suggestions</strong> to receive actionable UX recommendations for your project.</p>
              </div>
            )}

            <AnimatePresence>
              {sorted.map((s, idx) => {
                const meta = IMPACT_META[s.impact];
                const Icon = meta?.icon || Lightbulb;
                const isOpen = !!expanded[s.id];

                return (
                  <motion.div
                    key={s.id}
                    className="sug-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3 }}
                    style={{ '--card-accent': meta?.color }}
                  >
                    <div className="sug-card-header" onClick={() => setExpanded(prev => ({ ...prev, [s.id]: !prev[s.id] }))}>
                      <div className="sug-card-left">
                        <div className="sug-card-priority" style={{ color: meta?.color, background: meta?.bg }}>
                          <Icon size={11} />
                          <span>{meta?.label}</span>
                        </div>
                        <h3 className="sug-card-title">{s.title}</h3>
                        <div className="sug-card-cat">
                          <Tag size={9} />
                          <span>{s.category.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <div className="sug-card-right">
                        <button
                          className="sug-refresh-btn"
                          onClick={(e) => { e.stopPropagation(); refreshSuggestion(s.id); }}
                          title="Get different suggestion"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <div className={`sug-chevron ${isOpen ? 'open' : ''}`}>
                          <ChevronDown size={15} />
                        </div>
                      </div>
                    </div>

                    <div className="sug-card-summary">{s.problem}</div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="sug-card-body"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="sug-detail-grid">
                            <div className="sug-detail-cell problem">
                              <div className="sug-detail-label">Problem</div>
                              <div className="sug-detail-text">{s.problem}</div>
                            </div>
                            <div className="sug-detail-cell reason">
                              <div className="sug-detail-label">Reason</div>
                              <div className="sug-detail-text">{s.reason}</div>
                            </div>
                            <div className="sug-detail-cell impact">
                              <div className="sug-detail-label">Impact</div>
                              <div className="sug-detail-impact" style={{ color: meta?.color, background: meta?.bg }}>
                                <Icon size={12} />
                                <span>{meta?.label} priority</span>
                              </div>
                            </div>
                            <div className="sug-detail-cell recommendation">
                              <div className="sug-detail-label">Recommendation</div>
                              <div className="sug-detail-text">{s.recommendation}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
