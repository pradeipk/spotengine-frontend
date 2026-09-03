import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | SpotEngineer',
  description: 'Privacy Policy and data protection practices for SpotEngineer users and engineers.',
};

export default function PrivacyPolicyPage() {
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
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Effective Date: September 1, 2026 • Last updated: September 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          <section className={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              SpotEngineer ("we," "our," or "us") is dedicated to protecting the privacy and personal data of our customers, engineers, and visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our platform, website (<strong>spotengineer.in</strong>), and associated IT service dispatch applications.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Information We Collect</h2>
            <p>We collect information that you directly provide to us, including:</p>
            <ul>
              <li><strong>Account Credentials:</strong> Name, email address, telephone number, and encrypted password.</li>
              <li><strong>Google OAuth Data:</strong> When you sign in via Google, we access your name, email address, profile photo, and Google user ID strictly to create and authenticate your account.</li>
              <li><strong>Engineer Professional Details:</strong> Resumes, skill certifications, hourly rates, and verified background documentation.</li>
              <li><strong>Location Data:</strong> Geolocation coordinates (latitude and longitude) provided with your browser permission to match you with nearby engineers or service requests.</li>
              <li><strong>Transaction & Booking Details:</strong> Service orders, booking history, scheduled appointment timestamps, and payment statuses.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following legitimate business purposes:</p>
            <ul>
              <li>Facilitating on-demand IT dispatch and matching customers with qualified engineers.</li>
              <li>Processing bookings, order verifications, and milestone payments.</li>
              <li>Authenticating users and preventing fraudulent access or impersonation.</li>
              <li>Sending transactional notifications, booking updates, and service confirmations.</li>
              <li>Improving platform reliability, response time, and customer support.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Google User Data & OAuth Compliance</h2>
            <p>
              SpotEngineer’s use and transfer of information received from Google APIs adheres to the{' '}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
              >
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
            <p>
              We do not sell Google user data to third parties, nor do we use Google user data for advertising purposes. Data received via Google OAuth is used solely for user identification and account access.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Data Storage and Security</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to protect your personal information. Sensitive data such as authentication tokens and passwords are encrypted using strong cryptographic protocols. Uploaded documents (resumes, certifications) are stored securely and only accessible by authorized account holders and administrative reviewers.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access and Correction:</strong> You can review and update your profile information, skills, and documents anytime from your dashboard.</li>
              <li><strong>Data Deletion:</strong> You may request the deletion of your account and associated documents by contacting support.</li>
              <li><strong>Location Permissions:</strong> You can revoke browser geolocation access at any time through your device or browser settings.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact our team at:
            </p>
            <p>
              <strong>Email:</strong> infospotengineer@gmail.com<br />
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

