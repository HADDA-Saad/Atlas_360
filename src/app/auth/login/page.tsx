'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0D0A] px-4 relative overflow-hidden">
      {/* Background atmospheric effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C1440E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#D4A574]/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold tracking-wide text-[#F0E6D8]">
              Atlas
              <span className="text-[#C1440E] ml-1">360</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8B7355] mt-0.5">
              Explore Morocco
            </p>
          </Link>
        </div>

        {/* Login card */}
        <div className="bg-[#1A1610] border border-[#E8D5B7]/8 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#F0E6D8] tracking-wide">
              Welcome back
            </h2>
            <p className="text-sm text-[#8B7355] mt-1">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#BFA882]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-[#0F0D0A] border border-[#E8D5B7]/10
                  text-[#F0E6D8] text-sm
                  placeholder:text-[#8B7355]/50
                  focus:outline-none focus:border-[#C1440E]/40 focus:ring-1 focus:ring-[#C1440E]/20
                  transition-all duration-300
                "
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#BFA882]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="
                  w-full px-4 py-3 rounded-xl
                  bg-[#0F0D0A] border border-[#E8D5B7]/10
                  text-[#F0E6D8] text-sm
                  placeholder:text-[#8B7355]/50
                  focus:outline-none focus:border-[#C1440E]/40 focus:ring-1 focus:ring-[#C1440E]/20
                  transition-all duration-300
                "
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3.5 rounded-xl
                bg-[#C1440E] text-white font-medium text-sm
                hover:bg-[#D4622E]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                shadow-lg shadow-[#C1440E]/20
                hover:shadow-xl hover:shadow-[#C1440E]/30
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[#E8D5B7]/8" />
            <span className="text-[11px] text-[#8B7355]/60 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-[#E8D5B7]/8" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#8B7355]">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-[#C1440E] hover:text-[#D4622E] font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to map */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[12px] text-[#8B7355] hover:text-[#BFA882] transition-colors uppercase tracking-[0.15em]"
          >
            ← Back to Map
          </Link>
        </div>
      </div>
    </div>
  )
}
