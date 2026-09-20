import React from 'react';
import { OnboardingCounts } from '@/domain/onboarding';
import styles from './OnboardingHeader.module.css';

interface OnboardingHeaderProps {
  counts?: OnboardingCounts;
  totalDepartments?: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ counts }) => {
  return (
    <header className={styles.headerContainer} aria-labelledby="onboarding-page-title">
      <div className={styles.titleRow}>
        <div className={styles.titleArea}>
          <h1 id="onboarding-page-title" className={styles.title}>
            Onboarding
          </h1>
          <p className={styles.subtitle}>
            Operational cohort tracking, readiness milestones, and task completion workflows for all new starters.
          </p>
        </div>
      </div>

      {counts && (
        <div className={styles.metricsGrid} role="region" aria-label="Onboarding metrics overview">
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Pipeline</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{counts.all}</span>
              <span className={styles.metricHint}>employees</span>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.attentionCard}`}>
            <span className={styles.metricLabel}>Needs Attention</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{counts.attention}</span>
              <span className={styles.metricHint}>blocking items</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Starting Soon</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{counts.startingSoon}</span>
              <span className={styles.metricHint}>next 14 days</span>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.completeCard}`}>
            <span className={styles.metricLabel}>Day-One Ready</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{counts.complete}</span>
              <span className={styles.metricHint}>all 6 complete</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
