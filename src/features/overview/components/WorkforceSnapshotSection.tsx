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

      <div className={styles.summaryContainer} role="region" aria-label="Workforce metrics">
        <div className={styles.summaryRow}>
          <Link
            to="/employees"
            className={styles.summaryLink}
            aria-label={`Total headcount: ${snapshot.totalEmployees} employees. View employee directory.`}
          >
            <span className={`${styles.count} tabular-nums`}>{snapshot.totalEmployees}</span>
            <span className={styles.label}>employees</span>
          </Link>
          <span className={styles.dot} aria-hidden="true">·</span>

          <Link
            to="/onboarding"
            className={styles.summaryLink}
            aria-label={`In onboarding: ${snapshot.onboardingCount} employees. View onboarding workspace.`}
          >
            <span className={`${styles.count} tabular-nums`}>{snapshot.onboardingCount}</span>
            <span className={styles.label}>onboarding</span>
          </Link>
          <span className={styles.dot} aria-hidden="true">·</span>

          <Link
            to="/employees"
            className={styles.summaryLink}
            aria-label={`Departments: ${snapshot.departmentCount} active teams. View employee directory.`}
          >
            <span className={`${styles.count} tabular-nums`}>{snapshot.departmentCount}</span>
            <span className={styles.label}>departments</span>
          </Link>
          <span className={styles.dot} aria-hidden="true">·</span>

          <Link
            to="/employees?employmentType=contractor"
            className={styles.summaryLink}
            aria-label={`Contractors: ${snapshot.contractorCount} active contractors. View contractor directory.`}
          >
            <span className={`${styles.count} tabular-nums`}>{snapshot.contractorCount}</span>
            <span className={styles.label}>contractors</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
