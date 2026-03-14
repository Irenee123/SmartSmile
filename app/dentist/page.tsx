'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/auth-provider';

// ── Types ──────────────────────────────────────────────────────────────────
interface Clinic {
  id: string;
  name: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  hours: string;
  tags: string[];
  filterTags: string[];
  openingHours: { day: string; time: string }[];
  services: string[];
  bookingUrl: string;
}

interface DbClinic {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  website: string;
  hours: string;
  services: string[];
  partnership: string;
  created_at: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const CLINICS: Clinic[] = [
  {
    id: 'clinic1',
    name: 'SmileCare Dental Center',
    specialty: 'General & Cosmetic Dentistry',
    location: 'Kimironko, Kigali',
    phone: '+250 788 123 456',
    email: 'info@smilecare.rw',
    website: 'smilecare.rw',
    hours: 'Mon–Sat · 8:00am – 5:00pm',
    tags: ['Checkups', 'Cleaning', 'Whitening', 'Fillings'],
    filterTags: ['general', 'cosmetic'],
    openingHours: [
      { day: 'Monday – Friday', time: '8:00am – 5:00pm' },
      { day: 'Saturday', time: '9:00am – 2:00pm' },
      { day: 'Sunday', time: 'Closed' },
    ],
    services: ['Routine Checkup', 'Teeth Cleaning', 'Whitening', 'Fillings', 'Extractions', 'X-Ray'],
    bookingUrl: 'https://smilecare.rw/book',
  },
  {
    id: 'clinic2',
    name: 'BrightTooth Clinic',
    specialty: 'Orthodontics & General Dentistry',
    location: 'Nyamirambo, Kigali',
    phone: '+250 788 654 321',
    email: 'hello@brighttooth.rw',
    website: 'brighttooth.rw',
    hours: 'Mon–Fri · 9:00am – 6:00pm',
    tags: ['Braces', 'Aligners', 'Checkups', 'X-Ray'],
    filterTags: ['orthodontics', 'general'],
    openingHours: [
      { day: 'Monday – Friday', time: '9:00am – 6:00pm' },
      { day: 'Saturday', time: 'Closed' },
      { day: 'Sunday', time: 'Closed' },
    ],
    services: ['Braces', 'Clear Aligners', 'Retainers', 'Checkups', 'X-Ray', 'Cleaning'],
    bookingUrl: 'https://brighttooth.rw/book',
  },
  {
    id: 'clinic3',
    name: 'PureSmile Health Center',
    specialty: 'Cosmetic & Restorative Dentistry',
    location: 'Remera, Kigali',
    phone: '+250 788 987 654',
    email: 'contact@puresmile.rw',
    website: 'puresmile.rw',
    hours: 'Mon–Sat · 7:30am – 4:00pm',
    tags: ['Veneers', 'Implants', 'Whitening', 'Crowns'],
    filterTags: ['cosmetic', 'general'],
    openingHours: [
      { day: 'Monday – Friday', time: '7:30am – 4:00pm' },
      { day: 'Saturday', time: '8:00am – 12:00pm' },
      { day: 'Sunday', time: 'Closed' },
    ],
    services: ['Veneers', 'Implants', 'Whitening', 'Crowns', 'Bridges', 'Bonding'],
    bookingUrl: 'https://puresmile.rw/book',
  },
  {
    id: 'clinic4',
    name: 'DentaPlus Medical',
    specialty: 'Pediatric & Family Dentistry',
    location: 'Kacyiru, Kigali',
    phone: '+250 788 321 987',
    email: 'info@dentaplus.rw',
    website: 'dentaplus.rw',
    hours: 'Mon–Fri · 8:00am – 5:00pm',
    tags: ['Kids Dentistry', 'Checkups', 'Extractions'],
    filterTags: ['pediatric', 'general'],
    openingHours: [
      { day: 'Monday – Friday', time: '8:00am – 5:00pm' },
      { day: 'Saturday', time: 'Closed' },
      { day: 'Sunday', time: 'Closed' },
    ],
    services: ['Kids Checkups', 'Sealants', 'Fluoride Treatment', 'Extractions', 'Family Cleaning'],
    bookingUrl: 'https://dentaplus.rw/book',
  },
];

const FILTERS = ['All', 'General', 'Orthodontics', 'Cosmetic', 'Pediatric'];

// ── Component ──────────────────────────────────────────────────────────────
export default function FindDentistPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    }
    // Check maintenance mode - but allow admins to access
    if (mounted && user) {
      const isAdmin = user.email?.includes('admin') || user.email === 'admin@smartsmile.com';
      const maintenanceMode = localStorage.getItem('maintenance_mode') === 'true';
      if (maintenanceMode && !isAdmin) {
        router.push('/maintenance');
      }
    }
  }, [mounted, authLoading, user, router]);

  // Fetch clinics from Supabase - only once when user is available
  const [hasFetched, setHasFetched] = useState(false);
  
  useEffect(() => {
    if (user && !hasFetched) {
      fetchClinics();
      setHasFetched(true);
    }
  }, [user, hasFetched]);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      // Map Supabase data to Clinic format
      const mappedClinics: Clinic[] = data.map((clinic: DbClinic) => ({
        id: clinic.id,
        name: clinic.name,
        specialty: clinic.services && clinic.services.length > 0 ? clinic.services[0] : 'General Dentistry',
        location: clinic.location,
        phone: clinic.phone,
        email: clinic.email || '',
        website: clinic.website || '',
        hours: clinic.hours || 'Mon-Fri: 8AM-5PM',
        tags: clinic.services || [],
        filterTags: getFilterTags(clinic.services || []),
        openingHours: parseHours(clinic.hours || 'Mon-Fri: 8AM-5PM'),
        services: clinic.services || [],
        bookingUrl: clinic.website || '#'
      }));
      setClinics(mappedClinics);
    } else {
      setClinics([]);
    }
    setLoadingClinics(false);
  };

  const getFilterTags = (services: string[]): string[] => {
    const tags: string[] = [];
    services.forEach(service => {
      const lower = service.toLowerCase();
      if (lower.includes('ortho')) tags.push('orthodontics');
      if (lower.includes('cosmetic')) tags.push('cosmetic');
      if (lower.includes('pediatric') || lower.includes('child')) tags.push('pediatric');
      if (lower.includes('general') || lower.includes('checkup') || lower.includes('clean')) tags.push('general');
    });
    return tags.length > 0 ? tags : ['general'];
  };

  const parseHours = (hoursStr: string): { day: string; time: string }[] => {
    // Simple parser for hours string
    const result: { day: string; time: string }[] = [];
    if (hoursStr.includes('Mon-Fri')) {
      result.push({ day: 'Monday - Friday', time: '8:00am - 5:00pm' });
    }
    if (hoursStr.includes('Sat')) {
      result.push({ day: 'Saturday', time: '9:00am - 2:00pm' });
    }
    if (hoursStr.includes('Sun')) {
      result.push({ day: 'Sunday', time: 'Closed' });
    }
    return result.length > 0 ? result : [{ day: 'Monday - Friday', time: hoursStr }];
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const filtered = clinics.filter((c) => {
    const matchesFilter =
      activeFilter === 'All' || c.filterTags.includes(activeFilter.toLowerCase());
    const matchesSearch =
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specialty.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!mounted || authLoading) {
    return (
      <div style={{ display: 'flex', background: '#080808', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00e5ff' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: 'flex', background: '#080808', minHeight: '100vh', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, minWidth: 240, background: '#0e0e0e',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 50,
      }}>
        <div style={{
          padding: '1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem',
          background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>SmartSmile</div>

        <div style={{ padding: '0.75rem 1rem', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', marginTop: '0.5rem' }}>Main</div>

        {[
          { label: '🏠 Dashboard', href: '/dashboard' },
          { label: '📷 New Screening', href: '/screening' },
          { label: '📊 History', href: '/history' },
          { label: '📚 Education Hub', href: '/education' },
          { label: '🦷 Find a Dentist', href: '/dentist', active: true },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 1rem', margin: '0 0.5rem', borderRadius: 10,
            color: item.active ? '#00e5ff' : '#666', fontSize: '0.88rem',
            textDecoration: 'none',
            background: item.active ? 'rgba(0,229,255,0.08)' : 'transparent',
            borderLeft: item.active ? '2px solid #00e5ff' : '2px solid transparent',
          }}>{item.label}</Link>
        ))}

        <div style={{ padding: '0.75rem 1rem', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666', marginTop: '0.5rem' }}>Account</div>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', margin: '0 0.5rem', borderRadius: 10, color: '#666', fontSize: '0.88rem', textDecoration: 'none' }}>⚙️ Settings</Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', margin: '0 0.5rem', borderRadius: 10, color: '#666', fontSize: '0.88rem', background: 'none', border: 'none', cursor: 'pointer', width: 'calc(100% - 1rem)', textAlign: 'left' }}>🚪 Log Out</button>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#000', flexShrink: 0 }}>{user?.email ? user.email[0].toUpperCase() : 'U'}</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>My Account</div>
            <div style={{ fontSize: '0.72rem', color: '#666' }}>{user?.email || 'Loading...'}</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: '2.5rem', maxWidth: 'calc(100vw - 240px)' }}>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Find a Dentist</h1>
        <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '2rem' }}>Browse partner clinics and dental professionals offering oral health services near you.</p>

        {/* Info Banner */}
        <div style={{
          background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)',
          borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center',
          gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#666', lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
          <span>Appointments are booked directly with the clinic. Click on any clinic to view their contact details and booking link. SmartSmile does not manage bookings.</span>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search clinics or specialties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', background: '#101012', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '0.65rem 1rem 0.65rem 2.5rem',
                color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '0.5rem 1rem', borderRadius: 100,
                border: activeFilter === f ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.07)',
                background: activeFilter === f ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.03)',
                color: activeFilter === f ? '#00e5ff' : '#666',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>{f}</button>
            ))}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#666' }}>
            {filtered.length} clinic{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Clinics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {loadingClinics ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#666', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>⏳</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#f0f0f0', marginBottom: '0.4rem' }}>Loading clinics...</div>
              <div style={{ fontSize: '0.85rem' }}>Fetching from database</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#666', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>🦷</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#f0f0f0', marginBottom: '0.4rem' }}>No clinics found</div>
              <div style={{ fontSize: '0.85rem' }}>Try adjusting your search or filter</div>
            </div>
          ) : (
            filtered.map((clinic) => (
              <ClinicCard 
                key={clinic.id} 
                clinic={clinic} 
                onOpen={() => {
                  console.log('Opening clinic:', clinic.name);
                  setSelectedClinic(clinic);
                }} 
              />
            ))
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {selectedClinic && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }} />
          <ClinicModal clinic={selectedClinic} onClose={() => setSelectedClinic(null)} />
        </>
      )}
    </div>
  );
}

// ── Clinic Card ────────────────────────────────────────────────────────────
function ClinicCard({ clinic, onOpen }: { clinic: Clinic; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111', border: `1px solid ${hovered ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '1.5rem', cursor: 'pointer',
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Top accent line on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #00e5ff, #a855f7)',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
      }} />

      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{clinic.name}</div>
      <div style={{ fontSize: '0.75rem', color: '#00e5ff', fontWeight: 600, marginBottom: '0.85rem' }}>{clinic.specialty}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#666' }}>📍 {clinic.location}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#666' }}>📞 {clinic.phone}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#666' }}>🕐 {clinic.hours}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
        {clinic.tags.map((tag) => (
          <span key={tag} style={{
            padding: '0.2rem 0.65rem', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600,
            background: 'rgba(255,255,255,0.04)', color: '#666', border: '1px solid rgba(255,255,255,0.07)',
          }}>{tag}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <div style={{
          flex: 1, padding: '0.6rem', borderRadius: 10, textAlign: 'center',
          border: '1px solid rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.06)',
          color: '#00e5ff', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.78rem',
        }}>View Details →</div>
        
        <a href={`tel:${clinic.phone.replace(/\s/g, '')}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '0.6rem 1rem', borderRadius: 10, textDecoration: 'none',
            border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.06)',
            color: '#34d399', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.78rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >📞 Call</a>
      </div>
    </div>
  );
}

// ── Clinic Modal ───────────────────────────────────────────────────────────
function ClinicModal({ clinic, onClose }: { clinic: Clinic; onClose: () => void }) {
  console.log('Rendering ClinicModal for:', clinic.name);
  
  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClose = () => {
    console.log('Modal closing...');
    onClose();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}
    >
      <div style={{
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 24, width: '100%', maxWidth: 720,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#fff', marginBottom: '0.3rem' }}>{clinic.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#00e5ff', fontWeight: 500 }}>{clinic.specialty}</div>
          </div>
          <button onClick={handleClose} style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.08)', color: '#888', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>✕</button>
        </div>

        {/* Body - full info, no scroll */}
        <div style={{ padding: '2rem' }}>
          {/* Contact Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: '0.75rem' }}>Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: '#141414', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '0.3rem' }}>📞 Phone</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{clinic.phone}</div>
              </div>
              <div style={{ background: '#141414', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '0.3rem' }}>📍 Location</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{clinic.location}</div>
              </div>
              <div style={{ background: '#141414', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '0.3rem' }}>✉️ Email</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{clinic.email}</div>
              </div>
              <div style={{ background: '#141414', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '0.3rem' }}>🌐 Website</div>
                <div style={{ fontSize: '0.85rem', color: '#00e5ff', fontWeight: 500 }}>{clinic.website}</div>
              </div>
            </div>
          </div>

          {/* Hours & Services Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Hours */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: '0.75rem' }}>Opening Hours</div>
              <div style={{ background: '#141414', borderRadius: 12, padding: '0.75rem' }}>
                {clinic.openingHours.map((h) => (
                  <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>{h.day}</span>
                    <span style={{ color: h.time === 'Closed' ? '#ef4444' : '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: '0.75rem' }}>Services</div>
              <div style={{ background: '#141414', borderRadius: 12, padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {clinic.services.map((s) => (
                  <span key={s} style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(0,229,255,0.1)', color: '#00e5ff' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} style={{
              flex: 1, padding: '1rem', borderRadius: 14, background: '#22c55e',
              color: '#000', border: 'none', fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>📞 Call Now</a>
            <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: 1.5, padding: '1rem', borderRadius: 14,
              background: 'linear-gradient(135deg, #00e5ff, #8b5cf6)', color: '#000',
              border: 'none', fontFamily: "'Syne', sans-serif", fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>🔗 Book Appointment</a>
          </div>
        </div>
      </div>
    </div>
  );
}
