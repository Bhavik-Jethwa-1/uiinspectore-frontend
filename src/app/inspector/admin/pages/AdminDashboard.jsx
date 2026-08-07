import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FolderOpen, Star, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowUpRight
} from 'lucide-react';

const ACCENT = '#7c5cff';
const ADMIN_ACCENT = '#ef4444';

function StatCard({ icon: Icon, label, value, subtext, color = ACCENT, loading }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          {loading ? (
            <div className="h-8 w-20 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
          ) : (
            <p className="text-[28px] font-black" style={{ color }}>{value ?? 0}</p>
          )}
          {subtext && <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtext}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 rounded animate-pulse flex-1" style={{ background: 'var(--border)' }} />
      ))}
    </div>
  );
}

function UserRow({ user }) {
  const roleColors = {
    admin: '#ef4444',
    super_admin: '#f97316',
    user: ACCENT,
    suspended: '#6b7280',
  };
  return (
    <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: roleColors[user.role] || ACCENT }}>
        {user.name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
      </div>
      <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `${roleColors[user.role] || ACCENT}18`, color: roleColors[user.role] || ACCENT }}>
        {user.role?.toUpperCase()}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
      </span>
    </div>
  );
}

function ProjectRow({ project }) {
  const statusColors = {
    active: '#22c55e',
    draft: '#6b7280',
    archived: '#f97316',
  };
  return (
    <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,92,255,0.1)' }}>
        <FolderOpen size={16} style={{ color: ACCENT }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{project.name}</p>
        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{project.owner_name || 'Unknown'}</p>
      </div>
      <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{
        background: `${statusColors[project.status] || '#6b7280'}18`,
        color: statusColors[project.status] || '#6b7280'
      }}>
        {(project.status || 'draft').toUpperCase()}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}
      </span>
    </div>
  );
}

function ReviewRow({ review }) {
  const statusConfig = {
    completed: { icon: CheckCircle, color: '#22c55e', label: 'Completed' },
    pending: { icon: Clock, color: '#f59e0b', label: 'Pending' },
    failed: { icon: XCircle, color: '#ef4444', label: 'Failed' },
    processing: { icon: AlertCircle, color: '#3b82f6', label: 'Processing' },
  };
  const cfg = statusConfig[review.status] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}18` }}>
        <Icon size={16} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
          Review #{review.id}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Project #{review.ui_project_id}
        </p>
      </div>
      {review.scores?.overall && (
        <div className="text-[14px] font-bold" style={{ color: cfg.color }}>
          {review.scores.overall}/100
        </div>
      )}
      <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: `${cfg.color}18`, color: cfg.color }}>
        {cfg.label}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {review.created_at ? new Date(review.created_at).toLocaleDateString() : '-'}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('inspector_token');
      const res = await fetch('/api/admin/inspector/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { stats, recent_users, recent_projects, recent_reviews } = data || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-black" style={{ color: 'var(--text)' }}>Admin Dashboard</h1>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Overview of your UI Inspector platform</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 p-4" style={{ background: 'rgba(239,68,68,0.05)' }}>
          <div className="flex items-center gap-3">
            <XCircle size={20} style={{ color: '#ef4444' }} />
            <div>
              <p className="text-[13px] font-medium text-red-400">{error}</p>
              <button onClick={fetchDashboard} className="text-[11px] underline mt-1" style={{ color: 'var(--text-muted)' }}>
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.total_users}
          subtext={`${stats?.new_users_today || 0} today`}
          color={ACCENT}
          loading={loading}
        />
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={stats?.total_projects}
          subtext={`${stats?.projects_today || 0} today`}
          color={ACCENT}
          loading={loading}
        />
        <StatCard
          icon={Star}
          label="Total Reviews"
          value={stats?.total_reviews}
          subtext={`${stats?.reviews_today || 0} today`}
          color={ACCENT}
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats?.completed_reviews}
          subtext={`${stats?.failed_reviews || 0} failed`}
          color="#22c55e"
          loading={loading}
        />
      </div>

      {/* Average Scores */}
      {stats?.avg_scores && (
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-[14px] font-bold mb-4" style={{ color: 'var(--text)' }}>Average Review Scores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Overall', value: stats.avg_scores.overall },
              { label: 'Visual Hierarchy', value: stats.avg_scores.visual_hierarchy },
              { label: 'Clarity', value: stats.avg_scores.clarity },
              { label: 'Accessibility', value: stats.avg_scores.accessibility },
              { label: 'Consistency', value: stats.avg_scores.consistency },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[24px] font-black" style={{ color: ACCENT }}>{value}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Recent Users</h2>
            <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(124,92,255,0.1)', color: ACCENT }}>
              {stats?.total_users || 0} total
            </span>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
            ) : recent_users?.length > 0 ? (
              recent_users.map(u => <UserRow key={u.id} user={u} />)
            ) : (
              <div className="p-8 text-center">
                <Users size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No users yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Recent Projects</h2>
            <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(124,92,255,0.1)', color: ACCENT }}>
              {stats?.total_projects || 0} total
            </span>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
            ) : recent_projects?.length > 0 ? (
              recent_projects.map(p => <ProjectRow key={p.id} project={p} />)
            ) : (
              <div className="p-8 text-center">
                <FolderOpen size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No projects yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Recent Reviews</h2>
            <span className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(124,92,255,0.1)', color: ACCENT }}>
              {stats?.total_reviews || 0} total
            </span>
          </div>
          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
            ) : recent_reviews?.length > 0 ? (
              recent_reviews.map(r => <ReviewRow key={r.id} review={r} />)
            ) : (
              <div className="p-8 text-center">
                <Star size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
