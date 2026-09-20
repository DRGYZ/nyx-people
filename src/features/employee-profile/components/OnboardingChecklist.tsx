import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { OnboardingDetails } from '@/domain/employee';
import styles from './OnboardingChecklist.module.css';

interface OnboardingChecklistProps {
  onboarding: OnboardingDetails;
  employeeId?: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  onboarding,
  employeeId,
}) => {
  return (
    <div className={styles.card} aria-labelledby="onboarding-heading">
      <div className={styles.header}>
        <h2 id="onboarding-heading" className={styles.title}>
          Onboarding
        </h2>
        <span className={`${styles.progressText} tabular-nums`}>
          {onboarding.completedTasks} of {onboarding.totalTasks} complete
        </span>
      </div>

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

      {employeeId && (
        <div className={styles.actionFooter}>
          <Link
            to={`/employees/${employeeId}/onboarding`}
            className={styles.manageLink}
            aria-label="Manage onboarding checklist"
          >
            <span>Manage checklist</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
};
