'use client'

import { useState, useEffect } from 'react'
import ItineraryCard from '@/components/ItineraryCard'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Itinerary, Location } from '@/types'

interface ItinerarySidebarProps {
  itineraries: Itinerary[]
  selectedItinerary: Itinerary | null
  locations: Location[]
  selectedLocationId: string | undefined
  onItinerarySelect: (itinerary: Itinerary) => void
  onLocationSelect: (location: Location) => void
  onBack: () => void
  isLoadingLocations: boolean
}

/* ─── Loading Skeleton ─── */
function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 pt-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="atlas-stagger-item flex items-center gap-4"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-8 h-8 rounded-full atlas-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded atlas-shimmer w-3/4" />
            <div className="h-3 rounded atlas-shimmer w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center">
      {/* Animated compass SVG */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border border-[#C1440E]/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 flex items-center justify-center rounded-full border border-[#E8D5B7]/10 bg-[#1A1610]">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[#C1440E]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <polygon fill="currentColor" stroke="none" points="12,3 14,12 12,10 10,12" />
            <polygon fill="currentColor" stroke="none" opacity="0.25" points="12,21 10,12 12,14 14,12" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#F0E6D8] mb-2">
        Explore Morocco
      </h3>
      <p className="text-sm text-[#8B7355] leading-relaxed max-w-[240px]">
        Select an itinerary to begin your journey through Morocco&apos;s most iconic destinations.
      </p>
    </div>
  )
}

/* ─── Stop List Item ─── */
function StopItem({
  location,
  isSelected,
  onSelect,
  animationDelay = 0,
}: {
  location: Location
  isSelected: boolean
  onSelect: () => void
  animationDelay?: number
}) {
  return (
    <button
      onClick={onSelect}
      className="atlas-slide-item w-full text-left group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className={`
          flex items-start gap-4 p-4 rounded-xl
          transition-all duration-400 ease-out
          border
          ${isSelected
            ? 'bg-[#C1440E]/8 border-[#C1440E]/25'
            : 'bg-transparent border-transparent hover:bg-[#231F18]/60 hover:border-[#E8D5B7]/6'
          }
        `}
      >
        {/* Stop number */}
        <div
          className={`
            flex-shrink-0 w-9 h-9 rounded-full
            flex items-center justify-center
            text-sm font-semibold
            transition-all duration-400
            ${isSelected
              ? 'bg-[#C1440E] text-white shadow-md shadow-[#C1440E]/30'
              : 'bg-[#231F18] text-[#8B7355] border border-[#E8D5B7]/8 group-hover:border-[#C1440E]/30 group-hover:text-[#BFA882]'
            }
          `}
        >
          {location.order_index}
        </div>

        {/* Stop info */}
        <div className="flex-1 min-w-0 pt-1">
          <h4
            className={`
              text-[14px] font-medium leading-snug mb-1
              transition-colors duration-300
              ${isSelected ? 'text-[#F0E6D8]' : 'text-[#BFA882] group-hover:text-[#E8D5B7]'}
            `}
          >
            {location.name}
          </h4>
          {location.description && (
            <p className="text-[12px] text-[#8B7355]/70 leading-relaxed line-clamp-2">
              {location.description}
            </p>
          )}
        </div>

        {/* 360° indicator */}
        <div
          className={`
            flex-shrink-0 mt-1
            transition-all duration-300
            ${isSelected
              ? 'text-[#C1440E] scale-110'
              : 'text-[#8B7355]/40 group-hover:text-[#BFA882]/60'
            }
          `}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              d="M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20"
            />
            <ellipse cx="12" cy="12" rx="10" ry="4" />
          </svg>
        </div>
      </div>
    </button>
  )
}

/* ─── Sidebar Content ─── */
function SidebarContent({
  itineraries,
  selectedItinerary,
  locations,
  selectedLocationId,
  onItinerarySelect,
  onLocationSelect,
  onBack,
  isLoadingLocations,
}: ItinerarySidebarProps) {
  const [showContent, setShowContent] = useState(true)

  // Re-trigger animations on state change
  useEffect(() => {
    setShowContent(false)
    const timer = setTimeout(() => setShowContent(true), 50)
    return () => clearTimeout(timer)
  }, [selectedItinerary?.id])

  return (
    <div className="flex flex-col h-full atlas-grain">
      {/* Header area — pt-20 accounts for fixed navbar height */}
      <div className="flex-shrink-0 p-6 pb-4 pt-20">
        {selectedItinerary ? (
          <>
            {/* Back button */}
            <button
              onClick={onBack}
              className="
                flex items-center gap-2 mb-5
                text-[12px] font-medium uppercase tracking-[0.2em]
                text-[#8B7355] hover:text-[#BFA882]
                transition-colors duration-300
                group
              "
            >
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
              </svg>
              All Itineraries
            </button>

            {/* Selected itinerary header */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                {selectedItinerary.region && (
                  <span className="
                    px-2.5 py-0.5
                    text-[10px] font-semibold uppercase tracking-[0.15em]
                    rounded-full
                    bg-[#C1440E]/10 text-[#D4622E]
                    border border-[#C1440E]/15
                  ">
                    {selectedItinerary.region}
                  </span>
                )}
                {selectedItinerary.duration_days && (
                  <span className="text-[11px] text-[#8B7355]">
                    {selectedItinerary.duration_days} {selectedItinerary.duration_days === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-[#F0E6D8] tracking-wide leading-tight">
                {selectedItinerary.title}
              </h2>
              {selectedItinerary.description && (
                <p className="text-[13px] text-[#8B7355] leading-relaxed mt-2">
                  {selectedItinerary.description}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="mt-4 mb-1 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-[#C1440E]/20 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8B7355]/60">
                {locations.length} stops
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-[#C1440E]/20 to-transparent" />
            </div>
          </>
        ) : (
          <>
            {/* Main sidebar header */}
            <div className="mb-2">
              <h2 className="font-[family-name:var(--font-cormorant)] text-[1.7rem] font-semibold text-[#F0E6D8] leading-tight tracking-wide">
                Itineraries
              </h2>
              <p className="text-[13px] text-[#8B7355] mt-1.5">
                Curated journeys through Morocco
              </p>
            </div>

            {/* Subtle ornamental divider */}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-[#E8D5B7]/10 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-[#C1440E]/40" />
              <div className="h-px flex-1 bg-gradient-to-l from-[#E8D5B7]/10 to-transparent" />
            </div>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto atlas-scrollbar min-h-0">
        {selectedItinerary ? (
          isLoadingLocations ? (
            <SidebarSkeleton />
          ) : showContent ? (
            <div className="flex flex-col gap-1 px-4 pb-6">
              {locations.map((location, i) => (
                <StopItem
                  key={location.id}
                  location={location}
                  isSelected={selectedLocationId === location.id}
                  onSelect={() => onLocationSelect(location)}
                  animationDelay={i * 60}
                />
              ))}
            </div>
          ) : null
        ) : itineraries.length === 0 ? (
          <EmptyState />
        ) : showContent ? (
          <div className="flex flex-col gap-3 px-5 pb-6">
            {itineraries.map((itinerary, i) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                isSelected={false}
                onClick={() => onItinerarySelect(itinerary)}
                animationDelay={i * 100}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F0D0A] to-transparent z-10" />
    </div>
  )
}

/* ─── Main Sidebar Export ─── */
export default function ItinerarySidebar(props: ItinerarySidebarProps) {
  const { selectedItinerary } = props

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[400px] flex-shrink-0 h-full relative bg-[#0F0D0A] border-r border-[#E8D5B7]/6">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <Sheet>
          <SheetTrigger
            className="
              w-full flex items-center justify-between
              px-5 py-3.5
              bg-[#1A1610]/95 backdrop-blur-xl
              border border-[#E8D5B7]/10
              rounded-2xl shadow-2xl shadow-black/40
              text-left
              group
              hover:border-[#C1440E]/20
              transition-all duration-300
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C1440E]/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#C1440E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <polygon fill="currentColor" stroke="none" points="12,3 14,12 12,10 10,12" />
                  <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,21 10,12 12,14 14,12" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-[#F0E6D8] block leading-tight">
                  {selectedItinerary ? selectedItinerary.title : 'Browse Itineraries'}
                </span>
                <span className="text-[11px] text-[#8B7355]">
                  {selectedItinerary
                    ? `${selectedItinerary.region} · ${selectedItinerary.duration_days}d`
                    : 'Discover Morocco'
                  }
                </span>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-[#8B7355] group-hover:text-[#BFA882] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="
              h-[75vh] rounded-t-3xl
              !bg-[#0F0D0A] !border-[#E8D5B7]/8
              p-0
            "
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Itineraries</SheetTitle>
            </SheetHeader>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E8D5B7]/15" />
            </div>
            <div className="h-[calc(75vh-40px)] overflow-hidden">
              <SidebarContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
