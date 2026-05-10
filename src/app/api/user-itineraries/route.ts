import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface StopInput {
  location_id: string
  day_number: number
  order_index: number
  custom_notes?: string
}

interface CreateUserItineraryBody {
  title?: unknown
  description?: unknown
  stops?: unknown
}

function isStopInput(stop: unknown): stop is StopInput {
  if (!stop || typeof stop !== 'object') return false

  const candidate = stop as Record<string, unknown>
  return (
    typeof candidate.location_id === 'string' &&
    Number.isInteger(candidate.day_number) &&
    Number.isInteger(candidate.order_index) &&
    (
      candidate.custom_notes === undefined ||
      candidate.custom_notes === null ||
      typeof candidate.custom_notes === 'string'
    )
  )
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tier check (Elite only)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (!profile || profile.tier !== 'elite') {
      return NextResponse.json({ error: 'Forbidden: Elite tier required' }, { status: 403 })
    }

    const body = await request.json() as CreateUserItineraryBody
    const { title, description, stops } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!Array.isArray(stops)) {
      return NextResponse.json({ error: 'Stops array is required' }, { status: 400 })
    }

    if (stops.length === 0 || !stops.every(isStopInput)) {
      return NextResponse.json({ error: 'At least one valid stop is required' }, { status: 400 })
    }

    const { data: itinerary, error } = await supabase
      .rpc('create_user_itinerary_with_stops', {
        p_user_id: user.id,
        p_title: title,
        p_description: typeof description === 'string' ? description : '',
        p_stops: stops,
      })
      .single()

    if (error) {
      console.error('Error creating itinerary:', error)
      return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 })
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
