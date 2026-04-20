'use client'

import type { Itinerary } from '@/types'

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
  return (
    <button
      onClick={onClick}
      className="atlas-stagger-item w-full text-left group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className={`
          relative overflow-hidden rounded-xl
          transition-all duration-500 ease-out
          border
          ${isSelected
            ? 'bg-[#231F18] border-[#C1440E]/40 shadow-lg shadow-[#C1440E]/5'
            : 'bg-[#1A1610]/60 border-[#E8D5B7]/6 hover:bg-[#1A1610] hover:border-[#E8D5B7]/12'
          }
        `}
      >
        {/* Terracotta accent line on left edge */}
        <div
          className={`
            absolute left-0 top-3 bottom-3 w-[3px] rounded-full
            transition-all duration-500 ease-out
            ${isSelected
              ? 'bg-[#C1440E] opacity-100 shadow-[0_0_8px_rgba(193,68,14,0.4)]'
              : 'bg-[#C1440E]/0 opacity-0 group-hover:bg-[#C1440E]/40 group-hover:opacity-100'
            }
          `}
        />

        <div className="p-5 pl-6">
          {/* Region badge + Duration */}
          <div className="flex items-center gap-2 mb-3">
            {itinerary.region && (
              <span className="
                inline-flex items-center
                px-2.5 py-0.5
                text-[10px] font-semibold uppercase tracking-[0.15em]
                rounded-full
                bg-[#C1440E]/10 text-[#D4622E]
                border border-[#C1440E]/15
              ">
                {itinerary.region}
              </span>
            )}
            {itinerary.duration_days && (
              <span className="text-[11px] text-[#8B7355] tracking-wide">
                {itinerary.duration_days} {itinerary.duration_days === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`
              font-[family-name:var(--font-cormorant)]
              text-[1.35rem] font-semibold leading-snug
              tracking-wide
              mb-2
              transition-colors duration-300
              ${isSelected ? 'text-[#F0E6D8]' : 'text-[#E8D5B7] group-hover:text-[#F0E6D8]'}
            `}
          >
            {itinerary.title}
          </h3>

          {/* Description */}
          {itinerary.description && (
            <p className="text-[13px] text-[#8B7355] leading-relaxed line-clamp-2 mb-3">
              {itinerary.description}
            </p>
          )}

          {/* Explore indicator */}
          <div
            className={`
              flex items-center gap-2
              text-[11px] font-medium uppercase tracking-[0.2em]
              transition-all duration-300
              ${isSelected
                ? 'text-[#C1440E]'
                : 'text-[#8B7355]/60 group-hover:text-[#BFA882]'
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
