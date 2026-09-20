import React from 'react';
import { Link } from 'react-router-dom';
import { Employee } from '@/domain/employee';
import { LifecycleMarker } from '@/components/ui/LifecycleMarker';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/formatters';
import styles from './EmployeeMobileList.module.css';

interface EmployeeMobileListProps {
  data: Employee[];
  currentQueryString: string;
}

export const EmployeeMobileList: React.FC<EmployeeMobileListProps> = ({
  data,
  currentQueryString,
}) => {
  const returnQuery = currentQueryString ? `?${currentQueryString}` : '';

  return (
    <div className={styles.list} role="feed" aria-label="Employees list">
      {data.map((emp) => {
        const fullName = `${emp.person.firstName} ${emp.person.lastName}`;
        const hasOnboarding = emp.onboarding && emp.employment.status === 'onboarding';

        return (
          <article key={emp.id} className={styles.item}>
            <div className={styles.marker}>
              <LifecycleMarker status={emp.employment.status} size="lg" />
            </div>

            <div className={styles.content}>
              <div className={styles.topRow}>
                <div>
                  <Link
                    to={{
                      pathname: `/employees/${emp.id}`,
                      search: returnQuery,
                    }}
                    state={{ returnSearch: currentQueryString }}
                    className={styles.nameLink}
                  >
                    {fullName}
                  </Link>
                  <div className={styles.roleDept}>
                    {emp.employment.jobTitle} · {emp.employment.department}
                  </div>
                </div>
              </div>

              <div className={styles.middleRow}>
                <StatusBadge status={emp.employment.status} />
                <span className={`${styles.startDate} tabular-nums`}>
                  Starts {formatDate(emp.employment.startDate)}
                </span>
              </div>

              {hasOnboarding && emp.onboarding && (
                <div className={styles.bottomRow}>
                  <span className={`${styles.progressTasks} tabular-nums`}>
                    {emp.onboarding.completedTasks} / {emp.onboarding.totalTasks} onboarding tasks
                  </span>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
