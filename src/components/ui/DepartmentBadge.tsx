import React from 'react';
import { Department } from '@/domain/employee';
import styles from './DepartmentBadge.module.css';

interface DepartmentBadgeProps {
  department: Department | string;
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  department,
  className = '',
}) => {
  return (
    <span className={`${styles.badge} ${className}`}>
      {department}
    </span>
  );
};
