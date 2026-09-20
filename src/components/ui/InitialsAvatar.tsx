import React from 'react';
import styles from './InitialsAvatar.module.css';

interface InitialsAvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  initials,
  size = 'md',
  className = '',
  ariaLabel,
}) => {
  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  return (
    <span
      className={`${styles.avatar} ${sizeClass} ${className}`}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {initials.toUpperCase()}
    </span>
  );
};

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName ? firstName[0] : '';
  const last = lastName ? lastName[0] : '';
  return `${first}${last}`.toUpperCase();
}
