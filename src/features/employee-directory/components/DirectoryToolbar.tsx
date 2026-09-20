import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ColumnVisibilityMenu, ColumnToggleOption } from '@/components/ui/DropdownMenu';
import { DirectoryQueryParams } from '@/domain/schemas';
import styles from './DirectoryToolbar.module.css';

interface DirectoryToolbarProps {
  queryParams: DirectoryQueryParams;
  onUpdateQuery: (updates: Partial<DirectoryQueryParams>, resetPage?: boolean) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  columnOptions: ColumnToggleOption[];
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'People', label: 'People' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Legal', label: 'Legal' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'leave', label: 'On leave' },
  { value: 'offboarded', label: 'Offboarded' },
];

const employmentTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
];

export const DirectoryToolbar: React.FC<DirectoryToolbarProps> = ({
  queryParams,
  onUpdateQuery,
  onResetFilters,
  hasActiveFilters,
  columnOptions,
  onToggleColumn,
}) => {
  const [searchValue, setSearchValue] = useState(queryParams.q);

  // Sync internal state if queryParams.q changes externally (e.g. back button or reset)
  useEffect(() => {
    setSearchValue(queryParams.q);
  }, [queryParams.q]);

  // Debounced search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== queryParams.q) {
        onUpdateQuery({ q: searchValue }, true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue, queryParams.q, onUpdateQuery]);

  const handleClearSearch = () => {
    setSearchValue('');
    onUpdateQuery({ q: '' }, true);
  };

  return (
    <div className={styles.toolbar} role="search" aria-label="Filter employee directory">
      <div className={styles.searchWrapper}>
        <Input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name, email or role..."
          aria-label="Search employees by name, email or role"
          startIcon={<Search size={16} />}
          endAction={
            searchValue ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search text"
                style={{ background: 'none', border: 'none', display: 'flex' }}
              >
                <X size={14} />
              </button>
            ) : null
          }
        />
      </div>

      <div className={styles.filtersGroup}>
        <Select
          value={queryParams.department}
          onValueChange={(val) => onUpdateQuery({ department: val }, true)}
          options={departmentOptions}
          ariaLabel="Filter by department"
          triggerPrefix="Department:"
        />

        <Select
          value={queryParams.status}
          onValueChange={(val) => onUpdateQuery({ status: val }, true)}
          options={statusOptions}
          ariaLabel="Filter by status"
          triggerPrefix="Status:"
        />

        <Select
          value={queryParams.employmentType}
          onValueChange={(val) => onUpdateQuery({ employmentType: val }, true)}
          options={employmentTypeOptions}
          ariaLabel="Filter by employment type"
          triggerPrefix="Type:"
        />

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetFilters}
            aria-label="Reset all active search and filter options"
          >
            Reset
          </button>
        )}

        <span className={styles.divider} aria-hidden="true" />

        <ColumnVisibilityMenu
          columns={columnOptions}
          onToggleColumn={onToggleColumn}
        />
      </div>
    </div>
  );
};
