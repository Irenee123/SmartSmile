'use client'

import Link from 'next/link'

const NAV = (active: string) => (
  <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
    <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
      <Link href="/" className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent no-underline">
        SmartSmile
      </Link>
      <div className="hidden md:flex gap-8">
        <Link href="/about" className={`no-underline text-[0.9rem] transition-colors ${active === 'about' ? 'text-[#f0f0f0]' : 'text-[#777] hover:text-[#f0f0f0]'}`}>About</Link>
        <Link href="/how-it-works" className={`no-underline text-[0.9rem] transition-colors ${active === 'how' ? 'text-[#f0f0f0]' : 'text-[#777] hover:text-[#f0f0f0]'}`}>How it Works</Link>
        <Link href="/contact" className={`no-underline text-[0.9rem] transition-colors ${active === 'contact' ? 'text-[#f0f0f0]' : 'text-[#777] hover:text-[#f0f0f0]'}`}>Contact</Link>
      </div>
      <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
        Get Started
      </Link>
    </div>
  </nav>
)

const FOOTER = (active: string) => (
  <footer className="border-t border-[rgba(255,255,255,0.07)] py-14 px-[5%]">
    <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent mb-3">SmartSmile</div>
          <p className="text-[#555] text-[0.83rem] leading-[1.7] max-w-[300px]">AI-powered preventive oral health screening. Detect common dental conditions early from a simple smartphone photo.</p>
        </div>
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#444] mb-4">Platform</div>
          <div className="flex flex-col gap-3">
            {[{ href: '/about', label: 'About' }, { href: '/how-it-works', label: 'How it Works' }, { href: '/signup', label: 'Get Started' }, { href: '/login', label: 'Log In' }].map(l => (
              <Link key={l.href} href={l.href} className="text-[#555] no-underline text-[0.83rem] hover:text-[#f0f0f0] transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-[#444] mb-4">Legal</div>
          <div className="flex flex-col gap-3">
            {[{ href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms of Service' }, { href: '/contact', label: 'Contact Us' }].map(l => (
              <Link key={l.href} href={l.href} className="text-[#555] no-underline text-[0.83rem] hover:text-[#f0f0f0] transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
        <div className="text-[#444] text-[0.78rem]">© 2026 SmartSmile. All rights reserved.</div>
      </div>
    </div>
  </footer>
)

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] overflow-x-hidden">
      {NAV('about')}

      {/* Hero */}
      <div className="pt-[140px] pb-[80px] px-[5%] text-center relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,rgba(168,85,247,0.05)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">About SmartSmile</div>
        <h1 className="font-['Syne'] font-extrabold text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08] mb-5">
          AI that cares about<br />your <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">smile</span>
        </h1>
        <p className="text-[#666] max-w-[580px] mx-auto leading-[1.75] text-[1.05rem]">
          SmartSmile is a machine learning powered preventive oral health screening platform designed to make dental awareness accessible to everyone, everywhere.
        </p>
      </div>

      {/* What We Do */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">What We Do</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">Preventive screening, not clinical diagnosis</h2>
          <p className="text-[#666] leading-[1.75] text-[0.92rem] max-w-[700px] mb-10">
            SmartSmile analyzes smartphone photos of your teeth to detect visible indicators of common oral health conditions. We help you become aware of early warning signs so you can take preventive action before problems worsen and become costly to treat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'What SmartSmile Does',
                body: 'Analyzes photos for visible signs of dental caries, plaque accumulation, and gum inflammation. Provides a risk level and personalized preventive advice to support timely professional consultation.',
                color: '#00e5ff',
              },
              {
                title: 'What SmartSmile Does Not Do',
                body: 'SmartSmile is not a diagnostic tool and does not replace a dentist. It cannot read X-rays, use clinical instruments, or provide medical diagnoses. Always consult a dental professional for treatment decisions.',
                color: '#f87171',
              },
            ].map((card) => (
              <div key={card.title} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8 hover:border-[rgba(255,255,255,0.13)] transition-colors">
                <div className="w-1 h-6 rounded-full mb-4" style={{ background: card.color }} />
                <h3 className="font-['Syne'] font-bold text-[1rem] mb-3">{card.title}</h3>
                <p className="text-[#666] text-[0.88rem] leading-[1.7] m-0">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20 px-[5%] bg-[rgba(255,255,255,0.015)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Technology</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">How the AI works</h2>
          <p className="text-[#666] leading-[1.75] text-[0.92rem] max-w-[700px] mb-10">
            SmartSmile is built on deep learning models trained on thousands of annotated dental images. The system preprocesses each uploaded image and runs it through the model to detect visible oral health indicators in real time, returning a risk score and confidence percentage within seconds.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Deep Learning Model', desc: 'Vision transformer backbone for dental image feature extraction and classification' },
              { label: 'Image Preprocessing', desc: 'Resize, normalize, and validate each image before it reaches the model' },
              { label: 'FastAPI Backend', desc: 'High-performance Python backend connecting the frontend to the ML model' },
              { label: 'PyTorch', desc: 'ML framework used for model training, validation, and real-time inference' },
              { label: 'Risk Scoring', desc: 'Low, Moderate, and High classification with confidence percentage output' },
              { label: 'Supabase', desc: 'Secure cloud database and storage for screening records and user data' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-5 hover:border-[rgba(0,229,255,0.2)] transition-colors">
                <div className="font-['Syne'] font-bold text-[0.88rem] mb-2 text-[#f0f0f0]">{item.label}</div>
                <div className="text-[#666] text-[0.78rem] leading-[1.55]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Limitations</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">What you should know</h2>
          <p className="text-[#666] leading-[1.75] text-[0.92rem] max-w-[700px] mb-8">
            We believe in full transparency about what SmartSmile can and cannot do. Understanding these limitations helps you use the platform responsibly.
          </p>
          <div className="flex flex-col gap-3">
            {[
              'SmartSmile analyzes visible surface features only. It cannot detect issues beneath the tooth surface or interpret dental X-rays.',
              'Image quality directly affects accuracy. Blurry, poorly lit, or incorrectly angled photos may significantly reduce result reliability.',
              'The AI model may not generalize equally across all demographics, lighting conditions, skin tones, or oral anatomies.',
              'SmartSmile is not validated for clinical use and should not replace regular professional dental examinations or treatment.',
              'A Low risk result does not mean you have perfect oral health. It means no visible surface indicators were detected in this specific image.',
            ].map((text, i) => (
              <div key={i} className="flex gap-4 items-start bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[12px] px-5 py-4">
                <div className="w-6 h-6 rounded-full bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center text-[0.65rem] text-[#f97316] font-bold flex-shrink-0 mt-0.5">!</div>
                <p className="text-[#666] text-[0.88rem] leading-[1.65] m-0">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethical AI */}
      <section className="py-20 px-[5%] bg-[rgba(255,255,255,0.015)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-gradient-to-br from-[rgba(168,85,247,0.06)] to-[rgba(0,229,255,0.03)] border border-[rgba(168,85,247,0.15)] rounded-[20px] p-10 relative overflow-hidden mb-6">
            <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
            <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#a855f7] mb-3">Our Commitment</div>
            <h3 className="font-['Syne'] font-extrabold text-[1.3rem] mb-4 text-[#a855f7]">Ethical AI Statement</h3>
            <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-3 max-w-[700px]">
              SmartSmile is built on principles of fairness, transparency, and user empowerment. We are committed to being completely clear about what our AI can and cannot do, and we actively work to prevent harm through responsible design choices.
            </p>
            <p className="text-[#666] leading-[1.8] text-[0.92rem] mb-8 max-w-[700px]">
              We do not collect unnecessary personal information, we store all data securely with full user control, and we never use your dental images for advertising or profiling purposes. Our AI is a preventive awareness tool, not a replacement for human clinical judgment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Fairness', desc: 'Continuously evaluated for bias across diverse user groups and conditions' },
                { label: 'Transparency', desc: 'Clear about what the AI detects, its confidence, and its limitations' },
                { label: 'Privacy', desc: 'Minimum data collection, full user control, and no third-party data sharing' },
              ].map((item) => (
                <div key={item.label} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
                  <h4 className="font-['Syne'] font-bold text-[0.88rem] mb-2">{item.label}</h4>
                  <p className="text-[#666] text-[0.78rem] leading-[1.55] m-0">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-8 flex justify-between items-center gap-6 flex-wrap">
            <div>
              <h3 className="font-['Syne'] font-bold text-[1.05rem] mb-1">Have a question about SmartSmile?</h3>
              <p className="text-[#666] text-[0.88rem] m-0">We are happy to answer questions about the technology, data handling, or how to use the platform.</p>
            </div>
            <Link href="/contact" className="bg-[#00e5ff] text-black px-6 py-2.5 rounded-[8px] font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-90 transition-opacity whitespace-nowrap">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {FOOTER('about')}
    </div>
  )
}
