import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard, Users, FolderOpen, Star, Settings,
  LogOut, Menu, ArrowLeft, ChevronRight
} from 'lucide-react';
import ThemePullCord from '../../components/ThemePullCord';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleBackToApp = () => navigate('/dashboard');
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      {/* Mobile Topbar */}
      <div className="admin-topbar">
        <button onClick={() => setMobileOpen(true)} className="admin-topbar-btn">
          <Menu size={18} />
        </button>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>UI</span>
        </div>
        <span className="admin-topbar-title">Admin Panel</span>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="admin-backdrop"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="admin-sidebar-close lg-hidden"
        >
          ✕
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>UI</span>
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Admin Panel</div>
            <div className="sidebar-brand-sub">UI Review</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMobile}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-footer">
          <button onClick={handleBackToApp} className="nav-item sidebar-footer-btn" style={{ justifyContent: 'space-between' }}>
            <ArrowLeft size={14} className="nav-icon" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Back to User App</span>
            <ChevronRight size={13} className="nav-icon" style={{ opacity: 0.5, flexShrink: 0 }} />
          </button>

          <div className="sidebar-user">
            <div className="avatar">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
              <p className="sidebar-user-email">{user?.email || ''}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="nav-item sidebar-footer-btn" style={{ justifyContent: 'space-between' }}>
            <LogOut size={14} className="nav-icon" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Sign out</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="admin-main">
        {/* Floating Theme Control — top right */}
        <div className="admin-theme-pullcord">
          <ThemePullCord />
        </div>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
