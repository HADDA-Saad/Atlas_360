import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

interface PatchBookingBody {
  status?: unknown
}

const VALID_GUIDE_STATUSES = new Set(['accepted', 'declined', 'cancelled', 'completed'])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as PatchBookingBody

    if (typeof body.status !== 'string' || !VALID_GUIDE_STATUSES.has(body.status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify booking belongs to the logged-in guide
    const { data: booking, error: fetchError } = await admin
      .from('guide_bookings')
      .select('*')
      .eq('id', id)
      .eq('guide_id', user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 })
    }

    // Guard: terminal / expired bookings cannot be touched
    if (['expired', 'completed', 'declined', 'cancelled'].includes(booking.status)) {
      return NextResponse.json({ error: 'This booking can no longer be updated.' }, { status: 409 })
    }

    // Guard: completed only allowed from paid
    if (body.status === 'completed' && booking.status !== 'paid') {
      return NextResponse.json({ error: 'Can only mark completed from paid status' }, { status: 409 })
    }

    // Guard: accepting — check for overlapping accepted/paid bookings for this guide
    if (body.status === 'accepted') {
      const { data: conflicts } = await admin
        .from('guide_bookings')
        .select('id')
        .eq('guide_id', user.id)
        .in('status', ['accepted', 'paid'])
        .neq('id', id)
        .lte('start_date', booking.end_date)
        .gte('end_date', booking.start_date)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'These dates are no longer available.' }, { status: 409 })
      }
    }

    // Build the update payload
    const updatePayload: Record<string, unknown> = { status: body.status }
    if (body.status === 'accepted') {
      updatePayload.hold_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    const { data: updatedBooking, error: updateError } = await admin
      .from('guide_bookings')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      // Exclusion constraint violation — race condition: another accept won first
      if (updateError.code === '23P01') {
        return NextResponse.json({ error: 'These dates are no longer available.' }, { status: 409 })
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Calendar: block dates on accept, unblock on decline/cancel
    if (body.status === 'accepted') {
      const datesToBlock: Array<{ guide_id: string; blocked_date: string; reason: string }> = []
      const current = new Date(booking.start_date)
      const end = new Date(booking.end_date)
      while (current <= end) {
        datesToBlock.push({
          guide_id: user.id,
          blocked_date: current.toISOString().split('T')[0],
          reason: `Booking request ${id}`,
        })
        current.setDate(current.getDate() + 1)
      }
      if (datesToBlock.length > 0) {
        await admin.from('guide_availability').insert(datesToBlock)
      }

      // Auto-decline all other pending bookings for this guide with overlapping dates
      const { data: competing } = await admin
        .from('guide_bookings')
        .select('id, traveler_id')
        .eq('guide_id', user.id)
        .eq('status', 'pending')
        .neq('id', id)
        .lte('start_date', booking.end_date)
        .gte('end_date', booking.start_date)

      if (competing && competing.length > 0) {
        await admin
          .from('guide_bookings')
          .update({ status: 'declined' })
          .in('id', competing.map(b => b.id))

        for (const c of competing) {
          await createNotification({
            user_id: c.traveler_id,
            type: 'booking_declined',
            title: 'Booking request declined',
            body: 'The guide is no longer available for those dates.',
            link: '/my-bookings',
          })
        }
      }
    } else if (body.status === 'declined' || body.status === 'cancelled') {
      await admin
        .from('guide_availability')
        .delete()
        .eq('guide_id', user.id)
        .eq('reason', `Booking request ${id}`)
    }

    // Notifications
    if (body.status === 'accepted' || body.status === 'declined') {
      await createNotification({
        user_id: booking.traveler_id,
        type: body.status === 'accepted' ? 'booking_accepted' : 'booking_declined',
        title: body.status === 'accepted' ? 'Booking accepted!' : 'Booking declined',
        body: body.status === 'accepted'
          ? `Your guide accepted your booking from ${booking.start_date} to ${booking.end_date}. You have 24 hours to pay.`
          : `Your guide declined your booking from ${booking.start_date} to ${booking.end_date}.`,
        link: '/my-bookings',
      })
    }

    if (body.status === 'completed') {
      await createNotification({
        user_id: booking.traveler_id,
        type: 'booking_completed',
        title: 'Tour marked complete',
        body: `Your guide has marked the tour (${booking.start_date} – ${booking.end_date}) as completed.`,
        link: '/my-bookings',
      })
      await createNotification({
        user_id: user.id,
        type: 'booking_completed',
        title: 'Tour marked complete',
        body: `You marked the booking from ${booking.start_date} to ${booking.end_date} as completed. Payout will be released shortly.`,
        link: '/dashboard/guide',
      })
    }

    return NextResponse.json(updatedBooking)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
