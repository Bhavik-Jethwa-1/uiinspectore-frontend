import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wand2, PencilRuler, LayoutTemplate, Settings, Sparkles, CreditCard, Receipt, Activity,
  ChevronLeft, ChevronRight, LogOut, FolderKanban,
  Bot,
  MessageCircle,
  Eye, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Sidebar Sections ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'main',
    label: null,
    items: [
      { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/app/projects', label: 'Workspace', icon: FolderKanban },
      { to: '/app/editor/new', label: 'Editor', icon: PencilRuler },
    ],
  },
  {
    id: 'ai',
    label: 'AI TOOLS',
    items: [
      { to: '/app/analysis', label: 'AI UI Review', icon: Eye },
      { to: '/app/ai/research', label: 'AI Research', icon: Zap },
      { to: '/app/ai/chat', label: 'AI Chat', icon: MessageCircle },
    ],
  },
  {
    id: 'design',
    label: 'DESIGN',
    items: [
      { to: '/app/autodesigner', label: 'AI Autodesigner', icon: Wand2 },
      { to: '/app/premium-autodesigner', label: 'Premium Designer', icon: Sparkles },
      { to: '/app/product-consultant', label: 'AI Consultant', icon: Sparkles },
    ],
  },
  {
    id: 'manage',
    label: 'MANAGE',
    items: [
      { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
      { to: '/app/usage', label: 'Usage', icon: Activity },
    ],
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    items: [
      { to: '/app/settings', label: 'Settings', icon: Settings },
      { to: '/app/billing', label: 'Billing', icon: Receipt },
      { to: '/app/pricing', label: 'Pricing', icon: CreditCard },
    ],
  },
];

// ── Individual nav item ─────────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        collapsed
          ? `w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all relative ${
              isActive
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
            }`
          : `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
              isActive
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
            }`
      }
      title={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={15}
            strokeWidth={isActive ? 2.5 : 2}
            className={`shrink-0 ${isActive ? '' : 'text-[var(--text-2)] group-hover:text-[var(--text)]'}`}
          />
          {!collapsed && <span>{item.label}</span>}
          {collapsed && isActive && (
            <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
          )}
        </>
      )}
    </NavLink>
  );
}

// Shared collapsed state via a module-level singleton
let sidebarCollapsed = false;
let sidebarListeners = new Set();

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);
  useEffect(() => {
    sidebarListeners.add(setCollapsed);
    return () => sidebarListeners.delete(setCollapsed);
  }, []);
  return collapsed;
}

export function setSidebarCollapsed(val) {
  sidebarCollapsed = val;
  sidebarListeners.forEach(fn => fn(val));
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    sidebarListeners.add(setCollapsed);
    return () => sidebarListeners.delete(setCollapsed);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    setSidebarCollapsed(next);
  };

  const sidebarWidth = collapsed ? 72 : 236;

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 bg-[var(--bg)] border-r border-[var(--border)] relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--border)] shrink-0">
        <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : 'flex-1'}`}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d]">
            <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
              <path d="M16 4c-3 0-5 1-6 3-3 0-5 3-5 6 0 2 1 4 2 5-1 1-2 3-2 5 0 3 2 5 5 5 1 2 3 3 6 3s5-1 6-3c3 0 5-2 5-5 0-2-1-4-2-5 1-1 2-3 2-5 0-3-2-6-5-6-1-2-3-3-6-3z" fill="white" fillOpacity="0.9" />
              <path d="M12 14c0 1 .5 2 1.5 2M20 14c0 1-.5 2-1.5 2M12 22c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[var(--text)] leading-tight">UI Inspectore</span>
            </div>
          )}
        </div>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all shrink-0"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="flex items-center justify-center w-full h-full">
            {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
      </div>

      {/* Nav — grouped by section */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {SECTIONS.map((section, sIdx) => (
          <div key={section.id}>
            {/* Section header — hidden when collapsed */}
            {section.label && !collapsed && (
              <div className="px-3 mb-1.5 mt-2 first:mt-0">
                <span className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-wider">
                  {section.label}
                </span>
              </div>
            )}
            {/* Section items */}
            {section.items.map((item) => (
              <div key={item.to} className="mb-0.5">
                <NavItem item={item} collapsed={collapsed} />
              </div>
            ))}
            {/* Divider between sections — hidden when collapsed */}
            {section.label && !collapsed && sIdx < SECTIONS.length - 1 && (
              <div className="my-3 border-t border-[var(--border)]" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-3 shrink-0 relative">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--surface2)] transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0 text-white overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
            }
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[var(--text)] truncate leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate leading-tight">{user?.email || ''}</div>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all shrink-0"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut size={13} />
              </button>
            </>
          )}
          {collapsed && (
            <button
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all shrink-0 bg-[var(--surface)]"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
