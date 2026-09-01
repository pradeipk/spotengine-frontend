import React, { useId } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = externalId || generatedId;
    
    const wrapperClass = `${styles.wrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`;
    
    return (
      <div className={wrapperClass}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            id={inputId}
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
