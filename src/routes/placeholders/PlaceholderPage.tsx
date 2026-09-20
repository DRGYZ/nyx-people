import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import styles from './PlaceholderPage.module.css';

interface PlaceholderPageProps {
  title: string;
  description: string;
  plannedMilestone: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  plannedMilestone,
}) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{title}</h1>
      <p className={styles.subheading}>{description}</p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Upcoming Feature Area</h2>
        <p className={styles.cardText}>
          This workspace view is planned for <strong>{plannedMilestone}</strong>. For
          Milestone 1, explore the Employee Directory and Individual Profile views.
        </p>
        <Link to="/employees">
          <Button variant="primary">Return to Employees</Button>
        </Link>
      </div>
    </div>
  );
};
