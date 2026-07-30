import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wand2, PencilRuler, LayoutTemplate, Settings,
  FolderKanban, Upload, Eye, Monitor, Navigation, Accessibility,
  BarChart3, LandPlot, FormInput, Search, FileText, MessageCircle,
  Bot, Zap, Brain, Users, CreditCard, Puzzle, LogIn, UserPlus,
  ChevronRight, Search as SearchIcon, Route, Sparkles, Layers,
  ClipboardList, BarChart, Shield,
} from 'lucide-react';

// All routes with their metadata
const ROUTES_CONFIG = [
  // Auth
  {
    group: 'Auth',
    isAuth: true,
    items: [
      { path: '/login',    label: 'Login',    icon: LogIn,    desc: 'Sign in to your account' },
      { path: '/register', label: 'Register', icon: UserPlus,  desc: 'Create a new account' },
    ],
  },
  // Core
  {
    group: 'Core',
    items: [
      { path: '/app/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, desc: 'Overview & stats' },
      { path: '/app/editor/new',   label: 'Editor',       icon: PencilRuler,    desc: 'Canvas editor for mockups' },
      { path: '/app/autodesigner', label: 'Autodesigner',  icon: Wand2,          desc: 'AI-powered design generation' },
      { path: '/app/templates',    label: 'Templates',     icon: LayoutTemplate, desc: 'Pre-built UI templates' },
    ],
  },
  // Workspace
  {
    group: 'Workspace',
    items: [
      { path: '/app/projects', label: 'Projects',   icon: FolderKanban, desc: 'Manage your projects' },
      { path: '/app/upload',   label: 'Screenshots', icon: Upload,      desc: 'Upload & manage screenshots' },
    ],
  },
  // Analysis
  {
    group: 'Analysis',
    items: [
      { path: '/app/analysis/ui',           label: 'UI Analysis',      icon: Monitor,       desc: 'Visual & layout analysis' },
      { path: '/app/analysis/ux',           label: 'UX Analysis',      icon: Navigation,   desc: 'User experience audit' },
      { path: '/app/analysis/accessibility', label: 'Accessibility',   icon: Accessibility, desc: 'WCAG compliance check' },
      { path: '/app/analysis/dashboard',     label: 'Dashboard Analysis', icon: BarChart3,  desc: 'Dashboard-specific review' },
      { path: '/app/analysis/landing',       label: 'Landing Page',     icon: LandPlot,    desc: 'Landing page audit' },
      { path: '/app/analysis/form',          label: 'Forms',            icon: FormInput,    desc: 'Form & input analysis' },
      { path: '/app/analysis/navigation',    label: 'Navigation',       icon: Navigation,   desc: 'Nav & flow analysis' },
    ],
  },
  // AI Tools
  {
    group: 'AI Tools',
    items: [
      { path: '/app/ai/research',     label: 'AI Research',     icon: Search,        desc: 'UX & UI trend research' },
      { path: '/app/ai/annotate',    label: 'Annotation',     icon: Layers,         desc: 'Mark up & annotate designs' },
      { path: '/app/ai/detect',      label: 'Issue Detection', icon: Zap,           desc: 'Auto-detect UI issues' },
      { path: '/app/ai/suggestions', label: 'AI Suggestions', icon: Sparkles,       desc: 'Smart design recommendations' },
      { path: '/app/ai/redesign',    label: 'AI Redesign',   icon: Wand2,          desc: 'AI-powered redesign suggestions' },
      { path: '/app/ai/copywriting', label: 'AI Copywriting', icon: FileText,       desc: 'Microcopy & content generation' },
      { path: '/app/ai/chat',        label: 'AI Chat',        icon: MessageCircle,  desc: 'Conversational AI assistant' },
      { path: '/app/ai/second-brain',label: 'AI Second Brain', icon: Brain,         desc: 'Your personal knowledge base' },
    ],
  },
  // Reports
  {
    group: 'Reports',
    items: [
      { path: '/app/reports',   label: 'Reports',   icon: ClipboardList, desc: 'Exportable analysis reports' },
      { path: '/app/analytics', label: 'Analytics', icon: BarChart,      desc: 'Trends & performance data' },
    ],
  },
  // Team
  {
    group: 'Team',
    items: [
      { path: '/app/team',  label: 'Team',  icon: Users,     desc: 'Manage team members' },
      { path: '/app/tasks', label: 'Tasks', icon: FileText,   desc: 'Tasks & assignments' },
    ],
  },
  // Integrations
  {
    group: 'Integrations',
    items: [
      { path: '/app/integrations', label: 'Integrations', icon: Puzzle,  desc: 'Third-party integrations' },
    ],
  },
  // Settings
  {
    group: 'Settings',
    items: [
      { path: '/app/settings', label: 'Settings', icon: Settings,    desc: 'App preferences' },
      { path: '/app/billing',  label: 'Billing',  icon: CreditCard,  desc: 'Plans & subscription' },
      { path: '/app/admin',   label: 'Admin',    icon: Shield,      desc: 'Admin panel' },
    ],
  },
];

export default function RoutesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = ROUTES_CONFIG
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !search ||
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.path.toLowerCase().includes(search.toLowerCase()) ||
          item.desc.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const totalRoutes = ROUTES_CONFIG.reduce((acc, g) => acc + g.items.length, 0);
  const filteredCount = filtered.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="module-page routes-page">

      {/* Header */}
      <div className="routes-header">
        <div className="routes-header-title">
          <Route size={28} style={{ display: 'inline', marginRight: '12px', color: '#7c5cff', verticalAlign: 'middle' }} />
          App Routes Explorer
        </div>
        <div className="routes-header-sub">
          {totalRoutes} routes across {ROUTES_CONFIG.length} sections — click any route to navigate
        </div>
        <div className="routes-count-badge">
          <Sparkles size={10} />
          {filteredCount} route{filteredCount !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ' total'}
        </div>
      </div>

      {/* Search */}
      <div className="routes-search-wrap">
        <SearchIcon size={16} className="routes-search-icon" />
        <input
          type="text"
          className="routes-search"
          placeholder="Search routes by name, path, or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Route Groups */}
      {filtered.length === 0 ? (
        <div className="routes-empty">
          <strong>No routes found</strong>
          Try a different search term
        </div>
      ) : (
        filtered.map((group) => (
          <div key={group.group} className="routes-group">
            <div className="routes-group-title">
              <Sparkles size={11} />
              {group.group}
              <span className="routes-group-count">{group.items.length}</span>
            </div>
            <div className="routes-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    className="routes-item"
                    onClick={() => navigate(item.path)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
                  >
                    <div className="routes-item-icon">
                      <Icon size={15} />
                    </div>
                    <div className="routes-item-body">
                      <div className="routes-item-name">{item.label}</div>
                      <div className="routes-item-path">{item.path}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginRight: '4px', fontFamily: 'Inter, sans-serif' }}>
                      {item.desc}
                    </div>
                    <ChevronRight size={15} className="routes-item-arrow" />
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Footer note */}
      {search && filteredCount > 0 && (
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}>
          Showing {filteredCount} of {totalRoutes} routes — {totalRoutes - filteredCount} hidden by search
        </div>
      )}

    </div>
  );
}
