import React from 'react';
import { EmploymentDetails } from '@/domain/employee';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatFullDate } from '@/utils/formatters';
import styles from './ProfileSections.module.css';

interface EmploymentSectionProps {
  employment: EmploymentDetails;
}

export const EmploymentSection: React.FC<EmploymentSectionProps> = ({ employment }) => {
  return (
    <section className={styles.sectionCard} aria-labelledby="employment-heading">
      <div className={styles.sectionHeader}>
        <h2 id="employment-heading" className={styles.sectionTitle}>
          Employment
        </h2>
        <span className={styles.metaBadge}>PRIMARY RECORD</span>
      </div>

      <div className={styles.separator} aria-hidden="true" />

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Job title</span>
          <span className={styles.fieldValue}>{employment.jobTitle}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Department</span>
          <span className={styles.fieldValue}>{employment.department}</span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Manager</span>
          {employment.manager ? (
            <div className={styles.managerRow}>
              <InitialsAvatar initials={employment.manager.initials} size="sm" />
              <span className={styles.fieldValue}>{employment.manager.name}</span>
            </div>
          ) : (
            <span className={styles.fieldValue}>—</span>
          )}
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Employment type</span>
          <span className={styles.fieldValue} style={{ textTransform: 'capitalize' }}>
            {employment.employmentType}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Start date</span>
          <span className={`${styles.fieldValue} tabular-nums`}>
            {formatFullDate(employment.startDate)}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <div>
            <StatusBadge status={employment.status} />
          </div>
        </div>
      </div>
    </section>
  );
};
