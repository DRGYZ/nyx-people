import React, { useRef } from 'react';
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

  const tabRefs = useRef<Map<OnboardingTab, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab) {
      onTabChange(nextTab.id);
      const btn = tabRefs.current.get(nextTab.id);
      btn?.focus();
    }
  };

  return (
    <div
      className={styles.tabsContainer}
      role="tablist"
      aria-label="Onboarding workspace filter views"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            id={`onboarding-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`onboarding-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
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
