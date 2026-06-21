import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateBookingPrice } from '@/lib/booking-utils'
import { createNotification } from '@/lib/notifications'

interface BookingRequestBody {
  guide_id?: unknown
  itinerary_id?: unknown
  start_date?: unknown
  end_date?: unknown
  terms_agreed?: unknown
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as BookingRequestBody
    const { guide_id, itinerary_id, start_date, end_date, terms_agreed } = body

    if (terms_agreed !== true) {
      return NextResponse.json({ error: 'You must agree to the cancellation policy to book.' }, { status: 400 })
    }

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

    // Also reject if dates overlap an already accepted or paid booking range
    const { data: activeConflicts } = await supabase
      .from('guide_bookings')
      .select('id')
      .eq('guide_id', guide_id as string)
      .in('status', ['accepted', 'paid'])
      .lte('start_date', end_date as string)
      .gte('end_date', start_date as string)

    if (activeConflicts && activeConflicts.length > 0) {
      return NextResponse.json({ error: 'The guide is not available for those dates — they are already booked.' }, { status: 409 })
    }

    // 3. Calculate price and commission
    const { daysCount, total_price, commission_amount } = calculateBookingPrice(start_date, end_date, guide.daily_rate_mad)

    // Coerce itinerary_id to null when empty/absent — never send '' to a UUID FK column
    const safeItineraryId =
      itinerary_id && typeof itinerary_id === 'string' && itinerary_id.trim() !== ''
        ? itinerary_id
        : null

    // 4. Create booking — use admin client to bypass RLS on insert
    const adminSupabase = createAdminClient()
    const { data: booking, error: insertError } = await adminSupabase
      .from('guide_bookings')
      .insert({
        traveler_id: user.id,
        guide_id,
        itinerary_id: safeItineraryId,
        start_date,
        end_date,
        total_price,
        commission_amount,
        status: 'pending',
        terms_agreed_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('[bookings POST] insert failed:', insertError.code, insertError.message)
      if (insertError.code === '23503') {
        if (insertError.message.includes('itinerary_id')) {
          return NextResponse.json({ error: 'The selected itinerary no longer exists. Try booking without one.' }, { status: 400 })
        }
        return NextResponse.json({ error: 'A referenced record was not found. Please refresh and try again.' }, { status: 400 })
      }
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'You already have a pending booking with this guide for these dates.' }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Notify the guide of the new booking request
    await createNotification({
      user_id: guide_id,
      type: 'booking_request',
      title: 'New booking request',
      body: `${user.email} has requested a tour from ${start_date} to ${end_date}.`,
      link: '/dashboard/guide',
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
