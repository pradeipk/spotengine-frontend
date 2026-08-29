'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleButton } from '@/components/ui/GoogleButton';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'engineer'>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', { 
        name, 
        email, 
        password,
        role 
      });
      
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

      if (user?.role === 'engineer') {
        router.push('/dashboard/engineer/profile');
      } else {
        router.push('/dashboard/customer');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} glass-panel animate-fade-in`}>
        <div className={styles.header}>
          <h2>Create Account</h2>
          <p>Join SpotEngine to get started</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.roleSelector}>
            <button 
              type="button"
              className={`${styles.roleBtn} ${role === 'customer' ? styles.active : ''}`}
              onClick={() => setRole('customer')}
            >
              I need a service
            </button>
            <button 
              type="button"
              className={`${styles.roleBtn} ${role === 'engineer' ? styles.active : ''}`}
              onClick={() => setRole('engineer')}
            >
              I am an engineer
            </button>
          </div>

          <Input 
            label="Full Name" 
            type="text" 
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
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
            Create Account
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <GoogleButton text="Sign up with Google" />

        <div className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
