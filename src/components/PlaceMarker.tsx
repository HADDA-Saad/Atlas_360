'use client'

import { AdvancedMarker } from '@vis.gl/react-google-maps'
import type { PlaceResult, PlaceType } from '@/types'

interface PlaceMarkerProps {
  place: PlaceResult
  placeType: PlaceType
  onClick: (place: PlaceResult) => void
}

export default function PlaceMarker({ place, placeType, onClick }: PlaceMarkerProps) {
  const isHotel = placeType === 'lodging'
  const bgColor = isHotel ? '#3B82F6' : '#F59E0B'
  
  return (
    <AdvancedMarker
      position={{ lat: place.lat, lng: place.lng }}
      title={place.name}
      onClick={() => onClick(place)}
      zIndex={0}
    >
      <div className="relative group cursor-pointer">
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-[10px] whitespace-nowrap text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
          {place.name}
        </div>
        
        {/* Pin */}
        <div 
          className="w-5 h-5 rounded flex items-center justify-center shadow-md border border-border transform transition-transform group-hover:scale-110"
          style={{ backgroundColor: bgColor }}
        >
          {isHotel ? (
            <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          ) : (
            <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          )}
        </div>
      </div>
    </AdvancedMarker>
  )
}
