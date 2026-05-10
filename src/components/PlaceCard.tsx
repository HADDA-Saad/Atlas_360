import React from 'react'
import type { PlaceResult, PlaceType } from '@/types'

interface PlaceCardProps {
  place: PlaceResult
  type: PlaceType
}

export function PlaceCardSkeleton() {
  return (
    <div className="flex bg-card border border-border rounded-xl p-3 gap-4 animate-pulse">
      <div className="w-20 h-20 bg-foreground/10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 bg-foreground/10 rounded w-3/4" />
        <div className="h-3 bg-foreground/10 rounded w-1/2" />
        <div className="h-3 bg-foreground/10 rounded w-full" />
      </div>
    </div>
  )
}

export default function PlaceCard({ place, type }: PlaceCardProps) {
  const photoUrl = place.photo_reference 
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null

  const mapUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`

  return (
    <div className="group flex bg-card border border-border rounded-xl p-3 gap-4 hover:border-primary/30 transition-colors duration-300">
      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border flex items-center justify-center">
        {photoUrl ? (
          <img src={photoUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground/40 flex flex-col items-center">
            {type === 'lodging' ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-0.5 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-[family-name:var(--font-cormorant)] text-[18px] font-semibold text-foreground truncate leading-none">
            {place.name}
          </h4>
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
            {type === 'lodging' ? 'Hotel' : 'Restaurant'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-1.5">
          {place.rating !== null ? (
            <div className="flex items-center">
              <span className="text-secondary-foreground text-xs font-medium mr-1">{place.rating.toFixed(1)}</span>
              <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {place.user_ratings_total !== null && (
                <span className="text-[10px] text-muted-foreground ml-1">({place.user_ratings_total} reviews)</span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">No rating</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
            {place.vicinity}
          </div>
          <a 
            href={mapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            Open in Maps
          </a>
        </div>
      </div>
    </div>
  )
}
