import React from 'react';
import styles from './OverviewHeader.module.css';

export const OverviewHeader: React.FC = () => {
  return (
    <header className={styles.headerContainer} aria-labelledby="overview-page-title">
      <div className={styles.titleRow}>
        <div className={styles.titleArea}>
          <h1 id="overview-page-title" className={styles.title}>
            Overview
          </h1>
          <p className={styles.subtitle}>
            Operational priorities, upcoming employee arrivals, and organization activity at a glance.
          </p>
        </div>
      </div>
    </header>
  );
};
