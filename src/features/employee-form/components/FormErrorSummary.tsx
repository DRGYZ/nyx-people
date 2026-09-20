import React, { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './FormErrorSummary.module.css';

export interface FormErrorItem {
  field: string;
  label: string;
  message: string;
}

interface FormErrorSummaryProps {
  errors: FormErrorItem[];
  onFocusField: (field: string) => void;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  onFocusField,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0) {
      containerRef.current?.focus();
    }
  }, [errors]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <div className={styles.header}>
        <AlertCircle size={18} className={styles.icon} aria-hidden="true" />
        <h2 className={styles.title}>
          {errors.length === 1
            ? 'There is 1 error with your submission'
            : `There are ${errors.length} errors with your submission`}
        </h2>
      </div>

      <ul className={styles.list}>
        {errors.map(({ field, message }) => (
          <li key={field} className={styles.item}>
            <a
              href={`#field-${field}`}
              className={styles.link}
              onClick={(e) => {
                e.preventDefault();
                onFocusField(field);
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
