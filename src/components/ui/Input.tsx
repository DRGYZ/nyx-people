import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ startIcon, endAction, className = '', ...props }, ref) => {
    return (
      <div className={styles.container}>
        {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
        <input
          ref={ref}
          className={`${styles.input} ${startIcon ? styles.withStartIcon : ''} ${
            endAction ? styles.withEndIcon : ''
          } ${className}`}
          {...props}
        />
        {endAction && <span className={styles.endAction}>{endAction}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
