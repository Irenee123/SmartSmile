'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LayoutDashboard, Users, ScanLine, MapPin, BookOpen, Megaphone, Cpu, Settings, LogOut, Mail } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data } = await supabase.from('admins').select('id').eq('user_id', user.id).single();
    if (!data) { router.push('/dashboard'); return; }
    fetchMessages();
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
    showToast('Message deleted');
  };

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const unreadCount = messages.filter(m => !m.is_read).length;
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  if (!mounted || authLoading || loading) {
    return <div className="min-h-screen bg-[#060608] flex items-center justify-center"><div className="text-[#a855f7]">Loading messages...</div></div>;
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
        <Link href="/admin" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Management</div>
        <Link href="/admin/users" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><Users size={16} /> Users</Link>
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><ScanLine size={16} /> Screenings</Link>
        <Link href="/admin/dentists" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><MapPin size={16} /> Dentists</Link>
        <Link href="/admin/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><BookOpen size={16} /> Education</Link>
        <Link href="/admin/announcements" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><Megaphone size={16} /> Announcements</Link>
        <Link href="/admin/messages" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
          <Mail size={16} /> Messages
          {unreadCount > 0 && (
            <span className="ml-auto bg-[#a855f7] text-black text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">System</div>
        <Link href="/admin/model" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><Cpu size={16} /> Model Monitor</Link>
        <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><Settings size={16} /> Settings</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Session</div>
        <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left">
          <LogOut size={16} /> Log Out
        </button>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-[#fbbf24]"><LogOut size={28} /></div>
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
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Messages</h1>
            <p className="text-[#666] text-[0.85rem]">{messages.length} total · {unreadCount} unread</p>
          </div>
          <button onClick={fetchMessages} className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all">
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total Messages</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem]">{messages.length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Unread</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] text-[#a855f7]">{unreadCount}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Read</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem] text-[#34d399]">{messages.length - unreadCount}</div>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)] flex items-center justify-center mx-auto mb-4 text-[#a855f7]"><Mail size={24} /></div>
            <h3 className="font-['Syne'] font-bold text-[1rem] mb-2">No messages yet</h3>
            <p className="text-[#666] text-[0.85rem]">Messages sent through the contact form will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_1.6fr] gap-5">
            {/* Message List */}
            <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
              <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.07)] text-[0.7rem] text-[#666] uppercase tracking-wider">Inbox</div>
              <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.04)] max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`px-5 py-4 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.03)] ${selected?.id === msg.id ? 'bg-[rgba(168,85,247,0.06)] border-l-2 border-[#a855f7]' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-[#a855f7] flex-shrink-0" />}
                        <span className={`text-[0.82rem] truncate max-w-[140px] ${!msg.is_read ? 'text-[#f0f0f0] font-semibold' : 'text-[#aaa]'}`}>{msg.email}</span>
                      </div>
                      <span className="text-[0.68rem] text-[#555] flex-shrink-0">{new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className={`text-[0.8rem] truncate mb-1 ${!msg.is_read ? 'text-[#f0f0f0]' : 'text-[#666]'}`}>{msg.subject}</div>
                    <div className="text-[0.72rem] text-[#555] truncate">{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Detail */}
            <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
              {selected ? (
                <div className="flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-['Syne'] font-bold text-[1rem] mb-1">{selected.subject}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[0.78rem] text-[#666]">{selected.email}</span>
                        <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.1)] text-[#a855f7] border border-[rgba(168,85,247,0.2)]">{selected.category}</span>
                        <span className="text-[0.72rem] text-[#555]">{formatDate(selected.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-[8px] px-3 py-1.5 text-[0.75rem] font-semibold cursor-pointer hover:bg-[rgba(248,113,113,0.16)] transition-colors flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-[#ccc] text-[0.9rem] leading-[1.8] whitespace-pre-wrap">{selected.message}</p>
                  </div>
                  <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.07)]">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                      className="inline-flex items-center gap-2 bg-[#a855f7] text-black px-5 py-2.5 rounded-[8px] font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                  <div className="w-14 h-14 rounded-full bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)] flex items-center justify-center mb-4 text-[#a855f7]"><Mail size={22} /></div>
                  <h4 className="font-['Syne'] font-bold text-[0.95rem] mb-2">Select a message</h4>
                  <p className="text-[#555] text-[0.82rem]">Click any message on the left to read it here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] rounded-[12px] px-5 py-3 text-[#34d399] text-[0.85rem] z-[999]">
          {toast.message}
        </div>
      )}
    </div>
  );
}
