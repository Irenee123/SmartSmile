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

interface Screening {
  id: string;
  user_id: string;
  created_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  indicators: string[] | null;
  model_version: string | null;
}

export default function AdminScreeningsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [filtered, setFiltered] = useState<Screening[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string }>({ show: false, id: '' });
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const perPage = 8;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [screenings, riskFilter, dateFilter, searchQuery]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!adminData) { router.push('/dashboard'); return; }
    fetchScreenings();
  };

  const fetchScreenings = async () => {
    setLoadingData(true);
    const { data } = await supabase
      .from('screenings')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setScreenings(data);
      setFiltered(data);
    }
    setLoadingData(false);
  };

  const applyFilters = () => {
    let result = [...screenings];

    if (riskFilter !== 'all') {
      result = result.filter(s => s.risk_level === riskFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(s => {
        const date = new Date(s.created_at);
        const diffDays = (now.getTime() - date.getTime()) / 86400000;
        if (dateFilter === 'today') return diffDays < 1;
        if (dateFilter === '7days') return diffDays <= 7;
        if (dateFilter === '30days') return diffDays <= 30;
        return true;
      });
    }

    if (searchQuery) {
      result = result.filter(s =>
        s.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.risk_level.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFiltered(result);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    await supabase.from('screenings').delete().eq('id', id);
    setScreenings(prev => prev.filter(s => s.id !== id));
    setDeleteModal({ show: false, id: '' });
    showToast('Screening deleted successfully');
  };

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return '#f87171';
    if (risk === 'moderate') return '#fbbf24';
    return '#34d399';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const maskUserId = (id: string) => `${id.slice(0, 6)}…${id.slice(-4)}`;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalLow = screenings.filter(s => s.risk_level === 'low').length;
  const totalMod = screenings.filter(s => s.risk_level === 'moderate').length;
  const totalHigh = screenings.filter(s => s.risk_level === 'high').length;

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading screenings...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#060608] flex">
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] bg-[#0a0a0c] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)]">
          <span className="font-['Syne'] font-extrabold text-[1.15rem] bg-gradient-to-r from-[#a855f7] to-[#00e5ff] bg-clip-text text-transparent">SmartSmile</span>
          <span className="inline-block bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)] text-[#a855f7] text-[0.62rem] px-1.5 py-0.5 rounded ml-1 align-middle font-bold tracking-wider">ADMIN</span>
        </div>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Overview</div>
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📊</span> Dashboard
        </Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Management</div>
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>👥</span> Users
        </Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
          <span>📷</span> Screenings
        </Link>
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>🦷</span> Dentists
        </Link>
        <Link href="/admin/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📚</span> Education
        </Link>
        <Link href="/admin/announcements" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📣</span> Announcements
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

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-3xl">
                  🚪
                </div>
                <h3 className="font-['Syne'] font-bold text-xl text-white mb-2">Log Out</h3>
                <p className="text-[#888] text-[0.92rem] mb-6">Are you sure you want to log out?</p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#a855f7] to-[#00e5ff] flex items-center justify-center font-bold text-[0.85rem] text-black">{userInitial}</div>
            <div>
              <div className="text-[0.85rem] font-semibold">Admin</div>
              <div className="text-[0.7rem] text-[#a855f7] font-semibold">System Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[240px] flex-1 p-10 max-w-[calc(100vw-240px)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">All Screenings</h1>
            <p className="text-[#666] text-[0.85rem]">{screenings.length} total records · {filtered.length} shown</p>
          </div>
          <button
            onClick={fetchScreenings}
            className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Screenings', value: screenings.length, color: '#a855f7' },
            { label: 'Low Risk', value: totalLow, color: '#34d399' },
            { label: 'Moderate Risk', value: totalMod, color: '#fbbf24' },
            { label: 'High Risk', value: totalHigh, color: '#f87171' },
          ].map((card) => (
            <div key={card.label} className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 hover:border-[rgba(168,85,247,0.2)] transition-colors">
              <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">{card.label}</div>
              <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none" style={{ color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] text-[0.85rem]">🔍</span>
            <input
              type="text"
              placeholder="Search user ID or risk level…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[10px] pl-9 pr-4 py-2.5 text-[#f0f0f0] font-['DM_Sans'] text-[0.85rem] outline-none focus:border-[#a855f7] transition-colors w-[260px]"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-2.5 text-[#f0f0f0] font-['DM_Sans'] text-[0.85rem] outline-none focus:border-[#a855f7] transition-colors cursor-pointer"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-2.5 text-[#f0f0f0] font-['DM_Sans'] text-[0.85rem] outline-none focus:border-[#a855f7] transition-colors cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          {(riskFilter !== 'all' || dateFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setRiskFilter('all'); setDateFilter('all'); setSearchQuery(''); }}
              className="text-[0.8rem] text-[#a855f7] hover:text-[#f0f0f0] transition-colors"
            >
              ✕ Clear filters
            </button>
          )}
          <span className="text-[0.8rem] text-[#666] ml-auto">
            {filtered.length} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1.8fr_1fr_1fr_1.5fr_1fr_60px] gap-3 px-6 py-3 text-[0.7rem] text-[#666] uppercase tracking-[0.06em] border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)]">
            <span>Screening ID</span>
            <span>Date & Time</span>
            <span>Risk</span>
            <span>Confidence</span>
            <span>Indicators</span>
            <span>Model</span>
            <span>Del</span>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-16 text-[#666]">
              <div className="text-4xl mb-4 opacity-30">📷</div>
              <div className="font-['Syne'] font-bold text-[#f0f0f0] mb-2">No screenings found</div>
              <div className="text-[0.85rem]">Try adjusting your filters</div>
            </div>
          ) : (
            paginated.map((s) => (
              <div key={s.id} className="grid grid-cols-[1.5fr_1.8fr_1fr_1fr_1.5fr_1fr_60px] gap-3 px-6 py-4 border-b border-[rgba(255,255,255,0.04)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors last:border-b-0">
                <div>
                  <div className="text-[0.78rem] font-mono text-[#f0f0f0]">{maskUserId(s.id)}</div>
                  <div className="text-[0.68rem] text-[#666] mt-0.5">u: {s.user_id.slice(0, 6)}…</div>
                </div>
                <div className="text-[0.8rem] text-[#666]">{formatDate(s.created_at)}</div>
                <div>
                  <span
                    className="px-2.5 py-1 rounded-[100px] text-[0.7rem] font-bold capitalize"
                    style={{
                      backgroundColor: `${getRiskColor(s.risk_level)}18`,
                      color: getRiskColor(s.risk_level),
                      border: `1px solid ${getRiskColor(s.risk_level)}30`
                    }}
                  >
                    {s.risk_level}
                  </span>
                </div>
                <div>
                  <div className="text-[0.82rem] font-['Syne'] font-bold" style={{ color: '#00e5ff' }}>
                    {s.confidence_score > 1 ? Math.round(s.confidence_score) : Math.round(s.confidence_score * 100)}%
                  </div>
                  <div className="h-0.5 bg-[rgba(255,255,255,0.06)] rounded mt-1 w-14 overflow-hidden">
                    <div className="h-full rounded bg-gradient-to-r from-[#a855f7] to-[#00e5ff]" style={{ width: `${s.confidence_score > 1 ? s.confidence_score : s.confidence_score * 100}%` }}></div>
                  </div>
                </div>
                <div className="text-[0.75rem] text-[#666]">
                  {s.indicators && s.indicators.length > 0
                    ? s.indicators.slice(0, 2).join(', ') + (s.indicators.length > 2 ? ` +${s.indicators.length - 2}` : '')
                    : 'None detected'}
                </div>
                <div className="text-[0.75rem] text-[#666]">{s.model_version || 'v2.1.0'}</div>
                <button
                  onClick={() => setDeleteModal({ show: true, id: s.id })}
                  className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-md py-1.5 px-2.5 text-[0.72rem] font-bold cursor-pointer hover:bg-[rgba(248,113,113,0.15)] transition-colors"
                >✕</button>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.07)]">
              <span className="text-[0.78rem] text-[#666]">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.07)] rounded-lg text-[#666] text-[0.8rem] hover:border-[#a855f7] hover:text-[#a855f7] transition-colors disabled:opacity-30"
                >←</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 flex items-center justify-center border rounded-lg text-[0.8rem] transition-colors"
                    style={{
                      borderColor: currentPage === page ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)',
                      background: currentPage === page ? 'rgba(168,85,247,0.12)' : 'transparent',
                      color: currentPage === page ? '#a855f7' : '#666',
                      fontWeight: currentPage === page ? 700 : 400,
                    }}
                  >{page}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.07)] rounded-lg text-[#666] text-[0.8rem] hover:border-[#a855f7] hover:text-[#a855f7] transition-colors disabled:opacity-30"
                >→</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
          <div className="bg-[#111] border border-[rgba(248,113,113,0.2)] rounded-[20px] p-10 max-w-[400px] w-full text-center">
            <div className="text-[2.5rem] mb-4">🗑️</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.2rem] mb-2">Delete Screening?</h3>
            <p className="text-[#666] text-[0.88rem] leading-relaxed mb-6">
              This will permanently delete this screening record and cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModal({ show: false, id: '' })}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-[#f0f0f0] rounded-[10px] px-6 py-2.5 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer"
              >Cancel</button>
              <button
                onClick={handleDelete}
                className="bg-[#f87171] text-black border-none rounded-[10px] px-6 py-2.5 font-['Syne'] font-bold text-[0.88rem] cursor-pointer"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] rounded-[12px] px-5 py-3 flex items-center gap-3 text-[#34d399] text-[0.85rem] z-[999]">
          ✅ {toast.message}
        </div>
      )}
    </div>
  );
}
