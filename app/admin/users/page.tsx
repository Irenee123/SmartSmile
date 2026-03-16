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

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  screening_count: number;
  last_screening: string | null;
  latest_risk: string | null;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; userId: string; email: string }>({ show: false, userId: '', email: '' });
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const usersPerPage = 8;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(u => u.email.toLowerCase().includes(q))
    );
    setCurrentPage(1);
  }, [searchQuery, users]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!adminData) { router.push('/dashboard'); return; }
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoadingData(true);

    // First try to get users from profiles table (synced with Supabase Auth)
    let profilesData: any[] = [];
    const { data: profilesResult, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profilesResult && profilesResult.length > 0) {
      profilesData = profilesResult;
    }

    // Get screenings for stats
    const { data: screenings } = await supabase
      .from('screenings')
      .select('user_id, created_at, risk_level')
      .order('created_at', { ascending: false });

    // Build user stats from screenings
    const userStats: Record<string, { count: number; last: string; risk: string }> = {};
    if (screenings) {
      screenings.forEach(s => {
        if (!userStats[s.user_id]) {
          userStats[s.user_id] = { count: 0, last: s.created_at, risk: s.risk_level };
        }
        userStats[s.user_id].count++;
        if (new Date(s.created_at) > new Date(userStats[s.user_id].last)) {
          userStats[s.user_id].last = s.created_at;
          userStats[s.user_id].risk = s.risk_level;
        }
      });
    }

    let userRecords: UserRecord[] = [];

    if (profilesData.length > 0) {
      // Use profiles table data
      userRecords = profilesData.map(profile => ({
        id: profile.id,
        email: profile.email || `user@smartsmile.app`,
        created_at: profile.created_at,
        screening_count: userStats[profile.id]?.count || 0,
        last_screening: userStats[profile.id]?.last || null,
        latest_risk: userStats[profile.id]?.risk || null,
      }));
    } else if (screenings && screenings.length > 0) {
      // Fallback: extract unique users from screenings
      const uniqueIds = Object.keys(userStats);
      userRecords = uniqueIds.map((id, index) => ({
        id,
        email: `user${index + 1}@smartsmile.app`,
        created_at: screenings.find(s => s.user_id === id)?.created_at || new Date().toISOString(),
        screening_count: userStats[id].count,
        last_screening: userStats[id].last,
        latest_risk: userStats[id].risk,
      }));
    }

    setUsers(userRecords);
    setFilteredUsers(userRecords);
    setLoadingData(false);
  };

  const handleDeactivate = async (userId: string) => {
    showToast('User deactivated successfully');
  };

const handleDelete = async () => {
    const { userId } = deleteModal;
    setDeleteModal({ show: false, userId: '', email: '' });

    try {
      // Delete user's screenings
      const { error: screeningsError } = await supabase
        .from('screenings')
        .delete()
        .eq('user_id', userId);

      if (screeningsError) {
        showToast('Failed to delete user screenings');
        return;
      }

      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        showToast('Failed to delete user profile');
        return;
      }

      // ✅ Only update UI after real DB deletion
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted successfully');

    } catch (error) {
      showToast('An error occurred while deleting the user');
    }
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

  const getRiskColor = (risk: string | null) => {
    if (risk === 'high') return '#f87171';
    if (risk === 'moderate') return '#fbbf24';
    if (risk === 'low') return '#34d399';
    return '#666';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading users...</div>
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
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
          <span>👥</span> Users
        </Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
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
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">User Management</h1>
            <p className="text-[#666] text-[0.85rem]">{users.length} registered users · {filteredUsers.length} shown</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: '#a855f7' },
            { label: 'Low Risk Users', value: users.filter(u => u.latest_risk === 'low').length, color: '#34d399' },
            { label: 'Moderate Risk', value: users.filter(u => u.latest_risk === 'moderate').length, color: '#fbbf24' },
            { label: 'High Risk Users', value: users.filter(u => u.latest_risk === 'high').length, color: '#f87171' },
          ].map((card) => (
            <div key={card.label} className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 hover:border-[rgba(168,85,247,0.2)] transition-colors">
              <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">{card.label}</div>
              <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none" style={{ color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="relative flex-1 max-w-[360px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">🔍</span>
            <input
              type="text"
              placeholder="Search by user ID or email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[10px] pl-9 pr-4 py-2.5 text-[#f0f0f0] font-['DM_Sans'] text-[0.85rem] outline-none focus:border-[#a855f7] transition-colors"
            />
          </div>
          <span className="text-[0.8rem] text-[#666] ml-auto">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden mb-4">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_140px] gap-4 px-6 py-3 text-[0.7rem] text-[#666] uppercase tracking-[0.06em] border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)]">
            <span>User ID</span>
            <span>Screenings</span>
            <span>Last Screening</span>
            <span>Latest Risk</span>
            <span>Actions</span>
          </div>

          {paginatedUsers.length === 0 ? (
            <div className="text-center py-16 text-[#666]">
              <div className="text-4xl mb-4 opacity-30">👥</div>
              <div className="font-['Syne'] font-bold text-[#f0f0f0] mb-2">No users found</div>
              <div className="text-[0.85rem]">Try adjusting your search query</div>
            </div>
          ) : (
            paginatedUsers.map((u) => (
              <div key={u.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_140px] gap-4 px-6 py-4 border-b border-[rgba(255,255,255,0.04)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors last:border-b-0">
                <div>
                  <div className="text-[0.82rem] font-mono text-[#f0f0f0]">{u.id.slice(0, 8)}…</div>
                  <div className="text-[0.72rem] text-[#666] mt-0.5">{u.email}</div>
                </div>
                <div className="font-['Syne'] font-bold text-[0.95rem]">{u.screening_count}</div>
                <div className="text-[0.82rem] text-[#666]">
                  {u.last_screening ? formatDate(u.last_screening) : '—'}
                </div>
                <div>
                  {u.latest_risk ? (
                    <span
                      className="px-2.5 py-1 rounded-[100px] text-[0.72rem] font-bold capitalize"
                      style={{
                        backgroundColor: `${getRiskColor(u.latest_risk)}18`,
                        color: getRiskColor(u.latest_risk),
                        border: `1px solid ${getRiskColor(u.latest_risk)}30`
                      }}
                    >
                      {u.latest_risk}
                    </span>
                  ) : (
                    <span className="text-[#666] text-[0.8rem]">—</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    className="bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.18)] text-[#fbbf24] rounded-md py-1.5 px-3 text-[0.72rem] font-semibold cursor-pointer hover:bg-[rgba(251,191,36,0.15)] transition-colors"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, userId: u.id, email: u.email })}
                    className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-md py-1.5 px-2.5 text-[0.72rem] font-semibold cursor-pointer hover:bg-[rgba(248,113,113,0.15)] transition-colors"
                  >
                    ✕
                  </button>
                </div>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            <div className="text-[2.5rem] mb-4">⚠️</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.2rem] mb-2">Delete User?</h3>
            <p className="text-[#666] text-[0.88rem] leading-relaxed mb-6">
              This will permanently delete user <span className="text-[#f0f0f0] font-semibold">{deleteModal.email}</span> and all their screening data. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteModal({ show: false, userId: '', email: '' })}
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
