import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MapView from '@/components/MapView'
import GoogleMapsProvider from '@/components/GoogleMapsProvider'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import type { Itinerary, Location, UserTier } from '@/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const TIER_LEVELS: Record<UserTier, number> = { explorer: 0, nomad: 1, elite: 2 }

interface PublicStop {
  day_number: number
  order_index: number
  custom_notes: string | null
  locations: Location
}

interface PublicItinerary {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  user_itinerary_stops?: PublicStop[]
}

interface MetadataItinerary {
  title: string
  description?: string | null
  cover_image_url?: string | null
  user_itinerary_stops?: Array<{
    locations: Pick<Location, 'description' | 'image_url'> | null
  }>
}

function canViewTier(viewerTier: UserTier, requiredTier: UserTier) {
  return TIER_LEVELS[viewerTier] >= TIER_LEVELS[requiredTier]
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6 text-center atlas-grain">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-4">
        Not Found
      </h1>
      <p className="text-[#8B7355]">This itinerary doesn&apos;t exist or has been deleted.</p>
      <Link href="/explore" className="mt-6 text-[#C1440E] hover:text-[#D4622E] uppercase tracking-widest text-[12px] font-semibold">
        Back to Explore
      </Link>
    </div>
  )
}

function PrivateState() {
  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6 text-center atlas-grain">
      <div className="w-16 h-16 rounded-full bg-[#1A1610] border border-[#E8D5B7]/10 flex items-center justify-center mb-6 shadow-xl">
        <svg className="w-8 h-8 text-[#C1440E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-4">
        Private Itinerary
      </h1>
      <p className="text-[#8B7355] max-w-sm mb-8 leading-relaxed">
        This itinerary is set to private. Only the creator can view it.
      </p>
      <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A1814] hover:bg-[#231F18] border border-white/5 text-[#F0E6D8] text-[12px] font-semibold uppercase tracking-widest transition-colors">
        Explore Morocco
      </Link>
    </div>
  )
}

function TierLockedState({
  itinerary,
  requiredTier,
}: {
  itinerary: Itinerary
  requiredTier: UserTier
}) {
  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6 text-center atlas-grain">
      <div className="w-16 h-16 rounded-full bg-[#1A1610] border border-[#E8D5B7]/10 flex items-center justify-center mb-6 shadow-xl">
        <svg className="w-8 h-8 text-[#C1440E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C1440E]">
        {requiredTier} itinerary
      </p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-4 max-w-2xl">
        {itinerary.title}
      </h1>
      {itinerary.description && (
        <p className="text-[#8B7355] max-w-xl mb-8 leading-relaxed">
          {itinerary.description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C1440E] hover:bg-[#D4622E] text-white text-[12px] font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-[#C1440E]/20">
          Upgrade to {requiredTier}
        </Link>
        <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A1814] hover:bg-[#231F18] border border-white/5 text-[#F0E6D8] text-[12px] font-semibold uppercase tracking-widest transition-colors">
          Back to Explore
        </Link>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: customData } = await supabase
    .from('user_itineraries')
    .select('title, user_itinerary_stops ( locations ( description, image_url ) )')
    .eq('id', id)
    .maybeSingle()

  const customItinerary = customData as MetadataItinerary | null

  if (customItinerary) {
    const firstStop = customItinerary.user_itinerary_stops?.[0]?.locations
    const desc = firstStop?.description?.substring(0, 150) || 'Explore a custom Moroccan itinerary on Atlas 360.'
    const image = firstStop?.image_url || undefined

    return {
      title: `${customItinerary.title} | Atlas 360`,
      description: desc,
      openGraph: {
        title: `${customItinerary.title} | Atlas 360`,
        description: desc,
        ...(image && { images: [image] }),
      },
    }
  }

  const { data: curatedData } = await supabase
    .from('itineraries')
    .select('title, description, cover_image_url')
    .eq('id', id)
    .maybeSingle()

  const curatedItinerary = curatedData as MetadataItinerary | null

  if (!curatedItinerary) {
    return { title: 'Itinerary Not Found | Atlas 360' }
  }

  const desc = curatedItinerary.description?.substring(0, 150) || 'Explore a curated Moroccan itinerary on Atlas 360.'
  const image = curatedItinerary.cover_image_url || undefined

  return {
    title: `${curatedItinerary.title} | Atlas 360`,
    description: desc,
    openGraph: {
      title: `${curatedItinerary.title} | Atlas 360`,
      description: desc,
      ...(image && { images: [image] }),
    },
  }
}

export default async function PublicItineraryPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let viewerTier: UserTier = 'explorer'
  let viewerEmail = ''
  if (user) {
    viewerEmail = user.email || ''
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()
    if (profile?.tier) viewerTier = profile.tier as UserTier
  }

  const { data: customData, error: customError } = await supabase
    .from('user_itineraries')
    .select(`
      *,
      user_itinerary_stops (
        day_number,
        order_index,
        custom_notes,
        locations (*)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (customError) return <NotFoundState />

  const customItinerary = customData as PublicItinerary | null
  let title = ''
  let description: string | null = null
  let isOwner = false
  let stops: PublicStop[] = []

  if (customItinerary) {
    isOwner = Boolean(user && user.id === customItinerary.user_id)

    if (!customItinerary.is_public && !isOwner) {
      return <PrivateState />
    }

    title = customItinerary.title
    description = customItinerary.description
    stops = customItinerary.user_itinerary_stops || []
  } else {
    const { data: curatedData, error: curatedError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (curatedError || !curatedData) {
      return <NotFoundState />
    }

    const curatedItinerary = curatedData as Itinerary

    if (!canViewTier(viewerTier, curatedItinerary.tier)) {
      return <TierLockedState itinerary={curatedItinerary} requiredTier={curatedItinerary.tier} />
    }

    const { data: curatedStops, error: curatedStopsError } = await supabase
      .from('locations')
      .select('*')
      .eq('itinerary_id', id)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true })

    if (curatedStopsError) {
      return <NotFoundState />
    }

    title = curatedItinerary.title
    description = curatedItinerary.description
    stops = (curatedStops as Location[] | null || []).map((location) => ({
      day_number: location.day_number || 1,
      order_index: location.order_index,
      custom_notes: null,
      locations: location,
    }))
  }

  stops.sort((a, b) => {
    if (a.day_number !== b.day_number) return a.day_number - b.day_number
    return a.order_index - b.order_index
  })

  const mapLocations: Location[] = stops.map((stop, index) => ({
    ...stop.locations,
    day_number: stop.day_number,
    order_index: index + 1,
  }))

  const groupedByDay = stops.reduce<Record<number, PublicStop[]>>((acc, stop) => {
    if (!acc[stop.day_number]) acc[stop.day_number] = []
    acc[stop.day_number].push(stop)
    return acc
  }, {})

  return (
    <div className="flex h-screen bg-[#0F0D0A] pt-[60px] atlas-grain">
      <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-[#E8D5B7]/10 bg-[#0F0D0A] relative z-10">
        <div className="p-8 border-b border-[#E8D5B7]/5 pb-6">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-3 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-[#8B7355] leading-relaxed mb-4">{description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-[#8B7355] font-semibold">
              {stops.length} stops | {Object.keys(groupedByDay).length} days
            </span>
            {isOwner && (
              <Link href="/compose" className="text-[10px] uppercase tracking-widest text-[#C1440E] hover:text-[#D4622E] border border-[#C1440E]/30 px-3 py-1.5 rounded-full transition-colors">
                Open Composer
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 atlas-scrollbar">
          {Object.entries(groupedByDay).map(([dayStr, dayStops]) => (
            <div key={dayStr} className="relative">
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#0F0D0A] z-10 py-2">
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#8B7355]">Day {dayStr}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#8B7355]/20 to-transparent" />
              </div>

              <div className="space-y-4">
                {dayStops.map((stop, idx) => (
                  <div key={`${dayStr}-${stop.locations.id}`} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#1A1814] border border-[#E8D5B7]/10 flex items-center justify-center text-[10px] font-semibold text-[#8B7355] shadow-sm">
                        {idx + 1}
                      </div>
                      {idx !== dayStops.length - 1 && (
                        <div className="w-px h-full min-h-[30px] bg-gradient-to-b from-[#8B7355]/30 to-transparent mt-2" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <h4 className="text-[15px] font-medium text-[#F0E6D8] mb-1 leading-snug">{stop.locations.name}</h4>
                      {stop.locations.duration_minutes && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#1A1814] border border-white/5 text-[#8B7355] text-[10px] mb-2">
                          {stop.locations.duration_minutes} min
                        </span>
                      )}
                      {stop.custom_notes ? (
                        <div className="bg-[#1A1814]/50 border border-[#C1440E]/10 rounded-lg p-3 mt-1">
                          <p className="text-[12px] italic text-[#BFA882]/80">{stop.custom_notes}</p>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#8B7355]/70 line-clamp-2">{stop.locations.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="px-2 pb-6">
            <PDFDownloadButton
              stops={stops.map((stop) => ({
                name: stop.locations.name,
                description: stop.locations.description || '',
                category: stop.locations.category || '',
                day_number: stop.day_number,
                order_index: stop.order_index,
                duration_minutes: stop.locations.duration_minutes ?? null,
                transport_to_next: stop.locations.transport_to_next ?? null,
                transport_duration_minutes: stop.locations.transport_duration_minutes ?? null,
                best_time: stop.locations.best_time ?? null,
                tips: stop.locations.tips ?? null,
              }))}
              title={title}
              userEmail={viewerEmail}
              tier={viewerTier}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-[#0F0D0A]">
        <GoogleMapsProvider>
          <MapView
            locations={mapLocations}
            itineraryPath={true}
            selectedLocationId={undefined}
            hotelPlaces={[]}
            restaurantPlaces={[]}
          />
        </GoogleMapsProvider>
      </div>
    </div>
  )
}
