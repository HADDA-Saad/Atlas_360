import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

// Single setPaid path — a real gateway webhook calls this same route later
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Verify the booking belongs to this traveler and is in 'accepted' state
    const { data: booking, error: fetchError } = await supabase
      .from('guide_bookings')
      .select('*')
      .eq('id', id)
      .eq('traveler_id', user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { error: `Cannot pay a booking with status '${booking.status}'` },
        { status: 409 }
      )
    }

    const admin = createAdminClient()
    const { data: updated, error: updateError } = await admin
      .from('guide_bookings')
      .update({ status: 'paid' })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
    }

    // Notify traveler
    await createNotification({
      user_id: user.id,
      type: 'booking_paid',
      title: 'Payment confirmed',
      body: `Your booking from ${booking.start_date} to ${booking.end_date} is now confirmed. You can now message your guide.`,
      link: '/dashboard',
    })

    // Notify guide
    await createNotification({
      user_id: booking.guide_id,
      type: 'booking_paid',
      title: 'Payment received',
      body: `The traveler has paid for the booking from ${booking.start_date} to ${booking.end_date}. Funds are in escrow.`,
      link: '/dashboard/guide',
    })

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
