'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import styles from './booking.module.css';

interface RateCard {
  id: string;
  serviceType: string;
  hourlyRate: string;
  description: string;
}

interface EngineerInfo {
  id: string;
  user: {
    name: string;
  };
}

export default function BookingCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const engineerId = searchParams.get('engineerId');
  const rateCardId = searchParams.get('rateCardId');

  const { user } = useAuthStore();

  const [engineer, setEngineer] = useState<EngineerInfo | null>(null);
  const [rateCard, setRateCard] = useState<RateCard | null>(null);
  const [address, setAddress] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Must be logged in to book
      router.push('/login');
      return;
    }

    if (!engineerId || !rateCardId) return;

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/catalog/engineer/${engineerId}`);
        setEngineer(res.data);
        
        const selectedRate = res.data.rateCards.find((r: RateCard) => r.id === rateCardId);
        if (selectedRate) {
          setRateCard(selectedRate);
        } else {
          setError('Selected service is no longer available.');
        }
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [engineerId, rateCardId, user, router]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Please provide a service address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/booking', {
        engineerProfileId: engineerId,
        rateCardId,
        scheduledAt: new Date(Date.now() + 86400000), // Defaulting to tomorrow for MVP
        address,
        estimatedDurationHours: parseFloat(estimatedHours)
      });
      
      // Success! Redirect to customer dashboard
      router.push('/dashboard/customer?booking=success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.loadingState}>Loading checkout...</div>;
  if (error || !rateCard || !engineer) return <div className={styles.errorState}>{error}</div>;

  const totalEstimate = parseFloat(rateCard.hourlyRate) * parseFloat(estimatedHours || '0');

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>← Go Back</button>
      
      <div className={styles.grid}>
        {/* Checkout Form */}
        <div className={styles.mainCol}>
          <div className={`${styles.card} glass-panel`}>
            <h1>Finalize Your Booking</h1>
            <p className={styles.subtitle}>You are booking {engineer.user.name}</p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleBooking} className={styles.form}>
              <div className={styles.formGroup}>
                <Input
                  label="Service Address"
                  placeholder="e.g. 123 Tech Park, Bangalore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Estimated Duration (Hours)"
                  type="number"
                  min="1"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  required
                  fullWidth
                />
              </div>
              
              <div className={styles.note}>
                Note: For this MVP, bookings are automatically scheduled for tomorrow.
              </div>

              <Button type="submit" fullWidth isLoading={isSubmitting} className={styles.submitBtn}>
                Confirm Booking
              </Button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.sideCol}>
          <div className={`${styles.card} glass-panel sticky`}>
            <h2>Order Summary</h2>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Service:</span>
              <span className={styles.summaryValue}>{rateCard.serviceType}</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rate:</span>
              <span className={styles.summaryValue}>${Number(rateCard.hourlyRate)}/hr</span>
            </div>
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Est. Hours:</span>
              <span className={styles.summaryValue}>{estimatedHours} hrs</span>
            </div>
            
            <div className={styles.divider}></div>
            
            <div className={styles.totalRow}>
              <span>Estimated Total</span>
              <span className={styles.totalPrice}>${totalEstimate.toFixed(2)}</span>
            </div>
            <p className={styles.disclaimer}>Final price may vary based on actual hours worked.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
