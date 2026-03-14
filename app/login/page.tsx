'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowError(false)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setErrorMessage(error.message)
      setShowError(true)
      setLoading(false)
      return
    }

    // Successful login - check if admin
    try {
      // Small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500))

      // Get the current user after login
      const { data: { user } } = await supabase.auth.getUser()

      console.log('✅ Logged in user ID:', user?.id)
      console.log('✅ Logged in user email:', user?.email)

if (user) {
        // ✅ Check if profile exists — blocks deleted users
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profileData) {
          await supabase.auth.signOut();
          setErrorMessage('This account has been deactivated. Please contact support.');
          setShowError(true);
          setLoading(false);
          return;
        }

        // Check if admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', user.id)

        console.log('🔍 Admin query result:', adminData)
        console.log('🔍 Admin query error:', adminError)

        if (adminData && adminData.length > 0) {
          console.log('→ Redirecting to ADMIN dashboard')
          window.location.href = '/admin'
          return
        }
      }

      console.log('→ Redirecting to USER dashboard')
      window.location.href = '/dashboard'

    } catch (err) {
      console.error('Admin check error:', err)
      // Default to user dashboard if check fails
      window.location.href = '/dashboard'
    }
  }

  return (
    <>
      {/* Background Glow */}
      <div className="fixed w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.08)_0%,rgba(0,229,255,0.05)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Logo at top */}
      <div className="fixed top-8 left-0 right-0 text-center z-10">
        <Link href="/" className="font-['Syne'] font-extrabold text-[1.4rem] bg-gradient-to-r from-[#00e5ff] to-[#a855f7] bg-clip-text text-transparent">
          SmartSmile
        </Link>
      </div>

      {/* Login Form */}
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="w-full max-w-[440px]">
          <div className="bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10">
            <h2 className="font-['Syne'] font-extrabold text-[1.6rem] mb-1">Welcome back</h2>
            <p className="text-[#666] text-[0.9rem] mb-8">Log in to access your screening history.</p>

            {/* Error Banner */}
            <div
              className={`bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] rounded-[10px] px-4 py-3 text-[0.85rem] text-[#f87171] mb-4 ${showError ? 'block' : 'hidden'}`}
            >
              {errorMessage || 'Invalid email or password. Please try again.'}
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-[0.82rem] text-[#666] mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                />
              </div>

              <div className="mb-5">
                <label className="block text-[0.82rem] text-[#666] mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-[#f0f0f0] font-['DM_Sans'] text-[0.92rem] outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)]"
                />
              </div>

              <div className="flex justify-between items-center mb-5">
                <label className="flex gap-2 items-center text-[0.83rem] text-[#666] cursor-pointer">
                  <input type="checkbox" className="accent-[#00e5ff]" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-[0.83rem] text-[#00e5ff] no-underline hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00e5ff] text-black border-none rounded-[10px] px-4 py-3.5 font-['Syne'] font-bold text-[0.95rem] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="text-center text-[0.85rem] text-[#666] mt-5">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#00e5ff] no-underline font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}