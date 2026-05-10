'use client'

import { useState, useEffect } from 'react'
import PlaceCard, { PlaceCardSkeleton } from './PlaceCard'
import type { PlaceResult } from '@/types'

interface PlacesTabProps {
  lat: number
  lng: number
  onPlacesLoaded?: (hotels: PlaceResult[], restaurants: PlaceResult[]) => void
}

interface PlacesState {
  key: string
  hotels: PlaceResult[]
  restaurants: PlaceResult[]
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

export default function PlacesTab({ lat, lng, onPlacesLoaded }: PlacesTabProps) {
  const requestKey = `${lat},${lng}`
  const [placesState, setPlacesState] = useState<PlacesState>({
    key: requestKey,
    hotels: [],
    restaurants: [],
    isLoading: true,
    hasError: false,
    errorMessage: null,
  })

  useEffect(() => {
    let isMounted = true

    Promise.all([
      fetchPlaces(lat, lng, 'lodging'),
      fetchPlaces(lat, lng, 'restaurant')
    ])
      .then(([hotelsData, restaurantsData]) => {
        if (!isMounted) return

        const h = hotelsData.slice(0, 5)
        const r = restaurantsData.slice(0, 5)
        setPlacesState({
          key: requestKey,
          hotels: h,
          restaurants: r,
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
            isLoading: false,
            hasError: true,
            errorMessage: err instanceof Error ? err.message : 'Could not load nearby places.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [lat, lng, onPlacesLoaded, requestKey])

  const isLoading = placesState.key !== requestKey || placesState.isLoading
  const error = placesState.key === requestKey && placesState.hasError
  const errorMessage = placesState.errorMessage || 'Could not load nearby places.'
  const { hotels, restaurants } = placesState

  if (error) {
    return (
      <div className="p-6 text-sm text-[#8B7355] text-center border border-red-900/30 bg-red-900/10 rounded-xl m-4">
        {errorMessage}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] mb-3 ml-1">Nearby Hotels</h3>
          <div className="flex flex-col gap-2">
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] mb-3 ml-1">Nearby Restaurants</h3>
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
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] mb-3 ml-1">Nearby Hotels</h3>
        {hotels.length > 0 ? (
          <div className="flex flex-col gap-2">
            {hotels.map((hotel) => (
              <PlaceCard key={hotel.place_id} place={hotel} type="lodging" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8B7355] italic ml-1">No results found</p>
        )}
      </div>
      
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C1440E] mb-3 ml-1">Nearby Restaurants</h3>
        {restaurants.length > 0 ? (
          <div className="flex flex-col gap-2">
            {restaurants.map((restaurant) => (
              <PlaceCard key={restaurant.place_id} place={restaurant} type="restaurant" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8B7355] italic ml-1">No results found</p>
        )}
      </div>
    </div>
  )
}
