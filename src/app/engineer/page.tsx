'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import styles from './profile.module.css';

interface EngineerDetail {
  id: string;
  bio: string;
  availabilityRadius: number;
  averageRating: number;
  user: {
    name: string;
  };
  skills: { skill: { name: string } }[];
  certifications: { name: string; issuer: string; isVerified: boolean }[];
  rateCards: { id: string; serviceType: string; hourlyRate: string; description: string }[];
}

function EngineerProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [engineer, setEngineer] = useState<EngineerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchEngineer = async () => {
      try {
        const res = await api.get(`/catalog/engineer/${id}`);
        setEngineer(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load engineer profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineer();
  }, [id]);

  if (isLoading) {
    return <div className={styles.loadingState}>Loading profile...</div>;
  }

  if (error || !engineer) {
    return (
      <div className={styles.errorState}>
        <p>{error || 'Engineer not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Profile Section */}
      <div className={`${styles.header} glass-panel`}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back to Search
        </button>
        <div className={styles.headerFlex}>
          <div className={styles.avatarLarge}>
            {engineer.user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1>{engineer.user.name}</h1>
            <div className={styles.statsRow}>
              <span className={styles.stat}>⭐ {Number(engineer.averageRating).toFixed(1)} / 5.0</span>
              <span className={styles.stat}>📍 Serves up to {engineer.availabilityRadius}km</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Main Info Column */}
        <div className={styles.mainCol}>
          <section className={`${styles.section} glass-panel`}>
            <h2>About Me</h2>
            <p className={styles.bioText}>{engineer.bio}</p>
          </section>

          <section className={`${styles.section} glass-panel`}>
            <h2>Skills & Expertise</h2>
            <div className={styles.skills}>
              {engineer.skills.map((s: any, idx) => (
                <span key={idx} className={styles.skillBadge}>
                  {s.skillName || s.category?.name || s.skill?.name || 'Skill'}
                </span>
              ))}
              {engineer.skills.length === 0 && <span className={styles.emptyText}>No skills listed</span>}
            </div>
          </section>

          <section className={`${styles.section} glass-panel`}>
            <h2>Certifications</h2>
            <ul className={styles.certList}>
              {engineer.certifications.map((cert, idx) => (
                <li key={idx} className={styles.certItem}>
                  <div className={styles.certName}>{cert.name}</div>
                  <div className={styles.certIssuer}>{cert.issuer}</div>
                  {cert.isVerified && <span className={styles.verifiedBadge}>✓ Verified</span>}
                </li>
              ))}
              {engineer.certifications.length === 0 && <span className={styles.emptyText}>No certifications listed</span>}
            </ul>
          </section>
        </div>

        {/* Booking Column */}
        <div className={styles.sideCol}>
          <section className={`${styles.bookingSection} glass-panel`}>
            <h2>Available Services</h2>
            {engineer.rateCards.length > 0 ? (
              <div className={styles.rateCards}>
                {engineer.rateCards.map((rate) => (
                  <div key={rate.id} className={styles.rateCard}>
                    <div className={styles.rateHeader}>
                      <h3>{rate.serviceType}</h3>
                      <span className={styles.price}>${Number(rate.hourlyRate)}/hr</span>
                    </div>
                    <p className={styles.rateDesc}>{rate.description}</p>
                    <Button 
                      fullWidth 
                      onClick={() => router.push(`/booking?engineerId=${engineer.id}&rateCardId=${rate.id}`)}
                    >
                      Book Service
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>This engineer hasn't set up their services yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function EngineerProfilePage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}>Loading profile...</div>}>
      <EngineerProfileContent />
    </Suspense>
  );
}
