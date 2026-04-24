'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
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
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
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

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-6 md:px-8 h-16
        transition-all duration-500 ease-out
        ${scrolled
          ? 'bg-[#0F0D0A]/90 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-[#0F0D0A]/80 to-transparent'
        }
      `}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        {/* Compass icon */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#C1440E]/30 group-hover:border-[#C1440E]/50 transition-colors duration-300" />
          <div className="absolute inset-1 rounded-full border border-[#C1440E]/10" />
          <svg
            viewBox="0 0 24 24"
            className="w-4.5 h-4.5 text-[#C1440E]"
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
          <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold tracking-wide text-[#F0E6D8]">
            Atlas
            <span className="text-[#C1440E] ml-1">360</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8B7355] -mt-1 hidden sm:block">
            Explore Morocco
          </span>
        </div>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {pathname === '/explore' && (
          <Link href="/" className="text-[11px] font-semibold tracking-[0.2em] text-[#F0E6D8]/80 hover:text-[#C1440E] transition-colors">HOME</Link>
        )}
        <Link href="/explore" className="text-[11px] font-semibold tracking-[0.2em] text-[#F0E6D8]/80 hover:text-[#C1440E] transition-colors">ITINERARIES</Link>
        <Link href="#" className="text-[11px] font-semibold tracking-[0.2em] text-[#F0E6D8]/80 hover:text-[#C1440E] transition-colors">DESTINATIONS</Link>
        <Link href="#" className="text-[11px] font-semibold tracking-[0.2em] text-[#F0E6D8]/80 hover:text-[#C1440E] transition-colors">ABOUT</Link>
        <Link href="#" className="text-[11px] font-semibold tracking-[0.2em] text-[#F0E6D8]/80 hover:text-[#C1440E] transition-colors">JOURNAL</Link>
      </div>

      {/* Right side — Auth */}
      <div className="flex items-center gap-2">
        {pathname !== '/explore' && (
          user ? (
            /* Logged in state */
            <div className="flex items-center gap-3">
              {/* User avatar/email */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#C1440E]/15 border border-[#C1440E]/20 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-[#C1440E] uppercase">
                    {user.email?.charAt(0) ?? 'U'}
                  </span>
                </div>
                <span className="text-[13px] text-[#BFA882] max-w-[160px] truncate">
                  {user.email}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="
                  px-4 py-2 text-sm font-medium
                  text-[#8B7355] hover:text-[#E8D5B7]
                  transition-colors duration-300
                  rounded-lg hover:bg-white/5
                  border border-[#E8D5B7]/8
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
                  text-[#BFA882] hover:text-[#E8D5B7]
                  transition-colors duration-300
                  rounded-lg hover:bg-white/5
                "
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="
                  px-4 py-2 text-sm font-medium
                  text-[#FFF8F0] bg-[#C1440E]
                  rounded-lg
                  hover:bg-[#D4622E]
                  transition-all duration-300
                  shadow-md shadow-[#C1440E]/20
                  hover:shadow-lg hover:shadow-[#C1440E]/30
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
