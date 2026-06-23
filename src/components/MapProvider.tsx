'use client'

import AtlasApp from '@/components/AtlasApp'
import type { Itinerary, UserTier } from '@/types'

interface MapProviderProps {
  itineraries: Itinerary[]
  userTier: UserTier
}

export default function MapProvider({ itineraries, userTier }: MapProviderProps) {
  return <AtlasApp itineraries={itineraries} userTier={userTier} />
}
