'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/components/auth-provider';
import Sidebar from '@/components/sidebar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  created_at: string;
}

const FILTERS = ['All', 'General', 'Orthodontics', 'Cosmetic', 'Pediatric'];

const getFilterTags = (services: string[]): string[] => {
  const tags: string[] = [];
  services.forEach(s => {
    const l = s.toLowerCase();
    if (l.includes('ortho')) tags.push('orthodontics');
    if (l.includes('cosmetic') || l.includes('veneer') || l.includes('whiten')) tags.push('cosmetic');
    if (l.includes('pediatric') || l.includes('child') || l.includes('kid')) tags.push('pediatric');
    if (l.includes('general') || l.includes('checkup') || l.includes('clean')) tags.push('general');
  });
  return tags.length > 0 ? [...new Set(tags)] : ['general'];
};

const parseHours = (h: string): { day: string; time: string }[] => {
  const result = [];
  if (h.includes('Mon')) result.push({ day: 'Monday – Friday', time: h.split(':').slice(1).join(':').trim() || '8:00am – 5:00pm' });
  if (h.includes('Sat')) result.push({ day: 'Saturday', time: '9:00am – 2:00pm' });
  result.push({ day: 'Sunday', time: 'Closed' });
  return result.length > 0 ? result : [{ day: 'Monday – Friday', time: h }];
};

export default function FindDentistPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState<Clinic | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) fetchClinics();
  }, [user]);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    const { data } = await supabase.from('clinics').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setClinics(data.map((c: DbClinic) => ({
        id: c.id, name: c.name, specialty: c.services?.[0] || 'General Dentistry',
        location: c.location, phone: c.phone, email: c.email || '',
        website: c.website || '', hours: c.hours || 'Mon–Fri: 8AM–5PM',
        tags: c.services || [], filterTags: getFilterTags(c.services || []),
        openingHours: parseHours(c.hours || ''), services: c.services || [],
        bookingUrl: c.website || '#',
      })));
    } else {
      setClinics([]);
    }
    setLoadingClinics(false);
  };

  const filtered = clinics.filter(c => {
    const matchFilter = activeFilter === 'All' || c.filterTags.includes(activeFilter.toLowerCase());
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  if (!mounted || authLoading) {
    return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><div className="text-[#00e5ff]">Loading...</div></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080808] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-full md:max-w-[calc(100vw-240px)]">
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.3rem' }}>Find a Dentist</h1>
        <p className="text-[#666] text-[0.9rem] mb-6">Browse partner clinics and dental professionals offering oral health services near you.</p>

        {/* Info Banner */}
        <div className="flex items-center gap-3 bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[12px] px-4 py-3 mb-6 text-[#666] text-[0.82rem]">
          <span className="text-lg flex-shrink-0">💡</span>
          <span>Appointments are booked directly with the clinic. SmartSmile does not manage bookings.</span>
        </div>

        {/* Search + Filters */}
        <div className="relative mb-4 max-w-[520px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">🔍</span>
          <input
            type="text"
            placeholder="Search clinics or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl py-3 pl-10 pr-4 text-[#f0f0f0] text-[0.9rem] outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-[0.8rem] font-semibold cursor-pointer transition-all border ${activeFilter === f ? 'bg-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.25)] text-[#00e5ff]' : 'border-[rgba(255,255,255,0.07)] text-[#666] hover:border-[rgba(0,229,255,0.2)] hover:text-[#00e5ff]'}`}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-[#666] text-[0.78rem] self-center">{filtered.length} clinic{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {loadingClinics ? (
          <div className="text-center py-20 text-[#666] text-[0.88rem]">Loading clinics...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-40">🦷</div>
            <p className="text-[#666] text-[0.88rem]">No clinics found. Try adjusting your search or filter.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {filtered.map(clinic => (
              <div key={clinic.id} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden cursor-pointer transition-all hover:border-[rgba(0,229,255,0.2)] hover:-translate-y-0.5">
                {/* Card top accent */}
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #00e5ff, #a855f7)' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{clinic.name}</h3>
                      <span className="text-[0.7rem] text-[#00e5ff] font-semibold">{clinic.specialty}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[#666] text-[0.78rem]"><span>📍</span>{clinic.location}</div>
                    <div className="flex items-center gap-2 text-[#666] text-[0.78rem]"><span>📞</span>{clinic.phone}</div>
                    <div className="flex items-center gap-2 text-[#666] text-[0.78rem]"><span>🕐</span>{clinic.hours}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {clinic.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[0.65rem] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.04)', color: '#666', border: '1px solid rgba(255,255,255,0.07)' }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(clinic)} className="flex-1 py-2 rounded-[8px] text-[0.78rem] font-bold text-[#00e5ff] border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.06)] hover:bg-[rgba(0,229,255,0.12)] transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>View Details →</button>
                    <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()} className="px-4 py-2 rounded-[8px] text-[0.78rem] font-bold text-[#34d399] border border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.06)] hover:bg-[rgba(52,211,153,0.12)] transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>📞 Call</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Clinic Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.1)] rounded-[20px] w-full max-w-[660px] overflow-hidden">
            {/* Modal header accent */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #00e5ff, #a855f7)' }} />
            <div className="p-7">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>{selected.name}</h2>
                  <span className="text-[0.72rem] text-[#00e5ff] font-semibold">{selected.specialty}</span>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#666] hover:text-[#f0f0f0] text-xl transition-colors">✕</button>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { icon: '📍', label: 'Location', value: selected.location },
                  { icon: '📞', label: 'Phone', value: selected.phone },
                  { icon: '✉️', label: 'Email', value: selected.email || '—' },
                  { icon: '🌐', label: 'Website', value: selected.website || '—', cyan: true },
                ].map(item => (
                  <div key={item.label} className="bg-[#111] border border-[rgba(255,255,255,0.06)] rounded-[10px] px-4 py-3">
                    <div className="text-[0.65rem] text-[#555] mb-1">{item.icon} {item.label}</div>
                    <div className={`text-[0.82rem] font-semibold ${item.cyan ? 'text-[#00e5ff]' : 'text-[#f0f0f0]'}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Hours + Services */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#555] mb-2">Opening Hours</div>
                  <div className="bg-[#111] border border-[rgba(255,255,255,0.06)] rounded-[10px] overflow-hidden">
                    {selected.openingHours.map((h, i) => (
                      <div key={h.day} className={`flex justify-between px-4 py-2.5 text-[0.78rem] ${i !== selected.openingHours.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''}`}>
                        <span className="text-[#666]">{h.day}</span>
                        <span className={h.time === 'Closed' ? 'text-[#f87171] font-semibold' : 'text-[#f0f0f0] font-semibold'}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-wider text-[#555] mb-2">Services</div>
                  <div className="bg-[#111] border border-[rgba(255,255,255,0.06)] rounded-[10px] p-3 flex flex-wrap gap-1.5">
                    {selected.services.map(s => (
                      <span key={s} className="text-[0.68rem] px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="flex-1 py-3 rounded-[10px] text-center font-bold text-[0.88rem] text-black bg-[#34d399] hover:opacity-90 transition-opacity" style={{ fontFamily: "'Syne', sans-serif", textDecoration: 'none' }}>📞 Call Now</a>
                <a href={selected.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex-[1.5] py-3 rounded-[10px] text-center font-bold text-[0.88rem] text-black hover:opacity-90 transition-opacity" style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg, #00e5ff, #a855f7)', textDecoration: 'none' }}>🔗 Book Appointment</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
