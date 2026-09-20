import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { OverviewAttentionItem } from '@/domain/overview';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import styles from './NeedsAttentionSection.module.css';

interface NeedsAttentionSectionProps {
  items: OverviewAttentionItem[];
}

export const NeedsAttentionSection: React.FC<NeedsAttentionSectionProps> = ({ items }) => {
  return (
    <section className={styles.section} aria-labelledby="overview-attention-heading">
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 id="overview-attention-heading" className={styles.sectionTitle}>
            Needs attention
          </h2>
          <span
            className={`${styles.countBadge} ${items.length === 0 ? styles.countBadgeZero : ''}`}
            aria-label={`${items.length} items requiring attention`}
          >
            {items.length}
          </span>
        </div>

        <Link to="/onboarding?view=attention" className={styles.headerLink}>
          <span>View all onboarding</span>
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyCard} role="status">
          <CheckCircle2 size={18} className={styles.emptyIcon} aria-hidden="true" />
          <span>Nothing needs attention right now. All active onboardings are on track.</span>
        </div>
      ) : (
        <ul className={styles.list} aria-label="Employees requiring immediate attention">
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
                aria-labelledby={`attention-emp-${item.id}`}
              >
                <div className={styles.mainInfo}>
                  <InitialsAvatar initials={initials} size="md" />

                  <div className={styles.contentCol}>
                    <div className={styles.nameRow}>
                      <Link
                        to={`/employees/${item.id}/onboarding`}
                        id={`attention-emp-${item.id}`}
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
                      <span className={styles.urgencyBadge}>
                        <AlertCircle size={12} aria-hidden="true" />
                        <span>{item.urgency}</span>
                      </span>
                      <span>·</span>
                      <span className={styles.remainingBadge}>
                        {item.remainingCount} {item.remainingCount === 1 ? 'task' : 'tasks'} remaining
                      </span>
                    </div>

                    {item.remainingTasks.length > 0 && (
                      <div className={styles.tasksList}>
                        <span className={styles.pendingLabel}>Pending:</span>
                        {item.remainingTasks.map((task) => (
                          <span key={task} className={styles.taskTag}>
                            {task}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.actionCol}>
                  <Link
                    to={`/employees/${item.id}/onboarding`}
                    className={styles.actionBtn}
                    aria-label={`View onboarding for ${item.name}`}
                  >
                    <span>View onboarding</span>
                    <ArrowRight size={13} aria-hidden="true" />
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
