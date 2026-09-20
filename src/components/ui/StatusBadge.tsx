import React from 'react';
import { EmployeeStatus } from '@/domain/employee';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: EmployeeStatus;
  showDot?: boolean;
  className?: string;
}

const statusLabels: Record<EmployeeStatus, string> = {
  active: 'Active',
  onboarding: 'Onboarding',
  leave: 'On leave',
  offboarded: 'Offboarded',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const statusClass = styles[status] || styles.active;
  const label = statusLabels[status] || status;

  return (
    <span className={`${styles.badge} ${statusClass} ${className}`}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};
