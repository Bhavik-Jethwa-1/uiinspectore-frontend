import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Image, Clock,
  X, Upload, Loader2, BarChart3, Trash2, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, AlertCircle,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PERSONAS = [
  { value: 'first_time', label: 'First-time user' },
  { value: 'regular', label: 'Regular user' },
  { value: 'experienced', label: 'Experienced user' },
  { value: 'designer', label: 'Designer' },
  { value: 'accessibility', label: 'Accessibility-focused' },
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
    // Validate file size (10MB max)
    if (f.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    // Validate file type
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.onerror = () => {
      setError('Failed to read the image file. Please try another.');
      setFile(null);
      setPreview(null);
    };
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
      const steps = [
        { text: 'Uploading screenshot', sub: 'Securely uploading your image...' },
        { text: 'Understanding page structure', sub: 'Analyzing the layout and elements...' },
        { text: 'Checking visual hierarchy', sub: 'Evaluating importance and flow...' },
        { text: 'Analyzing accessibility', sub: 'Checking contrast and usability...' },
        { text: 'Finding UX issues', sub: 'Identifying areas for improvement...' },
        { text: 'Generating recommendations', sub: 'Creating actionable suggestions...' },
      ];
      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setAnalysisStep(steps[stepIdx].text);
          stepIdx++;
        }
      }, 2200);
      await api.analyzeReview(reviewData.review.id, token);
      clearInterval(interval);
      onSuccess(reviewData.review);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(2);
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
                style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s', background: 'var(--background)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Upload size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Upload Screenshot</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Drag & drop your screenshot here</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, WEBP · Max 10MB</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
          )}

          {step === 2 && preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={preview} alt="Preview" className="w-full rounded-lg max-h-48 object-contain" style={{ background: 'var(--background)', display: 'block' }} />
                <button
                  onClick={() => { setFile(null); setPreview(null); setStep(1); setError(''); }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
                <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 6px' }}>
                  <span style={{ fontSize: 9, color: '#fff' }}>{file?.name}</span>
                </div>
              </div>

              <div>
                <label className="label">Reviewer Persona</label>
                <select value={persona} onChange={(e) => setPersona(e.target.value)} className="select">
                  {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Choose the type of person you want the AI to evaluate this interface for.
                </p>
              </div>

              <div>
                <label className="label">Page Goal</label>
                <textarea
                  value={pageGoal}
                  onChange={(e) => setPageGoal(e.target.value)}
                  className="textarea"
                  placeholder="What should a user be able to do on this page? Example: User should be able to log in with email and password"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Sparkles size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Analyzing your UI...</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>This usually takes a few seconds</p>
              </div>
              {['Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy', 'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations'].map((label, idx) => {
                const allSteps = ['Uploading screenshot', 'Understanding page structure', 'Checking visual hierarchy', 'Analyzing accessibility', 'Finding UX issues', 'Generating recommendations'];
                const currentIdx = allSteps.indexOf(analysisStep);
                const isCompleted = currentIdx > idx;
                const isCurrent = label === analysisStep;
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: isCompleted ? 'var(--success-light)' : isCurrent ? 'var(--primary-light)' : 'var(--hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCurrent ? '2px solid var(--primary)' : 'none' }}>
                      {isCompleted ? (
                        <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                      ) : isCurrent ? (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite' }} />
                      ) : (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isCurrent ? '600' : '400' }}>{label}</span>
                  </div>
                );
              })}
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
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <FolderOpen size={24} style={{ color: 'var(--primary)' }} />
            </div>
            {search ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No results found</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Try a different search term</p>
                <button onClick={() => setSearch('')} className="btn-secondary" style={{ fontSize: 12 }}>Clear Search</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No projects yet</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 280, margin: '0 auto 16px' }}>Projects help you organize reviews of different pages.</p>
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
