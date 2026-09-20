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
          Onboarding progress
        </h2>
        <span className={`${styles.progressText} tabular-nums`}>
          {progress.completed} of {progress.total} complete · {progress.percent}%
        </span>
      </div>

      {onboarding.attentionSummary && (
        <p className={styles.summaryText}>{onboarding.attentionSummary}</p>
      )}

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
          <CheckCircle2 size={18} color="#059669" aria-hidden="true" />
          <div className={styles.successTextGroup}>
            <span className={styles.successTitle}>
              All onboarding tasks complete.
            </span>
            <span className={styles.successSubtitle}>
              Status remains &apos;onboarding&apos; until updated in employee profile.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
