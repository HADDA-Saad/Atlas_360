'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false) // Ready for future annual toggle

  const handleSubscribe = async (tier: string) => {
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center py-20 px-4 atlas-grain">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8B7355] mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-[#8B7355]/30" />
          ATLAS 360 — REVISED PRICING · MOROCCO MARKET
          <span className="w-8 h-px bg-[#8B7355]/30" />
        </h4>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-semibold text-[#F0E6D8] leading-tight mb-4 tracking-wide">
          Accessible tiers for Moroccan users
        </h1>
        <p className="text-[14px] text-[#8B7355]">
          Monthly subscription · cancel anytime · all prices in MAD
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        
        {/* Explorer Card */}
        <div className="flex flex-col bg-[#1A1610] border border-[#E8D5B7]/10 rounded-3xl p-8 relative transition-all duration-300 hover:border-[#8B7355]/30">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-[#8B7355]/10 border border-[#8B7355]/20 text-[#BFA882] text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Explorer
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-[#F0E6D8] font-semibold">Explorer</h2>
            <p className="text-[13px] text-[#8B7355] mt-1">Discover Morocco for free</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-[#F0E6D8]">0</span>
              <span className="text-sm font-medium text-[#8B7355]">MAD</span>
            </div>
            <p className="text-[12px] text-[#8B7355]/60 mt-2">Free forever</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon /> 3 curated itineraries (Marrakech, Fes, Chefchaouen)
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon /> Interactive map + 360° Street View
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon /> Basic stop cards
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon /> Google Places tab
              </li>
              <li className="flex items-start gap-3 text-[#8B7355]/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355]/20 mt-1.5 flex-shrink-0" /> Logistics detail — locked
              </li>
              <li className="flex items-start gap-3 text-[#8B7355]/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355]/20 mt-1.5 flex-shrink-0" /> Full itinerary library — locked
              </li>
            </ul>
          </div>
          <button 
            onClick={() => router.push('/explore')}
            className="mt-8 w-full py-3.5 px-4 rounded-xl border border-[#E8D5B7]/10 text-[#F0E6D8] text-[12px] font-bold uppercase tracking-widest hover:bg-[#231F18] transition-colors"
          >
            Use free tier
          </button>
        </div>

        {/* Nomad Card (Most Popular) */}
        <div className="flex flex-col bg-[#1A1610] border border-[#C1440E]/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(193,68,14,0.05)] transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-4 py-1 bg-[#C1440E] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-[#C1440E]/20">
              Most popular
            </span>
          </div>
          <div className="mb-6 mt-2">
            <span className="inline-block px-3 py-1 bg-[#C1440E]/10 border border-[#C1440E]/20 text-[#D4622E] text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Nomad
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-[#F0E6D8] font-semibold">Nomad</h2>
            <p className="text-[13px] text-[#8B7355] mt-1">The full Morocco experience</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-[#F0E6D8]">99</span>
              <span className="text-sm font-medium text-[#8B7355]">MAD / mo</span>
            </div>
            <p className="text-[12px] text-[#8B7355]/60 mt-2">~10 USD · less than a city taxi ride</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon active /> All 10 itineraries incl. Sahara, Essaouira, Rabat...
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon active /> Full logistics: day dividers, transport, tips
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon active /> Visit duration chips per stop
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon active /> Google Places markers on map
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon active /> Priority booking slots
              </li>
              <li className="flex items-start gap-3 text-[#8B7355]/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355]/20 mt-1.5 flex-shrink-0" /> Itinerary builder — locked
              </li>
            </ul>
          </div>
          <button 
            onClick={() => handleSubscribe('nomad')}
            className="mt-8 w-full py-3.5 px-4 rounded-xl bg-[#C1440E] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#D4622E] transition-colors shadow-lg shadow-[#C1440E]/20"
          >
            Subscribe to Nomad
          </button>
        </div>

        {/* Elite Card */}
        <div className="flex flex-col bg-[#1A1610] border border-[#E8D5B7]/10 rounded-3xl p-8 relative transition-all duration-300 hover:border-amber-500/30">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Elite
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-[#F0E6D8] font-semibold">Elite</h2>
            <p className="text-[13px] text-[#8B7355] mt-1">Plan, build & share your trips</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-[#F0E6D8]">199</span>
              <span className="text-sm font-medium text-[#8B7355]">MAD / mo</span>
            </div>
            <p className="text-[12px] text-[#8B7355]/60 mt-2">~20 USD · premium full access</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> Everything in Nomad
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> Custom drag-drop itinerary builder
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> PDF export — cover + day-by-day
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> Public share link for itineraries
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> Early access to new routes
              </li>
              <li className="flex items-start gap-3 text-[#BFA882]">
                <CheckIcon premium /> VIP booking queue
              </li>
            </ul>
          </div>
          <button 
            onClick={() => handleSubscribe('elite')}
            className="mt-8 w-full py-3.5 px-4 rounded-xl border-2 border-amber-500/20 text-amber-400 text-[12px] font-bold uppercase tracking-widest hover:bg-amber-500/10 hover:border-amber-500/40 transition-colors"
          >
            Subscribe to Elite
          </button>
        </div>

      </div>
    </div>
  )
}

function CheckIcon({ active, premium }: { active?: boolean, premium?: boolean }) {
  const color = premium ? 'text-amber-400' : active ? 'text-[#C1440E]' : 'text-[#8B7355]'
  return (
    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
