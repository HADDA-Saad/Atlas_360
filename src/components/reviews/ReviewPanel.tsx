'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ImageIcon, MessageSquareText, Star, Trash2, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Review, ReviewsResponse, ReviewTargetType } from '@/types'

interface ReviewPanelProps {
  targetType: ReviewTargetType
  itineraryId?: string
  locationId?: string
  title?: string
  compact?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function RatingStars({
  value,
  interactive = false,
  onChange,
  size = 'sm',
}: {
  value: number
  interactive?: boolean
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}) {
  const starSize = size === 'md' ? 18 : 14

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= value
        const className = isActive ? 'fill-[#C1440E] text-primary' : 'text-muted-foreground/40'

        if (!interactive) {
          return <Star key={star} size={starSize} className={className} />
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-primary"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star size={starSize + 2} className={className} />
          </button>
        )
      })}
    </div>
  )
}

export default function ReviewPanel({
  targetType,
  itineraryId,
  locationId,
  title = 'Traveler feedback',
  compact = false,
}: ReviewPanelProps) {
  const [response, setResponse] = useState<ReviewsResponse>({
    reviews: [],
    averageRating: null,
    reviewCount: 0,
    viewerReviewId: null,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const targetQuery = useMemo(() => {
    const params = new URLSearchParams({ target_type: targetType })
    if (targetType === 'itinerary' && itineraryId) params.set('itinerary_id', itineraryId)
    if (targetType === 'location' && locationId) params.set('location_id', locationId)
    return params.toString()
  }, [targetType, itineraryId, locationId])

  const ownReview = response.reviews.find((review) => review.is_own)

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/reviews?${targetQuery}`)
      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.error || 'Could not load reviews')
      }

      const nextResponse = payload as ReviewsResponse
      const nextOwnReview = nextResponse.reviews.find((review) => review.is_own)

      setResponse(nextResponse)
      if (nextOwnReview) {
        setRating(nextOwnReview.rating)
        setBody(nextOwnReview.body)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reviews')
    } finally {
      setIsLoading(false)
    }
  }, [targetQuery])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user))
    })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadReviews()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadReviews])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          itinerary_id: targetType === 'itinerary' ? itineraryId : null,
          location_id: targetType === 'location' ? locationId : null,
          rating,
          body,
        }),
      })
      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.error || 'Could not save review')
      }

      await loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!ownReview) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/reviews/${ownReview.id}`, { method: 'DELETE' })
      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.error || 'Could not delete review')
      }

      setRating(5)
      setBody('')
      await loadReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleReviews: Review[] = compact ? response.reviews.slice(0, 2) : (showAll ? response.reviews : response.reviews.slice(0, 3))
  const panelClass = compact
    ? 'mt-6 rounded-xl border border-border bg-card/55 p-4'
    : 'mt-8 rounded-2xl border border-border bg-card/70 p-5 shadow-sm'
  const headingClass = compact
    ? 'mt-1 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground'
    : 'mt-1 font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground'
  const reviewLabel = response.reviewCount === 1 ? 'review' : 'reviews'

  return (
    <section className={panelClass}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <MessageSquareText size={14} strokeWidth={1.7} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em]">
              Traveler feedback
            </p>
          </div>
          <h3 className={headingClass}>
            {title}
          </h3>
          {!compact && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Reviews help travelers compare routes, judge stop quality, and spot details that are hard to capture on a map.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background/60 px-4 py-3 sm:text-right">
          <div className="flex items-center gap-2 text-foreground sm:justify-end">
            <span className="font-[family-name:var(--font-cormorant)] text-3xl leading-none">
              {response.averageRating ?? '-'}
            </span>
            <RatingStars value={Math.round(response.averageRating || 0)} />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {response.reviewCount} {reviewLabel}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          <div className="h-16 rounded-xl bg-muted/60 animate-pulse" />
          {!compact && <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />}
        </div>
      ) : (
        <>
          {visibleReviews.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {visibleReviews.map((review) => {
                const userIdStr = review.user_id || '00'
                const initials = userIdStr.substring(0, 2).toUpperCase()
                const colorIndex = parseInt(userIdStr.charAt(0), 16) % 4
                const bgColors = ['bg-primary', 'bg-amber-500', 'bg-teal-500', 'bg-muted-foreground']
                const bgColor = isNaN(colorIndex) ? 'bg-primary' : bgColors[colorIndex]

                return (
                <article key={review.id} className="rounded-xl border border-border bg-background/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-bold text-white ${bgColor}`}>
                        {initials}
                      </div>
                      <div>
                        <RatingStars value={review.rating} />
                        <span className="mt-1 block text-[10px] uppercase tracking-widest text-muted-foreground/70">
                          {review.is_own ? 'Your review' : formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    {review.is_own && (
                      <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-primary">
                        Yours
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                </article>
                )
              })}
              {!compact && response.reviews.length > 3 && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-2 text-sm font-medium text-primary hover:underline text-center py-2"
                >
                  Show all {response.reviews.length} reviews
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-background/40 p-4">
              <p className="text-sm font-medium text-foreground">No traveler feedback yet.</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Be the first to add practical notes, atmosphere, and expectations for this {targetType}.
              </p>
            </div>
          )}

          {!compact && (
            <div className="mt-4 flex justify-end">
              <span title="Photo reviews are coming soon" className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
                <ImageIcon size={12}/> Photo reviews coming soon
              </span>
            </div>
          )}

          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="mt-5 border-t border-border pt-4">
              <div className="flex flex-col gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your rating
                </span>
                <RatingStars value={rating} interactive onChange={setRating} size="md" />
              </div>

              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What stood out? What should future travelers know?"
                className="min-h-[82px] w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
              />

              {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div>
                  {ownReview && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/20 text-red-300 transition-colors hover:bg-red-400/10 disabled:opacity-50"
                      aria-label="Delete review"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || body.trim().length < 3}
                  className="rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : ownReview ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 border-t border-border pt-4">
              <Link
                href="/auth/login"
                className="inline-flex rounded-full border border-primary/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-primary transition-colors hover:border-primary hover:bg-primary/10"
              >
                Login to leave feedback
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}
