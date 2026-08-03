import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, RefreshCw, Zap, Upload, X, Download,
  Eye, MessageSquare, Wand2, CheckCircle, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, ZoomIn, ZoomOut, Maximize2, Copy, Check, Sparkles
} from 'lucide-react';
import inspectorApi from '../../utils/inspectorApi';
import { ACCENT } from './constants/theme';


const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'annotations', label: 'Annotations', icon: AlertTriangle },
  { id: 'suggestions', label: 'Suggestions', icon: MessageSquare },
  { id: 'compare', label: 'Visual Compare', icon: Wand2 },
];

const SEVERITY_COLORS = {
  critical: '#ef4444',
  major: '#f97316',
  minor: '#eab308',
  info: '#3b82f6',
};

function ScoreRing({ score, label, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="opacity-10" style={{ color: 'var(--text-muted)' }} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ color: color }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[16px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-center font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function ComparisonSlider({ original, redesigned }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, []);

  const handleMouseDown = (e) => {
    handleMove(e);
    const onMove = (ev) => handleMove(ev);
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden cursor-col-resize select-none"
      style={{ height: 400 }} onMouseDown={handleMouseDown} onTouchMove={handleMove}>
      {/* Original (full) */}
      <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-contain" />

      {/* Redesigned (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={redesigned} alt="Redesigned" className="absolute inset-0 w-full h-full object-contain" style={{ minWidth: containerRef.current?.offsetWidth || '100%' }} />
      </div>

      {/* Slider line */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize z-10"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ChevronRight size={14} className="opacity-60" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white">Original</div>
      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white">AI Redesigned</div>
    </div>
  );
}

export default function InspectorReviewWorkspace() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [review, setReview] = useState(null);
  const [redesign, setRedesign] = useState(null);
  const [generatingReview, setGeneratingReview] = useState(false);
  const [generatingRedesign, setGeneratingRedesign] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('modern_saas');
  const [copySuccess, setCopySuccess] = useState('');

  const loadProject = useCallback(async () => {
    try {
      const data = await inspectorApi.getProject(projectId);
      setProject(data.project);
      if (data.project.review) {
        setReview(data.project.review);
      }
      if (data.project.redesign) {
        setRedesign(data.project.redesign);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const handleGenerateReview = async () => {
    if (!project) return;
    setGeneratingReview(true);
    try {
      const res = await inspectorApi.generateReview(projectId, {
        screenshot_id: project.screenshots?.[0]?.id,
        page_goal: project.screenshots?.[0]?.page_goal,
        persona: project.screenshots?.[0]?.persona,
      });
      if (res.success) {
        setReview(res.review);
      }
    } catch (err) {
      alert(err.message || 'Review generation failed');
    } finally {
      setGeneratingReview(false);
    }
  };

  const handleGenerateRedesign = async () => {
    if (!project) return;
    setGeneratingRedesign(true);
    try {
      const res = await inspectorApi.generateRedesign(projectId, {
        screenshot_id: project.screenshots?.[0]?.id,
        design_style: selectedStyle,
      });
      if (res.success) {
        setRedesign(res.redesign);
      }
    } catch (err) {
      alert(err.message || 'Redesign generation failed');
    } finally {
      setGeneratingRedesign(false);
    }
  };

  const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin opacity-40" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">Project not found</p>
      </div>
    );
  }

  const screenshot = project.screenshots?.[0];
  const scores = review?.scores || {};
  const annotations = review?.annotations || [];
  const suggestions = review?.suggestions || [];

  return (
    <div className="min-w-0">
      {/* Workspace Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => window.location.href = '/inspector/projects'}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] sm:text-[16px] font-bold truncate" style={{ color: 'var(--text)' }}>{project.name}</h1>
          {project.description && <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {scores?.overall && (
            <div className="text-right hidden sm:block">
              <div className="text-[14px] font-bold" style={{ color: ACCENT }}>{scores.overall}<span className="text-[10px]">/100</span></div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Overall</div>
            </div>
          )}
          <button onClick={handleGenerateReview} disabled={generatingReview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: generatingReview ? '#666' : ACCENT }}>
            {generatingReview ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {generatingReview ? 'Analyzing…' : 'Review'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b overflow-x-auto" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.id ? `${ACCENT}18` : 'transparent',
                color: activeTab === tab.id ? ACCENT : 'var(--text-muted)',
              }}>
              <Icon size={13} /> {tab.label}
              {tab.id === 'annotations' && annotations.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${ACCENT}25`, color: ACCENT }}>
                  {annotations.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {!review || review.status === 'pending' || review.status === 'analyzing' ? (
                <div className="rounded-2xl border border-dashed p-16 text-center" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${ACCENT}15` }}>
                    <Zap size={28} style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-[16px] font-bold mb-2" style={{ color: 'var(--text)' }}>Ready to analyze your UI</h3>
                  <p className="text-[13px] mb-5" style={{ color: 'var(--text-muted)' }}>Upload a screenshot and let AI do a comprehensive review</p>
                  <button onClick={handleGenerateReview} disabled={generatingReview || !screenshot}
                    className="px-6 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: ACCENT }}>
                    {generatingReview ? <><Loader2 size={14} className="animate-spin inline mr-2" />Analyzing…</> : <><Zap size={14} className="inline mr-2" />Generate AI Review</>}
                  </button>
                </div>
              ) : (
                <>
                  {/* Screenshot + Scores */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Screenshot */}
                    <div className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                      {screenshot ? (
                        <img src={screenshot.url} alt="Screenshot" className="w-full max-h-[400px] object-contain" style={{ background: '#111' }} />
                      ) : (
                        <div className="flex items-center justify-center h-64" style={{ background: 'var(--surface2)' }}>No screenshot</div>
                      )}
                    </div>

                    {/* Score rings */}
                    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      <h3 className="text-[13px] font-bold mb-4" style={{ color: 'var(--text)' }}>UI Scores</h3>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                        {Object.entries(scores).map(([key, val]) => (
                          <ScoreRing key={key} score={val} label={key.replace('_', ' ')} size={70} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {review?.summary && (
                    <div className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      <h3 className="text-[13px] font-bold mb-3" style={{ color: 'var(--text)' }}>AI Summary</h3>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{review.summary.overall}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── ANNOTATIONS ── */}
          {activeTab === 'annotations' && (
            <motion.div key="annotations" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!review ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ background: 'var(--surface)', border: '2px dashed var(--border)' }}>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${ACCENT}15` }}>
                    <AlertTriangle size={36} style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-[18px] font-bold mb-2" style={{ color: 'var(--text)' }}>No Review Yet</h3>
                  <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Generate a review to see annotations</p>
                </div>
              ) : annotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ background: 'var(--surface)', border: '2px solid rgba(34,197,94,0.3)' }}>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <CheckCircle size={36} style={{ color: '#22c55e' }} />
                  </div>
                  <h3 className="text-[18px] font-bold mb-2" style={{ color: '#22c55e' }}>Perfect Score!</h3>
                  <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>No issues found in this review</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Stats bar */}
                  <div className="flex items-center gap-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Critical: {annotations.filter(a => a.severity === 'critical').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Major: {annotations.filter(a => a.severity === 'major').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
                      <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Minor: {annotations.filter(a => a.severity === 'minor').length}</span>
                    </div>
                  </div>

                  {/* Main content: screenshot + detail panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                    {/* Screenshot with markers */}
                    <div className="xl:col-span-3">
                      <div className="relative rounded-2xl overflow-hidden border-2 shadow-2xl" style={{ borderColor: 'var(--border)' }}>
                        {screenshot && <img src={screenshot.url} alt="Screenshot" className="w-full max-h-[520px] object-contain" style={{ background: '#080808' }} />}
                        {annotations.map(ann => (
                          <button key={ann.id}
                            onClick={() => setSelectedAnnotation(selectedAnnotation?.id === ann.id ? null : ann)}
                            className="absolute flex items-center justify-center rounded-full font-bold w-fit text-white shadow-xl hover:scale-125 transition-all z-10 border-2 border-white/30"
                            style={{
                              left: `${ann.x}%`, top: `${ann.y}%`,
                              width: ann.width ? `${ann.width / 6}%` : 20, height: ann.height ? `${ann.height / 6}%` : 20,
                              minWidth: 18, minHeight: 18,
                              background: SEVERITY_COLORS[ann.severity] || SEVERITY_COLORS.info,
                              fontSize: 9,
                              transform: 'translate(-50%, -50%)',
                              boxShadow: `0 4px 20px ${SEVERITY_COLORS[ann.severity] || '#666'}80`,
                            }}>
                            {ann.number}
                          </button>
                        ))}
                        {/* Overlay info */}
                        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[11px] font-bold backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                          {annotations.length} issues detected
                        </div>
                      </div>
                    </div>

                    {/* Detail panel */}
                    <div className="xl:col-span-2">
                      {selectedAnnotation ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                          className="rounded-2xl overflow-hidden border-2 shadow-2xl h-full" style={{ borderColor: SEVERITY_COLORS[selectedAnnotation.severity] }}>
                          <div className="p-6" style={{ background: 'var(--surface)' }}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold text-white" style={{ background: SEVERITY_COLORS[selectedAnnotation.severity], boxShadow: `0 4px 16px ${SEVERITY_COLORS[selectedAnnotation.severity]}50` }}>
                                  {selectedAnnotation.number}
                                </span>
                                <span className="text-[11px] px-3 py-1 rounded-full font-bold text-white" style={{ background: SEVERITY_COLORS[selectedAnnotation.severity] }}>
                                  {selectedAnnotation.severity}
                                </span>
                              </div>
                              <button onClick={() => setSelectedAnnotation(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                                <X size={18} style={{ color: 'var(--text-muted)' }} />
                              </button>
                            </div>
                            <h4 className="text-[17px] font-bold mb-3" style={{ color: 'var(--text)' }}>{selectedAnnotation.title}</h4>
                            <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>{selectedAnnotation.description}</p>
                            {selectedAnnotation.suggested_fix && (
                              <div className="p-5 rounded-xl" style={{ background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`, border: `1px solid ${ACCENT}40` }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles size={16} style={{ color: ACCENT }} />
                                  <span className="text-[12px] font-bold" style={{ color: ACCENT }}>Suggested Fix</span>
                                </div>
                                <p className="text-[13px]" style={{ color: 'var(--text)' }}>{selectedAnnotation.suggested_fix}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{ background: 'var(--surface)', border: '2px dashed var(--border)' }}>
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}15` }}>
                            <AlertCircle size={24} style={{ color: ACCENT }} />
                          </div>
                          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Click an issue marker on the screenshot to view details</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issues grid */}
                  <div>
                    <h3 className="text-[14px] font-bold px-1 mb-3" style={{ color: 'var(--text-muted)' }}>All Issues</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {annotations.map(ann => (
                        <button key={ann.id} onClick={() => setSelectedAnnotation(ann)}
                          className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]"
                          style={{
                            background: selectedAnnotation?.id === ann.id ? `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}05)` : 'var(--surface)',
                            borderColor: selectedAnnotation?.id === ann.id ? ACCENT : 'var(--border)',
                            boxShadow: selectedAnnotation?.id === ann.id ? `0 8px 30px ${ACCENT}30` : 'var(--shadow-sm)',
                          }}>
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shrink-0" style={{ background: SEVERITY_COLORS[ann.severity], boxShadow: `0 4px 12px ${SEVERITY_COLORS[ann.severity]}50` }}>
                            {ann.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold mb-1.5 truncate" style={{ color: 'var(--text)' }}>{ann.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${SEVERITY_COLORS[ann.severity]}20`, color: SEVERITY_COLORS[ann.severity] }}>{ann.severity}</span>
                              {ann.component_type && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ann.component_type}</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── SUGGESTIONS ── */}
          {activeTab === 'suggestions' && (
            <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {!review ? (
                <div className="text-center py-16 text-[13px]" style={{ color: 'var(--text-muted)' }}>Generate a review first to see suggestions</div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-16 text-[13px]" style={{ color: 'var(--text-muted)' }}>No suggestions available</div>
              ) : (
                suggestions.map((sug, i) => (
                  <div key={sug.id} className="rounded-2xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: sug.priority === 'critical' ? '#FEE2E2' : sug.priority === 'high' ? '#FEF3C7' : `${ACCENT}15` }}>
                        <CheckCircle size={12} style={{ color: sug.priority === 'critical' ? '#ef4444' : sug.priority === 'high' ? '#f59e0b' : ACCENT }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${ACCENT}15`, color: ACCENT }}>{sug.category}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sug.priority === 'critical' ? '#FEE2E2' : '#FEF3C7', color: sug.priority === 'critical' ? '#991B1B' : '#92400E' }}>{sug.priority}</span>
                          {sug.difficulty && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>• {sug.difficulty}</span>}
                        </div>
                        <h4 className="text-[13px] font-bold mb-1" style={{ color: 'var(--text)' }}>{sug.title}</h4>
                        <p className="text-[12px] mb-2" style={{ color: 'var(--text-muted)' }}>{sug.description}</p>
                        {sug.suggested_fix && (
                          <div className="p-3 rounded-xl text-[12px] leading-relaxed" style={{ background: 'var(--surface2)' }}>
                            <span className="font-medium" style={{ color: ACCENT }}>→ </span>
                            <span style={{ color: 'var(--text)' }}>{sug.suggested_fix}</span>
                          </div>
                        )}
                        {sug.expected_improvement && (
                          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium">Impact: </span>{sug.expected_improvement}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ── VISUAL COMPARE ── */}
          {activeTab === 'compare' && (
            <motion.div key="compare" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {['modern_saas', 'minimal', 'glassmorphism', 'enterprise', 'dark'].map(style => (
                    <button key={style} onClick={() => setSelectedStyle(style)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all"
                      style={{
                        borderColor: selectedStyle === style ? ACCENT : 'var(--border)',
                        background: selectedStyle === style ? `${ACCENT}15` : 'var(--surface)',
                        color: selectedStyle === style ? ACCENT : 'var(--text-muted)',
                      }}>
                      {style.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <button onClick={handleGenerateRedesign} disabled={generatingRedesign || !screenshot}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 sm:ml-auto"
                  style={{ background: generatingRedesign ? '#666' : '#10b981' }}>
                  {generatingRedesign ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  {generatingRedesign ? 'Generating…' : 'Generate Redesign'}
                </button>
              </div>

              {!screenshot ? (
                <div className="rounded-2xl border border-dashed p-16 text-center" style={{ borderColor: 'var(--border)' }}>
                  <Upload size={28} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Upload a screenshot to enable visual comparison</p>
                </div>
              ) : !redesign || !redesign.image_url ? (
                <div className="rounded-2xl border border-dashed p-16 text-center" style={{ borderColor: 'var(--border)' }}>
                  <Wand2 size={28} style={{ color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 12px' }} />
                  <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text)' }}>Visual Comparison</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Click "Generate Redesign" to see AI-improved version</p>
                </div>
              ) : (
                <>
                  <ComparisonSlider original={screenshot.url} redesigned={redesign.image_url} />

                  {/* What changed */}
                  {(redesign.improved_items?.length || redesign.unchanged_items?.length) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {redesign.improved_items?.length > 0 && (
                        <div className="rounded-xl border p-4" style={{ borderColor: '#10b981', background: '#F0FDF4' }}>
                          <h4 className="text-[12px] font-bold mb-2 flex items-center gap-1.5" style={{ color: '#065F46' }}>
                            <CheckCircle size={13} /> Improved
                          </h4>
                          <ul className="space-y-1">
                            {redesign.improved_items.slice(0, 5).map((item, i) => (
                              <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: '#065F46' }}>
                                <span>✓</span><span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {redesign.unchanged_items?.length > 0 && (
                        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                          <h4 className="text-[12px] font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                            <Eye size={13} /> Preserved
                          </h4>
                          <ul className="space-y-1">
                            {redesign.unchanged_items.slice(0, 5).map((item, i) => (
                              <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <span>—</span><span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
