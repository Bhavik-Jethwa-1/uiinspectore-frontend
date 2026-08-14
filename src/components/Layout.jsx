import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings, ShieldCheck,
  LogOut, Menu, X
} from 'lucide-react';
import ThemePullCord from './ThemePullCord';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/settings', icon: Settings, label: 'Settings' },
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
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
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
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Review</div>
            <div className="sidebar-brand-sub">AI Screenshot Review</div>
          </div>
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
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer section */}
        <div className="sidebar-footer">
          {/* Admin Panel button - only show for admin users */}
          {user?.is_admin && (
            <button
              onClick={handleGoToAdmin}
              className="nav-item sidebar-footer-btn"
            >
              <ShieldCheck size={15} className="nav-icon" />
              <span>Admin Panel</span>
            </button>
          )}

          {/* User info */}
          <div className="sidebar-user">
            <div className="avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'User'}</p>
              <p className="sidebar-user-email">{user?.email || ''}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="nav-item sidebar-footer-btn"
          >
            <LogOut size={15} className="nav-icon" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="main-area" style={{ position: 'relative' }}>
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
