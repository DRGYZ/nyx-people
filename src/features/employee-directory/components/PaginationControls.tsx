import React from 'react';
import { Select } from '@/components/ui/Select';
import styles from './PaginationControls.module.css';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const startRange = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endRange = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis (e.g. 1, 2, 3 ... 18)
  const getPageItems = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="Pagination Navigation">
      <div className={`${styles.rangeText} tabular-nums`}>
        Showing {startRange}–{endRange} of {totalItems} employees
      </div>

      <div className={styles.controlsRight}>
        <div className={styles.pageSizeGroup}>
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
            options={pageSizeOptions}
            ariaLabel="Select rows per page"
          />
        </div>

        <div className={styles.pageButtons}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
          >
            Previous
          </button>

          {getPageItems().map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
                  ...
                </span>
              );
            }

            const isCurrent = item === currentPage;
            return (
              <button
                key={item}
                type="button"
                className={`${styles.pageButton} ${isCurrent ? styles.active : ''} tabular-nums`}
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            className={styles.navButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      </div>
    </nav>
  );
};
