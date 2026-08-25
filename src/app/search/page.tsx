'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import styles from './search.module.css';

interface Engineer {
  id: string;
  bio: string;
  averageRating: number;
  user: {
    name: string;
  };
  skills: { skill: { name: string } }[];
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '10';
  const skill = searchParams.get('skill') || '';

  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lat || !lng) {
      setError('Location is required to search for nearby engineers.');
      setIsLoading(false);
      return;
    }

    const fetchEngineers = async () => {
      try {
        const res = await api.get('/catalog/search', {
          params: { lat, lng, radius, skill }
        });
        setEngineers(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load engineers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngineers();
  }, [lat, lng, radius, skill]);

  if (isLoading) {
    return <div className={styles.loadingState}>Loading nearby experts...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => router.push('/')} className={styles.backBtn}>
            ← Back to Home
          </button>
          <h1>Engineers Near You</h1>
          <p>Found {engineers.length} verified experts {skill ? `for "${skill}"` : 'in your area'}</p>
        </div>
      </header>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.grid}>
          {engineers.map((engineer) => (
            <div key={engineer.id} className={`${styles.card} glass-panel animate-fade-in`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {engineer.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{engineer.user.name}</h3>
                  <div className={styles.rating}>
                    ⭐ {Number(engineer.averageRating).toFixed(1)} / 5.0
                  </div>
                </div>
              </div>
              
              <p className={styles.bio}>{engineer.bio}</p>
              
              <div className={styles.skills}>
                {engineer.skills.map((s, idx) => (
                  <span key={idx} className={styles.skillBadge}>
                    {s.skill.name}
                  </span>
                ))}
              </div>

              <Link href={`/engineer?id=${engineer.id}`} style={{ width: '100%' }}>
                <Button fullWidth>View Profile & Book</Button>
              </Link>
            </div>
          ))}
          
          {engineers.length === 0 && (
            <div className={styles.emptyState}>
              <p>No engineers found matching your criteria.</p>
              <Button onClick={() => router.push('/')} variant="outline">Adjust Search</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
