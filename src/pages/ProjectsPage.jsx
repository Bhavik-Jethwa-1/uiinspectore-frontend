import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Image, Clock,
  X, Upload, Loader2, BarChart3, Trash2, ChevronRight, ChevronLeft,
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
  const fileRef = useRef();

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

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
      setStep(2);
    }
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
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>New Review</h2>
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
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '32px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Upload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Click or drag to upload</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, JPEG, WEBP (max 10MB)</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </div>
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
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Describe what the user is trying to accomplish on this page
                </p>
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

function ProjectCard({ project, onDelete, onNewReview }) {
  const totalReviews = project.reviews_count || 0;
  const completedReviews = project.reviews?.filter(r => r.status === 'completed').length || 0;

  return (
    <div className="card card-hover" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/projects/${project.id}`}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
          >
            {project.name}
          </Link>
          {project.description && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(project.id)}
          className="btn-icon"
          style={{ marginLeft: 8 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Image size={12} /> {totalReviews} reviews
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <BarChart3 size={12} /> {completedReviews} done
        </span>
      </div>

      <button
        onClick={() => onNewReview(project)}
        className="btn-secondary"
        style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
      >
        <Plus size={14} /> New Review
      </button>
    </div>
  );
}

export default function ProjectsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token) loadProjects();
  }, [token]);

  async function loadProjects(p = 1) {
    try {
      const data = await api.getProjects(token, { page: p, per_page: 10, search: search || undefined });
      setProjects(Array.isArray(data.projects) ? data.projects : (data.projects?.data ?? []));
      setTotal(data.total ?? 0);
      setPage(data.current_page ?? p);
      setLastPage(data.last_page ?? 1);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const data = await api.createProject({ name: newProjectName }, token);
      setProjects([data.project, ...projects]);
      setNewProjectName('');
      setShowNewProject(false);
      setPage(1);
    } catch {} finally {
      setCreatingProject(false);
    }
  }

  async function handleDeleteProject(id) {
    setDeleteTarget({ id });
  }

  const filteredProjects = projects;

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Projects</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{total} project{total !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNewProject(true)} className="btn-primary">
            <Plus size={15} /> New Project
          </button>
        </div>

        {projects.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search projects..."
              className="input"
              style={{ paddingLeft: 36, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        )}

        {/* New Project Modal */}
        {showNewProject && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowNewProject(false)}>
            <div className="modal-content animate-scale-in" style={{ maxWidth: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>New Project</h2>
                <button onClick={() => setShowNewProject(false)} className="btn-icon"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateProject} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="input"
                    placeholder="My Project"
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowNewProject(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" disabled={creatingProject} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {creatingProject ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FolderOpen size={36} style={{ color: 'var(--border)', margin: '0 auto 12px' }} />
            {search ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No projects matching "{search}"</p>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>No projects yet</p>
                <button onClick={() => setShowNewProject(true)} className="btn-primary">
                  <Plus size={15} style={{ display: 'inline', marginRight: 4 }} /> Create Project
                </button>
              </>
            )}
          </div>
        ) : (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onNewReview={setSelectedProject}
              />
            ))}
          </div>
          {lastPage > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Page {page} of {lastPage} &middot; {total} project{total !== 1 ? 's' : ''}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => loadProjects(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.875rem', fontSize: 12 }}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => loadProjects(page + 1)}
                  disabled={page >= lastPage}
                  className="btn-secondary"
                  style={{ padding: '0.35rem 0.875rem', fontSize: 12 }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      <NewReviewModal
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        onSuccess={(review) => navigate(`/review/${review.id}`)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Project"
          message="Are you sure you want to delete this project and all its reviews? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await api.deleteProject(deleteTarget.id, token);
              setDeleteTarget(null);
              setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
              loadProjects(page);
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
