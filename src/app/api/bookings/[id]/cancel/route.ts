import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

const CANCELLABLE = new Set(['pending', 'accepted', 'paid'])

function refundTier(startDate: string): { label: string; pct: number } {
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntil = Math.ceil((new Date(startDate).getTime() - Date.now()) / msPerDay)
  if (daysUntil >= 7) return { label: 'Full refund', pct: 100 }
  if (daysUntil >= 2) return { label: '50% refund', pct: 50 }
  return { label: 'No refund', pct: 0 }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    const { data: booking, error: fetchError } = await admin
      .from('guide_bookings')
      .select('*')
      .eq('id', id)
      .eq('traveler_id', user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!CANCELLABLE.has(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status "${booking.status}"` },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await admin
      .from('guide_bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Unblock calendar dates that were locked when guide accepted
    if (booking.status === 'accepted' || booking.status === 'paid') {
      await admin
        .from('guide_availability')
        .delete()
        .eq('guide_id', booking.guide_id)
        .eq('reason', `Booking request ${id}`)
    }

    // Notify guide
    await createNotification({
      user_id: booking.guide_id,
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      body: `The traveler cancelled their booking from ${booking.start_date} to ${booking.end_date}.`,
      link: '/dashboard/guide',
    })

    const refund = refundTier(booking.start_date)
    return NextResponse.json({ ...updated, refund })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
