import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.errorCode} aria-hidden="true">404</span>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className={styles.actions}>
          <Link to="/overview" className={styles.primaryLink}>
            Return to Overview
          </Link>
          <Link to="/employees" className={styles.secondaryLink}>
            View employees
          </Link>
        </div>
      </div>
    </div>
  );
};
