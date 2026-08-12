import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  ArrowLeft, Plus, Image as ImageIcon, Clock, BarChart3,
  Trash2, X, Loader2, Upload, Eye
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PERSONAS = [
  { value: 'first_time', label: 'First-time user' },
  { value: 'non_technical', label: 'Non-technical user' },
  { value: 'junior_developer', label: 'Junior developer' },
  { value: 'developer', label: 'Developer' },
  { value: 'devops', label: 'DevOps engineer' },
  { value: 'designer', label: 'Product designer' },
  { value: 'manager', label: 'Product manager' },
  { value: 'custom', label: 'Custom' },
];

function NewReviewModal({ open, onClose, project, onSuccess }) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState('developer');
  const [pageGoal, setPageGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1); setPersona('developer'); setPageGoal('');
      setFile(null); setPreview(null); setUploading(false); setError('');
    }
  }, [open]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    if (!pageGoal.trim()) { setError('Please enter a page goal'); return; }
    setError('');
    setUploading(true);
    setAnalysisStep('Uploading screenshot...');
    try {
      const reviewData = await api.createReview(
        { project_id: project.id, persona, page_goal: pageGoal }, token
      );
      await api.uploadScreenshot(reviewData.review.id, file, token);
      setStep(3);
      const steps = ['Understanding page structure...', 'Checking visual hierarchy...',
        'Analyzing typography...', 'Checking accessibility...', 'Finding UX issues...', 'Generating recommendations...'];
      let stepIdx = 0;
      const interval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        setAnalysisStep(steps[stepIdx]);
      }, 2500);
      await api.analyzeReview(reviewData.review.id, token);
      clearInterval(interval);
      onSuccess(reviewData.review);
      onClose();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-scale-in" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>New Review for {project?.name}</h2>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div style={{ padding: 16 }}>
          {error && (
            <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)', marginBottom: 12 }}>
              {error}
            </div>
          )}

          {(step === 1 || preview) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
                {preview ? 'Screenshot' : 'Upload Screenshot'}
              </h3>

              {preview ? (
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block', background: 'var(--background)' }}
                  />
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                    <label
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow-sm)' }}
                    >
                      <Upload size={11} />
                      Replace
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      onClick={() => { setFile(null); setPreview(null); setStep(1); }}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: 'var(--shadow-sm)' }}
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', display: 'block', transition: 'border-color 0.15s' }}
                >
                  <Upload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Click or drag to upload</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, JPEG, WEBP (max 10MB)</p>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
                </label>
              )}

              {preview && (
                <>
                  <div>
                    <label className="label">Persona</label>
                    <select value={persona} onChange={(e) => setPersona(e.target.value)} className="select">
                      {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Page Goal</label>
                    <textarea
                      value={pageGoal}
                      onChange={(e) => setPageGoal(e.target.value)}
                      className="textarea"
                      placeholder="User should be able to..."
                      style={{ minHeight: 80 }}
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={uploading || !pageGoal.trim()}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {uploading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : 'Analyze'}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <Loader2 size={36} style={{ color: 'var(--primary)', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{analysisStep}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This usually takes 15–30 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        onSuccess={(review) => navigate(`/review/${review.id}`)}
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
