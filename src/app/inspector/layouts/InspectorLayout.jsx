import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, Plus, Settings, LogOut,
  Menu, X, Sparkles, ChevronRight
} from 'lucide-react';
import { useInspectorAuth } from '../../../contexts/InspectorAuthContext';
import ThemeToggle from '../components/ThemeToggle';

const ACCENT = '#7c5cff';
const SIDEBAR_W = 240;

export default function InspectorLayout() {
  const { user, logout } = useInspectorAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/inspector', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/inspector/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/inspector/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/inspector/login');
  };

  const Sidebar = () => (
    <div className="fixed inset-y-0 left-0 z-50 flex flex-col border-r"
      style={{ width: SIDEBAR_W, background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <div>
          <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>UI Inspector</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>AI Review Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link key={to} to={to}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${active ? '' : 'hover:opacity-70'}`}
                style={{
                  background: active ? `${ACCENT}18` : 'transparent',
                  color: active ? ACCENT : 'var(--text-muted)',
                }}>
                <Icon size={16} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: ACCENT }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>{user?.name}</div>
            <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[12px] text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -SIDEBAR_W }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_W }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--text)' }}>
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: ACCENT }}>
            <Sparkles size={12} color="#fff" />
          </div>
          <span className="text-[14px] font-bold">UI Inspector</span>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-[240px] min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
