import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon, className = '', children, ...props }, ref) => {
    const variantClass = styles[variant] || styles.secondary;
    const sizeClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

    return (
      <button
        ref={ref}
        className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
