import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Plus, Search, FolderOpen, Clock,
  ChevronRight, ChevronLeft, X, Loader2, Upload, Trash2, Eye, Sparkles,
  BarChart3, Image as ImageIcon, CheckCircle2, HelpCircle, ChevronDown,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

// ---- New Review Modal ----
// project: null = create new project, { id, name } = use existing project
function NewReviewModal({ open, onClose, project }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const isForExistingProject = !!project;
  const [projectName, setProjectName] = useState('');
  const [persona, setPersona] = useState('first_time');
  const [goal, setGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(isForExistingProject ? 2 : 1);
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});  // { fieldName: message }
  const [analysisStep, setAnalysisStep] = useState('');
  const [showTips, setShowTips] = useState(false);

  // Helper to set a field error
  const setFieldError = (field, msg) => setFieldErrors(prev => ({ ...prev, [field]: msg }));
  // Helper to clear a field error on change
  const clearFieldError = (field) => setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  useEffect(() => {
    if (project) setProjectName(project.name || '');
  }, [project]);

  useEffect(() => {
    if (!open) {
      setProjectName(''); setPersona('first_time'); setGoal('');
      setFile(null); setPreview(null); setStep(isForExistingProject ? 2 : 1);
      setGlobalError(''); setFieldErrors({});
      setShowTips(false);
    }
  }, [open]);

  // User-friendly personas - no technical jargon
  const PERSONAS = [
    { value: 'first_time', label: 'First-time user', desc: 'New to your interface' },
    { value: 'regular', label: 'Regular user', desc: 'Familiar with similar interfaces' },
    { value: 'experienced', label: 'Experienced user', desc: 'Power user with technical knowledge' },
    { value: 'designer', label: 'Designer', desc: 'Focuses on visual and UX details' },
    { value: 'accessibility', label: 'Accessibility-focused', desc: 'Prioritizes usability for all abilities' },
  ];

  // Page goal examples by page type
  const GOAL_EXAMPLES = [
    { label: 'Select a page type...', value: '' },
    { label: 'Login / Sign in page', value: 'User should be able to log in with email and password, or reset a forgotten password.' },
    { label: 'Sign up / Registration', value: 'User should be able to create a new account by entering their name, email, and password.' },
    { label: 'Landing page', value: 'User should be able to understand what the product does and sign up for a free trial or demo.' },
    { label: 'Dashboard / App screen', value: 'User should be able to quickly find key information and navigate to different sections of the app.' },
    { label: 'Settings page', value: 'User should be able to update their account preferences, notification settings, and profile information.' },
    { label: 'Form page', value: 'User should be able to fill out and submit the form successfully without confusion.' },
    { label: 'Product / Pricing page', value: 'User should be able to understand pricing plans and select the best option for their needs.' },
  ];

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setFieldError('screenshot', 'File is too large. Maximum size is 10MB.');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setFieldError('screenshot', 'Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }
    setFile(f);
    clearFieldError('screenshot');
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.onerror = () => {
      setFieldError('screenshot', 'Failed to read the image file. Please try another.');
      setFile(null);
      setPreview(null);
    };
    reader.readAsDataURL(f);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    clearFieldError('screenshot');
  };

  const handleGoalExample = (e) => {
    const val = e.target.value;
    if (val) { setGoal(val); clearFieldError('goal'); }
  };

  const handleSubmit = async () => {
    if (!goal.trim())     { setFieldError('goal', 'Please describe the page goal — what should a user be able to do?'); return; }
    if (!projectName.trim()) { setFieldError('project_name', 'Project name is required.'); return; }
    setFieldErrors({}); setGlobalError(''); setStep(3); setUploading(true);
    const steps = [
      { text: 'Uploading screenshot', sub: 'Securely uploading your image...' },
      { text: 'Understanding page structure', sub: 'Analyzing the layout and elements...' },
      { text: 'Checking visual hierarchy', sub: 'Evaluating importance and flow...' },
      { text: 'Analyzing accessibility', sub: 'Checking contrast and usability...' },
      { text: 'Finding UX issues', sub: 'Identifying areas for improvement...' },
      { text: 'Generating recommendations', sub: 'Creating actionable suggestions...' },
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length) {
        setAnalysisStep(steps[i].text);
        i++;
      }
    }, 2200);
    try {
      let projectId;
      if (isForExistingProject) {
        projectId = project.id;
      } else {
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
      // Parse Laravel validation field errors (422 with errors object)
      const ferrs = err.fieldErrors || {};
      const hasFieldErrors = Object.keys(ferrs).length > 0;
      if (hasFieldErrors) {
        const mapped = {};
        if (ferrs.project_id)  mapped.project_name = Array.isArray(ferrs.project_id) ? ferrs.project_id[0] : ferrs.project_id;
        if (ferrs.persona)     mapped.persona     = Array.isArray(ferrs.persona) ? ferrs.persona[0] : ferrs.persona;
        if (ferrs.page_goal)   mapped.goal         = Array.isArray(ferrs.page_goal) ? ferrs.page_goal[0] : ferrs.page_goal;
        if (ferrs.image)       mapped.screenshot   = Array.isArray(ferrs.image) ? ferrs.image[0] : ferrs.image;
        setFieldErrors(mapped);
        setGlobalError('');
      } else {
        setFieldErrors({});
        setGlobalError(err.message || 'Something went wrong. Please try again.');
      }
      setStep(isForExistingProject ? 2 : 1);
      setUploading(false);
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
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {step === 3 ? 'Analyzing your UI...' : isForExistingProject ? `New Review — ${project.name}` : 'New UI Review'}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 1 }}>
                {step === 3 ? 'This takes just a few seconds' : 'Upload a screenshot to get AI-powered feedback'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close"><X size={14} /></button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {globalError && (
            <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)' }}>
              {globalError}
            </div>
          )}

          {/* ── Step 1: Configure review ── */}
          {step === 1 && (
            <>
              {/* Project name */}
              {!isForExistingProject && (
                <div>
                  <label className="label" style={{ marginBottom: 5 }}>Project name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => { setProjectName(e.target.value); clearFieldError('project_name'); }}
                    className="input"
                    placeholder="e.g., Login page, Landing page, Settings"
                    style={{ fontSize: 12 }}
                  />
                  {fieldErrors.project_name && (
                    <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.project_name}</p>
                  )}
                </div>
              )}
              {isForExistingProject && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--hover)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Project: </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{projectName}</span>
                </div>
              )}

              {/* Persona */}
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Who will use this?</label>
                <select
                  value={persona}
                  onChange={e => { setPersona(e.target.value); clearFieldError('persona'); }}
                  className="select"
                >
                  {PERSONAS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {fieldErrors.persona && (
                  <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.persona}</p>
                )}
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {PERSONAS.find(p => p.value === persona)?.desc || 'Choose who will use this interface.'}
                </p>
              </div>

              {/* Page goal */}
              <div>
                <label className="label" style={{ marginBottom: 5 }}>Page goal</label>
                <textarea
                  value={goal}
                  onChange={e => { setGoal(e.target.value); clearFieldError('goal'); }}
                  className="input"
                  style={{ resize: 'none', minHeight: 64, fontSize: 12, lineHeight: 1.5 }}
                  placeholder="What should a user be able to do on this page?"
                />
                {fieldErrors.goal && (
                  <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.goal}</p>
                )}
                {/* Example goals dropdown */}
                <select
                  onChange={handleGoalExample}
                  className="select"
                  style={{ marginTop: 6, fontSize: 11, height: 34 }}
                >
                  {GOAL_EXAMPLES.map(ex => (
                    <option key={ex.label} value={ex.value}>{ex.label}</option>
                  ))}
                </select>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Describe what the user should accomplish — not what the page looks like.
                </p>
              </div>

              {/* Upload area */}
              {preview ? (
                <div>
                  <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <img
                      src={preview}
                      alt="Screenshot preview"
                      style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block', background: 'var(--background)' }}
                    />
                    <button
                      onClick={handleRemoveFile}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                      aria-label="Remove screenshot"
                    >
                      <X size={12} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 8px' }}>
                      <span style={{ fontSize: 9, color: '#fff' }}>{file?.name}</span>
                      {file?.size && (
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      )}
                    </div>
                  </div>
                  {fieldErrors.screenshot && (
                    <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.screenshot}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label
                    className="block cursor-pointer rounded-lg text-center"
                    style={{ border: '2px dashed var(--border)', background: 'var(--background)', padding: '22px 12px', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Upload size={17} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Upload Screenshot</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Drag & drop your screenshot here</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>PNG, JPG, WEBP · Max 10MB</p>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="hidden" />
                  </label>
                  {fieldErrors.screenshot && (
                    <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.screenshot}</p>
                  )}
                </div>
              )}

              {/* Screenshot tips toggle */}
              <button
                onClick={() => setShowTips(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--text-muted)', padding: 0, textAlign: 'left',
                }}
              >
                <HelpCircle size={12} />
                {showTips ? 'Hide tips' : 'Screenshot tips for best results'}
                <ChevronDown size={11} style={{ transform: showTips ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              {showTips && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid var(--primary)20' }}>
                  <ul style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>Use full-page screenshots (not just a portion)</li>
                    <li>Make sure text is clearly readable in the image</li>
                    <li>Include the full viewport for accurate analysis</li>
                    <li>Real screenshots work better than mockups or designs</li>
                  </ul>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!goal.trim()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Step 2: Confirm & Start ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {preview && (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', background: 'var(--background)' }}
                  />
                  <button
                    onClick={handleRemoveFile}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                    aria-label="Replace screenshot"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Review summary */}
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {goal && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 64, paddingTop: 2 }}>Page goal</span>
                    <span style={{ fontSize: 11, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{goal}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 64 }}>Persona</span>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{PERSONAS.find(p => p.value === persona)?.label || persona}</span>
                </div>
                {projectName && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 64 }}>Project</span>
                    <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{projectName}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                  Edit details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="btn-primary"
                  style={{ flex: 2, justifyContent: 'center', fontSize: 13, fontWeight: 700 }}
                >
                  {uploading ? <><Loader2 size={13} className="animate-spin" /> Analyzing...</> : <><Sparkles size={13} /> Start Review</>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Analyzing ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Sparkles size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Analyzing your UI...
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  This usually takes a few seconds
                </p>
              </div>

              {['Uploading screenshot', 'Reading interface elements', 'Analyzing visual hierarchy', 'Checking accessibility', 'Reviewing usability', 'Preparing recommendations'].map((label, idx) => {
                const allSteps = ['Uploading screenshot', 'Reading interface elements', 'Analyzing visual hierarchy', 'Checking accessibility', 'Reviewing usability', 'Preparing recommendations'];
                const currentIdx = allSteps.indexOf(analysisStep);
                const isCompleted = currentIdx > idx;
                const isCurrent = label === analysisStep;
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: isCompleted ? 'var(--success-light)' : isCurrent ? 'var(--primary-light)' : 'var(--hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isCurrent ? '2px solid var(--primary)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {isCompleted ? (
                        <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                      ) : isCurrent ? (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite' }} />
                      ) : (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border)' }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}>
                      {label}
                    </span>
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

// ---- First-time user guide component ----
function HowItWorksGuide({ onDismiss }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('dashboard_guide_dismissed') === 'true'; } catch { return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('dashboard_guide_dismissed', 'true'); } catch {}
    if (onDismiss) onDismiss();
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: 12,
      background: 'var(--primary-light)',
      border: '1px solid var(--primary)20',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>How it works</span>
        </div>
        <button onClick={handleDismiss} className="btn-icon" style={{ width: 22, height: 22 }} aria-label="Dismiss guide">
          <X size={12} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { num: '1', title: 'Upload a screenshot', desc: 'Take a screenshot of any page — login, dashboard, settings, landing page, anything.' },
          { num: '2', title: 'AI reviews your interface', desc: 'Our AI analyzes visual hierarchy, readability, accessibility, and more.' },
          { num: '3', title: 'Explore your results', desc: 'See your score, annotated issues, and prioritized suggestions.' },
          { num: '4', title: 'Fix and improve', desc: 'Each suggestion includes a "How to fix" section with actionable steps.' },
        ].map(({ num, title, desc }) => (
          <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
            }}>
              {num}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>{title}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{desc}</p>
            </div>
          </div>
        ))}
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
  const [showNewForProject, setShowNewForProject] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsLastPage, setProjectsLastPage] = useState(1);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLastPage, setReviewsLastPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);

  useEffect(() => {
    if (!token) return;
    loadData(1, 1);
  }, [token]);

  async function loadData(pPage = 1, rPage = 1) {
    try {
      const data = await api.getDashboard(token, {
        projects_page: pPage,
        reviews_page: rPage,
        projects_per_page: 10,
        reviews_per_page: 10,
      });
      setProjects(Array.isArray(data.projects) ? data.projects : (data.projects?.data ?? []));
      setProjectsTotal(data.projects_meta?.total ?? 0);
      setProjectsPage(data.projects_meta?.current_page ?? 1);
      setProjectsLastPage(data.projects_meta?.last_page ?? 1);
      setReviews(Array.isArray(data.reviews) ? data.reviews : (data.reviews?.data ?? []));
      setReviewsTotal(data.reviews_meta?.total ?? 0);
      setReviewsPage(data.reviews_meta?.current_page ?? 1);
      setReviewsLastPage(data.reviews_meta?.last_page ?? 1);
    } catch {} finally {
      setLoading(false);
    }
  }

  const totalProjects = projectsTotal;
  const totalReviews = reviewsTotal;
  const avg = (() => {
    const scored = reviews.filter(r => r.scores?.overall);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((s, r) => s + r.scores.overall, 0) / scored.length);
  })();

  const filteredProjects = search
    ? projects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get contextual label for avg score
  const getAvgScoreContext = (avgScore) => {
    if (avgScore === null) return { label: 'No scores yet', sub: 'Complete a review to see your average' };
    if (avgScore >= 85) return { label: 'Excellent', sub: 'Your UI is well-designed' };
    if (avgScore >= 70) return { label: 'Good', sub: 'Room for improvement' };
    if (avgScore >= 50) return { label: 'Needs work', sub: 'Focus on key findings below' };
    return { label: 'Poor', sub: 'Address issues for better UX' };
  };

  const scoreContext = getAvgScoreContext(avg);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Review your UI</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Upload a screenshot and get actionable UI/UX feedback in seconds.</p>
        </div>

        {/* First-time user guide — only show when no projects */}
        {!loading && projectsTotal === 0 && <HowItWorksGuide />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <FolderOpen size={13} style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Projects</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{totalProjects}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>All your UI projects</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Reviews</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{totalReviews}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI reviews completed</p>
          </div>
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <BarChart3 size={13} style={{ color: avg ? getScoreColor(avg) : 'var(--text-muted)' }} />
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Score</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: avg ? getScoreColor(avg) : 'var(--text-muted)', lineHeight: 1, marginBottom: 4 }}>{avg !== null ? avg : '—'}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{scoreContext.sub}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={14} /> New Review</button>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setProjectsPage(1); }} placeholder="Search projects..." className="input" style={{ paddingLeft: 32, borderRadius: 'var(--radius-sm)' }} />
          </div>
        </div>
        {loading ? (
          <div className="card" style={{ padding: '32px 0', textAlign: 'center' }}>
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--border)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Sparkles size={22} style={{ color: 'var(--primary)' }} />
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
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, maxWidth: 280, margin: '0 auto 16px' }}>Create your first UI review project and get AI-powered UX feedback.</p>
                <button onClick={() => setShowNew(true)} className="btn-primary" style={{ fontSize: 13 }}><Plus size={14} /> Create Project</button>
              </>
            )}
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredProjects.map((p) => {
              const projectReviews = reviews.filter(r => r.project_id === p.id);
              const latestReview = projectReviews.length > 0 ? projectReviews.reduce((best, r) => r.id > best.id ? r : best, projectReviews[0]) : null;
              const latestScore = latestReview?.scores?.overall;
              return (
                <div key={p.id} className="card card-hover" style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => { if (latestReview) { navigate(`/review/${latestReview.id}`); } else { setShowNewForProject({ id: p.id, name: p.name }); } }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FolderOpen size={17} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{p.name}</p>
                      {p.reviews_count > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: latestScore ? (latestScore >= 80 ? 'var(--success-light)' : latestScore >= 60 ? 'var(--warning-light)' : 'var(--error-light)') : 'var(--hover)', color: latestScore ? (latestScore >= 80 ? 'var(--success)' : latestScore >= 60 ? 'var(--warning)' : 'var(--error)') : 'var(--text-muted)', fontWeight: 600 }}>
                          {latestScore ? `${latestScore}/100` : `${p.reviews_count} review${p.reviews_count !== 1 ? 's' : ''}`}
                        </span>
                      )}
                      {p.reviews_count === 0 && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--hover)', color: 'var(--text-muted)', fontWeight: 600 }}>
                          New
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> Last reviewed {formatDate(p.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <button 
                      className="btn-icon" 
                      aria-label="View project details"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p.id}`); }}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="btn-icon" 
                      aria-label="Delete project"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: p.id, name: p.name, type: 'project' }); }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} style={{ color: 'var(--border)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && !search && projectsLastPage > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Page {projectsPage} of {projectsLastPage} &middot; {projectsTotal} project{projectsTotal !== 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { const p = Math.max(1, projectsPage - 1); setProjectsPage(p); loadData(p, reviewsPage); }}
                disabled={projectsPage <= 1}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => { const p = Math.min(projectsLastPage, projectsPage + 1); setProjectsPage(p); loadData(p, reviewsPage); }}
                disabled={projectsPage >= projectsLastPage}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: 11 }}
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
      <NewReviewModal open={showNew} onClose={() => setShowNew(false)} project={null} />
      <NewReviewModal open={!!showNewForProject} onClose={() => setShowNewForProject(null)} project={showNewForProject} />
      {deleteTarget && (
        <ConfirmModal title={deleteTarget.type === 'project' ? 'Delete Project' : 'Delete Review'}
          message={deleteTarget.type === 'project' ? `Are you sure you want to delete the project "${deleteTarget.name}" and all its reviews? This cannot be undone.` : `Are you sure you want to delete the review for "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete" variant="danger" loading={deleting}
          onConfirm={async () => { setDeleting(true); try { if (deleteTarget.type === 'project') { await api.deleteProject(deleteTarget.id, token); } else { await api.deleteReview(deleteTarget.id, token); } setDeleteTarget(null); loadData(projectsPage, reviewsPage); } catch { setDeleteTarget(null); } finally { setDeleting(false); } }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
