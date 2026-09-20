import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Check } from 'lucide-react';
import { OnboardingEmployeeSummary } from '@/data/contracts';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import styles from './OnboardingCard.module.css';

interface OnboardingCardProps {
  summary: OnboardingEmployeeSummary;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({ summary }) => {
  const { employee, progress, urgency, needsAttention } = summary;
  const fullName = `${employee.person.firstName} ${employee.person.lastName}`;
  const initials = `${employee.person.firstName[0] || ''}${employee.person.lastName[0] || ''}`.toUpperCase();

  const cardStatusClass = progress.isComplete
    ? styles.cardComplete
    : needsAttention
    ? styles.cardAttention
    : '';

  const urgencyClass = progress.isComplete
    ? styles.urgencyComplete
    : needsAttention
    ? styles.urgencyUrgent
    : '';

  return (
    <article
      className={`${styles.card} ${cardStatusClass}`}
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
            <span className={styles.roleText}>{employee.employment.jobTitle}</span>
            <DepartmentBadge department={employee.employment.department} />
          </div>

          <div className={styles.metaRow}>
            <span>{employee.employment.location}</span>
            <span>·</span>
            <span>Starts {employee.employment.startDate}</span>
            <span
              className={`${styles.urgencyBadge} ${urgencyClass}`}
              aria-label={`Status: ${urgency}`}
            >
              {progress.isComplete ? (
                <>
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                  <span>Ready</span>
                </>
              ) : needsAttention ? (
                <>
                  <AlertCircle size={12} aria-hidden="true" />
                  <span>{urgency}</span>
                </>
              ) : (
                <span>{urgency}</span>
              )}
            </span>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressMeta}>
              <span className={`${styles.progressFraction} tabular-nums`}>
                {progress.completed} of {progress.total} complete
              </span>
              <span className="tabular-nums">({progress.percent}%)</span>
            </div>

            <div
              className={styles.progressBarContainer}
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Onboarding progress for ${fullName}: ${progress.completed} of ${progress.total} tasks completed`}
            >
              <div
                className={`${styles.progressBarFill} ${
                  progress.isComplete ? styles.progressBarComplete : ''
                }`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            {!progress.isComplete && summary.remainingTasks.length > 0 && (
              <div className={styles.remainingTagsList}>
                <span className={styles.remainingLabel}>Pending:</span>
                {summary.remainingTasks.map((taskTitle) => (
                  <span key={taskTitle} className={styles.taskTag}>
                    {taskTitle}
                  </span>
                ))}
              </div>
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
          <span>Open checklist</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
