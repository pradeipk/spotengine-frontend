'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [skill, setSkill] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error locating:', error);
          setIsLocating(false);
          alert('Could not determine your location. Please ensure location services are enabled.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Please click "Locate Me" first so we can find engineers near you!');
      return;
    }
    
    const query = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      radius: '10', // Default 10km radius
    });
    
    if (skill) {
      query.append('skill', skill);
    }

    router.push(`/search?${query.toString()}`);
  };

  return (
    <div className={styles.main}>
      {/* Navbar */}
      <nav className={`${styles.navbar} glass-panel`}>
        <div className={styles.logo}>SpotEngine<span className={styles.accent}>.</span></div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.link}>Sign In</Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} animate-slide-up`}>
          <h1 className={styles.title}>
            On-Demand IT Services &<br />
            <span className={styles.gradientText}>Engineering Marketplace</span>
          </h1>
          <p className={styles.subtitle}>
            Book verified, top-tier engineers near you for immediate onsite support.
          </p>

          <form onSubmit={handleSearch} className={`${styles.searchBox} glass-panel`}>
            <div className={styles.searchInputGroup}>
              <Input
                label=""
                placeholder="What service do you need? (e.g. Server Setup, Networking)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                fullWidth
                className={styles.skillInput}
              />
            </div>
            
            <div className={styles.locationGroup}>
              <Button 
                type="button" 
                onClick={handleLocateMe}
                isLoading={isLocating}
                className={location ? styles.locatedBtn : styles.locateBtn}
              >
                {location ? '📍 Location Found' : '📍 Locate Me'}
              </Button>
            </div>

            <Button type="submit" className={styles.searchBtn}>
              Find Engineers
            </Button>
          </form>
        </div>
      </section>
      
      {/* Floating abstract decorative elements */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
    </div>
  );
}
