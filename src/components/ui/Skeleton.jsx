import { motion } from 'framer-motion';

// ─── Base Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className = '', style = {}, ...props }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: 'inherit',
        background: 'var(--surface2)',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          animation: 'shimmer 1.6s infinite',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── Text Skeleton ──────────────────────────────────────────────────────────
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded"
          style={{
            width: i === lines - 1 && lines > 1 ? '70%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

// ─── Avatar / Circle Skeleton ────────────────────────────────────────────────
export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <Skeleton
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// ─── Card Skeleton ───────────────────────────────────────────────────────────
export function SkeletonCard({ className = '' }) {
  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={36} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 rounded" style={{ width: '60%' }} />
          <Skeleton className="h-2 rounded" style={{ width: '40%' }} />
        </div>
      </div>
      <Skeleton className="h-3 rounded" />
      <Skeleton className="h-3 rounded" style={{ width: '85%' }} />
    </div>
  );
}

// ─── Suggestion Card Skeleton ────────────────────────────────────────────────
export function SuggestionSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border p-4 space-y-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 rounded" style={{ width: '55%' }} />
              <Skeleton className="h-2.5 rounded" />
              <Skeleton className="h-2.5 rounded" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border p-4 space-y-3"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3 w-10 rounded" />
            </div>
            <Skeleton className="h-4 rounded" style={{ width: '60%' }} />
            <Skeleton className="h-2 rounded" style={{ width: '40%' }} />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div classamaan="p-4 border-b space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-3 rounded" style={{ width: [60, 80, 50, 40][i] + 'px' }} />
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3 flex-1 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Card Skeleton ───────────────────────────────────────────────────
export function ProjectCardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Skeleton className="w-full h-36 rounded-none" style={{ borderRadius: 0, height: 140 }} />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 rounded" style={{ width: '70%' }} />
            <Skeleton className="h-3 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Screenshot Skeleton ─────────────────────────────────────────────────────
export function ScreenshotSkeleton() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: 'var(--surface2)', minHeight: 200 }}
    >
      {/* Fake UI elements to hint at screenshot */}
      <div className="w-full p-6 space-y-4">
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 flex-1 rounded" style={{ maxWidth: 120 }} />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        {/* Content lines */}
        <Skeleton className="h-3 rounded" />
        <Skeleton className="h-3 rounded" style={{ width: '85%' }} />
        <Skeleton className="h-3 rounded" style={{ width: '65%' }} />
        {/* Fake image */}
        <Skeleton className="h-24 w-full rounded-xl mt-2" />
        {/* More content */}
        <Skeleton className="h-3 rounded" style={{ width: '90%' }} />
        <Skeleton className="h-3 rounded" style={{ width: '75%' }} />
        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Code Skeleton ───────────────────────────────────────────────────────────
export function CodeSkeleton({ lines = 8 }) {
  return (
    <div className="rounded-2xl p-4 space-y-2 font-mono text-[12px]" style={{ background: 'var(--surface2)' }}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-3 w-6 rounded shrink-0" style={{ marginTop: 2 }} />
          <Skeleton
            className="h-3 rounded"
            style={{ width: `${Math.random() * 50 + 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Compare Skeleton ────────────────────────────────────────────────────────
export function CompareSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 rounded" />
        <ScreenshotSkeleton />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 rounded" />
        <ScreenshotSkeleton />
      </div>
    </div>
  );
}

// ─── Settings Skeleton ───────────────────────────────────────────────────────
export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-3 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-3 rounded" style={{ width: '60%' }} />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pulse dot ───────────────────────────────────────────────────────────────
export function PulseDot({ color = 'var(--accent)' }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: color, animation: 'pulse 1.2s ease-in-out infinite' }}
    />
  );
}
