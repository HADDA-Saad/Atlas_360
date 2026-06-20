'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MapView from '@/components/MapView'
import GoogleMapsProvider from '@/components/GoogleMapsProvider'
import PanoramaModal from '@/components/PanoramaModal'
import StopPopupModal from '@/components/StopPopupModal'
import ItinerarySidebar from '@/components/ItinerarySidebar'
import MagazineSlideOver from '@/components/MagazineSlideOver'
import PlaceCard from '@/components/PlaceCard'
import type { Itinerary, Location, PlaceResult, UserTier } from '@/types'

const PANO_CAP = 3
const PANO_COUNT_KEY = 'atlas_pano_count'

interface AtlasAppProps {
  itineraries: Itinerary[]
  userTier: UserTier
}

export default function AtlasApp({ itineraries, userTier }: AtlasAppProps) {
  const router = useRouter()
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false)
  const [isStopPopupOpen, setIsStopPopupOpen] = useState(false)
  const [showPanoramaUpgrade, setShowPanoramaUpgrade] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [isPlacePopoverOpen, setIsPlacePopoverOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'stops' | 'places' | 'magazine'>('stops')
  const [hotels, setHotels] = useState<PlaceResult[]>([])
  const [restaurants, setRestaurants] = useState<PlaceResult[]>([])

  // Slide-over panel state
  const [isMagazineOpen, setIsMagazineOpen] = useState(false)

  const handleOpenMagazine = useCallback(() => {
    setIsMagazineOpen(true)
  }, [])

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

  // Handle marker click on map — open popup
  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedLocation(location)
    setIsStopPopupOpen(true)
  }, [])

  // Handle stop selection from sidebar — highlight + open popup
  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location)
    setIsStopPopupOpen(true)
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

  const handlePlaceMarkerClick = useCallback((place: PlaceResult) => {
    setSelectedPlace(place)
    setIsPlacePopoverOpen(true)
  }, [])

  const handlePlacesLoaded = useCallback((h: PlaceResult[], r: PlaceResult[]) => {
    setHotels(h)
    setRestaurants(r)
  }, [])

  return (
    <>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
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
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onPlacesLoaded={handlePlacesLoaded}
            reviewItineraryId={selectedItinerary?.id ?? null}
            onOpenMagazine={handleOpenMagazine}
          />

          {/* Map area */}
          <div className="flex-1 relative">
            {/* Map loading overlay */}
            {isLoadingLocations && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-500">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C1440E] animate-spin" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Loading stops...
                  </span>
                </div>
              </div>
            )}

            {/* Empty map state — no itinerary selected */}
            {!selectedItinerary && locations.length === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-[13px] text-muted-foreground/60 uppercase tracking-[0.2em]">
                    Select an itinerary to view on map
                  </p>
                </div>
              </div>
            )}

            <GoogleMapsProvider>
              <MapView
                locations={locations}
                onMarkerClick={handleMarkerClick}
                selectedLocationId={selectedLocation?.id}
                itineraryPath={locations.length > 0}
                onPlaceMarkerClick={handlePlaceMarkerClick}
                hotelPlaces={activeTab === 'places' ? hotels : []}
                restaurantPlaces={activeTab === 'places' ? restaurants : []}
              />
            </GoogleMapsProvider>
          </div>
        </div>

        {/* Place Popover Overlay */}
        {isPlacePopoverOpen && selectedPlace && (
          <div className="fixed bottom-4 right-4 z-[40] w-full max-w-[320px] bg-card border border-border rounded-xl shadow-2xl">
            <button 
              onClick={() => setIsPlacePopoverOpen(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary transition-colors p-1 z-10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-1 pt-6">
              <PlaceCard place={selectedPlace} type="lodging" />
            </div>
          </div>
        )}
      </div>

      {/* Panorama Modal — rendered completely outside the overflow-hidden layout
          as a sibling element via Fragment, so fixed positioning works correctly.
          Has its own GoogleMapsProvider so useMapsLibrary('streetView') resolves. */}
      <GoogleMapsProvider>
        <PanoramaModal
          location={selectedLocation}
          isOpen={isPanoramaOpen}
          onClose={handlePanoramaClose}
        />
      </GoogleMapsProvider>

      {/* Stop Popup Modal */}
      <StopPopupModal
        location={selectedLocation}
        isOpen={isStopPopupOpen}
        onClose={() => setIsStopPopupOpen(false)}
        onOpenPanorama={() => {
          setIsStopPopupOpen(false)
          if (userTier === 'explorer') {
            const count = parseInt(localStorage.getItem(PANO_COUNT_KEY) || '0', 10)
            if (count >= PANO_CAP) {
              setShowPanoramaUpgrade(true)
              return
            }
            localStorage.setItem(PANO_COUNT_KEY, String(count + 1))
          }
          setIsPanoramaOpen(true)
        }}
        onFindPlaces={() => {
          setIsStopPopupOpen(false)
          setActiveTab('places')
        }}
        totalStops={locations.length}
      />

      {/* Panorama upgrade prompt — shown when Explorer user hits 3-view lifetime cap */}
      {showPanoramaUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="relative bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <button
              onClick={() => setShowPanoramaUpgrade(false)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-2">
              360° views used up
            </h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              Free accounts get 3 panorama views lifetime. Upgrade to Nomad or Elite for unlimited 360° Street View access.
            </p>
            <button
              onClick={() => { setShowPanoramaUpgrade(false); router.push('/pricing') }}
              className="relative w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 overflow-hidden group/btn"
            >
              <span className="relative z-10">View plans</span>
              <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>
        </div>
      )}

      {/* Magazine Slide-Over */}
      {selectedItinerary && (
        <MagazineSlideOver
          isOpen={isMagazineOpen}
          onClose={() => setIsMagazineOpen(false)}
          itinerary={selectedItinerary}
          locations={locations}
          reviewItineraryId={selectedItinerary.id}
        />
      )}
    </>
  )
}
