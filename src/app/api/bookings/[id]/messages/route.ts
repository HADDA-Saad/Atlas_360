import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getBookingAndVerifyParticipant(bookingId: string, userId: string) {
  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('guide_bookings')
    .select('id, traveler_id, guide_id, status')
    .eq('id', bookingId)
    .single()

  if (!booking) return null
  const isParticipant = booking.traveler_id === userId || booking.guide_id === userId
  if (!isParticipant) return null
  return booking
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const booking = await getBookingAndVerifyParticipant(id, user.id)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!['paid', 'completed'].includes(booking.status)) {
      return NextResponse.json({ locked: true, messages: [] })
    }

    const { data: messages } = await createAdminClient()
      .from('booking_messages')
      .select('id, sender_id, body, created_at')
      .eq('booking_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({ locked: false, messages: messages ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const booking = await getBookingAndVerifyParticipant(id, user.id)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!['paid', 'completed'].includes(booking.status)) {
      return NextResponse.json({ error: 'Chat is locked until the booking is paid' }, { status: 403 })
    }

    const body = await request.json() as { body?: unknown }
    if (!body.body || typeof body.body !== 'string' || body.body.trim() === '') {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
    }

    const { data: message, error } = await createAdminClient()
      .from('booking_messages')
      .insert({ booking_id: id, sender_id: user.id, body: body.body.trim() })
      .select('id, sender_id, body, created_at')
      .single()

    if (error) {
      console.error('[messages POST] supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
