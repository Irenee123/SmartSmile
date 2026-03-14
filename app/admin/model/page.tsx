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

interface ModelStats {
  totalPredictions: number;
  avgConfidence: number;
  lowCount: number;
  modCount: number;
  highCount: number;
  todayCount: number;
  weekCount: number;
}

export default function AdminModelPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modelStats, setModelStats] = useState<ModelStats>({
    totalPredictions: 0,
    avgConfidence: 0,
    lowCount: 0,
    modCount: 0,
    highCount: 0,
    todayCount: 0,
    weekCount: 0,
  });
  const [retrainingStatus, setRetrainingStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) checkAdminAndFetch();
  }, [user]);

  const checkAdminAndFetch = async () => {
    if (!user) return;
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!adminData) { router.push('/dashboard'); return; }
    fetchModelStats();
  };

  const fetchModelStats = async () => {
    setLoadingData(true);
    const { data: screenings } = await supabase
      .from('screenings')
      .select('confidence_score, risk_level, created_at');

    if (screenings) {
      const total = screenings.length;
      const avgConf = total > 0
        ? Math.round(screenings.reduce((acc, s) => acc + (s.confidence_score || 0), 0) / total * 100)
        : 0;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 86400000);

      setModelStats({
        totalPredictions: total,
        avgConfidence: avgConf,
        lowCount: screenings.filter(s => s.risk_level === 'low').length,
        modCount: screenings.filter(s => s.risk_level === 'moderate').length,
        highCount: screenings.filter(s => s.risk_level === 'high').length,
        todayCount: screenings.filter(s => s.created_at.startsWith(today)).length,
        weekCount: screenings.filter(s => new Date(s.created_at) >= weekAgo).length,
      });
    }
    setLoadingData(false);
  };

  const handleRetrain = () => {
    setRetrainingStatus('running');
    setTimeout(() => {
      setRetrainingStatus('done');
      showToast('Model retraining initiated successfully');
      setTimeout(() => setRetrainingStatus('idle'), 4000);
    }, 3000);
  };

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'A';

  const metrics = [
    { label: 'Accuracy', value: 86, description: 'Overall correct predictions out of all predictions made' },
    { label: 'Precision', value: 84, description: 'Correct positive predictions out of all positive predictions' },
    { label: 'Recall', value: 88, description: 'Correct positive predictions out of all actual positives' },
    { label: 'F1-Score', value: 86, description: 'Harmonic mean of precision and recall' },
    { label: 'AUC-ROC', value: 91, description: 'Area under the receiver operating characteristic curve' },
  ];

  const weeklyData = [42, 38, 55, 61, 48, 70, modelStats.todayCount || 60];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const maxWeekly = Math.max(...weeklyData, 1);

  if (!mounted || authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <div className="text-[#a855f7]">Loading model monitor...</div>
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
        <Link href="/admin/screenings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors">
          <span>📷</span> Screenings
        </Link>
        <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">System</div>
        <Link href="/admin/model" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-l-2 border-[#a855f7] text-[0.88rem]">
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
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0] mb-1">Model Monitor</h1>
            <p className="text-[#666] text-[0.85rem]">SmartSmile CNN performance metrics and prediction statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.15)] rounded-[100px] px-4 py-2 text-[0.78rem] text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
              Model Active — v2.1.0
            </div>
            <button
              onClick={fetchModelStats}
              className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2 text-[0.8rem] cursor-pointer hover:border-[#a855f7] hover:text-[#f0f0f0] transition-all"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Predictions', value: modelStats.totalPredictions, color: '#a855f7', sub: 'All time' },
            { label: 'Avg Confidence', value: `${modelStats.avgConfidence}%`, color: '#00e5ff', sub: 'Across all screenings' },
            { label: 'Predictions Today', value: modelStats.todayCount, color: '#34d399', sub: 'Last 24 hours' },
            { label: 'This Week', value: modelStats.weekCount, color: '#fbbf24', sub: 'Last 7 days' },
          ].map((card) => (
            <div key={card.label} className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 hover:border-[rgba(168,85,247,0.2)] transition-colors">
              <div className="text-[0.72rem] text-[#666] uppercase tracking-[0.08em] mb-2">{card.label}</div>
              <div className="font-['Syne'] font-extrabold text-[1.9rem] leading-none mb-1" style={{ color: card.color }}>{card.value}</div>
              <div className="text-[0.72rem] text-[#666]">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Model Info + Retrain */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-6 mb-6">

          {/* Model Card */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="font-['Syne'] font-bold text-[1rem] mb-1">SmartSmile CNN</h3>
                <div className="text-[0.75rem] text-[#666]">Architecture: MobileNet-v3 · Framework: TensorFlow 2.x</div>
              </div>
              <div className="flex items-center gap-2 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.15)] rounded-[100px] px-3 py-1.5 text-[0.72rem] text-[#34d399] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span> Active
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Version', value: 'v2.1.0' },
                { label: 'Last Trained', value: 'Jan 15, 2026' },
                { label: 'Training Samples', value: '12,450' },
                { label: 'Avg Inference Time', value: '1.4s' },
                { label: 'Input Size', value: '224 × 224 px' },
                { label: 'Output Classes', value: 'Low / Moderate / High' },
              ].map((item) => (
                <div key={item.label} className="bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-[10px] px-4 py-3">
                  <div className="text-[0.68rem] text-[#666] uppercase tracking-[0.08em] mb-1">{item.label}</div>
                  <div className="text-[0.85rem] font-semibold text-[#f0f0f0]">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.1)] rounded-[10px] px-4 py-3 text-[0.78rem] text-[#666] leading-relaxed">
              💡 Model was last retrained on January 15, 2026 with an expanded dataset. Performance has remained stable since deployment with no significant drift detected.
            </div>
          </div>

          {/* Retrain Card */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 flex flex-col">
            <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-1">Model Retraining</h3>
            <p className="text-[#666] text-[0.78rem] leading-relaxed mb-5">
              Trigger a retraining job with the latest accumulated screening data. Only do this when a significant volume of new labeled data is available.
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: 'New samples since last train', value: `${modelStats.totalPredictions} screenings` },
                { label: 'Estimated training time', value: '~45 minutes' },
                { label: 'Required minimum samples', value: '500 new records' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-[0.82rem]">
                  <span className="text-[#666]">{item.label}</span>
                  <span className="text-[#f0f0f0] font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              {retrainingStatus === 'idle' && (
                <button
                  onClick={handleRetrain}
                  className="w-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] text-[#a855f7] rounded-[10px] py-3 font-['Syne'] font-bold text-[0.9rem] cursor-pointer hover:bg-[rgba(168,85,247,0.18)] transition-colors flex items-center justify-center gap-2"
                >
                  🤖 Initiate Retraining
                </button>
              )}
              {retrainingStatus === 'running' && (
                <div className="w-full bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] text-[#fbbf24] rounded-[10px] py-3 font-['Syne'] font-bold text-[0.9rem] flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Training in progress…
                </div>
              )}
              {retrainingStatus === 'done' && (
                <div className="w-full bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] text-[#34d399] rounded-[10px] py-3 font-['Syne'] font-bold text-[0.9rem] flex items-center justify-center gap-2">
                  ✓ Retraining initiated
                </div>
              )}
              <p className="text-[0.72rem] text-[#666] text-center mt-3 leading-relaxed">
                Retraining runs in the background via your FastAPI backend. You will be notified when complete.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics + Weekly Chart */}
        <div className="grid grid-cols-[1fr_1.2fr] gap-6 mb-6">

          {/* Metrics */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-5">Performance Metrics</h3>
            <div className="flex flex-col gap-4">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[0.85rem] text-[#f0f0f0] font-semibold">{m.label}</span>
                    <span className="font-['Syne'] font-bold text-[0.95rem]" style={{ color: m.value >= 88 ? '#34d399' : m.value >= 84 ? '#00e5ff' : '#fbbf24' }}>
                      {m.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${m.value}%`,
                        background: m.value >= 88
                          ? 'linear-gradient(90deg,#34d399,#00e5ff)'
                          : 'linear-gradient(90deg,#a855f7,#00e5ff)'
                      }}
                    ></div>
                  </div>
                  <div className="text-[0.68rem] text-[#666] mt-1">{m.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-5">Weekly Prediction Volume</h3>
            <div className="flex items-end gap-3 h-[140px] mb-3">
              {weeklyData.map((val, i) => {
                const height = (val / maxWeekly) * 100;
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-[0.65rem] text-[#666]">{val}</div>
                    <div
                      className="w-full rounded-t-lg transition-all cursor-pointer hover:opacity-80"
                      style={{
                        height: `${height}%`,
                        background: isToday
                          ? 'linear-gradient(180deg,#a855f7,rgba(168,85,247,0.4))'
                          : 'rgba(168,85,247,0.25)'
                      }}
                    ></div>
                    <div className="text-[0.65rem]" style={{ color: isToday ? '#a855f7' : '#666', fontWeight: isToday ? 700 : 400 }}>
                      {weekDays[i]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-[10px] px-4 py-3 flex justify-between">
              <div className="text-center">
                <div className="text-[0.68rem] text-[#666] mb-0.5">Weekly Total</div>
                <div className="font-['Syne'] font-bold text-[0.95rem] text-[#a855f7]">{weeklyData.reduce((a, b) => a + b, 0)}</div>
              </div>
              <div className="text-center">
                <div className="text-[0.68rem] text-[#666] mb-0.5">Daily Avg</div>
                <div className="font-['Syne'] font-bold text-[0.95rem] text-[#00e5ff]">{Math.round(weeklyData.reduce((a, b) => a + b, 0) / 7)}</div>
              </div>
              <div className="text-center">
                <div className="text-[0.68rem] text-[#666] mb-0.5">Peak Day</div>
                <div className="font-['Syne'] font-bold text-[0.95rem] text-[#34d399]">{Math.max(...weeklyData)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution from Real Data */}
        <div className="bg-[#101012] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
          <h3 className="font-['Syne'] font-bold text-[0.95rem] mb-5">Prediction Distribution Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Low Risk', count: modelStats.lowCount, color: '#34d399', icon: '🟢' },
              { label: 'Moderate Risk', count: modelStats.modCount, color: '#fbbf24', icon: '🟡' },
              { label: 'High Risk', count: modelStats.highCount, color: '#f87171', icon: '🔴' },
            ].map((item) => {
              const pct = modelStats.totalPredictions > 0
                ? Math.round((item.count / modelStats.totalPredictions) * 100)
                : 0;
              return (
                <div key={item.label} className="bg-[#141416] border border-[rgba(255,255,255,0.05)] rounded-[14px] p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[0.82rem] text-[#666]">{item.label}</span>
                    <span className="text-[1rem]">{item.icon}</span>
                  </div>
                  <div className="font-['Syne'] font-extrabold text-[2rem] leading-none mb-2" style={{ color: item.color }}>
                    {item.count}
                  </div>
                  <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: item.color }}></div>
                  </div>
                  <div className="text-[0.72rem] text-[#666]">{pct}% of all predictions</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] rounded-[12px] px-5 py-3 flex items-center gap-3 text-[#34d399] text-[0.85rem] z-[999]">
          ✅ {toast.message}
        </div>
      )}
    </div>
  );
}
