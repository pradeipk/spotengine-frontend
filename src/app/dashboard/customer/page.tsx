'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
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
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'customer') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await api.get('/booking/customer');
        setBookings(res.data);
      } catch (err) {
        setError('Failed to load your bookings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) return <div className={styles.loadingState}>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <header className={`${styles.header} glass-panel`}>
        <div className={styles.headerContent}>
          <div>
            <h1>Welcome, {user?.email}</h1>
            <p>Manage your service requests and bookings.</p>
          </div>
          <div className={styles.headerActions}>
            <Button onClick={() => router.push('/')} variant="outline">Book New Service</Button>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </header>

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
  );
}
