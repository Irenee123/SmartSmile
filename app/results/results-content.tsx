'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScreeningRecord {
  id: string;
  created_at: string;
  risk_level: 'low' | 'moderate' | 'high';
  confidence_score: number;
  indicators: string[] | null;
  recommendations: string[] | null;
  model_version: string | null;
  image_path: string | null;
  is_deleted: boolean;
}

export default function ResultsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [screening, setScreening] = useState<ScreeningRecord | null>(null);
  const [sessionAnalysis, setSessionAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) router.push('/login');
  }, [mounted, authLoading, user, router]);

  useEffect(() => {
    if (user) fetchResult();
  }, [user]);

  const fetchResult = async () => {
    const id = searchParams.get('id');
    const sessionResult = sessionStorage.getItem('latestAnalysis');

    if (id) {
      // Fetch specific screening by ID
      const { data, error } = await supabase
        .from('screenings')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) setScreening(data);

    } else if (sessionResult) {
      // ✅ Keep session analysis for display (summary, findings etc)
      const analysis = JSON.parse(sessionResult);
      setSessionAnalysis(analysis);

      // ✅ Fetch the latest saved screening from DB for the ID
      const { data: latestData } = await supabase
        .from('screenings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestData) setScreening(latestData);

      sessionStorage.removeItem('latestAnalysis');
    }

    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!screening) return;

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    const riskLevel = capitalize(screening.risk_level);
    const confidence = getConfidence();
    const indicators = getIndicators();
    const recommendations = getRecommendations();
    const reportId = `SS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*9000)+1000}`;

    // Create a container element for PDF generation
    const container = document.createElement('div');
    container.innerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>SmartSmile — Oral Health Report</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #e8e8f0; font-family: 'DM Sans', sans-serif; color: #0a0a0f; padding: 20px; }
    .page { background: #fff; width: 794px; min-height: 1123px; margin: 0 auto; position: relative; overflow: hidden; box-shadow: 0 20px 80px rgba(0,0,0,0.15); }
    .accent-line { height: 3px; background: linear-gradient(90deg, #00c8e0, #7c3aed, transparent); }
    .header { background: #0a0a0f; padding: 2.5rem 3rem 2rem; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 280px; height: 280px; border-radius: 50%; background: radial-gradient(circle, rgba(0,200,224,0.15), transparent 70%); }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.6rem; background: linear-gradient(135deg, #00c8e0, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .logo-sub { font-size: 0.72rem; color: rgba(255,255,255,0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 0.2rem; }
    .report-badge { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.5rem 1rem; text-align: right; }
    .report-badge .label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.2rem; }
    .report-badge .value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; color: rgba(255,255,255,0.85); }
    .header-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; color: rgba(255,255,255,0.9); margin-bottom: 0.3rem; }
    .header-date { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
    .risk-banner { margin: 0 3rem 2rem; background: linear-gradient(135deg, #0f0f1a, #1a1a2e); border: 1px solid rgba(255,255,255,0.08); border-top: none; border-radius: 0 0 16px 16px; padding: 1.5rem 2rem; display: flex; align-items: center; gap: 2rem; }
    .risk-level-block { text-align: center; min-width: 120px; }
    .risk-label-small { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.35); margin-bottom: 0.5rem; }
    .risk-pill { display: inline-block; padding: 0.4rem 1.2rem; border-radius: 100px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; }
    .risk-low { background: rgba(5,150,105,0.2); color: #34d399; border: 1px solid rgba(5,150,105,0.3); }
    .risk-moderate { background: rgba(217,119,6,0.2); color: #fbbf24; border: 1px solid rgba(217,119,6,0.3); }
    .risk-high { background: rgba(220,38,38,0.2); color: #f87171; border: 1px solid rgba(220,38,38,0.3); }
    .risk-divider { width: 1px; height: 50px; background: rgba(255,255,255,0.08); }
    .confidence-block { text-align: center; min-width: 100px; }
    .confidence-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2rem; color: #00c8e0; line-height: 1; margin-bottom: 0.2rem; }
    .confidence-sub { font-size: 0.68rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; }
    .risk-summary { flex: 1; font-size: 0.82rem; color: rgba(255,255,255,0.55); line-height: 1.65; border-left: 2px solid rgba(0,200,224,0.2); padding-left: 1.25rem; }
    .body { padding: 0 3rem 2rem; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.75rem; }
    .stat-card { background: #f5f5fa; border: 1px solid #e8e8f5; border-radius: 12px; padding: 1rem 1.25rem; }
    .stat-label { font-size: 0.68rem; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
    .stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.3rem; color: #0a0a0f; }
    .stat-sub { font-size: 0.7rem; color: #6b6b80; margin-top: 0.1rem; }
    .conf-bar-wrap { background: #e8e8f5; border-radius: 100px; height: 6px; overflow: hidden; margin-top: 0.5rem; }
    .conf-bar-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #00c8e0, #7c3aed); }
    .section { margin-bottom: 1.75rem; }
    .section-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; padding-bottom: 0.6rem; border-bottom: 1px solid #ebebf5; }
    .section-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; }
    .icon-cyan { background: #e0f9fc; }
    .icon-purple { background: #ede9fe; }
    .section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.88rem; color: #0a0a0f; text-transform: uppercase; letter-spacing: 0.06em; }
    .indicators-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .indicator-tag { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.85rem; border-radius: 100px; font-size: 0.78rem; font-weight: 500; background: #f5f5fa; color: #1a1a24; border: 1px solid #e0e0ee; }
    .rec-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .rec-item { display: flex; gap: 0.85rem; align-items: flex-start; }
    .rec-num { width: 24px; height: 24px; border-radius: 50%; background: #0a0a0f; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .rec-text { font-size: 0.84rem; color: #1a1a24; line-height: 1.6; }
    .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 1rem 1.25rem; display: flex; gap: 0.75rem; align-items: flex-start; margin-bottom: 1.5rem; }
    .disclaimer-text { font-size: 0.75rem; color: #92400e; line-height: 1.65; }
    .footer { background: #0a0a0f; padding: 1.25rem 3rem; display: flex; justify-content: space-between; align-items: center; }
    .footer-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.9rem; background: linear-gradient(135deg, #00c8e0, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .footer-text { font-size: 0.7rem; color: rgba(255,255,255,0.3); }
    .footer-id { font-size: 0.68rem; color: rgba(255,255,255,0.25); font-family: monospace; }
  </style>
</head>
<body>
<div class="page">
  <div class="accent-line"></div>
  <div class="header">
    <div class="header-top">
      <div>
        <div class="logo">SmartSmile</div>
        <div class="logo-sub">Oral Health Screening System</div>
      </div>
      <div class="report-badge">
        <div class="label">Report ID</div>
        <div class="value">#${reportId}</div>
      </div>
    </div>
    <div class="header-title">Oral Health Screening Report</div>
    <div class="header-date">Generated on ${formatDate(screening.created_at)}</div>
  </div>

  <div class="risk-banner">
    <div class="risk-level-block">
      <div class="risk-label-small">Risk Level</div>
      <div class="risk-pill risk-${screening.risk_level}">${riskLevel}</div>
    </div>
    <div class="risk-divider"></div>
    <div class="confidence-block">
      <div class="confidence-num">${confidence}%</div>
      <div class="confidence-sub">Confidence</div>
    </div>
    <div class="risk-divider"></div>
    <div class="risk-summary">
      Your screening indicates a <strong style="color:rgba(255,255,255,0.75)">${riskLevel.toLowerCase()} oral health risk</strong>. ${getSummary()}
    </div>
  </div>

  <div class="body">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">AI Model</div>
        <div class="stat-value">${screening.model_version || 'v2.1.0'}</div>
        <div class="stat-sub">SmartSmile CNN</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Model Confidence</div>
        <div class="stat-value">${confidence}%</div>
        <div class="conf-bar-wrap"><div class="conf-bar-fill" style="width:${confidence}%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Indicators Detected</div>
        <div class="stat-value">${indicators.length}</div>
        <div class="stat-sub">${indicators.length === 1 ? 'Area of concern found' : 'Areas of concern found'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-icon icon-cyan">🔍</div>
        <div class="section-title">Detected Indicators</div>
      </div>
      <div class="indicators-grid">
        ${indicators.map(i => `<div class="indicator-tag">${i}</div>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-icon icon-purple">📋</div>
        <div class="section-title">Preventive Recommendations</div>
      </div>
      <div class="rec-list">
        ${recommendations.map((rec, i) => `
          <div class="rec-item">
            <div class="rec-num">${i + 1}</div>
            <div class="rec-text">${rec}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="disclaimer">
      <div style="font-size:0.9rem;flex-shrink:0;">⚠️</div>
      <div class="disclaimer-text">
        <strong>Medical Disclaimer:</strong> This report is generated by an AI screening system for preventive awareness purposes only. It does not constitute a medical or clinical diagnosis. SmartSmile is not a substitute for professional dental care. Please consult a qualified and licensed dentist for accurate assessment, diagnosis, and treatment planning. Never make clinical decisions based solely on these results.
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-logo">SmartSmile</div>
    <div class="footer-text">Oral Health Screening System · AI-Powered Dental Risk Assessment</div>
    <div class="footer-id">${reportId}</div>
  </div>
</div>
</body>
</html>`;

    // Configure PDF options
    const opt = {
      margin: 0,
      filename: `SmartSmile-Report-${new Date(screening.created_at).toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    // Generate PDF
    try {
      await html2pdf().set(opt).from(container).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(container.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // ✅ Helpers
  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return '#f87171';
    if (risk === 'moderate') return '#fbbf24';
    return '#34d399';
  };

  const getRiskBorderColor = (risk: string) => {
    if (risk === 'high') return 'rgba(248,113,113,0.2)';
    if (risk === 'moderate') return 'rgba(251,191,36,0.2)';
    return 'rgba(52,211,153,0.2)';
  };

  const getRiskGlowColor = (risk: string) => {
    if (risk === 'high') return 'rgba(248,113,113,0.1)';
    if (risk === 'moderate') return 'rgba(251,191,36,0.1)';
    return 'rgba(52,211,153,0.1)';
  };

  const getPillStyle = (indicator: string) => {
    const lower = indicator.toLowerCase();
    if (lower.includes('no ') || lower.includes('healthy') || lower.includes('good') || lower.includes('ok')) {
      return { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' };
    }
    return { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' };
  };

  const getAllScores = (): Record<string, number> => {
    if (sessionAnalysis?.allScores) return sessionAnalysis.allScores;
    return {};
  };

  const getHeatmapImage = (): string | null => {
    if (sessionAnalysis?.heatmapImage) return sessionAnalysis.heatmapImage;
    return null;
  };

  const getCauses = () => [
    'Irregular or incomplete brushing technique leaving plaque on surfaces',
    'High consumption of sugary or acidic foods and beverages',
    'Insufficient flossing allowing plaque to build up between teeth',
    'Staining from coffee, tea, or other pigmented drinks',
    'Dry mouth or reduced saliva flow affecting natural cleaning',
  ];

  // ✅ Get display values — prefer sessionAnalysis for rich data, fall back to DB record
  const getSummary = () => {
    if (sessionAnalysis?.summary) return sessionAnalysis.summary;
    return `Your screening shows a ${screening?.risk_level || 'moderate'} oral health risk. Please review the recommendations below.`;
  };

  const getConfidence = () => {
    if (!screening) return 0;
    // confidence_score stored as decimal (0.79) or percentage (79)
    const score = screening.confidence_score || 0;
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  };

  const getIndicators = (): string[] => {
    if (screening?.indicators && screening.indicators.length > 0) return screening.indicators;
    if (sessionAnalysis?.findings) return sessionAnalysis.findings.map((f: any) => f.condition.split('(')[0].trim());
    return ['No indicators detected'];
  };

  const getRecommendations = (): string[] => {
    if (screening?.recommendations && screening.recommendations.length > 0) return screening.recommendations;
    if (sessionAnalysis?.recommendations) return sessionAnalysis.recommendations;
    return ['Consult a dental professional for a full assessment.'];
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
  const userName = user?.email ? user.email.split('@')[0] : 'User';

  const Sidebar = () => (
    <aside className="w-[240px] min-w-[240px] bg-[#0e0e0e] border-r border-[rgba(255,255,255,0.07)] flex flex-col fixed left-0 top-0 h-screen z-50">
      <div className="py-6 px-4 border-b border-[rgba(255,255,255,0.07)] font-['Syne'] font-extrabold text-[1.2rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
        SmartSmile
      </div>
      <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666]">Main</div>
      <Link href="/dashboard" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>🏠</span> Dashboard</Link>
      <Link href="/screening" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📷</span> New Screening</Link>
      <Link href="/history" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📊</span> History</Link>
      <Link href="/education" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>📚</span> Education Hub</Link>
      <div className="py-3 px-4 text-[0.68rem] tracking-[0.12em] uppercase text-[#666] mt-2">Account</div>
      <Link href="/settings" className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors"><span>⚙️</span> Settings</Link>
      <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="flex items-center gap-3 py-2.5 px-4 mx-2 rounded-[10px] text-[#666] text-[0.88rem] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#f0f0f0] transition-colors w-full text-left"><span>🚪</span> Log Out</button>
      <div className="mt-auto py-4 px-4 border-t border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7] flex items-center justify-center font-bold text-[0.85rem] text-black">{userInitial}</div>
          <div>
            <div className="text-[0.85rem] font-semibold">{userName}</div>
            <div className="text-[0.72rem] text-[#666]">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );

  if (!mounted || authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading results...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!screening) {
    return (
      <div className="min-h-screen bg-[#080808] flex">
        <Sidebar />
        <main className="ml-[240px] flex-1 p-10">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="font-['Syne'] font-bold text-xl mb-2">No Results Found</h2>
            <p className="text-[#666] mb-6">We couldn't find any screening results.</p>
            <Link href="/screening" className="bg-[#00e5ff] text-black px-6 py-3 rounded-lg font-['Syne'] font-bold text-[0.9rem] no-underline hover:opacity-90 transition-opacity inline-flex items-center gap-2">
              📷 Start New Screening
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const riskLevel = screening.risk_level;
  const confidence = getConfidence();
  const indicators = getIndicators();
  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar />

      <main className="ml-[240px] flex-1 p-10 max-w-[calc(100vw-240px)]" ref={contentRef}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[1.5rem]">Screening Results</h1>
            <p className="text-[#666] text-[0.85rem] mt-1">
              Analysis completed — {formatDate(screening.created_at)} · Model {screening.model_version || 'v2.1.0'}
            </p>
          </div>
          <Link href="/history" className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-[#666] rounded-lg px-4 py-2.5 text-[0.83rem] no-underline hover:border-[#00e5ff] hover:text-[#f0f0f0] transition-colors">
            ← Back to History
          </Link>
        </div>

        {/* Risk Hero */}
        <div
          className="bg-[#111] rounded-[20px] p-10 flex gap-10 items-center mb-6 relative overflow-hidden"
          style={{ border: `1px solid ${getRiskBorderColor(riskLevel)}` }}
        >
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: `radial-gradient(circle, ${getRiskGlowColor(riskLevel)}, transparent 70%)`, pointerEvents: 'none' }}></div>

          <div className="text-center min-w-[160px]">
            <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#666] mb-4">Risk Level</div>
            <div
              className="inline-block mb-4 px-8 py-3 rounded-[100px] font-['Syne'] font-extrabold text-[1.3rem]"
              style={{
                background: `${getRiskColor(riskLevel)}18`,
                color: getRiskColor(riskLevel),
                border: `2px solid ${getRiskColor(riskLevel)}40`
              }}
            >
              {capitalize(riskLevel)}
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl p-4">
              <div className="text-[0.7rem] text-[#666] mb-1 uppercase tracking-[0.08em]">Confidence Score</div>
              <div className="font-['Syne'] font-extrabold text-[2.2rem] text-[#00e5ff] leading-none">{confidence}%</div>
              <div className="text-[0.72rem] text-[#666] mt-1">Model confidence</div>
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)', alignSelf: 'stretch', minHeight: '80px' }}></div>

          <div className="flex-1">
            <h3 className="font-['Syne'] font-bold text-[1.05rem] mb-3">What this means</h3>
            <p className="text-[#666] text-[0.9rem] leading-[1.75] mb-4">{getSummary()}</p>
            <div className="flex flex-wrap gap-2">
              {indicators.map((indicator, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-[100px] text-[0.75rem] font-semibold"
                  style={getPillStyle(indicator)}
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Causes */}
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-5">Possible Causes</div>
            <ul className="list-none flex flex-col gap-3">
              {getCauses().map((cause, i) => (
                <li key={i} className="flex gap-3 items-start text-[#666] text-[0.88rem] leading-[1.6]">
                  <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(riskLevel), marginTop: '6px' }}></div>
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Visual Highlight */}
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-5">AI Visual Highlight</div>
            {(() => {
              const heatmapImage = getHeatmapImage();
              const allScores = getAllScores();
              const scoreEntries = Object.entries(allScores).filter(([_, v]) => v > 0.05).sort((a, b) => b[1] - a[1]);
              const hasScores = scoreEntries.length > 0;
              const riskLevel = screening?.risk_level || 'moderate';
              
              // Use actual risk level colors from the screening
              const riskColors = {
                high: { bar: '#f87171', bg: 'rgba(248,113,113,0.15)', label: 'High risk' },
                moderate: { bar: '#fbbf24', bg: 'rgba(251,191,36,0.15)', label: 'Moderate' },
                low: { bar: '#34d399', bg: 'rgba(52,211,153,0.15)', label: 'Normal' }
              };
              const currentRisk = riskColors[riskLevel];
              
              // If we have a heatmap image, display it
              if (heatmapImage) {
                return (
                  <>
                    <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl p-3 overflow-hidden">
                      <div className="relative">
                        <img 
                          src={`data:image/png;base64,${heatmapImage}`}
                          alt="AI Heatmap Visualization"
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 px-1">
                      <div className="flex gap-4">
                        {[{ color: '#f87171', label: 'High concern' }, { color: '#fbbf24', label: 'Moderate' }, { color: '#34d399', label: 'Normal' }].map(item => (
                          <div key={item.label} className="flex items-center gap-2 text-[0.72rem] text-[#666]">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                            {item.label}
                          </div>
                        ))}
                      </div>
                      <div className="text-[0.7rem] text-[#666]">Grad-CAM Heatmap</div>
                    </div>
                  </>
                );
              }
              
              // Fallback to probability bars if no heatmap
              if (!hasScores) {
                return (
                  <>
                    <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl h-[180px] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 40% 50%, ${currentRisk.bg} 0%, transparent 70%)` }}></div>
                      <div className="font-['Syne'] font-extrabold text-[0.85rem] tracking-[0.15em] relative" style={{ color: currentRisk.bar }}>CONDITION DETECTED</div>
                      <div className="text-[0.75rem] text-[#666] relative">Primary: {indicators[0] || 'Unknown condition'}</div>
                    </div>
                    <div className="flex gap-5 mt-4">
                      {[{ color: '#f87171', label: 'High concern' }, { color: '#fbbf24', label: 'Moderate' }, { color: '#34d399', label: 'Normal' }].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-[0.72rem] text-[#666]">
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </>
                );
              }

              const conditionLabels: Record<string, string> = {
                'gingivitis': 'Gingivitis',
                'caries': 'Dental Caries',
                'calculus': 'Calculus',
                'tooth_discoloration': 'Discoloration',
                'hypodontia': 'Hypodontia',
                'mouth_ulcer': 'Mouth Ulcer'
              };

              // Get severity info from the primary condition
              const severityMap: Record<string, 'high' | 'moderate' | 'low'> = {
                'caries': 'high',
                'gingivitis': 'moderate',
                'calculus': 'moderate',
                'tooth_discoloration': 'low',
                'hypodontia': 'moderate',
                'mouth_ulcer': 'low'
              };

              return (
                <>
                  <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 relative overflow-hidden">
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 80%, ${currentRisk.bg} 0%, transparent 70%)` }}></div>
                    <div className="relative">
                      <div className="font-['Syne'] font-bold text-[0.8rem] mb-3" style={{ color: currentRisk.bar }}>
                        Risk Level: {riskLevel.toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-2">
                        {scoreEntries.slice(0, 5).map(([condition, score], idx) => {
                          const severity = severityMap[condition] || 'low';
                          const barColor = severity === 'high' ? '#f87171' : severity === 'moderate' ? '#fbbf24' : '#34d399';
                          return (
                            <div key={condition} className="flex items-center gap-3">
                              <div className="text-[0.7rem] text-[#888] w-24 truncate">{conditionLabels[condition] || condition}</div>
                              <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${score * 100}%`, background: barColor }}
                                ></div>
                              </div>
                              <div className="text-[0.7rem] font-mono w-12 text-right" style={{ color: barColor }}>
                                {Math.round(score * 100)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-5 mt-4">
                    {[{ color: '#f87171', label: 'High risk' }, { color: '#fbbf24', label: 'Moderate' }, { color: '#34d399', label: 'Low risk' }].map(item => (
                      <div key={item.label} className="flex items-center gap-2 text-[0.72rem] text-[#666]">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 mb-6">
          <div className="font-['Syne'] font-bold text-[0.95rem] mb-5">Preventive Recommendations</div>
          <ul className="list-none flex flex-col gap-4">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div style={{
                  minWidth: '36px', height: '36px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  background: ['rgba(0,229,255,0.08)', 'rgba(168,85,247,0.08)', 'rgba(249,115,22,0.08)', 'rgba(251,191,36,0.08)'][i % 4],
                  border: `1px solid ${['rgba(0,229,255,0.12)', 'rgba(168,85,247,0.12)', 'rgba(249,115,22,0.12)', 'rgba(251,191,36,0.12)'][i % 4]}`
                }}>
                  {['🪥', '🧵', '🍬', '🏥'][i % 4]}
                </div>
                <div>
                  <h4 className="font-['Syne'] font-bold text-[0.85rem] mb-1">
                    {['Improve Your Brushing Technique', 'Start Flossing Daily', 'Reduce Sugar & Acid Intake', 'Schedule a Dentist Visit'][i % 4]}
                  </h4>
                  <p className="text-[#666] text-[0.83rem] leading-[1.6]">{rec}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleDownloadPDF}
            className="bg-[rgba(0,229,255,0.07)] border border-[rgba(0,229,255,0.18)] text-[#00e5ff] rounded-xl p-4 font-['Syne'] font-bold text-[0.9rem] cursor-pointer hover:bg-[rgba(0,229,255,0.12)] transition-colors flex items-center justify-center gap-2"
          >
            ⬇ Download PDF Report
          </button>
          <Link
            href="/history"
            className="bg-[rgba(168,85,247,0.07)] border border-[rgba(168,85,247,0.18)] text-[#a855f7] rounded-xl p-4 font-['Syne'] font-bold text-[0.9rem] cursor-pointer hover:bg-[rgba(168,85,247,0.12)] transition-colors flex items-center justify-center gap-2 no-underline"
          >
            📊 View History
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="bg-[rgba(249,115,22,0.04)] border border-[rgba(249,115,22,0.12)] rounded-xl p-5 flex gap-4 items-start">
          <span>⚠️</span>
          <p className="text-[#666] text-[0.78rem] leading-[1.65] m-0">
            This result is for preventive awareness purposes only and does not constitute a medical or clinical diagnosis. SmartSmile is not a substitute for professional dental care. Please consult a qualified dentist for accurate assessment, diagnosis, and treatment. Never make clinical decisions based solely on these results.
          </p>
        </div>
      </main>
    </div>
  );
}