import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth, isLoading, children, ...props }, ref) => {
    
    const combinedClasses = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      isLoading ? styles.loading : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <button ref={ref} className={combinedClasses} disabled={isLoading || props.disabled} {...props}>
        {isLoading ? <span className={styles.spinner}></span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
