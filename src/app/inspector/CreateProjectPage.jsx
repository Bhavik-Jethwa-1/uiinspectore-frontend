import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, X, Loader2, ArrowLeft, CheckCircle2,
  Sparkles, ChevronDown
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { ACCENT } from './constants/theme';
import { Skeleton } from '../../components/ui/Skeleton';
import { CodeGenProgress } from '../../components/ui/StepProgress';
import { ErrorState } from '../../components/ui/LoadingScreen';

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
      className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all w-full"
      style={{
        borderColor: selected ? persona.color : 'var(--border)',
        background: selected ? `${persona.color}10` : 'var(--surface)',
        borderWidth: selected ? 1.5 : 1,
      }}
    >
      <div className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5"
        style={{ borderColor: selected ? persona.color : 'var(--text-muted)', background: selected ? persona.color : 'transparent' }} />
      <div>
        <p className="text-[12px] font-semibold mb-0.5" style={{ color: selected ? persona.color : 'var(--text)' }}>{persona.label}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{persona.desc}</p>
      </div>
    </button>
  );
}

export default function InspectorCreateProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('first_time');
  const [pageGoal, setPageGoal] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [goalFocused, setGoalFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) { setFile(null); setPreview(null); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return; }
    const valid = ['image/png', 'image/jpeg', 'image/webp'];
    if (!valid.includes(f.type)) { setError('Only PNG, JPG, or WEBP supported'); return; }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  useEffect(() => {
    const onPaste = (e) => {
      const item = [...e.clipboardData?.items || []].find(i => i.type.startsWith('image/'));
      if (item) {
        const f = item.getAsFile();
        if (f) handleFile(f);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFile]);

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

  const selectedPersona = PERSONAS.find(p => p.value === persona);

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Back */}
      <button onClick={() => navigate('/inspector/projects')}
        className="flex items-center gap-1.5 text-[12px] mb-8 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={13} /> Back to Projects
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[22px] font-bold mb-1" style={{ color: 'var(--text)' }}>
          Create New Project
        </h2>
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
          Upload a screenshot and get an AI-powered UI review instantly
        </p>
      </div>

      {/* Form — skeleton while submitting */}
      {submitting ? (
        <SubmittingSkeleton />
      ) : (
        <NormalForm
          name={name} setName={setName}
          persona={persona} setPersona={setPersona}
          selectedPersona={selectedPersona}
          personaOpen={personaOpen} setPersonaOpen={setPersonaOpen}
          pageGoal={pageGoal} setPageGoal={setPageGoal}
          goalFocused={goalFocused} setGoalFocused={setGoalFocused}
          preview={preview} setPreview={preview}
          handleFile={handleFile}
          file={file} inputRef={inputRef}
          error={error} setError={setError}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function NormalForm({
  name, setName,
  persona, setPersona, selectedPersona, personaOpen, setPersonaOpen,
  pageGoal, setPageGoal, goalFocused, setGoalFocused,
  preview, handleFile, file, inputRef,
  error, setError, handleSubmit,
}) {
  return (
    <div className="space-y-5">
      {/* Screenshot */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
          Screenshot
        </label>
        {preview ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
            <button onClick={() => handleFile(null)}
              className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-colors"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => { e.preventDefault(); }}
            onClick={() => inputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--surface2)' }}>
              <Upload size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text)' }}>
              Drop image or click to upload
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              PNG, JPG, WEBP — Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* Project Name */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
          Project Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Checkout Flow Redesign"
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all placeholder:opacity-40"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          onFocus={(e) => e.target.style.borderColor = ACCENT}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Persona */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
          Review Perspective
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPersonaOpen(!personaOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] transition-all"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${personaOpen ? ACCENT : 'var(--border)'}`,
              color: 'var(--text)',
            }}
          >
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: selectedPersona?.color }} />
              {selectedPersona?.label}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: personaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {personaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-1 rounded-xl border overflow-hidden shadow-lg"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {PERSONAS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setPersona(p.value); setPersonaOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-80"
                  style={{ background: persona === p.value ? `${p.color}10` : 'transparent' }}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: persona === p.value ? p.color : 'var(--text)' }}>{p.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                  </div>
                  {persona === p.value && <CheckCircle2 size={12} className="ml-auto shrink-0" style={{ color: p.color }} />}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Page Goal */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>
          Page Goal <span style={{ opacity: 0.5 }}>(optional)</span>
        </label>
        <textarea
          value={pageGoal}
          onChange={(e) => setPageGoal(e.target.value)}
          placeholder="e.g. Users should complete checkout in under 3 clicks"
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none transition-all placeholder:opacity-40"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${goalFocused ? ACCENT : 'var(--border)'}`,
            color: 'var(--text)',
          }}
          onFocus={() => setGoalFocused(true)}
          onBlur={() => setGoalFocused(false)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
        style={{ background: ACCENT }}
      >
        <Sparkles size={15} /> Generate Review
      </button>
    </div>
  );
}

function SubmittingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Screenshot skeleton */}
      <div>
        <Skeleton className="h-3 w-20 rounded mb-2" />
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface2)', minHeight: 180 }}>
          <div className="w-full p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-3 flex-1 rounded" style={{ maxWidth: 100 }} />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-3 rounded" />
            <Skeleton className="h-3 rounded" style={{ width: '85%' }} />
            <Skeleton className="h-3 rounded" style={{ width: '65%' }} />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-3 rounded" style={{ width: '90%' }} />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Project name skeleton */}
      <div>
        <Skeleton className="h-3 w-24 rounded mb-2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Persona skeleton */}
      <div>
        <Skeleton className="h-3 w-28 rounded mb-2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Goal skeleton */}
      <div>
        <Skeleton className="h-3 w-20 rounded mb-2" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>

      {/* Code generation progress */}
      <CodeGenProgress activeStep={0} />
    </div>
  );
}
