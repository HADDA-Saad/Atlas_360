import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateBookingPrice } from '@/lib/booking-utils'

interface BookingRequestBody {
  guide_id?: unknown
  itinerary_id?: unknown
  start_date?: unknown
  end_date?: unknown
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as BookingRequestBody
    const { guide_id, itinerary_id, start_date, end_date } = body

    if (typeof guide_id !== 'string' || !guide_id) {
      return NextResponse.json({ error: 'guide_id is required' }, { status: 400 })
    }

    if (typeof start_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return NextResponse.json({ error: 'start_date is required in YYYY-MM-DD format' }, { status: 400 })
    }

    if (typeof end_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      return NextResponse.json({ error: 'end_date is required in YYYY-MM-DD format' }, { status: 400 })
    }

    const start = new Date(start_date)
    const end = new Date(end_date)

    if (end < start) {
      return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 })
    }

    // 1. Fetch guide details (daily rate)
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('daily_rate_mad, is_verified')
      .eq('id', guide_id)
      .single()

    if (guideError || !guide) {
      return NextResponse.json({ error: 'Guide profile not found' }, { status: 404 })
    }

    if (!guide.is_verified) {
      return NextResponse.json({ error: 'Guide is not verified' }, { status: 400 })
    }

    // 2. Check for availability conflicts
    const { data: conflicts, error: conflictsError } = await supabase
      .from('guide_availability')
      .select('id')
      .eq('guide_id', guide_id)
      .gte('blocked_date', start_date)
      .lte('blocked_date', end_date)

    if (conflictsError) {
      return NextResponse.json({ error: conflictsError.message }, { status: 500 })
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Guide is not available on one or more of the selected dates' }, { status: 409 })
    }

    // 3. Calculate price and commission
    const { daysCount, total_price, commission_amount } = calculateBookingPrice(start_date, end_date, guide.daily_rate_mad)

    // 4. Create booking
    const { data: booking, error: insertError } = await supabase
      .from('guide_bookings')
      .insert({
        traveler_id: user.id,
        guide_id,
        itinerary_id: itinerary_id || null,
        start_date,
        end_date,
        total_price,
        commission_amount,
        status: 'pending',
      })
      .select('*')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
