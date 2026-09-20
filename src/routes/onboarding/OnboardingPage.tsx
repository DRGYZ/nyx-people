import React, { useEffect, useState, useRef } from 'react';
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

const VALID_ONBOARDING_TABS: readonly OnboardingTab[] = [
  'all',
  'attention',
  'starting-soon',
  'complete',
];

export const OnboardingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve valid tab
  const rawView = searchParams.get('view');
  const rawTab = searchParams.get('tab');
  const requestedTab = (rawView || rawTab || 'all') as OnboardingTab;
  const validTab: OnboardingTab = VALID_ONBOARDING_TABS.includes(requestedTab)
    ? requestedTab
    : 'all';

  // Canonicalize malformed view / legacy ?tab= in URL
  useEffect(() => {
    const isLegacyTab = searchParams.has('tab');
    const isInvalidView = rawView !== null && !VALID_ONBOARDING_TABS.includes(rawView as any);
    const isDefaultWithView = rawView === 'all';

    if (isLegacyTab || isInvalidView || isDefaultWithView) {
      const canonical = new URLSearchParams();
      if (validTab !== 'all') {
        canonical.set('view', validTab);
      }
      setSearchParams(canonical, { replace: true });
    }
  }, [rawView, searchParams, validTab, setSearchParams]);

  const [data, setData] = useState<GetOnboardingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Request race guard
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = async (tabToLoad: OnboardingTab) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchOnboardingList(tabToLoad, controller.signal);
      if (abortControllerRef.current === controller) {
        setData(res);
      }
    } catch (err: any) {
      if (abortControllerRef.current === controller && err?.name !== 'AbortError') {
        setError(err.message || 'Failed to load onboarding workflows');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData(validTab);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [validTab]);

  const handleTabChange = (nextTab: OnboardingTab) => {
    const nextParams = new URLSearchParams();
    if (nextTab !== 'all') {
      nextParams.set('view', nextTab);
    }
    // Deliberate tab selection -> PUSH to browser history
    setSearchParams(nextParams, { replace: false });
  };

  return (
    <div className={styles.pageContainer}>
      <OnboardingHeader />

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
            <div className={styles.list} aria-label="Onboarding employee workflows">
              {data.data.map((item) => (
                <OnboardingCard key={item.employee.id} summary={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
