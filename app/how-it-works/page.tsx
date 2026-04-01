'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(8,8,8,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div className="max-w-[1200px] mx-auto px-[5%] flex items-center justify-between h-16">
          <Link href="/" className="font-['Syne'] font-extrabold text-[1.3rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent no-underline">
            SmartSmile
          </Link>
          <div className="hidden md:flex gap-8">
            <Link href="/about" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">About</Link>
            <Link href="/how-it-works" className="text-[#f0f0f0] no-underline text-[0.9rem]">How it Works</Link>
            <Link href="/contact" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">Contact</Link>
          </div>
          <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-[140px] pb-[80px] px-[5%] text-center relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,rgba(168,85,247,0.05)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">How It Works</div>
        <h1 className="font-['Syne'] font-extrabold text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.08] mb-5">
          From photo to insights<br />in <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">under 30 seconds</span>
        </h1>
        <p className="text-[#666] max-w-[560px] mx-auto leading-[1.75] text-[1.05rem]">
          SmartSmile uses a trained deep learning model to analyze your dental photo and return a risk assessment with actionable recommendations, instantly.
        </p>
      </div>

      {/* 3 Steps */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">The Process</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-12">Three steps to oral health awareness</h2>
          <div className="flex flex-col gap-5">
            {[
              {
                step: '01',
                title: 'Upload a Dental Photo',
                body: 'Take a clear, well-lit photo of your teeth using your smartphone and upload it on the Screening page. No special equipment needed, just your phone camera.',
                detail: 'Supported formats: JPG, PNG, WEBP. Max file size: 10MB. For best results, photograph your front teeth in natural daylight.',
                color: '#00e5ff',
              },
              {
                step: '02',
                title: 'AI Analyzes the Image',
                body: 'Your image is sent to our backend where the deep learning model, trained on 6,000+ annotated dental images, processes it in real time scanning for visible indicators of six oral conditions.',
                detail: 'Conditions detected: Calculus, Dental Caries, Gingivitis, Hypodontia, Mouth Ulcers, and Tooth Discoloration. The model returns a primary prediction with a confidence percentage.',
                color: '#a855f7',
              },
              {
                step: '03',
                title: 'Receive Your Results',
                body: 'Within seconds you receive a full report including the detected condition, confidence score, risk level, a heatmap overlay showing areas of concern, and personalized preventive recommendations.',
                detail: 'All results are saved to your history so you can track changes over time. You can also download your full screening report as a PDF from the Settings page.',
                color: '#34d399',
              },
            ].map((item) => (
              <div key={item.step} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-8 flex gap-8 items-start hover:border-[rgba(255,255,255,0.13)] transition-colors">
                <div className="font-['Syne'] text-[3.5rem] font-extrabold text-[rgba(255,255,255,0.04)] leading-none select-none flex-shrink-0 w-[56px]">{item.step}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <h3 className="font-['Syne'] font-bold text-[1.05rem]">{item.title}</h3>
                  </div>
                  <p className="text-[#666] text-[0.9rem] leading-[1.7] mb-3">{item.body}</p>
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#555] text-[0.82rem] leading-[1.6]">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-20 px-[5%] bg-[rgba(255,255,255,0.015)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Detection</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">What the AI can detect</h2>
          <p className="text-[#666] text-[0.92rem] leading-[1.75] max-w-[680px] mb-10">
            The model is trained to identify six common oral health conditions from dental photographs. Each detected condition comes with a risk level and specific preventive recommendations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Calculus', desc: 'Hardened plaque deposits on teeth that require professional removal.' },
              { name: 'Dental Caries', desc: 'Tooth decay caused by bacteria producing acid that erodes enamel.' },
              { name: 'Gingivitis', desc: 'Gum inflammation from plaque buildup, the early stage of gum disease.' },
              { name: 'Hypodontia', desc: 'Congenital absence of one or more teeth affecting bite and spacing.' },
              { name: 'Mouth Ulcer', desc: 'Painful sores inside the mouth caused by injury, stress, or diet.' },
              { name: 'Tooth Discoloration', desc: 'Changes in tooth color from staining, aging, or enamel wear.' },
            ].map((c, i) => (
              <div key={c.name} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 hover:border-[rgba(255,255,255,0.13)] transition-colors">
                <div className="w-8 h-8 rounded-[8px] bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.12)] flex items-center justify-center mb-3">
                  <span className="font-['Syne'] font-bold text-[0.7rem] text-[#00e5ff]">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h4 className="font-['Syne'] font-bold text-[0.92rem] mb-2">{c.name}</h4>
                <p className="text-[#666] text-[0.8rem] leading-[1.6] m-0">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Performance */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Model</div>
          <h2 className="font-['Syne'] font-extrabold text-[clamp(1.6rem,3.5vw,2.2rem)] mb-4">Model performance</h2>
          <p className="text-[#666] text-[0.92rem] leading-[1.75] max-w-[680px] mb-10">
            Our model was selected after benchmarking 20+ deep learning architectures for the best balance of accuracy and real-time inference speed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Accuracy', value: '91.94%' },
              { label: 'Precision', value: '90.54%' },
              { label: 'Recall', value: '90.72%' },
              { label: 'F1 Score', value: '90.61%' },
            ].map((m) => (
              <div key={m.label} className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 text-center hover:border-[rgba(0,229,255,0.2)] transition-colors">
                <div className="font-['Syne'] font-extrabold text-[1.9rem] text-[#00e5ff]">{m.value}</div>
                <div className="text-[#666] text-[0.78rem] mt-1">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Framework', value: 'PyTorch + timm' },
              { label: 'Image Size', value: '224 x 224 px' },
              { label: 'Training Epochs', value: '25' },
              { label: 'Dataset', value: '6,000+ images' },
            ].map((d) => (
              <div key={d.label}>
                <div className="text-[#f0f0f0] font-['Syne'] font-semibold text-[0.88rem]">{d.value}</div>
                <div className="text-[#555] text-[0.72rem] mt-0.5">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-[linear-gradient(135deg,rgba(249,115,22,0.05),rgba(249,115,22,0.02))] border border-[rgba(249,115,22,0.15)] rounded-[20px] p-8 flex gap-5 items-start">
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(249,115,22,0.1)] border border-[rgba(249,115,22,0.2)] flex items-center justify-center flex-shrink-0 text-[#f97316] font-bold">!</div>
            <div>
              <h4 className="font-['Syne'] font-bold text-[0.95rem] text-[#f97316] mb-2">Important Disclaimer</h4>
              <p className="text-[#666] text-[0.88rem] leading-[1.75] m-0">
                SmartSmile is a preventive screening tool only. It does not provide clinical diagnoses and is not a replacement for professional dental consultation. Always consult a qualified dentist for medical advice, diagnosis, or treatment. Results are for awareness purposes only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-12 text-center relative overflow-hidden">
            <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h3 className="font-['Syne'] font-extrabold text-[1.4rem] mb-3">Ready to try it yourself?</h3>
              <p className="text-[#666] text-[0.92rem] mb-8 max-w-[420px] mx-auto leading-[1.7]">Create a free account and run your first screening in under a minute.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/signup" className="bg-[#00e5ff] text-black px-7 py-3 rounded-[8px] font-['Syne'] font-bold text-[0.88rem] no-underline hover:opacity-90 transition-opacity">
                  Start Screening
                </Link>
                <Link href="/contact" className="border border-[rgba(255,255,255,0.1)] text-[#f0f0f0] px-7 py-3 rounded-[8px] font-['Syne'] font-semibold text-[0.88rem] no-underline hover:border-[rgba(255,255,255,0.25)] transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  )
}
