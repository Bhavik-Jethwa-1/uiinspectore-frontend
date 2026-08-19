import { MapPin } from 'lucide-react';
import { getPriorityStyle } from '../reviewHelpers';

/**
 * Issue Card (for right panel)
 * Props:
 *   issue: issue object from API
 *   issueId: stable numeric ID
 *   annotationId: stable numeric ID of matching annotation (null if no coords)
 *   displayNum: 1-based display number shown in the pin
 *   isSelected: whether this issue is currently highlighted
 *   onViewAnnotation: () => void
 *   onHighlight: () => void
 */
export function IssueCard({ issue, issueId, annotationId, displayNum, isSelected, onViewAnnotation, onHighlight }) {
  const sevColor = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : issue.severity === 'medium' ? 'var(--warning)'
    : 'var(--text-muted)';
  const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
    : issue.severity === 'high' ? 'var(--warning-light)'
    : issue.severity === 'medium' ? 'var(--warning-light)'
    : 'var(--hover)';
  const badgeBg = issue.severity === 'critical' ? 'var(--error)'
    : issue.severity === 'high' ? 'var(--warning)'
    : issue.severity === 'medium' ? 'var(--warning)'
    : 'var(--text-muted)';

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
        overflow: 'hidden',
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
