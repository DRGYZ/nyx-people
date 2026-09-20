import React from 'react';
import styles from './OnboardingHeader.module.css';

export const OnboardingHeader: React.FC = () => {
  return (
    <header className={styles.headerContainer} aria-labelledby="onboarding-page-title">
      <div className={styles.titleRow}>
        <div className={styles.titleArea}>
          <h1 id="onboarding-page-title" className={styles.title}>
            Onboarding
          </h1>
          <p className={styles.subtitle}>
            Track new starters and remaining onboarding tasks.
          </p>
        </div>
      </div>
    </header>
  );
};
