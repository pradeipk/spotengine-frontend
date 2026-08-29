'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './engineer.module.css';

interface BookingJob {
  id: string;
  serviceType: string;
  status: string;
  totalAmount?: number;
  scheduledTime?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  location?: {
    address?: string;
  };
  description?: string;
}

interface SkillCategory {
  id: string;
  name: string;
  slug: string;
}

interface UploadedDoc {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function EngineerDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  const [activeTab, setActiveTab] = useState<'inquiries' | 'resume' | 'location' | 'skills'>('inquiries');
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<BookingJob[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);

  // Profile Form States
  const [bio, setBio] = useState('');
  const [lat, setLat] = useState<number | string>(18.5204);
  const [lng, setLng] = useState<number | string>(73.8567);
  const [radius, setRadius] = useState<number>(25);

  // Skill Form States
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [skillName, setSkillName] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch or initialize Engineer Profile
      const profileRes = await api.get('/catalog/profile').catch(() => null);
      if (profileRes?.data) {
        const p = profileRes.data.data || profileRes.data;
        setProfile(p);
        if (p.bio) setBio(p.bio);
        if (p.lat) setLat(p.lat);
        if (p.lng) setLng(p.lng);
        if (p.availabilityRadius) setRadius(p.availabilityRadius);
      }

      // 2. Fetch Assigned Bookings / Inquiries
      const jobsRes = await api.get('/bookings/my-jobs').catch(() => null);
      if (jobsRes?.data) {
        const items = jobsRes.data.data || jobsRes.data || [];
        setJobs(Array.isArray(items) ? items : []);
      }

      // 3. Fetch Skill Categories
      const catRes = await api.get('/catalog/categories').catch(() => null);
      if (catRes?.data) {
        const cats = catRes.data.data || catRes.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
        if (cats.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(cats[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch role to customer
  const handleSwitchToCustomer = async () => {
    try {
      await api.patch('/users/role', { role: 'customer' });
      if (user) setUser({ ...user, role: 'customer' });
      router.push('/dashboard/customer');
    } catch (err) {
      router.push('/dashboard/customer');
    }
  };

  // Detect GPS coordinates
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
          setMessage('📍 Location detected successfully from your device!');
          setTimeout(() => setMessage(''), 4000);
        },
        (err) => {
          setError('Unable to retrieve location. Please allow GPS permissions.');
          setTimeout(() => setError(''), 4000);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Save Profile & Location
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      await api.put('/catalog/profile', {
        bio,
        lat: Number(lat),
        lng: Number(lng),
        availabilityRadius: Number(radius),
      });
      setMessage('✅ Profile & Service Radius updated successfully!');
      setTimeout(() => setMessage(''), 4000);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Document / Resume Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string = 'resume') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    setIsUploading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/users/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const docUrl = res.data?.url || `/uploads/${file.name}`;
      setUploadedDocs((prev) => [
        ...prev,
        {
          name: file.name,
          type: docType.toUpperCase(),
          url: docUrl,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setMessage(`📄 ${file.name} uploaded successfully!`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Ensure file is PDF, PNG, or JPG under 5MB.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      await api.post('/catalog/profile/skills', {
        categoryId: selectedCategoryId,
        skillName: skillName.trim(),
        experienceYears: Number(experienceYears),
      });

      setMessage(`🛠️ Skill "${skillName}" added to your profile!`);
      setSkillName('');
      setTimeout(() => setMessage(''), 4000);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setIsSaving(false);
    }
  };

  // Progress Booking Status
  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    setMessage('');
    setError('');
    try {
      await api.patch(`/bookings/${jobId}/status`, { status: newStatus });
      setMessage(`Updated job status to ${newStatus.toUpperCase()}`);
      setTimeout(() => setMessage(''), 4000);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={`${styles.header} glass-panel`}>
        <div className={styles.headerContent}>
          <h1>
            SpotEngineer Resource Center
            <span className={styles.roleBadge}>🛠️ Engineer</span>
            <span className={styles.verifiedBadge}>✓ Ready for Jobs</span>
          </h1>
          <p>Logged in as <strong>{user?.email}</strong>. Manage your profile, resume, service radius & job inquiries.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={handleSwitchToCustomer}>👤 Customer Mode</Button>
          <Button variant="outline" onClick={fetchDashboardData}>🔄 Refresh</Button>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      {/* Status Alerts */}
      {message && <div className={styles.alertSuccess}>{message}</div>}
      {error && <div className={styles.alertError}>{error}</div>}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>📥</div>
          <div className={styles.kpiInfo}>
            <h3>Total Inquiries</h3>
            <div className={styles.kpiValue}>{jobs.length}</div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>⚡</div>
          <div className={styles.kpiInfo}>
            <h3>Active Jobs</h3>
            <div className={styles.kpiValue}>
              {jobs.filter((j) => ['booked', 'en_route', 'in_progress'].includes(j.status)).length}
            </div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>📍</div>
          <div className={styles.kpiInfo}>
            <h3>Service Radius</h3>
            <div className={styles.kpiValue}>{radius} km</div>
          </div>
        </div>

        <div className={`${styles.kpiCard} glass-panel`}>
          <div className={styles.kpiIcon}>⭐</div>
          <div className={styles.kpiInfo}>
            <h3>Rating</h3>
            <div className={styles.kpiValue}>{Number(profile?.averageRating || 5.0).toFixed(1)} / 5.0</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'inquiries' ? styles.active : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          📥 Inquiries & Jobs ({jobs.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'resume' ? styles.active : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          📄 Resume & Verification ({uploadedDocs.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'location' ? styles.active : ''}`}
          onClick={() => setActiveTab('location')}
        >
          📍 Service Area & GPS
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.active : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          🛠️ Skills & Bio ({profile?.skills?.length || 0})
        </button>
      </div>

      {/* TAB 1: INCOMING JOBS & INQUIRIES */}
      {activeTab === 'inquiries' && (
        <section className={`${styles.panel} glass-panel`}>
          <h2>Incoming Customer Requests & Service Jobs</h2>
          <p className={styles.panelSubtitle}>
            Review customer service requests matching your skill category and GPS service radius.
          </p>

          {jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No Incoming Job Inquiries Yet</h3>
              <p>When customers in your area request IT support, their requests will appear here instantly.</p>
            </div>
          ) : (
            <div className={styles.jobList}>
              {jobs.map((job) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobDetails}>
                    <h3>{job.serviceType || 'IT Support Service'}</h3>
                    <p>{job.description || 'On-demand technical assistance requested by customer.'}</p>
                    <p><strong>Customer:</strong> {job.customer?.name || job.customer?.email || 'Registered Customer'}</p>
                    <div className={styles.jobMeta}>
                      <span className={`${styles.statusBadge} ${styles[`status_${job.status}`] || ''}`}>
                        {job.status}
                      </span>
                      {job.totalAmount && <span><strong>Fee:</strong> ₹{job.totalAmount}</span>}
                    </div>
                  </div>

                  <div className={styles.jobActions}>
                    {job.status === 'quoted' && (
                      <Button onClick={() => handleUpdateJobStatus(job.id, 'booked')}>
                        ✓ Accept Booking
                      </Button>
                    )}
                    {job.status === 'booked' && (
                      <Button onClick={() => handleUpdateJobStatus(job.id, 'en_route')}>
                        🚗 Start Travel (En Route)
                      </Button>
                    )}
                    {job.status === 'en_route' && (
                      <Button onClick={() => handleUpdateJobStatus(job.id, 'in_progress')}>
                        📍 Check In at Location
                      </Button>
                    )}
                    {job.status === 'in_progress' && (
                      <Button onClick={() => handleUpdateJobStatus(job.id, 'completed')}>
                        🎉 Mark Completed
                      </Button>
                    )}
                    {job.status === 'completed' && (
                      <span className={styles.verifiedBadge}>✓ Job Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: RESUME & DOCUMENT UPLOAD */}
      {activeTab === 'resume' && (
        <section className={`${styles.panel} glass-panel`}>
          <h2>Upload Resume & Certifications</h2>
          <p className={styles.panelSubtitle}>
            Upload your CV, technical certifications, or identity documents for quick franchise verification.
          </p>

          <div
            className={styles.uploadZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.uploadIcon}>📄</div>
            <div className={styles.uploadTitle}>
              {isUploading ? 'Uploading Document...' : 'Click to Upload Resume or Drag & Drop'}
            </div>
            <div className={styles.uploadHint}>Supports PDF, DOCX, PNG, JPG (Max 5MB)</div>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.hiddenInput}
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e, 'resume')}
            />
          </div>

          <h3>Uploaded Documents</h3>
          {uploadedDocs.length === 0 ? (
            <p className={styles.emptyText}>No documents uploaded yet. Upload your resume above.</p>
          ) : (
            <div className={styles.docList}>
              {uploadedDocs.map((doc, idx) => (
                <div key={idx} className={styles.docItem}>
                  <div className={styles.docInfo}>
                    <span className={styles.docIcon}>📎</span>
                    <div>
                      <div className={styles.docName}>{doc.name}</div>
                      <div className={styles.docMeta}>{doc.type} • Uploaded at {doc.uploadedAt}</div>
                    </div>
                  </div>
                  <span className={styles.verifiedBadge}>✓ Uploaded</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: LOCATION & SERVICE RADIUS */}
      {activeTab === 'location' && (
        <section className={`${styles.panel} glass-panel`}>
          <h2>Service Location & Radius</h2>
          <p className={styles.panelSubtitle}>
            Set your home base GPS coordinates and maximum travel distance to receive nearby customer jobs.
          </p>

          <form onSubmit={handleSaveProfile}>
            <div className={styles.formGrid}>
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={handleDetectLocation}>
                📍 Detect My Current Location
              </Button>
            </div>

            <div className={styles.sliderGroup}>
              <div className={styles.sliderLabel}>
                <span>Coverage Service Radius:</span>
                <span className={styles.radiusValue}>{radius} Kilometers</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <Button type="submit" isLoading={isSaving}>
              Save Service Location & Radius
            </Button>
          </form>
        </section>
      )}

      {/* TAB 4: SKILLS & BIO */}
      {activeTab === 'skills' && (
        <section className={`${styles.panel} glass-panel`}>
          <h2>Skills, Experience & Bio</h2>
          <p className={styles.panelSubtitle}>
            Highlight your technical capabilities and background for customers.
          </p>

          <form onSubmit={handleSaveProfile} style={{ marginBottom: '2rem' }}>
            <div className={styles.formGroup}>
              <label>Professional Bio / Summary</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe your technical expertise, certifications, and years in the field..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" isLoading={isSaving}>
                Update Bio
              </Button>
            </div>
          </form>

          <h3>Add Technical Skill</h3>
          <form onSubmit={handleAddSkill} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Skill Category</label>
              <select
                className={styles.textarea}
                style={{ minHeight: '44px', padding: '8px' }}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Skill Name / Specialization"
              placeholder="e.g. Cisco Routing, Server Virtualization"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              required
            />

            <Input
              label="Years of Experience"
              type="number"
              min="1"
              max="40"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              required
            />

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit" isLoading={isSaving} fullWidth>
                + Add Skill
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

