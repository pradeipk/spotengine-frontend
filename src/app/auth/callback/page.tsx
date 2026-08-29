'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './callback.module.css';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const [statusText, setStatusText] = useState('Authenticating with Google...');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role') || 'customer';

    if (!token || !refreshToken) {
      setError('Authentication failed. No authentication tokens were returned by Google.');
      return;
    }

    const finalizeAuth = async () => {
      try {
        setTokens(token, refreshToken);
        setStatusText('Loading your profile...');

        // Fetch user profile
        const meRes = await api.get('/auth/me');
        const userData = meRes.data?.data || meRes.data || { role };
        setUser(userData);

        // Redirect based on role
        if (userData.role === 'engineer') {
          router.push('/dashboard/engineer');
        } else if (userData.role === 'admin' || userData.role === 'super_admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/customer');
        }
      } catch (err: any) {
        console.error(err);
        // Fallback redirect with token saved
        if (role === 'engineer') {
          router.push('/dashboard/engineer');
        } else {
          router.push('/dashboard/customer');
        }
      }
    };

    finalizeAuth();
  }, [searchParams, router, setTokens, setUser]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} glass-panel`}>
          <h2>Sign-in Error</h2>
          <p className={styles.errorText}>{error}</p>
          <a href="/login" className={styles.linkBtn}>Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} glass-panel animate-fade-in`}>
        <div className={styles.spinner}></div>
        <h2>{statusText}</h2>
        <p>Please wait while we set up your secure session.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Connecting...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

