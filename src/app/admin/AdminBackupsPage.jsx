import { useState, useEffect } from 'react';
import AdminTable from '../../../components/shared/AdminTable';
import { HardDrive, Download, Trash2, RotateCw, Plus, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const ACCENT = '#ef4444';

const STATUS_COLORS = {
  complete: '#10b981',
  'in-progress': '#06b6d4',
  failed: '#ef4444',
  scheduled: '#9ca3af',
};

const STATUS_ICONS = {
  complete: CheckCircle2,
  'in-progress': Loader2,
  failed: XCircle,
  scheduled: Clock,
};

const BACKUPS = [
  { id: 1, name: 'daily-full-2026-07-24',     type: 'full',        size: '4.2 GB',   created: '2026-07-24 03:00:00', duration: '18m 42s', status: 'complete',     location: 's3://uiinspectore-prod/backups' },
  { id: 2, name: 'hourly-incr-2026-07-24-11', type: 'incremental', size: '184 MB',   created: '2026-07-24 11:00:00', duration: '2m 14s',  status: 'in-progress', location: 's3://uiinspectore-prod/backups' },
  { id: 3, name: 'hourly-incr-2026-07-24-10', type: 'incremental', size: '142 MB',   created: '2026-07-24 10:00:00', duration: '1m 48s',  status: 'complete',     location: 's3://uiinspectore-prod/backups' },
  { id: 4, name: 'hourly-incr-2026-07-24-09', type: 'incremental', size: '128 MB',   created: '2026-07-24 09:00:00', duration: '1m 32s',  status: 'complete',     location: 's3://uiinspectore-prod/backups' },
  { id: 5, name: 'daily-full-2026-07-23',     type: 'full',        size: '4.1 GB',   created: '2026-07-23 03:00:00', duration: '17m 22s', status: 'complete',     location: 's3://uiinspectore-prod/backups' },
  { id: 6, name: 'weekly-archive-2026-W29',   type: 'archive',     size: '24.8 GB',  created: '2026-07-21 00:00:00', duration: '1h 42m',  status: 'complete',     location: 's3://uiinspectore-cold/w29' },
  { id: 7, name: 'daily-full-2026-07-22',     type: 'full',        size: '4.1 GB',   created: '2026-07-22 03:00:00', duration: '0m 14s',  status: 'failed',       location: 's3://uiinspectore-prod/backups' },
  { id: 8, name: 'hourly-incr-2026-07-24-12', type: 'incremental', size: '—',         created: '2026-07-24 12:00:00', duration: '—',        status: 'scheduled',    location: 's3://uiinspectore-prod/backups' },
  { id: 9, name: 'pre-migration-2026-07-20',  type: 'snapshot',    size: '4.0 GB',   created: '2026-07-20 14:30:00', duration: '12m 18s', status: 'complete',     location: 's3://uiinspectore-cold/snapshots' },
  { id: 10, name: 'daily-full-2026-07-21',    type: 'full',        size: '4.0 GB',   created: '2026-07-21 03:00:00', duration: '16m 52s', status: 'complete',     location: 's3://uiinspectore-prod/backups' },
];

const TYPE_COLORS = {
  full: '#8b5cf6',
  incremental: '#06b6d4',
  archive: '#f59e0b',
  snapshot: '#10b981',
};

const FIELDS = [
  { key: 'name', label: 'Name', sortable: true, render: (v, row) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${TYPE_COLORS[row.type] || '#9ca3af'}15` }}>
        <HardDrive size={12} style={{ color: TYPE_COLORS[row.type] || '#9ca3af' }} />
      </div>
      <div>
        <div className="text-[12px] font-mono font-bold text-white">{v}</div>
        <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: TYPE_COLORS[row.type] }}>{row.type}</div>
      </div>
    </div>
  )},
  { key: 'size', label: 'Size', sortable: true, render: v => (
    <span className="text-[12px] font-mono text-gray-300">{v}</span>
  )},
  { key: 'created', label: 'Created', sortable: true, render: v => (
    <div>
      <div className="text-[12px] text-white font-mono">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div className="text-[10px] text-gray-500 font-mono">{new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  )},
  { key: 'duration', label: 'Duration', render: v => (
    <span className="text-[11px] font-mono text-gray-400">{v}</span>
  )},
  { key: 'status', label: 'Status', sortable: true, render: v => {
    const Icon = STATUS_ICONS[v];
    return (
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center w-fit gap-1.5 capitalize"
        style={{ background: `${STATUS_COLORS[v]}15`, color: STATUS_COLORS[v] }}>
        <Icon size={10} className={v === 'in-progress' ? 'animate-spin' : ''} />
        {v.replace('-', ' ')}
      </span>
    );
  }},
];

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState(BACKUPS);
  const [loading] = useState(false);

  const totalSize = '37.5 GB';
  const completeCount = BACKUPS.filter(b => b.status === 'complete').length;
  const failedCount = BACKUPS.filter(b => b.status === 'failed').length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <HardDrive size={20} style={{ color: ACCENT }} /> Backup Management
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Automated daily, hourly, and snapshot backups stored across 3 regions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <RotateCw size={12} /> Restore
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
              style={{ background: ACCENT, color: '#fff' }}>
              <Plus size={14} /> Create Backup
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Backups',    value: BACKUPS.length.toString(), icon: HardDrive,   color: '#8b5cf6' },
            { label: 'Successful (7d)',  value: completeCount.toString(),   icon: CheckCircle2,color: '#10b981' },
            { label: 'Failed (7d)',      value: failedCount.toString(),     icon: XCircle,     color: '#ef4444' },
            { label: 'Total Storage',    value: totalSize,                  icon: HardDrive,   color: '#f59e0b' },
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

        {/* Schedule card */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4">Backup Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Hourly Incremental', cron: '0 * * * *',   retention: '7 days',   lastRun: '8m ago',  next: '52m', color: '#06b6d4' },
              { name: 'Daily Full',         cron: '0 3 * * *',   retention: '30 days',  lastRun: '8h ago',  next: '16h',  color: '#8b5cf6' },
              { name: 'Weekly Archive',     cron: '0 0 * * 0',   retention: '1 year',   lastRun: '3d ago',  next: '4d',   color: '#f59e0b' },
            ].map(s => (
              <div key={s.name} className="p-3 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${s.color}20` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[12px] font-bold text-white">{s.name}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-400 mb-1">cron: {s.cron}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mt-2">
                  <div>
                    <span className="text-gray-500">Last: </span>
                    <span className="text-white font-semibold">{s.lastRun}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Next: </span>
                    <span className="text-white font-semibold">{s.next}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-2">Retention: {s.retention}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backups table */}
        <AdminTable
          title="All Backups"
          subtitle="Full, incremental, and snapshot backups"
          fields={FIELDS}
          data={backups}
          loading={loading}
          searchable
          searchPlaceholder="Search by backup name…"
          exportable
          stats={[
            { label: 'Full',         value: BACKUPS.filter(b => b.type === 'full').length.toString() },
            { label: 'Incremental',  value: BACKUPS.filter(b => b.type === 'incremental').length.toString() },
            { label: 'Archive',      value: BACKUPS.filter(b => b.type === 'archive').length.toString() },
            { label: 'Snapshot',     value: BACKUPS.filter(b => b.type === 'snapshot').length.toString() },
          ]}
          actions={[
            { label: 'Download', onClick: row => alert(`Download ${row.name}`) },
            { label: 'Restore',  onClick: row => alert(`Restore ${row.name}`) },
            { label: 'Delete',   danger: true, onClick: row => alert(`Delete ${row.name}`) },
          ]}
        />
      </div>
    </div>
  );
}