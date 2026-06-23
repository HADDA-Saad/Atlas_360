import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    const [{ data: blockedDays }, { data: activeBookings }] = await Promise.all([
      admin
        .from('guide_availability')
        .select('blocked_date')
        .eq('guide_id', id),
      admin
        .from('guide_bookings')
        .select('start_date, end_date')
        .eq('guide_id', id)
        .in('status', ['accepted', 'paid']),
    ])

    return NextResponse.json({
      blockedDays: (blockedDays || []).map(d => d.blocked_date),
      activeRanges: (activeBookings || []).map(b => ({ start: b.start_date, end: b.end_date })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
