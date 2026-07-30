import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wand2, Sparkles, FolderKanban, Eye, Layers, MessageCircle,
  Zap, Settings, CreditCard, Receipt, Activity, ChevronLeft, ChevronRight,
  LogOut, PencilRuler, LayoutTemplate, User, Clock, Star, Shield,
  ChevronDown, Menu, X,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import UserGuard from '../guards/UserGuard';

// ─── Navigation config ─────────────────────────────────────────────────────

const PLAN_ORDER = ['free', 'pro', 'team', 'enterprise'];
const PLAN_LABELS = { free: 'Free', pro: 'Pro', team: 'Team', enterprise: 'Enterprise' };

function meetsPlan(userPlan, requiredPlan) {
  if (!requiredPlan) return true;
  const userRank = PLAN_ORDER.indexOf(userPlan || 'free');
  const required = PLAN_ORDER.indexOf(requiredPlan);
  return userRank >= required;
}

// requiredPlan: null = all plans, 'pro' = pro+, 'team' = team+, 'enterprise' = enterprise only
const NAV_MAIN = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/editor/new', label: 'Editor', icon: PencilRuler },
  { to: '/app/autodesigner', label: 'Autodesigner', icon: Wand2 },
  { to: '/app/premium-autodesigner', label: 'Premium AI', icon: Sparkles, requiredPlan: 'pro' },
];

const NAV_ANALYSIS = [
  { to: '/app/analysis', label: 'AI UI Review', icon: Eye, requiredPlan: 'pro' },
  { to: '/app/ai/research', label: 'AI Research', icon: Zap, requiredPlan: 'pro' },
  { to: '/app/ai/chat', label: 'AI Chat', icon: MessageCircle },
];

const NAV_MANAGE = [
  { to: '/app/projects', label: 'Workspace', icon: FolderKanban },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate, requiredPlan: 'pro' },
  { to: '/app/product-consultant', label: 'AI Consultant', icon: Sparkles, requiredPlan: 'pro' },
];

const NAV_ACCOUNT = [
  { to: '/app/billing', label: 'Billing', icon: Receipt },
  { to: '/app/usage', label: 'Usage', icon: Activity },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

// ─── Collapsed state singleton ─────────────────────────────────────────────

let collapsed = true;
const listeners = new Set();

export function useSidebarCollapsed() {
  const [val, setVal] = useState(collapsed);
  useEffect(() => {
    listeners.add(setVal);
    return () => listeners.delete(setVal);
  }, []);
  return val;
}

function notify(val) {
  collapsed = val;
  listeners.forEach(fn => fn(val));
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

function UserSidebar({ onOpenChange, isMobileOpen, onMobileClose }) {
  const [open, setOpen] = useState(collapsed);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listeners.add(setOpen);
    return () => listeners.delete(setOpen);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    notify(next);
    onOpenChange?.(next);
  };

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  const w = open ? 240 : 72;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 shrink-0"
      style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className={`flex items-center gap-2.5 overflow-hidden ${open ? 'flex-1' : 'justify-center w-full'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center shrink-0">
            <Layers size={16} color="white" />
          </div>
          {open && (
            <div>
              <span className="text-[13px] font-bold text-[var(--text)] leading-tight block">UI Inspectore</span>
            </div>
          )}
        </div>
        {open && (
          <button onClick={toggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all shrink-0">
            <ChevronLeft size={13} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <div className="space-y-0.5">
          {NAV_MAIN.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
        </div>

        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-3 ${!open ? 'text-center' : ''}`}
          style={{ color: 'var(--text-muted)' }}>
          {open ? 'AI Tools' : '•••'}
        </p>
        {NAV_ANALYSIS.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}

        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-3 ${!open ? 'text-center' : ''}`}
          style={{ color: 'var(--text-muted)' }}>
          {open ? 'Manage' : '•••'}
        </p>
        {NAV_MANAGE.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}

        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        {NAV_ACCOUNT.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
      </nav>

      {/* User footer */}
      <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border)' }}>
        {!open && (
          <button onClick={toggle}
            className="w-full h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all mb-2">
            <ChevronRight size={14} />
          </button>
        )}
        <div className={`flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--surface2)] transition-all cursor-pointer ${!open ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0 text-white overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
            }
          </div>
          {open && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)] truncate leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate leading-tight">{user?.email || ''}</div>
              </div>
              <button onClick={handleLogout}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
                <LogOut size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function NavItem({ item, collapsed, onClick, userPlan }) {
  const locked = !meetsPlan(userPlan, item.requiredPlan);

  const handleClick = (e) => {
    if (locked) {
      e.preventDefault();
      setUpgradeModal({
        open: true,
        feature: item,
      });

      return;
    }
    onClick?.();
  };

  const classes = locked
    ? 'cursor-not-allowed opacity-50'
    : '';

  return (
    <NavLink
      to={locked ? '#' : item.to}
      onClick={handleClick}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 mb-0.5 ${classes} ${collapsed
          ? `w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${isActive && !locked
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
          }`
          : `px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive && !locked
            ? 'bg-[var(--accent)] text-white shadow-sm'
            : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
          }`
        }`
      }
      title={collapsed ? (locked ? `${item.label} (${PLAN_LABELS[item.requiredPlan]} plan required)` : item.label) : undefined}
    >
      {locked
        ? <Zap size={15} strokeWidth={2} className="shrink-0 text-[var(--accent)]" />
        : <item.icon size={15} strokeWidth={2} className="shrink-0" />
      }
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {!collapsed && locked && item.requiredPlan && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(124,92,255,0.15)', color: 'var(--accent)' }}>
          {PLAN_LABELS[item.requiredPlan]}
        </span>
      )}
    </NavLink>
  );
}

// ─── User Header ───────────────────────────────────────────────────────────

function UserHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [walletCredits, setWalletCredits] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.is_admin || user?.isAdmin;

  // Fetch wallet credits
  const fetchCredits = async () => {
    const token = localStorage.getItem('ui-inspectore_token');
    if (!token) return;
    try {
      const res = await fetch('/api/billing/wallet', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setWalletCredits(parseFloat(data.wallet?.balance ?? 0));
      }
    } catch { /* silent */ }
  };

  // Poll credits every 30 seconds to keep header badge up to date
  useEffect(() => {
    if (user) fetchCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Close dropdowns on outside click
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all xl:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
        {/* ── Credits Badge ── */}
        {walletCredits !== null && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer transition-all hover:opacity-80"
            style={{ background: 'rgba(124,92,255,0.15)', border: '1px solid rgba(124,92,255,0.3)', color: '#a78bfa' }}
            onClick={() => navigate('/app/billing?wallet=open')}
            title="View billing"
          >
            <Zap size={12} />
            <span>${walletCredits.toFixed(2)}</span>
          </div>
        )}

        {/* ── User Avatar + Dropdown ── */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-1 py-1 rounded-xl transition-all border"
            style={{
              background: userDropdownOpen ? 'var(--surface2)' : 'transparent',
              borderColor: userDropdownOpen ? 'var(--accent)' : 'transparent',
            }}
            onClick={() => setUserDropdownOpen((v) => !v)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center text-[12px] font-bold text-white">
              {(user?.name || user?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <span className="text-[12px] font-semibold hidden sm:block" style={{ color: 'var(--text)' }}>
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* User Dropdown */}
          {userDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl border overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'User'}</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
              </div>
              {/* Menu items */}
              <div className="py-1.5">
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium hover:bg-[var(--surface2)] transition-colors"
                  style={{ color: 'var(--text-2)' }}
                  onClick={() => { setUserDropdownOpen(false); navigate('/app/profile'); }}
                >
                  <User size={14} /> Profile
                </button>
                {isAdmin && (
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium hover:bg-[var(--surface2)] transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    onClick={() => { setUserDropdownOpen(false); navigate('/app/admin'); }}
                  >
                    <Shield size={14} /> Admin Panel
                  </button>
                )}
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium hover:bg-red-500/10 transition-colors"
                  style={{ color: '#ef4444' }}
                  onClick={handleLogout}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(collapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const setContentMargin = (open) => {
    setSidebarOpen(open);
    const el = document.getElementById('app-content');
    if (el) el.style.marginLeft = open ? 240 : 72;
  };

  const handleMobileClose = () => setIsMobileOpen(false);

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <UserGuard>
      <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={handleMobileClose}
            />
          )}
        </AnimatePresence>

        {/* Mobile drawer sidebar */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-screen flex flex-col z-50 w-[260px] shrink-0 xl:hidden"
              style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
            >
              {/* Mobile sidebar header */}
              <div className="flex items-center justify-between px-3 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center shrink-0">
                    <Layers size={16} color="white" />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-[var(--text)] leading-tight block">UI Inspectore</span>
                  </div>
                </div>
                <button onClick={handleMobileClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all">
                  <X size={15} />
                </button>
              </div>
              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                <div className="space-y-0.5">
                  {NAV_MAIN.map(item => <NavItem key={item.to} item={item} collapsed={false} onClick={handleMobileClose} userPlan={user?.plan} />)}
                </div>
                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 px-3" style={{ color: 'var(--text-muted)' }}>AI Tools</p>
                {NAV_ANALYSIS.map(item => <NavItem key={item.to} item={item} collapsed={false} onClick={handleMobileClose} userPlan={user?.plan} />)}
                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 px-3" style={{ color: 'var(--text-muted)' }}>Manage</p>
                {NAV_MANAGE.map(item => <NavItem key={item.to} item={item} collapsed={false} onClick={handleMobileClose} userPlan={user?.plan} />)}
                <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
                {NAV_ACCOUNT.map(item => <NavItem key={item.to} item={item} collapsed={false} onClick={handleMobileClose} userPlan={user?.plan} />)}
              </nav>
              {/* Mobile user footer */}
              <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--surface2)] transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0 text-white overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[var(--text)] truncate leading-tight">{user?.name || 'User'}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate leading-tight">{user?.email || ''}</div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop sidebar — always present on xl+ */}
        <div className="hidden xl:block">
          <UserSidebarDesktop onOpenChange={setContentMargin} />
        </div>

        {/* Content */}
        <div
          className="flex-1 flex flex-col overflow-hidden w-full max-w-full xl:ml-[240px]"
          id="app-content"
        >
          <UserHeader onMenuToggle={() => setIsMobileOpen(true)} />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </UserGuard>
  );
}

// ─── Desktop-only Sidebar (prevents double-render) ──────────────────────────
function UserSidebarDesktop({ onOpenChange }) {
  const [open, setOpen] = useState(collapsed);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    listeners.add(setOpen);
    return () => listeners.delete(setOpen);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    notify(next);
    onOpenChange?.(next);
  };

  const w = open ? 240 : 72;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 shrink-0"
      style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className={`flex items-center gap-2.5 overflow-hidden ${open ? 'flex-1' : 'justify-center w-full'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center shrink-0">
            <Layers size={16} color="white" />
          </div>
          {open && (
            <div>
              <span className="text-[13px] font-bold text-[var(--text)] leading-tight block">UI Inspectore</span>
            </div>
          )}
        </div>
        {open && (
          <button onClick={toggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all shrink-0">
            <ChevronLeft size={13} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <div className="space-y-0.5">
          {NAV_MAIN.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
        </div>
        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-3 ${!open ? 'text-center' : ''}`}
          style={{ color: 'var(--text-muted)' }}>
          {open ? 'AI Tools' : '•••'}
        </p>
        {NAV_ANALYSIS.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 px-3 ${!open ? 'text-center' : ''}`}
          style={{ color: 'var(--text-muted)' }}>
          {open ? 'Manage' : '•••'}
        </p>
        {NAV_MANAGE.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
        <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
        {NAV_ACCOUNT.map(item => <NavItem key={item.to} item={item} collapsed={!open} userPlan={user?.plan} />)}
      </nav>

      {/* User footer */}
      <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border)' }}>
        {!open && (
          <button onClick={toggle}
            className="w-full h-9 rounded-lg flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all mb-2">
            <ChevronRight size={14} />
          </button>
        )}
        <div className={`flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--surface2)] transition-all cursor-pointer ${!open ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0 text-white overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
            }
          </div>
          {open && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)] truncate leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate leading-tight">{user?.email || ''}</div>
              </div>
              <button onClick={() => { logout(); navigate('/auth/login'); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-all">
                <LogOut size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export { UserHeader };
