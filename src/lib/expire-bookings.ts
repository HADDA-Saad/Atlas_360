import { createNotification } from '@/lib/notifications'

// Single constant — change here to adjust the window everywhere
export const PENDING_EXPIRY_HOURS = 48

type AdminClient = ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>

/**
 * Lazily expires all pending bookings older than PENDING_EXPIRY_HOURS.
 * Safe to call on every page load — only touches stale rows.
 * Returns the count of bookings that were expired.
 */
export async function expireStalePendingBookings(admin: AdminClient): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

  const { data: stale, error } = await admin
    .from('guide_bookings')
    .select('id, traveler_id, guide_id, start_date, end_date')
    .eq('status', 'pending')
    .lt('created_at', cutoff)

  if (error || !stale || stale.length === 0) return 0

  let count = 0
  for (const booking of stale) {
    const { error: updateErr } = await admin
      .from('guide_bookings')
      .update({ status: 'expired' })
      .eq('id', booking.id)
      .eq('status', 'pending') // guard against concurrent updates

    if (updateErr) continue

    await Promise.all([
      createNotification({
        user_id: booking.traveler_id,
        type:    'booking_expired',
        title:   'Booking request expired',
        body:    `Your request for ${booking.start_date} – ${booking.end_date} expired because the guide didn't respond within ${PENDING_EXPIRY_HOURS} hours.`,
        link:    '/my-bookings',
      }),
      createNotification({
        user_id: booking.guide_id,
        type:    'booking_expired',
        title:   'Booking request expired',
        body:    `A booking request for ${booking.start_date} – ${booking.end_date} expired (no response within ${PENDING_EXPIRY_HOURS}h).`,
        link:    '/dashboard/guide',
      }),
    ])

    count++
  }

  return count
}
