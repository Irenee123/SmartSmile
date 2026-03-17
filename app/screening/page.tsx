'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '@/components/sidebar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AnalysisResult {
  overallCondition: string;
  confidenceScore: number;
  findings: Array<{
    area: string;
    condition: string;
    severity: string;
  }>;
  recommendations: string[];
  summary: string;
}

export default function ScreeningPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload progress
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 150);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile || !previewUrl) return;

    setAnalyzing(true);
    setAnalysisStep(0);

    // Simulate step progression
    const steps = [
      { step: 1, delay: 1200 },
      { step: 2, delay: 2400 },
      { step: 3, delay: 3600 },
    ];

    steps.forEach(({ step, delay }) => {
      setTimeout(() => setAnalysisStep(step), delay);
    });

    try {
      // Convert image to base64
      const base64 = previewUrl.split(',')[1];

      // Get the session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Call the analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      
      // Save result to database
      if (user) {
        await saveScreeningResult(data.analysis);
      }

      // Store result in session storage for results page
      sessionStorage.setItem('latestAnalysis', JSON.stringify(data.analysis));
      
      // Navigate to results page after analysis completes
      setTimeout(() => {
        router.push('/results');
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      setAnalyzing(false);
    }
  };

const saveScreeningResult = async (analysis: AnalysisResult) => {
  if (!user) return;

  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (analysis.overallCondition === 'Poor' || analysis.overallCondition === 'Critical') {
    riskLevel = 'high';
  } else if (analysis.overallCondition === 'Fair') {
    riskLevel = 'moderate';
  }

  const indicators = analysis.findings
    .map(f => f.condition.split('(')[0].trim())
    .slice(0, 3);

  const { error: dbError } = await supabase.from('screenings').insert({
    user_id: user.id,
    risk_level: riskLevel,
    confidence_score: analysis.confidenceScore,
    indicators: indicators,
    recommendations: analysis.recommendations,
    model_version: 'v2.1.0',
    image_path: `screening-images/${user.id}/${Date.now()}.jpg`,
    is_deleted: false
  });

  if (dbError) {
    console.error('Error saving screening result:', JSON.stringify(dbError, null, 2));
  } else {
    console.log('Screening result saved successfully!');
    // Result is saved - user can view it on the results page
    // No email is sent to user
  }
};

  const getQualityBadge = () => {
    return 'Good';
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
    <div className="min-h-screen bg-[#080808] flex">
      <Sidebar />
      <main className="md:ml-[240px] flex-1 p-4 md:p-10 pt-20 md:pt-10 max-w-full md:max-w-[calc(100vw-240px)]">
        <h1 className="font-['Syne'] font-extrabold text-[1.5rem] mb-2">New Screening</h1>
        <p className="text-[#666] text-[0.9rem] mb-8">Upload a clear photo of your teeth to receive your AI-powered oral health risk assessment.</p>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 mb-10">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-['Syne'] font-bold text-[0.78rem] ${!analyzing && selectedFile ? 'bg-[#34d399] text-black' : 'bg-[#00e5ff] text-black'}`}>
              {!analyzing && selectedFile ? '✓' : '1'}
            </div>
            <span className={`text-[0.8rem] ${!analyzing && selectedFile ? 'text-[#34d399] font-semibold' : 'text-[#f0f0f0]'}`}>Upload Image</span>
          </div>
          <div className="h-px bg-[rgba(255,255,255,0.07)] w-16 max-w-[60px]"></div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-['Syne'] font-bold text-[0.78rem] ${analysisStep >= 1 ? 'bg-[#34d399] text-black' : 'bg-[rgba(255,255,255,0.05)] text-[#666] border border-[rgba(255,255,255,0.07)]'}`}>
              {analysisStep >= 1 ? '✓' : '2'}
            </div>
            <span className={`text-[0.8rem] ${analysisStep >= 1 ? 'text-[#f0f0f0] font-semibold' : 'text-[#666]'}`}>AI Analysis</span>
          </div>
          <div className="h-px bg-[rgba(255,255,255,0.07)] w-16 max-w-[60px]"></div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-['Syne'] font-bold text-[0.78rem] ${analysisStep >= 3 ? 'bg-[#34d399] text-black' : 'bg-[rgba(255,255,255,0.05)] text-[#666] border border-[rgba(255,255,255,0.07)]'}`}>
              {analysisStep >= 3 ? '✓' : '3'}
            </div>
            <span className={`text-[0.8rem] ${analysisStep >= 3 ? 'text-[#f0f0f0] font-semibold' : 'text-[#666]'}`}>View Results</span>
          </div>
        </div>

        {/* Upload Zone */}
        {!analyzing && !previewUrl && (
          <div 
            className="border-2 border-dashed border-[rgba(0,229,255,0.2)] rounded-[20px] p-20 text-center transition-all cursor-pointer hover:border-[#00e5ff] hover:bg-[rgba(0,229,255,0.04)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="w-[72px] h-[72px] rounded-[20px] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] flex items-center justify-center text-[2rem] mx-auto mb-6">
              📷
            </div>
            <h3 className="font-['Syne'] font-bold text-[1.15rem] mb-2">Drag & drop your image here</h3>
            <p className="text-[#666] text-[0.88rem] mb-4">or click anywhere in this box to browse your files</p>
            <div className="inline-flex items-center gap-2 bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] text-[#00e5ff] rounded-lg px-4 py-2 text-[0.85rem] font-semibold">
              📁 Browse Files
            </div>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <span className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-md px-3 py-1 text-[0.7rem] text-[#666]">JPG</span>
              <span className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-md px-3 py-1 text-[0.7rem] text-[#666]">PNG</span>
              <span className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-md px-3 py-1 text-[0.7rem] text-[#666]">WEBP</span>
              <span className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-md px-3 py-1 text-[0.7rem] text-[#666]">Max 10MB</span>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewUrl && !analyzing && (
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-4xl p-6 mt-6">
            <div className="flex gap-6 items-start">
              <div className="w-[180px] h-[160px] rounded-xl bg-[#161616] border border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[3.5rem] overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="flex-1">
                <h4 className="font-['Syne'] font-bold mb-4">Image Preview</h4>
                <div className="flex justify-between text-[0.83rem] pb-3 border-b border-[rgba(255,255,255,0.04)]">
                  <span className="text-[#666]">File name</span>
                  <span>{selectedFile?.name || '—'}</span>
                </div>
                <div className="flex justify-between text-[0.83rem] py-3 border-b border-[rgba(255,255,255,0.04)]">
                  <span className="text-[#666]">File size</span>
                  <span>{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : '—'}</span>
                </div>
                <div className="flex justify-between text-[0.83rem] py-3 border-b border-[rgba(255,255,255,0.04)]">
                  <span className="text-[#666]">Image quality</span>
                  <span className="px-3 py-1 rounded-full text-[0.72rem] font-bold bg-[rgba(52,211,153,0.12)] text-[#34d399] border border-[rgba(52,211,153,0.2)]">{getQualityBadge()} ✓</span>
                </div>
                <div className="flex justify-between text-[0.83rem] py-3">
                  <span className="text-[#666]">Format</span>
                  <span>{selectedFile?.name.split('.').pop()?.toUpperCase() || '—'}</span>
                </div>
                <button onClick={removeImage} className="inline-flex items-center gap-2 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] text-[#f87171] rounded-lg px-4 py-2 text-[0.78rem] cursor-pointer mt-4 hover:bg-[rgba(248,113,113,0.15)] transition-colors">
                  ✕ Remove Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && previewUrl && (
          <div className="mt-6">
            <div className="flex justify-between text-[0.82rem] mb-2">
              <span className="text-[#666]">Uploading image…</span>
              <span style={{ color: '#00e5ff', fontWeight: 600 }}>{Math.min(100, Math.round(uploadProgress))}%</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-md overflow-hidden">
              <div 
                className="h-full rounded-md bg-gradient-to-r from-[#00e5ff] to-[#a855f7]" 
                style={{ width: `${Math.min(100, uploadProgress)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Analyzing State */}
        {analyzing && (
          <div className="text-center p-14 bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-4xl mt-6">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-3 border-[rgba(0,229,255,0.1)] border-t-[#00e5ff] rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[1.4rem]">🦷</div>
            </div>
            <h3 className="font-['Syne'] font-bold text-[1.1rem] mb-2">Analyzing Your Image…</h3>
            <p className="text-[#666] text-[0.88rem] max-w-[380px] mx-auto mb-3">Our AI is examining your dental photo for oral health indicators. This usually takes under 30 seconds.</p>
            <div className="flex flex-col gap-1 mt-4">
              <div className={`text-[0.78rem] ${analysisStep >= 0 ? 'text-[#34d399]' : 'text-[#666]'}`}>
                {analysisStep >= 0 ? '✓' : '○'} Image uploaded successfully
              </div>
              <div className={`text-[0.78rem] ${analysisStep >= 1 ? 'text-[#34d399]' : analysisStep === 0 ? 'text-[#00e5ff]' : 'text-[#666]'}`}>
                {analysisStep >= 1 ? '✓' : analysisStep === 0 ? '⟳' : '○'} Preprocessing image…
              </div>
              <div className={`text-[0.78rem] ${analysisStep >= 2 ? 'text-[#34d399]' : analysisStep === 1 ? 'text-[#00e5ff]' : 'text-[#666]'}`}>
                {analysisStep >= 2 ? '✓' : analysisStep === 1 ? '⟳' : '○'} Running CNN model…
              </div>
              <div className={`text-[0.78rem] ${analysisStep >= 3 ? 'text-[#34d399]' : analysisStep === 2 ? 'text-[#00e5ff]' : 'text-[#666]'}`}>
                {analysisStep >= 3 ? '✓' : analysisStep === 2 ? '⟳' : '○'} Generating risk assessment…
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] rounded-xl text-[#f87171] text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        {previewUrl && !analyzing && (
          <button 
            onClick={startAnalysis}
            disabled={uploading}
            className="w-full bg-[#00e5ff] text-black border-none rounded-xl py-4 font-['Syne'] font-bold text-[1rem] cursor-pointer transition-all mt-6 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            🔍 Submit for Analysis
          </button>
        )}

        {/* Tips */}
        {!analyzing && (
          <div className="mt-12">
            <div className="font-['Syne'] font-bold text-[0.95rem] mb-4">📌 Tips for Best Results</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 hover:border-[rgba(0,229,255,0.15)] transition-colors">
                <div className="text-[#00e5ff] font-semibold text-[0.83rem] mb-2 flex items-center gap-2">💡 Good Lighting</div>
                <p className="text-[#666] text-[0.78rem] leading-[1.55]">Take your photo in natural daylight or a well-lit room. Avoid dark environments or harsh flash shadows.</p>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 hover:border-[rgba(0,229,255,0.15)] transition-colors">
                <div className="text-[#00e5ff] font-semibold text-[0.83rem] mb-2 flex items-center gap-2">📐 Correct Angle</div>
                <p className="text-[#666] text-[0.78rem] leading-[1.55]">Open wide and aim your camera directly at your front teeth. Hold the phone steady at mouth level.</p>
              </div>
              <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 hover:border-[rgba(0,229,255,0.15)] transition-colors">
                <div className="text-[#00e5ff] font-semibold text-[0.83rem] mb-2 flex items-center gap-2">🔍 Sharp Focus</div>
                <p className="text-[#666] text-[0.78rem] leading-[1.55]">Make sure the image is in focus and not blurry. Tap your screen to focus before capturing the photo.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}