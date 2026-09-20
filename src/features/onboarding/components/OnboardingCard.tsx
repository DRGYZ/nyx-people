import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { OnboardingEmployeeSummary } from '@/data/contracts';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import styles from './OnboardingCard.module.css';

interface OnboardingCardProps {
  summary: OnboardingEmployeeSummary;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({ summary }) => {
  const { employee, progress, urgency, needsAttention } = summary;
  const fullName = `${employee.person.firstName} ${employee.person.lastName}`;
  const initials = `${employee.person.firstName[0] || ''}${employee.person.lastName[0] || ''}`.toUpperCase();

  return (
    <article
      className={styles.card}
      aria-labelledby={`employee-${employee.id}-name`}
    >
      <div className={styles.mainInfo}>
        <InitialsAvatar initials={initials} size="md" />

        <div className={styles.contentCol}>
          <div className={styles.headerRow}>
            <Link
              to={`/employees/${employee.id}/onboarding`}
              id={`employee-${employee.id}-name`}
              className={styles.employeeName}
            >
              {fullName}
            </Link>
            <span className={styles.roleText}>
              {employee.employment.jobTitle} · {employee.employment.department}
            </span>
          </div>

          <div className={styles.metaRow}>
            <span className="tabular-nums">Starts {employee.employment.startDate}</span>
            <span aria-hidden="true">·</span>
            <span className={`${styles.progressText} tabular-nums`}>
              {progress.completed} / {progress.total} complete
            </span>
            {needsAttention ? (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.attentionText}>
                  {summary.remainingTasks.length} {summary.remainingTasks.length === 1 ? 'task' : 'tasks'} remaining
                </span>
              </>
            ) : progress.isComplete ? (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.readyText}>Ready</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">·</span>
                <span className={styles.urgencyText}>{urgency}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <Link
          to={`/employees/${employee.id}/onboarding`}
          className={styles.openLink}
          aria-label={`Open onboarding checklist for ${fullName}`}
        >
          <span>View onboarding</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
