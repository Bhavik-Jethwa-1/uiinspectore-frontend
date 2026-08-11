import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderOpen, Star, Settings,
  ShieldCheck
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 0px)' }}>
      {/* Admin Sub-nav */}
      <div style={{
        width: 200,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '16px 8px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          marginBottom: 12,
        }}>
          <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Admin Panel
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
