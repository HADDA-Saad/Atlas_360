'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PlaceCard, { PlaceCardSkeleton } from './PlaceCard'
import type { PlaceResult } from '@/types'

interface PlacesTabProps {
  lat: number
  lng: number
  itineraryId?: string | null
  onPlacesLoaded?: (hotels: PlaceResult[], restaurants: PlaceResult[]) => void
}

interface RecommendationResult {
  id: string
  name: string
  description: string | null
  lat: number
  lng: number
  distance_km: number
  itinerary_id: string
  itineraries: {
    title: string
    region: string
  }
}

interface PlacesState {
  key: string
  hotels: PlaceResult[]
  restaurants: PlaceResult[]
  recommendations: RecommendationResult[]
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
}

async function fetchPlaces(lat: number, lng: number, type: 'lodging' | 'restaurant') {
  const response = await fetch(`/api/places?lat=${lat}&lng=${lng}&type=${type}`)
  const payload = await response.json()

  if (!response.ok) {
    const message = typeof payload?.error === 'string'
      ? payload.error
      : `Could not load ${type} places.`
    throw new Error(message)
  }

  if (!Array.isArray(payload)) {
    throw new Error(`Unexpected ${type} places response.`)
  }

  return payload as PlaceResult[]
}

async function fetchRecommendations(lat: number, lng: number, excludeItineraryId?: string | null) {
  const url = `/api/places/recommendations?lat=${lat}&lng=${lng}${excludeItineraryId ? `&exclude_itinerary_id=${excludeItineraryId}` : ''}`
  const response = await fetch(url)
  if (!response.ok) return []
  return await response.json() as RecommendationResult[]
}

export default function PlacesTab({ lat, lng, itineraryId, onPlacesLoaded }: PlacesTabProps) {
  const requestKey = `${lat},${lng}`
  const [placesState, setPlacesState] = useState<PlacesState>({
    key: requestKey,
    hotels: [],
    restaurants: [],
    recommendations: [],
    isLoading: true,
    hasError: false,
    errorMessage: null,
  })

  useEffect(() => {
    let isMounted = true

    Promise.all([
      fetchPlaces(lat, lng, 'lodging'),
      fetchPlaces(lat, lng, 'restaurant'),
      fetchRecommendations(lat, lng, itineraryId)
    ])
      .then(([hotelsData, restaurantsData, recommendationsData]) => {
        if (!isMounted) return

        const h = hotelsData.slice(0, 5)
        const r = restaurantsData.slice(0, 5)
        setPlacesState({
          key: requestKey,
          hotels: h,
          restaurants: r,
          recommendations: recommendationsData,
          isLoading: false,
          hasError: false,
          errorMessage: null,
        })
        if (onPlacesLoaded) onPlacesLoaded(h, r)
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) {
          if (onPlacesLoaded) onPlacesLoaded([], [])
          setPlacesState({
            key: requestKey,
            hotels: [],
            restaurants: [],
            recommendations: [],
            isLoading: false,
            hasError: true,
            errorMessage: err instanceof Error ? err.message : 'Could not load nearby places.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [lat, lng, onPlacesLoaded, requestKey, itineraryId])

  const isLoading = placesState.key !== requestKey || placesState.isLoading
  const error = placesState.key === requestKey && placesState.hasError
  const errorMessage = placesState.errorMessage || 'Could not load nearby places.'
  const { hotels, restaurants, recommendations } = placesState

  if (error) {
    return (
      <div className="p-6 text-sm text-muted-foreground text-center border border-red-900/30 bg-red-900/10 rounded-xl m-4">
        {errorMessage}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 ml-1">Nearby Hotels</h3>
          <div className="flex flex-col gap-2">
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 ml-1">Nearby Restaurants</h3>
          <div className="flex flex-col gap-2">
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 pb-8">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 ml-1">Nearby Hotels</h3>
        {hotels.length > 0 ? (
          <div className="flex flex-col gap-2">
            {hotels.map((hotel) => (
              <PlaceCard key={hotel.place_id} place={hotel} type="lodging" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic ml-1">No results found</p>
        )}
      </div>
      
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 ml-1">Nearby Restaurants</h3>
        {restaurants.length > 0 ? (
          <div className="flex flex-col gap-2">
            {restaurants.map((restaurant) => (
              <PlaceCard key={restaurant.place_id} place={restaurant} type="restaurant" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic ml-1">No results found</p>
        )}
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 ml-1">Nearby Stops (Other Routes)</h3>
        {recommendations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-[family-name:var(--font-cormorant)] text-[15px] font-semibold text-foreground truncate leading-none">
                    {rec.name}
                  </h4>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                    {rec.distance_km} km away
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {rec.description || 'No description available.'}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px]">
                  <span className="text-muted-foreground font-medium truncate max-w-[150px]">
                    Route: <span className="text-foreground">{rec.itineraries?.title || 'Unknown'}</span>
                  </span>
                  <Link 
                    href={`/explore?itinerary=${rec.itinerary_id}`}
                    className="text-primary hover:text-primary/80 font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    View Route →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic ml-1">No other nearby routes found within 100km.</p>
        )}
      </div>
    </div>
  )
}
