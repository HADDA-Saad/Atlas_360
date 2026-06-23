'use client'

import { useState } from 'react'
import Image from 'next/image'
import AssistanceRequestForm from '@/components/assistance/AssistanceRequestForm'
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
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const photoUrl = place.photo_reference 
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null

  const mapUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`

  const rawPhone = place.international_phone_number || place.phone
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : null
  const whatsappMsg = encodeURIComponent("Hello, I found you on Atlas 360. I'd like to enquire about a booking. ")
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMsg}` : null

  return (
    <div className="group bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors duration-300">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border flex items-center justify-center relative">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={place.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
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

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              {place.vicinity}
            </div>
            <div className="flex items-center gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-widest text-[#25D366] hover:text-[#128C7E] font-semibold transition-colors flex-shrink-0 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Book via WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsRequestOpen((value) => !value)}
                className="text-[10px] uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                {isRequestOpen ? 'Close request' : 'Booking help'}
              </button>
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
      </div>

      {isRequestOpen && (
        <div className="mt-3 border-t border-border pt-3">
          <AssistanceRequestForm
            requestType="booking_help"
            title={`Help with ${place.name}`}
            description={`Ask Atlas 360 to help check or coordinate this ${type === 'lodging' ? 'hotel' : 'restaurant'}.`}
            sourcePath="/explore"
            place={{
              placeId: place.place_id,
              name: place.name,
              type,
            }}
            compact
          />
        </div>
      )}
    </div>
  )
}
