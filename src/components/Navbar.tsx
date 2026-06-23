'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { UserTier } from '@/types'
import { ThemeToggle } from '@/components/ThemeToggle'
import NotificationsBell from '@/components/NotificationsBell'
import { Menu, LogOut, LayoutDashboard, ChevronDown, Shield, CalendarCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { name: 'HOME', href: '/' },
  { name: 'ITINERARIES', href: '/explore' },
  { name: 'PRICING', href: '/pricing' },
  { name: 'GUIDES', href: '/guides' },
  { name: 'DESTINATIONS', href: '/destinations' },
  { name: 'HELP', href: '/help' },
  { name: 'ABOUT', href: '/about' },
]



export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [tier, setTier] = useState<UserTier | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isGuide, setIsGuide] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside for user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Get initial auth state
  useEffect(() => {
    const supabase = createClient()

    const fetchProfileAndRole = async (currentUser: User) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier, role, full_name, avatar_url')
        .eq('id', currentUser.id)
        .single()
      console.log('[Navbar] profile query →', { profile, profileError })
      if (profile) {
        setTier(profile.tier)
        setIsAdmin(profile.role === 'admin')
        setUserName(profile.full_name)
        setAvatarUrl(profile.avatar_url)
      }

      const { data: guideRows } = await supabase
        .from('guides')
        .select('id')
        .eq('id', currentUser.id)
        .limit(1)
      setIsGuide((guideRows?.length ?? 0) > 0)
    }

    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (currentUser) {
        await fetchProfileAndRole(currentUser)
      }
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'INITIAL_SESSION') return; // Let getUser() handle the initial load

        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfileAndRole(session.user).catch(console.error)
        } else {
          setTier(null)
          setIsGuide(false)
          setIsAdmin(false)
          setUserName(null)
          setAvatarUrl(null)
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

  // Hide navbar entirely on /explore page
  if (pathname === '/explore') return null

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-6 md:px-8 h-16
        transition-all duration-500 ease-out
        border-b
        backdrop-blur-[10px]
        dark:bg-background/90 dark:border-[rgba(232,213,183,0.06)] dark:backdrop-blur-xl
        [background:rgba(247,242,234,0.82)] [border-color:rgba(120,72,32,0.12)]
        ${scrolled ? 'shadow-sm dark:shadow-none' : ''}
      `}
    >
      {/* Left side — Logo */}
      <Link href="/" className="flex items-center gap-3 group">
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
            <polygon fill="currentColor" stroke="none" points="12,5 14,12 12,10 10,12" />
            <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,19 10,12 12,14 14,12" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold tracking-wide text-foreground">
            Atlas<span className="text-primary ml-1">360</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground -mt-1 hidden sm:block">
            Explore Morocco
          </span>
        </div>
      </Link>

      {/* Center Links (Desktop only) */}
      <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.filter(link => !(isAdmin && link.name === 'PRICING')).map(link => (
          <Link 
            key={link.href} 
            href={link.href}
            className={`text-[11px] font-semibold tracking-[0.2em] transition-all duration-200 ${
              pathname === link.href ? 'text-primary' : 'text-foreground/70 hover:text-primary'
            }`}
          >
            {link.name}
          </Link>
        ))}
        {user && isAdmin && (
          <Link 
            href="/dashboard/requests"
            className={`text-[11px] font-semibold tracking-[0.2em] transition-all duration-200 ${
              pathname === '/dashboard/requests' ? 'text-[#D4622E]' : 'text-[#D4622E]/80 hover:text-[#D4622E]'
            }`}
          >
            ADMIN
          </Link>
        )}
      </div>

      {/* Right side — Auth, Theme & Mobile Menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && <NotificationsBell />}

        {user ? (
          /* Logged in state: User Dropdown */
          <div className="relative user-menu-container ml-1">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 hover:bg-muted/50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-border"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-semibold text-primary uppercase">
                    {(userName || user.email)?.charAt(0) ?? 'U'}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-[12px] text-foreground font-medium max-w-[120px] truncate leading-tight">
                  {userName || user.email}
                </span>
                {isAdmin ? (
                  <span className="text-[9px] font-bold text-[#D4622E] uppercase tracking-widest mt-0.5">
                    ADMIN
                  </span>
                ) : tier && (
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">
                    {tier}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 flex flex-col z-50">
                {/* Email header — always visible */}
                <div className="px-4 py-2.5 border-b border-border/50 mb-1">
                  <span className="text-[12px] text-foreground font-medium block truncate">
                    {userName || user.email}
                  </span>
                  {isAdmin ? (
                    <span className="text-[9px] font-bold text-[#D4622E] uppercase tracking-widest mt-0.5 block">
                      ADMIN
                    </span>
                  ) : tier && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5 block">
                      {tier}
                    </span>
                  )}
                </div>

                {/* Account & Settings */}
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Account
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  Settings
                </Link>

                {/* Guide → Dashboard, Traveler → My Bookings */}
                {isGuide ? (
                  <Link
                    href="/dashboard/guide"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : !isAdmin ? (
                  <Link
                    href="/my-bookings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    My Bookings
                  </Link>
                ) : null}

                {/* Admin Portal */}
                {isAdmin && (
                  <Link
                    href="/dashboard/requests"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#D4622E] hover:text-[#D4622E]/80 hover:bg-muted/50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}

                <div className="border-t border-border/50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      handleLogout()
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left w-full disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Logged out state */
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-lg hover:bg-muted/50"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="relative overflow-hidden group/btn px-4 py-2 text-[13px] font-medium text-primary-foreground bg-primary rounded-lg transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden items-center ml-1">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="p-2 text-foreground/80 hover:text-primary transition-colors">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background border-l border-border p-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-border text-left">
                <SheetTitle className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-wide text-foreground flex items-center gap-2">
                  Atlas <span className="text-primary">360</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col py-6 px-4 gap-2 flex-1 overflow-y-auto">
                {NAV_LINKS.filter(link => !(isAdmin && link.name === 'PRICING')).map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 text-[11px] font-semibold tracking-[0.2em] rounded-lg transition-colors ${
                      pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && isAdmin && (
                  <Link 
                    href="/dashboard/requests"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 text-[11px] font-semibold tracking-[0.2em] rounded-lg transition-colors ${
                      pathname === '/dashboard/requests' ? 'bg-[#D4622E]/10 text-[#D4622E]' : 'text-[#D4622E] hover:bg-muted hover:text-[#D4622E]'
                    }`}
                  >
                    ADMIN DASHBOARD
                  </Link>
                )}

                {user && !isGuide && !isAdmin && (
                  <Link
                    href="/my-bookings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 text-[11px] font-semibold tracking-[0.2em] rounded-lg transition-colors ${
                      pathname === '/my-bookings' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    MY BOOKINGS
                  </Link>
                )}

                {!user && (
                  <div className="mt-8 flex flex-col gap-3 px-4 border-t border-border pt-6">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 text-center text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 text-center text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors rounded-lg shadow-md"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
