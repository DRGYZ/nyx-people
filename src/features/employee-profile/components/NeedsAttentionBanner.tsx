import React from 'react';
import { Flag, ArrowRight } from 'lucide-react';
import styles from './NeedsAttentionBanner.module.css';

interface NeedsAttentionBannerProps {
  summary: string;
}

export const NeedsAttentionBanner: React.FC<NeedsAttentionBannerProps> = ({ summary }) => {
  return (
    <aside className={styles.banner} aria-label="Action required for this employee">
      <div className={styles.left}>
        <Flag size={16} className={styles.flagIcon} aria-hidden="true" />
        <p className={styles.text}>
          <span className={styles.bold}>Needs attention — </span>
          <span>{summary}</span>
        </p>
      </div>

      <span className={styles.action}>
        <span>View onboarding</span>
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </aside>
  );
};
