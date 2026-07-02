import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/types'

// UUID v4 regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TIER_LEVELS: Record<UserTier, number> = { explorer: 0, nomad: 1, elite: 2, concierge: 3 }

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid itinerary ID format. Must be a valid UUID.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .select('id, tier')
      .eq('id', id)
      .single()

    if (itineraryError || !itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    const userTier = (profile?.tier || 'explorer') as UserTier
    const requiredTier = itinerary.tier as UserTier

    if (TIER_LEVELS[userTier] < TIER_LEVELS[requiredTier]) {
      return NextResponse.json(
        { error: `Forbidden: ${requiredTier} tier required` },
        { status: 403 }
      )
    }

    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('itinerary_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(locations)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
