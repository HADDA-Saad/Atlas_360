'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import SlideOverPanel from '@/components/SlideOverPanel'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'
import ReviewPanel from '@/components/reviews/ReviewPanel'
import type { Itinerary, Location, UserTier } from '@/types'

const FALLBACK_IMAGES = [
  '/Images/jame3.png',
  '/Images/riad.png',
  '/Images/sea.png',
  '/Images/spices.png',
  '/Images/Zellige.png',
]

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

function formatDuration(mins: number | null) {
  if (!mins) return null
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hr ${rem} min`
}

interface MagazineSlideOverProps {
  isOpen: boolean
  onClose: () => void
  itinerary: Itinerary
  locations: Location[]
  reviewItineraryId?: string | null
  userEmail?: string
  userTier?: UserTier
}

export default function MagazineSlideOver({
  isOpen,
  onClose,
  itinerary,
  locations,
  reviewItineraryId,
  userEmail = '',
  userTier = 'explorer',
}: MagazineSlideOverProps) {
  const groupedByDay = useMemo(() => {
    return locations.reduce<Record<number, { location: Location; globalIndex: number }[]>>(
      (acc, loc, globalIdx) => {
        const day = loc.day_number ?? 1
        if (!acc[day]) acc[day] = []
        acc[day].push({ location: loc, globalIndex: globalIdx })
        return acc
      },
      {},
    )
  }, [locations])

  const dayNumbers = useMemo(
    () => Object.keys(groupedByDay).map(Number).sort((a, b) => a - b),
    [groupedByDay],
  )

  const heroImage = useMemo(() => {
    return (
      itinerary.cover_image_url ||
      locations.find((l) => l.image_url)?.image_url ||
      getFallbackImage(0)
    )
  }, [itinerary.cover_image_url, locations])

  const stopCount = locations.length
  const dayCount = dayNumbers.length
  const photoCount = locations.filter((l) => Boolean(l.image_url)).length

  return (
    <SlideOverPanel isOpen={isOpen} onClose={onClose} title="Travel Book">
      <div className="min-h-full bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative min-h-[65vh] overflow-hidden">
          <Image
            src={heroImage}
            alt={itinerary.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/35" />
          <div className="relative z-10 mx-auto flex min-h-[65vh] max-w-6xl flex-col justify-end px-6 pb-10 pt-24 md:px-12">
            {/* Tags */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {itinerary.region && (
                <span className="rounded-sm border border-foreground/15 bg-background/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground backdrop-blur">
                  {itinerary.region}
                </span>
              )}
              {itinerary.tier && itinerary.tier !== 'explorer' && (
                <span className="rounded-sm border border-primary/35 bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4622E] backdrop-blur">
                  {itinerary.tier}
                </span>
              )}
              <span className="rounded-sm border border-foreground/15 bg-background/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
                {stopCount} stops
              </span>
            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
              Atlas 360 Travel Book
            </p>
            <h1 className="max-w-4xl font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-none text-foreground md:text-6xl lg:text-7xl">
              {itinerary.title}
            </h1>
            {itinerary.description && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {itinerary.description}
              </p>
            )}

            {/* Stats Bar */}
            <div className="mt-7 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-foreground/15 bg-background/30 backdrop-blur">
              <div className="px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
                  {dayCount}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Days
                </span>
              </div>
              <div className="border-x border-foreground/15 px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
                  {stopCount}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Stops
                </span>
              </div>
              <div className="px-4 py-3">
                <span className="block font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground">
                  {photoCount}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Photos
                </span>
              </div>
            </div>

            {/* PDF download in hero */}
            <div className="mt-6 flex flex-wrap gap-3">
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
                  image_url: l.image_url || getFallbackImage(i),
                }))}
                title={itinerary.title}
                region={itinerary.region}
                durationDays={itinerary.duration_days}
                userEmail={userEmail}
                tier={userTier}
                coverImageUrl={heroImage}
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-6 py-14 md:px-12">
          {/* Review Panel */}
          {reviewItineraryId && (
            <ReviewPanel
              targetType="itinerary"
              itineraryId={reviewItineraryId}
              title="Journey feedback"
            />
          )}

          {/* Day-by-Day Articles */}
          <div className="mt-14 space-y-14">
            {dayNumbers.map((dayNumber) => (
              <section key={dayNumber}>
                <div className="mb-7 flex items-center gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Day {dayNumber}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                </div>

                <div className="space-y-9">
                  {groupedByDay[dayNumber].map(({ location, globalIndex }) => {
                    const duration = formatDuration(location.duration_minutes)
                    const image = location.image_url || getFallbackImage(globalIndex, location.category)

                    return (
                      <article
                        key={location.id}
                        className="grid gap-6 border-b border-border pb-9 md:grid-cols-[300px_1fr]"
                      >
                        {/* Image */}
                        <div className="overflow-hidden rounded-lg border border-border bg-card relative aspect-[4/3] w-full">
                          <Image
                            src={image}
                            alt={location.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </div>

                        {/* Content */}
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {globalIndex + 1}
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

                          <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground md:text-4xl">
                            {location.name}
                          </h2>
                          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            {location.description || 'This stop is part of the route.'}
                          </p>

                          {/* Tips & Transport Cards */}
                          {(location.tips || location.transport_to_next) && (
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                              {location.tips && (
                                <div className="rounded-lg border border-border bg-card/60 p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                                    Tip
                                  </p>
                                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {location.tips}
                                  </p>
                                </div>
                              )}
                              {location.transport_to_next && (
                                <div className="rounded-lg border border-border bg-card/60 p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                                    Next transfer
                                  </p>
                                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {location.transport_to_next}
                                    {location.transport_duration_minutes
                                      ? ` · ${formatDuration(location.transport_duration_minutes)}`
                                      : ''}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Per-stop review */}
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
    </SlideOverPanel>
  )
}
