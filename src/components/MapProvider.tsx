'use client'

import { APIProvider } from '@vis.gl/react-google-maps'
import AtlasApp from '@/components/AtlasApp'
import type { Itinerary } from '@/types'

interface MapProviderProps {
  itineraries: Itinerary[]
}

export default function MapProvider({ itineraries }: MapProviderProps) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <AtlasApp itineraries={itineraries} />
    </APIProvider>
  )
}
