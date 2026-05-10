'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Star, Trash2 } from 'lucide-react'
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
        const className = isActive ? 'fill-[#C1440E] text-[#C1440E]' : 'text-[#8B7355]/40'

        if (!interactive) {
          return <Star key={star} size={starSize} className={className} />
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="rounded-sm p-0.5 text-[#8B7355] transition-colors hover:text-[#C1440E]"
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

  const visibleReviews: Review[] = compact ? response.reviews.slice(0, 2) : response.reviews.slice(0, 4)

  return (
    <section className={`${compact ? 'mt-6' : 'mt-8'} border border-[#E8D5B7]/10 bg-[#1A1814]/55 rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C1440E]">
            Reviews
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-[#F0E6D8]">
            {title}
          </h3>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-[#F0E6D8]">
            <span className="font-[family-name:var(--font-cormorant)] text-2xl">
              {response.averageRating ?? '-'}
            </span>
            <RatingStars value={Math.round(response.averageRating || 0)} />
          </div>
          <p className="text-[11px] uppercase tracking-widest text-[#8B7355]">
            {response.reviewCount} {response.reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#8B7355]">Loading feedback...</p>
      ) : (
        <>
          {visibleReviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {visibleReviews.map((review) => (
                <article key={review.id} className="border-t border-[#E8D5B7]/6 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <RatingStars value={review.rating} />
                    <span className="text-[10px] uppercase tracking-widest text-[#8B7355]/70">
                      {review.is_own ? 'Your review' : formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#BFA882]">
                    {review.body}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#8B7355]">
              No traveler feedback yet.
            </p>
          )}

          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="mt-5 border-t border-[#E8D5B7]/6 pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-widest text-[#8B7355]">
                  {ownReview ? 'Update your rating' : 'Add your rating'}
                </span>
                <RatingStars value={rating} interactive onChange={setRating} size="md" />
              </div>

              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share what stood out..."
                className="mt-3 min-h-[82px] w-full resize-none rounded-lg border border-[#E8D5B7]/10 bg-[#0F0D0A] p-3 text-sm text-[#F0E6D8] outline-none transition-colors placeholder:text-[#8B7355]/50 focus:border-[#C1440E]/50"
              />

              {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}

              <div className="mt-3 flex items-center justify-end gap-2">
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
                <button
                  type="submit"
                  disabled={isSubmitting || body.trim().length < 3}
                  className="rounded-lg bg-[#C1440E] px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#D4622E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : ownReview ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 border-t border-[#E8D5B7]/6 pt-4">
              <Link
                href="/auth/login"
                className="text-[11px] font-semibold uppercase tracking-widest text-[#C1440E] transition-colors hover:text-[#D4622E]"
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
