import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface PatchBookingBody {
  status?: unknown
}

const VALID_GUIDE_STATUSES = new Set(['accepted', 'declined', 'cancelled'])

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

    // Verify booking is owned by the logged in guide
    const { data: booking, error: fetchError } = await supabase
      .from('guide_bookings')
      .select('*')
      .eq('id', id)
      .eq('guide_id', user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 })
    }

    // Update status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('guide_bookings')
      .update({ status: body.status })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Automated calendar blockouts
    if (body.status === 'accepted') {
      // Block out dates
      const start = new Date(booking.start_date)
      const end = new Date(booking.end_date)
      const datesToBlock: Array<{ guide_id: string; blocked_date: string; reason: string }> = []
      
      const current = new Date(start)
      while (current <= end) {
        datesToBlock.push({
          guide_id: user.id,
          blocked_date: current.toISOString().split('T')[0],
          reason: `Booking request ${id}`
        })
        current.setDate(current.getDate() + 1)
      }

      if (datesToBlock.length > 0) {
        // Insert and ignore conflict if already blocked
        await supabase
          .from('guide_availability')
          .insert(datesToBlock)
      }
    } else if (body.status === 'declined' || body.status === 'cancelled') {
      // Remove any auto-blocked dates for this booking
      await supabase
        .from('guide_availability')
        .delete()
        .eq('guide_id', user.id)
        .eq('reason', `Booking request ${id}`)
    }

    return NextResponse.json(updatedBooking)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
