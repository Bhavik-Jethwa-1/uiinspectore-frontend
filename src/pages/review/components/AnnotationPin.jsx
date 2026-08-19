import { useState } from 'react';

/**
 * Annotation Pin on Screenshot
 * annotation: { id, x, y, width, height, issue: { id, title, severity, ... } }
 * x, y are passed as PERCENTAGE values (0-100) already converted by parent.
 */
export function AnnotationPin({ annotation, isSelected, isPulsing, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const issue = annotation.issue || {};
  const sevColor = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : issue.severity === 'medium' ? 'var(--warning)'
    : 'var(--text-muted)';
  const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
    : issue.severity === 'high' ? 'var(--warning-light)'
    : issue.severity === 'medium' ? 'var(--warning-light)'
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
