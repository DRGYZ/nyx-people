import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Employee } from '@/domain/employee';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatStartUrgency } from '@/domain/onboarding';
import styles from './OnboardingDetailHeader.module.css';

interface OnboardingDetailHeaderProps {
  employee: Employee;
}

export const OnboardingDetailHeader: React.FC<OnboardingDetailHeaderProps> = ({
  employee,
}) => {
  const fullName = `${employee.person.firstName} ${employee.person.lastName}`;
  const initials = `${employee.person.firstName[0] || ''}${employee.person.lastName[0] || ''}`.toUpperCase();
  const urgency = formatStartUrgency(employee.employment.startDate);

  return (
    <div className={styles.container}>
      <Link to="/onboarding" className={styles.backLink}>
        <ArrowLeft size={14} aria-hidden="true" />
        <span>Back to Onboarding</span>
      </Link>

      <div className={styles.banner}>
        <div className={styles.employeeProfile}>
          <InitialsAvatar initials={initials} size="lg" />
          <div className={styles.detailsCol}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{fullName}</h1>
              <DepartmentBadge department={employee.employment.department} />
              <StatusBadge status={employee.employment.status} />
            </div>

            <div className={styles.metaRow}>
              <span>{employee.employment.jobTitle}</span>
              <span>·</span>
              <span>{employee.employment.location}</span>
              <span>·</span>
              <span>Starts {employee.employment.startDate} ({urgency})</span>
              <span>·</span>
              <span className="tabular-nums">Ref: {employee.id}</span>
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Link
            to={`/employees/${employee.id}`}
            className={styles.profileLink}
            aria-label={`View employee profile of ${fullName}`}
          >
            <span>View employee profile</span>
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
