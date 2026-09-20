import React, { useState, useMemo, useEffect } from 'react';
import { VisibilityState } from '@tanstack/react-table';
import { useDirectorySearchParams } from '@/features/employee-directory/hooks/useDirectorySearchParams';
import { useEmployeeDirectory } from '@/features/employee-directory/hooks/useEmployeeDirectory';
import { DirectoryHeader } from '@/features/employee-directory/components/DirectoryHeader';
import { DirectoryTabs } from '@/features/employee-directory/components/DirectoryTabs';
import { DirectoryToolbar } from '@/features/employee-directory/components/DirectoryToolbar';
import { EmployeeTable } from '@/features/employee-directory/components/EmployeeTable';
import { EmployeeMobileList } from '@/features/employee-directory/components/EmployeeMobileList';
import { PaginationControls } from '@/features/employee-directory/components/PaginationControls';
import { DirectorySkeleton } from '@/features/employee-directory/components/DirectorySkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ColumnToggleOption } from '@/components/ui/DropdownMenu';
import styles from './EmployeesPage.module.css';

export const EmployeesPage: React.FC = () => {
  const {
    queryParams,
    updateQueryParams,
    resetAllFilters,
    currentQueryString,
    hasActiveFilters,
  } = useDirectorySearchParams();

  const { response, loading, error, refetch } = useEmployeeDirectory(queryParams);

  // Automatically clamp out-of-bounds page if total > 0 but page > totalPages
  useEffect(() => {
    if (response && response.total > 0 && queryParams.page > response.totalPages) {
      updateQueryParams({ page: response.totalPages }, { replace: true });
    }
  }, [response, queryParams.page, updateQueryParams]);

  // Column visibility state (default all true)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    role: true,
    department: true,
    status: true,
    startDate: true,
    onboarding: true,
  });

  const columnOptions: ColumnToggleOption[] = useMemo(
    () => [
      { id: 'role', label: 'Role', isVisible: columnVisibility.role !== false },
      { id: 'department', label: 'Department', isVisible: columnVisibility.department !== false },
      { id: 'status', label: 'Status', isVisible: columnVisibility.status !== false },
      { id: 'startDate', label: 'Start Date', isVisible: columnVisibility.startDate !== false },
      { id: 'onboarding', label: 'Onboarding Progress', isVisible: columnVisibility.onboarding !== false },
    ],
    [columnVisibility]
  );

  const handleToggleColumn = (colId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [colId]: visible,
    }));
  };

  const handleSort = (columnId: string) => {
    if (queryParams.sortBy === columnId) {
      // Toggle asc/desc (PUSH)
      updateQueryParams({
        sortDir: queryParams.sortDir === 'asc' ? 'desc' : 'asc',
      }, { replace: false });
    } else {
      updateQueryParams({
        sortBy: columnId as any,
        sortDir: 'asc',
      }, { replace: false });
    }
  };

  const counts = response?.counts || {
    all: 428,
    newStarters: 14,
    onboarding: 6,
    contractors: 28,
  };

  return (
    <div className={styles.container}>
      {/* Dynamic Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading
          ? 'Loading employees...'
          : `${response?.total ?? 0} employees found.`}
      </div>

      <DirectoryHeader
        totalCount={response?.counts.all || 428}
        departmentCount={response?.totalDepartments || 8}
      />

      <DirectoryTabs
        activeView={queryParams.view}
        counts={counts}
        onViewChange={(view) => updateQueryParams({ view }, { resetPage: true, replace: false })}
      />

      <DirectoryToolbar
        queryParams={queryParams}
        onUpdateQuery={updateQueryParams}
        onResetFilters={resetAllFilters}
        hasActiveFilters={hasActiveFilters}
        columnOptions={columnOptions}
        onToggleColumn={handleToggleColumn}
      />

      {error ? (
        <EmptyState
          title="We couldn't load employees."
          description="Your current filters are preserved. Check your network or retry."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : loading && !response ? (
        <DirectorySkeleton rows={10} />
      ) : response && response.total === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No employees match these filters."
            description="Adjust your search or filters to see matching results."
            action={
              <Button variant="secondary" onClick={resetAllFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No employees yet."
            description="Your directory will appear here."
          />
        )
      ) : response ? (
        <>
          {/* Desktop & Tablet Table */}
          <div className={styles.tableView}>
            <EmployeeTable
              data={response.data}
              sortBy={queryParams.sortBy}
              sortDir={queryParams.sortDir}
              onSort={handleSort}
              currentQueryString={currentQueryString}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          </div>

          {/* Mobile Structured Vertical List (<768px) */}
          <div className={styles.mobileView}>
            <EmployeeMobileList
              data={response.data}
              currentQueryString={currentQueryString}
            />
          </div>

          <PaginationControls
            currentPage={response.page}
            totalPages={response.totalPages}
            totalItems={response.total}
            pageSize={response.pageSize}
            onPageChange={(page) => updateQueryParams({ page }, { replace: false })}
            onPageSizeChange={(pageSize) => updateQueryParams({ pageSize }, { resetPage: true, replace: false })}
          />
        </>
      ) : null}
    </div>
  );
};
