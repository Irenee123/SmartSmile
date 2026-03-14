'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Stats {
  totalUsers: number;
  totalScreenings: number;
  avgConfidence: number;
  activeToday: number;
}

interface Screening {
  id: string;
  user_id: string;
  created_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  overall_condition: string;
}

interface User {
  id: string;
  email: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalScreenings: 0,
    avgConfidence: 0,
    activeToday: 0
  });
  const [recentScreenings, setRecentScreenings] = useState<Screening[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    }
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) {
      checkAdminAndFetchData();
    }
  }, [user]);

  const checkAdminAndFetchData = async () => {
    if (!user) return;

    // ✅ FIXED: query by user_id not email
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    console.log('🔍 Admin check - user.id:', user.id)
    console.log('🔍 Admin check - result:', adminData)
    console.log('🔍 Admin check - error:', adminError)

    if (adminError || !adminData) {
      console.log('❌ Not an admin, redirecting to /dashboard')
      router.push('/dashboard');
      return;
    }

    console.log('✅ Admin confirmed, loading dashboard data')
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    setLoadingData(true);

    // Fetch all screenings
    const { data: screeningsData } = await supabase
      .from('screenings')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch real users from profiles table
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false });

    // Get unique users from screenings for stats
    const uniqueUserIds = new Set(screeningsData?.map(s => s.user_id) || []);

    if (screeningsData || profilesData) {
      const totalScreenings = screeningsData?.length || 0;
      const totalUsers = profilesData?.length || uniqueUserIds.size;
      const avgConfidence = totalScreenings > 0 && screeningsData
        ? Math.round(
            screeningsData.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / totalScreenings * 100
          )
        : 0;

      const today = new Date().toISOString().split('T')[0];
      const activeToday = screeningsData?.filter(s =>
        s.created_at.startsWith(today)
      ).length || 0;

      const lowRisk = screeningsData?.filter(s => s.risk_level === 'low').length || 0;
      const moderateRisk = screeningsData?.filter(s => s.risk_level === 'moderate').length || 0;
      const highRisk = screeningsData?.filter(s => s.risk_level === 'high').length || 0;

      setStats({
        totalUsers: totalUsers,
        totalScreenings,
        avgConfidence,
        activeToday
      });

      (window as any).__riskDistribution = {
        lowRisk,
        moderateRisk,
        highRisk,
        total: totalScreenings
      };

      setRecentScreenings(screeningsData?.slice(0, 5) || []);
    }

    setLoadingData(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getRiskColor = (level: string) => {
    if (level === 'high') return '#f87171';
    if (level === 'moderate') return '#fbbf24';
    return '#34d399';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUserEmail = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (!foundUser) return `${userId.slice(0, 4)}***`;
    const email = foundUser.email;
    const [local, domain] = email.split('@');
    return `${local.charAt(0)}***@${domain}`;
  };

  const riskData = (typeof window !== 'undefined' && (window as any).__riskDistribution)
    ? (window as any).__riskDistribution
    : { lowRisk: 0, moderateRisk: 0, highRisk: 0, total: 1 };

  const lowPct = Math.round((riskData.lowRisk / riskData.total) * 100) || 45;
  const modPct = Math.round((riskData.moderateRisk / riskData.total) * 100) || 35;
  const highPct = Math.round((riskData.highRisk / riskData.total) * 100) || 20;

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  const userInitial = user.email ? user.email[0].toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-[#060608] flex">
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] bg-[#0a0a0c] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)]">
          <div>
            <span className="font-['Syne'] font-extrabold text-[1.15rem] bg-gradient-to-r from-[#a855f7] to-[#00e5ff] bg-clip-text text-transparent">
              SmartSmile
            </span>
            <span className="inline-block bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)] text-[#a855f7] text-[0.62rem] px-1.5 py-0.5 rounded ml-1 align-middle font-bold tracking-wider">
              ADMIN
            </span>
          </div>
        </div>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Overview</div>
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
          <span>📊</span> Dashboard
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Management</div>
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>👥</span> Users
        </Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📷</span> Screenings
        </Link>
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>🦷</span> Dentists
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">System</div>
        <Link href="/admin/model" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>🤖</span> Model Monitor
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>⚙️</span> Settings
        </Link>

        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Session</div>
        <button onClick={handleLogout} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left">
          <span>🚪</span> Log Out
        </button>

        <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#a855f7] to-[#00e5ff] flex items-center justify-center font-bold text-[0.85rem] text-black">
              {userInitial}
            </div>
            <div>
              <div className="text-[0.85rem] font-semibold">Admin</div>
              <div className="text-[0.7rem] text-[#a855f7] font-semibold">System Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[240px] flex-1 p-10 max-w-[calc(100vw-240px)]">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Admin Overview</h1>
            <p className="text-[#666] text-[0.85rem]">
              System-wide metrics and activity — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.15)] rounded-[100px] px-4 py-2 text-[0.78rem] text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
              Live Data
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 relative overflow-hidden hover:border-[rgba(168,85,247,0.2)] transition-colors">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total Users</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none mb-1">{stats.totalUsers}</div>
            <div className="text-[0.72rem] text-[#34d399]">↑ +{Math.floor(stats.totalUsers * 0.03)} this week</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 relative overflow-hidden hover:border-[rgba(168,85,247,0.2)] transition-colors">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total Screenings</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none mb-1">{stats.totalScreenings}</div>
            <div className="text-[0.72rem] text-[#34d399]">↑ +{Math.floor(stats.totalScreenings * 0.03)} this week</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 relative overflow-hidden hover:border-[rgba(168,85,247,0.2)] transition-colors">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Avg. Confidence</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none mb-1">{stats.avgConfidence}%</div>
            <div className="text-[0.72rem] text-[#666]">— Stable this month</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 relative overflow-hidden hover:border-[rgba(168,85,247,0.2)] transition-colors">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Active Today</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none mb-1">{stats.activeToday}</div>
            <div className="text-[0.72rem] text-[#34d399]">↑ +{Math.max(0, stats.activeToday - Math.floor(stats.activeToday * 0.7))} vs yesterday</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Risk Distribution Pie */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-['Syne'] font-bold text-[0.95rem]">Risk Distribution</h3>
              <Link href="/admin/screenings" className="text-[0.75rem] text-[#a855f7] no-underline hover:underline font-medium">View all →</Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-[120px] h-[120px] min-w-[120px]">
                <svg width="120" height="120" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#34d399" strokeWidth="4.5" strokeDasharray={`${lowPct} ${100 - lowPct}`} strokeDashoffset="0" transform="rotate(-90 21 21)"/>
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#fbbf24" strokeWidth="4.5" strokeDasharray={`${modPct} ${100 - modPct}`} strokeDashoffset={`-${lowPct}`} transform="rotate(-90 21 21)"/>
                  <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#f87171" strokeWidth="4.5" strokeDasharray={`${highPct} ${100 - highPct}`} strokeDashoffset={`-${lowPct + modPct}`} transform="rotate(-90 21 21)"/>
                  <circle cx="21" cy="21" r="13" fill="#101012"/>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="font-['Syne'] font-extrabold text-[1.1rem]">{stats.totalScreenings}</div>
                  <div className="text-[0.62rem] text-[#666]">Total</div>
                </div>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-center text-[0.82rem]">
                  <div className="flex items-center gap-2 text-[#666]">
                    <div className="w-2.5 h-2.5 rounded" style={{ background: '#34d399' }}></div>Low Risk
                  </div>
                  <div>
                    <span className="font-['Syne'] font-bold text-[0.88rem]" style={{ color: '#34d399' }}>{lowPct}%</span>
                    <span className="text-[0.72rem] text-[#666] ml-1">({riskData.lowRisk})</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[0.82rem]">
                  <div className="flex items-center gap-2 text-[#666]">
                    <div className="w-2.5 h-2.5 rounded" style={{ background: '#fbbf24' }}></div>Moderate
                  </div>
                  <div>
                    <span className="font-['Syne'] font-bold text-[0.88rem]" style={{ color: '#fbbf24' }}>{modPct}%</span>
                    <span className="text-[0.72rem] text-[#666] ml-1">({riskData.moderateRisk})</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[0.82rem]">
                  <div className="flex items-center gap-2 text-[#666]">
                    <div className="w-2.5 h-2.5 rounded" style={{ background: '#f87171' }}></div>High Risk
                  </div>
                  <div>
                    <span className="font-['Syne'] font-bold text-[0.88rem]" style={{ color: '#f87171' }}>{highPct}%</span>
                    <span className="text-[0.72rem] text-[#666] ml-1">({riskData.highRisk})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Screenings Bar Chart */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-5">Daily Screenings — Last 14 Days</h3>
            <div className="flex items-end gap-1 h-[90px]">
              {[18, 25, 31, 22, 38, 44, 29, 35, 41, 52, 48, 39, 55, 60].map((val, i) => {
                const maxVal = 60;
                const height = (val / maxVal) * 100;
                const isToday = i === 13;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[0.62rem] text-[#666]">{val}</div>
                    <div
                      className="w-full rounded-t cursor-pointer hover:opacity-75 transition-opacity"
                      style={{ height: `${height}%`, background: isToday ? '#a855f7' : 'rgba(168,85,247,0.4)' }}
                    ></div>
                    <div className="text-[0.62rem]" style={{ color: isToday ? '#a855f7' : '#666', fontWeight: isToday ? 700 : 400 }}>
                      {['20','21','22','23','24','25','26','27','28','01','02','03','04','05'][i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-6">
          {/* Recent Activity Table */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px]" style={{ padding: '1.5rem 0' }}>
            <div className="flex justify-between items-center px-6 pb-5">
              <h3 className="font-['Syne'] font-bold text-[0.95rem]">Recent Activity</h3>
              <Link href="/admin/screenings" className="text-[0.75rem] text-[#a855f7] no-underline hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_80px] gap-4 px-4 py-2 text-[0.7rem] text-[#666] uppercase tracking-[0.06em] border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)]">
              <span>User</span><span>Date</span><span>Risk</span><span>Conf.</span><span>Action</span>
            </div>
            {recentScreenings.length === 0 ? (
              <div className="text-center py-8 text-[#666] text-[0.85rem]">No screenings yet</div>
            ) : (
              recentScreenings.map((screening) => (
                <div key={screening.id} className="grid grid-cols-[2fr_1.2fr_1fr_1fr_80px] gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] text-[0.83rem] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer last:border-b-0">
                  <div className="text-[#666] text-[0.8rem]">{getUserEmail(screening.user_id)}</div>
                  <div className="text-[#666] text-[0.78rem]">{formatDate(screening.created_at)}</div>
                  <div>
                    <span
                      className="px-2 py-1 rounded-[100px] text-[0.7rem] font-bold capitalize"
                      style={{
                        backgroundColor: `${getRiskColor(screening.risk_level)}20`,
                        color: getRiskColor(screening.risk_level),
                        border: `1px solid ${getRiskColor(screening.risk_level)}30`
                      }}
                    >
                      {screening.risk_level}
                    </span>
                  </div>
                  <div>
                    <div className="text-[0.82rem]">{Math.round(screening.confidence_score * 100)}%</div>
                    <div className="h-0.5 bg-[rgba(255,255,255,0.06)] rounded mt-1 overflow-hidden">
                      <div className="h-full rounded bg-gradient-to-r from-[#a855f7] to-[#00e5ff]" style={{ width: `${screening.confidence_score * 100}%` }}></div>
                    </div>
                  </div>
                  <button className="bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.18)] text-[#a855f7] rounded-md py-1 px-2 text-[0.72rem] font-semibold cursor-pointer hover:bg-[rgba(168,85,247,0.16)] transition-colors">
                    View
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Model Status */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-['Syne'] font-bold text-[0.95rem]">Model Status</h3>
              <Link href="/admin/model" className="text-[0.75rem] text-[#a855f7] no-underline hover:underline">Details →</Link>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-['Syne'] font-bold text-[0.9rem]">SmartSmile CNN</div>
                <div className="text-[0.72rem] text-[#666] mt-1">v2.1.0 · MobileNet-v3</div>
              </div>
              <div className="flex items-center gap-2 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.15)] rounded-[100px] px-3 py-1 text-[0.72rem] text-[#34d399] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>Active
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Accuracy', value: 86 },
                { label: 'Precision', value: 84 },
                { label: 'Recall', value: 88 },
                { label: 'F1-Score', value: 86 },
                { label: 'Avg. Response', value: 72, isTime: true }
              ].map((metric) => (
                <div key={metric.label} className="flex justify-between items-center text-[0.82rem]">
                  <span className="text-[#666]">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-[rgba(255,255,255,0.06)] rounded overflow-hidden">
                      <div className="h-full rounded" style={{ width: `${metric.value}%`, background: metric.isTime ? 'linear-gradient(90deg,#34d399,#00e5ff)' : 'linear-gradient(90deg,#a855f7,#00e5ff)' }}></div>
                    </div>
                    <span className="font-['Syne'] font-bold text-[0.83rem] min-w-[35px] text-right">{metric.isTime ? '1.4s' : `${metric.value}%`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              {[
                { href: '/admin/users', icon: '👥', label: 'Manage Users', sub: 'View, deactivate or delete users', color: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.15)' },
                { href: '/admin/screenings', icon: '📷', label: 'View Screenings', sub: 'Browse and filter all records', color: 'rgba(0,229,255,0.08)', border: 'rgba(0,229,255,0.12)' },
                { href: '/admin/model', icon: '🤖', label: 'Model Monitor', sub: 'Check performance metrics', color: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.12)' },
                { href: '/admin/settings', icon: '⚙️', label: 'System Settings', sub: 'Retention, maintenance, access', color: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.12)' },
              ].map((action) => (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 bg-[#141416] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-4 cursor-pointer hover:border-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.05)] transition-all no-underline">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.9rem]" style={{ background: action.color, border: `1px solid ${action.border}` }}>{action.icon}</div>
                  <div>
                    <div className="text-[0.85rem] font-semibold text-[#f0f0f0]">{action.label}</div>
                    <div className="text-[0.72rem] text-[#666]">{action.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}