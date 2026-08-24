import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth, ...props }, ref) => {
    
    const wrapperClass = `${styles.wrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`;
    
    return (
      <div className={wrapperClass}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            {...props}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
