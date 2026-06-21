import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/notifications'

const ADMIN_EMAILS = ['jaz.ouchene@gmail.com', 'jazoulizaka@gmail.com', 'jazoulizka@gmail.com', 'saadhad08@gmail.com']

interface PatchBody {
  status?: unknown
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json() as PatchBody

    if (body.status !== 'completed' && body.status !== 'paid') {
      return NextResponse.json({ error: 'Invalid status — must be "paid" or "completed"' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch current booking for notification context
    const { data: booking } = await admin
      .from('guide_bookings')
      .select('traveler_id, guide_id, start_date, end_date, total_price, commission_amount')
      .eq('id', id)
      .single()

    const { data, error } = await admin
      .from('guide_bookings')
      .update({ status: body.status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (booking) {
      if (body.status === 'paid') {
        // Admin manually confirmed payment (accepted→paid)
        await createNotification({
          user_id: booking.traveler_id,
          type: 'booking_paid',
          title: 'Payment confirmed by admin',
          body: `Your booking from ${booking.start_date} to ${booking.end_date} has been marked as paid. Chat with your guide is now open.`,
          link: '/dashboard',
        })
        await createNotification({
          user_id: booking.guide_id,
          type: 'booking_paid',
          title: 'Payment confirmed',
          body: `Admin has confirmed payment for the booking from ${booking.start_date} to ${booking.end_date}. Funds are in escrow.`,
          link: '/dashboard/guide',
        })
      }

      if (body.status === 'completed') {
        // Payout released (paid→completed)
        const netPayout = booking.total_price - booking.commission_amount
        await createNotification({
          user_id: booking.guide_id,
          type: 'payout_released',
          title: 'Payout released',
          body: `Your payout of ${netPayout} MAD for the booking from ${booking.start_date} to ${booking.end_date} has been released.`,
          link: '/dashboard/guide',
        })
        await createNotification({
          user_id: booking.traveler_id,
          type: 'booking_completed',
          title: 'Booking completed',
          body: `Your booking from ${booking.start_date} to ${booking.end_date} is complete.`,
          link: '/dashboard',
        })
      }
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
