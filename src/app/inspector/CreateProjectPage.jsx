import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Loader2, ArrowLeft, Image, CheckCircle2,
  ChevronRight, Sparkles
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { ACCENT } from './constants/theme';

// ─── Persona Select ─────────────────────────────────────────────────────────
const PERSONAS = [
  { value: 'first_time', label: 'First-time User', desc: 'Focus on onboarding & clarity', color: '#8b5cf6' },
  { value: 'non_technical', label: 'Non-technical', desc: 'Plain language, intuitive navigation', color: '#06b6d4' },
  { value: 'junior_dev', label: 'Junior Developer', desc: 'Code hints, standard patterns', color: '#10b981' },
  { value: 'devops', label: 'DevOps Engineer', desc: 'Technical clarity, efficiency', color: '#f59e0b' },
  { value: 'designer', label: 'Product Designer', desc: 'Design system, visual hierarchy', color: '#ec4899' },
];

function PersonaCard({ persona, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(persona.value)}
      className="flex items-start gap-3 p-4 rounded-2xl border text-left transition-all w-full"
      style={{
        borderColor: selected ? persona.color : 'var(--border)',
        background: selected ? `${persona.color}10` : 'var(--surface)',
        borderWidth: selected ? 1.5 : 1,
      }}
    >
      <div className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5"
        style={{ borderColor: selected ? persona.color : 'var(--text-muted)', background: selected ? persona.color : 'transparent' }} />
      <div>
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: selected ? persona.color : 'var(--text)' }}>{persona.label}</p>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{persona.desc}</p>
      </div>
    </button>
  );
}

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[...Array(total)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
            style={{
              background: i < current ? ACCENT : i === current ? `${ACCENT}30` : 'var(--surface2)',
              color: i <= current ? '#fff' : 'var(--text-muted)',
            }}>
            {i < current ? <CheckCircle2 size={12} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className="w-8 h-px" style={{ background: i < current ? ACCENT : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ onFile, preview, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  }, [onFile]);

  // Paste support
  useEffect(() => {
    const onPaste = (e) => {
      const item = [...e.clipboardData?.items || []].find(i => i.type.startsWith('image/'));
      if (item) {
        const file = item.getAsFile();
        if (file) onFile(file);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onFile]);

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
        <button onClick={() => onFile(null)}
          className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <X size={14} className="text-white" />
        </button>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
      style={{ borderColor: dragging ? ACCENT : 'var(--border)', background: dragging ? `${ACCENT}05` : 'transparent' }}
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors"
        style={{ background: dragging ? `${ACCENT}20` : 'var(--surface2)' }}>
        <Upload size={24} style={{ color: dragging ? ACCENT : 'var(--text-muted)' }} />
      </div>

      <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {dragging ? 'Drop your screenshot' : 'Upload your UI screenshot'}
      </p>
      <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
        Drag & drop, click to browse, or paste from clipboard
      </p>
      <div className="flex items-center justify-center gap-2">
        {['PNG', 'JPG', 'WEBP'].map(fmt => (
          <span key={fmt} className="px-2 py-1 rounded-md text-[10px] font-medium"
            style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>{fmt}</span>
        ))}
      </div>
      <p className="text-[11px] mt-3" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
        Max 10MB — For best results, use a full-page screenshot
      </p>
    </div>
  );
}

// ─── Main Create Project Page ────────────────────────────────────────────────
export default function InspectorCreateProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=upload, 1=persona, 2=goal
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('first_time');
  const [pageGoal, setPageGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFile = useCallback((f) => {
    if (!f) { setFile(null); setPreview(null); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return; }
    const valid = ['image/png', 'image/jpeg', 'image/webp'];
    if (!valid.includes(f.type)) { setError('Only PNG, JPG, or WEBP supported'); return; }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter a project name'); return; }
    if (!file) { setError('Please upload a screenshot'); return; }
    setSubmitting(true);
    try {
      const proj = await inspectorApi.createProject({ name: name.trim() });
      const formData = new FormData();
      formData.append('screenshot', file);
      if (persona) formData.append('persona', persona);
      if (pageGoal.trim()) formData.append('page_goal', pageGoal.trim());
      const uploadResult = await inspectorApi.uploadScreenshot(proj.project.id, formData);
      const screenshotId = uploadResult?.screenshot?.id;
      // Generate review immediately
      await inspectorApi.generateReview(proj.project.id, {
        screenshot_id: screenshotId,
        persona,
        page_goal: pageGoal.trim() || null,
      });
      navigate(`/inspector/projects/${proj.project.id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const canProceed = file && name.trim();

  return (
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={() => navigate('/inspector/projects')}
          className="flex items-center gap-1.5 text-[12px] mb-8 transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={13} /> Back to Projects
        </button>

        <StepIndicator current={step} total={3} />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                Upload your UI screenshot
              </h2>
              <p className="text-[14px] mb-6" style={{ color: 'var(--text-muted)' }}>
                Show the interface you want to review
              </p>

              <UploadZone onFile={handleFile} preview={preview} uploading={submitting} />

              {error && (
                <p className="text-[12px] text-red-400 mt-3">{error}</p>
              )}

              {/* Project name */}
              {file && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                  <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>
                    Project name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Checkout Flow Redesign"
                    className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = ACCENT}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </motion.div>
              )}

              {file && name.trim() && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="persona" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                Who will use this?
              </h2>
              <p className="text-[14px] mb-6" style={{ color: 'var(--text-muted)' }}>
                Select a persona to tailor the review perspective
              </p>

              <div className="space-y-2">
                {PERSONAS.map(p => (
                  <PersonaCard key={p.value} persona={p} selected={persona === p.value} onSelect={setPersona} />
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)}
                  className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Back
                </button>
                <button onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: ACCENT }}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-[22px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                What's the page goal?
              </h2>
              <p className="text-[14px] mb-6" style={{ color: 'var(--text-muted)' }}>
                Optional — helps AI give more focused feedback
              </p>

              <textarea
                value={pageGoal}
                onChange={(e) => setPageGoal(e.target.value)}
                placeholder="e.g. Users should be able to complete checkout in under 3 clicks"
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none transition-all"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={(e) => e.target.style.borderColor = ACCENT}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />

              {error && <p className="text-[12px] text-red-400 mt-3">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all hover:opacity-70"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: submitting ? '#666' : ACCENT }}
                >
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles size={15} /> Generate Review</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
