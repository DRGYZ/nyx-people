import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import buttonStyles from '@/components/ui/Button.module.css';
import styles from './DirectoryHeader.module.css';

interface DirectoryHeaderProps {
  totalCount: number;
  departmentCount: number;
}

export const DirectoryHeader: React.FC<DirectoryHeaderProps> = ({
  totalCount,
  departmentCount,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Employees</h1>
        <p className={styles.subtitle}>
          <span className="tabular-nums">{totalCount}</span> people across{' '}
          <span className="tabular-nums">{departmentCount}</span> departments
        </p>
      </div>

      <div className={styles.actionArea}>
        <Link
          to="/employees/new"
          className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.sizeMd}`}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add employee</span>
        </Link>
      </div>
    </header>
  );
};
