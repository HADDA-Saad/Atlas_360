import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const type = searchParams.get('type') // e.g. 'lodging' or 'restaurant'

  if (!lat || !lng || !type) {
    return NextResponse.json({ error: 'Missing required parameters: lat, lng, type' }, { status: 400 })
  }

  const apiKey = process.env.PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error: PLACES_API_KEY is missing' }, { status: 500 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=${type}&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data)
      return NextResponse.json({ error: data.error_message || 'Failed to fetch places' }, { status: 500 })
    }

    // Format the response shape if necessary, or just return the data results directly
    const places = data.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      rating: place.rating || null,
      user_ratings_total: place.user_ratings_total || null,
      vicinity: place.vicinity || null,
      photo_reference: place.photos?.[0]?.photo_reference || null,
      price_level: place.price_level || null,
      lat: place.geometry?.location?.lat ?? 0,
      lng: place.geometry?.location?.lng ?? 0,
    }))

    return NextResponse.json(places)
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
