'use client'

import { useEffect, useRef, useState } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import type { Location } from '@/types'

interface PanoramaModalProps {
  location: Location | null
  isOpen: boolean
  onClose: () => void
}

export default function PanoramaModal({ location, isOpen, onClose }: PanoramaModalProps) {
  const panoramaRef = useRef<HTMLDivElement>(null)
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const streetViewLib = useMapsLibrary('streetView')

  // 1. Initialize the StreetView instance exactly ONCE to prevent heavy recalculations
  useEffect(() => {
    if (!streetViewLib || !panoramaRef.current || panoramaInstanceRef.current) return

    // Create the persistent panorama instance
    const panorama = new streetViewLib.StreetViewPanorama(panoramaRef.current, {
      pov: { heading: 0, pitch: 0 },
      motionTracking: false,
      addressControl: false,
      fullscreenControl: true,
      linksControl: true,
      panControl: true,
      zoomControl: true,
      enableCloseButton: false,
      visible: false // Start hidden to prevent unnecessary tile loading
    })

    panoramaInstanceRef.current = panorama

    // Cleanup when component fully unmounts
    return () => {
      if (panoramaInstanceRef.current) {
        google.maps.event.clearInstanceListeners(panoramaInstanceRef.current)
      }
    }
  }, [streetViewLib])

  // 2. React to location or isOpen changes
  useEffect(() => {
    if (!isOpen) {
      if (panoramaInstanceRef.current) {
        panoramaInstanceRef.current.setVisible(false)
      }
      setIsLoading(false)
      return
    }
    
    if (!location || !panoramaInstanceRef.current || !streetViewLib) return

    setIsLoading(true)
    setError(null)
    panoramaInstanceRef.current.setVisible(true)

    // Force streetview to resize, helpful if it initialized when the container was scaled/hidden
    google.maps.event.trigger(panoramaInstanceRef.current, 'resize')

    const position = { lat: location.lat, lng: location.lng }
    
    const svs = new streetViewLib.StreetViewService()
    
    svs.getPanorama({ location: position, radius: 50 }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK && data && data.location && data.location.pano) {
        panoramaInstanceRef.current!.setPano(data.location.pano)
        panoramaInstanceRef.current!.setPov({ heading: 0, pitch: 0 })
        setError(null)
      } else {
        setError('No 360° imagery available exactly here.')
      }
      setIsLoading(false)
    })
  }, [location, isOpen, streetViewLib])

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <div
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6
        transition-all duration-300 ease-out
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
      `}
    >
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div
        className={`
          relative z-10 w-full max-w-5xl bg-[#0F0D0A] border border-[#E8D5B7]/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col
          transition-all duration-400 ease-out
          ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#E8D5B7]/5">
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#F0E6D8] tracking-wide m-0">
              {location?.name ?? 'Street View'}
            </h2>
            <p className="text-[13px] text-[#8B7355] mt-1 m-0">
              360° Street View — drag to look around
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8B7355] hover:text-[#E8D5B7] hover:bg-white/5 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="relative w-full h-[65vh] sm:h-[75vh]">
          {/* This is the persistent Street View container */}
          <div ref={panoramaRef} className="w-full h-full" />

          {/* Loading Overlay */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center bg-[#0F0D0A]/90 z-10
              transition-opacity duration-300 pointer-events-none
              ${isLoading ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-[#C1440E]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C1440E] animate-spin" />
              </div>
              <p className="text-[13px] uppercase tracking-[0.2em] text-[#8B7355]">Loading panorama...</p>
            </div>
          </div>

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F0D0A]/95 z-20">
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-[#1A1610] border border-[#E8D5B7]/8 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#F0E6D8] font-medium text-lg mb-1">
                    No Street View Available
                  </p>
                  <p className="text-[#8B7355] text-sm">
                    {error} Try a nearby spot!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
