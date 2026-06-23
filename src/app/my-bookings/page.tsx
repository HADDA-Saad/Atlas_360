import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TravelerBookingsList from '@/app/dashboard/TravelerBookingsList'
import { createNotification } from '@/lib/notifications'
import { expireStalePendingBookings } from '@/lib/expire-bookings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Bookings | Atlas 360',
}

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/my-bookings')

  const admin = createAdminClient()

  // Expire stale pending bookings (48h no-response) — global sweep, runs on every load
  await expireStalePendingBookings(admin)

  // Release any expired payment holds for this traveler before rendering
  const { data: expiredHolds } = await admin
    .from('guide_bookings')
    .select('*')
    .eq('traveler_id', user.id)
    .eq('status', 'accepted')
    .lt('hold_expires_at', new Date().toISOString())

  for (const hold of expiredHolds ?? []) {
    await admin.from('guide_bookings').update({ status: 'cancelled' }).eq('id', hold.id)
    await admin.from('guide_availability').delete().eq('guide_id', hold.guide_id).eq('reason', `Booking request ${hold.id}`)
    await createNotification({
      user_id: user.id,
      type: 'booking_cancelled',
      title: 'Booking hold expired',
      body: `Your hold for ${hold.start_date} to ${hold.end_date} was released because payment was not completed within 24 hours.`,
      link: '/my-bookings',
    })
  }

  const { data: bookingsData } = await supabase
    .from('guide_bookings')
    .select('*')
    .eq('traveler_id', user.id)
    .order('created_at', { ascending: false })

  const guideIds = (bookingsData || []).map((b: any) => b.guide_id)
  let guideProfiles: any[] = []
  if (guideIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', guideIds)
    guideProfiles = profilesData || []
  }

  const bookings = (bookingsData || []).map((b: any) => {
    const p = guideProfiles.find((prof: any) => prof.id === b.guide_id)
    return { ...b, guide_name: p ? p.full_name : 'Local Guide' }
  })

  return (
    <div className="min-h-screen bg-background atlas-grain py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          ← My Account
        </Link>

        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground tracking-tight mb-2">
          My Guide Bookings
        </h1>
        <p className="text-[13px] text-muted-foreground mb-10">
          Track your booking requests, confirm payment, and chat with your guide once paid.
        </p>

        {bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-sm mb-3">No bookings yet.</p>
            <Link
              href="/guides"
              className="text-[11px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              Browse verified guides →
            </Link>
          </div>
        ) : (
          <TravelerBookingsList bookings={bookings} userId={user.id} />
        )}
      </div>
    </div>
  )
}
