export interface Itinerary {
  id: string
  title: string
  description: string | null
  region: string | null
  duration_days: number | null
  cover_image_url: string | null
  created_at: string
}

export interface Location {
  id: string
  itinerary_id: string
  name: string
  description: string | null
  lat: number
  lng: number
  order_index: number
  created_at: string
}

export interface ItineraryWithLocations extends Itinerary {
  locations: Location[]
}
