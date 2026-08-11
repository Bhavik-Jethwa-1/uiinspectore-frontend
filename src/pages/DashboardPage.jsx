import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Clock,
  ChevronRight, X, Loader2, Upload, Trash2, Eye, Sparkles,
} from 'lucide-react';

// ---- New Review Modal ----
function NewReviewModal({ open, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [persona, setPersona] = useState('first-time');
  const [goal, setGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');

  useEffect(() => {
    if (!open) {
      setProjectName(''); setPersona('first-time'); setGoal('');
      setFile(null); setPreview(null); setStep(1); setError('');
    }
  }, [open]);

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

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!projectName.trim() || !goal.trim()) { setError('Please fill in all fields'); return; }
    setError(''); setStep(3); setUploading(true);
    const steps = ['Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy',
      'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations'];
    let i = 0;
    const iv = setInterval(() => {
      setAnalysisStep(steps[Math.min(i, steps.length - 1)]);
      i++;
    }, 2000);
    try {
      let projectId = null;
      const projectsData = await api.getProjects(token);
      const existing = projectsData.projects.find(p => p.name.toLowerCase() === projectName.trim().toLowerCase());
      if (existing) { projectId = existing.id; }
      else { const newProj = await api.createProject({ name: projectName.trim() }, token); projectId = newProj.project.id; }
      const rd = await api.createReview({ project_id: projectId, persona, page_goal: goal }, token);
      if (file) await api.uploadScreenshot(rd.review.id, file, token);
      const result = await api.analyzeReview(rd.review.id, token);
      clearInterval(iv);
      onClose();
      navigate(`/review/${result.review.id}`);
    } catch (err) {
      clearInterval(iv);
      setError(err.message); setStep(1); setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-scale-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {step === 3 ? 'Analyzing...' : 'New Review'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 1 }}>AI-powered UI analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={14} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="input"
                  placeholder="Enter project name"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Reviewer persona</label>
                <select value={persona} onChange={e => setPersona(e.target.value)} className="select">
                  {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Page goal</label>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="input"
                  style={{ resize: 'none', minHeight: 56, fontSize: 12, lineHeight: 1.4 }}
                  placeholder="What should a user be able to do on this page?"
                />
              </div>
              <label className="block cursor-pointer rounded-lg text-center"
                style={{ border: '1.5px dashed var(--border)', background: 'var(--background)', padding: '14px 12px' }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <Upload size={13} style={{ color: 'var(--primary)' }} />
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Upload screenshot</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 2 }}>PNG, JPG, or WEBP · Optional</p>
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>
              <button
                onClick={() => setStep(2)}
                disabled={!projectName.trim() || !goal.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '9px 16px', fontSize: 13 }}
              >
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {preview && (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={preview} alt="Preview" className="w-full max-h-32 object-contain" style={{ background: 'var(--background)', display: 'block' }} />
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>Edit</button>
                <button onClick={handleSubmit} disabled={uploading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                  {uploading ? <><Loader2 size={12} className="animate-spin" /> Analyzing...</> : 'Start Review'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              {[
                'Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy',
                'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations',
              ].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: label === analysisStep ? 'var(--success-light)' : 'var(--hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8, color: label === analysisStep ? 'var(--success)' : 'var(--border)' }}>
                      {label === analysisStep ? '●' : '✓'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, color: label === analysisStep ? 'var(--primary)' : 'var(--border)',
                    fontWeight: label === analysisStep ? '600' : '400',
                  }}>
                    {label}
                  </span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                This usually takes 15–30 seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
export default function DashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const pd = await api.getProjects(token);
      setProjects(pd.projects);
      const all = [];
      for (const p of pd.projects) {
        if (p.reviews) {
          all.push(...p.reviews.map(r => ({ ...r, project_name: p.name, project_id: p.id })));
        }
      }
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(all);
    } catch {} finally {
      setLoading(false);
    }
  }

  const totalProjects = projects.length;
  const totalReviews = reviews.length;
  const avg = reviews.filter(r => r.scores?.overall).length > 0
    ? Math.round(reviews.filter(r => r.scores?.overall).reduce((s, r) => s + r.scores.overall, 0) / reviews.filter(r => r.scores?.overall).length)
    : 0;

  const filtered = reviews.filter(r =>
    r.project_name.toLowerCase().includes(search.toLowerCase()) ||
    r.page_goal.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Review your UI
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Upload a screenshot and get actionable UI/UX feedback in seconds.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total Projects', value: totalProjects },
            { label: 'Total Reviews', value: totalReviews },
            { label: 'Avg Score', value: avg || '—' },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus size={14} /> New Review
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="input"
              style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>

        {/* Project list */}
        {loading ? (
          <div className="card" style={{ padding: '32px 0', textAlign: 'center' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--border)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FolderOpen size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {search ? 'No results found' : 'No projects yet'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
              {search ? `No reviews matching "${search}"` : 'Create your first UI review to get started.'}
            </p>
            {!search && (
              <button onClick={() => setShowNew(true)} className="btn-primary" style={{ fontSize: 12 }}>
                <Plus size={13} /> New Review
              </button>
            )}
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((r) => (
              <div
                key={r.id}
                className="card card-hover"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 7,
                  background: 'var(--hover)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FolderOpen size={15} style={{ color: 'var(--text-muted)' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                      {r.project_name}
                    </p>
                    <span className="badge badge-green" style={{ fontSize: 9, padding: '1px 6px' }}>
                      {r.status === 'completed' ? 'completed' : r.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</span>
                  </div>
                </div>

                {r.scores?.overall ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: getScoreColor(r.scores.overall),
                      background: getScoreBg(r.scores.overall),
                      padding: '2px 7px', borderRadius: 5,
                    }}>
                      {r.scores.overall}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--border)' }}>/100</span>
                  </div>
                ) : (
                  <div style={{ width: 36, flexShrink: 0 }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <Link to={`/review/${r.id}`} className="btn-icon" title="View" onClick={e => e.stopPropagation()}>
                    <Eye size={13} />
                  </Link>
                  <button
                    className="btn-icon"
                    title="Delete"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Delete this review?')) {
                        try { await api.deleteReview(r.id, token); loadData(); } catch {}
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight size={13} style={{ color: 'var(--border)', display: 'none' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewReviewModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
