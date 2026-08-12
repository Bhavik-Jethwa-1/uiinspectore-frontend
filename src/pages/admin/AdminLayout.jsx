import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FolderOpen, Star, Settings,
  ShieldCheck, ChevronLeft, LogOut, Menu, X,
  ArrowLeft, LayoutDashboard as DashIcon
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

const SIDEBAR_W = 230;
const SIDEBAR_W_COLLAPSED = 68;

function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToApp = () => navigate('/dashboard');
  const handleLogout = () => { logout(); navigate('/login'); };

  const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  const SidebarContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: w,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
      transition: 'width 0.2s ease',
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '16px 12px' : '16px 14px',
        borderBottom: '1px solid var(--border)',
        minHeight: 64,
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 'var(--radius-sm)',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ShieldCheck size={14} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              Admin Panel
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              UI Review
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <p style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '4px 16px', marginBottom: 2,
          }}>
            Admin
          </p>
        )}
        {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onMobileClose}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            style={collapsed ? {
              justifyContent: 'center',
              padding: '10px 0',
              margin: '1px 8px',
              width: 'calc(100% - 16px)',
            } : {}}
            title={collapsed ? label : undefined}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Divider + Theme */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 2px', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Theme</span>
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        {/* Back to User App */}
        <button
          onClick={handleBackToApp}
          className="admin-nav-item"
          style={{ width: '100%', color: 'var(--text-secondary)', marginBottom: 2 }}
          title={collapsed ? 'Back to User App' : undefined}
        >
          <ArrowLeft size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Back to User App</span>}
        </button>

        {/* Admin profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: collapsed ? '8px 0' : '8px 10px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 4,
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}>
          <div className="avatar" style={{
            width: 28, height: 28, fontSize: 11, flexShrink: 0,
            background: 'var(--primary)',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name || 'Admin'}
              </p>
              <p style={{
                fontSize: 10, color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="admin-nav-item"
          style={{ width: '100%', color: 'var(--error)', marginTop: 0 }}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh',
          zIndex: 50, display: 'flex',
          width: w,
          transition: 'width 0.2s ease',
        }}
        className="hide-mobile"
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <SidebarContent />
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            style={{
              position: 'fixed',
              top: '50%',
              left: w,
              transform: 'translateY(-50%)',
              zIndex: 60,
              width: 16,
              height: 40,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: 'none',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              transition: 'left 0.2s ease',
            }}
            className="hide-mobile"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={10}
              style={{
                transition: 'transform 0.2s',
                transform: collapsed ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(23,27,58,0.5)',
              zIndex: 55,
            }}
            onClick={onMobileClose}
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, height: '100vh',
              zIndex: 60,
              animation: 'slideInLeft 0.2s ease',
            }}
            className="show-mobile-only"
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed(c => !c);
  const closeMobile = () => setMobileOpen(false);

  const sidebarWidth = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Mobile top bar */}
      <div
        className="show-mobile-only"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 12px',
          height: 52,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="btn-icon"
          style={{ flexShrink: 0 }}
        >
          <Menu size={18} />
        </button>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ShieldCheck size={12} color="#fff" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          Admin Panel
        </span>
      </div>

      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      {/* Main content area */}
      <div
        style={{
          marginLeft: sidebarWidth,
          minHeight: '100vh',
          transition: 'margin-left 0.2s ease',
        }}
        className="hide-mobile"
      >
        <main style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile main content (no margin needed, sidebar overlays) */}
      <div
        className="show-mobile-only"
        style={{ minHeight: '100vh' }}
      >
        <main style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
          .show-mobile-only { display: flex !important; }
        }
        @media (min-width: 768px) {
          .show-mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
