import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple helper to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')
    const excludeItineraryId = searchParams.get('exclude_itinerary_id')

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: 'Coordinates lat and lng are required' }, { status: 400 })
    }

    const targetLat = parseFloat(latStr)
    const targetLng = parseFloat(lngStr)

    const supabase = await createClient()

    // Query all locations
    let query = supabase.from('locations').select('*, itineraries(title, region)')
    
    const { data: locations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!locations) {
      return NextResponse.json([])
    }

    // Filter and map locations with distance calculations
    const recommendations = locations
      .filter((loc) => loc.itinerary_id !== excludeItineraryId)
      .map((loc) => {
        const dist = calculateDistance(targetLat, targetLng, loc.lat, loc.lng)
        return {
          ...loc,
          distance_km: Math.round(dist * 10) / 10,
        }
      })
      // Keep only stops within a 100km radius
      .filter((loc) => loc.distance_km <= 100)
      // Sort by closest first
      .sort((a, b) => a.distance_km - b.distance_km)
      // Limit to top 5 recommendations
      .slice(0, 5)

    return NextResponse.json(recommendations)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
