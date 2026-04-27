import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MapView from '@/components/MapView'
import GoogleMapsProvider from '@/components/GoogleMapsProvider'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import type { Location } from '@/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: itinerary } = await supabase
    .from('user_itineraries')
    .select('title, user_itinerary_stops ( locations ( description, image_url ) )')
    .eq('id', id)
    .single()

  if (!itinerary) {
    return { title: 'Itinerary Not Found | Atlas 360' }
  }

  const firstStop = (itinerary as any).user_itinerary_stops?.[0]?.locations
  const desc = firstStop?.description?.substring(0, 150) || 'Explore a custom Moroccan itinerary on Atlas 360.'
  const image = firstStop?.image_url || undefined

  return {
    title: `${itinerary.title} | Atlas 360`,
    description: desc,
    openGraph: {
      title: `${itinerary.title} | Atlas 360`,
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

  // Try to get current user (might be null if not logged in)
  const { data: { user } } = await supabase.auth.getUser()

  let viewerTier = 'explorer'
  let viewerEmail = ''
  if (user) {
    viewerEmail = user.email || ''
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()
    if (profile?.tier) viewerTier = profile.tier
  }

  // Fetch the itinerary and its stops
  const { data: itinerary, error } = await supabase
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
    .single()

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center p-6 text-center atlas-grain">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-4">
          Not Found
        </h1>
        <p className="text-[#8B7355]">This itinerary doesn't exist or has been deleted.</p>
        <Link href="/" className="mt-6 text-[#C1440E] hover:text-[#D4622E] uppercase tracking-widest text-[12px] font-semibold">
          ← Back to Explore
        </Link>
      </div>
    )
  }

  const isOwner = user && user.id === itinerary.user_id

  if (!itinerary.is_public && !isOwner) {
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
        <Link href="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A1814] hover:bg-[#231F18] border border-white/5 text-[#F0E6D8] text-[12px] font-semibold uppercase tracking-widest transition-colors">
          Explore Morocco
        </Link>
      </div>
    )
  }

  // Flatten and sort stops
  const rawStops = itinerary.user_itinerary_stops || []
  rawStops.sort((a: any, b: any) => {
    if (a.day_number !== b.day_number) return a.day_number - b.day_number
    return a.order_index - b.order_index
  })

  // Format locations for MapView
  const mapLocations: Location[] = rawStops.map((s: any) => ({
    ...s.locations,
    day_number: s.day_number,
    order_index: s.order_index + 1
  }))

  const groupedByDay = rawStops.reduce((acc: any, stop: any) => {
    if (!acc[stop.day_number]) acc[stop.day_number] = []
    acc[stop.day_number].push(stop)
    return acc
  }, {})

  return (
    <div className="flex h-screen bg-[#0F0D0A] pt-[60px] atlas-grain">
      {/* Sidebar */}
      <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-[#E8D5B7]/10 bg-[#0F0D0A] relative z-10">
        <div className="p-8 border-b border-[#E8D5B7]/5 pb-6">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8] mb-3 leading-tight">
            {itinerary.title}
          </h1>
          {itinerary.description && (
            <p className="text-[13px] text-[#8B7355] leading-relaxed mb-4">{itinerary.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-[#8B7355] font-semibold">
              {rawStops.length} stops · {Object.keys(groupedByDay).length} days
            </span>
            {isOwner && (
              <Link href="/compose" className="text-[10px] uppercase tracking-widest text-[#C1440E] hover:text-[#D4622E] border border-[#C1440E]/30 px-3 py-1.5 rounded-full transition-colors">
                Open Composer
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 atlas-scrollbar">
          {Object.entries(groupedByDay).map(([dayStr, stops]: [string, any]) => (
            <div key={dayStr} className="relative">
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#0F0D0A] z-10 py-2">
                <h3 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#8B7355]">Day {dayStr}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-[#8B7355]/20 to-transparent" />
              </div>
              
              <div className="space-y-4">
                {stops.map((stop: any, idx: number) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-[#1A1814] border border-[#E8D5B7]/10 flex items-center justify-center text-[10px] font-semibold text-[#8B7355] shadow-sm">
                        {idx + 1}
                      </div>
                      {idx !== stops.length - 1 && (
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

          {/* PDF Download Button */}
          <div className="px-2 pb-6">
            <PDFDownloadButton
              stops={rawStops.map((s: any, i: number) => ({
                name: s.locations.name,
                description: s.locations.description || '',
                category: s.locations.category || '',
                day_number: s.day_number,
                order_index: s.order_index,
                duration_minutes: s.locations.duration_minutes ?? null,
                transport_to_next: s.locations.transport_to_next ?? null,
                transport_duration_minutes: s.locations.transport_duration_minutes ?? null,
                best_time: s.locations.best_time ?? null,
                tips: s.locations.tips ?? null,
              }))}
              title={itinerary.title}
              userEmail={viewerEmail}
              tier={viewerTier}
            />
          </div>
        </div>
      </div>

      {/* Map Area */}
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
