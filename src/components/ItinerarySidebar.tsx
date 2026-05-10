'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { UserTier } from '@/types'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import ItineraryCard from '@/components/ItineraryCard'
import PlacesTab from '@/components/PlacesTab'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Itinerary, Location, PlaceResult } from '@/types'

interface ItinerarySidebarProps {
  itineraries: Itinerary[]
  selectedItinerary: Itinerary | null
  locations: Location[]
  selectedLocationId: string | undefined
  onItinerarySelect: (itinerary: Itinerary) => void
  onLocationSelect: (location: Location) => void
  onBack: () => void
  isLoadingLocations: boolean
  onTabChange?: (tab: 'stops' | 'places') => void
  onPlacesLoaded?: (hotels: PlaceResult[], restaurants: PlaceResult[]) => void
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
  showDayDivider = false,
  nextTransport = null,
  isLast = false,
}: {
  location: Location
  isSelected: boolean
  onSelect: () => void
  animationDelay?: number
  showDayDivider?: boolean
  nextTransport?: string | null
  isLast?: boolean
}) {
  const formatDuration = (mins: number | null) => {
    if (mins === null || mins === undefined) return null;
    if (mins < 60) return `${mins} min`;
    if (mins === 60) return '1 hr';
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (rem === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr ${rem} min`;
  };

  const getCategoryIcon = (cat: string | null) => {
    const className = "text-[#8B7355]";
    switch (cat?.toLowerCase()) {
      case 'landmark': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 10V21M8 10V21M12 10V21M16 10V21M19 10V21 M12 3L3 10h18L12 3z"/></svg>;
      case 'market': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
      case 'museum': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 21V9M15 21V9M3 9l9-6 9 6"/></svg>;
      case 'nature': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 014 13c0-4 4-9 8-11 4 2 8 7 8 11a7 7 0 01-7 7z"/><path d="M12 2v20"/></svg>;
      case 'food': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15 V2a5 5 0 00-5 5v6h3.5M16 21h5"/></svg>;
      case 'viewpoint': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
      case 'religious': return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M8 22h8M6 12a6 6 0 1012 0V5H6v7z"/></svg>;
      default: return <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    }
  };

  const getTransportIcon = (trans: string | null) => {
    if (!trans) return null;
    const t = trans.toLowerCase();
    const className = "text-[#8B7355]";
    if (t.includes('walk')) return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1"/><path d="M9 20l1-5 2 2 1-5M8 12l1-4 3 3 3-2"/></svg>;
    if (t.includes('taxi') || t.includes('car') || t.includes('4x4')) return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2M5 17a2 2 0 104 0M15 17a2 2 0 104 0"/></svg>;
    if (t.includes('bus') || t.includes('train')) return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M3 16h18M8 19l-1 2M16 19l1 2M9 10h6"/></svg>;
    if (t.includes('camel')) return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20v-4a4 4 0 014-4h1a3 3 0 003-3V7a2 2 0 012-2h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M8 20v-4M16 20v-3"/></svg>;
    return <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
  };

  const transportToNext = location.transport_to_next || nextTransport;

  return (
    <div className="flex flex-col">
      {showDayDivider && location.day_number && (
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#8B7355]/20" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B7355]">
            Day {location.day_number}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#8B7355]/20" />
        </div>
      )}
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px]">{getCategoryIcon(location.category)}</span>
              <h4
                className={`
                  text-[14px] font-medium leading-snug
                  transition-colors duration-300 truncate
                  ${isSelected ? 'text-[#F0E6D8]' : 'text-[#BFA882] group-hover:text-[#E8D5B7]'}
                `}
              >
                {location.name}
              </h4>
              {location.duration_minutes && (
                <span className="px-2 py-0.5 rounded-full bg-[#8B7355]/15 text-[#8B7355] text-[10px] font-medium whitespace-nowrap ml-auto">
                  {formatDuration(location.duration_minutes)}
                </span>
              )}
            </div>
            
            {location.best_time && (
              <p className="text-[10px] text-[#8B7355]/80 font-medium uppercase tracking-wider mt-1 mb-1.5">
                {location.best_time}
              </p>
            )}

            {location.description && (
              <p className="text-[12px] text-[#8B7355]/70 leading-relaxed line-clamp-2 mt-1">
                {location.description}
              </p>
            )}
            
            {location.tips && (
              <div className="flex items-start gap-1.5 mt-2.5">
                <svg className="flex-shrink-0 mt-0.5 text-[#8B7355]/70" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-[11px] italic text-[#8B7355]/80">
                  {location.tips}
                </p>
              </div>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              <path d="M9 10h1v4M13 10h2a1 1 0 010 2h-2v2h2"/>
            </svg>
          </div>
        </div>
      </button>

      {!isLast && (
        <div className="flex flex-col items-center justify-center my-1 min-h-[1.5rem]">
          {transportToNext ? (
            <div className="flex flex-col items-center">
              <div className="w-px h-2 border-l border-dashed border-[#8B7355]/30" />
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#8B7355]/70 my-1 bg-[#0F0D0A] px-2">
                <span>{getTransportIcon(transportToNext)}</span>
                <span>{transportToNext}</span>
                {location.transport_duration_minutes && (
                  <>
                    <span>·</span>
                    <span>{formatDuration(location.transport_duration_minutes)}</span>
                  </>
                )}
              </div>
              <div className="w-px h-2 border-l border-dashed border-[#8B7355]/30" />
            </div>
          ) : (
            <div className="w-px h-6 border-l border-dashed border-[#8B7355]/30" />
          )}
        </div>
      )}
    </div>
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
  onTabChange,
  onPlacesLoaded,
}: ItinerarySidebarProps) {
  const [activeTab, setActiveTab] = useState<'stops' | 'places'>('stops')
  const [userTier, setUserTier] = useState<UserTier>('explorer')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    async function fetchUserTier() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', user.id)
          .single()
        if (profile?.tier) {
          setUserTier(profile.tier as UserTier)
        }
      }
    }
    fetchUserTier()
  }, [])

  useEffect(() => {
    if (onTabChange) onTabChange(activeTab)
  }, [activeTab, onTabChange])

  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex flex-col h-full atlas-grain">
      {/* Sidebar top bar — logo + back */}
      <div className="flex-shrink-0 border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#C1440E]/30" />
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#C1440E]" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12" />
              <polygon fill="currentColor" stroke="none" points="12,5 14,12 12,10 10,12" />
              <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,19 10,12 12,14 14,12" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold tracking-wide text-[#F0E6D3]">
            Atlas<span className="text-[#C1440E] ml-0.5">360</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-[#8B7355]/60 hover:text-[#A89880] transition-all duration-200 group"
        >
          <svg className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
      </div>

      {/* Header area */}
      <div className="flex-shrink-0 p-6 pb-4 pt-5">
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
              <Link
                href={`/itinerary/${selectedItinerary.id}/magazine`}
                className="mt-4 inline-flex text-[10px] font-semibold uppercase tracking-widest text-[#C1440E] hover:text-[#D4622E] transition-colors"
              >
                Open Magazine View
              </Link>
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-[family-name:var(--font-cormorant)] text-[1.7rem] font-semibold text-[#F0E6D8] leading-tight tracking-wide">
                  Itineraries
                </h2>
                <p className="text-[13px] text-[#8B7355] mt-1.5">
                  Curated journeys through Morocco
                </p>
              </div>
              {userTier === 'elite' && (
                <Link
                  href="/compose"
                  className="text-xs text-[#C1440E] border border-[#C1440E]/30 hover:border-[#C1440E] hover:bg-[#C1440E]/10 px-3 py-1 rounded-sm transition-all duration-200"
                >
                  + Compose
                </Link>
              )}
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
          <>
            {/* Tabs */}
            <div className="flex items-center gap-2 px-4 mb-4">
              <button
                onClick={() => setActiveTab('stops')}
                className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'stops'
                    ? 'bg-[#C1440E] text-white shadow-md shadow-[#C1440E]/20 border border-[#C1440E]'
                    : 'bg-[#1A1610] text-[#8B7355] border border-[#E8D5B7]/10 hover:text-[#BFA882] hover:bg-[#231F18]'
                  }`}
              >
                Stops
              </button>
              <button
                onClick={() => setActiveTab('places')}
                className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'places'
                    ? 'bg-[#C1440E] text-white shadow-md shadow-[#C1440E]/20 border border-[#C1440E]'
                    : 'bg-[#1A1610] text-[#8B7355] border border-[#E8D5B7]/10 hover:text-[#BFA882] hover:bg-[#231F18]'
                  }`}
              >
                Places
              </button>
            </div>

            {isLoadingLocations ? (
              <SidebarSkeleton />
            ) : (
              activeTab === 'stops' ? (
                <div className="relative">
                  <div className="flex flex-col gap-1 px-4 pb-6">
                    {locations.map((location, i) => {
                      const prevLoc = locations[i - 1];
                      const nextLoc = locations[i + 1];
                      const showDayDivider = !prevLoc || prevLoc.day_number !== location.day_number;
                      const nextTransport = nextLoc ? nextLoc.transport : null;
                      
                      const isLocked = userTier === 'explorer' && (location.day_number || 1) > 1;

                      return (
                        <div key={location.id} className={isLocked ? 'opacity-30 blur-[2px] pointer-events-none select-none transition-all duration-500' : ''}>
                          <StopItem
                            location={location}
                            isSelected={selectedLocationId === location.id}
                            onSelect={() => onLocationSelect(location)}
                            animationDelay={i * 60}
                            showDayDivider={showDayDivider}
                            nextTransport={nextTransport}
                            isLast={!nextLoc}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* PDF Download Button */}
                  <div className="px-4 pb-2">
                    <PDFDownloadButton
                      stops={locations.map((l, i) => ({
                        name: l.name,
                        description: l.description || '',
                        category: l.category || '',
                        day_number: l.day_number || 1,
                        order_index: i,
                        duration_minutes: l.duration_minutes ?? null,
                        transport_to_next: l.transport_to_next ?? null,
                        transport_duration_minutes: l.transport_duration_minutes ?? null,
                        best_time: l.best_time ?? null,
                        tips: l.tips ?? null,
                        image_url: l.image_url ?? null,
                      }))}
                      title={selectedItinerary.title}
                      userEmail={userEmail}
                      tier={userTier}
                      coverImageUrl={selectedItinerary.cover_image_url}
                    />

                    <ReviewPanel
                      targetType="itinerary"
                      itineraryId={selectedItinerary.id}
                      title="Journey feedback"
                    />
                  </div>
                  
                  {/* Lock Overlay + CTA */}
                  {userTier === 'explorer' && locations.some(l => (l.day_number || 1) > 1) && (
                    <div className="absolute inset-x-0 bottom-0 top-[20%] flex flex-col items-center justify-center z-10 bg-gradient-to-t from-[#0F0D0A] via-[#0F0D0A]/90 to-transparent pointer-events-auto pb-10">
                      <div className="w-12 h-12 rounded-full bg-[#1A1610] border border-[#E8D5B7]/10 flex items-center justify-center mb-4 shadow-xl">
                        <svg className="w-5 h-5 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#F0E6D8] mb-2">
                        Unlock full itinerary
                      </h4>
                      <p className="text-[12px] text-[#8B7355] mb-5 max-w-[200px] text-center">
                        Subscribe to see all days, interactive maps, and detailed logistics.
                      </p>
                      <button
                        onClick={() => router.push('/pricing')}
                        className="px-6 py-2.5 rounded-full bg-[#C1440E] hover:bg-[#D4622E] text-white text-[11px] font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-[#C1440E]/20"
                      >
                        Unlock — 99 MAD/mo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                locations.length > 0 ? (
                  <PlacesTab
                    lat={locations[0].lat}
                    lng={locations[0].lng}
                    onPlacesLoaded={onPlacesLoaded}
                  />
                ) : (
                  <div className="p-4 text-sm text-[#8B7355]">
                    Places loading... (PlacesTab coming in Week 4)
                  </div>
                )
              )
            )}
          </>
        ) : itineraries.length === 0 ? (
          <EmptyState />
        ) : (
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
        )}
      </div>

      {/* Floating nav drawer */}
      <div className="absolute bottom-5 left-5 z-20">
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="w-9 h-9 rounded-sm bg-[#1A1814] border border-white/5 hover:border-[#C1440E]/30 flex items-center justify-center text-[#8B7355] hover:text-[#C1440E] transition-all duration-200 shadow-lg shadow-black/30"
          aria-label="Navigation menu"
        >
          {navOpen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
        </button>

        {navOpen && (
          <div className="absolute bottom-12 left-0 bg-[#1A1814] border border-white/5 rounded-sm shadow-xl shadow-black/40 py-2 px-1 min-w-[160px]">
            {[
              { href: '/', label: 'Home' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/destinations', label: 'Destinations' },
              { href: '/about', label: 'About' },
              { href: '/dashboard', label: 'My Account' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-[#8B7355] hover:text-[#F0E6D3] hover:bg-white/5 transition-all duration-200 rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F0D0A] to-transparent z-10" />
    </div>
  )
}

/* ─── Main Sidebar Export ─── */
export default function ItinerarySidebar(props: ItinerarySidebarProps) {
  const { selectedItinerary } = props
  const sidebarContentKey = selectedItinerary?.id || 'itinerary-list'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[400px] flex-shrink-0 h-full relative bg-[#0F0D0A] border-r border-[#E8D5B7]/6">
        <SidebarContent key={sidebarContentKey} {...props} />
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
              <SidebarContent key={sidebarContentKey} {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
