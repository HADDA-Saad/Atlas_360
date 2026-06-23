'use client'

import { useState } from 'react'
import Image from 'next/image'

export interface ReviewWithProfile {
  id: string
  user_id: string
  target_type: string
  itinerary_id: string | null
  location_id: string | null
  guide_id: string | null
  rating: number
  body: string
  status: string
  photo_urls: string[]
  photo_approved: boolean
  created_at: string
  full_name: string | null
}

interface PhotoModerationTabProps {
  initialReviews: ReviewWithProfile[]
}

export default function PhotoModerationTab({ initialReviews }: PhotoModerationTabProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>(initialReviews)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (reviewId: string) => {
    setUpdatingId(reviewId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo_approved: true }),
      })

      if (res.ok) {
        const updated = await res.json()
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, photo_approved: updated.photo_approved } : r))
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to approve photos.')
      }
    } catch {
      setError('Network error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReject = async (reviewId: string) => {
    setUpdatingId(reviewId)
    setError(null)

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clear_photos: true }),
      })

      if (res.ok) {
        const updated = await res.json()
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, photo_urls: updated.photo_urls, photo_approved: updated.photo_approved } : r))
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to reject photos.')
      }
    } catch {
      setError('Network error occurred.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter reviews to only show those that have photos
  const reviewsWithPhotos = reviews.filter(r => r.photo_urls && r.photo_urls.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-semibold text-foreground tracking-tight">
          Review Image Moderation
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Review and approve photos uploaded by travelers before they appear publicly on stops, guides, or itineraries.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {reviewsWithPhotos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No review photos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviewsWithPhotos.map(review => (
            <div
              key={review.id}
              className="border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors bg-card/50 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground">
                      {review.full_name || 'Anonymous Traveler'}
                    </h3>
                    <p className="text-[10.5px] text-muted-foreground mt-0.5">
                      Review Target: <span className="text-foreground font-semibold uppercase">{review.target_type}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < review.rating ? 'text-amber-500' : 'text-muted-foreground/30'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground text-[12.5px] mt-3 italic leading-relaxed">
                  &ldquo;{review.body}&rdquo;
                </p>

                {/* Photo Gallery preview */}
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {review.photo_urls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={url}
                        alt={`Review Upload ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  review.photo_approved
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {review.photo_approved ? 'Approved' : 'Pending Approval'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={updatingId === review.id}
                    className="px-3.5 py-1.5 border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    Clear Photos
                  </button>
                  {!review.photo_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={updatingId === review.id}
                      className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/95 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {updatingId === review.id ? 'Approving...' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
