import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <nav className={`${styles.navbar} glass-panel`}>
        <div className={styles.logo}>SpotEngine</div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/register" className={`${styles.navButton} glow-effect`}>Get Started</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <h1 className={styles.title}>
          Expert Service.<br />
          <span className={styles.highlight}>Instantly Booked.</span>
        </h1>
        <p className={styles.subtitle}>
          Discover verified engineers and technicians in your radius. Transparent pricing, instant booking.
        </p>
        
        <div className={styles.searchBox}>
          <input type="text" placeholder="What service do you need?" className={styles.searchInput} />
          <button className={`${styles.searchBtn} glow-effect`}>Search</button>
        </div>
      </section>
    </div>
  );
}
