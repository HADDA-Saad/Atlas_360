'use client'

import { useState, useCallback } from 'react'
import MapView from '@/components/MapView'
import PanoramaModal from '@/components/PanoramaModal'
import ItinerarySidebar from '@/components/ItinerarySidebar'
import type { Itinerary, Location } from '@/types'

interface AtlasAppProps {
  itineraries: Itinerary[]
}

export default function AtlasApp({ itineraries }: AtlasAppProps) {
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)

  // Fetch locations when an itinerary is selected
  const handleItinerarySelect = useCallback(async (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setSelectedLocation(null)
    setIsLoadingLocations(true)

    try {
      const response = await fetch(`/api/itineraries/${itinerary.id}/locations`)
      if (!response.ok) throw new Error('Failed to fetch locations')
      const data: Location[] = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([])
    } finally {
      setIsLoadingLocations(false)
    }
  }, [])

  // Handle marker click on map — open panorama
  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location)
    setIsPanoramaOpen(true)
  }, [])

  // Handle stop selection from sidebar — highlight + open panorama
  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location)
    setIsPanoramaOpen(true)
  }, [])

  // Go back to itinerary list
  const handleBack = useCallback(() => {
    setSelectedItinerary(null)
    setLocations([])
    setSelectedLocation(null)
  }, [])

  // Close panorama — keep marker highlighted
  const handlePanoramaClose = useCallback(() => {
    setIsPanoramaOpen(false)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0F0D0A]">
      {/* Main content: sidebar + map */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <ItinerarySidebar
          itineraries={itineraries}
          selectedItinerary={selectedItinerary}
          locations={locations}
          selectedLocationId={selectedLocation?.id}
          onItinerarySelect={handleItinerarySelect}
          onLocationSelect={handleLocationSelect}
          onBack={handleBack}
          isLoadingLocations={isLoadingLocations}
        />

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Map loading overlay */}
          {isLoadingLocations && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0F0D0A]/60 backdrop-blur-sm transition-opacity duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-[#C1440E]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C1440E] animate-spin" />
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8B7355]">
                  Loading stops...
                </span>
              </div>
            </div>
          )}

          {/* Empty map state — no itinerary selected */}
          {!selectedItinerary && locations.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-[13px] text-[#8B7355]/60 uppercase tracking-[0.2em]">
                  Select an itinerary to view on map
                </p>
              </div>
            </div>
          )}

          <MapView
            locations={locations}
            onMarkerClick={handleMarkerClick}
            selectedLocationId={selectedLocation?.id}
            itineraryPath={locations.length > 0}
          />
        </div>
      </div>

      {/* Panorama Modal */}
      <PanoramaModal
        location={selectedLocation}
        isOpen={isPanoramaOpen}
        onClose={handlePanoramaClose}
      />
    </div>
  )
}
