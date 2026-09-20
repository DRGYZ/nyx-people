import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingDetails } from '@/domain/employee';
import styles from './OnboardingChecklist.module.css';

interface OnboardingChecklistProps {
  onboarding: OnboardingDetails;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ onboarding }) => {
  return (
    <div className={styles.card} aria-labelledby="onboarding-heading">
      <div className={styles.header}>
        <h2 id="onboarding-heading" className={styles.title}>
          Onboarding
        </h2>
        <span className={`${styles.progressBadge} tabular-nums`}>
          {onboarding.completedTasks} of {onboarding.totalTasks} complete
        </span>
      </div>

      <p className={styles.subtitle}>Progress toward day-one readiness</p>

      <div className={styles.separator} aria-hidden="true" />

      <div className={styles.timeline} role="list" aria-label="Onboarding readiness checklist">
        {onboarding.tasks.map((task) => (
          <div key={task.id} className={styles.item} role="listitem">
            <div
              className={`${styles.indicator} ${
                task.completed ? styles.completeIndicator : styles.pendingIndicator
              }`}
              aria-label={task.completed ? 'Completed' : 'Incomplete'}
            >
              {task.completed ? (
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              ) : (
                <span className={styles.pendingDot} aria-hidden="true" />
              )}
            </div>

            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>{task.title}</span>
              <span className={styles.itemSubtitle}>{task.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {onboarding.responsiblePartner && (
        <div className={styles.partnerCard}>
          <span className={styles.partnerLabel}>Responsible Partner</span>
          <p className={styles.partnerNote}>{onboarding.responsiblePartner.note}</p>
        </div>
      )}
    </div>
  );
};
