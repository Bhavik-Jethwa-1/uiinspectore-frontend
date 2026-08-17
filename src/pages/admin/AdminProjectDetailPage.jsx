import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { openAdminReview } from '../../utils/adminNav';
import AdminReloadBtn from '../../components/admin/AdminReloadBtn';
import {
  ArrowLeft, Loader2, AlertCircle, Eye, Star, FolderOpen, User,
  ChevronLeft, ChevronRight, RefreshCw
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

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 12, background: 'var(--background)', minHeight: '100vh', padding: 24 }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary)' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ background: 'var(--background)', minHeight: '100vh', padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/admin/projects')}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}
          >
            <ArrowLeft size={14} /> Back to Projects
          </button>
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--error)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              {error || 'Project not found'}
            </p>
            <button className="btn-primary" onClick={loadData} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <button
                onClick={() => navigate('/admin/projects')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                Projects
              </button>
              <span>/</span>
              <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }} title={project.name}>
              {project.name}
            </h1>
            {project.description && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>
                {project.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={loadData}
              className="btn-ghost"
              title="Refresh"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => navigate('/admin/projects')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <ArrowLeft size={14} /> Back to Projects
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--primary) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderOpen size={15} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {project.reviews_count ?? 0}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Reviews</p>
          </div>

          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--warning) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={15} style={{ color: 'var(--warning)' }} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: getScoreColor(project.avg_score), marginBottom: 2 }}>
              {project.avg_score != null ? project.avg_score : '—'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Avg Score</p>
          </div>

          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} style={{ color: 'var(--accent)' }} />
              </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={project.user?.name || ''}>
              {project.user?.name || '—'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Owner</p>
          </div>

          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--success) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} style={{ color: 'var(--success)' }} />
              </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              {formatDate(project.created_at)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Created</p>
          </div>
        </div>

        {/* Reviews */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Reviews ({reviews.length})
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ margin: '0 auto 12px' }}>
                <FolderOpen size={20} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                No reviews yet
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                This project has no reviews
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Persona', 'Page Goal', 'Status', 'Score', 'Date', 'Action'].map(h => {
                      const centerCols = ['Score', 'Action'];
                      return (
                        <th key={h} style={{
                          padding: '10px 12px', fontSize: 10, fontWeight: 600,
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
                      <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)' }}>#{r.id}</td>
                      <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {r.persona?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 200 }}>
                        <span title={r.page_goal || ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.page_goal || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 12px' }}>{getStatusBadge(r.status)}</td>
                      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                        {r.scores?.overall != null ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(r.scores.overall) }}>
                            {r.scores.overall}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '11px 12px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(r.created_at)}
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => openAdminReview(navigate, r.id)}
                          className="btn-icon"
                          title="View review"
                          style={{ padding: 6 }}
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
