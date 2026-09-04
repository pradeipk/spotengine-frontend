'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { AppNavbar } from '@/components/ui/AppNavbar';
import styles from './admin.module.css';

interface DashboardStats {
  totalEngineers?: number;
  activeBookings?: number;
  totalGmv?: number;
  platformRevenue?: number;
  activeTenants?: number;
  pendingCertifications?: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  gstin: string;
  isActive: boolean;
  createdAt: string;
}

interface PendingCertification {
  id: string;
  name: string;
  issuer: string;
  credentialId: string;
  issueDate: string;
  isVerified: boolean;
  engineer?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

interface LedgerEntry {
  id: string;
  bookingId: string;
  engineerId: string;
  totalJobAmount: number;
  commissionPercentage: number;
  platformFee: number;
  engineerPayout: number;
  status: string;
  payoutDate?: string;
  createdAt: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'engineers' | 'ledger' | 'users'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [certifications, setCertifications] = useState<PendingCertification[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch Stats
      const statsRes = await api.get('/admin/dashboard');
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats(statsData);

      // 2. Fetch Tenants
      const tenantsRes = await api.get('/tenants');
      const tenantsData = tenantsRes.data?.data?.items || tenantsRes.data?.items || tenantsRes.data || [];
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);

      // 3. Fetch Pending Certifications
      const certRes = await api.get('/admin/verifications');
      const certData = certRes.data?.data || certRes.data || [];
      setCertifications(Array.isArray(certData) ? certData : []);

      // 4. Fetch Ledger
      const ledgerRes = await api.get('/payments/ledger');
      const ledgerData = ledgerRes.data?.data || ledgerRes.data || [];
      setLedger(Array.isArray(ledgerData) ? ledgerData : []);

      // 5. Fetch Users
      const usersRes = await api.get('/users');
      const usersData = usersRes.data?.data || usersRes.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load admin dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    fetchData();
  }, [user, router]);

  const handleToggleTenant = async (tenantId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/tenants/${tenantId}/status`, { isActive: !currentStatus });
      setActionMessage(`Tenant status successfully ${!currentStatus ? 'activated' : 'deactivated'}.`);
      fetchData();
    } catch (err: any) {
      setError('Failed to update tenant status.');
    }
  };

  const handleVerifyCertification = async (certId: string) => {
    try {
      await api.patch(`/admin/certifications/${certId}/verify`, {});
      setActionMessage('Certification successfully verified!');
      fetchData();
    } catch (err: any) {
      setError('Failed to verify certification.');
    }
  };

  const handleSettlePayout = async (ledgerId: string) => {
    try {
      await api.patch(`/payments/ledger/${ledgerId}/settle`, {});
      setActionMessage('Engineer payout successfully settled!');
      fetchData();
    } catch (err: any) {
      setError('Failed to settle payout.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading && !stats) {
    return <div className={styles.loadingState}>Loading Admin Dashboard...</div>;
  }

  const cleanName = (user?.name || '').replace(/\s*undefined/gi, '').trim();
  const userDisplayName = cleanName || user?.email?.split('@')[0] || 'Admin';

  return (
    <>
      <AppNavbar />
      <div className={styles.container}>
        {/* Header */}
        <header className={`${styles.header} glass-panel`}>
          <div className={styles.headerContent}>
            <div>
              <div className={styles.titleRow}>
                <h1>SpotEngineer Control Center</h1>
                <span className={styles.roleBadge}>
                  {isSuperAdmin ? '⚡ Super Admin' : '🛡️ Franchise Admin'}
                </span>
              </div>
              <p>Welcome back, <strong>{userDisplayName}</strong>{user?.email ? ` (${user.email})` : ''}. Manage regional tenants, engineers & revenue.</p>
            </div>
          <div className={styles.headerActions}>
            <a 
              href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace('/api/v1', '/api/docs')} 
              target="_blank" 
              rel="noreferrer"
            >
              <Button variant="outline">📚 Swagger Docs</Button>
            </a>
            <Button variant="outline" onClick={fetchData}>🔄 Refresh</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {actionMessage && (
        <div className={styles.errorMessage} style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.3)' }}>
          {actionMessage}
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>🏢</div>
          <div className={styles.kpiInfo}>
            <h3>Franchise Tenants</h3>
            <div className={styles.kpiValue}>{stats?.activeTenants ?? tenants.length}</div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>👨‍🔧</div>
          <div className={styles.kpiInfo}>
            <h3>Verified Engineers</h3>
            <div className={styles.kpiValue}>{stats?.totalEngineers ?? users.filter(u => u.role === 'engineer').length}</div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>📑</div>
          <div className={styles.kpiInfo}>
            <h3>Pending Approvals</h3>
            <div className={styles.kpiValue}>{certifications.length}</div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>💰</div>
          <div className={styles.kpiInfo}>
            <h3>Platform GMV</h3>
            <div className={styles.kpiValue}>
              ₹{Number(stats?.totalGmv || ledger.reduce((acc, curr) => acc + Number(curr.totalJobAmount || 0), 0)).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'tenants' ? styles.active : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          🏢 Regional Tenants ({tenants.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'engineers' ? styles.active : ''}`}
          onClick={() => setActiveTab('engineers')}
        >
          🎓 Certification Queue ({certifications.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'ledger' ? styles.active : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          💳 Payout Ledger ({ledger.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Directory ({users.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={`${styles.panel} glass-panel`}>
          <div className={styles.panelHeader}>
            <h2>Regional Performance & Operations</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            SpotEngineer is operating across <strong>{tenants.length} regional franchise territories</strong>. 
            All customer bookings are protected by escrow, and engineer payouts are settled post-completion.
          </p>

          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>🚀 Quick Actions</h3>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Review {certifications.length} pending engineer skill certifications</li>
                <li>Audit unsettled balances in the Payout Ledger ({ledger.filter(l => l.status !== 'settled').length} pending)</li>
                <li>Provision new franchise tenants with custom GSTIN & pricing cards</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>🔐 Multi-Tenancy Isolation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Role: <strong>{user?.role}</strong> | Cross-Tenant Scope: <strong>{isSuperAdmin ? 'Global Platform View' : 'Single Franchise Scope'}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANTS */}
      {activeTab === 'tenants' && (
        <div className={`${styles.panel} glass-panel`}>
          <div className={styles.panelHeader}>
            <h2>Franchise Tenants & Regional Portals</h2>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Franchise Name</th>
                  <th>Slug</th>
                  <th>Location</th>
                  <th>GSTIN</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td><code>{t.slug}</code></td>
                    <td>{t.city}, {t.state}</td>
                    <td>{t.gstin}</td>
                    <td>
                      <span className={`${styles.badge} ${t.isActive ? styles.active : styles.inactive}`}>
                        {t.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        className={styles.actionBtn}
                        onClick={() => handleToggleTenant(t.id, t.isActive)}
                      >
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATIONS QUEUE */}
      {activeTab === 'engineers' && (
        <div className={`${styles.panel} glass-panel`}>
          <div className={styles.panelHeader}>
            <h2>Engineer Verification & Certification Queue</h2>
          </div>
          {certifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p>🎉 All engineer certifications have been reviewed and verified!</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Engineer</th>
                    <th>Certification Name</th>
                    <th>Issuer</th>
                    <th>Credential ID</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert) => (
                    <tr key={cert.id}>
                      <td><strong>{cert.engineer?.user?.name || 'Engineer'}</strong> ({cert.engineer?.user?.email})</td>
                      <td>{cert.name}</td>
                      <td>{cert.issuer}</td>
                      <td><code>{cert.credentialId || 'N/A'}</code></td>
                      <td>{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td>
                        <Button
                          className={styles.actionBtn}
                          onClick={() => handleVerifyCertification(cert.id)}
                        >
                          ✓ Approve & Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAYOUT LEDGER */}
      {activeTab === 'ledger' && (
        <div className={`${styles.panel} glass-panel`}>
          <div className={styles.panelHeader}>
            <h2>Commission Split & Engineer Payout Ledger</h2>
          </div>
          {ledger.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No transactions found in payout ledger yet.</p>
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Gross Amount</th>
                    <th>Platform Fee (15-20%)</th>
                    <th>Engineer Payout</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id}>
                      <td><code>{entry.bookingId ? entry.bookingId.substring(0, 8) + '...' : 'N/A'}</code></td>
                      <td>₹{Number(entry.totalJobAmount).toFixed(2)}</td>
                      <td>₹{Number(entry.platformFee).toFixed(2)} ({entry.commissionPercentage}%)</td>
                      <td><strong>₹{Number(entry.engineerPayout).toFixed(2)}</strong></td>
                      <td>
                        <span className={`${styles.badge} ${entry.status === 'settled' ? styles.settled : styles.pending}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        {entry.status !== 'settled' ? (
                          <Button
                            variant="outline"
                            className={styles.actionBtn}
                            onClick={() => handleSettlePayout(entry.id)}
                          >
                            💸 Settle Payout
                          </Button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className={`${styles.panel} glass-panel`}>
          <div className={styles.panelHeader}>
            <h2>Registered Users Across Tenants</h2>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tenant ID</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td><code>{u.tenantId ? u.tenantId.substring(0, 8) + '...' : 'Platform (HQ)'}</code></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

