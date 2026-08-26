'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const payload = response.data?.data || response.data;
      const user = payload.user || payload;
      const accessToken = payload.accessToken || payload.backendTokens?.accessToken || payload.token;
      const refreshToken = payload.refreshToken || payload.backendTokens?.refreshToken;
      
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      }
      if (user) {
        setUser(user);
      }

      // Redirect based on role
      if (user?.role === 'customer') {
        router.push('/dashboard/customer');
      } else if (user?.role === 'engineer') {
        router.push('/dashboard/engineer');
      } else {
        router.push('/dashboard/admin');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} glass-panel animate-fade-in`}>
        <div className={styles.header}>
          <h2>Welcome Back</h2>
          <p>Sign in to your SpotEngine account</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          
          <Button type="submit" fullWidth isLoading={isLoading} className={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
