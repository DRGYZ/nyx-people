import React from 'react';
import styles from './ProfileSections.module.css';

interface ContactSectionProps {
  email: string;
  phone: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ email, phone }) => {
  return (
    <section className={styles.sectionCard} aria-labelledby="contact-heading">
      <div className={styles.sectionHeader}>
        <h2 id="contact-heading" className={styles.sectionTitle}>
          Contact
        </h2>
      </div>

      <div className={styles.separator} aria-hidden="true" />

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Work email</span>
          <a href={`mailto:${email}`} className={`${styles.fieldValue} ${styles.linkValue}`}>
            {email}
          </a>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Phone</span>
          <a href={`tel:${phone.replace(/\s+/g, '')}`} className={`${styles.fieldValue} ${styles.linkValue}`}>
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
};
