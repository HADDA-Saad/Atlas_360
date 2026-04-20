'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Location } from '@/types'

interface PanoramaModalProps {
  location: Location | null
  isOpen: boolean
  onClose: () => void
}

export default function PanoramaModal({
  location,
  isOpen,
  onClose,
}: PanoramaModalProps) {
  const panoramaRef = useRef<HTMLDivElement>(null)
  const panoramaInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Ensure the Street View library is loaded
  const streetViewLib = useMapsLibrary('streetView')

  const cleanupPanorama = useCallback(() => {
    if (panoramaInstanceRef.current) {
      // Remove listeners and clean up
      google.maps.event.clearInstanceListeners(panoramaInstanceRef.current)
      panoramaInstanceRef.current.setVisible(false)
      panoramaInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !location || !panoramaRef.current || !streetViewLib) {
      return
    }

    // Reset states
    setError(null)
    setIsLoading(true)

    // Initialize Street View Panorama
    const panorama = new google.maps.StreetViewPanorama(panoramaRef.current, {
      position: { lat: location.lat, lng: location.lng },
      pov: { heading: 0, pitch: 0 },
      motionTracking: false,
      addressControl: false,
      fullscreenControl: true,
      linksControl: true,
      panControl: true,
      zoomControl: true,
      enableCloseButton: false,
    })

    panoramaInstanceRef.current = panorama

    // Listen for status changes to detect missing imagery
    const statusListener = panorama.addListener('status_changed', () => {
      const status = panorama.getStatus()
      if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
        setError('No 360° imagery available exactly here.')
        setIsLoading(false)
      } else if (status === google.maps.StreetViewStatus.OK) {
        setError(null)
        setIsLoading(false)
      }
    })

    // Fallback: if panorama loads successfully without status change
    const panoChangeListener = panorama.addListener('pano_changed', () => {
      setIsLoading(false)
      setError(null)
    })

    // Timeout fallback for loading state
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      clearTimeout(loadingTimeout)
      google.maps.event.removeListener(statusListener)
      google.maps.event.removeListener(panoChangeListener)
      cleanupPanorama()
    }
  }, [isOpen, location, streetViewLib, cleanupPanorama])

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanupPanorama()
      setError(null)
      setIsLoading(true)
    }
  }, [isOpen, cleanupPanorama])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden bg-[#0F0D0A] border-[#E8D5B7]/8">
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#F0E6D8] tracking-wide">
            {location?.name ?? 'Street View'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#8B7355]">
            360° Street View — drag to look around
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[70vh]">
          {/* Panorama container */}
          <div
            ref={panoramaRef}
            className="w-full h-full"
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F0D0A]/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#C1440E] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#8B7355]">Loading panorama...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F0D0A]/90 z-20">
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-[#1A1610] border border-[#E8D5B7]/8 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#8B7355]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
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
      </DialogContent>
    </Dialog>
  )
}
