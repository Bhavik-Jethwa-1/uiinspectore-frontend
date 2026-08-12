import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Clock,
  ChevronRight, X, Loader2, Upload, Trash2, Eye, Sparkles,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

// ---- New Review Modal ----
// project: null = create new project, { id, name } = use existing project
function NewReviewModal({ open, onClose, project }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const isForExistingProject = !!project;
  const [projectName, setProjectName] = useState('');
  const [persona, setPersona] = useState('first-time');
  const [goal, setGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(isForExistingProject ? 2 : 1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');

  // Initialize project name when project prop is provided
  useEffect(() => {
    if (project) {
      setProjectName(project.name || '');
    }
  }, [project]);

  useEffect(() => {
    if (!open) {
      setProjectName(''); setPersona('first-time'); setGoal('');
      setFile(null); setPreview(null); setStep(isForExistingProject ? 2 : 1); setError('');
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
    if (!goal.trim()) { setError('Please describe the page goal'); return; }
    if (!projectName.trim()) { setError('Project name is required'); return; }
    setError(''); setStep(3); setUploading(true);
    const steps = ['Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy',
      'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations'];
    let i = 0;
    const iv = setInterval(() => {
      setAnalysisStep(steps[Math.min(i, steps.length - 1)]);
      i++;
    }, 2000);
    try {
      let projectId;
      if (isForExistingProject) {
        // Use the existing project directly
        projectId = project.id;
      } else {
        // Look up or create project
        const projectsData = await api.getProjects(token);
        const existing = projectsData.projects.find(p => p.name.toLowerCase() === projectName.trim().toLowerCase());
        if (existing) { projectId = existing.id; }
        else { const newProj = await api.createProject({ name: projectName.trim() }, token); projectId = newProj.project.id; }
      }
      const rd = await api.createReview({ project_id: projectId, persona, page_goal: goal }, token);
      if (file) await api.uploadScreenshot(rd.review.id, file, token);
      const result = await api.analyzeReview(rd.review.id, token);
      clearInterval(iv);
      onClose();
      navigate(`/review/${result.review.id}`);
    } catch (err) {
      clearInterval(iv);
      setError(err.message); setStep(isForExistingProject ? 2 : 1); setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-scale-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {step === 3 ? 'Analyzing...' : isForExistingProject ? `New Review for ${project.name}` : 'New Review'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 1 }}>AI-powered UI analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={14} /></button>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)' }}>
              {error}
            </div>
          )}
          {step === 1 && (
            <>
              {!isForExistingProject && (
                <div>
                  <label className="label" style={{ marginBottom: 5 }}>Project name</label>
                  <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="input" placeholder="Enter project name" style={{ fontSize: 12 }} />
                </div>
              )}
              {isForExistingProject && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--hover)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Project: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{projectName}</span>
                </div>
              )}
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Reviewer persona</label>
                <select value={persona} onChange={e => setPersona(e.target.value)} className="select">
                  {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Page goal</label>
                <textarea value={goal} onChange={e => setGoal(e.target.value)} className="input" style={{ resize: 'none', minHeight: 56, fontSize: 12, lineHeight: 1.4 }} placeholder="What should a user be able to do on this page?" />
              </div>
              {preview ? (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={preview} alt="Screenshot preview" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block', background: 'var(--background)' }} />
                </div>
              ) : (
                <label className="block cursor-pointer rounded-lg text-center" style={{ border: '1.5px dashed var(--border)', background: 'var(--background)', padding: '14px 12px' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Upload size={13} style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Upload screenshot</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 2 }}>PNG, JPG, or WEBP · Optional</p>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
              <button onClick={() => setStep(2)} disabled={!goal.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '9px 16px', fontSize: 13 }}>Continue →</button>
            </>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {preview && (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={preview} alt="Screenshot preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', background: 'var(--background)' }} />
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
              {['Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy', 'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations'].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: label === analysisStep ? 'var(--success-light)' : 'var(--hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 8, color: label === analysisStep ? 'var(--success)' : 'var(--border)' }}>{label === analysisStep ? '●' : '✓'}</span>
                  </div>
                  <span style={{ fontSize: 12, color: label === analysisStep ? 'var(--primary)' : 'var(--border)', fontWeight: label === analysisStep ? '600' : '400' }}>{label}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>This usually takes 15–30 seconds</p>
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
  const [showNewForProject, setShowNewForProject] = useState(null); // { id, name } when opened from zero-review project
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const data = await api.getDashboard(token);
      setProjects(data.projects);
      setReviews(data.reviews);
    } catch {} finally {
      setLoading(false);
    }
  }

  const totalProjects = projects.length;
  const totalReviews = reviews.length;
  const avg = (() => {
    const scored = reviews.filter(r => r.scores?.overall);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((s, r) => s + r.scores.overall, 0) / scored.length);
  })();

  const filteredProjects = projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Review your UI</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Upload a screenshot and get actionable UI/UX feedback in seconds.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[{ label: 'Total Projects', value: totalProjects }, { label: 'Total Reviews', value: totalReviews }, { label: 'Avg Score', value: avg || '—' }].map(item => (
            <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{item.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={14} /> New Review</button>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="input" style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
        {loading ? (
          <div className="card" style={{ padding: '32px 0', textAlign: 'center' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--border)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card" style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FolderOpen size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{search ? 'No results found' : 'No projects yet'}</p>
            {!search && <button onClick={() => setShowNew(true)} className="btn-primary" style={{ fontSize: 12 }}><Plus size={13} /> New Review</button>}
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredProjects.map((p) => {
              const projectReviews = reviews.filter(r => r.project_id === p.id);
              const latestReview = projectReviews.length > 0 ? projectReviews.reduce((best, r) => r.id > best.id ? r : best, projectReviews[0]) : null;
              return (
                <div key={p.id} className="card card-hover" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                  onClick={() => { if (latestReview) { navigate(`/review/${latestReview.id}`); } else { setShowNewForProject({ id: p.id, name: p.name }); } }}>
                  <div style={{ width: 36, height: 36, borderRadius: 7, background: 'var(--hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FolderOpen size={15} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{p.name}</p>
                      <span className="badge badge-green" style={{ fontSize: 9, padding: '1px 6px' }}>{p.reviews_count > 0 ? `${p.reviews_count} review${p.reviews_count !== 1 ? 's' : ''}` : 'no reviews'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatDate(p.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <Link to={`/projects/${p.id}`} className="btn-icon" title="View" onClick={e => e.stopPropagation()}><Eye size={13} /></Link>
                    <button className="btn-icon" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: p.id, name: p.name, type: 'project' }); }}><Trash2 size={13} /></button>
                    <ChevronRight size={13} style={{ color: 'var(--border)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <NewReviewModal open={showNew} onClose={() => setShowNew(false)} project={null} />
      <NewReviewModal open={!!showNewForProject} onClose={() => setShowNewForProject(null)} project={showNewForProject} />
      {deleteTarget && (
        <ConfirmModal title={deleteTarget.type === 'project' ? 'Delete Project' : 'Delete Review'}
          message={deleteTarget.type === 'project' ? `Are you sure you want to delete the project "${deleteTarget.name}" and all its reviews? This cannot be undone.` : `Are you sure you want to delete the review for "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete" variant="danger" loading={deleting}
          onConfirm={async () => { setDeleting(true); try { if (deleteTarget.type === 'project') { await api.deleteProject(deleteTarget.id, token); } else { await api.deleteReview(deleteTarget.id, token); } setDeleteTarget(null); loadData(); } catch { setDeleteTarget(null); } finally { setDeleting(false); } }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
