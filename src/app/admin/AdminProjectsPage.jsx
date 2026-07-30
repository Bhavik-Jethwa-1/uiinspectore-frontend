import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { FolderKanban, Eye, Trash2, Image, Users, Activity, Plus, Archive } from 'lucide-react';

const ACCENT = '#ef4444';

const STATUS_COLORS = {
  active:   '#10b981',
  archived: '#9ca3af',
  draft:    '#f59e0b',
};

const PROJECTS = [
  { id: 1, name: 'Acme Dashboard Redesign',     owner: 'Marcus Williams', email: 'marcus@startup.io',       screens: 24,  collaborators: 4, lastModified: '2026-07-24 09:42', created: '2026-05-12', status: 'active',   plan: 'Team',  views: 1842 },
  { id: 2, name: 'Mobile App Onboarding',        owner: 'Sarah Chen',      email: 'sarah@example.com',        screens: 12,  collaborators: 2, lastModified: '2026-07-24 08:18', created: '2026-06-03', status: 'active',   plan: 'Pro',   views: 942 },
  { id: 3, name: 'E-commerce Site Refresh',     owner: 'James Wilson',     email: 'james@corp.io',             screens: 48,  collaborators: 8, lastModified: '2026-07-23 22:11', created: '2026-02-14', status: 'active',   plan: 'Enterprise', views: 4820 },
  { id: 4, name: 'Brand Identity v3',            owner: 'Priya Sharma',     email: 'priya@design.co',           screens: 8,   collaborators: 1, lastModified: '2026-07-23 17:05', created: '2026-07-01', status: 'draft',    plan: 'Pro',   views: 124 },
  { id: 5, name: 'Internal Tools UI',            owner: 'Carlos Ruiz',      email: 'carlos@dev.es',             screens: 32,  collaborators: 3, lastModified: '2026-07-23 14:22', created: '2026-04-22', status: 'active',   plan: 'Team',  views: 624 },
  { id: 6, name: 'Legacy Redesign Archive',      owner: 'Emma Davis',       email: 'emma@freelance.net',        screens: 18,  collaborators: 1, lastModified: '2026-07-22 18:30', created: '2025-08-10', status: 'archived', plan: 'Free',  views: 2840 },
  { id: 7, name: 'SaaS Landing Page',            owner: 'Yuki Tanaka',      email: 'yuki@studio.jp',            screens: 6,   collaborators: 2, lastModified: '2026-07-22 11:07', created: '2026-07-15', status: 'active',   plan: 'Pro',   views: 184 },
  { id: 8, name: 'Banking App v2',              owner: 'Alex Johnson',     email: 'alex.j@agency.com',         screens: 64,  collaborators: 12, lastModified: '2026-07-21 16:42', created: '2026-01-08', status: 'active',   plan: 'Enterprise', views: 12480 },
  { id: 9, name: 'Portfolio Site Mockup',        owner: 'Maya Rodriguez',  email: 'maya@freelance.io',         screens: 4,   collaborators: 1, lastModified: '2026-07-20 14:22', created: '2026-07-18', status: 'draft',    plan: 'Free',  views: 42 },
  { id: 10, name: 'Healthcare Portal',            owner: 'Global Tech Ltd',  email: 'pm@globaltech.io',          screens: 28,  collaborators: 6, lastModified: '2026-07-19 11:00', created: '2026-03-30', status: 'active',   plan: 'Enterprise', views: 2840 },
];

const PLAN_COLORS = { Free: '#9ca3af', Pro: '#818cf8', Team: '#fbbf24', Enterprise: '#ef4444' };

const FIELDS = [
  { key: 'name', label: 'Project Name', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${ACCENT}15` }}>
        <FolderKanban size={14} style={{ color: ACCENT }} />
      </div>
      <div>
        <div className="text-[12px] font-semibold text-white">{v}</div>
        <div className="text-[10px] text-gray-500">Created {new Date(row.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      </div>
    </div>
  )},
  { key: 'owner', label: 'Owner', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT}, #b91c1c)` }}>
        {row.owner.split(' ').map(n => n[0]).join('').slice(0,2)}
      </div>
      <div>
        <div className="text-[12px] text-white font-medium">{v}</div>
        <div className="text-[10px] text-gray-500">{row.email}</div>
      </div>
    </div>
  )},
  { key: 'screens', label: 'Screens', sortable: true, render: (v, row) => (
    <div>
      <div className="flex items-center gap-1.5 text-[12px] font-bold text-white">
        <Image size={10} className="text-gray-500" />
        {v}
      </div>
      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
        <Users size={9} /> {row.collaborators} collab
      </div>
    </div>
  )},
  { key: 'lastModified', label: 'Last Modified', sortable: true, render: v => (
    <div>
      <div className="text-[11px] text-white font-mono">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      <div className="text-[10px] text-gray-500 font-mono">{new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  )},
  { key: 'plan', label: 'Plan', render: v => (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${PLAN_COLORS[v] || '#9ca3af'}18`, color: PLAN_COLORS[v] || '#9ca3af' }}>
      {v}
    </span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1 capitalize"
      style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[v] }} />
      {v}
    </span>
  )},
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState(PROJECTS);
  const [loading] = useState(false);

  const totalScreens = PROJECTS.reduce((s, p) => s + p.screens, 0);
  const totalViews = PROJECTS.reduce((s, p) => s + p.views, 0);
  const activeCount = PROJECTS.filter(p => p.status === 'active').length;
  const archivedCount = PROJECTS.filter(p => p.status === 'archived').length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <FolderKanban size={20} style={{ color: ACCENT }} /> All Projects
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Cross-tenant view of every project on the platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects',  value: PROJECTS.length.toString(),  icon: FolderKanban, color: '#8b5cf6' },
            { label: 'Active',          value: activeCount.toString(),       icon: Activity,      color: '#10b981' },
            { label: 'Total Screens',   value: totalScreens.toString(),      icon: Image,         color: '#06b6d4' },
            { label: 'Total Views',     value: `${(totalViews / 1000).toFixed(1)}K`, icon: Eye,   color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Project Status</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(STATUS_COLORS).map(s => {
              const items = PROJECTS.filter(p => p.status === s);
              return (
                <div key={s} className="p-3 rounded-xl border"
                  style={{ background: `${STATUS_COLORS[s]}08`, borderColor: `${STATUS_COLORS[s]}30` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider capitalize" style={{ color: STATUS_COLORS[s] }}>{s}</span>
                  </div>
                  <div className="text-[20px] font-black text-white">{items.length}</div>
                  <div className="text-[10px] text-gray-500">{((items.length / PROJECTS.length) * 100).toFixed(0)}% of total</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects table */}
        <AdminTable
          title="All Projects"
          subtitle="Cross-tenant project directory with screen and view metrics"
          fields={FIELDS}
          data={projects}
          loading={loading}
          searchable
          searchPlaceholder="Search by project name, owner, or email…"
          exportable
          stats={[
            { label: 'Active',    value: activeCount.toString() },
            { label: 'Archived',  value: archivedCount.toString() },
            { label: 'Drafts',    value: PROJECTS.filter(p => p.status === 'draft').length.toString() },
            { label: 'Screens',   value: totalScreens.toString() },
          ]}
          actions={[
            { label: 'View',   onClick: row => alert(`View ${row.name}`) },
            { label: 'Delete', danger: true, onClick: row => alert(`Delete ${row.name}`) },
          ]}
        />
      </div>
    </div>
  );
}