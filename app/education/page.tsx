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

export default function EducationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoadingArticles(true);
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    setArticles(data || []);
    setLoadingArticles(false);
  };

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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitial = user.email ? user.email[0].toUpperCase() : 'U';
  const userName = user.email ? user.email.split('@')[0] : 'User';

  return (
    <div className="min-h-screen bg-[#080808] flex" style={{ fontFamily: "sans-serif" }}>
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-full md:max-w-[calc(100vw-240px)]">
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.3rem' }}>Education Hub</h1>
        <p className="text-[#666] text-[0.9rem] mb-8" style={{ lineHeight: 1.6 }}>Learn about oral health, proper hygiene techniques, and how AI-powered screening works.</p>

        {/* Search */}
        <div className="relative mb-6 max-w-[520px]" style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '520px' }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '1rem' }}></span>
          <input 
            type="text" 
            placeholder="Search articles, tips, FAQs…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-xl py-3 px-4 pl-10 text-[#f0f0f0] text-[0.9rem] outline-none"
            style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.8rem 1rem 0.8rem 2.8rem', color: '#f0f0f0', fontFamily: "sans-serif", fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[0.8rem] font-semibold cursor-pointer transition-all border ${activeCategory === cat ? 'bg-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.25)] text-[#00e5ff]' : 'border-[rgba(255,255,255,0.07)] text-[#666] hover:bg-[rgba(0,229,255,0.06)] hover:border-[rgba(0,229,255,0.2)] hover:text-[#00e5ff]'}`}
              style={{ padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: '0.2s', border: activeCategory === cat ? '1px solid rgba(0,229,255,0.25)' : '1px solid rgba(255,255,255,0.07)', background: activeCategory === cat ? 'rgba(0,229,255,0.1)' : 'transparent', color: activeCategory === cat ? '#00e5ff' : '#666' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured */}
        {(() => {
          const featured = articles.find(a => a.is_featured);
          if (!featured) return null;
          return (
            <div
              className="bg-[#111] border rounded-[20px] p-8 mb-8 flex gap-8 items-center relative overflow-hidden cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(168,85,247,0.04))', border: '1px solid rgba(0,229,255,0.15)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.1), transparent 70%)' }}></div>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[2.2rem]" style={{ width: '80px', height: '80px', minWidth: '80px', borderRadius: '16px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>{featured.thumbnail}</div>
              <div>
                <span className="text-[0.68rem] uppercase text-[#00e5ff] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] px-2 py-1 rounded-full mb-2 inline-block" style={{ display: 'inline-block', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00e5ff', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '100px', marginBottom: '0.5rem' }}>Featured Article</span>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.4rem' }}>{featured.title}</h2>
                <p className="text-[#666] text-[0.88rem]" style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.65, maxWidth: '500px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featured.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span style={{ color: '#666', fontSize: '0.83rem' }}>{featured.read_time}</span>
                  <Link href={`/education/${featured.id}`} className="text-[#00e5ff] text-[0.83rem] font-semibold hover:opacity-75 transition-opacity">Read article →</Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tips Banner */}
        <div className="grid grid-cols-4 gap-4 mb-8 bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <div className="text-center p-2" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div className="text-[1.8rem] mb-2"></div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>Brush 2x Daily</h4>
            <p className="text-[#666] text-[0.73rem]" style={{ color: '#666', fontSize: '0.73rem', lineHeight: 1.5 }}>Morning and night for at least 2 minutes each session</p>
          </div>
          <div className="text-center p-2" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div className="text-[1.8rem] mb-2"></div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>Floss Daily</h4>
            <p className="text-[#666] text-[0.73rem]" style={{ color: '#666', fontSize: '0.73rem', lineHeight: 1.5 }}>Once before bed removes plaque brushing misses</p>
          </div>
          <div className="text-center p-2" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div className="text-[1.8rem] mb-2"></div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>Stay Hydrated</h4>
            <p className="text-[#666] text-[0.73rem]" style={{ color: '#666', fontSize: '0.73rem', lineHeight: 1.5 }}>Water flushes bacteria and supports saliva production</p>
          </div>
          <div className="text-center p-2" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div className="text-[1.8rem] mb-2"></div>
            <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>Visit Dentist</h4>
            <p className="text-[#666] text-[0.73rem]" style={{ color: '#666', fontSize: '0.73rem', lineHeight: 1.5 }}>Professional cleaning every 6 months minimum</p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="flex justify-between items-center mb-5">
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1rem', marginBottom: '1.2rem' }}>Latest Articles</h3>
          <span className="text-[#666] text-[0.78rem]">{filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}</span>
        </div>
        {loadingArticles ? (
          <div className="text-center py-16 text-[#666] text-[0.88rem]">Loading articles...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-40"></div>
            <p className="text-[#666] text-[0.88rem]">No articles available yet. Check back soon.</p>
          </div>
        ) : (
        <div className="grid grid-cols-3 gap-5 mb-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '2.5rem' }}>
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden cursor-pointer transition-all hover:border-[rgba(0,229,255,0.2)] hover:-translate-y-0.5" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: '0.25s' }}>
              <div className="h-[110px] flex items-center justify-center text-[2.8rem] bg-[#161616] relative" style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', background: '#161616', position: 'relative' }}>
                {article.thumbnail}
                <span className="absolute top-2 left-2 text-[0.65rem] uppercase px-2 py-1 rounded-full font-bold" style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: '100px', fontWeight: 700, background: 'rgba(0,229,255,0.12)', color: '#00e5ff' }}>
                  {article.category}
                </span>
              </div>
              <div className="p-5" style={{ padding: '1.2rem' }}>
                <h4 className="font-bold text-[0.9rem] mb-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.35, marginBottom: '0.4rem' }}>{article.title}</h4>
                <p className="text-[#666] text-[0.78rem]" style={{ color: '#666', fontSize: '0.78rem', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.description}</p>
                <Link href={`/education/${article.id}`} className="text-[#00e5ff] text-[0.72rem] font-semibold mt-1 inline-block hover:opacity-75 transition-opacity">Read article →</Link>
                <div className="flex justify-between text-[#666] text-[0.72rem] mt-3" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', color: '#666', fontSize: '0.72rem' }}>
                  <span>{article.read_time}</span>
                  <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* FAQ */}
        <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '1rem', marginBottom: '1.2rem' }}>Frequently Asked Questions</h3>
        <div className="flex flex-col gap-2 mb-8" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
          {[
            { id: 'faq1', q: 'Is SmartSmile a replacement for seeing a dentist?', a: 'No. SmartSmile is a preventive screening tool only. It detects visible surface indicators to raise awareness of potential issues. It does not replace clinical examination, diagnosis, or treatment by a qualified dental professional. Always consult a dentist for proper care.' },
            { id: 'faq2', q: 'How accurate is the AI analysis?', a: 'Our model achieves approximately 78–88% F1-score on test datasets. Accuracy varies based on image quality, lighting, and angle. Always interpret results as preliminary screening insights, not clinical findings. Poor image quality is the most common cause of reduced accuracy.' },
            { id: 'faq3', q: 'What oral conditions can SmartSmile detect?', a: 'SmartSmile can identify visible signs of dental caries (cavities), plaque accumulation, tooth discoloration, and gingival (gum) redness. It cannot detect issues below the tooth surface, in X-rays, or diagnose conditions requiring clinical instruments.' },
            { id: 'faq4', q: 'Is my dental image data stored securely?', a: 'Yes. All images are encrypted in transit and at rest using AES-256 encryption. Images are automatically deleted after 90 days. You can delete your images at any time from Account Settings. We never share your data with third parties.' },
            { id: 'faq5', q: 'How often should I do a screening?', a: 'We recommend doing a screening once every 2–4 weeks to track changes over time. More frequent screenings help you spot trends in your risk level. However, screenings do not replace your 6-monthly professional dental check-up.' }
          ].map((faq) => (
            <div 
              key={faq.id}
              className={`bg-[#111] border rounded-xl overflow-hidden ${openFaq === faq.id ? 'border-[rgba(0,229,255,0.18)]' : 'border-[rgba(255,255,255,0.07)]'}`}
              style={{ background: '#111', border: openFaq === faq.id ? '1px solid rgba(0,229,255,0.18)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <div 
                onClick={() => toggleFaq(faq.id)}
                className="p-4 flex justify-between items-center cursor-pointer"
                style={{ padding: '1.1rem 1.3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span className="font-semibold text-[0.88rem]" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{faq.q}</span>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.9rem] transition-all"
                  style={{ width: '24px', height: '24px', borderRadius: '50%', background: openFaq === faq.id ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: openFaq === faq.id ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: '0.2s' }}
                >
                  {openFaq === faq.id ? '−' : '+'}
                </div>
              </div>
              <div 
                className="overflow-hidden transition-all"
                style={{ maxHeight: openFaq === faq.id ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s' }}
              >
                <p className="text-[#666] text-[0.85rem] px-5 pb-4" style={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.7, padding: '0 1.3rem 1.1rem' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
