'use client'

import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

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
    <div className="min-h-screen bg-background flex flex-col items-center py-20 px-4 atlas-grain">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-muted-foreground/30" />
          ATLAS 360 — PRICING · MOROCCO MARKET
          <span className="w-8 h-px bg-muted-foreground/30" />
        </h4>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-semibold text-foreground leading-tight mb-4 tracking-tight">
          Accessible tiers for every traveler
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Monthly subscription or one-time trip pass · cancel anytime · all prices in MAD
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        
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
                <CheckIcon /> Interactive map + 360° Street View
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> Basic stop cards
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon /> Google Places tab
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

        {/* Trip Pass Card */}
        <div className="flex flex-col bg-card border border-teal-500/25 rounded-3xl p-8 relative transition-all duration-300 hover:border-teal-500/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-4 py-1 bg-teal-500/15 text-teal-400 border border-teal-500/25 text-[10px] font-bold uppercase tracking-widest rounded-full">
              One-time
            </span>
          </div>
          <div className="mb-6 mt-2">
            <span className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
              Trip Pass
            </span>
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-foreground font-semibold tracking-tight">Trip Pass</h2>
            <p className="text-[13px] text-muted-foreground mt-1">Plan one Morocco trip</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">199</span>
              <span className="text-sm font-medium text-muted-foreground">MAD</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">~$20 USD · one-time · 30-day access</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon pass /> All 10+ curated itineraries
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon pass /> Full logistics: day dividers, transport, tips
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon pass /> Downloadable travel books (PDF)
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon pass /> Google Places markers on map
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon pass /> Valid for 30 days from purchase
              </li>
              <li className="flex items-start gap-3 text-muted-foreground/40 line-through">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 mt-1.5 flex-shrink-0" /> Itinerary builder — locked
              </li>
            </ul>
          </div>
          <button 
            onClick={() => handleSubscribe('trip_pass')}
            className="mt-8 relative w-full py-3.5 px-4 rounded-xl border-2 border-teal-500/20 text-teal-400 text-[12px] font-bold uppercase tracking-widest hover:text-teal-900 transition-colors overflow-hidden group/btn"
          >
            <span className="relative z-10">Buy Trip Pass</span>
            <div className="absolute inset-0 bg-teal-400 translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0" />
          </button>
        </div>

        {/* Nomad Card (Most Popular) */}
        <div className="flex flex-col bg-card border border-primary/30 rounded-3xl p-8 relative shadow-[0_0_40px_rgba(193,68,14,0.05)] transform lg:-translate-y-4">
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
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">99</span>
              <span className="text-sm font-medium text-muted-foreground">MAD / mo</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">~10 USD · less than a city taxi ride</p>
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
              <span className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground">199</span>
              <span className="text-sm font-medium text-muted-foreground">MAD / mo</span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 mt-2">~20 USD · premium full access</p>
          </div>
          <div className="flex-1">
            <ul className="space-y-4 text-[13px]">
              <li className="flex items-start gap-3 text-muted-foreground">
                <CheckIcon premium /> Everything in Nomad
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
    </div>
  )
}

function CheckIcon({ active, premium, pass }: { active?: boolean, premium?: boolean, pass?: boolean }) {
  const color = premium ? 'text-amber-400' : pass ? 'text-teal-400' : active ? 'text-primary' : 'text-muted-foreground'
  return (
    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
