'use client'

import { APIProvider } from '@vis.gl/react-google-maps'
import React, { useState } from 'react'

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const googleMapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID

function MapsUnavailable({ detail }: { detail: string }) {
  return (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-[#0F0D0A] atlas-grain">
      <div className="mx-6 max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#C1440E]/25 bg-[#1A1610] text-[#C1440E] shadow-xl shadow-black/30">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25M15.75 4.5l-7.5 2.25-3-1.5v13.5l3 1.5 7.5-2.25 3 1.5V6l-3-1.5z" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-[#F0E6D8]">
          Map unavailable
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#8B7355]">
          {detail}
        </p>
      </div>
    </div>
  )
}

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [loadError, setLoadError] = useState(false)

  if (!googleMapsApiKey || !googleMapId) {
    return (
      <MapsUnavailable detail="Google Maps needs both NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAP_ID before this map can load." />
    )
  }

  if (loadError) {
    return (
      <MapsUnavailable detail="Google Maps could not load with the configured credentials. Check the API key, Map ID, billing, and referrer restrictions." />
    )
  }

  return (
    <APIProvider
      apiKey={googleMapsApiKey}
      region="MA"
      onError={() => setLoadError(true)}
    >
      {children}
    </APIProvider>
  )
}
