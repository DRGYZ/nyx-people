import React from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { OnboardingTab } from '@/domain/onboarding';
import styles from './OnboardingEmptyState.module.css';

interface OnboardingEmptyStateProps {
  tab: OnboardingTab;
  onResetToAll?: () => void;
}

export const OnboardingEmptyState: React.FC<OnboardingEmptyStateProps> = ({
  tab,
  onResetToAll,
}) => {
  let title = 'No onboardings found';
  let description = 'There are currently no employees in this view.';
  let isPositive = false;

  if (tab === 'attention') {
    title = 'All onboardings on track';
    description = 'No employees have urgent outstanding tasks approaching their start date.';
    isPositive = true;
  } else if (tab === 'starting-soon') {
    title = 'No upcoming starters';
    description = 'No employees are scheduled to start within the next 14 days.';
  } else if (tab === 'complete') {
    title = 'No fully completed onboardings yet';
    description = 'All active cohort members still have open readiness tasks.';
  }

  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.iconWrapper} aria-hidden="true">
        {isPositive ? <CheckCircle2 size={22} color="#059669" /> : <ClipboardList size={22} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {tab !== 'all' && onResetToAll && (
        <button type="button" className={styles.resetButton} onClick={onResetToAll}>
          View all onboardings
        </button>
      )}
    </div>
  );
};
