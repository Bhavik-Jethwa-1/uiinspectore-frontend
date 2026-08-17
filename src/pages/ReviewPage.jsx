import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  ArrowLeft, RefreshCw, Plus, AlertCircle,
  CheckCircle2, Lightbulb, Loader2, Upload, X, Sparkles,
  HelpCircle, Eye, ExternalLink, ChevronRight, AlertTriangle, Info, Check,
  Image as ImageIcon, ChevronUp, ChevronDown, MapPin, MousePointerClick,
} from 'lucide-react';

// ─── Priority Badge Helper ───────────────────────────────────────────────────
function getPriorityStyle(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes('critical') || p.includes('high')) return { bg: 'var(--error-light)', color: 'var(--error)', label: p.includes('critical') ? 'Critical' : 'High' };
  if (p.includes('medium')) return { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Medium' };
  return { bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Low' };
}

// ─── Score Color / Label Helpers ────────────────────────────────────────────
function getScoreColor(v) {
  if (!v && v !== 0) return 'var(--text-muted)';
  if (v >= 80) return 'var(--success)';
  if (v >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function getScoreBg(v) {
  if (!v && v !== 0) return 'var(--hover)';
  if (v >= 80) return 'var(--success-light)';
  if (v >= 60) return 'var(--warning-light)';
  return 'var(--error-light)';
}

function getScoreLabel(v) {
  if (!v && v !== 0) return 'No data';
  if (v >= 90) return 'Excellent';
  if (v >= 80) return 'Good';
  if (v >= 65) return 'Average';
  if (v >= 50) return 'Below Average';
  return 'Needs work';
}

function getScoreSummary(v) {
  if (!v && v !== 0) return 'No score data available yet.';
  if (v >= 90) return 'Outstanding UI quality. Your interface is among the best-designed.';
  if (v >= 80) return 'Your interface is well-designed with minor opportunities for improvement.';
  if (v >= 65) return 'Your interface is usable but has several areas that could be improved for a better user experience.';
  if (v >= 50) return 'Your interface needs attention. Several significant usability issues were detected.';
  return 'Significant usability issues detected. Prioritizing fixes will greatly improve the user experience.';
}

// ─── Score Category Explanations ───────────────────────────────────────────
const SCORE_EXPLANATIONS = {
  visualHierarchy: { label: 'Visual Hierarchy', desc: 'How easily users can identify the most important elements on the page.' },
  clarity:         { label: 'Readability',       desc: 'How clear and easy-to-read the content and text appear.' },
  accessibility:   { label: 'Accessibility',     desc: 'How usable the interface is for people with disabilities or using assistive tools.' },
  consistency:     { label: 'Consistency',       desc: 'How consistently design patterns, colors, and interactions are applied throughout.' },
  layout:         { label: 'Layout',           desc: 'How well the elements are arranged, spaced, and balanced on the page.' },
  typography:      { label: 'Typography',        desc: 'How readable, well-organized, and appropriately sized the text is.' },
  ux:             { label: 'UX',               desc: 'Overall user experience quality, flow, and intuitiveness of the interface.' },
  performance:     { label: 'Performance',      desc: 'How fast the page loads and responds to user interactions.' },
  seo:             { label: 'SEO',               desc: 'How well the page is optimized for search engines and discoverability.' },
};

const SCORE_STATUS = {
  good:         'Strong — this area is working well.',
  improvement:  'Room for improvement — consider addressing this.',
  attention:    'Needs attention — prioritize fixing this.',
};

// ─── "Understanding Your Report" Guide ──────────────────────────────────────
// Shown prominently on first view of a completed review. Never hidden in an obscure
// collapsible section. Returning users can collapse it; first-time users always see it expanded.
function ReportGuide({ reviewId }) {
  const storageKey = `review_guide_${reviewId || 'default'}_dismissed`;
  const wasDismissed = (() => {
    try { return localStorage.getItem(storageKey) === 'true'; } catch { return false; }
  })();

  const [open, setOpen] = useState(!wasDismissed); // first-time = always open
  const [dismissed, setDismissed] = useState(wasDismissed);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    try { localStorage.setItem(storageKey, 'true'); } catch {}
  };

  // Collapsed state — always visible as a button, never hidden
  if (dismissed) {
    return (
      <button
        onClick={() => { setOpen(true); setDismissed(false); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--primary-light)', border: '1px solid var(--primary)30',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)',
          marginBottom: 12, width: '100%', textAlign: 'left',
        }}
      >
        <HelpCircle size={13} />
        Understanding your report
      </button>
    );
  }

  // Expanded state
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: 'linear-gradient(135deg, var(--primary-light) 0%, #ede9fe 100%)',
      border: '1px solid var(--primary)30',
      marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
            Understanding your report
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(91,95,239,0.12)', border: 'none', borderRadius: 6,
            padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600,
            color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          Got it
        </button>
      </div>

      {/* Score ranges */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Overall Score
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {[
            { range: '90–100', label: 'Excellent',  color: 'var(--success)', bg: 'var(--success-light)' },
            { range: '80–89',  label: 'Good',       color: 'var(--success)', bg: 'var(--success-light)' },
            { range: '65–79',  label: 'Average',    color: 'var(--warning)', bg: 'var(--warning-light)' },
            { range: '50–64',  label: 'Below Avg',  color: 'var(--warning)', bg: 'var(--warning-light)' },
            { range: '0–49',   label: 'Needs Work', color: 'var(--error)',   bg: 'var(--error-light)' },
          ].map(({ range, label, color, bg }) => (
            <div key={label} style={{ padding: '6px 4px', borderRadius: 6, background: bg, textAlign: 'center' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 1 }}>{label}</p>
              <p style={{ fontSize: 9, color, opacity: 0.8 }}>{range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Severity levels */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Issue Severity
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Critical', color: 'var(--error)',    bg: 'var(--error-light)',   desc: 'Usability or accessibility problems that seriously hurt the user experience.' },
            { label: 'High',      color: 'var(--warning)',  bg: 'var(--warning-light)', desc: 'Important problems that should be fixed soon — they significantly impact usability.' },
            { label: 'Medium',    color: 'var(--secondary)',bg: 'var(--primary-light)',desc: 'Problems that improve usability when fixed, but are not urgent.' },
            { label: 'Low',       color: 'var(--text-muted)',bg: 'var(--hover)',        desc: 'Minor polish improvements — nice to have but not essential.' },
          ].map(({ label, color, bg, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: bg, color, flexShrink: 0, marginTop: 1 }}>
                {label}
              </span>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What to do next */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          What to do next
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { num: '1', text: 'Start with Critical issues — they have the biggest impact on your users.' },
            { num: '2', text: "Click any numbered pin on the screenshot to jump to that issue's details." },
            { num: '3', text: 'Expand "How to fix" on any issue to see specific steps to improve.' },
            { num: '4', text: 'After fixing issues, run another review to see your improved score.' },
          ].map(({ num, text }) => (
            <div key={num} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, marginTop: 1 }}>
                {num}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Annotation Pin on Screenshot ────────────────────────────────────────────
// annotation: { id, x, y, width, height, issue: { id, title, severity, ... } }
// x, y are passed as PERCENTAGE values (0-100) already converted by parent.
function AnnotationPin({ annotation, isSelected, isPulsing, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const issue = annotation.issue || {};
  const sevColor = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : issue.severity === 'medium' ? 'var(--secondary)'
    : 'var(--primary)';
  const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
    : issue.severity === 'high' ? 'var(--warning-light)'
    : issue.severity === 'medium' ? 'var(--primary-light)'
    : 'var(--hover)';

  return (
    <div
      style={{ position: 'absolute', left: `${annotation.x}%`, top: `${annotation.y}%`, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(23,27,58,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '8px 10px',
          minWidth: 160,
          maxWidth: 220,
          zIndex: 20,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          {/* Pin number + severity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              background: sevBg, color: sevColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800,
            }}>
              {annotation._displayNum}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: sevColor }}>
              {issue.severity || 'Issue'}
            </span>
          </div>
          {/* Title */}
          <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.4 }}>
            {issue.title || 'Issue'}
          </p>
          {/* Description preview */}
          {issue.description && (
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {issue.description}
            </p>
          )}
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(23,27,58,0.95)',
          }} />
        </div>
      )}

      {/* Pin button */}
      <button
        onClick={onClick}
        aria-label={`Annotation ${annotation._displayNum}: ${issue.title || 'Issue'} — ${issue.severity || 'Issue'}`}
        style={{
          position: 'relative',
          transform: `scale(${isSelected ? 1.25 : 1})`,
          width: isSelected ? 30 : 26,
          height: isSelected ? 30 : 26,
          borderRadius: '50%',
          background: sevColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isSelected ? 12 : 10,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: isSelected
            ? `0 0 0 3px #fff, 0 0 0 6px ${sevColor}, 0 0 16px ${sevColor}60`
            : '0 2px 8px rgba(0,0,0,0.4)',
          border: '2.5px solid #fff',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
          zIndex: isSelected ? 15 : 6,
          animation: isPulsing ? 'pin-pulse 1.5s ease-out 3' : 'none',
        }}
      >
        {annotation._displayNum}
      </button>
    </div>
  );
}

// ─── Screenshot with Annotation Overlay ──────────────────────────────────────
// Props:
//   screenshotUrl: string
//   annotations: array of { id, x, y, width, height, issue: {...} }
//   selectedAnnotationId: number | null
//   pulsingAnnotationId: number | null
//   onAnnotationClick: (annotationId) => void
//   onRequestScroll: () => void  — request parent to scroll this element into view
function AnnotatedScreenshot({
  screenshotUrl,
  annotations,
  selectedAnnotationId,
  pulsingAnnotationId,
  onAnnotationClick,
  onRequestScroll,
}) {
  const [imgVisible, setImgVisible] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Wait for image to load before calculating positions
  const isReady = naturalDims.w > 0 && naturalDims.h > 0;

  const handleLoad = useCallback((e) => {
    const img = e.currentTarget;
    setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  // Determine if annotation has pixel coordinates
  const hasCoords = (ann) => ann.x != null || ann.y != null;

  // Convert pixel coords (x, y, width, height) to percentages of the DISPLAYED image.
  // Backend returns x, y, width, height as pixels on the ORIGINAL image.
  const toPercent = useCallback((ann) => {
    const nw = naturalDims.w || 1;
    const nh = naturalDims.h || 1;
    return {
      ...ann,
      // Percentage position of the annotation CENTER on the displayed image
      x: Math.min(100, Math.max(0, (ann.x / nw) * 100)),
      y: Math.min(100, Math.max(0, (ann.y / nh) * 100)),
      // Percentage dimensions
      w: ann.width != null ? Math.min(100, (ann.width / nw) * 100) : undefined,
      h: ann.height != null ? Math.min(100, (ann.height / nh) * 100) : undefined,
    };
  }, [naturalDims]);

  // Annotations with coords → converted to percentage positions
  const pinnedAnns = annotations.filter(hasCoords).map(toPercent);
  const noCoordAnns = annotations.filter(a => !hasCoords(a));

  // Assign display numbers for pins (1-based, in display order)
  pinnedAnns.forEach((ann, idx) => {
    ann._displayNum = idx + 1;
  });

  // Reverse map: annotationId → display number (for pin labels)
  const idToDisplayNum = {};
  pinnedAnns.forEach((ann, idx) => {
    idToDisplayNum[ann.id] = idx + 1;
  });

  // When parent requests scroll, scroll this container into view
  useEffect(() => {
    if (onRequestScroll && containerRef.current) {
      // Scroll the page so the screenshot container is visible near top
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onRequestScroll]);

  return (
    <div className="card annotated-screenshot-scroll" style={{ padding: 0, overflowY: 'auto', maxHeight: '70vh', position: 'relative' }} ref={containerRef}>
      {/* Screenshot image */}
      {imgVisible && !imgError ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            ref={imgRef}
            src={screenshotUrl}
            alt="UI Screenshot"
            className="annotated-screenshot-img"
            style={{
              width: '100%',
              maxHeight: 420,
              objectFit: 'contain',
              display: 'block',
              background: 'var(--background)',
            }}
            onLoad={handleLoad}
            onError={() => setImgError(true)}
          />

          {/* Show a subtle overlay when image has loaded but coords not yet available */}
          {!isReady && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.04)',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4 }}>
                Loading coordinates...
              </span>
            </div>
          )}

          {/* Annotation pins — only show after image dimensions are known */}
          {isReady && pinnedAnns.map((ann) => (
            <AnnotationPin
              key={ann.id}
              annotation={ann}
              isSelected={selectedAnnotationId === ann.id}
              isPulsing={pulsingAnnotationId === ann.id}
              onClick={() => onAnnotationClick(ann.id)}
            />
          ))}
        </div>
      ) : (
        /* Fallback for broken image */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 20px', background: 'var(--background)', minHeight: 220,
        }}>
          <ImageIcon size={36} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Preview unavailable</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>The image could not be loaded.</p>
          <button onClick={() => window.open(screenshotUrl, '_blank')} className="btn-secondary" style={{ fontSize: 12 }}>
            <ExternalLink size={12} /> Open image in new tab
          </button>
        </div>
      )}

      {/* Annotation count badge */}
      {annotations.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(23,27,58,0.82)',
          backdropFilter: 'blur(4px)',
          borderRadius: 6, padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <MapPin size={11} style={{ color: '#fff' }} />
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>
            {pinnedAnns.length} visual issue{pinnedAnns.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Notice when some annotations lack coordinates */}
      {noCoordAnns.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--warning-light)',
          borderTop: '1px solid var(--warning)20',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--warning)' }}>
            {noCoordAnns.length} issue{noCoordAnns.length !== 1 ? 's' : ''} found but visual location
            {noCoordAnns.length !== 1 ? 's are' : ' is'} unavailable. See details below.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Suggestion Card ────────────────────────────────────────────────────────
// suggestion: { id, title, description, severity, priority, recommendation, fix,
//               steps, problem, why_matters, user_impact, expected_impact, status }
function SuggestionCard({ suggestion, index, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const pStyle = getPriorityStyle(suggestion.priority);
  const sevColor = pStyle.color;
  const sevBg = pStyle.bg;

  const hasFix       = suggestion.recommendation || suggestion.fix || (suggestion.steps && suggestion.steps.length > 0);
  const hasDetails   = suggestion.problem || suggestion.why_matters || suggestion.user_impact || suggestion.expected_impact;
  const title        = suggestion.title || suggestion.category || 'Suggestion';
  const description  = suggestion.description || suggestion.suggestion || '';

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: 'hidden',
        border: isSelected ? `2px solid ${sevColor}` : '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isSelected ? `0 0 0 3px ${sevColor}20` : 'none',
      }}
      onClick={() => onSelect && onSelect(index)}
    >
      {/* Top accent bar */}
      <div style={{ height: 3, background: sevColor, borderRadius: '2px 2px 0 0' }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header: number + title + severity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginTop: 1,
            background: sevBg, color: sevColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800,
          }}>
            {index + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: description ? 6 : 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {title}
              </p>
              <span style={{
                fontSize: 9, fontWeight: 800, textTransform: 'uppercase', flexShrink: 0,
                padding: '2px 7px', borderRadius: 4,
                background: sevBg, color: sevColor,
              }}>
                {pStyle.label}
              </span>
            </div>
            {description && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* AI Analysis: structured explanation grid */}
        {hasDetails && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 8, marginBottom: 10,
          }}>
            {suggestion.problem && (
              <AICard icon="❌" label="Problem" text={suggestion.problem} color="var(--error)" bg="var(--error-light)" />
            )}
            {suggestion.why_matters && (
              <AICard icon="⚠️" label="Why it matters" text={suggestion.why_matters} color="var(--warning)" bg="var(--warning-light)" />
            )}
            {suggestion.user_impact && (
              <AICard icon="👤" label="User impact" text={suggestion.user_impact} color="var(--primary)" bg="var(--primary-light)" />
            )}
            {suggestion.expected_impact && (
              <AICard icon="✅" label="Expected impact" text={suggestion.expected_impact} color="var(--success)" bg="var(--success-light)" />
            )}
          </div>
        )}

        {/* How to fix — always visible as toggle */}
        {hasFix && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 7,
              border: `1.5px solid ${expanded ? sevColor : 'var(--border)'}`,
              background: expanded ? sevBg : 'var(--background)',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
              color: expanded ? sevColor : 'var(--text-secondary)',
              transition: 'all 0.15s',
              width: '100%', justifyContent: 'center',
            }}
          >
            {expanded ? <ChevronUp size={13} /> : <Lightbulb size={13} />}
            {expanded ? 'Hide fix' : 'How to fix'}
          </button>
        )}

        {/* Expanded: Recommendation + Steps */}
        {expanded && hasFix && (
          <div style={{
            marginTop: 10, padding: '12px 14px', borderRadius: 8,
            background: 'var(--background)',
            border: '1px solid var(--border)',
          }}>
            {/* Recommendation */}
            {suggestion.recommendation && (
              <div style={{ marginBottom: suggestion.steps ? 10 : 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommendation
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {suggestion.recommendation}
                </p>
              </div>
            )}
            {/* Fix text */}
            {suggestion.fix && (
              <div style={{ marginBottom: suggestion.steps ? 10 : 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  How to fix
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {suggestion.fix}
                </p>
              </div>
            )}
            {/* Steps */}
            {suggestion.steps && suggestion.steps.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Steps to fix
                </p>
                <ol style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {suggestion.steps.map((step, i) => (
                    <li key={i} style={{ lineHeight: 1.55 }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Explanation Card (sub-component) ─────────────────────────────────────
function AICard({ icon, label, text, color, bg }) {
  const [expanded, setExpanded] = useState(false);
  // Truncate text if too long
  const isLong = text && text.length > 80;
  const display = isLong && !expanded ? text.slice(0, 80) + '…' : text;

  return (
    <div
      style={{
        padding: '9px 11px', borderRadius: 8,
        background: bg,
        border: `1px solid ${color}20`,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <span style={{ fontSize: 10 }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {isLong && (
          <span style={{ fontSize: 9, color, marginLeft: 'auto' }}>
            {expanded ? 'less' : 'more'}
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
        {display}
      </p>
    </div>
  );
}

// ─── Detail Line (Problem / Why it matters / Expected impact) ───────────────
function DetailLine({ label, text, color }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

// ─── Issue Card (for right panel) ───────────────────────────────────────────
// Props:
//   issue: issue object from API
//   issueId: stable numeric ID
//   annotationId: stable numeric ID of matching annotation (null if no coords)
//   displayNum: 1-based display number shown in the pin
//   isSelected: whether this issue is currently highlighted
//   onViewAnnotation: () => void
//   onHighlight: () => void
function IssueCard({ issue, issueId, annotationId, displayNum, isSelected, onViewAnnotation, onHighlight }) {
  const sevColor = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : 'var(--secondary)';
  const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
    : issue.severity === 'high' ? 'var(--warning-light)'
    : 'var(--primary-light)';
  const badgeBg = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : 'var(--secondary)';

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background: sevBg,
        border: `1px solid ${sevColor}${isSelected ? '' : '30'}`,
        borderLeft: `4px solid ${sevColor}`,
        boxShadow: isSelected ? `0 0 0 2px ${sevColor}20, 0 2px 8px rgba(0,0,0,0.08)` : 'none',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: 'pointer',
        overflow: 'hidden',  // prevent content overflow
      }}
      onClick={onHighlight}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: sevColor, textTransform: 'uppercase', lineHeight: 1.2 }}>
          {issue.severity || 'Issue'}
        </span>
        {displayNum != null && (
          <span style={{
            fontSize: 9, fontWeight: 700,
            padding: '1px 5px', borderRadius: 3,
            background: badgeBg, color: '#fff',
          }}>
            #{displayNum}
          </span>
        )}
        {annotationId != null ? (
          <button
            onClick={(e) => { e.stopPropagation(); onViewAnnotation(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '1px 6px', borderRadius: 4,
              background: 'rgba(255,255,255,0.8)', border: 'none',
              cursor: 'pointer', fontSize: 9, fontWeight: 600,
              color: sevColor,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
          >
            <MapPin size={9} /> View on image
          </button>
        ) : (
          <span style={{
            fontSize: 9, fontWeight: 600,
            padding: '1px 6px', borderRadius: 4,
            background: 'var(--warning-light)', color: 'var(--warning)',
          }}>
            No location
          </span>
        )}
      </div>
      <p style={{
        fontSize: 12, fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {issue.title || 'Issue'}
      </p>
      {issue.description && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          title={issue.description}
        >
          {issue.description}
        </p>
      )}
      {issue.recommendation && (
        <p style={{ fontSize: 10, color: 'var(--primary)', marginTop: 4, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={issue.recommendation}
        >
          Fix: {issue.recommendation}
        </p>
      )}
    </div>
  );
}

// ─── AI Processing Loading State ─────────────────────────────────────────────
function AILoadingState() {
  const [stepIdx, setStepIdx] = useState(0);
  const steps = [
    'Uploading screenshot',
    'Reading interface elements',
    'Analyzing visual hierarchy',
    'Checking accessibility',
    'Reviewing usability',
    'Preparing recommendations',
  ];

  useEffect(() => {
    const iv = setInterval(() => {
      setStepIdx(i => (i + 1) % steps.length);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
      {/* Animated spinner */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          background: 'var(--primary-light)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={20} style={{ color: 'var(--primary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Analyzing your UI...
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          This may take a few moments
        </p>
      </div>

      {/* Step progress */}
      <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, i) => {
          const isDone = i < stepIdx;
          const isCurrent = i === stepIdx;
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: isDone ? 'var(--success-light)' : isCurrent ? 'var(--primary-light)' : 'var(--hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: isCurrent ? '2px solid var(--primary)' : 'none',
                transition: 'all 0.2s',
              }}>
                {isDone ? (
                  <Check size={10} style={{ color: 'var(--success)' }} />
                ) : isCurrent ? (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1s ease-in-out infinite' }} />
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--border)' }} />
                )}
              </div>
              <span style={{
                fontSize: 12,
                color: isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isCurrent ? 600 : 400,
                transition: 'color 0.2s',
              }}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI Error State ─────────────────────────────────────────────────────────
function AIErrorState({ error, onRetry, onBack, retrying, errorCode }) {
  let explanation = 'The AI analysis could not be completed.';
  let hint = 'Please try again. If the problem persists, try a different screenshot.';

  if (errorCode === 'RATE_LIMITED') {
    explanation = 'The AI service is temporarily busy.';
    hint = 'Please wait a moment and try again.';
  } else if (errorCode === 'AUTH_ERROR') {
    explanation = 'There is a configuration issue with the AI service.';
    hint = 'Please contact an administrator.';
  } else if (errorCode === 'SCREENSHOT_MISSING' || errorCode === 'SCREENSHOT_FILE_MISSING') {
    explanation = 'The screenshot for this review is no longer available.';
    hint = 'Please upload a new screenshot and try again.';
  } else if (errorCode === 'ALREADY_COMPLETED') {
    explanation = 'This review has already been completed.';
    hint = 'You can view the results above.';
  } else {
    const errMsg = error || '';
    const isFileError = errMsg.toLowerCase().includes('file') || errMsg.toLowerCase().includes('image') || errMsg.toLowerCase().includes('upload');
    const isNetworkError = errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('connection') || errMsg.toLowerCase().includes('timeout');
    const isServerError = errMsg.toLowerCase().includes('server') || errMsg.toLowerCase().includes('500');
    if (isFileError) {
      explanation = 'There was a problem with your screenshot file.';
      hint = 'Please make sure you upload a valid PNG, JPG, or WEBP image that is under 10MB.';
    } else if (isNetworkError) {
      explanation = 'A network connection issue occurred.';
      hint = 'Please check your internet connection and try again.';
    } else if (isServerError) {
      explanation = 'Our servers are experiencing issues right now.';
      hint = 'Please try again in a few minutes.';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--error-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AlertCircle size={28} style={{ color: 'var(--error)' }} />
      </div>

      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          We couldn't complete your UI analysis.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.5 }}>
          {explanation}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 300, lineHeight: 1.5, marginTop: 4 }}>
          {hint}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} className="btn-secondary" style={{ fontSize: 13 }}>
          Back to Review
        </button>
        <button onClick={onRetry} disabled={retrying} className="btn-primary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {retrying ? <><Loader2 size={12} className="animate-spin" /> Retrying...</> : <><RefreshCw size={12} /> Retry Analysis</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main ReviewPage ────────────────────────────────────────────────────────
export default function ReviewPage() {
  const urlId = window.location.pathname.split('/').filter(Boolean).pop();
  const { id: paramId } = useParams();
  const rawId = paramId !== undefined ? paramId : urlId;
  const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : urlId;

  const { token } = useAuth();
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [rightTab, setRightTab] = useState('issues');
  const [severityFilter, setSeverityFilter] = useState('all');  // all | critical | high | medium | low
  const [sortOrder, setSortOrder] = useState('severity');       // severity | newest | oldest
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [pulsingAnnotationId, setPulsingAnnotationId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  // Annotation that needs to be scrolled into view after the Overview tab renders
  const [pendingAnnotationScroll, setPendingAnnotationScroll] = useState(null);  // annotation id or null

  // Refs for scrolling
  const screenshotRef = useRef(null);
  const issueRefs = useRef({});

  // ─── Load review ───────────────────────────────────────────────────────
  useEffect(() => {
    if (id) loadReview(id);
  }, [id]);

  async function loadReview(targetId) {
    if (!targetId || typeof targetId !== 'string' || targetId === '[object Object]') {
      targetId = window.location.pathname.split('/').filter(Boolean).pop();
    }
    if (!targetId || typeof targetId !== 'string') return;
    setLoading(true);
    setReview(null);
    setErrorMsg('');
    setSelectedAnnotationId(null);
    setSelectedIssueId(null);
    try {
      const data = await api.getReview(targetId, token);
      if (String(targetId) !== String(id)) return;
      setReview(data.review);
    } catch (err) {
      if (String(targetId) !== String(id)) return;
      setErrorMsg(err?.message || 'Failed to load review.');
      setErrorCode(err?.code || '');
    } finally {
      if (String(targetId) !== String(id)) return;
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (!token || retrying) return;
    setRetrying(true);
    setErrorMsg('');
    setReview(prev => prev ? { ...prev, status: 'analyzing' } : null);
    try {
      const response = await api.retryReview(id, token);
      if (response.review) {
        setReview(response.review);
      } else {
        await loadReview(id);
      }
    } catch (err) {
      console.error('Retry failed:', err);
      const msg = err?.message || 'Failed to retry analysis.';
      const code = err?.code || '';
      setErrorMsg(msg);
      setErrorCode(code);
      setReview(prev => prev ? { ...prev, status: 'failed' } : null);
    } finally {
      setRetrying(false);
    }
  }

  // ─── Navigation helpers ────────────────────────────────────────────────
  const annotations = review?.annotations || [];
  const issues = review?.issues || [];

  // Derived: filtered and sorted issues for the right panel
  const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
  const filteredIssues = (() => {
    let result = issues;
    if (severityFilter !== 'all') {
      result = result.filter(iss => (iss.severity || '').toLowerCase() === severityFilter);
    }
    if (sortOrder === 'severity') {
      result = [...result].sort((a, b) => {
        const ord = (s) => SEVERITY_ORDER[(s || '').toLowerCase()] ?? 99;
        return ord(a.severity) - ord(b.severity);
      });
    } else if (sortOrder === 'newest') {
      result = [...result].sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => (a.id || 0) - (b.id || 0));
    }
    return result;
  })();

  // Count per severity for filter badges
  const sevCounts = issues.reduce((acc, iss) => {
    const s = (iss.severity || 'low').toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Find the annotation that belongs to a given issueId
  function findAnnotationByIssueId(issueId) {
    return annotations.find(a => a.issue && a.issue.id === issueId) || null;
  }

  // Find the issue that belongs to a given annotationId
  function findIssueByAnnotationId(annotationId) {
    const ann = annotations.find(a => a.id === annotationId);
    return ann?.issue || null;
  }

  // Get the display number (1-based) for an annotation, by its position in the
  // filtered "has coords" list — consistent with the AnnotatedScreenshot pin numbers
  function getAnnotationDisplayNum(annotationId) {
    const hasCoords = (a) => a.x != null || a.y != null;
    const sorted = annotations.filter(hasCoords);
    const idx = sorted.findIndex(a => a.id === annotationId);
    return idx >= 0 ? idx + 1 : null;
  }

  // ─── Pulse effect ──────────────────────────────────────────────────────
  // When an annotation is selected (either direction), trigger a temporary pulse
  function triggerPulse(annotationId) {
    if (!annotationId) return;
    setPulsingAnnotationId(annotationId);
    setTimeout(() => setPulsingAnnotationId(null), 4500);
  }

  // ─── Scroll to annotation ─────────────────────────────────────────────────
  // Two separate effects handle the two scroll scenarios without interfering:
  //
  // Effect 1 — fires when activeTab changes to 'overview'.
  // Reads pendingAnnotationScroll from a ref so cleanup doesn't cancel queued rAFs.
  // Effect 2 — fires when pendingAnnotationScroll changes (already on Overview tab).
  //
  // Using refs (not state) for annId in Effect 1 to prevent cleanup-cancellation
  // of the scroll rAF chain when the user rapidly clicks different cards.
  const pendingAnnIdRef = useRef(null);
  useEffect(() => {
    pendingAnnIdRef.current = pendingAnnotationScroll;
  }, [pendingAnnotationScroll]);

  // Effect 1: Tab switch → scroll screenshot to top, then scroll to annotation
  useEffect(() => {
    if (activeTab !== 'overview') return;
    const annId = pendingAnnIdRef.current;
    if (!annId) return;

    const ann = annotations.find(a => a.id === annId) || null;
    const doScroll = (annToScroll) => {
      if (!annToScroll || (annToScroll.x == null && annToScroll.y == null)) {
        if (screenshotRef.current) {
          screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (screenshotRef.current) {
        screenshotRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      requestAnimationFrame(() => {
        const img = document.querySelector('.annotated-screenshot-img');
        const container = document.querySelector('.annotated-screenshot-scroll');
        if (!img || !container) return;
        const { naturalWidth, naturalHeight } = img;
        if (!naturalWidth || !naturalHeight) return;
        const fractionY = annToScroll.y / naturalHeight;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const topMargin = Math.round((container.clientHeight || window.innerHeight) * 0.30);
        const targetScrollTop = Math.round(fractionY * maxScroll) - topMargin;
        const clamped = Math.max(0, Math.min(maxScroll, targetScrollTop));
        container.scrollTo({ top: clamped, behavior: 'smooth' });
      });
    };
    doScroll(ann);
    // NOTE: we do NOT clear pendingAnnotationScroll here.
    // Effect 2 (or the handler) clears it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Effect 2: pendingAnnotationScroll changed (already on Overview) → scroll to new annotation
  useEffect(() => {
    if (!pendingAnnotationScroll || activeTab !== 'overview') return;
    const ann = annotations.find(a => a.id === pendingAnnotationScroll) || null;
    if (!ann || (ann.x == null && ann.y == null)) {
      if (screenshotRef.current) {
        screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingAnnotationScroll(null);
      return;
    }
    requestAnimationFrame(() => {
      const img = document.querySelector('.annotated-screenshot-img');
      const container = document.querySelector('.annotated-screenshot-scroll');
      if (!img || !container) return;
      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) return;
      const fractionY = ann.y / naturalHeight;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const topMargin = Math.round((container.clientHeight || window.innerHeight) * 0.30);
      const targetScrollTop = Math.round(fractionY * maxScroll) - topMargin;
      const clamped = Math.max(0, Math.min(maxScroll, targetScrollTop));
      container.scrollTo({ top: clamped, behavior: 'smooth' });
    });
    setPendingAnnotationScroll(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnnotationScroll]);

  // ─── Pin click ─────────────────────────────────────────────────────────
  // User clicked a numbered pin on the screenshot
  function handlePinClick(annotationId) {
    const issue = findIssueByAnnotationId(annotationId);
    setSelectedAnnotationId(annotationId);
    if (issue) {
      setSelectedIssueId(issue.id);
      // Scroll the issue card into view in the right panel
      const cardEl = issueRefs.current[issue.id];
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    triggerPulse(annotationId);
  }

  // ─── "View on image" click ─────────────────────────────────────────────
  // User clicked "View on image" on an issue card
  // ─── Navigate to issue from Annotations tab → Overview ─────────────────
  // Both card-body click and "View on image" use this shared function.
  // Sets selected state, switches to Overview tab, and queues annotation scroll.
  function navigateToIssueAnnotation(issueId) {
    const ann = findAnnotationByIssueId(issueId);
    const hasCoords = ann && (ann.x != null || ann.y != null);

    setSelectedIssueId(issueId);
    if (ann) setSelectedAnnotationId(ann.id);

    // Always switch to Overview (even if no coords — shows screenshot)
    const wasAlreadyOverview = activeTab === 'overview';
    setActiveTab('overview');

    if (hasCoords) {
      // Queue the annotation-specific scroll (handled by scroll effects)
      setPendingAnnotationScroll(ann.id);
      triggerPulse(ann.id);
    } else if (!wasAlreadyOverview && screenshotRef.current) {
      // No coords: just scroll the screenshot section into view
      screenshotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── "View on image" button on issue card ────────────────────────────────
  function handleIssueViewAnnotation(issueId) {
    navigateToIssueAnnotation(issueId);
  }

  // ─── Issue card body click ───────────────────────────────────────────────
  function handleIssueHighlight(issueId) {
    navigateToIssueAnnotation(issueId);
  }

  // ─── Derived state ───────────────────────────────────────────────────────
  const scores = review?.scores || {};
  const isCompleted = review?.status === 'completed' && (scores.overall > 0 || scores.overall === 0);
  const isAnalyzing = review?.status === 'analyzing' || review?.status === 'pending';
  const isFailed = review?.status === 'failed';
  const overall = scores.overall;

  const scoreEntries = Object.entries(SCORE_EXPLANATIONS).filter(([key]) => scores[key] != null && scores[key] > 0);

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading review...</p>
    </div>
  );

  // ─── Review load error ───────────────────────────────────────────────────
  if (errorMsg && !review) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={24} style={{ color: 'var(--error)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{errorMsg}</p>
      <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
    </div>
  );

  // ─── No review ───────────────────────────────────────────────────────────
  if (!review) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <AlertCircle size={24} style={{ color: 'var(--error)' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Review not found</p>
      <Link to="/dashboard" className="btn-primary" style={{ fontSize: 12 }}>Back to Dashboard</Link>
    </div>
  );

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <div className="review-topbar">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-icon"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={15} />
        </button>
        <div className="review-breadcrumb">
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {review.project_name || 'Project'} / {review.page_goal ? `"${review.page_goal}"` : 'Page Review'}
          </span>
        </div>
        {isCompleted && overall != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: getScoreColor(overall) }}>{overall}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/100</span>
          </div>
        )}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: 11, height: 32, flexShrink: 0 }}
        >
          <Plus size={12} /> New Review
        </button>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '0 16px' }}>
        {[
          { key: 'overview',     label: 'Overview' },
          { key: 'annotations',  label: `Annotations${annotations.length > 0 ? ` (${annotations.length})` : ''}` },
          { key: 'suggestions',  label: `Suggestions${(review?.suggestions || []).length > 0 ? ` (${(review?.suggestions || []).length})` : ''}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Main layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 53px)' }}>
        {/* Left: main content */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
          <div style={{ padding: '20px 16px', maxWidth: 760 }}>

            {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* How to read this report */}
                {isCompleted && <ReportGuide reviewId={review?.id} />}

                {/* Screenshot with annotations */}
                {review.screenshot_url && (
                  <AnnotatedScreenshot
                    screenshotUrl={review.screenshot_url}
                    annotations={annotations}
                    selectedAnnotationId={selectedAnnotationId}
                    pulsingAnnotationId={pulsingAnnotationId}
                    onAnnotationClick={handlePinClick}
                    onRequestScroll={null}
                  />
                )}

                {/* No screenshot */}
                {!review.screenshot_url && (
                  <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
                    <ImageIcon size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No screenshot available</p>
                  </div>
                )}

                {/* Overall Score Card */}
                <div className="card" style={{ padding: '20px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Overall Score
                  </p>

                  {isCompleted && overall != null ? (
                    <>
                      {/* Circular score */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <div style={{
                          width: 88, height: 88, borderRadius: '50%',
                          background: getScoreBg(overall),
                          border: `4px solid ${getScoreColor(overall)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexDirection: 'column',
                        }}>
                          <span style={{ fontSize: 30, fontWeight: 800, color: getScoreColor(overall), lineHeight: 1 }}>
                            {overall}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: getScoreColor(overall),
                          background: getScoreBg(overall),
                          padding: '3px 12px', borderRadius: 20,
                        }}>
                          {getScoreLabel(overall)}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                        {getScoreSummary(overall)}
                      </p>
                    </>
                  ) : isAnalyzing ? (
                    <AILoadingState />
                  ) : isFailed ? (
                    <AIErrorState
                      error={errorMsg}
                      errorCode={errorCode}
                      onRetry={handleRetry}
                      onBack={() => navigate('/dashboard')}
                      retrying={retrying}
                    />
                  ) : (
                    <div style={{ padding: '20px 0' }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for analysis...</p>
                    </div>
                  )}
                </div>

                {/* Score Breakdown */}
                {isCompleted && scoreEntries.length > 0 && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                      Score Breakdown
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {scoreEntries.map(([key, info]) => {
                        const val = scores[key];
                        const status = val >= 80 ? 'good' : val >= 60 ? 'improvement' : 'attention';
                        return (
                          <div key={key} style={{
                            padding: '12px 14px', borderRadius: 9,
                            background: 'var(--background)',
                            border: '1px solid var(--border)',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {info.label}
                                </span>
                                <button
                                  className="btn-icon"
                                  style={{ width: 16, height: 16 }}
                                  aria-label={`What is ${info.label}?`}
                                  title={info.desc}
                                >
                                  <HelpCircle size={11} style={{ color: 'var(--text-muted)' }} />
                                </button>
                              </div>
                              <span style={{ fontSize: 16, fontWeight: 800, color: getScoreColor(val), lineHeight: 1 }}>
                                {val}
                              </span>
                            </div>
                            <div className="progress-bar" style={{ height: 5, marginBottom: 5 }}>
                              <div
                                className={`progress-bar-fill ${val >= 80 ? 'success' : val >= 60 ? 'warning' : 'error'}`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                              {info.desc}
                            </p>
                            <p style={{ fontSize: 10, color: getScoreColor(val), fontWeight: 500, marginTop: 3 }}>
                              {SCORE_STATUS[status]}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {isCompleted && scores.summary && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      AI Summary
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {scores.summary}
                    </p>
                  </div>
                )}

                {/* Strengths / Key Findings */}
                {isCompleted && scores.strengths && scores.strengths.length > 0 && (
                  <div className="card" style={{ padding: '16px 18px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lightbulb size={14} style={{ color: 'var(--warning)' }} />
                      Key Findings
                    </p>
                    <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
                      {scores.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── ANNOTATIONS TAB ────────────────────────────────────── */}
            {activeTab === 'annotations' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Severity legend */}
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Severity:</span>
                  {[
                    { label: 'Critical', color: 'var(--error)',   bg: 'var(--error-light)' },
                    { label: 'High',      color: 'var(--warning)', bg: 'var(--warning-light)' },
                    { label: 'Medium',    color: 'var(--secondary)',bg: 'var(--primary-light)' },
                    { label: 'Low',       color: 'var(--text-muted)',bg: 'var(--hover)' },
                  ].map(({ label, color, bg }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: bg, color, textTransform: 'uppercase' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {label === 'Critical' ? 'Fix now' :
                         label === 'High'      ? 'Next sprint' :
                         label === 'Medium'    ? 'Nice to have' : 'Polish'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Show visual annotation notice */}
                {annotations.some(a => a.x != null || a.y != null) && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary)20',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <MousePointerClick size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--primary)' }}>
                      Click any numbered pin on the screenshot above (Overview tab) to jump to that issue.
                    </span>
                  </div>
                )}

                {annotations.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--success-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <CheckCircle2 size={26} style={{ color: 'var(--success)' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      No issues detected
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto' }}>
                      The AI did not identify any specific issues with your interface. Great work!
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {annotations.length} issue{annotations.length !== 1 ? 's' : ''} found — sorted by severity
                    </p>
                    {annotations.map((ann, i) => {
                      const issue = ann.issue || {};
                      const hasCoords = ann.x != null || ann.y != null;
                      const sevColor = issue.severity === 'critical' ? 'var(--error)'
                        : issue.severity === 'high' ? 'var(--warning)'
                        : issue.severity === 'medium' ? 'var(--secondary)'
                        : 'var(--text-muted)';
                      const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
                        : issue.severity === 'high' ? 'var(--warning-light)'
                        : issue.severity === 'medium' ? 'var(--primary-light)'
                        : 'var(--hover)';
                      const isSelected = selectedAnnotationId === ann.id;
                      const displayNum = i + 1;

                      return (
                        <div
                          key={ann.id}
                          className="card"
                          style={{
                            padding: '14px 16px',
                            border: isSelected ? `2px solid ${sevColor}` : '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s',
                            boxShadow: isSelected ? `0 0 0 3px ${sevColor}20` : 'none',
                          }}
                          onClick={() => handlePinClick(ann.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            {/* Number badge */}
                            <div style={{
                              width: 28, height: 28, borderRadius: 7,
                              background: sevBg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, marginTop: 1,
                              fontSize: 11, fontWeight: 700, color: sevColor,
                            }}>
                              {displayNum}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Title + severity */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {issue.title || 'Issue'}
                                </p>
                                {issue.severity && (
                                  <span style={{
                                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                                    padding: '2px 6px', borderRadius: 4,
                                    background: sevBg, color: sevColor,
                                  }}>
                                    {issue.severity}
                                  </span>
                                )}
                                {!hasCoords && (
                                  <span style={{
                                    fontSize: 9, fontWeight: 600,
                                    padding: '2px 6px', borderRadius: 4,
                                    background: 'var(--warning-light)', color: 'var(--warning)',
                                  }}>
                                    Location unavailable
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              {issue.description && (
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: issue.recommendation ? 8 : 0 }}>
                                  {issue.description}
                                </p>
                              )}

                              {/* Recommendation */}
                              {issue.recommendation && (
                                <div style={{
                                  marginTop: 8, padding: '8px 10px', borderRadius: 6,
                                  background: 'var(--primary-light)',
                                  border: '1px solid var(--primary)20',
                                }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    Recommended fix
                                  </p>
                                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {issue.recommendation}
                                  </p>
                                </div>
                              )}

                              {/* No coordinates notice */}
                              {!hasCoords && (
                                <div style={{
                                  marginTop: 8, padding: '6px 10px', borderRadius: 6,
                                  background: 'var(--warning-light)',
                                  display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                  <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                                  <span style={{ fontSize: 10, color: 'var(--warning)' }}>
                                    AI identified this issue but a precise visual location could not be determined.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* ── SUGGESTIONS TAB ────────────────────────────────────── */}
            {activeTab === 'suggestions' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Priority guide */}
                {issues.length > 0 && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    display: 'flex', gap: 16, flexWrap: 'wrap',
                  }}>
                    {[
                      { label: 'Critical', color: 'var(--error)', bg: 'var(--error-light)', text: 'Fix before shipping' },
                      { label: 'High', color: 'var(--warning)', bg: 'var(--warning-light)', text: 'Fix in next sprint' },
                      { label: 'Medium', color: 'var(--secondary)', bg: 'var(--primary-light)', text: 'Nice to have' },
                    ].map(({ label, color, bg, text }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color, background: bg, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>
                          {label}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {issues.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <Lightbulb size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      No suggestions yet
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto' }}>
                      AI recommendations will appear after analysis is completed.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {issues.length} recommendation{issues.length !== 1 ? 's' : ''} — click any to see details
                    </p>
                    {issues.map((sug, i) => (
                      <SuggestionCard
                        key={sug.id || i}
                        suggestion={sug}
                        index={i}
                        isSelected={selectedIssueId === sug.id}
                        onSelect={(idx) => setSelectedIssueId(prev => prev === sug.id ? null : sug.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          {/* Actions */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Review Actions</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleRetry}
                disabled={retrying || isAnalyzing}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34 }}
              >
                {retrying ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {retrying ? 'Retrying...' : 'Retry'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: 12, height: 34 }}
              >
                <Plus size={12} /> New
              </button>
            </div>
          </div>

          {/* Issues / Tips tabs */}
          <div style={{ padding: '0 14px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              {[
                { key: 'issues', label: `Issues (${severityFilter !== 'all' ? `${filteredIssues.length}/${issues.length}` : issues.length})` },
                { key: 'tips',  label: `Tips (${issues.length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setRightTab(t.key)}
                  className={`tab-btn ${rightTab === t.key ? 'active' : ''}`}
                  style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {rightTab === 'issues' && (
              <div style={{ paddingBottom: 16 }}>
                {/* Filter bar */}
                {issues.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {/* Severity filters */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                      {[
                        { key: 'all',      label: `All (${issues.length})` },
                        { key: 'critical', label: `Critical${sevCounts.critical ? ` (${sevCounts.critical})` : ''}`,  color: 'var(--error)' },
                        { key: 'high',     label: `High${sevCounts.high ? ` (${sevCounts.high})` : ''}`,         color: 'var(--warning)' },
                        { key: 'medium',   label: `Medium${sevCounts.medium ? ` (${sevCounts.medium})` : ''}`,     color: 'var(--secondary)' },
                        { key: 'low',      label: `Low${sevCounts.low ? ` (${sevCounts.low})` : ''}`,            color: 'var(--text-muted)' },
                      ].map(({ key, label, color }) => (
                        <button
                          key={key}
                          onClick={() => setSeverityFilter(key)}
                          style={{
                            padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                            fontSize: 10, fontWeight: 600,
                            background: severityFilter === key
                              ? (color || 'var(--primary)')
                              : 'var(--hover)',
                            color: severityFilter === key
                              ? '#fff'
                              : (color || 'var(--text-secondary)'),
                            transition: 'all 0.15s',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* Sort control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sort:</span>
                      {[
                        { key: 'severity', label: 'Most severe' },
                        { key: 'newest',   label: 'Newest first' },
                        { key: 'oldest',   label: 'Oldest first' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setSortOrder(key)}
                          style={{
                            padding: '2px 7px', borderRadius: 4, border: 'none', cursor: 'pointer',
                            fontSize: 10, fontWeight: 500,
                            background: sortOrder === key ? 'var(--primary-light)' : 'transparent',
                            color: sortOrder === key ? 'var(--primary)' : 'var(--text-muted)',
                            textDecoration: sortOrder === key ? 'underline' : 'none',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredIssues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--success-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>
                      {severityFilter === 'all' ? 'All clear!' : 'None found'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {severityFilter === 'all'
                        ? 'No issues detected in this review.'
                        : `No ${severityFilter} issues found.`}
                    </p>
                    {severityFilter !== 'all' && (
                      <button
                        onClick={() => setSeverityFilter('all')}
                        style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}
                      >
                        Show all issues
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredIssues.map((iss) => {
                      const matchingAnn = findAnnotationByIssueId(iss.id);
                      const displayNum = matchingAnn ? getAnnotationDisplayNum(matchingAnn.id) : null;
                      const isSelected = selectedIssueId === iss.id;

                      return (
                        <div
                          key={iss.id}
                          ref={el => { if (el) issueRefs.current[iss.id] = el; }}
                        >
                          <IssueCard
                            issue={iss}
                            issueId={iss.id}
                            annotationId={matchingAnn?.id || null}
                            displayNum={displayNum}
                            isSelected={isSelected}
                            onViewAnnotation={() => handleIssueViewAnnotation(iss.id)}
                            onHighlight={() => handleIssueHighlight(iss.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {rightTab === 'tips' && (
              <div style={{ paddingBottom: 16 }}>
                {issues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <Lightbulb size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tips yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {issues.slice(0, 5).map((iss) => {
                      const matchingAnn = findAnnotationByIssueId(iss.id);
                      const displayNum = matchingAnn ? getAnnotationDisplayNum(matchingAnn.id) : null;
                      const isSelected = selectedIssueId === iss.id;
                      return (
                        <div
                          key={iss.id}
                          ref={el => { if (el) issueRefs.current[`tip-${iss.id}`] = el; }}
                        >
                          <IssueCard
                            issue={iss}
                            issueId={iss.id}
                            annotationId={matchingAnn?.id || null}
                            displayNum={displayNum}
                            isSelected={isSelected}
                            onViewAnnotation={() => handleIssueViewAnnotation(iss.id)}
                            onHighlight={() => handleIssueHighlight(iss.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
