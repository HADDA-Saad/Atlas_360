import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import type { Itinerary, Location, UserTier } from '@/types'

export const dynamic = 'force-dynamic'

const TIER_LEVELS: Record<UserTier, number> = { explorer: 0, nomad: 1, elite: 2 }
const FALLBACK_IMAGES = ['/Images/jame3.png', '/Images/riad.png', '/Images/sea.png', '/Images/spices.png', '/Images/Zellige.png']

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
    <div className="min-h-screen bg-background px-6 pt-32 text-center atlas-grain">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">{body}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
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
    reviewItineraryId = customItinerary.id
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
  const heroImage = coverImageUrl || stops.find((stop) => stop.locations.image_url)?.locations.image_url || getFallbackImage(0)
  const stopCount = stops.length
  const dayCount = dayNumbers.length
  const photoCount = stops.filter((stop) => Boolean(stop.locations.image_url)).length

  return (
    <div className="min-h-screen bg-background text-foreground atlas-grain">
      <section className="relative min-h-[82vh] overflow-hidden">
        <Image
          src={heroImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/35" />
        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-6 pb-12 pt-32 md:px-12">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {region && (
              <span className="rounded-sm border border-foreground/15 bg-background/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground backdrop-blur">
                {region}
              </span>
            )}
            {tierLabel && (
              <span className="rounded-sm border border-primary/35 bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4622E] backdrop-blur">
                {tierLabel}
              </span>
            )}
            <span className="rounded-sm border border-foreground/15 bg-background/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
              {stops.length} stops
            </span>
          </div>

          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
            Atlas 360 Travel Book
          </p>
          <h1 className="max-w-4xl font-[family-name:var(--font-cormorant)] text-5xl font-semibold leading-none text-foreground md:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>
          )}

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-foreground/15 bg-background/30 backdrop-blur">
              <div className="px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">{dayCount}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Days</span>
              </div>
              <div className="border-x border-foreground/15 px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">{stopCount}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Stops</span>
              </div>
              <div className="px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">{photoCount}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Photos</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href={`/itinerary/${id}`}
                className="inline-flex rounded-full border border-foreground/15 bg-background/25 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-foreground backdrop-blur transition-colors hover:border-primary/60 hover:text-foreground"
              >
                Open Map View
              </Link>
              <div className="min-w-[220px]">
                <PDFDownloadButton
                  stops={stops.map((stop, index) => ({
                    name: stop.locations.name,
                    description: stop.custom_notes || stop.locations.description || '',
                    rich_description: stop.locations.rich_description ?? null,
                    category: stop.locations.category || '',
                    day_number: stop.day_number,
                    order_index: index,
                    duration_minutes: stop.locations.duration_minutes ?? null,
                    transport_to_next: stop.locations.transport_to_next ?? null,
                    transport_duration_minutes: stop.locations.transport_duration_minutes ?? null,
                    best_time: stop.locations.best_time ?? null,
                    tips: stop.locations.tips ?? null,
                    image_url: stop.locations.image_url || getFallbackImage(index),
                  }))}
                  title={title}
                  userEmail={viewerEmail}
                  tier={viewerTier}
                  coverImageUrl={heroImage}
                />
              </div>
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
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Day {dayNumber}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              <div className="space-y-10">
                {groupedByDay[dayNumber].map((stop, index) => {
                  const location = stop.locations
                  const duration = formatDuration(location.duration_minutes)
                  const globalIndex = stops.findIndex((candidate) => candidate.locations.id === location.id)
                  const image = location.image_url || getFallbackImage(globalIndex >= 0 ? globalIndex : index, location.category)

                  return (
                    <article key={location.id} className="grid gap-6 border-b border-border pb-10 md:grid-cols-[300px_1fr]">
                      <div className="overflow-hidden rounded-lg border border-border bg-card relative aspect-[4/3] w-full">
                        <Image src={image} alt={location.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-foreground">
                            {index + 1}
                          </span>
                          {location.category && (
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {location.category}
                            </span>
                          )}
                          {duration && (
                            <span className="rounded-sm bg-muted-foreground/15 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {duration}
                            </span>
                          )}
                          {location.best_time && (
                            <span className="rounded-sm bg-card px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {location.best_time}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-foreground">
                          {location.name}
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                          {stop.custom_notes || location.description || 'This stop is part of the route and is ready for richer editorial notes.'}
                        </p>

                        {(location.tips || location.transport_to_next) && (
                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {location.tips && (
                              <div className="rounded-lg border border-border bg-card/60 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Tip</p>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{location.tips}</p>
                              </div>
                            )}
                            {location.transport_to_next && (
                              <div className="rounded-lg border border-border bg-card/60 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Next transfer</p>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
