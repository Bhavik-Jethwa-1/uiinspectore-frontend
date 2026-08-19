import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * "Understanding Your Report" Guide
 * Shown prominently on first view of a completed review.
 */
export function ReportGuide({ reviewId }) {
  const storageKey = `review_guide_${reviewId || 'default'}_dismissed`;
  const wasDismissed = (() => {
    try { return localStorage.getItem(storageKey) === 'true'; } catch { return false; }
  })();

  const [open, setOpen] = useState(!wasDismissed);
  const [dismissed, setDismissed] = useState(wasDismissed);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
    try { localStorage.setItem(storageKey, 'true'); } catch {}
  };

  // Collapsed state
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
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      marginBottom: 14,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={15} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Understanding your report
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'var(--primary-light)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, color: 'var(--primary)',
            display: 'flex', alignItems: 'center', gap: 4,
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
            { label: 'Medium',    color: 'var(--warning)',  bg: 'var(--warning-light)',desc: 'Problems that improve usability when fixed, but are not urgent.' },
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
