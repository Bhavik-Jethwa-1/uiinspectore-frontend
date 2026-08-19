import { useState } from 'react';

/**
 * AI Explanation Card (sub-component)
 */
export function AICard({ icon, label, text, color, bg }) {
  const [expanded, setExpanded] = useState(false);
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
