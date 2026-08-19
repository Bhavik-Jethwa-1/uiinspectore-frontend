import { Lightbulb } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';

/**
 * Suggestions Tab Content
 */
export function SuggestionsTab({
  issues,
  selectedIssueId,
  onIssueSelect,
}) {
  return (
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
              onSelect={(idx) => onIssueSelect(sug.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
