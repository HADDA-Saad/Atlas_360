import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Atlas 360',
  description: 'Morocco is not a destination. It is a series of worlds — Atlas 360 exists to make those worlds accessible.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Section 1 — Mission */}
      <section className="px-8 pt-28 pb-16 max-w-3xl mx-auto text-center">
        <p className="tracking-widest text-xs text-muted-foreground font-medium uppercase mb-6">
          Our Mission
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl text-foreground font-light leading-tight">
          Morocco is not a destination. It is a series of worlds — each one asking you to slow down, look closer, and stay longer.
        </h1>
        <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Atlas 360 exists to make those worlds accessible — through curated itineraries built by people who know Morocco not as tourists, but as travelers.
        </p>
      </section>

      {/* Section 2 — How it works */}
      <section className="bg-background border-t border-border px-8 py-20">
        <p className="tracking-widest text-xs text-muted-foreground font-medium uppercase mb-12 text-center">
          How It Works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          <div>
            <span className="font-[family-name:var(--font-cormorant)] text-5xl text-primary/30 leading-none">01</span>
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-foreground mt-2">
              Choose Your Tier
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Select the level of access that matches your travel style — from essential routes to exclusive journeys.
            </p>
          </div>
          <div>
            <span className="font-[family-name:var(--font-cormorant)] text-5xl text-primary/30 leading-none">02</span>
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-foreground mt-2">
              Pick Your Itinerary
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Browse curated routes filtered by region, duration, and depth. Every itinerary is researched on the ground.
            </p>
          </div>
          <div>
            <span className="font-[family-name:var(--font-cormorant)] text-5xl text-primary/30 leading-none">03</span>
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-foreground mt-2">
              Book and Explore
            </h3>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Confirm your journey, receive your full logistics guide, and travel with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Founder note */}
      <section className="bg-card border-t border-border px-8 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="tracking-widest text-xs text-muted-foreground font-medium uppercase mb-8">
            A Note from the Founder
          </p>
          <blockquote className="font-[family-name:var(--font-cormorant)] text-2xl text-foreground font-light italic leading-relaxed">
            &ldquo;I built Atlas 360 because every time someone asked me how to travel Morocco properly, I spent an hour explaining. Now that hour lives here.&rdquo;
          </blockquote>
        </div>
      </section>
    </div>
  )
}
