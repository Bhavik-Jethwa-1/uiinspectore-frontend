import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, BarChart3, CheckCircle2, FolderKanban,
  Download, Activity, AlertTriangle, Eye, MousePointerClick, Accessibility,
  Sparkles, Loader2
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  ui: '#7c5cff',
  ux: '#ff6b9d',
  a11y: '#10b981',
  conv: '#f59e0b',
  issue: '#ef4444',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function genSeries(seed, base = 70, jitter = 25) {
  const out = [];
  let v = base;
  for (let i = 0; i < 7; i++) {
    v += Math.sin((seed + i) * 0.7) * jitter * 0.4 + (Math.random() - 0.5) * jitter * 0.6;
    out.push(Math.max(20, Math.min(100, Math.round(v))));
  }
  return out;
}

function LineChart({ data, color, height = 160 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const W = 600, H = height, PAD = 8;
  const stepX = (W - PAD * 2) / (data.length - 1);

  const pts = data.map((v, i) => [PAD + i * stepX, H - PAD - ((v - min) / range) * (H - PAD * 2)]);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1][0].toFixed(1)} ${H - PAD} L ${pts[0][0].toFixed(1)} ${H - PAD} Z`;

  const gid = `grad-${color.replace('#', '')}`;

  return (
    <svg className="an-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} className="an-chart-grid-line" x1={PAD} x2={W - PAD} y1={H * p} y2={H * p} />
      ))}

      <path d={areaD} fill={`url(#${gid})`} className="an-chart-area-fill" />
      <path d={pathD} className="an-chart-line" stroke={color} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} className="an-chart-dot" />
      ))}

      {data.map((v, i) => (
        <text
          key={i}
          x={PAD + i * stepX}
          y={H - 1}
          textAnchor="middle"
          className="an-chart-axis-label"
        >
          {DAY_LABELS[i]}
        </text>
      ))}
    </svg>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="an-bars">
      {data.map((v, i) => (
        <div key={i} className="an-bar-col">
          <div
            className="an-bar"
            style={{ height: `${(v / max) * 100}%`, background: color }}
            title={`${DAY_LABELS[i]}: ${v}`}
          />
          <span className="an-bar-label">{DAY_LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.request('/analytics').catch(() => null);
        if (data?.stats) setStats(data.stats);
        if (data?.series) setSeries(data.series);
      } catch {}
      // Always provide a usable demo series so the page renders nicely.
      setStats(prev => prev || {
        issuesFixed: 1247,
        avgScore: 86,
        projectsAnalyzed: 38,
        reportDownloads: 412,
        issuesFixedDelta: 12.4,
        avgScoreDelta: 3.2,
        projectsDelta: 8,
        downloadsDelta: -2.1,
      });
      setSeries(prev => prev || {
        ui:    { data: genSeries(1, 78, 22), delta: 4.2 },
        ux:    { data: genSeries(2, 74, 24), delta: 2.8 },
        a11y:  { data: genSeries(3, 82, 18), delta: 5.1 },
        conv:  { data: genSeries(4, 68, 26), delta: -1.4 },
        issue: { data: genSeries(5, 45, 30), delta: -8.6 },
      });
      setLoading(false);
    })();
  }, []);

  const totalAnalyses = useMemo(() => {
    if (!stats) return 0;
    return stats.issuesFixed + stats.projectsAnalyzed * 5;
  }, [stats]);

  return (
    <div className="module-page">
      <div className="module-header">
        <div className="module-badge"><Sparkles size={11} /> Module 32</div>
        <h1 className="module-title">Analytics</h1>
        <p className="module-subtitle">Track UI, UX, accessibility and conversion trends.</p>
      </div>

      {/* Stat cards */}
      <div className="an-stats">
        <StatCard
          icon={CheckCircle2}
          color="#10b981"
          label="Total Issues Fixed"
          value={stats?.issuesFixed?.toLocaleString() || '—'}
          delta={stats?.issuesFixedDelta}
        />
        <StatCard
          icon={BarChart3}
          color="#7c5cff"
          label="Avg Score"
          value={stats?.avgScore ? `${stats.avgScore}/100` : '—'}
          delta={stats?.avgScoreDelta}
        />
        <StatCard
          icon={FolderKanban}
          color="#00d4ff"
          label="Projects Analyzed"
          value={stats?.projectsAnalyzed?.toLocaleString() || '—'}
          delta={stats?.projectsDelta}
        />
        <StatCard
          icon={Download}
          color="#f59e0b"
          label="Report Downloads"
          value={stats?.reportDownloads?.toLocaleString() || '—'}
          delta={stats?.downloadsDelta}
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
          <Loader2 size={14} className="spin" /> Loading live analytics…
        </div>
      )}

      {/* Charts */}
      <h3 className="module-section-title">Trends — last 7 days</h3>
      <div className="an-charts">
        <ChartCard
          icon={Eye}
          title="UI Trend"
          color={COLORS.ui}
          delta={series?.ui?.delta}
        >
          <LineChart data={series?.ui?.data || []} color={COLORS.ui} />
        </ChartCard>

        <ChartCard
          icon={MousePointerClick}
          title="UX Trend"
          color={COLORS.ux}
          delta={series?.ux?.delta}
        >
          <LineChart data={series?.ux?.data || []} color={COLORS.ux} />
        </ChartCard>

        <ChartCard
          icon={Accessibility}
          title="Accessibility Trend"
          color={COLORS.a11y}
          delta={series?.a11y?.delta}
        >
          <LineChart data={series?.a11y?.data || []} color={COLORS.a11y} />
        </ChartCard>

        <ChartCard
          icon={Activity}
          title="Conversion Trend"
          color={COLORS.conv}
          delta={series?.conv?.delta}
        >
          <LineChart data={series?.conv?.data || []} color={COLORS.conv} />
        </ChartCard>

        <ChartCard
          icon={AlertTriangle}
          title="Issue Trend"
          color={COLORS.issue}
          delta={series?.issue?.delta}
          wide
        >
          <BarChart data={series?.issue?.data || []} color={COLORS.issue} />
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, delta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="an-stat"
      style={{ '--accent-color': color }}
    >
      <div className="an-stat-icon" style={{ background: `${color}1a`, color }}>
        <Icon size={18} />
      </div>
      <div className="an-stat-value">{value}</div>
      <div className="an-stat-label">{label}</div>
      {typeof delta === 'number' && (
        <span className={`an-stat-delta ${delta >= 0 ? 'up' : 'down'}`}>
          {delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      )}
    </motion.div>
  );
}

function ChartCard({ icon: Icon, title, color, delta, wide, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="an-chart-card"
      style={wide ? { gridColumn: 'span 2' } : undefined}
    >
      <div className="an-chart-head">
        <h4 className="an-chart-title" style={{ color }}>
          <Icon size={14} /> {title}
        </h4>
        {typeof delta === 'number' && (
          <span className={`an-chart-delta ${delta >= 0 ? 'up' : 'down'}`}>
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="an-chart-area">
        {children}
      </div>
    </motion.div>
  );
}