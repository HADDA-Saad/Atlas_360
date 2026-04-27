'use client'

import Link from 'next/link'
import type { Itinerary } from '@/types'

export default function CuratedJourneysSection({ itineraries }: { itineraries: Itinerary[] }) {
  return (
    <section className="bg-[#12100C] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col gap-3">
            <span className="text-[#C1440E] text-[10px] tracking-[0.3em] font-semibold uppercase">
              Selected Experiences
            </span>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-white font-semibold">
              Curated Journeys
            </h2>
          </div>
          <Link 
            href="/explore" 
            className="text-[#F0E6D8] text-sm hover:text-[#C1440E] transition-colors flex items-center gap-2 group tracking-wide"
          >
            View All Experiences
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {itineraries.map((itinerary) => (
            <div 
              key={itinerary.id} 
              className="group flex flex-col bg-[#1A1814] border border-white/5 overflow-hidden hover:border-[#C1440E]/30 transition-colors duration-500"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={itinerary.cover_image_url ?? '/Images/jame3.png'} 
                  alt={itinerary.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Duration Badge */}
                <div className="absolute top-4 right-4 bg-[#0F0D0A]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-sm">
                  <span className="text-[#C1440E] text-[10px] font-bold tracking-widest uppercase">
                    {itinerary.duration_days ? itinerary.duration_days + ' DAYS' : '— DAYS'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-white mb-3">
                  {itinerary.title}
                </h3>
                <p className="text-[#8B7355] text-sm leading-relaxed mb-8 flex-1">
                  {itinerary.description ?? ''}
                </p>
                <Link 
                  href="/explore"
                  className="w-full py-3 px-4 border border-[#8B7355]/30 text-[#F0E6D8] text-xs font-semibold tracking-widest uppercase text-center hover:bg-[#C1440E] hover:border-[#C1440E] transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
