/**
 * Reusable skeleton block that mimics loading content.
 * @param {number} width  - CSS width value (e.g. "60%", 120, "100%")
 * @param {number} height - CSS height in px
 * @param {string} radius - border-radius CSS value
 */
export function Skeleton({ width = '100%', height = 14, radius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--border) 25%, color-mix(in srgb, var(--border) 60%, var(--surface)) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

/** Thin skeleton line (like a paragraph) */
export function SkeletonLine({ width = '100%', lines = 1, gap = 8 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 && lines > 1 ? '65%' : width} height={12} />
      ))}
    </div>
  );
}

/** Card-shaped skeleton */
export function SkeletonCard({ children, style = {} }) {
  return (
    <div
      className="card"
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...style }}
    >
      {children}
    </div>
  );
}
