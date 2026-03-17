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

const TYPES = ['info', 'warning', 'success', 'urgent'];
const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  info:    { label: 'Info',    color: '#00e5ff', icon: '📢' },
  warning: { label: 'Warning', color: '#fbbf24', icon: '⚠️' },
  success: { label: 'Success', color: '#34d399', icon: '✅' },
  urgent:  { label: 'Urgent',  color: '#f87171', icon: '🚨' },
};

interface Announcement {
  id: string;
  message: string;
  type: string;
  active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [form, setForm] = useState({ message: '', type: 'info' });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !authLoading && !user) router.push('/login'); }, [mounted, authLoading, user, router]);
  useEffect(() => { if (user) checkAdminAndLoad(); }, [user]);

  const checkAdminAndLoad = async () => {
    const { data } = await supabase.from('admins').select('id').eq('user_id', user!.id).single();
    if (!data) { router.push('/dashboard'); return; }
    fetchAnnouncements();
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSave = async () => {
    if (!form.message.trim()) { showToast('Message is required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({ message: form.message.trim(), type: form.type, active: true });
    setSaving(false);
    if (error) { showToast('Failed to publish', 'error'); return; }
    showToast('Announcement published');
    setForm({ message: '', type: 'info' });
    setShowForm(false);
    fetchAnnouncements();
  };

  const toggleActive = async (a: Announcement) => {
    const { error } = await supabase.from('announcements').update({ active: !a.active }).eq('id', a.id);
    if (!error) setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, active: !x.active } : x));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
    showToast('Announcement deleted');
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  if (!mounted || authLoading || loading) {
    return <div className="min-h-screen bg-[#060608] flex items-center justify-center"><div className="text-[#a855f7]">Loading...</div></div>;
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
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📊</span> Dashboard</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Management</div>
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>👥</span> Users</Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📷</span> Screenings</Link>
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>🦷</span> Dentists</Link>
        <Link href="/admin/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📚</span> Education</Link>
        <Link href="/admin/announcements" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]"><span>📣</span> Announcements</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">System</div>
        <Link href="/admin/model" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>🤖</span> Model Monitor</Link>
        <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>⚙️</span> Settings</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Session</div>
        <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left"><span>🚪</span> Log Out</button>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-3xl">🚪</div>
              <h3 className="font-['Syne'] font-bold text-xl text-white mb-2">Log Out</h3>
              <p className="text-[#888] text-[0.92rem] mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer">Cancel</button>
                <button onClick={async () => { await signOut(); router.push('/login'); }} className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-bold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors">Log Out</button>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Announcements</h1>
            <p className="text-[#666] text-[0.85rem]">Publish announcements that appear on the user dashboard</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#a855f7] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] hover:opacity-90 transition-opacity">+ New Announcement</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem]">{announcements.length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Active</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] text-[#34d399]">{announcements.filter(a => a.active).length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Inactive</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] text-[#666]">{announcements.filter(a => !a.active).length}</div>
          </div>
        </div>

        {/* List */}
        {announcements.length === 0 ? (
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-16 text-center">
            <div className="text-4xl mb-4">📣</div>
            <h3 className="font-['Syne'] font-bold text-[1rem] mb-2">No announcements yet</h3>
            <p className="text-[#666] text-[0.85rem] mb-6">Create your first announcement to notify users on their dashboard.</p>
            <button onClick={() => setShowForm(true)} className="bg-[#a855f7] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] hover:opacity-90 transition-opacity">+ New Announcement</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map(a => {
              const meta = TYPE_META[a.type] || TYPE_META.info;
              return (
                <div key={a.id} className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] px-5 py-4 flex items-center gap-4 hover:border-[rgba(168,85,247,0.2)] transition-colors">
                  <span className="text-xl flex-shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.88rem] text-[#f0f0f0] leading-snug">{a.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[0.68rem] px-2 py-0.5 rounded-full font-bold" style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}>{meta.label}</span>
                      <span className="text-[0.68rem] text-[#555]">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(a)} className="text-[0.72rem] font-bold px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer" style={{ background: a.active ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)', color: a.active ? '#34d399' : '#666', border: `1px solid ${a.active ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                      {a.active ? '● Active' : '○ Inactive'}
                    </button>
                    <button onClick={() => setDeleteId(a.id)} className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-[8px] px-2.5 py-1.5 text-[0.75rem] cursor-pointer hover:bg-[rgba(248,113,113,0.16)] transition-colors">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Announcement Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 w-full max-w-[520px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Syne'] font-extrabold text-[1.2rem]">New Announcement</h2>
              <button onClick={() => setShowForm(false)} className="text-[#666] hover:text-[#f0f0f0] text-xl transition-colors">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {TYPES.map(t => {
                    const m = TYPE_META[t];
                    return (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className="py-2 rounded-[8px] text-[0.75rem] font-bold transition-all cursor-pointer"
                        style={{ background: form.type === t ? `${m.color}20` : 'rgba(255,255,255,0.04)', color: form.type === t ? m.color : '#666', border: `1px solid ${form.type === t ? m.color + '40' : 'rgba(255,255,255,0.08)'}` }}>
                        {m.icon} {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your announcement message..."
                  rows={4}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7] transition-colors resize-none"
                />
              </div>
              {form.message.trim() && (() => {
                const c: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                  info:    { bg: 'rgba(0,229,255,0.06)',   border: 'rgba(0,229,255,0.2)',   text: '#00e5ff', icon: '📢' },
                  warning: { bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)',  text: '#fbbf24', icon: '⚠️' },
                  success: { bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.2)',  text: '#34d399', icon: '✅' },
                  urgent:  { bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', text: '#f87171', icon: '🚨' },
                };
                const col = c[form.type] || c.info;
                return (
                  <div>
                    <div className="text-[0.72rem] text-[#555] mb-1.5">Preview on dashboard:</div>
                    <div className="flex items-center gap-3 rounded-[10px] px-4 py-3 text-[0.85rem]" style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                      <span>{col.icon}</span>
                      <span className="flex-1" style={{ color: col.text }}>{form.message}</span>
                      <span className="text-[#555] text-lg">✕</span>
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#f0f0f0] rounded-[10px] py-3 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#a855f7] text-black rounded-[10px] py-3 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">{saving ? 'Publishing...' : 'Publish'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
          <div className="bg-[#111] border border-[rgba(248,113,113,0.2)] rounded-[20px] p-10 max-w-[400px] w-full text-center">
            <div className="text-[2.5rem] mb-4">🗑️</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.1rem] mb-2">Delete Announcement?</h3>
            <p className="text-[#666] text-[0.85rem] mb-6">This will permanently remove the announcement.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#f0f0f0] rounded-[10px] py-3 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-[#f87171] text-black rounded-[10px] py-3 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:bg-[#ef4444] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 rounded-[12px] px-5 py-3 flex items-center gap-3 text-[0.85rem] z-[999]"
          style={{ background: toast.type === 'success' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`, color: toast.type === 'success' ? '#34d399' : '#f87171' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
