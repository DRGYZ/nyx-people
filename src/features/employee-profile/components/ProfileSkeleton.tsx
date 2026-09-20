import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div aria-busy="true" aria-label="Loading employee profile">
      {/* Back button skeleton */}
      <Skeleton width={90} height={16} style={{ marginBottom: 20 }} />

      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <Skeleton width={56} height={56} borderRadius={8} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Skeleton width="40%" height={28} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>

      {/* Layout grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Skeleton height={200} borderRadius={6} />
          <Skeleton height={120} borderRadius={6} />
          <Skeleton height={120} borderRadius={6} />
        </div>
        <div>
          <Skeleton height={380} borderRadius={6} />
        </div>
      </div>
    </div>
  );
};
