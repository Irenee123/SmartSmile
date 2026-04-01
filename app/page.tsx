'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !loading && user) router.push('/dashboard')
  }, [mounted, loading, user, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00e5ff]">Loading...</div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </div>
          <ul className="hidden md:flex gap-8 list-none m-0 p-0">
            <li><Link href="/about" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">About</Link></li>
            <li><Link href="/how-it-works" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">How it Works</Link></li>
            <li><Link href="/contact" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link></li>
          </ul>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#777] no-underline text-[0.88rem] hover:text-[#f0f0f0] transition-colors hidden md:block">
              Log in
            </Link>
            <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center pt-16 px-[5%] relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.07)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center py-20">
          {/* Left — text */}
          <div>
            <h1 className="font-['Syne'] font-extrabold text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] mb-6">
              Preventive Oral Health<br />
              Screening Powered<br />
              by <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-[#777] text-[1.05rem] leading-[1.75] mb-8 max-w-[480px]">
              Upload a photo of your teeth and receive an instant AI-powered risk assessment, detecting 6 common oral conditions in under 30 seconds.
            </p>
            <div className="flex gap-3 flex-wrap mb-12">
              <Link href="/signup" className="bg-[#00e5ff] text-black px-7 py-3.5 rounded-lg font-['Syne'] font-bold text-[0.92rem] no-underline hover:opacity-90 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
                Start Free Screening
              </Link>
              <Link href="/how-it-works" className="border border-[rgba(255,255,255,0.1)] text-[#f0f0f0] px-7 py-3.5 rounded-lg font-['Syne'] font-semibold text-[0.92rem] no-underline hover:border-[rgba(255,255,255,0.25)] transition-colors">
                See How It Works
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-8 flex-wrap">
              {[
                { value: '3.69B', label: 'People with oral conditions' },
                { value: '75%', label: 'Cases caught early are treatable' },
                { value: '<30s', label: 'Analysis time' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-['Syne'] font-extrabold text-[1.4rem] text-[#f0f0f0]">{s.value}</div>
                  <div className="text-[#555] text-[0.72rem] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,229,255,0.08)] to-[rgba(168,85,247,0.08)] rounded-[24px]" />
            <div className="relative rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/hero-dental.jpg"
                alt="Professional dental care"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="border-y border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] py-6 px-[5%]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '3.5B+', label: 'People lack access to dental care' },
            { value: '45%', label: 'Adults have untreated tooth decay' },
            { value: '90%', label: 'Oral diseases are preventable' },
            { value: '1 in 5', label: 'Adults have untreated cavities' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-['Syne'] font-extrabold text-[1.5rem] text-[#f0f0f0]">{s.value}</div>
              <div className="text-[#555] text-[0.75rem] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">The Process</div>
            <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.6rem)]">Three steps to oral health awareness</h2>
            <p className="text-[#666] text-[0.95rem] mt-4 max-w-[500px] mx-auto leading-[1.7]">No clinic visit. No equipment. Just a clear photo of your teeth and our AI does the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Upload a Photo',
                body: 'Take a clear photo of your teeth with your smartphone and upload it directly on the Screening page. JPG, PNG or WEBP, max 10MB.',
                color: '#00e5ff',
              },
              {
                step: '02',
                title: 'AI Analyses It',
                body: 'Our model processes your image in real time, scanning for visible indicators of 6 common oral conditions.',
                color: '#a855f7',
              },
              {
                step: '03',
                title: 'Get Your Results',
                body: 'Receive a risk level, confidence score, Grad-CAM heatmap showing areas of concern, and personalised preventive recommendations.',
                color: '#34d399',
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-8 relative overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors group">
                <div className="font-['Syne'] text-[5rem] font-extrabold text-[rgba(255,255,255,0.03)] absolute top-0 right-4 leading-none select-none">{item.step}</div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-5" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                </div>
                <h3 className="font-['Syne'] font-bold text-[1.05rem] mb-3">{item.title}</h3>
                <p className="text-[#666] text-[0.88rem] leading-[1.7]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Conditions Detected ── */}
      <section className="py-[100px] px-[5%] bg-[rgba(255,255,255,0.015)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Detection</div>
            <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.6rem)]">6 conditions the AI can detect</h2>
            <p className="text-[#666] text-[0.95rem] mt-4 max-w-[500px] mx-auto leading-[1.7]">Each detected condition comes with a risk level, confidence score, and specific preventive recommendations.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Calculus', desc: 'Hardened tartar deposits that require professional removal.', risk: 'High', color: '#f87171' },
              { name: 'Dental Caries', desc: 'Tooth decay caused by bacteria producing enamel-eroding acid.', risk: 'High', color: '#f87171' },
              { name: 'Gingivitis', desc: 'Gum inflammation from plaque, the early stage of gum disease.', risk: 'Moderate', color: '#fbbf24' },
              { name: 'Hypodontia', desc: 'Congenital absence of one or more teeth affecting bite.', risk: 'Moderate', color: '#fbbf24' },
              { name: 'Mouth Ulcer', desc: 'Painful sores caused by injury, stress, or certain foods.', risk: 'Low', color: '#34d399' },
              { name: 'Tooth Discoloration', desc: 'Color changes from staining, aging, or enamel wear.', risk: 'Low', color: '#34d399' },
            ].map((c) => (
              <div key={c.name} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-6 hover:border-[rgba(255,255,255,0.13)] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-['Syne'] font-bold text-[0.92rem]">{c.name}</h4>
                  <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[#666] border border-[rgba(255,255,255,0.08)]">
                    {c.risk}
                  </span>
                </div>
                <p className="text-[#666] text-[0.8rem] leading-[1.6] m-0">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why SmartSmile ── */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]" style={{ aspectRatio: '4/3' }}>
            <Image
              src="/scan-demo.jpg"
              alt="SmartSmile screening demo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,0.5)] to-transparent" />
          </div>

          {/* Text */}
          <div>
            <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Benefits</div>
            <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.6rem)] mb-4">Why use SmartSmile?</h2>
            <p className="text-[#666] text-[0.95rem] leading-[1.75] mb-8">Most people only visit a dentist when something hurts. SmartSmile helps you catch visible warning signs early, before they become expensive problems.</p>

            <div className="flex flex-col gap-5">
              {[
                { title: 'Early Risk Detection', body: 'Identify visible signs of caries, plaque, and gingivitis before they become serious and costly to treat.', color: '#00e5ff' },
                { title: 'Track Over Time', body: 'Every screening is saved to your history. Monitor your oral health trend and see if things are improving.', color: '#a855f7' },
                { title: 'Instant Results', body: 'No waiting. No appointment. Upload a photo and get a full risk report with recommendations in under 30 seconds.', color: '#34d399' },
                { title: 'Find a Dentist', body: 'Browse partner dental clinics near you and book an appointment directly from the platform.', color: '#fbbf24' },
              ].map((b) => (
                <div key={b.title} className="flex gap-4 items-start">
                  <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0 mt-1" style={{ background: b.color, width: '3px' }} />
                  <div>
                    <h4 className="font-['Syne'] font-bold text-[0.92rem] mb-1">{b.title}</h4>
                    <p className="text-[#666] text-[0.85rem] leading-[1.65] m-0">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Model Performance ── */}
      <section className="py-[100px] px-[5%] bg-[rgba(255,255,255,0.015)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">The Model</div>
              <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.6rem)] mb-4">Model performance</h2>
              <p className="text-[#666] text-[0.95rem] leading-[1.75] mb-8">
                Our model was selected after benchmarking over 20 deep learning architectures. It delivers the best balance of accuracy and real-time inference speed, making it ideal for instant dental screening.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Accuracy', value: 91.94 },
                  { label: 'Precision', value: 90.54 },
                  { label: 'Recall', value: 90.72 },
                  { label: 'F1 Score', value: 90.61 },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[0.82rem] mb-1.5">
                      <span className="text-[#aaa]">{m.label}</span>
                      <span className="font-['Syne'] font-bold text-[#00e5ff]">{m.value}%</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#00e5ff] to-[#a855f7]" style={{ width: `${m.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result demo image */}
            <div className="relative rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]" style={{ aspectRatio: '4/3' }}>
              <Image
                src="/result-demo.jpg"
                alt="SmartSmile result report"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,8,0.4)] to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="py-16 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-[linear-gradient(135deg,rgba(249,115,22,0.05),rgba(249,115,22,0.02))] border border-[rgba(249,115,22,0.15)] rounded-[20px] p-8 flex gap-5 items-start">
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center flex-shrink-0 text-[#f97316] font-bold text-[0.9rem]">!</div>
            <div>
              <h4 className="font-['Syne'] font-bold text-[0.95rem] text-[#f97316] mb-2">Medical Disclaimer</h4>
              <p className="text-[#666] text-[0.88rem] leading-[1.75] m-0">
                SmartSmile is a preventive screening tool only. It does not provide clinical diagnoses and is not a replacement for professional dental consultation. Always consult a qualified dentist for medical advice, diagnosis, or treatment. Results are for awareness purposes only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-[100px] px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative rounded-[24px] overflow-hidden bg-[#111] border border-[rgba(255,255,255,0.07)] p-16 text-center">
            <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative">
              <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-4">Get Started Today</div>
              <h2 className="font-['Syne'] font-extrabold text-[clamp(1.8rem,4vw,2.8rem)] mb-4">
                Your oral health check<br />starts with one photo
              </h2>
              <p className="text-[#666] text-[0.95rem] leading-[1.75] max-w-[480px] mx-auto mb-8">
                Create a free account and run your first screening in under a minute. No equipment, no appointment, no cost.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/signup" className="bg-[#00e5ff] text-black px-8 py-3.5 rounded-lg font-['Syne'] font-bold text-[0.92rem] no-underline hover:opacity-90 hover:-translate-y-0.5 transition-all">
                  Create Free Account
                </Link>
                <Link href="/about" className="border border-[rgba(255,255,255,0.1)] text-[#f0f0f0] px-8 py-3.5 rounded-lg font-['Syne'] font-semibold text-[0.92rem] no-underline hover:border-[rgba(255,255,255,0.25)] transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[rgba(255,255,255,0.07)] py-14 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent mb-3">
                SmartSmile
              </div>
              <p className="text-[#555] text-[0.83rem] leading-[1.7] max-w-[300px]">
                AI-powered preventive oral health screening. Detect common dental conditions early from a simple smartphone photo.
              </p>
            </div>
            {/* Platform */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#444] mb-4">Platform</div>
              <div className="flex flex-col gap-3">
                {[
                  { href: '/about', label: 'About' },
                  { href: '/how-it-works', label: 'How it Works' },
                  { href: '/signup', label: 'Get Started' },
                  { href: '/login', label: 'Log In' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-[#555] no-underline text-[0.83rem] hover:text-[#f0f0f0] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            {/* Legal */}
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#444] mb-4">Legal</div>
              <div className="flex flex-col gap-3">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/contact', label: 'Contact Us' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="text-[#555] no-underline text-[0.83rem] hover:text-[#f0f0f0] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex justify-between items-center flex-wrap gap-4">
            <div className="text-[#444] text-[0.78rem]">© 2026 SmartSmile. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
