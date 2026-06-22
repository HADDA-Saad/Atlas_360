'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { UserTier } from '@/types'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import ForkItineraryButton from '@/components/ForkItineraryButton'
import ItineraryCard from '@/components/ItineraryCard'
import PlacesTab from '@/components/PlacesTab'
import WeatherWidget from '@/components/WeatherWidget'
import AssistanceRequestForm from '@/components/assistance/AssistanceRequestForm'
import GuideMatchWidget from '@/components/assistance/GuideMatchWidget'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { Itinerary, Location, PlaceResult } from '@/types'

interface UserCustomItinerary {
  id: string
  title: string
  is_public: boolean | null
  created_at: string
}

interface ItinerarySidebarProps {
  itineraries: Itinerary[]
  selectedItinerary: Itinerary | null
  locations: Location[]
  selectedLocationId: string | undefined
  onItinerarySelect: (itinerary: Itinerary) => void
  onLocationSelect: (location: Location) => void
  onBack: () => void
  isLoadingLocations: boolean
  activeTab?: 'stops' | 'places' | 'magazine'
  onTabChange?: (tab: 'stops' | 'places' | 'magazine') => void
  onPlacesLoaded?: (hotels: PlaceResult[], restaurants: PlaceResult[]) => void
  reviewItineraryId?: string | null
  onOpenMagazine?: () => void
  onAIGenerated?: (itinerary: Itinerary, stops: Location[]) => void
  onSaveAITrip?: () => void
  isSavingAITrip?: boolean
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
    const className = "text-muted-foreground";
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
    const className = "text-muted-foreground";
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
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-muted-foreground/20" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Day {location.day_number}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-muted-foreground/20" />
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
              ? 'bg-primary/8 border-primary/25'
              : 'bg-transparent border-transparent hover:bg-muted/60 hover:border-border'
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
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                : 'bg-muted text-muted-foreground border border-border group-hover:border-primary/30 group-hover:text-muted-foreground'
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
                  ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                `}
              >
                {location.name}
              </h4>
              {location.duration_minutes && (
                <span className="px-2 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground text-[10px] font-medium whitespace-nowrap ml-auto">
                  {formatDuration(location.duration_minutes)}
                </span>
              )}
            </div>
            
            {location.best_time && (
              <p className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wider mt-1 mb-1.5">
                {location.best_time}
              </p>
            )}

            {location.description && (
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed line-clamp-2 mt-1">
                {location.description}
              </p>
            )}
            
            {location.tips && (
              <div className="flex items-start gap-1.5 mt-2.5">
                <svg className="flex-shrink-0 mt-0.5 text-muted-foreground/70" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-[11px] italic text-muted-foreground/80">
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
                ? 'text-primary scale-110'
                : 'text-muted-foreground/40 group-hover:text-muted-foreground/60'
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
              <div className="w-px h-2 border-l border-dashed border-muted-foreground/30" />
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 my-1 bg-background px-2">
                <span>{getTransportIcon(transportToNext)}</span>
                <span>{transportToNext}</span>
                {location.transport_duration_minutes && (
                  <>
                    <span>·</span>
                    <span>{formatDuration(location.transport_duration_minutes)}</span>
                  </>
                )}
              </div>
              <div className="w-px h-2 border-l border-dashed border-muted-foreground/30" />
            </div>
          ) : (
            <div className="w-px h-6 border-l border-dashed border-muted-foreground/30" />
          )}
        </div>
      )}
    </div>
  )
}

const FALLBACK_IMAGES = ['/Images/jame3.png', '/Images/riad.png', '/Images/sea.png', '/Images/spices.png', '/Images/Zellige.png']
function getFallbackImage(index: number, category?: string | null) {
  if (category) {
    const cat = category.toLowerCase()
    if (cat.includes('market') || cat.includes('food') || cat.includes('shopping') || cat.includes('spices')) {
      return '/Images/spices.png'
    }
    if (cat.includes('riad') || cat.includes('lodging') || cat.includes('hotel') || cat.includes('stay')) {
      return '/Images/riad.png'
    }
    if (cat.includes('nature') || cat.includes('peaks') || cat.includes('desert') || cat.includes('sea') || cat.includes('mountain') || cat.includes('canyon')) {
      return '/Images/sea.png'
    }
    if (cat.includes('museum') || cat.includes('culture') || cat.includes('monument') || cat.includes('history') || cat.includes('kasbah')) {
      return '/Images/Zellige.png'
    }
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

function formatDurationMag(mins: number | null) {
  if (!mins) return null
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hr ${rem} min`
}

/* ─── Magazine Tab Panel ─── */
function MagazinePanel({
  locations,
  itinerary,
  reviewItineraryId,
}: {
  locations: Location[]
  itinerary: Itinerary
  reviewItineraryId?: string | null
}) {
  const groupedByDay = locations.reduce<Record<number, { location: Location; globalIndex: number }[]>>(
    (acc, loc, globalIdx) => {
      const day = loc.day_number ?? 1
      if (!acc[day]) acc[day] = []
      acc[day].push({ location: loc, globalIndex: globalIdx })
      return acc
    },
    {},
  )
  const dayNumbers = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b)

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center">
        <p className="text-sm text-muted-foreground">No stops to display.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 pb-6">
      {/* Header strip */}
      <div className="px-5 pt-4 pb-5 border-b border-border">
        <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-primary mb-1">Atlas 360 Travel Book</p>
        <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground leading-tight">
          {itinerary.title}
        </h3>
        {itinerary.description && (
          <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed line-clamp-3">{itinerary.description}</p>
        )}
        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-border/60">
          <div className="px-3 py-2">
            <span className="block font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">{dayNumbers.length}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Days</span>
          </div>
          <div className="border-x border-border/60 px-3 py-2">
            <span className="block font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">{locations.length}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Stops</span>
          </div>
          <div className="px-3 py-2">
            <span className="block font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">{locations.filter(l => Boolean(l.image_url)).length}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Photos</span>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="px-5 pt-5 space-y-10">
        {dayNumbers.map((dayNum) => (
          <section key={dayNum}>
            {/* Day heading */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary whitespace-nowrap">Day {dayNum}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <div className="space-y-7">
              {groupedByDay[dayNum].map(({ location, globalIndex }) => {
                const duration = formatDurationMag(location.duration_minutes)
                const image = location.image_url || getFallbackImage(globalIndex, location.category)

                return (
                  <article key={location.id} className="flex flex-col gap-3 border-b border-border pb-7 last:border-0">
                    {/* Image */}
                    <div className="overflow-hidden rounded-lg border border-border/60 bg-card aspect-[16/9] relative w-full">
                      <Image src={image} alt={location.name} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                    </div>

                    {/* Meta chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground flex-shrink-0">
                        {globalIndex + 1}
                      </span>
                      {location.category && (
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{location.category}</span>
                      )}
                      {duration && (
                        <span className="rounded-sm bg-muted-foreground/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{duration}</span>
                      )}
                      {location.best_time && (
                        <span className="rounded-sm bg-card border border-border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{location.best_time}</span>
                      )}
                    </div>

                    {/* Name + description */}
                    <div>
                      <h4 className="font-[family-name:var(--font-cormorant)] text-[1.4rem] font-semibold text-foreground leading-tight">
                        {location.name}
                      </h4>
                      {location.description && (
                        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{location.description}</p>
                      )}
                    </div>

                    {/* Tips + transfer cards */}
                    {(location.tips || location.transport_to_next) && (
                      <div className="grid gap-2 grid-cols-1">
                        {location.tips && (
                          <div className="rounded-lg border border-border bg-card/60 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-primary">Tip</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{location.tips}</p>
                          </div>
                        )}
                        {location.transport_to_next && (
                          <div className="rounded-lg border border-border bg-card/60 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-widest text-primary">Next transfer</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                              {location.transport_to_next}
                              {location.transport_duration_minutes ? ` · ${formatDurationMag(location.transport_duration_minutes)}` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        ))}

        {/* Review panel for curated itineraries */}
        {reviewItineraryId && (
          <div className="pt-2">
            <ReviewPanel
              targetType="itinerary"
              itineraryId={reviewItineraryId}
              title="Journey feedback"
            />
          </div>
        )}

        {/* Planning assistance CTA */}
        <div className="pt-4">
          <AssistanceRequestForm
            requestType="planning"
            title="Need help planning?"
            description="Get personalized transport, timing, and booking advice from our team."
            itineraryId={reviewItineraryId}
            sourcePath={`/explore?itinerary=${reviewItineraryId || ''}`}
            compact
          />
        </div>
      </div>
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
  activeTab = 'stops',
  onTabChange,
  onPlacesLoaded,
  reviewItineraryId,
  onOpenMagazine,
  onAIGenerated,
  onSaveAITrip,
  isSavingAITrip,
}: ItinerarySidebarProps) {
  const [userTier, setUserTier] = useState<UserTier>('explorer')
  const [userEmail, setUserEmail] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const [myTrips, setMyTrips] = useState<UserCustomItinerary[]>([])
  const [myTripsExpanded, setMyTripsExpanded] = useState(false)
  const router = useRouter()

  // AI Planner state
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGenerationsCount, setAiGenerationsCount] = useState(0)
  const [aiError, setAiError] = useState('')

  // Filtering & Sorting State
  const [search, setSearch] = useState('')
  const [durationFilter, setDurationFilter] = useState('Any duration')
  const [sort, setSort] = useState('Default')
  const [ratings, setRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    const supabase = createClient()
    async function fetchUserTier() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier, ai_generations_count, role')
          .eq('id', user.id)
          .single()
        if (profile) {
          if (profile.role === 'admin') {
            setUserTier('elite')
          } else if (profile.tier) {
            setUserTier(profile.tier as UserTier)
          }
          if (profile.ai_generations_count !== undefined && profile.ai_generations_count !== null) {
            setAiGenerationsCount(profile.ai_generations_count)
          }
        }
      }
    }
    
    async function fetchRatings() {
      try {
        const res = await fetch('/api/itineraries/ratings')
        if (res.ok) {
          const data = await res.json()
          const ratingsMap = data.reduce((acc: Record<string, number>, curr: { itinerary_id: string; average: number }) => ({ ...acc, [curr.itinerary_id]: curr.average }), {} as Record<string, number>)
          setRatings(ratingsMap)
        }
      } catch (err) {
        console.error('Failed to fetch ratings', err)
      }
    }

    async function fetchMyTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('user_itineraries')
          .select('id, title, is_public, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (data) setMyTrips(data as UserCustomItinerary[])
      } catch (err) {
        console.error('Failed to fetch my trips', err)
      }
    }

    fetchUserTier()
    fetchRatings()
    fetchMyTrips()
  }, [])

  const filteredItineraries = itineraries.filter(it => {
    if (search && !it.title.toLowerCase().includes(search.toLowerCase()) && !(it.description || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (durationFilter !== 'Any duration') {
      const days = it.duration_days || 0;
      if (durationFilter === '1 day' && days !== 1) return false;
      if (durationFilter === '2–3 days' && (days < 2 || days > 3)) return false;
      if (durationFilter === '4–5 days' && (days < 4 || days > 5)) return false;
      if (durationFilter === '6+ days' && days < 6) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'Best reviewed') return (ratings[b.id] || 0) - (ratings[a.id] || 0)
    if (sort === 'Shortest first') return (a.duration_days || 0) - (b.duration_days || 0)
    if (sort === 'Longest first') return (b.duration_days || 0) - (a.duration_days || 0)
    if (sort === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0 // Default
  })

  return (
    <div className="flex flex-col h-full atlas-grain">
      {/* Sidebar top bar — logo + back */}
      <div className="flex-shrink-0 border-b border-border px-5 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-primary/30" />
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12" />
              <polygon fill="currentColor" stroke="none" points="12,5 14,12 12,10 10,12" />
              <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,19 10,12 12,14 14,12" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold tracking-wide text-foreground">
            Atlas<span className="text-primary ml-0.5">360</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-all duration-200 group"
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
                text-muted-foreground hover:text-muted-foreground
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
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {selectedItinerary.region && (
                  <span className="
                    px-2.5 py-0.5
                    text-[10px] font-semibold uppercase tracking-[0.15em]
                    rounded-full
                    bg-primary/10 text-[#D4622E]
                    border border-primary/15
                  ">
                    {selectedItinerary.region}
                  </span>
                )}
                {selectedItinerary.duration_days && (
                  <span className="text-[11px] text-muted-foreground mr-auto">
                    {selectedItinerary.duration_days} {selectedItinerary.duration_days === 1 ? 'day' : 'days'}
                  </span>
                )}
                
                <WeatherWidget city={
                  ['Marrakech', 'Casablanca', 'Fes', 'Rabat', 'Tangier', 'Essaouira', 'Chefchaouen', 'Ouarzazate', 'Agadir', 'Zagora', 'Merzouga']
                    .find(c => selectedItinerary.title.toLowerCase().includes(c.toLowerCase())) || 'Marrakech'
                } />
              </div>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground tracking-wide leading-tight">
                {selectedItinerary.title}
              </h2>
              {selectedItinerary.description && (
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-2">
                  {selectedItinerary.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => onOpenMagazine?.()}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  </svg>
                  Open Travel Book
                </button>
                {selectedItinerary.id !== 'ai-generated' && userTier === 'elite' && (
                  <ForkItineraryButton
                    itineraryId={selectedItinerary.id}
                    itineraryTitle={selectedItinerary.title}
                  />
                )}
              </div>
            </div>

            {/* Guide Match Widget */}
            {selectedItinerary.id !== 'ai-generated' && (
              <div className="mt-4">
                <GuideMatchWidget region={selectedItinerary.region} itineraryId={selectedItinerary.id} />
              </div>
            )}

            {/* Divider */}
            <div className="mt-4 mb-1 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-[#C1440E]/20 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                {locations.length} stops
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-[#C1440E]/20 to-transparent" />
            </div>
          </>
        ) : isAiPlannerOpen ? (
          <>
            {/* AI Assistant header */}
            <button
              onClick={() => {
                setIsAiPlannerOpen(false)
                setAiError('')
              }}
              className="
                flex items-center gap-2 mb-5
                text-[12px] font-medium uppercase tracking-[0.2em]
                text-muted-foreground hover:text-muted-foreground
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
              Back to Browse
            </button>

            <h2 className="font-[family-name:var(--font-cormorant)] text-[1.7rem] font-semibold text-foreground leading-tight tracking-wide">
              AI Assistant
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1.5">
              Let AI plan your custom Moroccan adventure
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </div>
          </>
        ) : (
          <>
            {/* Main sidebar header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-[family-name:var(--font-cormorant)] text-[1.7rem] font-semibold text-foreground leading-tight tracking-wide">
                  Itineraries
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1.5">
                  Curated journeys through Morocco
                </p>
              </div>
              {userTier === 'elite' && (
                <Link
                  href="/compose"
                  className="text-xs text-primary border border-primary/30 hover:border-primary hover:bg-primary/10 px-3 py-1 rounded-sm transition-all duration-200"
                >
                  + Compose
                </Link>
              )}
            </div>

            {/* AI Trip Planner trigger button */}
            <button
              onClick={() => setIsAiPlannerOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-[11px] font-bold uppercase tracking-widest transition-all duration-250 cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <polygon fill="currentColor" stroke="none" points="12,3 14,12 12,10 10,12" />
                <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,21 10,12 12,14 14,12" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
              Plan with AI Assistant
            </button>

            {/* Subtle ornamental divider */}
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
            </div>

            {/* Filters UI */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm w-full focus:border-primary/50 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 pr-8 py-2 text-[11px] uppercase tracking-widest font-semibold appearance-none cursor-pointer focus:border-primary/50 outline-none flex-1 min-w-[120px]"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                  <option>Any duration</option>
                  <option>1 day</option>
                  <option>2–3 days</option>
                  <option>4–5 days</option>
                  <option>6+ days</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 pr-8 py-2 text-[11px] uppercase tracking-widest font-semibold appearance-none cursor-pointer focus:border-primary/50 outline-none flex-1 min-w-[120px]"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                  <option>Default</option>
                  <option>Best reviewed</option>
                  <option>Shortest first</option>
                  <option>Longest first</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto atlas-scrollbar min-h-0">
        {selectedItinerary ? (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1.5 px-4 mb-4">
              <button
                onClick={() => onTabChange?.('stops')}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'stops'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary'
                    : 'bg-card text-muted-foreground border border-border hover:text-muted-foreground hover:bg-muted'
                  }`}
              >
                Stops
              </button>
              <button
                onClick={() => onTabChange?.('places')}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'places'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary'
                    : 'bg-card text-muted-foreground border border-border hover:text-muted-foreground hover:bg-muted'
                  }`}
              >
                Places
              </button>
              <button
                onClick={() => onTabChange?.('magazine')}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'magazine'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary'
                    : 'bg-card text-muted-foreground border border-border hover:text-muted-foreground hover:bg-muted'
                  }`}
              >
                Magazine
              </button>
            </div>

            {isLoadingLocations ? (
              <SidebarSkeleton />
            ) : activeTab === 'magazine' ? (
              userTier === 'explorer' ? (
                <div className="relative h-full flex flex-col">
                  <div className="opacity-30 blur-[4px] pointer-events-none flex-1 overflow-hidden">
                    <MagazinePanel locations={locations.slice(0, 3)} itinerary={selectedItinerary} />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-xl">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground mb-2">
                      Unlock Travel Book
                    </h4>
                    <p className="text-[12px] text-muted-foreground mb-5">
                      Subscribe to view beautiful interactive magazines for your itineraries.
                    </p>
                    <button onClick={() => router.push('/pricing')} className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold uppercase tracking-widest transition-colors shadow-lg">
                      Unlock — 99 MAD/mo
                    </button>
                  </div>
                </div>
              ) : (
                <MagazinePanel
                  locations={locations}
                  itinerary={selectedItinerary}
                  reviewItineraryId={reviewItineraryId}
                />
              )
            ) : activeTab === 'stops' ? (
              <div className="relative">
                <div className="flex flex-col gap-1 px-4 pb-6">
                  {locations.map((location, i) => {
                    const prevLoc = locations[i - 1];
                    const nextLoc = locations[i + 1];
                    const showDayDivider = !prevLoc || prevLoc.day_number !== location.day_number;
                    const nextTransport = nextLoc ? nextLoc.transport : null;
                    const isLocked = userTier === 'explorer' && (location.day_number || 1) > 2;

                    return (
                      <div key={`${location.id}-${i}`} className={isLocked ? 'opacity-30 blur-[2px] pointer-events-none select-none transition-all duration-500' : ''}>
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

                {/* PDF Download Button or AI Save Panel */}
                <div className="px-4 pb-4">
                  {selectedItinerary.id === 'ai-generated' ? (
                    <div>
                      {userTier === 'explorer' ? (
                        <div className="text-center bg-card border border-primary/20 p-5 rounded-xl shadow-lg mt-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                          <h4 className="font-[family-name:var(--font-cormorant)] text-[16px] font-semibold text-foreground mb-1">
                            Save Itinerary to Profile
                          </h4>
                          <p className="text-[11px] text-muted-foreground mb-4 leading-normal">
                            Only Nomad and Elite tier members can save generated custom trips. Upgrade to keep this route.
                          </p>
                          <button
                            onClick={() => router.push('/pricing')}
                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold uppercase tracking-widest transition-colors shadow-md cursor-pointer"
                          >
                            Upgrade to Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={onSaveAITrip}
                          disabled={isSavingAITrip}
                          className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSavingAITrip ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                              Saving to Profile...
                            </>
                          ) : (
                            'Save to My Trips'
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <PDFDownloadButton
                        stops={locations.map((l, i) => ({
                          name: l.name,
                          description: l.description || '',
                          rich_description: l.rich_description ?? null,
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
                        region={selectedItinerary.region}
                        durationDays={selectedItinerary.duration_days}
                        userEmail={userEmail}
                        tier={userTier}
                        coverImageUrl={selectedItinerary.cover_image_url}
                      />

                      <ReviewPanel
                        targetType="itinerary"
                        itineraryId={selectedItinerary.id}
                        title="Journey feedback"
                      />
                    </>
                  )}
                </div>

                {/* Lock Overlay + CTA */}
                {selectedItinerary.id !== 'ai-generated' && userTier === 'explorer' && locations.some(l => (l.day_number || 1) > 2) && (
                  <div className="absolute inset-x-0 bottom-0 top-[20%] flex flex-col items-center justify-center z-10 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-auto pb-10">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-xl">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground mb-2">
                      Unlock full itinerary
                    </h4>
                    <p className="text-[12px] text-muted-foreground mb-5 max-w-[200px] text-center">
                      Subscribe to see all days, interactive maps, and detailed logistics.
                    </p>
                    <button
                      onClick={() => router.push('/pricing')}
                      className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-primary/20"
                    >
                      Unlock — 99 MAD/mo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              userTier === 'explorer' ? (
                <div className="relative h-full flex flex-col">
                  <div className="opacity-30 blur-[4px] pointer-events-none flex-1 p-4">
                    <div className="h-32 bg-muted rounded-xl mb-4" />
                    <div className="h-32 bg-muted rounded-xl mb-4" />
                    <div className="h-32 bg-muted rounded-xl" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-4 shadow-xl">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground mb-2">
                      Unlock Nearby Places
                    </h4>
                    <p className="text-[12px] text-muted-foreground mb-5">
                      Subscribe to see luxury hotels and top-rated restaurants near these stops.
                    </p>
                    <button onClick={() => router.push('/pricing')} className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold uppercase tracking-widest transition-colors shadow-lg">
                      Unlock — 99 MAD/mo
                    </button>
                  </div>
                </div>
              ) : locations.length > 0 ? (() => {
                const targetLoc = locations.find(l => l.id === selectedLocationId) || locations[0];
                return (
                  <PlacesTab
                    lat={targetLoc.lat}
                    lng={targetLoc.lng}
                    onPlacesLoaded={onPlacesLoaded}
                    itineraryId={selectedItinerary.id}
                  />
                );
              })() : (
                <div className="p-4 text-sm text-muted-foreground">
                  Places loading...
                </div>
              )
            )}
          </>
        ) : isAiPlannerOpen ? (
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Describe your dream itinerary
              </label>
              <textarea
                rows={5}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. A 3-day trip in Marrakech focused on historic landmarks, museums, and food, with a moderate pace."
                className="bg-card border border-border rounded-xl p-3.5 text-sm w-full focus:border-primary/50 outline-none resize-none leading-relaxed text-foreground"
                disabled={isGenerating}
              />
            </div>

            {userTier === 'explorer' && (
              <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground">
                <span>Free generations left:</span>
                <span className="font-semibold text-foreground">
                  {Math.max(0, 1 - aiGenerationsCount)} / 1
                </span>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 font-medium">
                {aiError}
              </div>
            )}

            {userTier === 'explorer' && aiGenerationsCount >= 1 ? (
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl text-center">
                <p className="text-[12px] text-muted-foreground mb-4 leading-normal">
                  You have used your 1 free generation. Upgrade to Nomad or Elite to plan unlimited trips.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-md shadow-primary/10 cursor-pointer"
                >
                  Upgrade Now
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  if (!aiPrompt.trim()) return
                  setIsGenerating(true)
                  setAiError('')
                  try {
                    const res = await fetch('/api/ai-itinerary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: aiPrompt })
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      throw new Error(data.message || data.error || 'Failed to generate itinerary')
                    }
                    if (data.newGenerationsCount !== undefined) {
                      setAiGenerationsCount(data.newGenerationsCount)
                    }
                    setIsAiPlannerOpen(false)
                    setAiPrompt('')
                    
                    if (onAIGenerated) {
                      const rawStops = data.itinerary.stops || []
                      const mappedStops = rawStops.map((stop: any, index: number) => {
                        const existingId = stop.existing_location_id
                        const hasExistingId = existingId && existingId !== 'null' && existingId !== 'undefined'
                        return {
                          id: hasExistingId ? existingId : `temp-ai-stop-${index}`,
                          name: stop.name,
                          description: stop.description,
                          lat: stop.lat,
                          lng: stop.lng,
                          order_index: stop.order_index || index + 1,
                          day_number: stop.day_number || 1,
                          category: stop.category || 'other',
                          tips: stop.tips || '',
                          duration_minutes: stop.duration_minutes || null,
                          existing_location_id: hasExistingId ? existingId : null
                        }
                      })

                      onAIGenerated({
                        id: 'ai-generated',
                        title: data.itinerary.title,
                        description: data.itinerary.description,
                        region: 'Custom',
                        duration_days: Math.max(...mappedStops.map((s: any) => s.day_number || 1)),
                        cover_image_url: '/Images/riad.png',
                        tier: 'explorer',
                        created_at: new Date().toISOString()
                      }, mappedStops)
                    }
                  } catch (err: any) {
                    setAiError(err.message || 'An error occurred')
                  } finally {
                    setIsGenerating(false)
                  }
                }}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Generating trip...
                  </>
                ) : (
                  'Generate Trip Plan'
                )}
              </button>
            )}
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <svg className="w-10 h-10 text-muted-foreground/30 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground mb-2">No itineraries match your filters</h3>
            <button onClick={() => { setSearch(''); setDurationFilter('Any duration'); setSort('Default'); }} className="text-[11px] uppercase tracking-widest font-semibold text-primary hover:text-primary/80 transition-colors mt-2">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-5 pb-6">
            {/* My Trips Section */}
            {myTrips.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setMyTripsExpanded(!myTripsExpanded)}
                  className="w-full flex items-center justify-between py-2 group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                      My Trips
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {myTrips.length}
                    </span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${myTripsExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {myTripsExpanded && (
                  <div className="flex flex-col gap-2 mt-2 pl-1">
                    {myTrips.map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => router.push(`/itinerary/${trip.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {trip.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-semibold uppercase tracking-widest ${trip.is_public ? 'text-green-500' : 'text-muted-foreground/50'}`}>
                              {trip.is_public ? 'Public' : 'Private'}
                            </span>
                            <span className="text-[9px] text-muted-foreground/40">·</span>
                            <span className="text-[9px] text-muted-foreground/50">
                              {new Date(trip.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    ))}

                    <Link
                      href="/compose"
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      + New itinerary
                    </Link>
                  </div>
                )}

                {/* Divider */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">Curated</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                </div>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground mb-1 -mt-2">{filteredItineraries.length} {filteredItineraries.length === 1 ? 'itinerary' : 'itineraries'} found</div>
            {filteredItineraries.map((itinerary, i) => (
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
          className="w-9 h-9 rounded-sm bg-card border border-border hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200 shadow-lg shadow-black/10 dark:shadow-black/30"
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
          <div className="absolute bottom-12 left-0 bg-card border border-border rounded-sm shadow-xl shadow-black/10 dark:shadow-black/40 py-2 px-1 min-w-[160px]">
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
                className="block px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
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
      <aside className="hidden md:flex flex-col w-[400px] flex-shrink-0 h-full relative bg-background border-r border-border">
        <SidebarContent key={sidebarContentKey} {...props} />
      </aside>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <Sheet>
          <SheetTrigger
            className="
              w-full flex items-center justify-between
              px-5 py-3.5
              bg-card/95 backdrop-blur-xl
              border border-border
              rounded-2xl shadow-2xl shadow-black/40
              text-left
              group
              hover:border-primary/20
              transition-all duration-300
            "
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <polygon fill="currentColor" stroke="none" points="12,3 14,12 12,10 10,12" />
                  <polygon fill="currentColor" stroke="none" opacity="0.3" points="12,21 10,12 12,14 14,12" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground block leading-tight">
                  {selectedItinerary ? selectedItinerary.title : 'Browse Itineraries'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {selectedItinerary
                    ? `${selectedItinerary.region} · ${selectedItinerary.duration_days}d`
                    : 'Discover Morocco'
                  }
                </span>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-muted-foreground group-hover:text-muted-foreground transition-colors"
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
              !bg-background !border-border
              p-0
            "
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Itineraries</SheetTitle>
            </SheetHeader>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
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
