'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
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

  const handleMarkerClick = useCallback(
    (location: Location) => {
      onMarkerClick(location)
    },
    [onMarkerClick]
  )

  return (
    <Map
      id="atlas360-map"
      defaultCenter={{ lat: 31.7917, lng: -7.0926 }}
      defaultZoom={6}
      mapId="atlas360-map"
      mapTypeId="roadmap"
      gestureHandling="greedy"
      disableDefaultUI={false}
      clickableIcons={false}
      className="w-full h-full"
    >
      {sortedLocations.map((location) => (
        <AdvancedMarker
          key={location.id}
          position={{ lat: location.lat, lng: location.lng }}
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
  )
}
