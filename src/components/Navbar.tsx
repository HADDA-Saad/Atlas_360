'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserTier } from '@/types'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [tier, setTier] = useState<UserTier | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get initial auth state
  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase.from('profiles').select('tier').eq('id', currentUser.id).single()
        if (data) setTier(data.tier)
      }
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setTier(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Hide navbar on /explore page
  if (pathname === '/explore') return null

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-6 md:px-8 h-16
        transition-all duration-500 ease-out
        border-b border-border/40
        ${scrolled || pathname === '/'
          ? 'bg-background/90 backdrop-blur-xl shadow-sm'
          : 'bg-background/90 backdrop-blur-xl'
        }
      `}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        {/* Compass icon */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-primary/30 group-hover:border-primary/50 transition-colors duration-300" />
          <div className="absolute inset-1 rounded-full border border-primary/10" />
          <svg
            viewBox="0 0 24 24"
            className="w-4.5 h-4.5 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12"
            />
            <polygon
              fill="currentColor"
              stroke="none"
              points="12,5 14,12 12,10 10,12"
            />
            <polygon
              fill="currentColor"
              stroke="none"
              opacity="0.3"
              points="12,19 10,12 12,14 14,12"
            />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold tracking-wide text-foreground">
            Atlas
            <span className="text-primary ml-1">360</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground -mt-1 hidden sm:block">
            Explore Morocco
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {pathname !== '/' && (
          <Link href="/" className="text-[11px] font-medium tracking-[0.2em] text-foreground/70 hover:text-primary transition-all duration-200">HOME</Link>
        )}
        <Link href="/explore" className="text-[11px] font-medium tracking-[0.2em] text-foreground/70 hover:text-primary transition-all duration-200">ITINERARIES</Link>
        <Link href="/pricing" className="text-[11px] font-medium tracking-[0.2em] text-foreground/70 hover:text-primary transition-all duration-200">PRICING</Link>
        <Link href="/destinations" className="text-[11px] font-medium tracking-[0.2em] text-foreground/70 hover:text-primary transition-all duration-200">DESTINATIONS</Link>
        <Link href="/about" className="text-[11px] font-medium tracking-[0.2em] text-foreground/70 hover:text-primary transition-all duration-200">ABOUT</Link>
      </div>

      {/* Right side — Auth & Theme */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {pathname !== '/explore' && (
          user ? (
            /* Logged in state */
            <div className="flex items-center gap-3">
              {/* User avatar/email */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-primary uppercase">
                    {user.email?.charAt(0) ?? 'U'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-muted-foreground max-w-[160px] truncate leading-tight">
                    {user.email}
                  </span>
                  {tier && (
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-0.5">
                      {tier}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/dashboard"
                className="hidden md:block text-[11px] font-semibold tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors mx-2"
              >
                MY ACCOUNT
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="
                  px-4 py-2 text-sm font-medium
                  text-muted-foreground hover:text-foreground
                  transition-colors duration-300
                  rounded-lg hover:bg-muted/50
                  border border-border
                  disabled:opacity-50
                "
              >
                {isLoggingOut ? '...' : 'Logout'}
              </button>
            </div>
          ) : (
            /* Logged out state */
            <>
              <Link
                href="/auth/login"
                className="
                  px-4 py-2 text-sm font-medium
                  text-muted-foreground hover:text-foreground
                  transition-colors duration-300
                  rounded-lg hover:bg-muted/50
                "
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="
                  px-4 py-2 text-sm font-medium
                  text-primary-foreground bg-primary
                  rounded-lg
                  hover:bg-primary/90
                  transition-all duration-300
                  shadow-md shadow-primary/20
                  hover:shadow-lg hover:shadow-primary/30
                "
              >
                Sign Up
              </Link>
            </>
          )
        )}
      </div>
    </nav>
  )
}
