import React, { useEffect, useState } from 'react';
import { OverviewData } from '@/domain/overview';
import { fetchOverview } from '@/data/api-client';
import { OverviewHeader } from '@/features/overview/components/OverviewHeader';
import { NeedsAttentionSection } from '@/features/overview/components/NeedsAttentionSection';
import { UpcomingStartsSection } from '@/features/overview/components/UpcomingStartsSection';
import { WorkforceSnapshotSection } from '@/features/overview/components/WorkforceSnapshotSection';
import { RecentlyUpdatedSection } from '@/features/overview/components/RecentlyUpdatedSection';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './OverviewPage.module.css';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'We could not load the overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <OverviewHeader />

      {isLoading && (
        <div className={styles.loadingGrid} role="status" aria-label="Loading overview">
          <div className={styles.loadingCol}>
            <div className={styles.loadingCard}>
              <Skeleton width="45%" height={24} />
              <Skeleton width="100%" height={80} />
            </div>
            <div className={styles.loadingCard}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="100%" height={60} />
              <Skeleton width="100%" height={60} />
            </div>
          </div>
          <div className={styles.loadingCol}>
            <div className={styles.loadingCard}>
              <Skeleton width="50%" height={24} />
              <Skeleton width="100%" height={100} />
            </div>
            <div className={styles.loadingCard}>
              <Skeleton width="50%" height={24} />
              <Skeleton width="100%" height={140} />
            </div>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.errorBanner} role="alert">
          <p>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className={styles.overviewGrid}>
          <div className={styles.mainColumn}>
            <NeedsAttentionSection items={data.attention} />
            <UpcomingStartsSection items={data.upcomingStarts} />
          </div>

          <div className={styles.sideColumn}>
            <WorkforceSnapshotSection snapshot={data.snapshot} />
            <RecentlyUpdatedSection items={data.recentlyUpdated} />
          </div>
        </div>
      )}
    </div>
  );
};
