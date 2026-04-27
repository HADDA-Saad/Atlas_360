export type UserTier = 'explorer' | 'nomad' | 'elite'

export interface Itinerary {
  id: string
  title: string
  description: string | null
  region: string | null
  duration_days: number | null
  cover_image_url: string | null
  tier: UserTier
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
  day_number: number | null
  duration: string | null
  transport: string | null
  tips: string | null
  category: string | null
  image_url: string | null
  duration_minutes: number | null
  transport_to_next: string | null
  transport_duration_minutes: number | null
  best_time: string | null
  created_at: string
}

export interface ItineraryWithLocations extends Itinerary {
  locations: Location[]
}

export interface PlaceResult {
  place_id: string
  name: string
  rating: number | null
  user_ratings_total: number | null
  vicinity: string | null
  photo_reference: string | null
  price_level: number | null
  lat: number
  lng: number
}

export type PlaceType = 'lodging' | 'restaurant'
