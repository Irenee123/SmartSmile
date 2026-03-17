'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '@/components/sidebar';

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
  indicators: string[];
  recommendations: string[];
  image_path: string;
  model_version: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterTime, setFilterTime] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    }
  }, [user]);

  const fetchScreenings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('screenings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScreenings(data);
    }
    setLoading(false);
  };

  const deleteScreening = async (id: string) => {
    const { error } = await supabase
      .from('screenings')
      .delete()
      .eq('id', id);

    if (!error) {
      setScreenings(screenings.filter(s => s.id !== id));
    }
  };

  const filteredScreenings = screenings.filter(screening => {
    if (filterRisk !== 'all' && screening.risk_level !== filterRisk) {
      return false;
    }
    if (searchTerm && screening.indicators && !screening.indicators.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const totalScreenings = screenings.length;
  const lowRisk = screenings.filter(s => s.risk_level === 'low').length;
  const moderateRisk = screenings.filter(s => s.risk_level === 'moderate').length;
  const highRisk = screenings.filter(s => s.risk_level === 'high').length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };

  if (!mounted || authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-full md:max-w-[calc(100vw-240px)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem]">Screening History</h1>
            <p className="text-[#666] text-[0.88rem] mt-1">Track and review all your past oral health screenings.</p>
          </div>
          <Link href="/screening" className="bg-[#00e5ff] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            📷 New Screening
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-center">
            <div className="font-['Syne'] font-extrabold text-[1.6rem] mb-1">{totalScreenings}</div>
            <div className="text-[0.72rem] text-[#666] uppercase tracking-wide">Total Screenings</div>
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-center">
            <div className="font-['Syne'] font-extrabold text-[1.6rem] mb-1" style={{ color: '#34d399' }}>{lowRisk}</div>
            <div className="text-[0.72rem] text-[#666] uppercase tracking-wide">Low Risk</div>
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-center">
            <div className="font-['Syne'] font-extrabold text-[1.6rem] mb-1" style={{ color: '#fbbf24' }}>{moderateRisk}</div>
            <div className="text-[0.72rem] text-[#666] uppercase tracking-wide">Moderate Risk</div>
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 text-center">
            <div className="font-['Syne'] font-extrabold text-[1.6rem] mb-1" style={{ color: '#f87171' }}>{highRisk}</div>
            <div className="text-[0.72rem] text-[#666] uppercase tracking-wide">High Risk</div>
          </div>
        </div>

        {/* Trend Chart */}
        {screenings.length > 0 && (
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 mb-6">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-4 flex justify-between items-center">
              Risk Trend Over Time
              <span className="text-[0.75rem] text-[#666] font-normal font-sans">Last {Math.min(12, screenings.length)} screenings</span>
            </div>
            <div className="h-40">
              <svg width="100%" height="160" viewBox="0 0 800 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                {/* Risk level labels */}
                <text x="8" y="38" fill="#666" fontSize="10" fontFamily="DM Sans">High</text>
                <text x="8" y="78" fill="#666" fontSize="10" fontFamily="DM Sans">Mod</text>
                <text x="8" y="118" fill="#666" fontSize="10" fontFamily="DM Sans">Low</text>
                {/* Line path - generate based on data */}
                {screenings.length > 1 && (() => {
                  const points = screenings.slice(0, 12).reverse().map((s, i) => {
                    const x = 60 + (i * (700 / (Math.min(12, screenings.length) - 1)));
                    let y = 110;
                    if (s.risk_level === 'high') y = 40;
                    else if (s.risk_level === 'moderate') y = 80;
                    else y = 120;
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <>
                      <polyline 
                        points={points} 
                        stroke="#00e5ff" 
                        strokeWidth="2.5" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      {screenings.slice(0, 12).reverse().map((s, i) => {
                        const x = 60 + (i * (700 / (Math.min(12, screenings.length) - 1)));
                        let y = 110;
                        let color = '#34d399';
                        if (s.risk_level === 'high') { y = 40; color = '#f87171'; }
                        else if (s.risk_level === 'moderate') { y = 80; color = '#fbbf24'; }
                        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <span className="text-[0.8rem] text-[#666]">Filter:</span>
          <select 
            className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-lg px-4 py-2 text-[#f0f0f0] font-sans text-[0.82rem] cursor-pointer"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
          <select 
            className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-lg px-4 py-2 text-[#f0f0f0] font-sans text-[0.82rem] cursor-pointer"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
          <input 
            type="text" 
            placeholder="🔍 Search indicators…" 
            className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-lg px-4 py-2 text-[#f0f0f0] font-sans text-[0.82rem] w-52 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="ml-auto text-[0.8rem] text-[#666]">
            Showing {filteredScreenings.length} of {screenings.length} records
          </span>
        </div>

        {/* Table */}
        {filteredScreenings.length > 0 ? (
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_100px] gap-4 p-4 px-6 text-[0.72rem] text-[#666] uppercase tracking-wider border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
              <span>Date</span>
              <span>Risk Level</span>
              <span>Confidence</span>
              <span>Indicators</span>
              <span>Condition</span>
              <span>Actions</span>
            </div>

            {filteredScreenings.map((screening) => {
              const { full, time } = formatDate(screening.created_at);
              const riskColors: Record<string, string> = {
                'low': 'bg-[rgba(52,211,153,0.12)] text-[#34d399] border-[rgba(52,211,153,0.2)]',
                'moderate': 'bg-[rgba(251,191,36,0.12)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]',
                'high': 'bg-[rgba(248,113,113,0.12)] text-[#f87171] border-[rgba(248,113,113,0.2)]'
              };
              
              return (
                <div key={screening.id} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_100px] gap-4 p-4 px-6 border-b border-[rgba(255,255,255,0.07)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div>
                    <div className="text-[0.85rem] font-medium">{full}</div>
                    <div className="text-[0.72rem] text-[#666] mt-1">{time}</div>
                  </div>
                  <span>
                    <span className={`px-3 py-1 rounded-full text-[0.72rem] font-bold ${riskColors[screening.risk_level]}`}>
                      {screening.risk_level}
                    </span>
                  </span>
                  <div>
                    <div className="text-[0.85rem]">{screening.confidence_score}%</div>
                    <div className="h-1 bg-[rgba(255,255,255,0.07)] rounded mt-2 w-14 overflow-hidden">
                      <div className="h-full rounded bg-gradient-to-r from-[#00e5ff] to-[#a855f7]" style={{ width: `${screening.confidence_score}%` }}></div>
                    </div>
                  </div>
                  {screening.indicators && screening.indicators.length > 0 ? screening.indicators.map((indicator, i) => (
                  <span key={i} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 text-[0.78rem]">
                    {indicator}
                  </span>
                )) : <span className="text-[#666]">-</span>}
                  <div className="text-[0.75rem] text-[#666]">{screening.overall_condition}</div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/results?id=${screening.id}`} className="bg-[rgba(0,229,255,0.07)] border border-[rgba(0,229,255,0.15)] text-[#00e5ff] rounded-md px-3 py-1 text-[0.73rem] font-semibold no-underline hover:bg-[rgba(0,229,255,0.14)] transition-colors">
                      View
                    </Link>
                    <button 
                      onClick={() => deleteScreening(screening.id)}
                      className="bg-[rgba(248,113,113,0.07)] border border-[rgba(248,113,113,0.15)] text-[#f87171] rounded-md px-2 py-1 text-[0.73rem] cursor-pointer hover:bg-[rgba(248,113,113,0.14)] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[#666]">
            <div className="text-4xl mb-4 opacity-40">📊</div>
            <h3 className="font-['Syne'] font-bold text-[#f0f0f0] mb-2">No Screenings Found</h3>
            <p className="text-[0.88rem] leading-relaxed">
              {screenings.length === 0 
                ? "You haven't completed any screenings yet. Start your first screening to track your oral health over time." 
                : "No screenings match your current filters. Try adjusting your search criteria."}
            </p>
            {screenings.length === 0 && (
              <Link href="/screening" className="inline-block mt-4 bg-[#00e5ff] text-black px-5 py-2 rounded-lg font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity">
                📷 Start First Screening
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
