import React from 'react';
import { Link } from 'react-router-dom';
import { OverviewSnapshot } from '@/domain/overview';
import styles from './WorkforceSnapshotSection.module.css';

interface WorkforceSnapshotSectionProps {
  snapshot: OverviewSnapshot;
}

export const WorkforceSnapshotSection: React.FC<WorkforceSnapshotSectionProps> = ({
  snapshot,
}) => {
  return (
    <section className={styles.section} aria-labelledby="overview-snapshot-heading">
      <div className={styles.headerRow}>
        <h2 id="overview-snapshot-heading" className={styles.sectionTitle}>
          Workforce snapshot
        </h2>
      </div>

      <div className={styles.containerCard}>
        <div className={styles.metricsGrid} role="region" aria-label="Workforce metrics">
          <Link
            to="/employees"
            className={styles.metricTile}
            aria-label={`Total headcount: ${snapshot.totalEmployees} employees. View employee directory.`}
          >
            <span className={styles.metricLabel}>Total Headcount</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{snapshot.totalEmployees}</span>
              <span className={styles.metricSub}>active</span>
            </div>
          </Link>

          <Link
            to="/onboarding"
            className={styles.metricTile}
            aria-label={`In onboarding: ${snapshot.onboardingCount} employees. View onboarding workspace.`}
          >
            <span className={styles.metricLabel}>In Onboarding</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{snapshot.onboardingCount}</span>
              <span className={styles.metricSub}>pipeline</span>
            </div>
          </Link>

          <Link
            to="/employees"
            className={styles.metricTile}
            aria-label={`Departments: ${snapshot.departmentCount} active teams. View employee directory.`}
          >
            <span className={styles.metricLabel}>Departments</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{snapshot.departmentCount}</span>
              <span className={styles.metricSub}>teams</span>
            </div>
          </Link>

          <Link
            to="/employees?employmentType=contractor"
            className={styles.metricTile}
            aria-label={`Contractors: ${snapshot.contractorCount} active contractors. View contractor directory.`}
          >
            <span className={styles.metricLabel}>Contractors</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.metricValue} tabular-nums`}>{snapshot.contractorCount}</span>
              <span className={styles.metricSub}>external</span>
            </div>
          </Link>
        </div>

        <div className={styles.summaryRow}>
          <span className="tabular-nums">
            {snapshot.totalEmployees} employees · {snapshot.onboardingCount} onboarding ·{' '}
            {snapshot.departmentCount} departments · {snapshot.contractorCount} contractors
          </span>
        </div>
      </div>
    </section>
  );
};
