'use client'

import Link from 'next/link'
import {
  Binoculars,
  BookOpen,
  Camera,
  ConciergeBell,
  HeartHandshake,
  Hotel,
  MessageSquareText,
  Map,
  Route,
  ShoppingBag,
} from 'lucide-react'

const SERVICES = [
  {
    title: 'Curated routes',
    description: 'Hand-built Moroccan journeys organized by region, duration, access tier, and travel rhythm.',
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
    description: 'Street View panoramas for available stops, with graceful fallback states when coverage is missing.',
    status: 'Live',
    icon: Camera,
    tone: 'text-emerald-300',
  },
  {
    title: 'Travel books',
    description: 'Magazine-style itinerary pages and downloadable books with days, stops, photos, tips, and logistics.',
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
    title: 'Traveler feedback',
    description: 'Text reviews and star ratings help future travelers understand each journey and stop.',
    status: 'Live',
    icon: MessageSquareText,
    tone: 'text-indigo-300',
  },
  {
    title: 'Custom builder',
    description: 'Elite travelers can compose, save, export, and share their own journeys.',
    status: 'Elite',
    icon: Binoculars,
    tone: 'text-violet-300',
  },
  {
    title: 'Booking bridge',
    description: 'A planned assisted flow for hotel, restaurant, and local experience coordination.',
    status: 'Next',
    icon: ConciergeBell,
    tone: 'text-teal-300',
  },
  {
    title: 'Planning support',
    description: 'A human collaboration layer for logistics, special requests, and higher-touch travel planning.',
    status: 'Next',
    icon: HeartHandshake,
    tone: 'text-orange-300',
  },
  {
    title: 'Moroccan products',
    description: 'A future shop for travel-ready goods, local products, and premium digital travel packs.',
    status: 'Soon',
    icon: ShoppingBag,
    tone: 'text-lime-300',
  },
]

export default function ServicesSection() {
  const liveCount = SERVICES.filter((service) => service.status === 'Live').length

  return (
    <section className="bg-secondary border-y border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              What Atlas 360 Provides
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              A travel companion built around the whole journey.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Atlas 360 combines route discovery, immersive previews, printable travel books, nearby recommendations, and the first layer of assisted planning for Morocco.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-background">
              <div className="px-4 py-3 text-center">
                <span className="block font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">{liveCount}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Live</span>
              </div>
              <div className="border-x border-border px-4 py-3 text-center">
                <span className="block font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">2</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Next</span>
              </div>
              <div className="px-4 py-3 text-center">
                <span className="block font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">1</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Soon</span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="relative inline-flex items-center justify-center border border-primary/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-foreground transition-colors md:self-end overflow-hidden group/btn hover:border-primary hover:text-primary-foreground"
            >
              <span className="relative z-10">Compare Plans</span>
              <div className="absolute inset-0 bg-primary translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-foreground/5 md:grid-cols-2 lg:grid-cols-5">
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
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </article>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors"
          >
            See what&apos;s included at each tier →
          </Link>
        </div>
      </div>
    </section>
  )
}
