import { CheckCircle2, MousePointerClick, AlertTriangle } from 'lucide-react';

/**
 * Annotations Tab Content
 */
export function AnnotationsTab({
  annotations,
  selectedAnnotationId,
  onPinClick,
  onNavigateToIssue,
}) {
  return (
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
              : issue.severity === 'medium' ? 'var(--warning)'
              : 'var(--text-muted)';
            const sevBg = issue.severity === 'critical' ? 'var(--error-light)'
              : issue.severity === 'high' ? 'var(--warning-light)'
              : issue.severity === 'medium' ? 'var(--warning-light)'
              : 'var(--hover)';
            const isSelected = selectedAnnotationId === ann.id;
            const displayNum = issue.id ?? (i + 1);

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
                onClick={() => onPinClick(ann.id)}
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
  );
}
