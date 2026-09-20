import React from 'react';
import { Link } from 'react-router-dom';
import { OverviewRecentItem } from '@/domain/overview';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import styles from './RecentlyUpdatedSection.module.css';

interface RecentlyUpdatedSectionProps {
  items: OverviewRecentItem[];
}

export const RecentlyUpdatedSection: React.FC<RecentlyUpdatedSectionProps> = ({ items }) => {
  return (
    <section className={styles.section} aria-labelledby="overview-recent-heading">
      <div className={styles.headerRow}>
        <h2 id="overview-recent-heading" className={styles.sectionTitle}>
          Recently updated
        </h2>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyCard} role="status">
          <span>No recent employee updates recorded.</span>
        </div>
      ) : (
        <ul className={styles.list} aria-label="Recently updated employee records">
          {items.map((item) => {
            const initials = item.name
              .split(' ')
              .map((part) => part[0] || '')
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <li key={item.id} className={styles.row}>
                <div className={styles.mainInfo}>
                  <InitialsAvatar initials={initials} size="sm" />
                  <div className={styles.detailsCol}>
                    <div className={styles.nameRow}>
                      <Link
                        to={`/employees/${item.id}`}
                        className={styles.employeeName}
                      >
                        {item.name}
                      </Link>
                      <DepartmentBadge department={item.department} />
                    </div>
                    <span className={styles.roleDept}>{item.jobTitle}</span>
                  </div>
                </div>

                <div className={styles.timeCol}>
                  <span className={`${styles.timeText} tabular-nums`}>{item.relativeUpdated}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
