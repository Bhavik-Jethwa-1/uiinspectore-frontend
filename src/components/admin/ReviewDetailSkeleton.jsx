import { Skeleton, SkeletonLine, SkeletonCard } from './Skeleton';

/**
 * Skeleton loader for AdminReviewDetailPage.
 */
export default function ReviewDetailSkeleton() {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Back button */}
      <Skeleton width={140} height={32} radius="8px" style={{ marginBottom: 16 }} />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Skeleton width={40} height={12} />
        <Skeleton width={10} height={12} />
        <Skeleton width={60} height={12} />
        <Skeleton width={10} height={12} />
        <Skeleton width={50} height={12} />
      </div>

      {/* Header card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <Skeleton width={70} height={24} radius={9999} />
                <Skeleton width={80} height={24} radius={9999} />
              </div>
              <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} />
            </div>
            <Skeleton width={100} height={36} radius="8px" />
          </div>
          {/* Meta links */}
          <div style={{ display: 'flex', gap: 16 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} width={80} height={12} />)}
          </div>
        </div>

        {/* Score bars */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <Skeleton width="20%" height={14} style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Skeleton width="40%" height={10} />
                  <Skeleton width="20%" height={10} />
                </div>
                <Skeleton height={6} radius={9999} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {['Overview', 'Issues', 'Annotations'].map((_, i) => (
          <div key={i} style={{ padding: '10px 20px', borderBottom: i === 0 ? '2px solid var(--primary)' : '2px solid transparent' }}>
            <Skeleton width={70} height={14} />
          </div>
        ))}
      </div>

      {/* Overview content */}
      <SkeletonCard style={{ marginBottom: 16 }}>
        <Skeleton width="30%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonLine lines={4} gap={10} />
      </SkeletonCard>

      <SkeletonCard>
        <Skeleton width="30%" height={16} style={{ marginBottom: 12 }} />
        <SkeletonLine lines={3} gap={10} />
      </SkeletonCard>
    </div>
  );
}
