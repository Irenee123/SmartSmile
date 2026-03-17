'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  read_time: string;
  created_at: string;
  is_featured: boolean;
}

export default function ArticlePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (params?.id) fetchArticle(params.id as string);
  }, [params?.id]);

  const fetchArticle = async (id: string) => {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').eq('id', id).single();
    setArticle(data);
    setLoading(false);
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  if (!mounted || authLoading) {
    return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><div className="text-[#00e5ff]">Loading...</div></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080808] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] bg-[#0e0e0e] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)]" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, #00e5ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SmartSmile
        </div>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Main</div>
        <Link href="/dashboard" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>🏠</span> Dashboard</Link>
        <Link href="/screening" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📷</span> New Screening</Link>
        <Link href="/history" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📊</span> History</Link>
        <Link href="/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#00e5ff] text-[0.88rem] bg-[rgba(0,229,255,0.08)] border-l-2 border-[#00e5ff]"><span>📚</span> Education Hub</Link>
        <Link href="/dentist" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>🦷</span> Find a Dentist</Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Account</div>
        <Link href="/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>⚙️</span> Settings</Link>
        <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left"><span>🚪</span> Log Out</button>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
            <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(255,200,50,0.1)] flex items-center justify-center text-3xl">🚪</div>
              <h3 className="font-['Syne'] font-bold text-xl text-white mb-2">Log Out</h3>
              <p className="text-[#888] text-[0.92rem] mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors">Cancel</button>
                <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors">Log Out</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7] flex items-center justify-center font-bold text-[0.85rem] text-black">{userInitial}</div>
            <div>
              <div className="text-[0.85rem] font-semibold">{userName}</div>
              <div className="text-[0.72rem] text-[#666]">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[240px] flex-1 p-10 max-w-[calc(100vw-240px)]">
        <Link href="/education" className="inline-flex items-center gap-2 text-[#666] text-[0.82rem] hover:text-[#00e5ff] transition-colors mb-8">
          ← Back to Education Hub
        </Link>

        {loading ? (
          <div className="text-center py-24 text-[#666] text-[0.88rem]">Loading article...</div>
        ) : !article ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-[#666] text-[0.88rem]">Article not found.</p>
            <Link href="/education" className="text-[#00e5ff] text-[0.85rem] mt-4 inline-block hover:opacity-75">← Back to Education Hub</Link>
          </div>
        ) : (
          <div className="max-w-[720px]">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[0.7rem] uppercase tracking-wider px-3 py-1 rounded-full font-bold" style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>{article.category}</span>
              {article.is_featured && (
                <span className="text-[0.7rem] uppercase tracking-wider px-3 py-1 rounded-full font-bold" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>Featured</span>
              )}
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 min-w-[80px] rounded-2xl flex items-center justify-center text-[2.5rem]" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)' }}>
                {article.thumbnail}
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.25, marginBottom: '0.5rem' }}>{article.title}</h1>
                <div className="flex items-center gap-4 text-[#666] text-[0.78rem]">
                  <span>🕐 {article.read_time}</span>
                  <span>📅 {new Date(article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8">
              <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: article.description
                  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                  .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g,'<em>$1</em>')
                  .replace(/__(.+?)__/g,'<u>$1</u>')
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
