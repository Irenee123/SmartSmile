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

const CATEGORIES = ['Oral Hygiene', 'Tooth Decay', 'Brushing Tips', 'Gum Health', 'AI Screening', 'Nutrition'];
const THUMBNAILS = ['🦷','🔍','🪥','🌿','🤖','🍎','💊','🧴','🏥','💉','🩺','🧪','🫀','🧬','💡','📋','🩻','🫁','🧠','❤️'];

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

export default function AdminEducationPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewArticle, setViewArticle] = useState<Article | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    thumbnail: '🦷',
    read_time: '5 min read',
    is_featured: false,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    const { data } = await supabase.from('admins').select('id').eq('user_id', user.id).single();
    if (!data) { router.push('/dashboard'); return; }
    fetchArticles();
  };

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const openEdit = (article: Article) => {
    setEditId(article.id);
    setForm({ title: article.title, description: article.description, category: article.category, thumbnail: article.thumbnail, read_time: article.read_time, is_featured: article.is_featured });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ title: '', description: '', category: CATEGORIES[0], thumbnail: '🦷', read_time: '5 min read', is_featured: false });
  };

  const applyFormat = (tag: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById('desc-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.description.substring(start, end);
    const wrap: Record<string, string> = { bold: '**', italic: '*', underline: '__' };
    const w = wrap[tag];
    const newVal = form.description.substring(0, start) + w + selected + w + form.description.substring(end);
    setForm(f => ({ ...f, description: newVal }));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + w.length, end + w.length); }, 0);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }
    setSaving(true);
    const payload = { title: form.title.trim(), description: form.description.trim(), category: form.category, thumbnail: form.thumbnail, read_time: form.read_time, is_featured: form.is_featured };
    const { error } = editId
      ? await supabase.from('articles').update(payload).eq('id', editId)
      : await supabase.from('articles').insert(payload);
    setSaving(false);
    if (error) { showToast('Failed to save article', 'error'); return; }
    showToast(editId ? 'Article updated successfully' : 'Article published successfully');
    closeForm();
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { showToast('Failed to delete article', 'error'); return; }
    showToast('Article deleted');
    setDeleteId(null);
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const toggleFeatured = async (article: Article) => {
    const { error } = await supabase.from('articles').update({ is_featured: !article.is_featured }).eq('id', article.id);
    if (!error) setArticles(prev => prev.map(a => a.id === article.id ? { ...a, is_featured: !a.is_featured } : a));
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
        <Link href="/admin/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]"><span>📚</span> Education</Link>
        <Link href="/admin/announcements" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📣</span> Announcements</Link>
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
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors">Cancel</button>
                <button onClick={async () => { await signOut(); router.push('/login'); }} className="flex-1 bg-[#f87171] text-white rounded-[10px] px-5 py-3 font-['Syne'] font-semibold text-[0.9rem] cursor-pointer hover:bg-[#ef4444] transition-colors">Log Out</button>
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
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Education Hub</h1>
            <p className="text-[#666] text-[0.85rem]">Manage articles that appear in the user Education Hub</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#a855f7] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            + Add Article
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Total Articles</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem]">{articles.length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Featured</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem]">{articles.filter(a => a.is_featured).length}</div>
          </div>
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5">
            <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">Categories Used</div>
            <div className="font-['Syne'] font-extrabold text-[1.9rem]">{new Set(articles.map(a => a.category)).size}</div>
          </div>
        </div>

        {/* Articles Table */}
        {articles.length === 0 ? (
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-16 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-['Syne'] font-bold text-[1rem] mb-2">No articles yet</h3>
            <p className="text-[#666] text-[0.85rem] mb-6">Add your first article to populate the Education Hub for users.</p>
            <button onClick={() => setShowForm(true)} className="bg-[#a855f7] text-black px-5 py-2.5 rounded-lg font-['Syne'] font-bold text-[0.85rem] hover:opacity-90 transition-opacity">+ Add First Article</button>
          </div>
        ) : (
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_1fr_130px_100px_150px] gap-4 px-5 py-3 text-[0.7rem] text-[#666] uppercase tracking-wider border-b border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]">
              <span>Icon</span><span>Title</span><span>Description</span><span>Category</span><span>Read Time</span><span>Actions</span>
            </div>
            {articles.map((article) => (
              <div key={article.id} className="grid grid-cols-[60px_1fr_1fr_130px_100px_150px] gap-4 px-5 py-4 border-b border-[rgba(255,255,255,0.04)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors last:border-b-0">
                <div className="text-[1.8rem]">{article.thumbnail}</div>
                <div>
                  <div className="text-[0.85rem] font-semibold text-[#f0f0f0] leading-snug">{article.title}</div>
                  {article.is_featured && (
                    <span className="text-[0.62rem] bg-[rgba(168,85,247,0.15)] text-[#a855f7] border border-[rgba(168,85,247,0.25)] px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Featured</span>
                  )}
                </div>
                <div className="text-[0.78rem] text-[#666] leading-relaxed line-clamp-2">{article.description}</div>
                <div>
                  <span className="text-[0.72rem] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border border-[rgba(168,85,247,0.2)] px-2 py-1 rounded-full">{article.category}</span>
                </div>
                <div className="text-[0.78rem] text-[#666]">{article.read_time}</div>
                <div className="flex gap-2">
                  <button onClick={() => setViewArticle(article)} title="View" className="bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.18)] text-[#00e5ff] rounded-md px-2 py-1 text-[0.75rem] cursor-pointer hover:bg-[rgba(0,229,255,0.16)] transition-colors">👁</button>
                  <button onClick={() => openEdit(article)} title="Edit" className="bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.18)] text-[#34d399] rounded-md px-2 py-1 text-[0.75rem] cursor-pointer hover:bg-[rgba(52,211,153,0.16)] transition-colors">✏</button>
                  <button onClick={() => toggleFeatured(article)} title={article.is_featured ? 'Unfeature' : 'Feature'} className="bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.18)] text-[#a855f7] rounded-md px-2 py-1 text-[0.75rem] cursor-pointer hover:bg-[rgba(168,85,247,0.16)] transition-colors">{article.is_featured ? '★' : '☆'}</button>
                  <button onClick={() => setDeleteId(article.id)} className="bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-md px-2 py-1 text-[0.75rem] cursor-pointer hover:bg-[rgba(248,113,113,0.16)] transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* View Article Modal */}
      {viewArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 w-full max-w-[620px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Syne'] font-extrabold text-[1.1rem]">Article Preview</h2>
              <button onClick={() => setViewArticle(null)} className="text-[#666] hover:text-[#f0f0f0] text-xl transition-colors">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-[2.5rem] w-16 h-16 min-w-[64px] rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>{viewArticle.thumbnail}</div>
              <div>
                <div className="font-['Syne'] font-extrabold text-[1.1rem] text-[#f0f0f0] mb-1">{viewArticle.title}</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-[0.68rem] px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>{viewArticle.category}</span>
                  {viewArticle.is_featured && <span className="text-[0.68rem] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>Featured</span>}
                  <span className="text-[0.68rem] text-[#666]">🕐 {viewArticle.read_time}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
              <p className="text-[#ccc] text-[0.88rem]" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{viewArticle.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Article Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 w-full max-w-[580px] my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Syne'] font-extrabold text-[1.2rem]">{editId ? 'Edit Article' : 'Add New Article'}</h2>
              <button onClick={closeForm} className="text-[#666] hover:text-[#f0f0f0] text-xl transition-colors">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Article Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. How to Prevent Tooth Decay"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Content *</label>
                <div className="flex gap-1 mb-1">
                  {(['bold','italic','underline'] as const).map((fmt, i) => (
                    <button key={fmt} type="button" onMouseDown={e => { e.preventDefault(); applyFormat(fmt); }} className="w-8 h-8 rounded-[6px] text-[0.8rem] font-bold border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#ccc] hover:bg-[rgba(168,85,247,0.15)] hover:text-[#a855f7] hover:border-[rgba(168,85,247,0.3)] transition-colors" style={{ fontStyle: i === 1 ? 'italic' : 'normal', textDecoration: i === 2 ? 'underline' : 'none' }}>{['B','I','U'][i]}</button>
                  ))}
                  <span className="text-[0.68rem] text-[#444] self-center ml-2">Select text then click to format</span>
                </div>
                <textarea
                  id="desc-textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Write the full article content here..."
                  rows={8}
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#a855f7] transition-colors resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.88rem] outline-none focus:border-[#a855f7] transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Read Time</label>
                  <input
                    type="text"
                    value={form.read_time}
                    onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))}
                    placeholder="5 min read"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.88rem] outline-none focus:border-[#a855f7] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#666] text-[0.8rem] font-medium mb-2">Thumbnail Icon</label>
                <div className="grid grid-cols-10 gap-2">
                  {THUMBNAILS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, thumbnail: emoji }))}
                      className="w-10 h-10 rounded-[8px] flex items-center justify-center text-[1.3rem] transition-all"
                      style={{
                        background: form.thumbnail === emoji ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                        border: form.thumbnail === emoji ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[0.75rem] text-[#666]">Selected: <span className="text-[1.1rem]">{form.thumbnail}</span></div>
              </div>
              <div className="flex items-center justify-between bg-[rgba(168,85,247,0.04)] border border-[rgba(168,85,247,0.1)] rounded-[10px] px-4 py-3">
                <div>
                  <div className="text-[0.88rem] font-semibold text-[#f0f0f0]">Mark as Featured</div>
                  <div className="text-[0.75rem] text-[#666]">Featured article appears prominently at the top of the Education Hub</div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{ background: form.is_featured ? '#a855f7' : 'rgba(255,255,255,0.1)' }}
                >
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200" style={{ transform: form.is_featured ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={closeForm} className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#f0f0f0] rounded-[10px] py-3 font-['Syne'] font-semibold text-[0.88rem] cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#a855f7] text-black rounded-[10px] py-3 font-['Syne'] font-bold text-[0.88rem] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-8">
          <div className="bg-[#111] border border-[rgba(248,113,113,0.2)] rounded-[20px] p-10 max-w-[400px] w-full text-center">
            <div className="text-[2.5rem] mb-4">🗑️</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.1rem] mb-2">Delete Article?</h3>
            <p className="text-[#666] text-[0.85rem] mb-6">This will permanently remove the article from the Education Hub.</p>
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
