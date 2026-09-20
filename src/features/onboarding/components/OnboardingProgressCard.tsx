import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { OnboardingDetails } from '@/domain/employee';
import { OnboardingProgress } from '@/domain/onboarding';
import styles from './OnboardingProgressCard.module.css';

interface OnboardingProgressCardProps {
  onboarding: OnboardingDetails;
  progress: OnboardingProgress;
}

export const OnboardingProgressCard: React.FC<OnboardingProgressCardProps> = ({
  onboarding,
  progress,
}) => {
  return (
    <div className={styles.card} aria-labelledby="onboarding-progress-heading">
      <div className={styles.topRow}>
        <h2 id="onboarding-progress-heading" className={styles.heading}>
          Day-One Readiness Progress
        </h2>
        <span
          className={`${styles.fractionBadge} ${
            progress.isComplete ? styles.completeBadge : ''
          } tabular-nums`}
        >
          {progress.completed} of {progress.total} complete · {progress.percent}%
        </span>
      </div>

      <p className={styles.summaryText}>
        {onboarding.attentionSummary ||
          `${progress.completed} of ${progress.total} onboarding tasks have been verified for readiness.`}
      </p>

      <div
        className={styles.progressBarContainer}
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Onboarding progress: ${progress.completed} of ${progress.total} completed`}
      >
        <div
          className={`${styles.progressBarFill} ${
            progress.isComplete ? styles.progressBarComplete : ''
          }`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {progress.isComplete && (
        <div className={styles.successBanner} role="status">
          <CheckCircle2 size={20} color="#059669" aria-hidden="true" />
          <div className={styles.successTextGroup}>
            <span className={styles.successTitle}>
              All onboarding tasks complete. Day-one readiness achieved.
            </span>
            <span className={styles.successSubtitle}>
              Employment status remains &apos;onboarding&apos; until explicitly transitioned in employee profile.
            </span>
          </div>
        </div>
      )}

      {onboarding.responsiblePartner && (
        <div className={styles.partnerSection}>
          <span className={styles.partnerLabel}>Responsible Partner</span>
          <p className={styles.partnerNote}>{onboarding.responsiblePartner.note}</p>
        </div>
      )}
    </div>
  );
};
