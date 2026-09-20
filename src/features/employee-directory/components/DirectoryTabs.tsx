import React from 'react';
import { DirectoryViewTab, DirectoryCounts } from '@/domain/employee';
import styles from './DirectoryTabs.module.css';

interface DirectoryTabsProps {
  activeView: DirectoryViewTab;
  counts: DirectoryCounts;
  onViewChange: (view: DirectoryViewTab) => void;
}

export const DirectoryTabs: React.FC<DirectoryTabsProps> = ({
  activeView,
  counts,
  onViewChange,
}) => {
  const tabs: Array<{ id: DirectoryViewTab; label: string; count: number }> = [
    { id: 'all', label: 'All employees', count: counts.all },
    { id: 'new-starters', label: 'New starters', count: counts.newStarters },
    { id: 'onboarding', label: 'Onboarding', count: counts.onboarding },
    { id: 'contractors', label: 'Contractors', count: counts.contractors },
  ];

  return (
    <nav className={styles.tabsContainer} aria-label="Employee directory views">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${isActive ? styles.active : ''}`}
            onClick={() => onViewChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{tab.label}</span>
            <span className={`${styles.tabCount} tabular-nums`}>({tab.count})</span>
          </button>
        );
      })}
    </nav>
  );
};
