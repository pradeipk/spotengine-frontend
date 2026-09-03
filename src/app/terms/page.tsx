import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service | SpotEngineer',
  description: 'Terms and conditions governing the use of the SpotEngineer platform and IT dispatch services.',
};

export default function TermsOfServicePage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSurface}>
        <nav className={styles.navbar}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Spot Engineer Logo"
              width={36}
              height={36}
              className={styles.logoImage}
            />
            Spot Engineer
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.link}>Home</Link>
            <Link href="/login" className={styles.link}>Sign In</Link>
          </div>
        </nav>

        <div className={styles.hero}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.lastUpdated}>Effective Date: September 1, 2026 • Last updated: September 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          <section className={styles.section}>
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using SpotEngineer (available at <strong>spotengineer.in</strong>) and any related applications or services, you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you may not access or use the platform.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Description of Services</h2>
            <p>
              SpotEngineer provides an on-demand marketplace connecting customers (businesses and individuals needing IT infrastructure, networking, hardware maintenance, and technical engineering services) with verified freelance or franchise engineers.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Account Registration & Security</h2>
            <p>
              To use key features such as booking services or receiving client inquiries, you must create an account directly or through third-party authentication (such as Google OAuth).
            </p>
            <ul>
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>You are solely responsible for maintaining the confidentiality of your credentials and account access.</li>
              <li>SpotEngineer reserves the right to suspend or terminate accounts that provide false information or violate platform standards.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Engineer Verification & Standards</h2>
            <p>
              Engineers registering to offer services agree to submit truthful certifications, experience records, and resume documents. While SpotEngineer conducts verification reviews, customers are encouraged to review engineer ratings, skills, and past performance before confirming bookings.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Bookings, Payments & Escrow</h2>
            <p>
              All service estimates and quotes are calculated based on transparent rate cards, service scopes, and geographic distance.
            </p>
            <ul>
              <li>Payments for booked services are processed securely via integrated payment gateways.</li>
              <li>Funds may be held in escrow until the customer signs off on milestone completion or inspection.</li>
              <li>Cancellations and refunds are subject to our cancellation window and platform dispute resolution policies.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Prohibited Activities</h2>
            <p>Users agree not to:</p>
            <ul>
              <li>Attempt to circumvent platform payment processing or solicit off-platform transactions.</li>
              <li>Harass, threaten, or defraud other users or service providers.</li>
              <li>Reverse engineer, scrape, or interfere with the normal operation and security of the platform.</li>
              <li>Impersonate any person or entity or misrepresent professional credentials.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Limitation of Liability</h2>
            <p>
              SpotEngineer acts as a technology platform connecting customers with independent service providers. To the maximum extent permitted by applicable law, SpotEngineer is not liable for indirect, incidental, punitive, or consequential damages arising from service engagements or system downtime.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Modifications to Terms</h2>
            <p>
              We may modify these Terms of Service from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the platform following the posting of revised terms indicates your acceptance.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Contact Information</h2>
            <p>
              For inquiries, legal notices, or questions regarding these Terms, please contact:
            </p>
            <p>
              <strong>Email:</strong> legal@spotengineer.in / support@spotengineer.in<br />
              <strong>Platform:</strong> https://spotengineer.in
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
          <span>•</span>
          <Link href="/" className={styles.footerLink}>Home</Link>
        </div>
        <p>© {new Date().getFullYear()} SpotEngineer. All rights reserved.</p>
      </footer>
    </div>
  );
}

