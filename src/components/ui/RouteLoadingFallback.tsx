import React from 'react';
import styles from './RouteLoadingFallback.module.css';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-label="Loading page..."
    >
      <div className={styles.progressBar} aria-hidden="true">
        <div className={styles.progressIndicator} />
      </div>
      <span className={styles.srOnly}>Loading page...</span>
    </div>
  );
};
