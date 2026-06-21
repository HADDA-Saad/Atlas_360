'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

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

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background atmospheric effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#D4A574]/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold tracking-wide text-foreground pt-1 leading-normal">
              Atlas
              <span className="text-primary ml-1">360</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
              Explore Morocco
            </p>
          </Link>
        </div>

        {/* Login card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/40">
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground tracking-wide">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
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
                  bg-background border border-border
                  text-foreground text-sm
                  placeholder:text-muted-foreground/50
                  focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-[#C1440E]/20
                  transition-all duration-300
                "
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
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
                  bg-background border border-border
                  text-foreground text-sm
                  placeholder:text-muted-foreground/50
                  focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-[#C1440E]/20
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
                bg-primary text-primary-foreground font-medium text-sm
                hover:bg-primary/90
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300
                shadow-lg shadow-primary/20
                hover:shadow-xl hover:shadow-primary/30
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
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to map */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[12px] text-muted-foreground hover:text-muted-foreground transition-colors uppercase tracking-[0.15em]"
          >
            ← Back to Map
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-[#C1440E] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
