'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'

interface Props {
  guideId: string
  guideName: string
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          className={`p-0.5 transition-colors ${onChange ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
        >
          <Star
            size={16}
            className={n <= value ? 'fill-[#C1440E] text-primary' : 'text-muted-foreground/30'}
          />
        </button>
      ))}
    </div>
  )
}

export default function GuideReviewInline({ guideId, guideName }: Props) {
  const [existing, setExisting] = useState<{ id: string; rating: number; body: string } | null>(null)
  const [open, setOpen]         = useState(false)
  const [rating, setRating]     = useState(5)
  const [body, setBody]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [done, setDone]             = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?target_type=guide&guide_id=${guideId}`)
      .then(r => r.json())
      .then(data => {
        const own = (data.reviews ?? []).find((r: any) => r.is_own)
        if (own) {
          setExisting({ id: own.id, rating: own.rating, body: own.body })
          setRating(own.rating)
          setBody(own.body)
        }
      })
      .catch(() => {})
  }, [guideId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: 'guide', guide_id: guideId, rating, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save review')
      setExisting({ id: data.id, rating: data.rating, body: data.body })
      setDone(true)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteReview() {
    if (!existing) return
    setDeleting(true)
    try {
      await fetch(`/api/reviews/${existing.id}`, { method: 'DELETE' })
      setExisting(null)
      setRating(5)
      setBody('')
      setDone(false)
      setOpen(false)
    } catch {
      // silently ignore
    } finally {
      setDeleting(false)
    }
  }

  // Already reviewed — show compact summary + edit toggle
  if (existing && !open) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars value={existing.rating} />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-green-400/80">✓ Verified booking</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="text-[10px] text-primary/70 hover:text-primary uppercase tracking-widest font-semibold transition-colors"
            >
              Edit
            </button>
            <button
              onClick={deleteReview}
              disabled={deleting}
              className="text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-40"
              aria-label="Delete review"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{existing.body}</p>
      </div>
    )
  }

  // Not yet reviewed — button to open form
  if (!existing && !open) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg border border-primary/30 text-primary/80 hover:border-primary hover:text-primary hover:bg-primary/5 text-[10px] font-semibold uppercase tracking-widest transition-all"
        >
          {done ? 'Review submitted ✓' : 'Leave a Review'}
        </button>
        {done && (
          <span className="text-[10px] text-green-400/80 font-semibold">✓ Verified booking</span>
        )}
      </div>
    )
  }

  // Form open
  return (
    <form onSubmit={submit} className="rounded-xl border border-border/60 bg-card/30 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-foreground">
            {existing ? 'Update your review' : `Review ${guideName}`}
          </p>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-green-400/80">✓ Verified booking</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      <Stars value={rating} onChange={setRating} />

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="What should future travelers know about this guide?"
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/15"
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      <div className="flex items-center justify-between">
        {existing && (
          <button
            type="button"
            onClick={deleteReview}
            disabled={deleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-40"
            aria-label="Delete review"
          >
            <Trash2 size={13} />
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || body.trim().length < 3}
          className="ml-auto rounded-lg bg-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving…' : existing ? 'Update' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
