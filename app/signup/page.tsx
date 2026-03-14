'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'

export default function SignupPage() {
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const { signUp } = useAuth()

  const checkStrength = (value: string) => {
    setPassword(value)
    let score = 0
    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++
    if (/[^A-Za-z0-9]/.test(value)) score++
    setStrength(score)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowError(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      setShowError(true)
      setLoading(false)
      return
    }

    if (strength < 2) {
      setErrorMessage('Please use a stronger password (at least 8 characters with uppercase, numbers, and symbols).')
      setShowError(true)
      setLoading(false)
      return
    }

    // Use custom API to bypass Supabase email confirmation and use SmartSmile emails
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to create account')
        setShowError(true)
      } else if (data.needsVerification) {
        // Show message about checking email for verification
        setShowSuccess(true)
      } else {
        // Show success - user can now log in directly
        setShowSuccess(true)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrorMessage('An unexpected error occurred')
      setShowError(true)
    }
  }

  const getStrengthClass = (index: number) => {
    if (index >= strength) return ''
    if (strength <= 1) return 'weak'
    if (strength <= 2) return 'medium'
    return 'strong'
  }

  const getStrengthLabel = () => {
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong']
    return password.length === 0 ? 'Enter a password' : labels[strength] || 'Very Strong'
  }

  const getStrengthColor = () => {
    if (strength <= 1) return '#f87171'
    if (strength <= 2) return '#fbbf24'
    return '#34d399'
  }

  // If signup successful, show success message
  if (showSuccess) {
    return (
      <>
        <div className="fixed w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,rgba(168,85,247,0.05)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="fixed top-8 left-0 right-0 text-center z-10">
          <Link href="/" className="font-['Syne'] font-extrabold text-[1.4rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
            SmartSmile
          </Link>
        </div>
        <div className="min-h-screen flex items-center justify-center px-8">
          <div className="w-full max-w-[460px]">
            <div className="bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10 text-center">
              <div className="text-[3rem] mb-4">✅</div>
              <h2 className="font-['Syne'] font-extrabold text-[1.6rem] mb-2">Check your email</h2>
              <p className="text-[#666] text-[0.9rem] mb-4">
                We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.
              </p>
              <Link href="/login" className="text-[#00e5ff] no-underline font-semibold hover:underline">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Background Glow */}
      <div className="fixed w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,rgba(168,85,247,0.05)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Logo at top */}
      <div className="fixed top-8 left-0 right-0 text-center z-10">
        <Link href="/" className="font-['Syne'] font-extrabold text-[1.4rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
          SmartSmile
        </Link>
      </div>

      {/* Signup Form */}
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-[460px]">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10">
            <h2 className="font-['Syne'] font-extrabold text-[1.6rem] mb-1">Create Account</h2>
            <p className="text-[#666] text-[0.9rem] mb-8">Start your oral health journey today.</p>

            {/* Error Banner */}
            {showError && (
              <div className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] rounded-[10px] px-4 py-3 text-[0.85rem] text-[#f87171] mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div className="mb-5">
                <label className="block text-[0.82rem] text-[#666] mb-2 font-medium">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-[0.82rem] text-[#666] mb-2 font-medium">Password</label>
                <input 
                  type="password" 
                  id="pwd"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => checkStrength(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                />
                <div className="flex gap-1 mt-2.5">
                  <div className={`h-[3px] flex-1 rounded-[2px] transition-colors ${strength >= 1 ? (strength === 1 ? 'bg-[#f87171]' : strength === 2 ? 'bg-[#fbbf24]' : 'bg-[#34d399]') : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                  <div className={`h-[3px] flex-1 rounded-[2px] transition-colors ${strength >= 2 ? (strength === 2 ? 'bg-[#fbbf24]' : 'bg-[#34d399]') : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                  <div className={`h-[3px] flex-1 rounded-[2px] transition-colors ${strength >= 3 ? 'bg-[#34d399]' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                  <div className={`h-[3px] flex-1 rounded-[2px] transition-colors ${strength >= 4 ? 'bg-[#34d399]' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                </div>
                <div className="text-[0.75rem] text-[#666] mt-2" style={{ color: password ? getStrengthColor() : undefined }}>
                  {getStrengthLabel()}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[0.82rem] text-[#666] mb-2 font-medium">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                />
              </div>

              <div className="flex gap-3 items-start mb-4">
                <input type="checkbox" id="age" required className="w-4 h-4 min-w-4 accent-[#00e5ff] mt-0.5" />
                <label htmlFor="age" className="text-[0.83rem] text-[#666] leading-relaxed">I confirm that I am 18 years of age or older.</label>
              </div>
              <div className="flex gap-3 items-start mb-5">
                <input type="checkbox" id="terms" required className="w-4 h-4 min-w-4 accent-[#00e5ff] mt-0.5" />
                <label htmlFor="terms" className="text-[0.83rem] text-[#666] leading-relaxed">I accept the <Link href="/terms" className="text-[#00e5ff] no-underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#00e5ff] no-underline">Privacy Policy</Link>.</label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00e5ff] text-black border-none rounded-[10px] px-4 py-3.5 font-['Syne'] font-bold text-[0.95rem] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center text-[0.85rem] text-[#666] mt-5">
              Already have an account? <Link href="/login" className="text-[#00e5ff] no-underline font-semibold hover:underline">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
