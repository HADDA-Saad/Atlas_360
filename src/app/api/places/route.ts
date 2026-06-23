import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlaceType } from '@/types'

const ALLOWED_PLACE_TYPES = new Set<PlaceType>(['lodging', 'restaurant'])

interface GooglePlaceResult {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  vicinity?: string
  photos?: Array<{ photo_reference?: string }>
  price_level?: number
  geometry?: {
    location?: {
      lat?: number
      lng?: number
    }
  }
}

interface GooglePlacesResponse {
  status: string
  error_message?: string
  results?: GooglePlaceResult[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const typeParam = searchParams.get('type')

  if (!latParam || !lngParam || !typeParam) {
    return NextResponse.json({ error: 'Missing required parameters: lat, lng, type' }, { status: 400 })
  }

  const lat = Number(latParam)
  const lng = Number(lngParam)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates: lat and lng must be finite numbers' }, { status: 400 })
  }

  if (!ALLOWED_PLACE_TYPES.has(typeParam as PlaceType)) {
    return NextResponse.json({ error: 'Invalid type: must be lodging or restaurant' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: PLACES_API_KEY is missing' }, { status: 500 })
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.search = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: '1500',
      type: typeParam,
      key: apiKey,
    }).toString()

    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Google Places request failed' }, { status: 502 })
    }

    const data = await response.json() as GooglePlacesResponse

    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json([])
    }

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data)
      return NextResponse.json({ error: data.error_message || 'Failed to fetch places' }, { status: 500 })
    }

    const places = (data.results || []).map((place) => ({
      place_id: place.place_id,
      name: place.name,
      rating: place.rating ?? null,
      user_ratings_total: place.user_ratings_total ?? null,
      vicinity: place.vicinity || null,
      photo_reference: place.photos?.[0]?.photo_reference || null,
      price_level: place.price_level ?? null,
      lat: place.geometry?.location?.lat ?? 0,
      lng: place.geometry?.location?.lng ?? 0,
    }))

    return NextResponse.json(places)
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
