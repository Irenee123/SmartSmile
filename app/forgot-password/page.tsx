'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(true)
  }

  return (
    <>
      {/* Background Glow */}
      <div className="fixed w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.07)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Logo at top */}
      <div className="fixed top-8 left-0 right-0 text-center z-10">
        <Link href="/" className="font-['Syne'] font-extrabold text-[1.4rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
          SmartSmile
        </Link>
      </div>

      {/* Forgot Password Form */}
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10">
            <h2 className="font-['Syne'] font-extrabold text-[1.5rem] mb-1">Reset Password</h2>
            <p className="text-[#666] text-[0.9rem] mb-8 leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {/* Form Section */}
            <div id="form-section" className={showSuccess ? 'hidden' : ''}>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-[0.82rem] text-[#666] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#00e5ff] text-black border-none rounded-[10px] px-4 py-3.5 font-['Syne'] font-bold text-[0.95rem] cursor-pointer transition-opacity hover:opacity-90"
                >
                  Send Reset Link
                </button>
              </form>

              <div className="text-center mt-5">
                <Link href="/login" className="text-[#666] text-[0.85rem] no-underline hover:text-[#00e5ff] transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </div>

            {/* Success Box */}
            <div 
              id="success-box" 
              className={`bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] rounded-[12px] p-6 text-center ${showSuccess ? 'block' : 'hidden'}`}
            >
              <div className="text-[2.5rem] mb-3">✉️</div>
              <h3 className="font-['Syne'] font-bold text-[#34d399] mb-1">Check your inbox</h3>
              <p className="text-[#666] text-[0.88rem] leading-relaxed">
                We've sent a password reset link to your email address. It will expire in 30 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
