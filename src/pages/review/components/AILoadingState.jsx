import { useState, useEffect } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';

/**
 * AI Processing Loading State
 */
export function AILoadingState() {
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
