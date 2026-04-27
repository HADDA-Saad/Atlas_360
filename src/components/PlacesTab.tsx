'use client'

import { useState, useEffect } from 'react'
import PlaceCard, { PlaceCardSkeleton } from './PlaceCard'
import type { PlaceResult } from '@/types'

interface PlacesTabProps {
  lat: number
  lng: number
  onPlacesLoaded?: (hotels: PlaceResult[], restaurants: PlaceResult[]) => void
}

export default function PlacesTab({ lat, lng, onPlacesLoaded }: PlacesTabProps) {
  const [hotels, setHotels] = useState<PlaceResult[]>([])
  const [restaurants, setRestaurants] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(false)

    Promise.all([
      fetch(`/api/places?lat=${lat}&lng=${lng}&type=lodging`).then(r => r.json()),
      fetch(`/api/places?lat=${lat}&lng=${lng}&type=restaurant`).then(r => r.json())
    ])
      .then(([hotelsData, restaurantsData]) => {
        if (!isMounted) return
        
        if (hotelsData.error || restaurantsData.error) {
          setError(true)
        } else {
          const h = hotelsData.slice(0, 5) || []
          const r = restaurantsData.slice(0, 5) || []
          setHotels(h)
          setRestaurants(r)
          if (onPlacesLoaded) onPlacesLoaded(h, r)
        }
      })
      .catch((err) => {
        console.error(err)
        if (isMounted) setError(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [lat, lng])

  if (error) {
    return (
      <div className="p-6 text-sm text-[#8B7355] text-center border border-red-900/30 bg-red-900/10 rounded-xl m-4">
        Could not load places. Check your API key.
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
