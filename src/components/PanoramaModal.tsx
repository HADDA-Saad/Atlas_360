'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  // Controls whether the panorama container is actually mounted in the DOM
  const [showContent, setShowContent] = useState(false)

  const streetViewLib = useMapsLibrary('streetView')

  // Destroy panorama completely
  const destroyPanorama = useCallback(() => {
    if (panoramaInstanceRef.current) {
      try {
        google.maps.event.clearInstanceListeners(panoramaInstanceRef.current)
      } catch { /* already cleaned up */ }
      panoramaInstanceRef.current = null
    }
  }, [])

  // When modal opens: delay-mount the content so the CSS transition completes first
  // When modal closes: destroy immediately, then unmount content
  useEffect(() => {
    let active = true
    if (isOpen) {
      // Mount the container after a tick so the modal wrapper is visible first
      const t = setTimeout(() => {
        if (active) setShowContent(true)
      }, 50)
      return () => {
        active = false
        clearTimeout(t)
      }
    } else {
      destroyPanorama()
      Promise.resolve().then(() => {
        if (active) {
          setShowContent(false)
          setError(null)
          setIsLoading(false)
        }
      })
    }
    return () => {
      active = false
    }
  }, [isOpen, destroyPanorama])

  // When content is mounted AND we have location + library → create panorama
  useEffect(() => {
    if (!showContent || !isOpen || !location || !streetViewLib) return
    // Wait for the container ref to be available (next frame after mount)
    const initTimer = requestAnimationFrame(() => {
      const container = panoramaRef.current
      if (!container) return

      setIsLoading(true)
      setError(null)
      destroyPanorama()

      // Wait for the modal's CSS transition to fully finish (400ms transition)
      // so the container has its final size before Google Maps measures it
      const createTimer = setTimeout(() => {
        if (!panoramaRef.current) return

        const pano = new streetViewLib.StreetViewPanorama(panoramaRef.current, {
          pov: { heading: 0, pitch: 0 },
          motionTracking: false,
          addressControl: false,
          fullscreenControl: true,
          linksControl: true,
          panControl: true,
          zoomControl: true,
          enableCloseButton: false,
          visible: false, // Start hidden — only show after tiles are ready
        })
        panoramaInstanceRef.current = pano

        const position = { lat: location.lat, lng: location.lng }
        const svs = new streetViewLib.StreetViewService()

        svs.getPanorama({ location: position, radius: 50 }, (data, status) => {
          if (
            status === google.maps.StreetViewStatus.OK &&
            data?.location?.pano
          ) {
            pano.setPano(data.location.pano)
            pano.setPov({ heading: 0, pitch: 0 })
            pano.setVisible(true)

            // Fire multiple resize events to guarantee tile rendering.
            // The first fires immediately, the second after a short delay
            // to catch any remaining layout shifts.
            google.maps.event.trigger(pano, 'resize')
            setTimeout(() => {
              if (panoramaInstanceRef.current) {
                google.maps.event.trigger(panoramaInstanceRef.current, 'resize')
              }
            }, 300)

            setError(null)
          } else {
            setError('No 360° imagery available exactly here.')
          }
          setIsLoading(false)
        })
      }, 450) // Wait for CSS transition to finish (400ms) + small buffer

      return () => clearTimeout(createTimer)
    })

    return () => cancelAnimationFrame(initTimer)
  }, [showContent, isOpen, location, streetViewLib, destroyPanorama])

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyPanorama()
  }, [destroyPanorama])

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
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
        className="absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div
        className={`
          relative z-10 w-full max-w-5xl bg-background border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col
          transition-all duration-400 ease-out
          ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground tracking-wide m-0">
              {location?.name ?? 'Street View'}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1 m-0">
              360° Street View — drag to look around
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="relative w-full h-[65vh] sm:h-[75vh] bg-[#1a1a1a]">
          {/* 
            The panorama container is only mounted when showContent is true.
            This ensures Google Maps creates the panorama AFTER the modal is 
            visible and the container has its actual dimensions.
          */}
          {showContent && (
            <div
              ref={panoramaRef}
              className="absolute inset-0 w-full h-full"
              style={{ minHeight: '300px' }}
            />
          )}

          {/* Loading Overlay */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center bg-background/90 z-10
              transition-opacity duration-300 pointer-events-none
              ${isLoading || !showContent ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C1440E] animate-spin" />
              </div>
              <p className="text-[13px] uppercase tracking-[0.2em] text-muted-foreground">Loading panorama...</p>
            </div>
          </div>

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-20">
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-foreground font-medium text-lg mb-1">
                    No Street View Available
                  </p>
                  <p className="text-muted-foreground text-sm">
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
