import { Skeleton, SkeletonLine, SkeletonCard } from './Skeleton';

/**
 * Skeleton loader for AdminProjectDetailPage.
 */
export default function ProjectDetailSkeleton() {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Back button */}
      <Skeleton width={140} height={32} radius="8px" style={{ marginBottom: 16 }} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Skeleton width="40%" height={26} radius="6px" style={{ marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={80} height={22} radius={9999} />
          <Skeleton width={80} height={22} radius={9999} />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} style={{ padding: 14 }}>
            <Skeleton width="40%" height={10} />
            <Skeleton width="30%" height={24} radius="6px" />
          </SkeletonCard>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {['Overview', 'Reviews', 'Activity'].map((_, i) => (
          <div key={i} style={{ padding: '10px 20px', borderBottom: i === 0 ? '2px solid var(--primary)' : '2px solid transparent' }}>
            <Skeleton width={70} height={14} />
          </div>
        ))}
      </div>

      {/* Overview content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <SkeletonCard>
          <SkeletonLine lines={4} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonLine lines={4} />
        </SkeletonCard>
      </div>

      {/* Reviews preview */}
      <SkeletonCard>
        <div style={{ marginBottom: 12 }}>
          <Skeleton width="30%" height={16} />
        </div>
        <SkeletonLine lines={5} gap={12} />
      </SkeletonCard>
    </div>
  );
}
