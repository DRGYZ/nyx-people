import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          aria-disabled="true"
          title="Employee creation is scheduled for Milestone 2"
          onClick={(e) => e.preventDefault()}
        >
          Add employee
        </Button>
      </div>
    </header>
  );
};
