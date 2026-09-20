import React from 'react';
import { SYSTEM_TAGLINE } from '@/app/config';
import styles from './ProfileFooter.module.css';

interface ProfileFooterProps {
  employeeId: string;
  location: string;
}

export const ProfileFooter: React.FC<ProfileFooterProps> = ({
  employeeId,
  location,
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <span>{SYSTEM_TAGLINE}</span>
      </div>
      <div className={styles.right}>
        <span>
          Record ref: {employeeId} · {location} Bureau
        </span>
      </div>
    </footer>
  );
};
