import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Employee } from '@/domain/employee';
import { InitialsAvatar, getInitials } from '@/components/ui/InitialsAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatFullDate } from '@/utils/formatters';
import buttonStyles from '@/components/ui/Button.module.css';
import styles from './ProfileHeader.module.css';

interface ProfileHeaderProps {
  employee: Employee;
  returnSearchQuery: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  employee,
  returnSearchQuery,
}) => {
  const { person, employment } = employee;
  const initials = getInitials(person.firstName, person.lastName);
  const fullName = `${person.firstName} ${person.lastName}`;
  const returnPath = returnSearchQuery ? `/employees?${returnSearchQuery}` : '/employees';

  return (
    <div className={styles.container}>
      <Link to={returnPath} className={styles.backLink} aria-label="Return to employees directory">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Employees</span>
      </Link>

      <div className={styles.headerCard}>
        <div className={styles.identityGroup}>
          <InitialsAvatar initials={initials} size="lg" ariaLabel={fullName} />

          <div>
            <div className={styles.nameStatusRow}>
              <h1 className={styles.name}>{fullName}</h1>
              <StatusBadge status={employment.status} />
            </div>

            <div className={styles.subtitle}>
              <span>{employment.jobTitle}</span>
              <span className={styles.dotSeparator} aria-hidden="true">·</span>
              <span>{employment.department}</span>
              <span className={styles.dotSeparator} aria-hidden="true">·</span>
              <span>{employment.location}</span>
              <span className={styles.dotSeparator} aria-hidden="true">·</span>
              <span className="tabular-nums">Starts {formatFullDate(employment.startDate)}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            to={{
              pathname: `/employees/${employee.id}/edit`,
              search: returnSearchQuery ? `?returnSearch=${encodeURIComponent(returnSearchQuery)}` : '',
            }}
            state={{ returnSearch: returnSearchQuery }}
            className={`${buttonStyles.button} ${buttonStyles.outline} ${buttonStyles.sizeMd}`}
            aria-label={`Edit ${fullName}`}
          >
            Edit employee
          </Link>
        </div>
      </div>
    </div>
  );
};
