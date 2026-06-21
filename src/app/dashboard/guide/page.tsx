import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GuideDashboardClient from './GuideDashboardClient'
import { expireStalePendingBookings } from '@/lib/expire-bookings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guide Dashboard | Atlas 360',
}

interface GuideProfile {
  id: string
  bio: string | null
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  is_verified: boolean
  rating: number | null
}

interface Booking {
  id: string
  traveler_id: string
  start_date: string
  end_date: string
  total_price: number
  commission_amount: number
  status: string
  created_at: string
  traveler_email?: string
  traveler_name?: string
  itineraries?: {
    title: string
  } | null
}

interface BlockedDate {
  id: string
  blocked_date: string
  reason: string | null
}

export default async function GuideDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Expire stale pending bookings (48h no-response) — global sweep, runs on every load
  await expireStalePendingBookings(createAdminClient())

  // Fetch guide details
  const { data: guideData } = await supabase
    .from('guides')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!guideData) {
    redirect('/dashboard') // Redirect normal users back to traveler dashboard
  }

  const guide = guideData as GuideProfile

  // Fetch traveler name/email details by joining with guide_bookings
  const { data: bookingsData } = await supabase
    .from('guide_bookings')
    .select(`
      *,
      itineraries ( title )
    `)
    .eq('guide_id', user.id)
    .order('created_at', { ascending: false })

  // For each booking, fetch traveler profiles (using separate query to avoid deep join restrictions in some client environments)
  const bookings = (bookingsData || []) as Booking[]
  if (bookings.length > 0) {
    const travelerIds = Array.from(new Set(bookings.map(b => b.traveler_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', travelerIds)

    const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || [])
    
    // We also need user emails from auth (if we can join, else fallback to full name)
    bookings.forEach(b => {
      b.traveler_name = profilesMap.get(b.traveler_id) || 'Traveler'
    })
  }

  // Fetch blocked dates
  const { data: availabilityData } = await supabase
    .from('guide_availability')
    .select('*')
    .eq('guide_id', user.id)
    .order('blocked_date', { ascending: true })

  const blockedDates = (availabilityData || []) as BlockedDate[]

  return (
    <div className="min-h-screen bg-background py-28 px-4 atlas-grain">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link href="/dashboard" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3 inline-block">
          ← Back to Traveler Account
        </Link>

        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight">
              Tour Guide Dashboard
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              Manage your profile details, availability calendar, and reservation requests
            </p>
          </div>
          {guide.is_verified ? (
            <span className="px-3.5 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10.5px] uppercase tracking-widest font-bold rounded-full">
              ✓ Verified Partner
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10.5px] uppercase tracking-widest font-bold rounded-full">
              ⚠ Verification Pending
            </span>
          )}
        </div>

        {/* Client Interactive Area */}
        <GuideDashboardClient
          guide={guide}
          initialBookings={bookings}
          initialBlockedDates={blockedDates}
          userId={user.id}
        />
      </div>
    </div>
  )
}
