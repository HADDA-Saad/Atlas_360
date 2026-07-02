import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check Elite tier
  const { data: profile } = await supabase
    .from('profiles').select('tier').eq('id', user.id).single()
  if (profile?.tier !== 'elite' && profile?.tier !== 'concierge') {
    return NextResponse.json({ error: 'Elite tier required' }, { status: 403 })
  }

  const { source_itinerary_id, title } = await request.json() as {
    source_itinerary_id: string
    title: string
  }

  // Fetch source locations
  const { data: locations, error: locErr } = await supabase
    .from('locations')
    .select('*')
    .eq('itinerary_id', source_itinerary_id)
    .order('day_number').order('order_index')

  if (locErr || !locations) {
    return NextResponse.json({ error: 'Could not fetch source itinerary' }, { status: 500 })
  }

  // Create new user itinerary
  const { data: newItinerary, error: itinErr } = await supabase
    .from('user_itineraries')
    .insert({
      user_id: user.id,
      title: `${title} (my version)`,
      is_public: false,
      forked_from: source_itinerary_id,
    })
    .select('id')
    .single()

  if (itinErr || !newItinerary) {
    return NextResponse.json({ error: 'Could not create itinerary' }, { status: 500 })
  }

  // Insert stops
  const stops = locations.map((loc) => ({
    itinerary_id: newItinerary.id,
    location_id: loc.id,
    day_number: loc.day_number ?? 1,
    order_index: loc.order_index,
    custom_notes: null,
  }))

  const { error: stopsErr } = await supabase
    .from('user_itinerary_stops')
    .insert(stops)

  if (stopsErr) {
    return NextResponse.json({ error: 'Could not copy stops' }, { status: 500 })
  }

  return NextResponse.json({ id: newItinerary.id })
}
