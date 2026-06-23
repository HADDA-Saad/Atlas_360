import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PortalButton from './PortalButton'
import DeleteItineraryButton from './DeleteItineraryButton'
import CustomItinerariesList from './CustomItinerariesList'
import TravelerBookingsList from './TravelerBookingsList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account | Atlas 360',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, subscription_status, full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    redirect('/dashboard/requests')
  }

  // Check if user is a guide
  const { data: guide } = await supabase
    .from('guides')
    .select('id, is_verified')
    .eq('id', user.id)
    .maybeSingle()

  const tier = profile?.tier || 'explorer'
  const status = profile?.subscription_status || 'none'
  
  // Fetch guide bookings for this traveler
  const { data: bookingsData } = await supabase
    .from('guide_bookings')
    .select('*')
    .eq('traveler_id', user.id)
    .order('created_at', { ascending: false })

  const guideIds = (bookingsData || []).map(b => b.guide_id)
  let guideProfiles: any[] = []
  if (guideIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', guideIds)
    guideProfiles = profilesData || []
  }

  const travelerBookings = (bookingsData || []).map(b => {
    const p = guideProfiles.find(prof => prof.id === b.guide_id)
    return {
      ...b,
      guide_name: p ? p.full_name : 'Local Guide'
    }
  })

  // Fetch custom itineraries
  const { data: itineraries } = await supabase
    .from('user_itineraries')
    .select('id, title, is_public, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })


  const getTierColor = (t: string) => {
    if (t === 'nomad') return 'bg-primary/10 text-[#D4622E] border-primary/20'
    if (t === 'elite') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20' // explorer
  }

  const getStatusColor = (s: string) => {
    if (s === 'active') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' // Free plan
  }

  const displayStatus = status === 'active' ? 'Active' : (status === 'cancelled' || status === 'canceled' ? 'Cancelled' : 'Free plan')

  return (
    <div className="min-h-screen bg-background flex flex-col atlas-grain">
      {/* Hero Banner */}
      <div className="w-full h-[180px] bg-card dark:bg-[#111] relative border-b border-border flex items-end">
        <div className="absolute inset-0 atlas-grain opacity-50"></div>
        <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 pb-8 relative z-10 flex items-center gap-4">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
            Welcome back, {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          {tier === 'elite' && (
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase tracking-widest font-bold rounded-full mb-1">
              Elite Explorer
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-8">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 overflow-hidden border-2 border-primary/20">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-primary-foreground">
                  {(profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-foreground font-medium text-sm mb-2 truncate w-full">{profile?.full_name || user.email}</p>
            <Link href="/dashboard/settings" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground hover:text-primary transition-colors mb-4">
              Edit Profile
            </Link>
            
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getTierColor(tier)}`}>
                {tier}
              </span>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${getStatusColor(status)}`}>
                {displayStatus}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {status === 'active' ? (
                <PortalButton />
              ) : (
                <Link 
                  href="/pricing"
                  className="block w-full text-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Upgrade plan
                </Link>
              )}

              {guide && (
                <div className="border-t border-border pt-2.5 mt-1 w-full text-center">
                  <Link 
                    href="/dashboard/guide"
                    className="block w-full px-6 py-2 rounded-lg border border-primary/45 text-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors"
                  >
                    Guide Dashboard
                  </Link>
                  {!guide.is_verified && (
                    <span className="block text-[10px] text-amber-500/70 italic mt-2.5">Awaiting verification</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Itineraries</span>
              <span className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">{itineraries?.length || 0}</span>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Member since</span>
              <span className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-10">
          {tier === 'elite' ? (
            <CustomItinerariesList itineraries={itineraries || []} />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
                  My Itineraries
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border border-border rounded-2xl">
                <svg className="w-12 h-12 text-amber-500/40 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-2">Elite feature</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">Upgrade to the Elite Explorer plan to create and manage custom itineraries.</p>
                <Link href="/pricing" className="text-[11px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors">
                  Upgrade plan →
                </Link>
              </div>
            </div>
          )}

          <TravelerBookingsList bookings={travelerBookings} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
