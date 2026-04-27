import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const body = await request.json()
    const { title, description, stops } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!Array.isArray(stops)) {
      return NextResponse.json({ error: 'Stops array is required' }, { status: 400 })
    }

    // Insert itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from('user_itineraries')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        is_public: false,
      })
      .select()
      .single()

    if (itineraryError) {
      console.error('Error inserting itinerary:', itineraryError)
      return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 })
    }

    // Insert stops
    if (stops.length > 0) {
      const stopsToInsert = stops.map((stop: any) => ({
        itinerary_id: itinerary.id,
        location_id: stop.location_id,
        day_number: stop.day_number,
        order_index: stop.order_index,
        custom_notes: stop.custom_notes || null,
      }))

      const { error: stopsError } = await supabase
        .from('user_itinerary_stops')
        .insert(stopsToInsert)

      if (stopsError) {
        console.error('Error inserting stops:', stopsError)
        return NextResponse.json({ error: 'Failed to save stops' }, { status: 500 })
      }
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
