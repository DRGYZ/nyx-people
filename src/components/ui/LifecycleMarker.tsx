import React from 'react';
import { EmployeeStatus } from '@/domain/employee';
import styles from './LifecycleMarker.module.css';

interface LifecycleMarkerProps {
  status: EmployeeStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const LifecycleMarker: React.FC<LifecycleMarkerProps> = ({
  status,
  size = 'md',
  className = '',
  ariaLabel,
}) => {
  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const statusClass = styles[status] || styles.active;

  return (
    <span
      className={`${styles.marker} ${statusClass} ${sizeClass} ${className}`}
      role="presentation"
      aria-label={ariaLabel}
    />
  );
};
