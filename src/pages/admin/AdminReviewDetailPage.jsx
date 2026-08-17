import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  ArrowLeft, Loader2, AlertCircle, Star, Clock,
  MapPin, ShieldCheck, CheckCircle2
} from 'lucide-react';

function getScoreColor(score) {
  if (!score && score !== 0) return 'var(--text-muted)';
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function getScoreLabel(score) {
  if (!score && score !== 0) return '—';
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 50) return 'Below Average';
  return 'Needs Work';
}

function ScoreCard({ label, value, large }) {
  if (value == null) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      textAlign: 'center',
      minWidth: 70,
    }}>
      <p style={{ fontSize: large ? 22 : 16, fontWeight: 800, color: getScoreColor(value), lineHeight: 1, marginBottom: 3 }}>
        {value}
      </p>
      <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const color = severity === 'critical' ? 'var(--error)'
    : severity === 'high' ? 'var(--warning)'
    : severity === 'medium' ? 'var(--secondary)'
    : 'var(--text-muted)';
  const bg = severity === 'critical' ? 'var(--error-light)'
    : severity === 'high' ? 'var(--warning-light)'
    : severity === 'medium' ? 'var(--primary-light)'
    : 'var(--hover)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      background: bg, color,
    }}>
      {severity || 'low'}
    </span>
  );
}

export default function AdminReviewDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    loadReview();
  }, [id, token]);

  async function loadReview() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getReview(id, token);
      setReview(data.review);
    } catch (e) {
      setError(e.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const statusBadge = (s) => {
    const map = {
      completed: { bg: 'var(--success-light)', color: 'var(--success)', label: 'Completed' },
      analyzing: { bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Analyzing' },
      pending:   { bg: 'var(--hover)', color: 'var(--text-secondary)', label: 'Pending' },
      failed:    { bg: 'var(--error-light)', color: 'var(--error)', label: 'Failed' },
    };
    const b = map[s] || { bg: 'var(--hover)', color: 'var(--text-muted)', label: s };
    return (
      <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, background: b.bg, color: b.color }}>
        {b.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 0' }}>
        <button onClick={() => navigate('/admin/reviews')} className="btn-secondary" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to All Reviews
        </button>
        <div style={{ padding: '32px', borderRadius: 12, border: '1px solid var(--error)', background: 'var(--error-light)', textAlign: 'center' }}>
          <AlertCircle size={24} style={{ color: 'var(--error)', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--error)', marginBottom: 6 }}>Failed to load review</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={loadReview} className="btn-primary" style={{ marginTop: 14 }}>Retry</button>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const overall = review.scores?.overall;
  const issues = review.issues || [];
  const annotations = review.annotations || [];

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/reviews')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          padding: '8px 0', marginBottom: 16,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={14} /> Back to All Reviews
      </button>

      {/* Header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '18px 20px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                Review #{review.id}
              </h1>
              {statusBadge(review.status)}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Project: <strong style={{ color: 'var(--text-secondary)' }}>{review.project_name || '—'}</strong>
              {review.persona && <span> · Persona: <strong style={{ color: 'var(--text-secondary)' }}>{review.persona}</strong></span>}
            </p>
            {review.page_goal && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Goal: <em style={{ color: 'var(--text-secondary)' }}>{review.page_goal}</em>
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {formatDate(review.created_at)}
          </div>
        </div>
      </div>

      {/* Score Section */}
      {review.status === 'completed' && review.scores && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 20px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={14} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Scores</h2>
            {overall != null && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                — {getScoreLabel(overall)}
              </span>
            )}
          </div>

          {/* Overall score hero */}
          {overall != null && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              background: getScoreColor(overall) + '15',
              border: `1.5px solid ${getScoreColor(overall)}40`,
              borderRadius: 10, padding: '12px 20px', marginBottom: 14,
            }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(overall), lineHeight: 1 }}>
                {overall}
              </span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(overall) }}>Overall Score</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getScoreLabel(overall)}</p>
              </div>
            </div>
          )}

          {/* Score grid */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ScoreCard label="Visual" value={review.scores.visualHierarchy} />
            <ScoreCard label="Clarity" value={review.scores.clarity} />
            <ScoreCard label="Access" value={review.scores.accessibility} />
            <ScoreCard label="Consist" value={review.scores.consistency} />
            <ScoreCard label="Layout" value={review.scores.layout} />
            <ScoreCard label="Typography" value={review.scores.typography} />
            <ScoreCard label="UX" value={review.scores.ux} />
          </div>

          {/* Summary */}
          {review.scores.summary && (
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: 'var(--primary-light)', borderRadius: 8,
              border: '1px solid var(--primary)20',
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>AI Summary</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {review.scores.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Screenshot */}
      {review.screenshot_url && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 20px', marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Screenshot</h2>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
            <img
              src={review.screenshot_url}
              alt="Review screenshot"
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block', background: 'var(--background)' }}
            />
            {/* Annotation pins overlaid */}
            {annotations.filter(a => a.x != null || a.y != null).length > 0 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
              }}>
                {annotations.filter(a => a.x != null || a.y != null).map((ann, i) => {
                  const pct = {
                    left: `${(ann.x / (review.screenshot_width || 1920)) * 100}%`,
                    top: `${(ann.y / (review.screenshot_height || 1080)) * 100}%`,
                  };
                  return (
                    <div
                      key={ann.id}
                      style={{
                        position: 'absolute',
                        ...pct,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--primary)',
                        border: '2px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 800, color: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}>
                        {i + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            {annotations.filter(a => a.x != null || a.y != null).length} annotated issue{annotations.filter(a => a.x != null || a.y != null).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 20px', marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Issues ({issues.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {issues.map((iss, i) => (
              <div
                key={iss.id}
                style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--background)',
                  border: `1px solid var(--border)`,
                  borderLeft: `3px solid ${iss.severity === 'critical' ? 'var(--error)' : iss.severity === 'high' ? 'var(--warning)' : 'var(--secondary)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <SeverityBadge severity={iss.severity} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                    {iss.title}
                  </span>
                  {annotations.find(a => a.issue_id === iss.id) && (
                    <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                {iss.description && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: iss.recommendation ? 4 : 0 }}>
                    {iss.description}
                  </p>
                )}
                {iss.recommendation && (
                  <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 500 }}>
                    Fix: {iss.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {issues.length === 0 && review.status !== 'completed' && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '32px', textAlign: 'center',
        }}>
          <Clock size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Review not yet analyzed
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            This review is still {review.status}.
          </p>
        </div>
      )}
    </div>
  );
}
