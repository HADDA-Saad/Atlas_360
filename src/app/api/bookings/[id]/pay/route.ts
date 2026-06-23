import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setPaid } from '@/lib/setPaid'

// Admin "Mark as Paid" fallback — traveler payment goes through Stripe Checkout
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Verify the booking exists and is in 'accepted' state
    const { data: booking, error: fetchError } = await supabase
      .from('guide_bookings')
      .select('status')
      .eq('id', id)
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

    await setPaid(id)

    return NextResponse.json({ status: 'paid' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
