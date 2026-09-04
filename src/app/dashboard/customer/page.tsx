'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { SetPasswordModal } from '@/components/ui/SetPasswordModal';
import { AppNavbar } from '@/components/ui/AppNavbar';
import styles from './dashboard.module.css';

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  address: string;
  estimatedDurationHours: number;
  engineerProfile: {
    user: {
      name: string;
    };
  };
  rateCard: {
    serviceType: string;
    hourlyRate: string;
  };
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.allSettled([
          api.get('/users/me').catch(() => api.get('/auth/me')),
          api.get('/bookings/my-jobs'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const p = profileRes.value.data.data || profileRes.value.data;
          setUser({ ...user, ...p });
        }

        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data) {
          const items = bookingsRes.value.data.data || bookingsRes.value.data || [];
          setBookings(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role, router]);

  const handleSwitchToEngineer = async () => {
    try {
      await api.patch('/users/role', { role: 'engineer' });
      if (user) setUser({ ...user, role: 'engineer' });
      router.push('/dashboard/engineer');
    } catch (err) {
      router.push('/dashboard/engineer');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) return <div className={styles.loadingState}>Loading dashboard...</div>;

  return (
    <>
      <AppNavbar onSwitchRole={handleSwitchToEngineer} switchRoleLabel="🛠️ Engineer Mode" />
      <div className={styles.container}>
        <header className={`${styles.header} glass-panel`}>
          <div className={styles.headerContent}>
            <div className={styles.profileHeader}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User Avatar'}
                  className={styles.profileAvatarLarge}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.profileAvatarFallbackLarge}>
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1>Welcome, {user?.name || user?.email?.split('@')[0]}</h1>
                <p className={styles.userEmailSub}>{user?.email}</p>
                <p>Manage your service requests and bookings.</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <Link href="/">
                <Button variant="outline">🏠 Home</Button>
              </Link>
              <Button onClick={() => setIsPasswordModalOpen(true)} variant="outline">
                {user?.hasPassword ? '🔑 Change Password' : '🔑 Set Password'}
              </Button>
              <Button onClick={handleSwitchToEngineer} variant="outline">🛠️ Engineer Mode</Button>
              <Button onClick={() => router.push('/search')} variant="outline">Book New Service</Button>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
          </div>
        </header>

      {passwordSuccessMsg && (
        <div style={{ margin: 'var(--space-md) auto', maxWidth: '1200px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)' }}>
          ✓ {passwordSuccessMsg}
        </div>
      )}

      {!user?.hasPassword && (
        <div style={{ margin: 'var(--space-md) auto', maxWidth: '1200px', padding: '12px 16px', background: 'rgba(102, 252, 241, 0.1)', color: 'var(--text-primary)', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡 <strong>Google Account Linked:</strong> You can also set an account password to log in with your email and password.</span>
          <Button size="sm" onClick={() => setIsPasswordModalOpen(true)}>Set Password</Button>
        </div>
      )}

      <SetPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        isInitialSet={!user?.hasPassword}
        onSuccess={(msg) => {
          setPasswordSuccessMsg(msg);
          setTimeout(() => setPasswordSuccessMsg(''), 5000);
        }}
      />

      <main className={styles.main}>
        <h2>Your Bookings</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {bookings.length === 0 && !error ? (
          <div className={`${styles.emptyState} glass-panel`}>
            <p>You don't have any bookings yet.</p>
            <Button onClick={() => router.push('/')}>Find an Engineer</Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {bookings.map((booking) => (
              <div key={booking.id} className={`${styles.card} glass-panel`}>
                <div className={styles.cardHeader}>
                  <h3>{booking.rateCard.serviceType}</h3>
                  <span className={`${styles.status} ${styles[booking.status.toLowerCase()]}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className={styles.details}>
                  <p><strong>Engineer:</strong> {booking.engineerProfile.user.name}</p>
                  <p><strong>Scheduled:</strong> {new Date(booking.scheduledAt).toLocaleDateString()}</p>
                  <p><strong>Address:</strong> {booking.address}</p>
                  <p><strong>Est. Time:</strong> {booking.estimatedDurationHours} hrs</p>
                  <p><strong>Rate:</strong> ${Number(booking.rateCard.hourlyRate)}/hr</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </>
  );
}
