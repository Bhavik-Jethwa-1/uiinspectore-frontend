import { Skeleton, SkeletonLine, SkeletonCard } from './Skeleton';

/**
 * Skeleton loader for AdminUserDetailPage.
 * Mirrors the new page layout: breadcrumb + admin-header + tabs + content.
 */
export default function UserDetailSkeleton() {
  return (
    <div>
      {/* Breadcrumb placeholder */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <Skeleton width={40} height={12} />
        <Skeleton width={6} height={12} />
        <Skeleton width={40} height={12} />
        <Skeleton width={6} height={12} />
        <Skeleton width={80} height={12} />
      </div>

      {/* Admin header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton width={36} height={36} radius="50%" />
          <div>
            <Skeleton width={140} height={18} radius="6px" style={{ marginBottom: 6 }} />
            <Skeleton width={220} height={11} radius="6px" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Skeleton width={80} height={32} radius="8px" />
          <Skeleton width={80} height={32} radius="8px" />
          <Skeleton width={36} height={36} radius="8px" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {['Overview', 'Projects', 'Activity', 'Settings'].map((_, i) => (
          <div key={i} style={{
            padding: '10px 16px',
            borderBottom: i === 0 ? '2px solid var(--primary)' : '2px solid transparent',
          }}>
            <Skeleton width={60} height={13} />
          </div>
        ))}
      </div>

      {/* Overview tab: 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <SkeletonCard style={{ padding: '12px 14px' }}>
          <Skeleton width={60} height={10} style={{ marginBottom: 8 }} />
          <Skeleton width={40} height={22} />
        </SkeletonCard>
        <SkeletonCard style={{ padding: '12px 14px' }}>
          <Skeleton width={60} height={10} style={{ marginBottom: 8 }} />
          <Skeleton width={40} height={22} />
        </SkeletonCard>
        <SkeletonCard style={{ padding: '12px 14px' }}>
          <Skeleton width={60} height={10} style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={22} />
        </SkeletonCard>
      </div>

      {/* User info card */}
      <SkeletonCard>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <Skeleton width={100} height={10} />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '9px 16px',
            borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
          }}>
            <Skeleton width="25%" height={12} />
            <Skeleton width="40%" height={12} />
          </div>
        ))}
      </SkeletonCard>
    </div>
  );
}
