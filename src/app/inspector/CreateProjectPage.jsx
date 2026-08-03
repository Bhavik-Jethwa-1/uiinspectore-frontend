import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, ArrowLeft, Image, Zap } from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import InspectorLayout from './layouts/InspectorLayout';
import { ACCENT } from './constants/theme';


const PERSONAS = [
  { value: 'general', label: 'General User', desc: 'Balanced review for most audiences' },
  { value: 'first_time', label: 'First-time User', desc: 'Focus on onboarding & clarity' },
  { value: 'non_technical', label: 'Non-technical', desc: 'Plain language, intuitive navigation' },
  { value: 'junior_dev', label: 'Junior Developer', desc: 'Code hints, standard patterns' },
  { value: 'devops', label: 'DevOps Engineer', desc: 'Technical clarity, efficiency' },
  { value: 'designer', label: 'Product Designer', desc: 'Design system, visual hierarchy' },
];

export default function InspectorCreateProjectPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('');
  const [persona, setPersona] = useState('general');
  const [pageGoal, setPageGoal] = useState('');
  const [screenshot, setScreenshot] = useState(null); // { file, preview }
  const [screenshotError, setScreenshotError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const valid = ['image/png', 'image/jpeg', 'image/webp'];
    if (!valid.includes(file.type)) {
      setScreenshotError('Only PNG, JPG, or WEBP images are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError('Image must be under 10MB');
      return;
    }
    setScreenshotError('');
    setScreenshot({ file, preview: URL.createObjectURL(file) });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!screenshot) {
      setScreenshotError('Please upload a screenshot');
      return;
    }

    setUploading(true);
    try {
      // 1. Create project
      const projectRes = await inspectorApi.createProject({
        name: name.trim(),
        description: description.trim() || null,
        product_type: productType || null,
      });

      const projectId = projectRes.project.id;

      // 2. Upload screenshot
      const formData = new FormData();
      formData.append('screenshot', screenshot.file);
      if (persona) formData.append('persona', persona);
      if (pageGoal) formData.append('page_goal', pageGoal);

      const uploadRes = await inspectorApi.uploadScreenshot(projectId, formData);
      if (!uploadRes.success) throw new Error(uploadRes.error || 'Upload failed');

      const screenshotId = uploadRes.screenshot.id;

      // 3. Generate review
      const reviewRes = await inspectorApi.generateReview(projectId, {
        screenshot_id: screenshotId,
        page_goal: pageGoal || null,
        persona: persona,
      });

      // Navigate to the project workspace
      navigate(`/inspector/projects/${projectId}`);
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <InspectorLayout>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/inspector/projects')}
          className="flex items-center gap-1.5 text-[12px] mb-6 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Projects
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--text)' }}>New Project</h1>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Upload a screenshot and get an instant AI review</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Screenshot Upload */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Screenshot <span className="text-red-500">*</span>
            </label>

            <AnimatePresence mode="wait">
              {!screenshot ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden"
                  style={{
                    borderColor: dragOver ? ACCENT : 'var(--border)',
                    background: dragOver ? `${ACCENT}08` : 'var(--surface)',
                    minHeight: 200,
                  }}>
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}15` }}>
                      <Upload size={24} style={{ color: ACCENT }} />
                    </div>
                    <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text)' }}>Drop screenshot here</p>
                    <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>or click to browse • PNG, JPG, WEBP • Max 10MB</p>
                    <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>You can also paste from clipboard (Ctrl+V)</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
                    className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <img src={screenshot.preview} alt="Screenshot preview" className="w-full max-h-80 object-contain" style={{ background: '#111' }} />
                  <button type="button" onClick={() => setScreenshot(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {screenshotError && (
              <p className="text-[11px] mt-1.5 text-red-500">{screenshotError}</p>
            )}
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Project Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="e.g. My SaaS Dashboard"
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="What is this page about? (optional)"
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none resize-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>

          {/* Page Goal */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Page Goal</label>
            <input type="text" value={pageGoal} onChange={e => setPageGoal(e.target.value)}
              placeholder="e.g. User should be able to connect a server"
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>AI will use this goal while reviewing the interface</p>
          </div>

          {/* Persona */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Review Persona</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PERSONAS.map(p => (
                <button key={p.value} type="button" onClick={() => setPersona(p.value)}
                  className="text-left p-2.5 rounded-xl border text-[11px] transition-all"
                  style={{
                    borderColor: persona === p.value ? ACCENT : 'var(--border)',
                    background: persona === p.value ? `${ACCENT}12` : 'var(--surface)',
                    color: persona === p.value ? ACCENT : 'var(--text)',
                  }}>
                  <div className="font-medium">{p.label}</div>
                  <div className="mt-0.5 opacity-60">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={uploading || !name.trim() || !screenshot}
            className="w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: ACCENT }}>
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating project & generating review…</>
            ) : (
              <><Zap size={16} /> Generate AI Review</>
            )}
          </button>
        </form>
      </div>
    </InspectorLayout>
  );
}
