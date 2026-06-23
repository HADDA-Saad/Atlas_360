import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

export async function setPaid(bookingId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: booking, error: fetchError } = await admin
    .from('guide_bookings')
    .select('traveler_id, guide_id, start_date, end_date')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) throw new Error(`Booking ${bookingId} not found`)

  const { error: updateError } = await admin
    .from('guide_bookings')
    .update({ status: 'paid' })
    .eq('id', bookingId)

  if (updateError) throw new Error('Failed to update booking status')

  await createNotification({
    user_id: booking.traveler_id,
    type: 'booking_paid',
    title: 'Payment confirmed',
    body: `Your booking from ${booking.start_date} to ${booking.end_date} is now confirmed. You can now message your guide.`,
    link: '/dashboard',
  })

  await createNotification({
    user_id: booking.guide_id,
    type: 'booking_paid',
    title: 'Payment received',
    body: `The traveler has paid for the booking from ${booking.start_date} to ${booking.end_date}. Funds are in escrow.`,
    link: '/dashboard/guide',
  })
}
