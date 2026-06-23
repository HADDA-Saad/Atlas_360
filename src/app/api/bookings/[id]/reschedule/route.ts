import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'
import { calculateBookingPrice } from '@/lib/booking-utils'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json() as { start_date?: unknown; end_date?: unknown }

    const start_date = body.start_date
    const end_date   = body.end_date

    if (typeof start_date !== 'string' || !DATE_RE.test(start_date))
      return NextResponse.json({ error: 'start_date is required in YYYY-MM-DD format' }, { status: 400 })
    if (typeof end_date !== 'string' || !DATE_RE.test(end_date))
      return NextResponse.json({ error: 'end_date is required in YYYY-MM-DD format' }, { status: 400 })
    if (end_date < start_date)
      return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 })

    const admin = createAdminClient()

    // Must be the traveler's own booking
    const { data: booking, error: fetchErr } = await admin
      .from('guide_bookings')
      .select('*')
      .eq('id', id)
      .eq('traveler_id', user.id)
      .single()

    if (fetchErr || !booking)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    if (!['pending', 'accepted'].includes(booking.status))
      return NextResponse.json(
        { error: 'Reschedule is only allowed for pending or accepted bookings.' },
        { status: 409 }
      )

    // Same dates — nothing to do
    if (booking.start_date === start_date && booking.end_date === end_date)
      return NextResponse.json({ error: 'New dates are the same as current dates.' }, { status: 400 })

    // Availability: no guide day-offs in new range
    const { data: dayOffConflicts } = await admin
      .from('guide_availability')
      .select('id')
      .eq('guide_id', booking.guide_id)
      .gte('blocked_date', start_date)
      .lte('blocked_date', end_date)

    if (dayOffConflicts && dayOffConflicts.length > 0)
      return NextResponse.json(
        { error: 'The guide is unavailable on one or more of the selected dates.' },
        { status: 409 }
      )

    // Overlap: no accepted/paid booking by this guide in new range (exclude self)
    const { data: conflicts } = await admin
      .from('guide_bookings')
      .select('id')
      .eq('guide_id', booking.guide_id)
      .in('status', ['accepted', 'paid'])
      .neq('id', id)
      .lte('start_date', end_date)
      .gte('end_date', start_date)

    if (conflicts && conflicts.length > 0)
      return NextResponse.json(
        { error: 'These dates overlap with an existing confirmed booking.' },
        { status: 409 }
      )

    // If it was accepted: unblock the old calendar dates before resetting
    if (booking.status === 'accepted') {
      await admin
        .from('guide_availability')
        .delete()
        .eq('guide_id', booking.guide_id)
        .eq('reason', `Booking request ${id}`)
    }

    // Recalculate price using the guide's current daily rate
    const { data: guide } = await admin
      .from('guides')
      .select('daily_rate_mad')
      .eq('id', booking.guide_id)
      .single()

    const dailyRate  = guide?.daily_rate_mad ?? Math.round(booking.total_price / Math.max(1,
      Math.round((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000) + 1
    ))
    const { total_price, commission_amount } = calculateBookingPrice(start_date, end_date, dailyRate)

    // Update booking: new dates, recalculated price, reset to pending if was accepted
    const { data: updated, error: updateErr } = await admin
      .from('guide_bookings')
      .update({
        start_date,
        end_date,
        total_price,
        commission_amount,
        status: 'pending',          // always reset — guide must re-confirm
        hold_expires_at: null,
        rescheduled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateErr)
      return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // Notify the guide
    await createNotification({
      user_id: booking.guide_id,
      type: 'booking_rescheduled',
      title: 'Traveler changed booking dates',
      body: `A traveler rescheduled their booking to ${start_date} – ${end_date}. Please review and re-confirm.`,
      link: '/dashboard/guide',
    })

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
