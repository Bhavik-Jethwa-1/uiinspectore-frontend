// ─── Priority Badge Helper ───────────────────────────────────────────────────
export function getPriorityStyle(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes('critical') || p.includes('high')) return { bg: 'var(--error-light)', color: 'var(--error)', label: p.includes('critical') ? 'Critical' : 'High' };
  if (p.includes('medium')) return { bg: 'var(--warning-light)', color: 'var(--warning)', label: 'Medium' };
  return { bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Low' };
}

// ─── Score Color / Label Helpers ────────────────────────────────────────────
export function getScoreColor(v) {
  if (!v && v !== 0) return 'var(--text-muted)';
  if (v >= 80) return 'var(--success)';
  if (v >= 60) return 'var(--warning)';
  return 'var(--error)';
}

export function getScoreBg(v) {
  if (v == null) return 'var(--hover)';
  if (v >= 80) return 'var(--success-light)';
  if (v >= 60) return 'var(--warning-light)';
  return 'var(--error-light)';
}

export function getScoreLabel(v) {
  if (v == null) return 'No data';
  if (v >= 90) return 'Excellent';
  if (v >= 80) return 'Good';
  if (v >= 65) return 'Average';
  if (v >= 50) return 'Below Average';
  return 'Needs work';
}

export function getScoreSummary(v) {
  if (v == null) return 'No score data available yet.';
  if (v >= 90) return 'Outstanding UI quality. Your interface is among the best-designed.';
  if (v >= 80) return 'Your interface is well-designed with minor opportunities for improvement.';
  if (v >= 65) return 'Your interface is usable but has several areas that could be improved for a better user experience.';
  if (v >= 50) return 'Your interface needs attention. Several significant usability issues were detected.';
  return 'Significant usability issues detected. Prioritizing fixes will greatly improve the user experience.';
}

// ─── Score Category Explanations ───────────────────────────────────────────
export const SCORE_EXPLANATIONS = {
  visualHierarchy: { label: 'Visual Hierarchy', desc: 'How easily users can identify the most important elements on the page.' },
  clarity:         { label: 'Readability',       desc: 'How clear and easy-to-read the content and text appear.' },
  accessibility:   { label: 'Accessibility',     desc: 'How usable the interface is for people with disabilities or using assistive tools.' },
  consistency:     { label: 'Consistency',       desc: 'How consistently design patterns, colors, and interactions are applied throughout.' },
  layout:          { label: 'Layout',            desc: 'How well the elements are arranged, spaced, and balanced on the page.' },
  typography:      { label: 'Typography',        desc: 'How readable, well-organized, and appropriately sized the text is.' },
  ux:              { label: 'UX',               desc: 'Overall user experience quality, flow, and intuitiveness of the interface.' },
  performance:     { label: 'Performance',      desc: 'How fast the page loads and responds to user interactions.' },
  seo:             { label: 'SEO',              desc: 'How well the page is optimized for search engines and discoverability.' },
};

export const SCORE_STATUS = {
  good:         'Strong — this area is working well.',
  improvement:  'Room for improvement — consider addressing this.',
  attention:    'Needs attention — prioritize fixing this.',
};

// ─── Severity Order for sorting ───────────────────────────────────────────────
export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
