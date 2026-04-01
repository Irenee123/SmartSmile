'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ContactPage() {
  const [formData, setFormData] = useState({ email: '', category: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    const { error } = await supabase.from('messages').insert({
      email: formData.email,
      category: formData.category,
      subject: formData.subject,
      message: formData.message,
    })
    setSubmitting(false)
    if (error) {
      setSubmitError('Failed to send message. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

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
            <Link href="/how-it-works" className="text-[#777] no-underline text-[0.9rem] hover:text-[#f0f0f0] transition-colors">How it Works</Link>
            <Link href="/contact" className="text-[#f0f0f0] no-underline text-[0.9rem]">Contact</Link>
          </div>
          <Link href="/signup" className="bg-[#00e5ff] text-black px-5 py-2 rounded-md font-['Syne'] font-bold text-[0.85rem] no-underline hover:opacity-85 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-[140px] pb-[80px] px-[5%] relative overflow-hidden text-center">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,transparent_70%)] top-0 right-[-100px] pointer-events-none" />
        <div className="max-w-[680px] mx-auto">
          <div className="text-[0.72rem] tracking-[0.18em] uppercase text-[#00e5ff] mb-3">Get In Touch</div>
          <h1 className="font-['Syne'] font-extrabold text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.08] mb-5">
            We would love to<br />
            <span className="bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">hear from you</span>
          </h1>
          <p className="text-[#666] leading-[1.75] text-[1rem]">
            Have a question about SmartSmile, need support, or want to share feedback? Reach out and we typically respond within 2 business days.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <section className="pb-[100px] px-[5%]">
        <div className="max-w-[680px] mx-auto">

          {!submitted ? (
            <div className="bg-[#111] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-8">
              <h3 className="font-['Syne'] font-extrabold text-[1.2rem] mb-1">Send a Message</h3>
              <p className="text-[#666] text-[0.85rem] mb-7">Fill in the form below and we will get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.82rem] text-[#666] font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.82rem] text-[#666] font-medium mb-2">Subject Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option>General Question</option>
                      <option>Account Support</option>
                      <option>Screening Result Query</option>
                      <option>Privacy / Data Request</option>
                      <option>Bug Report</option>
                      <option>Research / Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.82rem] text-[#666] font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your enquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[0.82rem] text-[#666] font-medium mb-2">Message</label>
                  <textarea
                    placeholder="Write your message here. Please be as detailed as possible so we can help you effectively."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] px-4 py-3 text-[#f0f0f0] text-[0.9rem] outline-none focus:border-[#00e5ff] transition-colors resize-y leading-[1.6]"
                  />
                </div>

                <div className="bg-[rgba(249,115,22,0.04)] border border-[rgba(249,115,22,0.12)] rounded-[12px] px-4 py-3">
                  <p className="text-[#666] text-[0.78rem] leading-[1.6] m-0">
                    SmartSmile does not provide dental or medical advice through this contact form. For dental health concerns, please consult a qualified dental professional.
                  </p>
                </div>

                {submitError && (
                  <p className="text-[#f87171] text-[0.82rem]">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#00e5ff] text-black border-none rounded-[10px] py-3.5 font-['Syne'] font-bold text-[0.95rem] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.2)] rounded-[20px] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] flex items-center justify-center mx-auto mb-5 text-[#34d399] font-bold text-[1.3rem]">✓</div>
              <h3 className="font-['Syne'] font-extrabold text-[1.3rem] text-[#34d399] mb-3">Message Sent</h3>
              <p className="text-[#666] text-[0.88rem] leading-[1.7] max-w-[380px] mx-auto">
                Thank you for reaching out. We have received your message and will respond to your email within 1 to 2 business days. Please check your spam folder if you do not hear from us.
              </p>
            </div>
          )}
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
