'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [skill, setSkill] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });

          // Reverse geocode to get city name
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              data.address?.state ||
              '';
            setLocationName(city);
          } catch {
            // Silently fail — coordinates still work for search
            setLocationName('');
          }

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
      {/* Dark Hero Surface */}
      <div className="dark-surface">
        <nav className={`${styles.navbar} glass-panel`}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Spot Engineer Logo" width={40} height={40} className={styles.logoImage} />
            Spot Engineer <span className={styles.comingSoon}>(Coming Soon)</span>
          </div>
          <div className={styles.navLinks}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  href={
                    user.role === 'engineer'
                      ? '/dashboard/engineer'
                      : user.role === 'admin' || user.role === 'super_admin'
                      ? '/dashboard/admin'
                      : '/dashboard/customer'
                  }
                  className={styles.link}
                >
                  📋 Dashboard
                </Link>
                <Link
                  href={
                    user.role === 'engineer'
                      ? '/dashboard/engineer'
                      : user.role === 'admin' || user.role === 'super_admin'
                      ? '/dashboard/admin'
                      : '/dashboard/customer'
                  }
                >
                  <Button size="sm">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={(user.name || '').replace(/\s*undefined/gi, '').trim() || 'User'}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', marginRight: '6px', verticalAlign: 'middle', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    {(user.name || '').replace(/\s*undefined/gi, '').trim() ? (user.name || '').replace(/\s*undefined/gi, '').trim().split(' ')[0] : 'My Account'}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className={styles.link}>Sign In</Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={`${styles.heroContent} animate-slide-up`}>
            <h1 className={styles.title}>
              On-Demand IT Services & {' '}
              <span className={styles.gradientText}>Engineering Marketplace</span>
            </h1>
            <p className={styles.subtitle}>
              Book verified, top-tier engineers near you for immediate onsite support.
            </p>

            <form onSubmit={handleSearch} className={`${styles.searchBox} glass-panel`}>
              <div className={styles.searchInputGroup}>
                <Input
                  label=""
                  placeholder="Search service (e.g. Networking)"
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
                  {location ? `📍 ${locationName || 'Location Found'}` : '📍 Locate Me'}
                </Button>
              </div>

              <Button type="submit" className={styles.searchBtn}>
                Find Engineers
              </Button>
            </form>
          </div>
          
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
        </section>
      </div>

      {/* Light Content Sections - Marketing Content */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Why Choose SpotEngineer?</h2>
          <p>India's first transparent, geofenced marketplace connecting businesses with verified IT talent.</p>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🛡️</div>
            <h3>Verified Professionals</h3>
            <p>Every engineer passes Aadhaar eKYC, live selfie liveness detection, and strict credential checks before they can accept jobs on our platform.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📍</div>
            <h3>Hyperlocal Dispatch</h3>
            <p>Our geospatial matching finds you the absolute best engineers within a 40km radius for lightning-fast onsite resolution.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>💸</div>
            <h3>Secure Escrow Payments</h3>
            <p>Your money is held safely in escrow and only released to the engineer via UPI split-settlement once you confirm the job is complete.</p>
          </div>
        </div>
      </section>

      {/* Full width alternative background */}
      <div className={styles.bgAlt}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Services We Cover</h2>
            <p>From one-off break-fixes to ongoing infrastructure management, we have the certified talent you need.</p>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🌐</div>
              <h3>Network & Security</h3>
              <p>Firewall configuration, router setup, LAN troubleshooting, and enterprise vulnerability patching.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>☁️</div>
              <h3>Cloud Infrastructure</h3>
              <p>AWS/Azure deployments, physical server migrations, and active directory management.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>💻</div>
              <h3>On-Site AMC</h3>
              <p>Annual Maintenance Contracts for office hardware, endpoints, POS systems, and server racks.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🧠</div>
              <h3>Software & AI</h3>
              <p>Custom software integrations, application deployment, and local enterprise AI model setup.</p>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.footerCta}>
          <div style={{ marginBottom: '24px' }}>
            <Image src="/logo.png" alt="Spot Engineer Logo" width={80} height={80} className={styles.logoImage} />
          </div>
          <h2>Ready to get started?</h2>
          <p>Join thousands of businesses getting instant IT support, or register as a certified engineer and start earning on your own schedule.</p>
          <div className={styles.ctaButtons}>
            <Link href="/register">
              <Button style={{ background: '#ffffff', color: '#0f172a', border: 'none' }}>Hire an Engineer</Button>
            </Link>
            <Link href="/register">
              <Button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#ffffff' }}>Apply to Work</Button>
            </Link>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.85rem', opacity: 0.8 }}>
            <Link href="/privacy" style={{ color: '#ffffff', textDecoration: 'none' }}>Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" style={{ color: '#ffffff', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
