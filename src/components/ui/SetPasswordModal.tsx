'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from './Button';
import { Input } from './Input';
import styles from './SetPasswordModal.module.css';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  isInitialSet?: boolean;
}

export const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isInitialSet = true,
}) => {
  const { user, setUser } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/users/set-password', { password });
      const msg = res.data?.data?.message || res.data?.message || 'Password updated successfully!';
      
      if (user) {
        setUser({ ...user, hasPassword: true });
      }

      setPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess(msg);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isInitialSet ? '🔑 Set Account Password' : '🔑 Change Password'}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <p className={styles.subtitle}>
          {isInitialSet
            ? 'Set a password to enable logging in with both Google and your email address.'
            : 'Enter your new password below.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />

          {error && <div className={styles.errorText}>⚠️ {error}</div>}

          <div className={styles.actions}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isInitialSet ? 'Save Password' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
