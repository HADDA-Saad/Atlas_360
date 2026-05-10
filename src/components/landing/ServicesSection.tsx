'use client'

import Link from 'next/link'
import {
  Binoculars,
  BookOpen,
  Camera,
  ConciergeBell,
  Hotel,
  Map,
  Route,
  ShoppingBag,
} from 'lucide-react'

const SERVICES = [
  {
    title: 'Curated Moroccan routes',
    description: 'Hand-built journeys organized by region, duration, tier, and travel rhythm.',
    status: 'Live',
    icon: Route,
    tone: 'text-primary',
  },
  {
    title: 'Interactive maps',
    description: 'Exact stop coordinates, connected route lines, satellite mode, and place markers.',
    status: 'Live',
    icon: Map,
    tone: 'text-sky-300',
  },
  {
    title: '360 previews',
    description: 'Street View panoramas for available stops before the traveler commits.',
    status: 'Live',
    icon: Camera,
    tone: 'text-emerald-300',
  },
  {
    title: 'Travel magazine export',
    description: 'Downloadable itinerary books with days, stops, photos, tips, and logistics.',
    status: 'Live',
    icon: BookOpen,
    tone: 'text-amber-300',
  },
  {
    title: 'Nearby stays and tables',
    description: 'Hotel and restaurant discovery around itinerary stops through Google Places.',
    status: 'Live',
    icon: Hotel,
    tone: 'text-rose-300',
  },
  {
    title: 'Custom itinerary builder',
    description: 'Elite travelers can compose, save, export, and share their own journeys.',
    status: 'Elite',
    icon: Binoculars,
    tone: 'text-violet-300',
  },
  {
    title: 'Booking bridge',
    description: 'Assisted hotel, restaurant, and local experience coordination for future partner flows.',
    status: 'Assisted',
    icon: ConciergeBell,
    tone: 'text-teal-300',
  },
  {
    title: 'Moroccan products',
    description: 'A future shop for travel-ready goods and local products connected to the journey.',
    status: 'Soon',
    icon: ShoppingBag,
    tone: 'text-lime-300',
  },
]

export default function ServicesSection() {
  return (
    <section className="bg-secondary dark:bg-[#12100C] border-y border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              What Atlas 360 Provides
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Everything around the route, not just the map.
            </h2>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center border border-primary/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-foreground transition-colors hover:border-primary hover:bg-primary/10 md:self-end"
          >
            Compare Plans
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-foreground/5 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <article
                key={service.title}
                className="bg-background p-6 transition-colors hover:bg-muted"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-foreground/[0.06] ${service.tone}`}>
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <span className="rounded-sm border border-border px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {service.status}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
