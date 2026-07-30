import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Receipt, Zap, Star, Gift,
  ChevronLeft, ChevronRight, LogOut, Settings, Bell,
  Shield, BarChart3, FileText, Headphones, Database, Flag,
  Server, HardDrive, UserCog, Key, FolderKanban, Layers, Wand2,
  ScrollText, Sliders, Eye, Menu, X,
  AlertCircle, ChevronDown, Activity,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminGuard from '../guards/AdminGuard';

// ─── Admin navigation groups ───────────────────────────────────────────────

const ADMIN_NAV = [
  {
    group: 'Overview', items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/reports', label: 'Reports', icon: FileText },
    ]
  },
  {
    group: 'Users', items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/admin-users', label: 'Admin Users', icon: UserCog },
      { to: '/admin/roles', label: 'Roles & Perms', icon: Key },
    ]
  },
  {
    group: 'Business', items: [
      { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
      { to: '/admin/billing', label: 'Billing', icon: Receipt },
      { to: '/admin/payments', label: 'Payments', icon: Star },
      { to: '/admin/plans', label: 'Plans', icon: Sliders },
      { to: '/admin/coupons', label: 'Coupons', icon: Gift },
      { to: '/admin/transactions', label: 'Transactions', icon: ScrollText },
    ]
  },
  {
    group: 'AI & Content', items: [
      { to: '/admin/ai-providers', label: 'AI Settings', icon: Zap },
      { to: '/admin/ai-models', label: 'AI Models', icon: Wand2 },
      { to: '/admin/prompt-library', label: 'Prompt Library', icon: FileText },
      { to: '/admin/templates', label: 'Templates', icon: Layers },
      { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
    ]
  },
  {
    group: 'System', items: [
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: Eye },
      { to: '/admin/server', label: 'Server Monitor', icon: Server },
      { to: '/admin/queue', label: 'Queue Monitor', icon: Activity },
      { to: '/admin/database', label: 'Database', icon: Database },
      { to: '/admin/backups', label: 'Backups', icon: HardDrive },
    ]
  },
  {
    group: 'Support', items: [
      { to: '/admin/support', label: 'Support Tickets', icon: Headphones },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  },
];

// ─── Collapsed singleton ─────────────────────────────────────────────────

let adminCollapsed = false;
const adminListeners = new Set();

export function useAdminSidebarCollapsed() {
  const [val, setVal] = useState(adminCollapsed);
  useEffect(() => {
    const handler = (v) => setVal(v);
    adminListeners.add(handler);
    return () => adminListeners.delete(handler);
  }, []);
  return val;
}

function notifyAdmin(val) {
  adminCollapsed = val;
  adminListeners.forEach(fn => fn(val));
}

// ─── Shared NavItem component ─────────────────────────────────────────────

function NavItem({ item, collapsed, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 mb-0.5 ${collapsed
          ? `w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${isActive
            ? 'bg-[var(--accent)] text-white'
            : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
          }`
          : `px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${isActive
            ? 'bg-[var(--accent)] text-white shadow-sm'
            : 'text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'
          }`
        }`
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={15} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

// ─── Admin Sidebar ────────────────────────────────────────────────────────

function AdminSidebar({ onClose }) {
  const collapsed = useAdminSidebarCollapsed();
  const open = !collapsed;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => notifyAdmin(!collapsed);
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
      <div className="flex items-center justify-between px-3 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <div className={`flex items-center gap-2.5 overflow-hidden ${open ? 'flex-1' : 'justify-center w-full'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#ff6b9d] flex items-center justify-center shrink-0">
            <Shield size={18} color="white" />
          </div>
          {open && (
            <div>
              <span className="text-[13px] font-bold text-[var(--text)] leading-tight block">UI Inspectore</span>
              <span className="text-[10px] font-semibold text-[var(--accent)]">Admin Panel</span>
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
          {ADMIN_NAV.map((section, si) => (
            <div key={section.group}>
              {si > 0 && <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />}
              {open ? (
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1 px-3"
                  style={{ color: 'var(--text-muted)' }}>
                  {section.group}
                </p>
              ) : (
                <div className="w-6 h-1 rounded-full mx-auto my-2 bg-[var(--border)]" />
              )}
              {section.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={!open} onClick={onClose} />
              ))}
            </div>
          ))}
        </div>
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
              : (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()
            }
          </div>
          {open && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--text)] truncate leading-tight">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate leading-tight">
                  {user?.email || 'admin@uiinspectore.ai'}
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all">
                <LogOut size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Admin Header ─────────────────────────────────────────────────────────

const ADMIN_NOTIFS = [
  { id: 1, text: 'New user registered: alex@example.com', time: '3 min ago', unread: true, color: 'var(--accent)' },
  { id: 2, text: 'AI provider Groq returned 47 errors in the last hour', time: '12 min ago', unread: true, color: '#ef4444' },
  { id: 3, text: 'Database backup completed successfully', time: '1 hour ago', unread: false, color: '#10b981' },
  { id: 4, text: 'Subscription upgraded: Free → Pro (priya@design.co)', time: '2 hours ago', unread: false, color: '#f59e0b' },
  { id: 5, text: 'Server CPU usage spiked to 89%', time: '3 hours ago', unread: false, color: '#ef4444' },
];

function AdminHeader({ title = 'Dashboard', onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  const unreadCount = ADMIN_NOTIFS.filter(n => n.unread).length;
  const dropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
        setUserDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const toggle = () => {
    const next = !open;
    setOpen(next);
    notify(next);
    onOpenChange?.(next);
  };

  const w = open ? 240 : 72;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-2)] hover:bg-[var(--surface2)] transition-all xl:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        {/* Page title */}
        <h1 className="text-[15px] sm:text-[17px] font-bold text-[var(--text)]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2" ref={dropdownRef}>
        {/* System status */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          All systems OK
        </div>

        {/* ── Notification Bell ── */}
        <div className="relative">
          <button
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all border"
            style={{
              color: 'var(--text-2)',
              background: notifOpen ? 'var(--surface2)' : 'transparent',
              borderColor: notifOpen ? 'var(--accent)' : 'transparent',
            }}
            onClick={() => { setNotifOpen(v => !v); setUserDropOpen(false); }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl border overflow-hidden shadow-2xl"
              style={{ background: 'rgba(20, 18, 30, 0.95)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)', background: 'rgba(124,92,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[var(--text)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                  Mark all read
                </button>
              </div>

              {/* Notification list */}
              <div className="max-h-[300px] overflow-y-auto">
                {ADMIN_NOTIFS.map(n => (
                  <div key={n.id}
                    className="group flex items-start gap-3 px-4 py-3 border-b transition-all cursor-pointer hover:bg-[var(--surface2)]"
                    style={{ borderColor: 'var(--border)', borderLeft: n.unread ? `3px solid ${n.color}` : '3px solid transparent' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${n.color}20`, color: n.color }}>
                      <Bell size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[var(--text)] leading-snug">{n.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">{n.time}</span>
                        {n.unread && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                            style={{ background: 'rgba(124,92,255,0.15)', color: 'var(--accent)' }}>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button className="w-full py-2.5 rounded-xl text-[12px] font-semibold text-center transition-all hover:opacity-80"
                  style={{ background: 'var(--accent)', color: 'white' }}>
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── User Avatar ── */}
        <div className="relative">
          <button
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all border"
            style={{
              background: userDropOpen ? 'var(--surface2)' : 'transparent',
              borderColor: userDropOpen ? 'var(--accent)' : 'transparent',
            }}
            onClick={() => { setUserDropOpen(v => !v); setNotifOpen(false); }}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[11px] font-bold text-white overflow-hidden shrink-0">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()
              }
            </div>
            <span className="text-[12px] font-semibold text-[var(--text)] hidden sm:block">
              {user?.name || user?.email?.split('@')[0] || 'Admin'}
            </span>
            <ChevronDown size={12} className="text-[var(--text-muted)]" />
          </button>

          {userDropOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-2 w-[220px] rounded-2xl border overflow-hidden shadow-2xl"
              style={{ background: 'rgba(20, 18, 30, 0.95)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'rgba(124,92,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-[13px] font-bold text-white shrink-0 overflow-hidden">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      : (user?.name || user?.email || 'A').slice(0, 1).toUpperCase()
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--text)] truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email || 'admin@uiinspectore.ai'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => { setUserDropOpen(false); navigate('/app/dashboard'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[var(--text-2)] hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-all"
                >
                  <Shield size={14} /> User Panel
                </button>
                <button
                  onClick={() => { setUserDropOpen(false); logout(); navigate('/auth/login'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
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

// ─── Admin Layout ─────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarCollapsed = useAdminSidebarCollapsed();
  const sidebarW = sidebarCollapsed ? 72 : 240;

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-screen w-[240px] z-50 xl:hidden"
              >
                <AdminSidebar onClose={() => setMobileOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop fixed sidebar */}
        <div className="hidden xl:block shrink-0">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="xl:ml-[240px] flex flex-col flex-1 overflow-hidden">
            <AdminHeader
              onMenuToggle={() => setMobileOpen(v => !v)}
            />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

export { AdminHeader };
