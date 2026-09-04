'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from './Button';
import styles from './AppNavbar.module.css';

interface AppNavbarProps {
  onSwitchRole?: () => void;
  switchRoleLabel?: string;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onSwitchRole,
  switchRoleLabel,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const dashboardUrl =
    user?.role === 'engineer'
      ? '/dashboard/engineer'
      : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/dashboard/admin'
      : '/dashboard/customer';

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo} title="SpotEngineer Home">
          <Image
            src="/logo.png"
            alt="Spot Engineer Logo"
            width={34}
            height={34}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>Spot Engineer</span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
            title="Home"
          >
            <span>🏠</span>
            <span className={styles.navLinkText}>Home</span>
          </Link>
          <Link
            href="/search"
            className={`${styles.navLink} ${pathname === '/search' ? styles.navLinkActive : ''}`}
            title="Find Engineers"
          >
            <span>🔍</span>
            <span className={styles.navLinkText}>Find Engineers</span>
          </Link>
          {user && (
            <Link
              href={dashboardUrl}
              className={`${styles.navLink} ${pathname.startsWith('/dashboard') ? styles.navLinkActive : ''}`}
              title="Dashboard"
            >
              <span>📋</span>
              <span className={styles.navLinkText}>Dashboard</span>
            </Link>
          )}
        </div>
      </div>

      <div className={styles.rightSection}>
        {user ? (
          <>
            <div className={styles.userBadge} title={`Logged in as ${user.email}`}>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className={styles.avatar}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.avatarFallback}>{initial}</div>
              )}
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.rolePill}>{user.role}</span>
            </div>

            {onSwitchRole && switchRoleLabel && (
              <Button size="sm" variant="outline" onClick={onSwitchRole}>
                {switchRoleLabel}
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button size="sm" variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
