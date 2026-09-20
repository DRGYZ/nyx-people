import React, { useState } from 'react';
import { EmployeeAddress } from '@/domain/employee';
import { formatFullDate } from '@/utils/formatters';
import styles from './ProfileSections.module.css';

interface PersonalInfoSectionProps {
  dateOfBirth: string;
  address: EmployeeAddress;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  dateOfBirth,
  address,
}) => {
  const [isDobRevealed, setIsDobRevealed] = useState(false);

  return (
    <section className={styles.sectionCard} aria-labelledby="personal-info-heading">
      <div className={styles.sectionHeader}>
        <h2 id="personal-info-heading" className={styles.sectionTitle}>
          Personal information
        </h2>
      </div>

      <div className={styles.separator} aria-hidden="true" />

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Date of birth</span>
          <div className={styles.dobRow}>
            {isDobRevealed ? (
              <span className={`${styles.fieldValue} tabular-nums`}>
                {formatFullDate(dateOfBirth)}
              </span>
            ) : (
              <span className={styles.fieldValue}>••••••••</span>
            )}
            <button
              type="button"
              onClick={() => setIsDobRevealed(!isDobRevealed)}
              className={styles.toggleMaskButton}
              aria-label={isDobRevealed ? 'Hide date of birth' : 'Show date of birth'}
            >
              {isDobRevealed ? 'Hide' : 'Reveal'}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Address</span>
          <address className={styles.fieldValue} style={{ fontStyle: 'normal' }}>
            <div>{address.street}</div>
            <div>
              {address.postalCode} {address.city}, {address.country}
            </div>
          </address>
        </div>
      </div>
    </section>
  );
};
