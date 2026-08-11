import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  ArrowLeft, Plus, Image as ImageIcon, Clock, BarChart3,
  Trash2, X, Loader2, Upload, Eye
} from 'lucide-react';

const PERSONAS = [
  { value: 'first-time', label: 'First-time user' },
  { value: 'non-technical', label: 'Non-technical user' },
  { value: 'junior-developer', label: 'Junior developer' },
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
    setStep(2);
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

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Upload Screenshot</h3>
              <label
                style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', display: 'block', transition: 'border-color 0.15s' }}
              >
                <Upload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Click or drag to upload</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, JPEG, WEBP (max 10MB)</p>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          )}

          {step === 2 && preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={preview} alt="Preview" className="w-full rounded-lg max-h-48 object-contain" style={{ background: 'var(--background)', display: 'block' }} />
                <button
                  onClick={() => { setFile(null); setPreview(null); setStep(1); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                >
                  <X size={12} />
                </button>
              </div>

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

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                <button
                  onClick={handleAnalyze}
                  disabled={uploading || !pageGoal.trim()}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {uploading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : 'Analyze'}
                </button>
              </div>
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
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewReview, setShowNewReview] = useState(false);

  useEffect(() => {
    if (token && id) loadProject();
  }, [id, token]);

  async function loadProject() {
    try {
      const data = await api.getProject(id, token);
      setProject(data.project);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('Delete this review?')) return;
    try {
      await api.deleteReview(reviewId, token);
      loadProject();
    } catch {}
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
      <Link to="/projects" className="btn-primary" style={{ fontSize: 12 }}>Back to Projects</Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Link to="/projects" className="btn-icon">
            <ArrowLeft size={16} />
          </Link>
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

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Reviews', value: reviews.length, icon: ImageIcon },
            { label: 'Completed', value: reviews.filter(r => r.status === 'completed').length, icon: BarChart3 },
            { label: 'Avg Score', value: reviews.filter(r => r.scores?.overall).length > 0
              ? Math.round(reviews.filter(r => r.scores?.overall).reduce((s, r) => s + r.scores.overall, 0) / reviews.filter(r => r.scores?.overall).length)
              : '—', icon: Clock },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
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
                      onClick={() => handleDeleteReview(r.id)}
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
    </div>
  );
}
