'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Star, Clock, Info, Navigation, MapPin, Tag } from 'lucide-react'
import type { Location, Review } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Simple media query hook
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false)

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null
  const labels: Record<string, string> = {
    landmark: 'Landmark', market: 'Market', museum: 'Museum',
    nature: 'Nature', food: 'Food & Drink', viewpoint: 'Viewpoint',
    religious: 'Religious site',
  }
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20
                     text-[10px] font-semibold uppercase tracking-widest text-primary">
      {labels[category.toLowerCase()] ?? category}
    </span>
  )
}

function formatDuration(mins: number | null) {
  if (mins === null || mins === undefined) return null;
  if (mins < 60) return `${mins} min`;
  if (mins === 60) return '1 hr';
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr ${rem} min`;
}

function InlineReviewWidget({ locationId }: { locationId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [rating, setRating] = useState<number>(5)
  const [body, setBody] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?target_type=location&location_id=${locationId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating)
        setReviewCount(data.reviewCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch location reviews', err)
    }
  }

  useEffect(() => {
    fetchReviews()
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [locationId])

  const handleSubmit = async () => {
    if (body.trim().length < 3) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'location',
          location_id: locationId,
          rating,
          body: body.trim()
        })
      })
      if (res.ok) {
        setBody('')
        setIsExpanded(false)
        await fetchReviews()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to submit review')
      }
    } catch (err) {
      console.error('Failed to submit review', err)
      alert('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const recentReviews = reviews.slice(0, 2)

  return (
    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border">
      <div className="text-sm font-semibold text-foreground">
        {reviewCount > 0 ? `★ ${averageRating?.toFixed(1) || '5.0'} · ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
      </div>

      {recentReviews.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {recentReviews.map((rev) => (
            <div key={rev.id} className="bg-muted/30 rounded-lg p-2.5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= rev.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground/90 truncate">{rev.body}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoggedIn ? (
        <div className="mt-2 text-center py-2 bg-muted/20 rounded-lg border border-border/50">
          <Link href="/auth/login" className="text-xs text-primary hover:underline font-medium">
            Log in to leave a review
          </Link>
        </div>
      ) : !isExpanded ? (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-0.5 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Write a quick review..."
            className="flex-1 h-9 px-3 text-xs rounded-md bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {body.trim().length >= 3 && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-9 px-3 text-xs font-semibold uppercase tracking-wider"
            >
              {isSubmitting ? '...' : 'Publish'}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2 bg-muted/20 p-3 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your Rating</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your review here..."
            rows={3}
            autoFocus
            className="w-full p-2 text-xs rounded-md bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="h-7 px-2 text-[11px]"
            >
              Cancel
            </Button>
            {body.trim().length >= 3 && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-7 px-3 text-[11px] font-semibold uppercase tracking-wider"
              >
                {isSubmitting ? '...' : 'Publish'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface StopPopupModalProps {
  location: Location | null
  isOpen: boolean
  onClose: () => void
  onOpenPanorama: () => void
  onFindPlaces: () => void
  totalStops?: number
}

export default function StopPopupModal({
  location,
  isOpen,
  onClose,
  onOpenPanorama,
  onFindPlaces,
  totalStops = 0,
}: StopPopupModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [rating, setRating] = useState<number | null>(null)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && location) {
      setIsLoadingReviews(true)
      fetch(`/api/reviews?target_type=location&location_id=${location.id}`)
        .then((res) => res.json())
        .then((data) => {
          setRating(data.averageRating)
        })
        .catch((err) => console.error('Failed to fetch rating', err))
        .finally(() => setIsLoadingReviews(false))
    }
  }, [isOpen, location])

  if (!location) return null

  const content = (
    <div className="flex flex-col gap-4 mt-4">
      {/* 1. Hero image */}
      {location.image_url ? (
        <div className="relative w-full h-40 md:h-[220px] rounded-xl overflow-hidden mb-2 shrink-0">
          <Image
            src={location.image_url}
            alt={location.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative w-full h-40 md:h-[220px] rounded-xl overflow-hidden mb-2 shrink-0 bg-muted/40 border border-border flex flex-col items-center justify-center p-6 text-center">
          <svg className="w-16 h-16 text-primary/20 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M12 2L15 9h7l-5.5 4.5 2 7.5L13 18l-5.5 3 2-7.5L4 9h7z" />
          </svg>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Atlas 360 Stop</div>
          <div className="font-[family-name:var(--font-cormorant)] text-xl font-bold text-foreground/80">{location.name}</div>
        </div>
      )}

      {/* 2. Stop header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={location.category} />
          <span className="text-xs font-medium text-muted-foreground">
            Day {location.day_number || 1} · Stop {location.order_index} {totalStops > 0 && `of ${totalStops}`}
          </span>
        </div>
        {rating !== null && !isLoadingReviews && (
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold shrink-0">
            <Star className="w-3.5 h-3.5 fill-primary" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* 3. Description block */}
      {location.rich_description ? (
        <div className="relative max-h-[180px] overflow-y-auto atlas-scrollbar pr-2">
          {location.rich_description.split('\n\n').map((para, idx) => (
            <p key={idx} className="text-sm text-muted-foreground leading-[1.75] mb-3 last:mb-0">
              {para}
            </p>
          ))}
          <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      ) : location.description ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {location.description}
        </p>
      ) : null}

      {/* 4. Info chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {location.best_time && (
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-muted/40 border border-border px-2.5 py-1 rounded-md text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5" />
            {location.best_time}
          </div>
        )}
        {location.duration_minutes && (
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-muted/40 border border-border px-2.5 py-1 rounded-md text-muted-foreground font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {formatDuration(location.duration_minutes)}
          </div>
        )}
        {location.category && (
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-muted/40 border border-border px-2.5 py-1 rounded-md text-muted-foreground font-medium">
            <Tag className="w-3.5 h-3.5" />
            {location.category}
          </div>
        )}
      </div>

      {/* 5. Transport to next stop */}
      {location.transport_to_next && (
        <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg mt-1">
          <div className="bg-muted p-2 rounded-full">
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Getting to next stop</div>
            <div className="text-sm font-semibold">
              {location.transport_to_next}
              {location.transport_duration_minutes && ` · ${location.transport_duration_minutes} min`}
            </div>
          </div>
        </div>
      )}

      {/* 6. Insider tip */}
      {location.tips && (
        <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 mt-1 border border-border">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed italic">{location.tips}</p>
        </div>
      )}

      {/* 7. Photo gallery strip */}
      {location.photo_urls && location.photo_urls.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Photos</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {location.photo_urls.map((url, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(url)}
                className="relative shrink-0 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ width: '80px', height: '60px' }}
              >
                <Image src={url} alt={`${location.name} photo ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
          {selectedPhoto && (
            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
              <DialogContent className="max-w-[90vw] max-h-[90vh] p-1 bg-background border-border flex items-center justify-center">
                <DialogHeader className="sr-only">
                  <DialogTitle>Photo Lightbox</DialogTitle>
                  <DialogDescription>Full size view of location photo</DialogDescription>
                </DialogHeader>
                <div className="relative w-[85vw] h-[75vh] max-w-5xl max-h-[75vh]">
                  <Image src={selectedPhoto} alt="Location photo" fill className="object-contain rounded-lg" />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* 8. Inline review micro-widget */}
      <InlineReviewWidget locationId={location.id} />

      {/* 9. CTA row */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button onClick={onOpenPanorama} className="flex-1 font-semibold tracking-wide">
          Open 360° View
        </Button>
        <Button onClick={onFindPlaces} variant="outline" className="flex-1 font-semibold tracking-wide">
          Find Nearby Places
        </Button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto atlas-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[family-name:var(--font-cormorant)] text-primary">
              {location.name}
            </DialogTitle>
            <DialogDescription className="sr-only">Details about {location.name}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-[20px] max-h-[85vh] overflow-y-auto atlas-scrollbar">
        <SheetHeader>
          <SheetTitle className="text-2xl font-[family-name:var(--font-cormorant)] text-primary text-left">
            {location.name}
          </SheetTitle>
          <SheetDescription className="sr-only">Details about {location.name}</SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}
