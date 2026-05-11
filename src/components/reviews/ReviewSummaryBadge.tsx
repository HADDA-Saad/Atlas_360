'use client'

import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import type { ReviewsResponse, ReviewTargetType } from '@/types'

interface ReviewSummaryBadgeProps {
  targetType: ReviewTargetType
  itineraryId?: string
  locationId?: string
  className?: string
}

export default function ReviewSummaryBadge({
  targetType,
  itineraryId,
  locationId,
  className = '',
}: ReviewSummaryBadgeProps) {
  const [summary, setSummary] = useState<Pick<ReviewsResponse, 'averageRating' | 'reviewCount'> | null>(null)

  const targetQuery = useMemo(() => {
    const params = new URLSearchParams({ target_type: targetType })
    if (targetType === 'itinerary' && itineraryId) params.set('itinerary_id', itineraryId)
    if (targetType === 'location' && locationId) params.set('location_id', locationId)
    return params.toString()
  }, [targetType, itineraryId, locationId])

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      try {
        const res = await fetch(`/api/reviews?${targetQuery}`)
        if (!res.ok) return

        const data = await res.json() as ReviewsResponse
        if (isMounted) {
          setSummary({
            averageRating: data.averageRating,
            reviewCount: data.reviewCount,
          })
        }
      } catch {
        // Review summaries are supporting UI; keep cards usable if this fails.
      }
    }

    loadSummary()

    return () => {
      isMounted = false
    }
  }, [targetQuery])

  if (!summary || summary.reviewCount === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${className}`}>
        <Star size={12} className="text-muted-foreground/50" />
        No reviews yet
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${className}`}>
      <Star size={12} className="fill-[#C1440E] text-primary" />
      {summary.averageRating?.toFixed(1)} ({summary.reviewCount})
    </span>
  )
}
