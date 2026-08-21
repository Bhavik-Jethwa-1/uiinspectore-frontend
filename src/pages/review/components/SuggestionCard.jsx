import { useState } from 'react';
import { ChevronUp, Lightbulb } from 'lucide-react';
import { getPriorityStyle } from '../reviewHelpers';
import { AICard } from './AICard';

/**
 * Suggestion Card
 * suggestion: { id, title, description, severity, priority, recommendation, fix,
 *               steps, problem, why_matters, user_impact, expected_impact, status }
 */
export function SuggestionCard({ suggestion, index, isSelected, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const pStyle = getPriorityStyle(suggestion.priority);
  const sevColor = pStyle.color;
  const sevBg = pStyle.bg;

  const hasFix       = suggestion.recommendation || suggestion.fix || (suggestion.steps && suggestion.steps.length > 0);
  const hasDetails   = suggestion.problem || suggestion.why_matters || suggestion.user_impact || suggestion.expectedImpact;
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
            {suggestion.expectedImpact && (
              <AICard icon="✅" label="Expected impact" text={suggestion.expectedImpact} color="var(--success)" bg="var(--success-light)" />
            )}
          </div>
        )}

        {/* How to fix */}
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
