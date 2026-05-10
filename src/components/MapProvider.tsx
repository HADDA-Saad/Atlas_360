'use client'

import AtlasApp from '@/components/AtlasApp'
import type { Itinerary } from '@/types'

interface MapProviderProps {
  itineraries: Itinerary[]
}

export default function MapProvider({ itineraries }: MapProviderProps) {
  return <AtlasApp itineraries={itineraries} />
}
