'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Screening {
  id: string;
  created_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  overall_condition: string;
  indicators: string | string[];
  summary: string;
}

import Spinner from '@/components/spinner'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [announcement, setAnnouncement] = useState<{ id: string; message: string; type: string } | null>(null);

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

  useEffect(() => {
    if (user) {
      fetchScreenings();
      fetchAnnouncement();
    }
  }, [user]);

  const fetchAnnouncement = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      const dismissed = localStorage.getItem(`announcement_dismissed_${data.id}`);
      if (!dismissed) setAnnouncement(data);
    }
  };

  const dismissAnnouncement = () => {
    if (announcement) {
      localStorage.setItem(`announcement_dismissed_${announcement.id}`, 'true');
      setAnnouncement(null);
    }
  };

  // Refresh data when user comes back to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchScreenings();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchScreenings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScreenings(data);
    }
    setLoadingData(false);
  };

  // Calculate stats
  const totalScreenings = screenings.length;
  const latestScreening = screenings[0];
  
  const avgConfidence = totalScreenings > 0
    ? Math.round(screenings.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / totalScreenings)
    : 0;

  // Helper to get display risk level
  const getRiskLevelDisplay = (level: string) => {
    if (!level) return '-';
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Helper to get risk level color
  const getRiskLevelColor = (level: string) => {
    if (level === 'high') return '#f87171';
    if (level === 'moderate') return '#fbbf24';
    return '#34d399';
  };

  // Helper to format indicators
  const formatIndicators = (indicators: string | string[] | null | undefined): string => {
    if (!indicators) return 'None detected';
    if (Array.isArray(indicators)) return indicators.slice(0, 3).join(', ');
    return indicators;
  };

  if (!mounted || authLoading || loadingData) {
    return <Spinner />;
  }

  if (!user) {
    return null;
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : 'U';
  const userName = user.email ? user.email.split('@')[0] : 'User';

  const conditionCounts: Record<string, number> = {};
  screenings.forEach(s => {
    const raw = s.indicators;
    const list: string[] = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
    list.forEach(ind => {
      const key = ind.split('(')[0].trim();
      if (key) conditionCounts[key] = (conditionCounts[key] || 0) + 1;
    });
  });
  const conditionEntries = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const conditionMax = conditionEntries[0]?.[1] || 1;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-8 md:pl-10 pt-20 md:pt-8 max-w-full md:max-w-[calc(100vw-240px)]">
        {/* Announcement Banner */}
        {announcement && (() => {
          const colors: Record<string, { bg: string; border: string; text: string }> = {
            info:    { bg: 'rgba(0,229,255,0.06)',    border: 'rgba(0,229,255,0.2)',    text: '#00e5ff' },
            warning: { bg: 'rgba(251,191,36,0.06)',   border: 'rgba(251,191,36,0.2)',   text: '#fbbf24' },
            success: { bg: 'rgba(52,211,153,0.06)',   border: 'rgba(52,211,153,0.2)',   text: '#34d399' },
            urgent:  { bg: 'rgba(248,113,113,0.06)',  border: 'rgba(248,113,113,0.2)',  text: '#f87171' },
          };
          const c = colors[announcement.type] || colors.info;
          return (
            <div className="flex items-center gap-3 rounded-[12px] px-4 py-3 mb-6 text-[0.85rem]" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <span className="flex-1" style={{ color: c.text }}>{announcement.message}</span>
              <button onClick={dismissAnnouncement} className="text-[#666] hover:text-[#f0f0f0] transition-colors text-lg flex-shrink-0 leading-none">✕</button>
            </div>
          );
        })()}

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem]">{getGreeting()}</h1>
            <p className="text-[#666] text-[0.88rem] mt-1">Here's your oral health overview for today.</p>
          </div>
          <Link href="/screening" className="bg-[#00e5ff] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            Start New Screening
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.75rem] text-[#666] mb-2">Total Screenings</div>
            <div className="font-['Syne'] font-extrabold text-[1.8rem]">{totalScreenings}</div>
            <div className="text-[0.75rem] text-[#666] mt-1">
              {totalScreenings === 0 ? 'Get started with your first screening' : `${totalScreenings} screening${totalScreenings !== 1 ? 's' : ''} completed`}
            </div>
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.75rem] text-[#666] mb-2">Latest Risk Level</div>
            <div className="font-['Syne'] font-extrabold text-[1.8rem]" style={{ color: latestScreening ? getRiskLevelColor(latestScreening.risk_level) : '#fbbf24' }}>
              {latestScreening ? getRiskLevelDisplay(latestScreening.risk_level) : '-'}
            </div>
            <div className="text-[0.75rem] text-[#666] mt-1">
              {latestScreening ? `Last checked ${new Date(latestScreening.created_at).toLocaleDateString()}` : 'No screenings yet'}
            </div>
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.75rem] text-[#666] mb-2">Avg. Confidence</div>
            <div className="font-['Syne'] font-extrabold text-[1.8rem]">{avgConfidence > 0 ? `${avgConfidence}%` : '-'}</div>
            <div className="text-[0.75rem] text-[#666] mt-1">
              {avgConfidence > 0 ? 'AI model confidence' : 'Complete a screening'}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Latest Result */}
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-5 flex justify-between items-center">
              Latest Result
              {latestScreening ? (
                <span className="px-3 py-1 rounded-full text-[0.78rem] font-bold" style={{ backgroundColor: `${getRiskLevelColor(latestScreening.risk_level)}20`, color: getRiskLevelColor(latestScreening.risk_level), border: `1px solid ${getRiskLevelColor(latestScreening.risk_level)}40` }}>
                  {getRiskLevelDisplay(latestScreening.risk_level)}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[0.78rem] font-bold bg-[rgba(255,255,255,0.05)] text-[#666] border border-[rgba(255,255,255,0.1)]">No data</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {latestScreening ? (
                <>
                  <div className="flex justify-between text-[0.85rem]">
                    <span className="text-[#666]">Condition</span>
                    <span>{latestScreening.overall_condition}</span>
                  </div>
                  <div className="flex justify-between text-[0.85rem]">
                    <span className="text-[#666]">Confidence</span>
                    <span>{latestScreening.confidence_score}%</span>
                  </div>
                  <div className="flex justify-between text-[0.85rem]">
                    <span className="text-[#666]">Indicators</span>
                    <span className="text-right max-w-[150px]">{formatIndicators(latestScreening.indicators)}</span>
                  </div>
                  <div className="mt-2 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                    <Link href={`/results?id=${latestScreening.id}`} className="text-[#00e5ff] text-[0.85rem] hover:underline">
                      View full results →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[0.85rem]">
                  <span className="text-[#666]">Complete your first screening to see results</span>
                </div>
              )}
            </div>
          </div>

          {/* Condition Frequency */}
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-1">Condition Frequency</div>
            <p className="text-[#555] text-[0.72rem] mb-4">How often each condition was detected</p>
            {conditionEntries.length > 0 ? (
              <div className="flex items-end justify-around gap-1 h-[130px]">
                {conditionEntries.map(([condition, count]) => (
                  <div key={condition} className="flex flex-col items-center gap-1 flex-1 min-w-0 h-full justify-end">
                    <span className="text-[#aaa] text-[0.65rem] font-semibold">{count}</span>
                    <div
                      className="w-full rounded-t-[3px] bg-[#00e5ff]"
                      style={{ height: `${Math.max(6, (count / conditionMax) * 72)}px` }}
                    />
                    <span className="text-[#555] text-[0.55rem] text-center leading-tight w-full truncate" title={condition}>{condition}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[140px] flex items-center justify-center text-[#666] text-[0.85rem]">
                Complete screenings to see condition frequency
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 mb-6">
          <div className="font-['Syne'] font-bold text-[0.95rem] mb-5">Quick Tips</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
              <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Brush Properly</h4>
              <p className="text-[#666] text-[0.78rem] leading-[1.55]">Brush for 2 minutes, twice a day using a soft-bristled toothbrush and fluoride toothpaste.</p>
            </div>
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
              <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Limit Sugar Intake</h4>
              <p className="text-[#666] text-[0.78rem] leading-[1.55]">Reduce sugary drinks and snacks. Bacteria feed on sugar to produce enamel-damaging acids.</p>
            </div>
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
              <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">Regular Check-ups</h4>
              <p className="text-[#666] text-[0.78rem] leading-[1.55]">Even with low risk results, visit a dentist every 6 months for professional cleaning and exams.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
