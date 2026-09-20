import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OnboardingTab } from '@/domain/onboarding';
import { GetOnboardingListResponse } from '@/data/contracts';
import { fetchOnboardingList } from '@/data/api-client';
import { OnboardingHeader } from '@/features/onboarding/components/OnboardingHeader';
import { OnboardingTabs } from '@/features/onboarding/components/OnboardingTabs';
import { OnboardingCard } from '@/features/onboarding/components/OnboardingCard';
import { OnboardingEmptyState } from '@/features/onboarding/components/OnboardingEmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './OnboardingPage.module.css';

export const OnboardingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Support both ?view= and ?tab=, defaulting to 'all'
  const currentTab = (searchParams.get('view') || searchParams.get('tab') || 'all') as OnboardingTab;
  const validTab: OnboardingTab = ['all', 'attention', 'starting-soon', 'complete'].includes(currentTab)
    ? currentTab
    : 'all';

  const [data, setData] = useState<GetOnboardingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (tabToLoad: OnboardingTab) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchOnboardingList(tabToLoad);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load onboarding workflows');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(validTab);
  }, [validTab]);

  const handleTabChange = (nextTab: OnboardingTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextTab === 'all') {
      nextParams.delete('view');
      nextParams.delete('tab');
    } else {
      nextParams.set('view', nextTab);
      nextParams.delete('tab');
    }
    setSearchParams(nextParams);
  };

  return (
    <div className={styles.pageContainer}>
      <OnboardingHeader counts={data?.counts} />

      {data && (
        <OnboardingTabs
          activeTab={validTab}
          counts={data.counts}
          onTabChange={handleTabChange}
        />
      )}

      {isLoading && (
        <div className={styles.loadingList} role="status" aria-label="Loading onboarding list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.loadingCard}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="60%" height={16} />
              <Skeleton width="30%" height={14} />
            </div>
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.errorBanner} role="alert">
          <p>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => loadData(validTab)}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && data && (
        <div
          id={`onboarding-panel-${validTab}`}
          role="tabpanel"
          aria-labelledby={`onboarding-tab-${validTab}`}
          tabIndex={0}
        >
          {data.data.length === 0 ? (
            <OnboardingEmptyState tab={validTab} onResetToAll={() => handleTabChange('all')} />
          ) : (
            <div className={styles.cardsList} role="feed" aria-label="Onboarding employee list">
              {data.data.map((summary) => (
                <OnboardingCard key={summary.employee.id} summary={summary} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
