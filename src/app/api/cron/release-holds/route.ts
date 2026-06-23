import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'
import { expireStalePendingBookings } from '@/lib/expire-bookings'

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const auth = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  const now   = new Date().toISOString()

  // 1. Release expired payment holds (accepted → cancelled)
  const { data: expiredHolds, error } = await admin
    .from('guide_bookings')
    .select('*')
    .eq('status', 'accepted')
    .lt('hold_expires_at', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let released = 0
  for (const booking of expiredHolds ?? []) {
    const { error: updateErr } = await admin
      .from('guide_bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id)

    if (updateErr) continue

    await admin
      .from('guide_availability')
      .delete()
      .eq('guide_id', booking.guide_id)
      .eq('reason', `Booking request ${booking.id}`)

    await createNotification({
      user_id: booking.traveler_id,
      type:    'booking_cancelled',
      title:   'Booking hold expired',
      body:    `Your hold for ${booking.start_date} to ${booking.end_date} was released because payment was not completed within 24 hours.`,
      link:    '/my-bookings',
    })

    released++
  }

  // 2. Expire stale pending bookings (pending → expired after 48h)
  const expired = await expireStalePendingBookings(admin)

  return NextResponse.json({ released, expired })
}
