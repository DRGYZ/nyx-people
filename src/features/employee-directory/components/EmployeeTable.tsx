import React from 'react';
import { Link } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Employee } from '@/domain/employee';
import { LifecycleMarker } from '@/components/ui/LifecycleMarker';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils/formatters';
import styles from './EmployeeTable.module.css';

interface EmployeeTableProps {
  data: Employee[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (columnId: string) => void;
  currentQueryString: string;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
}

const columnHelper = createColumnHelper<Employee>();

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  data,
  sortBy,
  sortDir,
  onSort,
  currentQueryString,
  columnVisibility,
  onColumnVisibilityChange,
}) => {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('person.lastName', {
        id: 'name',
        header: 'Employee',
        enableHiding: false,
        cell: (info) => {
          const emp = info.row.original;
          const fullName = `${emp.person.firstName} ${emp.person.lastName}`;
          const returnQuery = currentQueryString ? `?${currentQueryString}` : '';

          return (
            <div className={styles.employeeCell}>
              <LifecycleMarker status={emp.employment.status} size="md" />
              <div className={styles.employeeText}>
                <Link
                  to={{
                    pathname: `/employees/${emp.id}`,
                    search: returnQuery,
                  }}
                  state={{ returnSearch: currentQueryString }}
                  className={styles.employeeNameLink}
                  aria-label={`View profile of ${fullName}`}
                >
                  {fullName}
                </Link>
                <span className={styles.employeeEmail}>{emp.person.email}</span>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('employment.jobTitle', {
        id: 'role',
        header: 'Role',
        cell: (info) => (
          <span className={styles.roleText}>{info.getValue()}</span>
        ),
      }),

      columnHelper.accessor('employment.department', {
        id: 'department',
        header: 'Department',
        cell: (info) => (
          <DepartmentBadge department={info.getValue()} />
        ),
      }),

      columnHelper.accessor('employment.status', {
        id: 'status',
        header: 'Status',
        cell: (info) => (
          <StatusBadge status={info.getValue()} />
        ),
      }),

      columnHelper.accessor('employment.startDate', {
        id: 'startDate',
        header: 'Start Date',
        cell: (info) => (
          <span className={`${styles.startDateText} tabular-nums`}>
            {formatDate(info.getValue())}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'onboarding',
        header: 'Onboarding Progress',
        cell: (info) => {
          const emp = info.row.original;
          if (emp.onboarding) {
            return (
              <span className={`${styles.progressText} tabular-nums`}>
                {emp.onboarding.completedTasks} / {emp.onboarding.totalTasks}
              </span>
            );
          }
          return <span className={styles.progressEmpty} aria-label="Not in onboarding">—</span>;
        },
      }),
    ],
    [currentQueryString]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
      onColumnVisibilityChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const getAriaSort = (colId: string): 'ascending' | 'descending' | 'none' => {
    if (sortBy !== colId) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  const renderSortIndicator = (colId: string) => {
    if (sortBy !== colId) {
      return (
        <span className={styles.sortIcon} aria-hidden="true">
          <ArrowUpDown size={12} />
        </span>
      );
    }
    return (
      <span className={styles.sortIcon} aria-hidden="true">
        {sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      </span>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const colId = header.id;
                const isSortable = ['name', 'role', 'department', 'status', 'startDate'].includes(colId);
                const isCurrentSort = sortBy === colId;

                return (
                  <th
                    key={header.id}
                    className={styles.th}
                    scope="col"
                    aria-sort={isSortable ? getAriaSort(colId) : undefined}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        className={`${styles.sortButton} ${isCurrentSort ? styles.sortActive : ''}`}
                        onClick={() => onSort(colId)}
                        aria-label={`Sort by ${header.column.columnDef.header as string}`}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {renderSortIndicator(colId)}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.tr}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles.td}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
