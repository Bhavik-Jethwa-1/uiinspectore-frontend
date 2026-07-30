/**
 * AIResearchPage — Design research powered by MiniMax-M2.7.
 * Uses the unified /api/ai/research endpoint (MiniMaxService).
 *
 * Flow:
 *   1. Select a topic from presets OR type a custom query
 *   2. AI returns { trends[], competitors[], tools[], inspiration[] }
 *   3. Map to findings{ title, summary, sections[], sources[] } for display
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Search, ArrowRight, Loader2, X,
  Lightbulb, Users, Globe, Star, BookOpen,
  ChevronRight, Shield, TrendingUp, Palette, Layout,
  Compass, Zap, BarChart3, CheckCircle2, Tag, Plus
} from 'lucide-react';
import api from '../utils/api';

const TOPICS = [
  { id: 'ui_trends',     title: 'UI Design Trends',      desc: 'Latest UI patterns & aesthetics',        icon: Palette,      color: '#7c5cff', bg: 'rgba(124,92,255,0.12)' },
  { id: 'ux_best',       title: 'UX Best Practices',     desc: 'Proven UX patterns & methodologies',   icon: Compass,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { id: 'accessibility', title: 'Accessibility',          desc: 'WCAG compliance & inclusive design',    icon: Shield,       color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { id: 'dashboard',     title: 'Dashboard Design',       desc: 'Data viz, metrics & admin panels',    icon: BarChart3,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'mobile',        title: 'Mobile UX',              desc: 'Mobile-first patterns & gestures',      icon: Zap,          color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { id: 'landing',       title: 'Landing Pages',          desc: 'Conversion optimization & layout',     icon: TrendingUp,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { id: 'design_sys',   title: 'Design Systems',         desc: 'Components, tokens & consistency',     icon: Layout,       color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { id: 'product',       title: 'Product Strategy',        desc: 'Roadmap, personas & positioning',    icon: Star,         color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
];

const QUICK_PROMPTS = [
  'Best navigation patterns for B2B SaaS dashboards?',
  'Mobile app onboarding UX best practices 2025',
  'Color psychology in dark mode interfaces',
  'Accessibility WCAG 2.2 checklist for startups',
];

/* Map MiniMax research response → findings shape expected by display */
function mapResearchToFindings(topic, parsed) {
  const trends = parsed?.trends || [];
  const competitors = parsed?.competitors || [];
  const tools = parsed?.tools || [];
  const inspiration = parsed?.inspiration || [];

  const sections = [
    ...trends.slice(0, 6).map(t => ({
      heading: t.length > 50 ? t.slice(0, 50) + '…' : t,
      body: t,
    })),
    ...competitors.slice(0, 4).map(c => ({
      heading: c.name || 'Competitor',
      body: c.strengths ? c.strengths.join('. ') : '',
    })),
  ];

  const sources = [
    ...inspiration.map(i => ({ name: i.name || '', url: i.url || '#' })),
    ...tools.map(t => ({ name: t.name || '', url: t.url || '#' })),
  ].slice(0, 8);

  const summary = trends.length > 0
    ? trends.slice(0, 3).join(' ')
    : `${topic} — research findings from AI analysis.`;

  return {
    title: topic,
    summary: summary.slice(0, 300) + (summary.length > 300 ? '…' : ''),
    sections,
    sources,
  };
}

export default function AIResearchPage() {
  const [researching, setResearching] = useState(false);
  const [findings, setFindings] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [stage, setStage] = useState('');

  const startResearch = async (topicObj) => {
    if (researching) return;
    setSelectedTopic(topicObj);
    setFindings(null);
    setError('');
    setResearching(true);

    const stages = ['Analyzing…', 'Searching…', 'Comparing…', 'Generating insights…'];
    let idx = 0;
    const ticker = setInterval(() => {
      setStage(stages[Math.min(idx++, stages.length - 1)]);
    }, 800);

    try {
      const response = await api.request('/ai/research', {
        method: 'POST',
        body: { topic: topicObj.title, query: topicObj.desc || '' },
      });

      clearInterval(ticker);
      setStage('');

      const parsed = response?.parsed || response || {};
      const mapped = mapResearchToFindings(topicObj.title, parsed);
      setFindings(mapped);

      setHistory(h => [
        { id: topicObj.id, title: topicObj.title, at: Date.now(), topic: topicObj },
        ...h.filter(x => x.id !== topicObj.id),
      ].slice(0, 8));
    } catch (err) {
      clearInterval(ticker);
      setStage('');
      setError(err.message || 'Research failed. Please try again.');
    } finally {
      setResearching(false);
    }
  };

  const handleCustom = (e) => {
    e.preventDefault();
    if (!customQuery.trim() || researching) return;
    const topicObj = {
      id: 'custom',
      title: customQuery.trim().slice(0, 60),
      desc: customQuery.trim(),
      icon: Search,
      color: '#7c5cff',
      bg: 'rgba(124,92,255,0.12)',
    };
    setCustomQuery('');
    startResearch(topicObj);
  };

  const clearFindings = () => {
    setFindings(null);
    setSelectedTopic(null);
    setError('');
  };

  return (
    <div className="air-page flex flex-col h-full overflow-hidden">
      {/* ─── Header ─── */}
      <div className="air-hero">
        <div className="air-hero-left">
          <div className="air-hero-badge">
            <Sparkles size={11} />
            AI Research
          </div>
          <h1 className="air-hero-title">Research anything,<br />instantly.</h1>
          <p className="air-hero-sub">Deep-dive insights on UX, UI, design systems, accessibility & more</p>
        </div>

        {/* Search bar */}
        <form className="air-hero-search" onSubmit={handleCustom}>
          <div className="air-hero-search-inner">
            <Search size={18} className="air-hero-search-icon" />
            <input
              type="text"
              className="air-hero-search-input"
              placeholder="Ask anything… e.g. Best mobile navigation for SaaS"
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
            />
            <button type="submit" className="air-hero-search-btn" disabled={!customQuery.trim() || researching}>
              {researching ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </div>
          <div className="air-quick-prompts">
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                type="button"
                className="air-quick-prompt"
                onClick={() => {
                  setCustomQuery(q);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* ─── Topic grid ─── */}
      {!findings && (
        <div className="air-topics-grid">
          <h2 className="air-section-title">Popular Topics</h2>
          <div className="air-topics">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  className="air-topic-card"
                  onClick={() => startResearch(topic)}
                  disabled={researching}
                  style={{ '--topic-color': topic.color, '--topic-bg': topic.bg }}
                >
                  <div className="air-topic-icon" style={{ background: topic.bg }}>
                    <Icon size={18} color={topic.color} />
                  </div>
                  <div className="air-topic-info">
                    <span className="air-topic-title">{topic.title}</span>
                    <span className="air-topic-desc">{topic.desc}</span>
                  </div>
                  {researching && selectedTopic?.id === topic.id && (
                    <Loader2 size={14} className="animate-spin" style={{ color: topic.color, marginLeft: 'auto' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Loading state ─── */}
      {researching && (
        <div className="air-loading">
          <div className="air-loading-icon">
            <Sparkles size={24} color="#7c5cff" />
          </div>
          <p className="air-loading-stage">{stage}</p>
          <p className="air-loading-hint">Analyzing design trends and competitor insights…</p>
        </div>
      )}

      {/* ─── Error state ─── */}
      {!researching && error && (
        <div className="air-error">
          <p>⚠ {error}</p>
          <button onClick={() => setError('')}>Try again</button>
        </div>
      )}

      {/* ─── Results ─── */}
      {!researching && findings && (
        <motion.div
          className="air-results flex-1 overflow-y-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Result header */}
          <div className="air-result-header">
            <div className="air-result-header-left">
              <div className="air-result-icon" style={{ background: selectedTopic?.bg }}>
                {selectedTopic && (() => {
                  const Icon = selectedTopic.icon;
                  return <Icon size={20} color={selectedTopic.color} />;
                })()}
              </div>
              <div>
                <h2 className="air-result-title">{findings.title}</h2>
                <div className="air-result-meta">
                  <span className="air-result-badge">
                    <Sparkles size={10} />
                    {findings.sections?.length || 0} Insights
                  </span>
                  <span className="air-result-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    <BookOpen size={10} />
                    {findings.sources?.length || 0} Sources
                  </span>
                </div>
              </div>
            </div>
            <div className="air-result-header-right">
              <button className="air-new-btn" onClick={clearFindings}>
                <Sparkles size={13} />
                New Research
              </button>
              <button className="air-close-btn" onClick={clearFindings}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Summary */}
          {findings.summary && (
            <motion.div
              className="air-summary-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="air-summary-icon">
                <Sparkles size={16} color="#7c5cff" />
              </div>
              <p>{findings.summary}</p>
            </motion.div>
          )}

          {/* Insights */}
          <div className="air-insights-list">
            {findings.sections?.map((sec, i) => (
              <motion.div
                key={i}
                className="air-insight-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
              >
                <div className="air-insight-num" style={{ background: selectedTopic?.bg, color: selectedTopic?.color }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="air-insight-content">
                  <div className="air-insight-header">
                    <Lightbulb size={13} color="#f59e0b" />
                    <h4>{sec.heading}</h4>
                  </div>
                  <div className="air-insight-body">
                    {sec.body.split('\n').map((line, idx) => {
                      const t = line.trim();
                      if (!t) return null;
                      if (t.startsWith('- ') || t.startsWith('• ')) {
                        return <p key={idx} className="air-bullet">• {t.slice(2)}</p>;
                      }
                      return <p key={idx}>{t}</p>;
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sources */}
          {findings.sources?.length > 0 && (
            <div className="air-sources-section">
              <h3 className="air-sources-title">
                <BookOpen size={14} />
                Sources &amp; Further Reading
              </h3>
              <div className="air-sources-grid">
                {findings.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="air-source-card"
                  >
                    <span className="air-source-num">{i + 1}</span>
                    <span className="air-source-name">{s.name}</span>
                    <ChevronRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <style>{`
        .air-page { background: #0e0e16; min-height: 100vh; }
        .air-hero { display: flex; gap: 32px; padding: 28px 32px; align-items: center; border-bottom: 1px solid #1e1e2a; }
        .air-hero-left { flex-shrink: 0; }
        .air-hero-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; background: rgba(124,92,255,0.1); color: #9d7aff; border: 1px solid rgba(124,92,255,0.2); margin-bottom: 10px; }
        .air-hero-title { font-size: 26px; font-weight: 800; line-height: 1.2; color: #f0f0fa; margin-bottom: 8px; }
        .air-hero-sub { font-size: 13px; color: #5a5a6a; }
        .air-hero-search { flex: 1; max-width: 500px; }
        .air-hero-search-inner { position: relative; display: flex; align-items: center; }
        .air-hero-search-icon { position: absolute; left: 14px; color: #4a4a5a; }
        .air-hero-search-input { width: 100%; padding: 12px 44px 12px 42px; background: #13131C; border: 1px solid #252535; border-radius: 14px; color: #e0e0f0; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .air-hero-search-input:focus { border-color: #7c5cff; }
        .air-hero-search-input::placeholder { color: #3a3a4a; }
        .air-hero-search-btn { position: absolute; right: 10px; width: 30px; height: 30px; border-radius: 8px; background: #7c5cff; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; }
        .air-hero-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .air-quick-prompts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .air-quick-prompt { padding: 5px 12px; border-radius: 20px; font-size: 11px; background: rgba(255,255,255,0.03); border: 1px solid #252535; color: #6b6b7b; cursor: pointer; transition: all 0.2s; }
        .air-quick-prompt:hover { background: rgba(124,92,255,0.08); color: #9d7aff; border-color: rgba(124,92,255,0.2); }
        .air-topics-grid { padding: 24px 32px; }
        .air-section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #4a4a5a; margin-bottom: 14px; }
        .air-topics { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
        .air-topic-card { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 14px; background: #13131C; border: 1px solid #1e1e2a; cursor: pointer; transition: all 0.2s; text-align: left; }
        .air-topic-card:hover:not(:disabled) { border-color: var(--topic-color, #7c5cff); background: #16162a; }
        .air-topic-card:disabled { opacity: 0.5; cursor: not-allowed; }
        .air-topic-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .air-topic-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .air-topic-title { font-size: 13px; font-weight: 600; color: #d0d0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .air-topic-desc { font-size: 11px; color: #4a4a5a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .air-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 32px; gap: 12px; }
        .air-loading-icon { width: 52px; height: 52px; border-radius: 16px; background: rgba(124,92,255,0.1); border: 1px solid rgba(124,92,255,0.2); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite; }
        .air-loading-stage { font-size: 15px; font-weight: 600; color: #c0c0d0; }
        .air-loading-hint { font-size: 12px; color: #4a4a5a; }
        .air-error { margin: 20px 32px; padding: 14px 18px; border-radius: 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; font-size: 13px; display: flex; align-items: center; justify-content: space-between; }
        .air-error button { font-size: 12px; padding: 4px 12px; border-radius: 6px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; cursor: pointer; }
        .air-results { padding: 20px 32px 40px; }
        .air-result-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; }
        .air-result-header-left { display: flex; align-items: center; gap: 14px; }
        .air-result-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .air-result-title { font-size: 18px; font-weight: 800; color: #f0f0fa; margin-bottom: 6px; }
        .air-result-meta { display: flex; gap: 8px; }
        .air-result-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 3px 8px; border-radius: 6px; background: rgba(124,92,255,0.08); color: #9d7aff; }
        .air-result-header-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .air-new-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 600; background: rgba(124,92,255,0.1); border: 1px solid rgba(124,92,255,0.2); color: #9d7aff; cursor: pointer; transition: all 0.2s; }
        .air-new-btn:hover { background: rgba(124,92,255,0.18); }
        .air-close-btn { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid #252535; color: #6b6b7b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .air-close-btn:hover { background: rgba(255,255,255,0.08); color: #d0d0e0; }
        .air-summary-card { display: flex; gap: 12px; padding: 16px; border-radius: 14px; background: rgba(124,92,255,0.06); border: 1px solid rgba(124,92,255,0.15); margin-bottom: 20px; font-size: 13px; color: #c0c0d0; line-height: 1.6; }
        .air-summary-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(124,92,255,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .air-insights-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
        .air-insight-card { display: flex; gap: 14px; padding: 16px; border-radius: 14px; background: #13131C; border: 1px solid #1e1e2a; }
        .air-insight-num { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-black flex-shrink: 0; margin-top: 1px; }
        .air-insight-content { flex: 1; min-width: 0; }
        .air-insight-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .air-insight-header h4 { font-size: 13px; font-weight: 600; color: #e0e0f0; }
        .air-insight-body { font-size: 12px; color: #8888a0; line-height: 1.6; }
        .air-insight-body p { margin-bottom: 4px; }
        .air-bullet { padding-left: 4px; }
        .air-sources-section { border-top: 1px solid #1e1e2a; padding-top: 20px; }
        .air-sources-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #4a4a5a; margin-bottom: 12px; }
        .air-sources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
        .air-source-card { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; background: #13131C; border: 1px solid #1e1e2a; color: #8888a0; text-decoration: none; font-size: 12px; transition: all 0.2s; }
        .air-source-card:hover { border-color: #7c5cff; color: #c0c0d0; background: #16162a; }
        .air-source-num { font-size: 10px; font-weight: 700; color: #4a4a5a; flex-shrink: 0; }
        .air-source-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
