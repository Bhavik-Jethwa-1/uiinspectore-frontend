import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  ArrowLeft, Plus, Image as ImageIcon, Clock, BarChart3,
  Trash2, X, Loader2, Upload, Eye
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import NewReviewModal from '../components/NewReviewModal';

export default function ProjectDetailPage() {
  // In React Router v7, useParams() may return the raw params object.
  // Always derive the ID from the URL as a string.
  const urlId = window.location.pathname.split('/').filter(Boolean).pop();
  const { id: paramId } = useParams();
  const id = typeof paramId === 'string' || typeof paramId === 'number' ? String(paramId) : urlId;

  const { token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewReview, setShowNewReview] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token && id) loadProject(id);
  }, [id, token]);

  async function loadProject(targetId) {
    // Guard: ensure targetId is a valid string
    if (!targetId || typeof targetId !== 'string' || targetId === '[object Object]') {
      targetId = window.location.pathname.split('/').filter(Boolean).pop();
    }
    if (!targetId || typeof targetId !== 'string') return;
    setLoading(true);
    setProject(null);
    try {
      const data = await api.getProject(targetId, token);
      if (String(targetId) !== String(id)) return;
      if (data.project && String(data.project.id) !== String(targetId)) return;
      setProject(data.project);
    } catch {
      if (String(targetId) !== String(id)) return;
    } finally {
      if (String(targetId) !== String(id)) return;
      setLoading(false);
    }
  }

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreBg = (score) => {
    if (!score) return 'var(--hover)';
    if (score >= 80) return 'var(--success-light)';
    if (score >= 60) return 'var(--warning-light)';
    return 'var(--error-light)';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const reviews = project?.reviews || [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  if (!project) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Project not found</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</button>
    </div>
  );

  const completedCount = reviews.filter(r => r.status === 'completed').length;
  const scoredReviews = reviews.filter(r => r.scores?.overall);
  const avgScore = scoredReviews.length > 0
    ? Math.round(scoredReviews.reduce((s, r) => s + r.scores.overall, 0) / scoredReviews.length)
    : null;

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate('/dashboard')} className="btn-icon" title="Back to Dashboard">
            <ArrowLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </h1>
            {project.description && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.description}
              </p>
            )}
          </div>
          <button onClick={() => setShowNewReview(true)} className="btn-primary" style={{ flexShrink: 0 }}>
            <Plus size={14} /> New Review
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Total Reviews</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{reviews.length}</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Completed</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{completedCount}</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Avg Score</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{avgScore ?? '—'}</p>
          </div>
        </div>

        {/* Score history — shown only when 2+ scored reviews exist */}
        {scoredReviews.length >= 2 && (() => {
          const sorted = [...scoredReviews].sort((a, b) => (a.id || 0) - (b.id || 0));
          const first = sorted[0].scores.overall;
          const last  = sorted[sorted.length - 1].scores.overall;
          const diff  = last - first;
          const getSC = (v) => v >= 80 ? 'var(--success)' : v >= 60 ? 'var(--warning)' : 'var(--error)';
          return (
            <div className="card" style={{ padding: '12px 14px', marginBottom: 12, background: 'var(--primary-light)', border: '1px solid var(--primary)20' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Score Progress</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {sorted.map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: getSC(r.scores.overall) }}>{r.scores.overall}</span>
                    {i < sorted.length - 1 && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>→</span>}
                  </div>
                ))}
                <span style={{ fontSize: 12, fontWeight: 700, color: diff >= 0 ? 'var(--success)' : 'var(--error)', marginLeft: 4 }}>
                  ({diff >= 0 ? '+' : ''}{diff} pts)
                </span>
              </div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
                First review: {first} → Latest ({sorted.length} review{sorted.length !== 1 ? 's' : ''}): {last}
              </p>
            </div>
          );
        })()}
        {scoredReviews.length === 1 && (
          <div className="card" style={{ padding: '10px 14px', marginBottom: 12, background: 'var(--hover)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Complete another review to see your score improvement over time.
            </p>
          </div>
        )}

        {/* Reviews section */}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Reviews</h2>

        {reviews.length === 0 ? (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <ImageIcon size={36} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>No reviews yet for this project</p>
            <button onClick={() => setShowNewReview(true)} className="btn-primary" style={{ fontSize: 12 }}>
              <Plus size={14} /> Start First Review
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.map(r => (
              <div key={r.id} className="card card-hover" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.page_goal || 'Page Review'}
                      </span>
                      <span className={`badge ${r.status === 'completed' ? 'badge-green' : r.status === 'analyzing' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>
                        {r.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</span>
                    </div>
                  </div>

                  {r.scores?.overall ? (
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: getScoreColor(r.scores.overall),
                      background: getScoreBg(r.scores.overall),
                      padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                    }}>
                      {r.scores.overall}
                    </span>
                  ) : null}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Link to={`/review/${r.id}`} className="btn-icon" title="View">
                      <Eye size={13} />
                    </Link>
                    <button
                      className="btn-icon"
                      title="Delete"
                      onClick={() => setDeleteTarget({ id: r.id })}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewReviewModal
        open={showNewReview}
        onClose={() => setShowNewReview(false)}
        project={project}
      />

      {deleteTarget && (
        <ConfirmModal
          title="Delete Review"
          message="Are you sure you want to delete this review? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await api.deleteReview(deleteTarget.id, token);
              setDeleteTarget(null);
              loadProject(id);
            } catch {
              setDeleteTarget(null);
            } finally {
              setDeleting(false);
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
