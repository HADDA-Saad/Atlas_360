'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ForkItineraryButtonProps {
  itineraryId: string
  itineraryTitle: string
}

export default function ForkItineraryButton({ itineraryId, itineraryTitle }: ForkItineraryButtonProps) {
  const router = useRouter()
  const [isForking, setIsForking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFork = async () => {
    setIsForking(true)
    setError(null)
    try {
      const res = await fetch('/api/user-itineraries/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_itinerary_id: itineraryId, title: itineraryTitle }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to customise itinerary')
      }
      
      router.push(`/compose?from=${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsForking(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleFork}
        disabled={isForking}
        className="border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-[11px] uppercase tracking-widest px-4 py-2 rounded-full transition-colors disabled:opacity-50"
      >
        {isForking ? 'Forking...' : 'Customise this itinerary →'}
      </button>
      {error && <span className="text-red-400 text-[10px] uppercase">{error}</span>}
    </div>
  )
}
