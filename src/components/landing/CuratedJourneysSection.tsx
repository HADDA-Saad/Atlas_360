'use client'

import Link from 'next/link'
import type { Itinerary } from '@/types'

export default function CuratedJourneysSection({ itineraries }: { itineraries: Itinerary[] }) {
  return (
    <section className="bg-secondary py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col gap-3">
            <span className="text-primary text-[10px] tracking-[0.3em] font-semibold uppercase">
              Selected Experiences
            </span>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-foreground font-semibold tracking-tight">
              Curated Journeys
            </h2>
          </div>
          <Link 
            href="/explore" 
            className="text-foreground text-sm hover:text-primary transition-colors flex items-center gap-2 group tracking-wide"
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
              className="group flex flex-col bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-500"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={itinerary.cover_image_url ?? '/Images/jame3.png'} 
                  alt={itinerary.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Duration Badge */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-border px-3 py-1.5 rounded-sm">
                  <span className="text-primary text-[10px] font-bold tracking-widest uppercase">
                    {itinerary.duration_days ? itinerary.duration_days + ' DAYS' : '— DAYS'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-foreground mb-3 tracking-tight">
                  {itinerary.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                  {itinerary.description ?? ''}
                </p>
                <Link 
                  href="/explore"
                  className="relative w-full py-3 px-4 border border-border text-foreground text-xs font-semibold tracking-widest uppercase text-center overflow-hidden group/btn transition-colors duration-300 hover:border-primary hover:text-primary-foreground"
                >
                  <span className="relative z-10">View Details</span>
                  <div className="absolute inset-0 bg-primary translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
