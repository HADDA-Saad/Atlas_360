'use client'

import { useState, type FormEvent } from 'react'
import type { PlaceType } from '@/types'

type RequestType = 'planning' | 'booking_help'

interface AssistanceRequestFormProps {
  requestType: RequestType
  title: string
  description: string
  sourcePath?: string
  itineraryId?: string | null
  place?: {
    placeId: string
    name: string
    type: PlaceType
  }
  compact?: boolean
}

function getDefaultMessage(requestType: RequestType, placeName?: string) {
  if (requestType === 'booking_help' && placeName) {
    return `I would like help booking or checking availability for ${placeName}.`
  }

  return 'I would like help planning logistics, bookings, and timing for my Morocco trip.'
}

export default function AssistanceRequestForm({
  requestType,
  title,
  description,
  sourcePath,
  itineraryId,
  place,
  compact = false,
}: AssistanceRequestFormProps) {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [message, setMessage] = useState(getDefaultMessage(requestType, place?.name))
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    try {
      const res = await fetch('/api/assistance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: requestType,
          contact_name: contactName,
          contact_email: contactEmail,
          message,
          source_path: sourcePath,
          itinerary_id: itineraryId,
          place_id: place?.placeId,
          place_name: place?.name,
          place_type: place?.type,
        }),
      })
      const payload = await res.json() as { error?: string }

      if (!res.ok) {
        throw new Error(payload.error || 'Could not send request')
      }

      setStatus('success')
      setMessage(getDefaultMessage(requestType, place?.name))
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not send request')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border border-border bg-card/70 ${compact ? 'p-3' : 'p-5'}`}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
          {requestType === 'booking_help' ? 'Booking help' : 'Planning support'}
        </p>
        <h3 className={`mt-1 font-[family-name:var(--font-cormorant)] font-semibold text-foreground ${compact ? 'text-xl' : 'text-2xl'}`}>
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        <input
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          placeholder="Your name"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
        />
        <input
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          type="email"
          placeholder="Email for follow-up"
          required
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
        />
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
        minLength={10}
        className="mt-3 min-h-[86px] w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {status === 'success' && (
        <p className="mt-2 text-xs text-green-400">
          Request sent. Atlas 360 can now follow up from the assistance queue.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending...' : requestType === 'booking_help' ? 'Request booking help' : 'Request planning help'}
      </button>
    </form>
  )
}
