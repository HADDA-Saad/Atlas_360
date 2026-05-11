'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ReviewSummaryBadge from '@/components/reviews/ReviewSummaryBadge'
import type { Itinerary, UserTier } from '@/types'

const TIER_LEVELS: Record<UserTier, number> = { explorer: 0, nomad: 1, elite: 2 }

interface ItineraryCardProps {
  itinerary: Itinerary
  isSelected: boolean
  onClick: () => void
  animationDelay?: number
}

export default function ItineraryCard({
  itinerary,
  isSelected,
  onClick,
  animationDelay = 0,
}: ItineraryCardProps) {
  const requiresTierFetch = itinerary.tier && itinerary.tier !== 'explorer'
  const [userTier, setUserTier] = useState<UserTier>('explorer')
  const [isLoadingTier, setIsLoadingTier] = useState(Boolean(requiresTierFetch))

  useEffect(() => {
    if (!requiresTierFetch) return

    const fetchTier = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
        if (data && data.tier) setUserTier(data.tier)
      }
      setIsLoadingTier(false)
    }

    fetchTier()
  }, [requiresTierFetch])

  const isLocked = !isLoadingTier && itinerary.tier && TIER_LEVELS[itinerary.tier] > TIER_LEVELS[userTier]

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      className={`atlas-stagger-item w-full text-left group ${isLocked ? 'cursor-not-allowed' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className={`
          relative overflow-hidden rounded-sm
          transition-all duration-200
          border-b
          ${isSelected
            ? 'bg-muted border-primary/35 shadow-lg shadow-primary/5'
            : 'bg-transparent border-border hover:bg-muted hover:border-primary/20'
          }
          ${isLocked ? 'opacity-70 grayscale-[0.3]' : ''}
        `}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-card border border-primary/30 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Upgrade to {itinerary.tier}</span>
            </div>
          </div>
        )}

        {/* Terracotta accent line on left edge */}
        <div
          className={`
            absolute left-0 top-3 bottom-3 w-[3px] rounded-full
            transition-all duration-500 ease-out
            ${isSelected
              ? 'bg-primary opacity-100 shadow-[0_0_8px_rgba(193,68,14,0.4)]'
              : 'bg-primary/0 opacity-0 group-hover:bg-primary/40 group-hover:opacity-100'
            }
          `}
        />

        <div className="py-5 px-5 pl-6">
          {/* Region badge + Duration */}
          <div className="flex items-center gap-2 mb-3">
            {itinerary.region && (
              <span className="
                inline-flex items-center
                px-2.5 py-0.5
                text-[10px] font-medium uppercase tracking-widest
                rounded-sm
                bg-primary/15 text-primary
                border border-primary/20
              ">
                {itinerary.region}
              </span>
            )}
            {itinerary.duration_days && (
              <span className="text-muted-foreground text-xs tracking-wide">
                {itinerary.duration_days} {itinerary.duration_days === 1 ? 'day' : 'days'}
              </span>
            )}
            <ReviewSummaryBadge
              targetType="itinerary"
              itineraryId={itinerary.id}
              className="ml-auto"
            />
          </div>

          {/* Title */}
          <h3
            className={`
              font-[family-name:var(--font-cormorant)]
              text-[1.35rem] font-semibold leading-snug
              tracking-tight
              mb-2
              transition-colors duration-300
              ${isSelected ? 'text-foreground' : 'text-secondary-foreground group-hover:text-foreground'}
            `}
          >
            {itinerary.title}
          </h3>

          {/* Description */}
          {itinerary.description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {itinerary.description}
            </p>
          )}

          {/* Explore indicator */}
          <div
            className={`
              flex items-center gap-2
              text-[11px] font-medium uppercase tracking-widest
              transition-all duration-200
              ${isSelected
                ? 'text-primary'
                : 'text-muted-foreground group-hover:text-primary'
              }
            `}
          >
            <span>{isSelected ? 'Viewing' : 'Explore'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? '' : 'group-hover:translate-x-1'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  )
}
