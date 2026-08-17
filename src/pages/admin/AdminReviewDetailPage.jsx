import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  ArrowLeft, Loader2, AlertCircle, Star, Clock,
  MapPin, RefreshCw, Layout, MessageSquare, AlertTriangle,
  CheckCircle2, BarChart3, Image, ChevronRight, Eye
} from 'lucide-react';

/* ─── Shared helpers ─────────────────────────────────────────── */

function getScoreColor(score) {
  if (score == null) return 'var(--text-muted)';
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function getScoreLabel(score) {
  if (score == null) return '—';
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 50) return 'Below Average';
  return 'Needs Work';
}

function getStatusConfig(status) {
  const map = {
    completed: { cls: 'badge badge-green', label: 'Completed' },
    analyzing: { cls: 'badge badge-blue', label: 'Analyzing' },
    pending:   { cls: 'badge badge-gray', label: 'Pending' },
    failed:    { cls: 'badge badge-red', label: 'Failed' },
  };
  return map[status] || map.pending;
}

/* ─── Score Ring ──────────────────────────────────────────────── */

function ScoreRing({ score, size = 96, strokeWidth = 8 }) {
  if (score == null) return null;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      </div>
    </div>
  );
}

/* ─── Score Bar ───────────────────────────────────────────────── */

function ScoreBar({ label, value, icon: Icon }) {
  if (value == null) return null;
  const color = getScoreColor(value);
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Label */}
      <div style={{ width: 96, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={11} style={{ color: 'var(--text-muted)' }} />}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{label}</span>
        </div>
      </div>

      {/* Track + Fill */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Track background */}
        <div style={{
          height: 10,
          background: 'var(--border)',
          borderRadius: 9999,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Fill */}
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 9999,
            transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Shine overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
              borderRadius: 9999,
            }} />
          </div>
        </div>
      </div>

      {/* Score number */}
      <div style={{
        width: 32,
        textAlign: 'right',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ─── Severity Badge ──────────────────────────────────────────── */

function SeverityBadge({ severity }) {
  const map = {
    critical: { cls: 'badge badge-red', label: 'Critical' },
    high:     { cls: 'badge badge-orange', label: 'High' },
    medium:   { cls: 'badge badge-yellow', label: 'Medium' },
    low:      { cls: 'badge badge-gray', label: 'Low' },
  };
  const b = map[severity] || map.low;
  return <span className={b.cls}>{b.label}</span>;
}

/* ─── Issue Card ──────────────────────────────────────────────── */

function IssueCard({ issue, index, annotationCount }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : issue.severity === 'medium' ? 'var(--accent)'
    : 'var(--border)';

  return (
    <div
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${borderColor}`,
        background: 'var(--surface)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: borderColor + '20', color: borderColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, flexShrink: 0,
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <SeverityBadge severity={issue.severity} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{issue.title}</span>
          </div>
          {issue.description && !expanded && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {issue.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {annotationCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              <MapPin size={10} />{annotationCount}
            </span>
          )}
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {issue.description && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Description</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{issue.description}</p>
            </div>
          )}
          {issue.recommendation && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Recommendation</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--success-light)', borderRadius: 8, border: '1px solid var(--success)20' }}>
                <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'var(--success)', lineHeight: 1.6 }}>{issue.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

const TABS = ['Overview', 'Screenshot', 'Issues'];

export default function AdminReviewDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [refreshing, setRefreshing] = useState(false);

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

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await api.getReview(id, token);
      setReview(data.review);
    } catch {}
    setTimeout(() => setRefreshing(false), 500);
  }

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()} · ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="admin-page-content">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading review...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !review) {
    return (
      <div className="admin-page-content">
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: 0 }}>Admin</button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <button onClick={() => navigate('/admin/reviews')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: 0 }}>Reviews</button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{id}</span>
        </nav>
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <AlertCircle size={28} style={{ color: 'var(--error)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--error)', marginBottom: 6 }}>{error || 'Review not found'}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>The review could not be loaded.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => navigate('/admin/reviews')} className="btn-secondary" style={{ fontSize: 12 }}>Back to Reviews</button>
            <button onClick={loadReview} className="btn-primary" style={{ fontSize: 12 }}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const overall = review.scores?.overall;
  const issues = review.issues || [];
  const annotations = review.annotations || [];
  const st = getStatusConfig(review.status);

  return (
    <div className="admin-page-content">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          Admin
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <button onClick={() => navigate('/admin/reviews')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          Reviews
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>#{review.id}</span>
      </nav>

      {/* Page Header */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Review #{review.id}</h1>
              <span className={st.cls}>{st.label}</span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', fontSize: 12 }}>
              <MetaItem label="Project" value={review.project_name || '—'} />
              {review.persona && <MetaItem label="Persona" value={review.persona.replace(/_/g, ' ')} />}
              {review.page_goal && <MetaItem label="Goal" value={review.page_goal} title={review.page_goal} />}
              <MetaItem label="Date" value={formatDate(review.created_at)} icon={<Clock size={11} />} />
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost"
            title="Refresh review data"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', padding: '6px 12px', flexShrink: 0 }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'Overview' && <BarChart3 size={13} />}
              {tab === 'Screenshot' && <Image size={13} />}
              {tab === 'Issues' && <MessageSquare size={13} />}
              <span>{tab}</span>
              {tab === 'Issues' && issues.length > 0 && (
                <span style={{
                  background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  borderRadius: 9999, padding: '1px 6px',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {issues.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview ── */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {review.status === 'completed' && review.scores ? (
            <>
              {/* Score Card */}
              <div className="card" style={{ padding: '24px' }}>
                {overall != null ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <ScoreRing score={overall} size={100} strokeWidth={9} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{getScoreLabel(overall)}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Overall Score — {getScoreLabel(overall)} ({overall}/100)</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <ScoreBar label="Visual" value={review.scores.visualHierarchy} icon={Layout} />
                        <ScoreBar label="Clarity" value={review.scores.clarity} icon={Eye} />
                        <ScoreBar label="Accessibility" value={review.scores.accessibility} icon={CheckCircle2} />
                        <ScoreBar label="Consistency" value={review.scores.consistency} icon={BarChart3} />
                        <ScoreBar label="Layout" value={review.scores.layout} icon={Layout} />
                        <ScoreBar label="Typography" value={review.scores.typography} icon={MessageSquare} />
                        <ScoreBar label="UX" value={review.scores.ux} icon={Star} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <AlertTriangle size={24} style={{ color: 'var(--warning)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No scores available for this review.</p>
                  </div>
                )}

                {review.scores?.summary && (
                  <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>AI</span>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>AI Summary</p>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.scores.summary}</p>
                  </div>
                )}
              </div>

              {/* Issues Preview */}
              {issues.length > 0 && (
                <div className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Issues ({issues.length})</h2>
                    <button
                      onClick={() => setActiveTab('Issues')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {issues.slice(0, 3).map((iss, i) => {
                      const annCount = annotations.filter(a => a.issue_id === iss.id).length;
                      return <IssueCard key={iss.id} issue={iss} index={i} annotationCount={annCount} />;
                    })}
                  </div>
                  {issues.length > 3 && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                      +{issues.length - 3} more issues — see the Issues tab for the full list
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <BarChart3 size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 14px', opacity: 0.5 }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Review {review.status}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto' }}>
                {review.status === 'analyzing' ? 'This review is currently being analyzed. Check back shortly for the full score breakdown.'
                  : review.status === 'pending' ? 'This review is waiting in the queue to be analyzed.'
                  : 'This review has no scores available yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Screenshot ── */}
      {activeTab === 'Screenshot' && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Screenshot</h2>
            {annotations.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} />{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {review.screenshot_url ? (
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', background: 'var(--background)', marginTop: 12 }}>
              <img src={review.screenshot_url} alt="Review screenshot" style={{ width: '100%', maxHeight: 500, objectFit: 'contain', display: 'block' }} />
              {annotations.filter(a => a.x != null && a.y != null).map((ann, i) => {
                const pct = {
                  left: `${(ann.x / (review.screenshot_width || 1920)) * 100}%`,
                  top: `${(ann.y / (review.screenshot_height || 1080)) * 100}%`,
                };
                const issue = issues.find(iss => iss.id === ann.issue_id);
                const sevColor = issue?.severity === 'critical' ? 'var(--error)'
                  : issue?.severity === 'high' ? 'var(--warning)'
                  : issue?.severity === 'medium' ? 'var(--accent)'
                  : 'var(--primary)';
                return (
                  <div key={ann.id} title={issue?.title || `Issue #${i + 1}`} style={{ position: 'absolute', ...pct, transform: 'translate(-50%, -50%)' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: sevColor, border: '2.5px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900, color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.35)', cursor: 'default',
                    }}>
                      {i + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Image size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No screenshot available.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Issues ── */}
      {activeTab === 'Issues' && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Issues ({issues.length})</h2>
            {issues.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {issues.filter(i => i.severity === 'critical').length} critical
                · {issues.filter(i => i.severity === 'high').length} high
                · {issues.filter(i => i.severity === 'medium').length} medium
                · {issues.filter(i => i.severity === 'low').length} low
              </span>
            )}
          </div>

          {issues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={28} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>No issues found</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This review didn't find any issues. Great work!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {issues.map((iss, i) => {
                const annCount = annotations.filter(a => a.issue_id === iss.id).length;
                return <IssueCard key={iss.id} issue={iss} index={i} annotationCount={annCount} />;
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function MetaItem({ label, value, icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }} title={title || value}>
      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}:</span>
      {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
        {value}
      </span>
    </div>
  );
}
