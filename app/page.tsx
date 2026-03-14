'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard')
    }
  }, [mounted, loading, user, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null
  }
  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <ul className="flex gap-8 list-none">
            <li><Link href="/about" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">About</Link></li>
            <li><Link href="#" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">How it Works</Link></li>
            <li><Link href="/contact" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link></li>
          </ul>
          <Link href="/login" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-semibold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Start Screening
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-[120px] pb-[80px] px-[5%]">
        <div className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.12)_0%,rgba(168,85,247,0.08)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,transparent_70%)] bottom-[10%] right-[10%] pointer-events-none"></div>
        
        <div>
          <div className="inline-flex items-center gap-2 bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded-full px-4 py-2 text-[#00e5ff] text-[0.8rem] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] block animate-pulse"></span>
            AI-Powered Technology
          </div>
          
          <h1 className="font-['Syne'] font-extrabold text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] mb-6">
            Preventive Oral Health<br />
            Screening with <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">AI</span>
          </h1>
          
          <p className="text-[#777] text-[1.15rem] max-w-[560px] mx-auto leading-[1.7] mb-10">
            Upload a smartphone photo of your teeth and get instant, AI-powered preventive insights — no dentist appointment needed.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <Link href="/signup" className="bg-[#00e5ff] text-black px-8 py-3.5 rounded-lg font-bold text-[0.95rem] no-underline hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-transform transition-shadow">
              Start Screening
            </Link>
            <Link href="/login" className="border border-[rgba(255,255,255,0.07)] text-[#f0f0f0] px-8 py-3.5 rounded-lg font-medium text-[0.95rem] no-underline hover:border-[#00e5ff] transition-colors">
              Login
            </Link>
          </div>
          
          <div className="flex gap-12 justify-center">
            <div className="text-center">
              <div className="font-['Syne'] text-2xl font-extrabold text-[#f0f0f0]">3.69B</div>
              <div className="text-[#777] text-[0.8rem] mt-1">People with oral conditions</div>
            </div>
            <div className="text-center">
              <div className="font-['Syne'] text-2xl font-extrabold text-[#f0f0f0]">88%</div>
              <div className="text-[#777] text-[0.8rem] mt-1">AI detection accuracy</div>
            </div>
            <div className="text-center">
              <div className="font-['Syne'] text-2xl font-extrabold text-[#f0f0f0]">{'<30s'}</div>
              <div className="text-[#777] text-[0.8rem] mt-1">Analysis time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[0.75rem] tracking-[0.15em] uppercase text-[#00e5ff] mb-3">How It Works</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] mb-4">Three steps to oral<br/>health awareness</h2>
          
          <div className="grid grid-cols-3 gap-6 mt-16">
            {/* Step 1 */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-2xl p-10 relative overflow-hidden hover:border-[rgba(0,229,255,0.3)] transition-colors">
              <div className="font-['Syne'] text-[4rem] font-extrabold text-[rgba(255,255,255,0.04)] absolute top-2 right-4 leading-none">01</div>
              <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center text-[1.4rem] mb-6">📷</div>
              <h3 className="font-['Syne'] font-bold text-[1.1rem] mb-2">Upload Image</h3>
              <p className="text-[#777] text-[0.9rem] leading-[1.6]">Take or upload a clear photo of your teeth using your smartphone camera. No special equipment needed.</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-2xl p-10 relative overflow-hidden hover:border-[rgba(0,229,255,0.3)] transition-colors">
              <div className="font-['Syne'] text-[4rem] font-extrabold text-[rgba(255,255,255,0.04)] absolute top-2 right-4 leading-none">02</div>
              <div className="w-12 h-12 rounded-xl bg-[rgba(168,85,247,0.1)] flex items-center justify-center text-[1.4rem] mb-6">🤖</div>
              <h3 className="font-['Syne'] font-bold text-[1.1rem] mb-2">AI Analyzes</h3>
              <p className="text-[#777] text-[0.9rem] leading-[1.6]">Our CNN model scans your image for visible indicators like plaque buildup, discoloration, and gum redness.</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-2xl p-10 relative overflow-hidden hover:border-[rgba(0,229,255,0.3)] transition-colors">
              <div className="font-['Syne'] text-[4rem] font-extrabold text-[rgba(255,255,255,0.04)] absolute top-2 right-4 leading-none">03</div>
              <div className="w-12 h-12 rounded-xl bg-[rgba(249,115,22,0.1)] flex items-center justify-center text-[1.4rem] mb-6">💡</div>
              <h3 className="font-['Syne'] font-bold text-[1.1rem] mb-2">Get Insights</h3>
              <p className="text-[#777] text-[0.9rem] leading-[1.6]">Receive a personalized risk level, confidence score, and actionable preventive recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-[20px] aspect-square flex items-center justify-center relative overflow-hidden">
              <div className="w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(0,229,255,0.3),rgba(168,85,247,0.2),transparent)] flex items-center justify-center text-[5rem]">
                🦷
              </div>
            </div>
            
            <div>
              <div className="text-[0.75rem] tracking-[0.15em] uppercase text-[#00e5ff] mb-3">Benefits</div>
              <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] mb-4">Why SmartSmile?</h2>
              
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] flex items-center justify-center text-[1rem]">🔍</div>
                  <div>
                    <h4 className="font-['Syne'] font-bold mb-1">Early Risk Detection</h4>
                    <p className="text-[#777] text-[0.88rem] leading-[1.6]">Identify visible signs of caries, plaque, and gingivitis before they become serious problems.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] flex items-center justify-center text-[1rem]">📈</div>
                  <div>
                    <h4 className="font-['Syne'] font-bold mb-1">Track Over Time</h4>
                    <p className="text-[#777] text-[0.88rem] leading-[1.6]">Monitor your oral health trend with a history graph and risk level tracking across screenings.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 min-w-[40px] rounded-[10px] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] flex items-center justify-center text-[1rem]">🧠</div>
                  <div>
                    <h4 className="font-['Syne'] font-bold mb-1">AI-Powered Assistance</h4>
                    <p className="text-[#777] text-[0.88rem] leading-[1.6]">Machine learning models trained on thousands of dental images deliver reliable preventive insights.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-[linear-gradient(135deg,rgba(249,115,22,0.06),rgba(249,115,22,0.02))] border border-[rgba(249,115,22,0.15)] rounded-2xl p-10 flex gap-6 items-start">
            <div className="text-[1.5rem] min-w-[2rem]">⚠️</div>
            <div>
              <h4 className="font-['Syne'] font-bold mb-2 text-[#f97316]">Important Disclaimer</h4>
              <p className="text-[#777] text-[0.9rem] leading-[1.7]">
                SmartSmile is a preventive screening tool only. It does not provide clinical diagnoses and is not a replacement for professional dental consultation. Always consult a qualified dentist for medical advice, diagnosis, or treatment. Results are for awareness purposes only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-12 px-[5%]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-6">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/privacy" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Terms of Service</Link>
            <Link href="/contact" className="text-[#777] no-underline text-[0.85rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <div className="text-[#777] text-[0.8rem]">© 2026 SmartSmile. All rights reserved.</div>
        </div>
      </footer>
    </>
  )
}
