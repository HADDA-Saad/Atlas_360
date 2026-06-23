import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CustomStopDetails {
  name: string
  description?: string
  lat: number
  lng: number
  category?: string
  day_number: number
  order_index: number
  custom_notes?: string
}

interface SaveStopInput {
  location_id?: string
  custom_stop?: CustomStopDetails
  day_number: number
  order_index: number
  custom_notes?: string
}

interface CreateUserItineraryBody {
  title?: unknown
  description?: unknown
  stops?: unknown
}

const CONTAINER_ITINERARY_ID = '00000000-0000-0000-0000-000000000000'

function isSaveStopInput(stop: unknown): stop is SaveStopInput {
  if (!stop || typeof stop !== 'object') return false

  const candidate = stop as Record<string, unknown>
  const hasLocationId = typeof candidate.location_id === 'string' && candidate.location_id !== 'null' && candidate.location_id !== 'undefined'
  const hasCustomStop =
    !!candidate.custom_stop &&
    typeof candidate.custom_stop === 'object' &&
    typeof (candidate.custom_stop as any).name === 'string' &&
    typeof (candidate.custom_stop as any).lat === 'number' &&
    typeof (candidate.custom_stop as any).lng === 'number'

  return (
    (hasLocationId || hasCustomStop) &&
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

    // Tier check (Nomad or Elite required)
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.tier !== 'elite' && profile.tier !== 'nomad')) {
      return NextResponse.json({ error: 'Forbidden: Premium subscription required' }, { status: 403 })
    }

    const body = await request.json() as CreateUserItineraryBody
    const { title, description, stops } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!Array.isArray(stops)) {
      return NextResponse.json({ error: 'Stops array is required' }, { status: 400 })
    }

    if (stops.length === 0 || !stops.every(isSaveStopInput)) {
      return NextResponse.json({ error: 'At least one valid stop is required' }, { status: 400 })
    }

    // Process each stop, resolving custom stops if necessary
    const resolvedStops = []

    for (const stop of stops) {
      if (stop.location_id && stop.location_id !== 'null' && stop.location_id !== 'undefined') {
        resolvedStops.push({
          location_id: stop.location_id,
          day_number: stop.day_number,
          order_index: stop.order_index,
          custom_notes: stop.custom_notes || ''
        })
      } else if (stop.custom_stop) {
        const custom = stop.custom_stop
        
        // 1. Check if this exact custom location already exists in our database under the container
        const { data: existingLoc } = await supabase
          .from('locations')
          .select('id')
          .eq('itinerary_id', CONTAINER_ITINERARY_ID)
          .eq('name', custom.name)
          .maybeSingle()

        if (existingLoc) {
          resolvedStops.push({
            location_id: existingLoc.id,
            day_number: stop.day_number,
            order_index: stop.order_index,
            custom_notes: stop.custom_notes || ''
          })
          continue
        }

        // 2. Call Google Places Text Search to resolve exact coordinates & photos
        let resolvedLat = custom.lat
        let resolvedLng = custom.lng
        let resolvedImageUrl = null
        const apiKey = process.env.PLACES_API_KEY

        if (apiKey) {
          try {
            const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
            searchUrl.search = new URLSearchParams({
              input: `${custom.name}, Morocco`,
              inputtype: 'textquery',
              fields: 'geometry,photos',
              key: apiKey
            }).toString()

            const gRes = await fetch(searchUrl)
            if (gRes.ok) {
              const gData = await gRes.json()
              if (gData.status === 'OK' && gData.candidates?.[0]) {
                const candidate = gData.candidates[0]
                if (candidate.geometry?.location) {
                  resolvedLat = candidate.geometry.location.lat
                  resolvedLng = candidate.geometry.location.lng
                }
                if (candidate.photos?.[0]?.photo_reference) {
                  // Build a public facing photo url
                  resolvedImageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${candidate.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
                }
              }
            }
          } catch (gErr) {
            console.error('Google Places resolution failed for custom stop:', custom.name, gErr)
          }
        }

        // 3. Insert the new location under the system container
        const { data: newLoc, error: locError } = await supabase
          .from('locations')
          .insert({
            itinerary_id: CONTAINER_ITINERARY_ID,
            name: custom.name,
            description: custom.description || '',
            lat: resolvedLat,
            lng: resolvedLng,
            order_index: stop.order_index,
            day_number: stop.day_number,
            category: custom.category || 'other',
            image_url: resolvedImageUrl
          })
          .select('id')
          .single()

        if (locError || !newLoc) {
          console.error('Error inserting custom location:', locError)
          return NextResponse.json({ error: 'Failed to save custom stops' }, { status: 500 })
        }

        resolvedStops.push({
          location_id: newLoc.id,
          day_number: stop.day_number,
          order_index: stop.order_index,
          custom_notes: stop.custom_notes || ''
        })
      }
    }

    // Call the database function to create user itinerary and stops atomically
    const { data: itinerary, error } = await supabase
      .rpc('create_user_itinerary_with_stops', {
        p_user_id: user.id,
        p_title: title,
        p_description: typeof description === 'string' ? description : '',
        p_stops: resolvedStops,
      })
      .single()

    if (error) {
      console.error('Error creating user itinerary:', error)
      return NextResponse.json({ error: error.message || 'Failed to create itinerary' }, { status: 500 })
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
