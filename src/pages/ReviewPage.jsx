import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  ArrowLeft, RefreshCw, Plus, ChevronDown, AlertCircle,
  CheckCircle2, Lightbulb, Loader2, Upload, X, Sparkles
} from 'lucide-react';

export default function ReviewPage() {
  // In React Router v7, useParams() may return the raw params object in some cases.
  // Use window.location as the definitive source to ensure we always get a string ID.
  const urlId = window.location.pathname.split('/').filter(Boolean).pop();
  const { id: paramId } = useParams();
  // Prefer useParams() id, fall back to URL parsing — never use an object
  const rawId = paramId !== undefined ? paramId : urlId;
  const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : urlId;

  const { token } = useAuth();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rightTab, setRightTab] = useState('issues');
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (id) loadReview(id);
    return () => { };
  }, [id]);

  async function loadReview(targetId) {
    // Ensure targetId is a valid string before API call
    if (!targetId || typeof targetId !== 'string' || targetId === '[object Object]') {
      // Fallback: parse from URL
      targetId = window.location.pathname.split('/').filter(Boolean).pop();
    }
    if (!targetId || typeof targetId !== 'string') return;
    setLoading(true);
    setReview(null); // clear stale review while loading
    try {
      const data = await api.getReview(targetId, token);
      // Guard: if user navigated away, discard stale response
      if (String(targetId) !== String(id)) return;
      setReview(data.review);
    } catch {
      if (String(targetId) !== String(id)) return;
    } finally {
      if (String(targetId) !== String(id)) return;
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading review...</p>
    </div>
  );

  if (!review) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={24} style={{ color: 'var(--error)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review not found</p>
      <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
    </div>
  );

  // Guard: ensure loaded review belongs to the correct project
  // (prevents showing a different project's review after stale navigation)
  if (review.project_id == null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <AlertCircle size={24} style={{ color: 'var(--error)' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Invalid review data</p>
        <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
      </div>
    );
  }

  const scores = review.scores || {};
  const annotations = review.annotations || [];
  const suggestions = review.suggestions || [];
  const isCompleted = review.status === 'completed' && scores.overall > 0;
  const isAnalyzing = review.status === 'analyzing' || review.status === 'pending';
  const isFailed = review.status === 'failed';
  const overall = scores.overall || 0;

  const getScoreColor = (v) => {
    if (v >= 80) return 'var(--success)';
    if (v >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreBg = (v) => {
    if (v >= 80) return 'var(--success-light)';
    if (v >= 60) return 'var(--warning-light)';
    return 'var(--error-light)';
  };

  const getScoreLabel = (v) => {
    if (v >= 90) return 'Excellent';
    if (v >= 80) return 'Good';
    if (v >= 65) return 'Average';
    if (v >= 50) return 'Below Average';
    return 'Poor';
  };

  const scoreBars = [
    { label: 'Visual Hierarchy', value: scores.visual_hierarchy || 0 },
    { label: 'Readability', value: scores.readability || 0 },
    { label: 'Accessibility', value: scores.accessibility || 0 },
    { label: 'Navigation', value: scores.navigation || 0 },
    { label: 'Mobile Responsiveness', value: scores.mobile_responsiveness || 0 },
  ];

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="review-topbar">
        <button onClick={() => navigate('/dashboard')} className="btn-icon" title="Back to Dashboard">
          <ArrowLeft size={15} />
        </button>
        <div className="review-breadcrumb">
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {review.project?.name || 'Project'} · {review.page_goal || 'Page Review'}
          </span>
        </div>
        {overall > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: getScoreColor(overall) }}>
              {overall}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
          </div>
        )}
        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, height: 32 }}>
          <Plus size={12} /> New
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 53px)' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '0 16px' }}>
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'annotations', label: `Annotations (${annotations.length})` },
              { key: 'suggestions', label: `Suggestions (${suggestions.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 16px', maxWidth: 640 }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Screenshot */}
                {review.screenshot_url && (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <img
                      src={review.screenshot_url}
                      alt="Screenshot"
                      style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block', background: 'var(--background)' }}
                    />
                  </div>
                )}

                {/* Overall Score Card */}
                <div className="card" style={{ padding: '20px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Overall Score
                  </p>
                  {isCompleted ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 52, fontWeight: 700, color: getScoreColor(overall), lineHeight: 1 }}>
                          {overall}
                        </span>
                        <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: getScoreColor(overall), background: getScoreBg(overall), padding: '3px 10px', borderRadius: 20 }}>
                        {getScoreLabel(overall)}
                      </span>
                    </>
                  ) : isAnalyzing ? (
                    <div style={{ padding: '16px 0' }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analysis in progress...</p>
                    </div>
                  ) : isFailed ? (
                    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <AlertCircle size={22} style={{ color: 'var(--error)', margin: '0 auto' }} />
                      <p style={{ fontSize: 12, color: 'var(--error)', fontWeight: 600 }}>Analysis failed</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>The AI could not complete this review.</p>
                      <button onClick={loadReview} className="btn-secondary" style={{ fontSize: 11, height: 30, padding: '0 12px' }}>
                        <RefreshCw size={11} /> Retry
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 0' }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting...</p>
                    </div>
                  )}
                </div>

                {/* Score Bars */}
                {isCompleted && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Score Breakdown</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {scoreBars.filter(s => s.value > 0).map(bar => (
                        <div key={bar.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{bar.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: getScoreColor(bar.value) }}>{bar.value}</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-bar-fill ${bar.value >= 80 ? 'success' : bar.value >= 60 ? 'warning' : 'error'}`}
                              style={{ width: `${bar.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What's Working */}
                {isCompleted && scores.what_works_well && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      What's Working
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{scores.what_works_well}</p>
                  </div>
                )}

                {/* Needs Attention */}
                {isCompleted && scores.needs_attention && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                      Needs Attention
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{scores.needs_attention}</p>
                  </div>
                )}
              </div>
            )}

            {/* Annotations Tab */}
            {activeTab === 'annotations' && (
              <div className="animate-fade-in">
                {annotations.length === 0 ? (
                  <div className="empty-state" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '40px 24px' }}>
                    <div className="empty-state-icon">
                      <AlertCircle size={22} />
                    </div>
                    <p className="empty-state-title">No annotations yet</p>
                    <p className="empty-state-desc">Annotations will appear after AI analysis</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {annotations.map((ann, i) => (
                      <div key={i} className="card" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: ann.severity === 'critical' ? 'var(--error-light)' : ann.severity === 'high' ? 'var(--warning-light)' : 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
                          }}>
                            <AlertCircle size={11} style={{ color: ann.severity === 'critical' ? 'var(--error)' : ann.severity === 'high' ? 'var(--warning)' : 'var(--primary)' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{ann.type || ann.element}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ann.description || ann.message}</p>
                            {ann.suggestion && (
                              <p style={{ fontSize: 11, color: 'var(--primary)', marginTop: 6, fontWeight: 500 }}>{ann.suggestion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="animate-fade-in">
                {suggestions.length === 0 ? (
                  <div className="empty-state" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '40px 24px' }}>
                    <div className="empty-state-icon">
                      <Lightbulb size={22} />
                    </div>
                    <p className="empty-state-title">No suggestions yet</p>
                    <p className="empty-state-desc">AI suggestions will appear after analysis</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {suggestions.map((sug, i) => (
                      <div key={i} className="card" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
                          }}>
                            <Lightbulb size={11} style={{ color: 'var(--primary)' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{sug.title || sug.category}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sug.description || sug.suggestion}</p>
                            {sug.priority && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--warning)', background: 'var(--warning-light)', padding: '1px 6px', borderRadius: 10, marginTop: 6, display: 'inline-block' }}>
                                {sug.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Review Actions</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={loadReview} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34 }}>
                <RefreshCw size={12} /> Retry
              </button>
              <button onClick={() => setShowNew(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34 }}>
                <Plus size={12} /> New
              </button>
            </div>
          </div>

          <div style={{ padding: '0 14px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              {[
                { key: 'issues', label: `Issues (${annotations.length})` },
                { key: 'tips', label: `Tips (${suggestions.length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setRightTab(t.key)}
                  className={`tab-btn ${rightTab === t.key ? 'active' : ''}`}
                  style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {rightTab === 'issues' && (
              <div style={{ paddingBottom: 16 }}>
                {annotations.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No issues found</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {annotations.map((ann, i) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: ann.severity === 'critical' ? 'var(--error-light)' : ann.severity === 'high' ? 'var(--warning-light)' : 'var(--primary-light)', border: `1px solid ${ann.severity === 'critical' ? 'var(--error)' : ann.severity === 'high' ? 'var(--warning)' : 'var(--primary)'}30` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{ann.type || 'Issue'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ann.description || ann.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rightTab === 'tips' && (
              <div style={{ paddingBottom: 16 }}>
                {suggestions.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No tips yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {suggestions.map((sug, i) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', border: '1px solid var(--primary)30' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{sug.title || sug.category}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sug.description || sug.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
