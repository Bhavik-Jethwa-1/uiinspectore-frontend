import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { openAdminReview } from '../../utils/adminNav';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import ProjectDetailSkeleton from '../../components/admin/ProjectDetailSkeleton';
import {
  ArrowLeft, Loader2, AlertCircle, Eye, Star, FolderOpen, User,
  RefreshCw, LayoutGrid, Activity, BarChart3, ChevronRight
} from 'lucide-react';

function getScoreColor(score) {
  if (!score) return 'var(--text-muted)';
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function getStatusBadge(status) {
  switch (status) {
    case 'completed': return <span className="badge badge-green">Completed</span>;
    case 'analyzing': return <span className="badge badge-blue">Analyzing</span>;
    case 'pending': return <span className="badge badge-gray">Pending</span>;
    case 'failed': return <span className="badge badge-red">Failed</span>;
    default: return <span className="badge badge-gray">{status || 'Unknown'}</span>;
  }
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

const TABS = ['Overview', 'Reviews'];

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.adminGetProject(id, token);
      setProject(data.project);
      setReviews(data.reviews || []);
    } catch (e) {
      setError(e.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="admin-page">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="admin-page">
        <div className="admin-page-content">
          <div className="admin-header">
            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: '2px 4px', borderRadius: 4 }}>Admin</button>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>
              <button onClick={() => navigate('/admin/projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: '2px 4px', borderRadius: 4 }}>Projects</button>
            </nav>
            <button onClick={() => navigate('/admin/projects')} className="btn-ghost" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 10px', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={12} /><span>Back</span>
            </button>
          </div>
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--error)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{error || 'Project not found'}</p>
            <button className="btn-primary" onClick={loadData} style={{ marginTop: 12 }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const completedReviews = reviews.filter(r => r.status === 'completed');
  const avgScore = completedReviews.length > 0
    ? Math.round(completedReviews.reduce((sum, r) => sum + (r.scores?.overall || 0), 0) / completedReviews.length)
    : null;

  return (
    <div className="admin-page">
      <div className="admin-page-content">

        {/* Page Header */}
        <div className="admin-header">
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <button
              onClick={() => navigate('/admin')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: '2px 4px', borderRadius: 4 }}
            >
              Admin
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>
            <button
              onClick={() => navigate('/admin/projects')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: '2px 4px', borderRadius: 4 }}
            >
              Projects
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 12, padding: '2px 4px' }}>
              {project.name}
            </span>
          </nav>
          <button
            onClick={() => navigate('/admin/projects')}
            className="btn-ghost"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 10px', color: 'var(--text-secondary)' }}
            aria-label="Back to Projects"
          >
            <ArrowLeft size={12} />
            <span>Back</span>
          </button>
        </div>

        {/* Project Info Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.name}>
            {project.name}
          </h1>
          {project.description && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{project.description}</p>
          )}
          {project.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner:</span>
              <button
                onClick={() => navigate(`/admin/users/${project.user.id}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{project.user.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({project.user.email})</span>
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={loadData} className="btn-icon" title="Refresh" aria-label="Refresh project data">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab === 'Overview' && <BarChart3 size={14} />}
            {tab === 'Reviews' && <Eye size={14} />}
            <span>{tab}</span>
            {tab === 'Reviews' && (
              <span style={{
                background: activeTab === tab ? 'var(--primary)' : 'var(--border)',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                borderRadius: 9999, padding: '1px 6px', fontSize: 10, fontWeight: 700,
              }}>
                {reviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderOpen size={15} style={{ color: 'var(--primary)' }} />
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{reviews.length}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Total Reviews</p>
            </div>

            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--warning) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={15} style={{ color: 'var(--warning)' }} />
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: getScoreColor(avgScore), marginBottom: 2 }}>{avgScore ?? '—'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Avg Score</p>
            </div>

            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--success) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={15} style={{ color: 'var(--success)' }} />
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.user?.name || '—'}>{project.user?.name || '—'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Owner</p>
            </div>

            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={15} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{formatDate(project.created_at)}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Created</p>
            </div>
          </div>

          {/* Recent Reviews Preview */}
          {reviews.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>All Reviews ({reviews.length})</h2>
                <button
                  onClick={() => setActiveTab('Reviews')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Persona', 'Goal', 'Status', 'Score', 'Date', ''].map(h => {
                        const centerCols = ['Score'];
                        return (
                          <th key={h} style={{
                            padding: '9px 12px', fontSize: 10, fontWeight: 600,
                            color: 'var(--text-muted)', textAlign: centerCols.includes(h) ? 'center' : 'left',
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                            background: 'var(--background)', whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.slice(0, 5).map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < Math.min(reviews.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {r.persona?.replace(/_/g, ' ') || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200 }}>
                          <span title={r.page_goal || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.page_goal || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{getStatusBadge(r.status)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {r.scores?.overall != null ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(r.scores.overall) }}>{r.scores.overall}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(r.created_at)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" style={{ padding: 5 }}>
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'Reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="card" style={{ padding: '40px 0', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
                <FolderOpen size={20} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No reviews yet</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This project has no reviews.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Persona', 'Goal', 'Status', 'Score', 'Date', 'Action'].map(h => {
                        const centerCols = ['Score', 'Action'];
                        return (
                          <th key={h} style={{
                            padding: '9px 12px', fontSize: 10, fontWeight: 600,
                            color: 'var(--text-muted)', textAlign: centerCols.includes(h) ? 'center' : 'left',
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                            background: 'var(--background)', whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {r.persona?.replace(/_/g, ' ') || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200 }}>
                          <span title={r.page_goal || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.page_goal || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{getStatusBadge(r.status)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {r.scores?.overall != null ? (
                            <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(r.scores.overall) }}>{r.scores.overall}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatDate(r.created_at)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button onClick={() => openAdminReview(navigate, r.id)} className="btn-icon" title="View review" style={{ padding: 5 }}>
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
