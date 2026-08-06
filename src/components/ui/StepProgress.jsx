import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ACCENT } from '../../app/inspector/constants/theme';

// ─── AI Review Steps ─────────────────────────────────────────────────────────
const REVIEW_STEPS = [
  'Upload Complete',
  'Detecting Components',
  'Checking Typography',
  'Checking Colors',
  'Checking Layout',
  'Checking Accessibility',
  'Finding UX Issues',
  'Generating Suggestions',
  'Preparing Report',
];

export function AIReviewProgress({ steps = REVIEW_STEPS, activeStep = -1 }) {
  return (
    <div className="rounded-2xl border p-6 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <Loader2 size={16} className="animate-spin" style={{ color: ACCENT }} />
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          Analyzing Screenshot...
        </span>
      </div>

      <div className="space-y-1">
        {steps.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div key={step} className="flex items-center gap-3 py-1.5">
              {/* Icon */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                  </motion.div>
                ) : active ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={14} style={{ color: ACCENT }} />
                  </motion.div>
                ) : (
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2"
                    style={{ borderColor: 'var(--border)' }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="text-[13px] transition-colors"
                style={{
                  color: done ? '#22c55e' : active ? ACCENT : 'var(--text-muted)',
                  opacity: done || active ? 1 : 0.5,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {step}
              </span>

              {/* Active dot */}
              {active && (
                <motion.span
                  className="ml-auto"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-[10px]" style={{ color: ACCENT }}>●</span>
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {activeStep >= 0 && (
        <div className="pt-3 border-t mt-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Progress</span>
            <span className="text-[11px] font-medium" style={{ color: ACCENT }}>
              {Math.round(((activeStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: ACCENT }}
              initial={{ width: 0 }}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step-by-step reveal (auto-advancing) ───────────────────────────────────
export function AIAutoReviewProgress({ onComplete }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeStep < REVIEW_STEPS.length - 1) {
      const delay = activeStep === -1 ? 600 : Math.random() * 1200 + 600;
      const t = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, delay);
      return () => clearTimeout(t);
    } else if (!done) {
      setDone(true);
      setTimeout(() => onComplete?.(), 600);
    }
  }, [activeStep, done, onComplete]);

  return (
    <AIReviewProgress steps={REVIEW_STEPS} activeStep={activeStep} />
  );
}

// ─── Code Generation Steps ────────────────────────────────────────────────────
const CODE_STEPS = [
  'Generating React Components...',
  'Creating Tailwind Styles...',
  'Optimizing Structure...',
  'Almost Done...',
];

export function CodeGenProgress({ activeStep = 0 }) {
  return (
    <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        <Loader2 size={16} className="animate-spin" style={{ color: ACCENT }} />
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
          Code Generation
        </span>
      </div>

      {/* Code preview skeleton */}
      <div className="rounded-xl p-4 space-y-2 font-mono" style={{ background: 'var(--surface2)' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3"
          >
            <span className="text-[10px] w-5 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
            <div
              className="h-2.5 rounded"
              style={{
                width: `${Math.random() * 40 + 30}%`,
                background: i === activeStep ? ACCENT : 'var(--border)',
                opacity: i <= activeStep ? 1 : 0.3,
                animation: i === activeStep ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Current step */}
      <div className="text-center">
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {CODE_STEPS[activeStep] || CODE_STEPS[CODE_STEPS.length - 1]}
        </span>
        <div className="flex justify-center gap-1 mt-2">
          {[...Array(3)].map((_, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ACCENT }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: ACCENT }}
          animate={{ width: `${((activeStep + 1) / CODE_STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Generic Multi-step Progress ─────────────────────────────────────────────
export function StepProgressBar({ steps = [], currentStep = 0, title = 'Processing...' }) {
  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2">
        <Loader2 size={15} className="animate-spin" style={{ color: ACCENT }} />
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step} className="flex items-center gap-2.5">
              <div className="w-4 h-4 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                ) : active ? (
                  <Loader2 size={12} className="animate-spin" style={{ color: ACCENT }} />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border)' }} />
                )}
              </div>
              <span
                className="text-[12px]"
                style={{ color: done ? '#22c55e' : active ? 'var(--text)' : 'var(--text-muted)', fontWeight: active ? 500 : 400 }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: ACCENT }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
