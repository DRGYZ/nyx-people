import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { OverviewUpcomingItem } from '@/domain/overview';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import styles from './UpcomingStartsSection.module.css';

interface UpcomingStartsSectionProps {
  items: OverviewUpcomingItem[];
}

export const UpcomingStartsSection: React.FC<UpcomingStartsSectionProps> = ({ items }) => {
  return (
    <section className={styles.section} aria-labelledby="overview-upcoming-heading">
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 id="overview-upcoming-heading" className={styles.sectionTitle}>
            Upcoming starts
          </h2>
          <span
            className={styles.countBadge}
            aria-label={`${items.length} employees starting soon`}
          >
            {items.length}
          </span>
        </div>

        <Link to="/employees?view=new-starters" className={styles.headerLink}>
          <span>View new starters</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyCard} role="status">
          <span>No employee starts are scheduled in the next 14 days.</span>
        </div>
      ) : (
        <ul className={styles.list} aria-label="Employees scheduled to start within 14 days">
          {items.map((item) => {
            const initials = item.name
              .split(' ')
              .map((part) => part[0] || '')
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <li
                key={item.id}
                className={styles.card}
                aria-labelledby={`upcoming-emp-${item.id}`}
              >
                <div className={styles.mainInfo}>
                  <InitialsAvatar initials={initials} size="md" />

                  <div className={styles.contentCol}>
                    <div className={styles.nameRow}>
                      <Link
                        to={`/employees/${item.id}`}
                        id={`upcoming-emp-${item.id}`}
                        className={styles.employeeName}
                      >
                        {item.name}
                      </Link>
                      <span className={styles.jobTitle}>{item.jobTitle}</span>
                      <DepartmentBadge department={item.department} />
                    </div>

                    <div className={styles.metaRow}>
                      <span>Starts {item.startDate}</span>
                      <span>·</span>
                      <span className={styles.urgencyText}>{item.urgency}</span>
                      {item.onboardingProgress && (
                        <>
                          <span>·</span>
                          <span
                            className={`${styles.onboardingPill} ${
                              item.onboardingProgress.percent === 100 ? styles.onboardingComplete : ''
                            }`}
                          >
                            {item.onboardingProgress.completed} / {item.onboardingProgress.total} onboarding
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.actionCol}>
                  <Link
                    to={`/employees/${item.id}`}
                    className={styles.actionLink}
                    aria-label={`View profile for ${item.name}`}
                  >
                    <span>View profile</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
