'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import MarkerPin from '@/components/MarkerPin'
import type { Location } from '@/types'

interface MapViewProps {
  locations: Location[]
  onMarkerClick: (location: Location) => void
  selectedLocationId?: string
  itineraryPath?: boolean
}

export default function MapView({
  locations,
  onMarkerClick,
  selectedLocationId,
  itineraryPath = false,
}: MapViewProps) {
  const map = useMap('atlas360-map')
  const polylineRef = useRef<google.maps.Polyline | null>(null)

  // Sort locations by order_index for polyline drawing
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.order_index - b.order_index),
    [locations]
  )

  // Draw polyline connecting markers when itineraryPath is true
  useEffect(() => {
    if (!map) return

    // Clean up existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }

    if (itineraryPath && sortedLocations.length > 1) {
      const path = sortedLocations.map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
      }))

      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#C1440E',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map,
      })
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
        polylineRef.current = null
      }
    }
  }, [map, itineraryPath, sortedLocations])

  // Fly to selected location when it changes
  useEffect(() => {
    if (!map || !selectedLocationId) return

    const selectedLocation = locations.find((loc) => loc.id === selectedLocationId)
    if (selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      map.setZoom(15)
    }
  }, [map, selectedLocationId, locations])

  // Fit map bounds when itinerary is selected (locations load) but no specific location is selected
  useEffect(() => {
    if (!map || locations.length === 0 || selectedLocationId) return

    const bounds = new window.google.maps.LatLngBounds()
    locations.forEach((loc) => {
      bounds.extend({ lat: loc.lat, lng: loc.lng })
    })

    if (locations.length === 1) {
      map.panTo({ lat: locations[0].lat, lng: locations[0].lng })
      map.setZoom(12)
    } else {
      map.fitBounds(bounds, 100)
    }
  }, [map, locations, selectedLocationId])

  const handleMarkerClick = useCallback(
    (location: Location) => {
      onMarkerClick(location)
    },
    [onMarkerClick]
  )

  const [mapTypeId, setMapTypeId] = useState<string>('roadmap')

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapTypeId)
    }
  }, [map, mapTypeId])

  return (
    <div className="relative w-full h-full">
      {/* Map Type Toggle */}
      <div className="absolute top-24 right-4 z-10 bg-[#0F0D0A]/90 backdrop-blur-md border border-[#C1440E]/30 rounded-lg p-1 flex shadow-lg">
        <button 
          onClick={() => setMapTypeId('roadmap')}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${mapTypeId === 'roadmap' ? 'bg-[#C1440E] text-white' : 'text-[#F0E6D8]/60 hover:text-[#C1440E]'}`}
        >
          Map
        </button>
        <button 
          onClick={() => setMapTypeId('hybrid')}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors ${mapTypeId === 'hybrid' ? 'bg-[#C1440E] text-white' : 'text-[#F0E6D8]/60 hover:text-[#C1440E]'}`}
        >
          Satellite
        </button>
      </div>

      <Map
        id="atlas360-map"
        mapId="DEMO_MAP_ID"
        defaultCenter={{ lat: 31.7917, lng: -7.0926 }}
        defaultZoom={6}
        mapTypeId={mapTypeId}
        gestureHandling="greedy"
        disableDefaultUI={true}
        clickableIcons={false}
        className="w-full h-full"
      >
        {sortedLocations.map((location) => (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
            onClick={() => handleMarkerClick(location)}
            zIndex={selectedLocationId === location.id ? 10 : 1}
          >
            <MarkerPin
              isSelected={selectedLocationId === location.id}
              label={location.name}
              index={location.order_index}
            />
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  )
}
