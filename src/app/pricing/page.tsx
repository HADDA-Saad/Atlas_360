'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'month' | 'year'>('month')

  const handleSubscribe = async (tier: string) => {
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing }),
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

  const nomadPrice = billing === 'month' ? '99' : '990'
  const elitePrice = billing === 'month' ? '199' : '1990'
  const conciergePrice = billing === 'month' ? '1000' : '10000'
  const period = billing === 'month' ? 'MAD / mo' : 'MAD / yr'

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4 atlas-grain">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-muted-foreground/30" />
          ATLAS 360 — PRICING · MOROCCO MARKET
          <span className="w-8 h-px bg-muted-foreground/30" />
        </h4>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-semibold text-foreground leading-tight mb-4 tracking-tight">
          Accessible tiers for every traveler
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Monthly or yearly subscription · cancel anytime · all prices in MAD
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center gap-3 mb-12">
        <span className={`text-[13px] font-medium ${billing === 'month' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBilling(b => b === 'month' ? 'year' : 'month')}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${billing === 'year' ? 'bg-primary' : 'bg-muted-foreground/20'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${billing === 'year' ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
        <span className={`text-[13px] font-medium ${billing === 'year' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        {billing === 'year' && (
          <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
            Save 2 months
          </span>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">

        {/* Explorer Card */}
        <div className="flex flex-col bg-card border border-border rounded-3xl p-8 relative transition-all duration-300 hover:border-muted-foreground/30">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-muted-foreground/10 border border-muted-foreground/20 text-muted-foreground text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Explorer
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-foreground font-semibold tracking-tight">Explorer</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Discover Morocco for free</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">0</span>
              <span className="text-sm font-medium text-muted-foreground">MAD</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">Free forever</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> 3 curated itineraries (Marrakech, Fes, Chefchaouen)
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> Interactive map + 360° Street View (3 views)
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> Basic stop cards
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> Google Places tab
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> 1 free AI itinerary generation
              </li>
              <li className="flex items-start gap-3 text-muted-foreground/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 mt-1.5 flex-shrink-0" /> Logistics detail — locked
              </li>
              <li className="flex items-start gap-3 text-muted-foreground/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 mt-1.5 flex-shrink-0" /> Full itinerary library — locked
              </li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/explore')}
            className="mt-8 relative w-full py-3.5 px-4 rounded-xl border border-border text-foreground text-[12px] font-bold uppercase tracking-widest overflow-hidden group/btn hover:border-primary hover:text-primary-foreground transition-colors"
          >
            <span className="relative z-10">Use free tier</span>
            <div className="absolute inset-0 bg-primary translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </button>
        </div>

        {/* Nomad Card (Most Popular) */}
        <div className="flex flex-col bg-card border border-primary/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(193,68,14,0.05)] transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-4 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
              Most popular
            </span>
          </div>
          <div className="mb-6 mt-2">
            <span className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-[#D4622E] text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Nomad
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-foreground font-semibold tracking-tight">Nomad</h2>
            <p className="text-[13px] text-muted-foreground mt-1">The full Morocco experience</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">{nomadPrice}</span>
              <span className="text-sm font-medium text-muted-foreground">{period}</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">
              {billing === 'month' ? '~10 USD · less than a city taxi ride' : '~100 USD · 2 months free'}
            </p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> All 10+ itineraries incl. Sahara, Essaouira, Rabat...
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> Full logistics: day dividers, transport, tips
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> Visit duration chips per stop
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> Google Places markers on map
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> Priority booking slots
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon active /> 6 AI itinerary generations
              </li>
              <li className="flex items-start gap-3 text-muted-foreground/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 mt-1.5 flex-shrink-0" /> Itinerary builder — locked
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe('nomad')}
            className="mt-8 relative w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 overflow-hidden group/btn"
          >
            <span className="relative z-10">Subscribe to Nomad</span>
            <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>

        {/* Elite Card */}
        <div className="flex flex-col bg-card border border-border rounded-3xl p-8 relative transition-all duration-300 hover:border-amber-500/30">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Elite
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-foreground font-semibold tracking-tight">Elite</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Plan, build & share your trips</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">{elitePrice}</span>
              <span className="text-sm font-medium text-muted-foreground">{period}</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">
              {billing === 'month' ? '~20 USD · premium full access' : '~200 USD · 2 months free'}
            </p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Everything in Nomad
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Unlimited AI itinerary generation
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Custom drag-drop itinerary builder
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> PDF export — cover + day-by-day
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Public share link for itineraries
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Early access to new routes
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> VIP booking queue
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleSubscribe('elite')}
            className="mt-8 relative w-full py-3.5 px-4 rounded-xl border-2 border-amber-500/20 text-amber-400 text-[12px] font-bold uppercase tracking-widest hover:text-amber-900 transition-colors overflow-hidden group/btn"
          >
            <span className="relative z-10">Subscribe to Elite</span>
            <div className="absolute inset-0 bg-amber-400 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </button>
        </div>

      </div>

      {/* Concierge Plan (Bottom/Full-width) */}
      <div className="max-w-5xl mx-auto w-full mt-8">
        <div className="flex flex-col lg:flex-row bg-card border border-purple-500/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(168,85,247,0.03)] transition-all duration-300 hover:border-purple-500/50 justify-between gap-8">
          <div className="absolute top-0 left-6 -translate-y-1/2">
            <span className="px-4 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-purple-500/20">
              ULTRA-PREMIUM
            </span>
          </div>
          
          <div className="flex-1 min-w-[280px]">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold uppercase tracking-widest rounded-full mb-4">
                Concierge
              </span>
              <h2 className="text-3xl font-[family-name:var(--font-cormorant)] text-foreground font-semibold tracking-tight">Concierge</h2>
              <p className="text-[13px] text-muted-foreground mt-1">The ultimate tailor-made Moroccan travel experience</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">{conciergePrice}</span>
                <span className="text-sm font-medium text-muted-foreground">{period}</span>
              </div>
              <p className="text-[12px] text-muted-foreground/60 mt-2">
                {billing === 'month' ? '~100 USD · complete personal coordination' : '~1000 USD · 2 months free'}
              </p>
            </div>
          </div>

          <div className="flex-[2] border-t border-border lg:border-t-0 lg:border-l lg:border-r border-dashed border-border/60 lg:px-8 py-6 lg:py-0">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">What's included:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> <span className="font-semibold text-foreground">Everything in Elite</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> 24/7 Dedicated Local Concierge
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> Human Itinerary Review & Audit
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> 0% Booking Commission on Guides
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> Collaboration with up to 10 travelers
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> White-Label PDF Compilation
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> Invitation-Only VIP Experiences
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <CheckIcon concierge /> Priority airport & driver bookings
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center min-w-[200px] border-t border-border lg:border-t-0 pt-6 lg:pt-0">
            <button
              onClick={() => handleSubscribe('concierge')}
              className="w-full py-4 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Subscribe to Concierge
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-3 leading-relaxed">
              Charged {billing === 'month' ? 'monthly' : 'yearly'} · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ active, premium, concierge }: { active?: boolean, premium?: boolean, concierge?: boolean }) {
  const color = concierge ? 'text-purple-400' : premium ? 'text-amber-400' : active ? 'text-primary' : 'text-muted-foreground'
  return (
    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
