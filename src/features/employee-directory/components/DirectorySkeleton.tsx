import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './DirectorySkeleton.module.css';

interface DirectorySkeletonProps {
  rows?: number;
}

export const DirectorySkeleton: React.FC<DirectorySkeletonProps> = ({ rows = 10 }) => {
  return (
    <div className={styles.skeletonTable} aria-busy="true" aria-label="Loading employees">
      <div className={styles.thead}>
        <Skeleton width="18%" height={12} />
        <Skeleton width="18%" height={12} />
        <Skeleton width="14%" height={12} />
        <Skeleton width="12%" height={12} />
        <Skeleton width="14%" height={12} />
        <Skeleton width="16%" height={12} />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.row}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '18%' }}>
            <Skeleton width={3} height={32} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <Skeleton width="75%" height={14} />
              <Skeleton width="90%" height={11} />
            </div>
          </div>
          <Skeleton width="18%" height={14} />
          <Skeleton width="14%" height={20} borderRadius={4} />
          <Skeleton width="12%" height={20} borderRadius={9999} />
          <Skeleton width="14%" height={14} />
          <Skeleton width="16%" height={14} />
        </div>
      ))}
    </div>
  );
};
