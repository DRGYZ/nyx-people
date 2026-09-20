import React from 'react';
import { OnboardingTab, OnboardingCounts } from '@/domain/onboarding';
import styles from './OnboardingTabs.module.css';

interface OnboardingTabsProps {
  activeTab: OnboardingTab;
  counts: OnboardingCounts;
  onTabChange: (tab: OnboardingTab) => void;
}

export const OnboardingTabs: React.FC<OnboardingTabsProps> = ({
  activeTab,
  counts,
  onTabChange,
}) => {
  const tabs: Array<{
    id: OnboardingTab;
    label: string;
    count: number;
    badgeStyle?: string;
  }> = [
    { id: 'all', label: 'All onboardings', count: counts.all },
    {
      id: 'attention',
      label: 'Needs attention',
      count: counts.attention,
      badgeStyle: counts.attention > 0 ? styles.attentionBadge : undefined,
    },
    { id: 'starting-soon', label: 'Starting soon', count: counts.startingSoon },
    {
      id: 'complete',
      label: 'Complete',
      count: counts.complete,
      badgeStyle: counts.complete > 0 ? styles.completeBadge : undefined,
    },
  ];

  return (
    <div
      className={styles.tabsContainer}
      role="tablist"
      aria-label="Onboarding workspace filter views"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`onboarding-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`onboarding-panel-${tab.id}`}
            type="button"
            className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            <span
              className={`${styles.badge} ${tab.badgeStyle || ''} tabular-nums`}
              aria-label={`${tab.count} items`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
