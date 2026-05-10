import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import type { Itinerary, Location, UserTier } from '@/types'

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

function canViewTier(viewerTier: UserTier, requiredTier: UserTier) {
  return TIER_LEVELS[viewerTier] >= TIER_LEVELS[requiredTier]
}

function StatePage({
  title,
  body,
  actionHref = '/explore',
  actionLabel = 'Back to Explore',
}: {
  title: string
  body: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="min-h-screen bg-[#0F0D0A] px-6 pt-32 text-center atlas-grain">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-[#F0E6D8]">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[#8B7355]">{body}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex rounded-full bg-[#C1440E] px-7 py-3 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4622E]"
      >
        {actionLabel}
      </Link>
    </div>
  )
}

function formatDuration(mins: number | null) {
  if (!mins) return null
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hr ${rem} min`
}

export default async function ItineraryMagazinePage({
  params,
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

  if (customError) {
    return <StatePage title="Not Found" body="This itinerary does not exist or has been deleted." />
  }

  const customItinerary = customData as PublicItinerary | null
  let title = ''
  let description: string | null = null
  let stops: PublicStop[] = []
  let reviewItineraryId: string | null = null
  let coverImageUrl: string | null = null
  let region: string | null = null
  let tierLabel: UserTier | null = null

  if (customItinerary) {
    const isOwner = Boolean(user && user.id === customItinerary.user_id)
    if (!customItinerary.is_public && !isOwner) {
      return <StatePage title="Private Itinerary" body="This magazine is only visible to the traveler who created it." />
    }

    title = customItinerary.title
    description = customItinerary.description
    stops = customItinerary.user_itinerary_stops || []
    coverImageUrl = stops[0]?.locations.image_url || null
  } else {
    const { data: curatedData, error: curatedError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (curatedError || !curatedData) {
      return <StatePage title="Not Found" body="This itinerary does not exist or has been deleted." />
    }

    const curatedItinerary = curatedData as Itinerary
    if (!canViewTier(viewerTier, curatedItinerary.tier)) {
      return (
        <StatePage
          title={`${curatedItinerary.tier} itinerary`}
          body="Upgrade your plan to open the full magazine for this journey."
          actionHref="/pricing"
          actionLabel={`Upgrade to ${curatedItinerary.tier}`}
        />
      )
    }

    const { data: curatedStops, error: stopsError } = await supabase
      .from('locations')
      .select('*')
      .eq('itinerary_id', id)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true })

    if (stopsError) {
      return <StatePage title="Not Found" body="The stops for this itinerary could not be loaded." />
    }

    title = curatedItinerary.title
    description = curatedItinerary.description
    reviewItineraryId = curatedItinerary.id
    coverImageUrl = curatedItinerary.cover_image_url
    region = curatedItinerary.region
    tierLabel = curatedItinerary.tier
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

  const groupedByDay = stops.reduce<Record<number, PublicStop[]>>((acc, stop) => {
    if (!acc[stop.day_number]) acc[stop.day_number] = []
    acc[stop.day_number].push(stop)
    return acc
  }, {})
  const dayNumbers = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b)
  const heroImage = coverImageUrl || stops.find((stop) => stop.locations.image_url)?.locations.image_url || '/Images/jame3.png'

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#F0E6D8] atlas-grain">
      <section className="relative min-h-[86vh] overflow-hidden">
        <img
          src={heroImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0A] via-[#0F0D0A]/60 to-black/35" />
        <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-32 md:px-12">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {region && (
              <span className="rounded-sm border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#F0E6D8] backdrop-blur">
                {region}
              </span>
            )}
            {tierLabel && (
              <span className="rounded-sm border border-[#C1440E]/35 bg-[#C1440E]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4622E] backdrop-blur">
                {tierLabel}
              </span>
            )}
            <span className="rounded-sm border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#BFA882] backdrop-blur">
              {stops.length} stops
            </span>
          </div>

          <h1 className="max-w-4xl font-[family-name:var(--font-cormorant)] text-5xl font-semibold leading-none text-white md:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#BFA882] md:text-xl">
              {description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/itinerary/${id}`}
              className="inline-flex rounded-full border border-white/15 bg-black/25 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#F0E6D8] backdrop-blur transition-colors hover:border-[#C1440E]/60 hover:text-white"
            >
              Open Map View
            </Link>
            <div className="min-w-[220px]">
              <PDFDownloadButton
                stops={stops.map((stop, index) => ({
                  name: stop.locations.name,
                  description: stop.custom_notes || stop.locations.description || '',
                  category: stop.locations.category || '',
                  day_number: stop.day_number,
                  order_index: index,
                  duration_minutes: stop.locations.duration_minutes ?? null,
                  transport_to_next: stop.locations.transport_to_next ?? null,
                  transport_duration_minutes: stop.locations.transport_duration_minutes ?? null,
                  best_time: stop.locations.best_time ?? null,
                  tips: stop.locations.tips ?? null,
                  image_url: stop.locations.image_url ?? null,
                }))}
                title={title}
                userEmail={viewerEmail}
                tier={viewerTier}
                coverImageUrl={heroImage}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
        {reviewItineraryId && (
          <ReviewPanel
            targetType="itinerary"
            itineraryId={reviewItineraryId}
            title="Journey feedback"
          />
        )}

        <div className="mt-16 space-y-16">
          {dayNumbers.map((dayNumber) => (
            <section key={dayNumber}>
              <div className="mb-8 flex items-center gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C1440E]">
                  Day {dayNumber}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#C1440E]/30 to-transparent" />
              </div>

              <div className="space-y-10">
                {groupedByDay[dayNumber].map((stop, index) => {
                  const location = stop.locations
                  const duration = formatDuration(location.duration_minutes)
                  const image = location.image_url || '/Images/riad.png'

                  return (
                    <article key={location.id} className="grid gap-6 border-b border-[#E8D5B7]/8 pb-10 md:grid-cols-[260px_1fr]">
                      <div className="overflow-hidden rounded-lg border border-white/5 bg-[#1A1814]">
                        <img src={image} alt={location.name} className="aspect-[4/3] h-full w-full object-cover" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C1440E] text-sm font-semibold text-white">
                            {index + 1}
                          </span>
                          {location.category && (
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B7355]">
                              {location.category}
                            </span>
                          )}
                          {duration && (
                            <span className="rounded-sm bg-[#8B7355]/15 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#BFA882]">
                              {duration}
                            </span>
                          )}
                          {location.best_time && (
                            <span className="rounded-sm bg-[#1A1814] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#BFA882]">
                              {location.best_time}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-white">
                          {location.name}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-[#BFA882]">
                          {stop.custom_notes || location.description}
                        </p>

                        {(location.tips || location.transport_to_next) && (
                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {location.tips && (
                              <div className="rounded-lg border border-[#E8D5B7]/8 bg-[#1A1814]/60 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C1440E]">Tip</p>
                                <p className="mt-2 text-sm leading-relaxed text-[#8B7355]">{location.tips}</p>
                              </div>
                            )}
                            {location.transport_to_next && (
                              <div className="rounded-lg border border-[#E8D5B7]/8 bg-[#1A1814]/60 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#C1440E]">Next transfer</p>
                                <p className="mt-2 text-sm leading-relaxed text-[#8B7355]">
                                  {location.transport_to_next}
                                  {location.transport_duration_minutes ? ` · ${formatDuration(location.transport_duration_minutes)}` : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <ReviewPanel
                          targetType="location"
                          locationId={location.id}
                          title="Stop feedback"
                          compact
                        />
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
