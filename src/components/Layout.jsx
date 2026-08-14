import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings, ShieldCheck, ChevronLeft,
  LogOut, Menu, X, User
} from 'lucide-react';
import ThemePullCord from './ThemePullCord';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    ...(user?.is_admin ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  return (
    <div className="app-layout">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <button onClick={() => setMobileOpen(true)} className="btn-icon" style={{ marginRight: 4 }}>
          <Menu size={18} />
        </button>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>UI</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Review</span>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(23,27,58,0.5)', zIndex: 45 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          style={{ position: 'absolute', top: 12, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
          className="lg-hidden"
        >
          <X size={16} />
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>UI</span>
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">Review</div>
              <div className="sidebar-brand-sub">AI Screenshot Review</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
            <div className="avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'User'}
                </p>
                <p title={user?.email || ''} style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', marginTop: 2, color: 'var(--text-muted)' }}
          >
            <LogOut size={15} className="nav-icon" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft size={10} style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Main Area */}
      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ position: 'relative' }}>
        {/* Floating Theme Control — top right */}
        <div
          style={{
            position: 'sticky',
            top: 12,
            zIndex: 30,
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 16px 0',
          }}
        >
          <ThemePullCord />
        </div>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
