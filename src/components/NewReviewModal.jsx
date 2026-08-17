import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  Sparkles, X, Upload, HelpCircle, ChevronDown, Loader2, CheckCircle2,
} from 'lucide-react';

// Shared NewReviewModal — used by DashboardPage and ProjectDetailPage
// Props:
//   open: boolean
//   onClose: () => void
//   project: object | null  (if provided, skips project creation step)
export default function NewReviewModal({ open, onClose, project }) {
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [analysisStep, setAnalysisStep] = useState('');
  const [showTips, setShowTips] = useState(false);

  const setFieldError = (field, msg) => setFieldErrors(prev => ({ ...prev, [field]: msg }));
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

  // User-friendly personas
  const PERSONAS = [
    { value: 'first_time',    label: 'First-time user',         desc: 'New to your interface' },
    { value: 'regular',      label: 'Regular user',            desc: 'Familiar with similar interfaces' },
    { value: 'experienced',  label: 'Experienced user',        desc: 'Power user with technical knowledge' },
    { value: 'designer',     label: 'Designer',                desc: 'Focuses on visual and UX details' },
    { value: 'accessibility', label: 'Accessibility-focused',  desc: 'Prioritizes usability for all abilities' },
  ];

  // Goal examples
  const GOAL_EXAMPLES = [
    { label: 'Select a page type...', value: '' },
    { label: 'Login / Sign in page',       value: 'User should be able to log in with email and password, or reset a forgotten password.' },
    { label: 'Sign up / Registration',     value: 'User should be able to create a new account by entering their name, email, and password.' },
    { label: 'Landing page',               value: 'User should be able to understand what the product does and sign up for a free trial or demo.' },
    { label: 'Dashboard / App screen',    value: 'User should be able to quickly find key information and navigate to different sections of the app.' },
    { label: 'Settings page',              value: 'User should be able to update their account preferences, notification settings, and profile information.' },
    { label: 'Form page',                 value: 'User should be able to fill out and submit the form successfully without confusion.' },
    { label: 'Product / Pricing page',    value: 'User should be able to understand pricing plans and select the best option for their needs.' },
  ];

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setFieldError('screenshot', 'File is too large. Maximum size is 10MB.'); return; }
    if (!f.type.startsWith('image/')) { setFieldError('screenshot', 'Please upload a valid image file (PNG, JPG, or WEBP).'); return; }
    setFile(f);
    clearFieldError('screenshot');
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.onerror = () => {
      setFieldError('screenshot', 'Failed to read the image file. Please try another.');
      setFile(null); setPreview(null);
    };
    reader.readAsDataURL(f);
  };

  const handleRemoveFile = () => { setFile(null); setPreview(null); clearFieldError('screenshot'); };

  const handleGoalExample = (e) => {
    const val = e.target.value;
    if (val) { setGoal(val); clearFieldError('goal'); }
  };

  const ANALYSIS_STEPS = [
    { text: 'Uploading screenshot',          sub: 'Securely uploading your image...' },
    { text: 'Understanding page structure',   sub: 'Analyzing the layout and elements...' },
    { text: 'Checking visual hierarchy',      sub: 'Evaluating importance and flow...' },
    { text: 'Analyzing accessibility',        sub: 'Checking contrast and usability...' },
    { text: 'Finding UX issues',             sub: 'Identifying areas for improvement...' },
    { text: 'Generating recommendations',     sub: 'Creating actionable suggestions...' },
  ];

  const handleSubmit = async () => {
    if (!goal.trim())     { setFieldError('goal', 'Please describe the page goal — what should a user be able to do?'); return; }
    if (!isForExistingProject && !projectName.trim()) { setFieldError('project_name', 'Project name is required.'); return; }
    setFieldErrors({}); setGlobalError(''); setStep(3); setUploading(true);
    let stepIdx = 0;
    setAnalysisStep(ANALYSIS_STEPS[0].text);
    const iv = setInterval(() => {
      if (stepIdx < ANALYSIS_STEPS.length) {
        setAnalysisStep(ANALYSIS_STEPS[stepIdx].text);
        stepIdx++;
      }
    }, 2200);
    try {
      let projectId;
      if (isForExistingProject) {
        projectId = project.id;
      } else {
        const projectsData = await api.getProjects(token);
        const existing = projectsData.projects.find(
          p => p.name.toLowerCase() === projectName.trim().toLowerCase()
        );
        if (existing) { projectId = existing.id; }
        else {
          const newProj = await api.createProject({ name: projectName.trim() }, token);
          projectId = newProj.project.id;
        }
      }
      const rd = await api.createReview({ project_id: projectId, persona, page_goal: goal }, token);
      if (file) await api.uploadScreenshot(rd.review.id, file, token);
      const result = await api.analyzeReview(rd.review.id, token);
      clearInterval(iv);
      onClose();
      navigate(`/review/${result.review.id}`);
    } catch (err) {
      clearInterval(iv);
      const ferrs = err.fieldErrors || {};
      if (Object.keys(ferrs).length > 0) {
        const mapped = {};
        if (ferrs.project_id)  mapped.project_name = Array.isArray(ferrs.project_id) ? ferrs.project_id[0] : ferrs.project_id;
        if (ferrs.persona)     mapped.persona      = Array.isArray(ferrs.persona)      ? ferrs.persona[0]      : ferrs.persona;
        if (ferrs.page_goal)    mapped.goal          = Array.isArray(ferrs.page_goal)     ? ferrs.page_goal[0]    : ferrs.page_goal;
        if (ferrs.image)       mapped.screenshot    = Array.isArray(ferrs.image)         ? ferrs.image[0]        : ferrs.image;
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {step === 3 ? 'Analyzing your UI...' : isForExistingProject ? `New Review — ${project?.name}` : 'New UI Review'}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 1 }}>
                {step === 3 ? 'This takes just a few seconds' : 'Upload a screenshot to get AI-powered feedback'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close"><X size={14} /></button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Global error */}
          {globalError && (
            <div style={{ padding: '8px 10px', borderRadius: 6, fontSize: 12, background: 'var(--error-light)', color: 'var(--error)' }}>
              {globalError}
            </div>
          )}

          {/* ── Step 1: Configure ── */}
          {step === 1 && (
            <>
              {/* Project name — only when creating new project */}
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

              {/* Existing project — show a preview card */}
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
                  {PERSONAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {fieldErrors.persona && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.persona}</p>}
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
                {fieldErrors.goal && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.goal}</p>}
                {/* Goal examples */}
                <select
                  onChange={handleGoalExample}
                  className="select"
                  style={{ marginTop: 6, fontSize: 11, height: 34 }}
                >
                  {GOAL_EXAMPLES.map(ex => <option key={ex.label} value={ex.value}>{ex.label}</option>)}
                </select>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Describe what the user should accomplish — not what the page looks like.
                </p>
              </div>

              {/* Screenshot upload */}
              {preview ? (
                <div>
                  <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <img src={preview} alt="Screenshot preview" style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block', background: 'var(--background)' }} />
                    <button
                      onClick={handleRemoveFile}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                      aria-label="Remove screenshot"
                    >
                      <X size={12} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 8px' }}>
                      <span style={{ fontSize: 9, color: '#fff' }}>{file?.name}</span>
                      {file?.size && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>({(file.size / 1024 / 1024).toFixed(1)}MB)</span>}
                    </div>
                  </div>
                  {fieldErrors.screenshot && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.screenshot}</p>}
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
                  {fieldErrors.screenshot && <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 4 }}>{fieldErrors.screenshot}</p>}
                </div>
              )}

              {/* Tips toggle */}
              <button
                onClick={() => setShowTips(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: 0, textAlign: 'left' }}
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

          {/* ── Step 2: Confirm ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {preview && (
                <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={preview} alt="Screenshot preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', background: 'var(--background)' }} />
                  <button onClick={handleRemoveFile} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} aria-label="Replace screenshot">
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
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Analyzing your UI...</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This usually takes a few seconds</p>
              </div>

              {ANALYSIS_STEPS.map((stepItem, idx) => {
                const currentIdx = ANALYSIS_STEPS.findIndex(s => s.text === analysisStep);
                const isCompleted = currentIdx > idx;
                const isCurrent   = stepItem.text === analysisStep;
                return (
                  <div key={stepItem.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                      {stepItem.text}
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
