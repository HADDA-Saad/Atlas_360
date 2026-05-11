import Link from 'next/link'
import { BookOpen, CalendarCheck, Gift, MapPinned } from 'lucide-react'

const OFFERS = [
  {
    title: 'Digital travel books',
    price: 'Included with paid tiers',
    description: 'Downloadable route books with stops, photos, day structure, notes, and logistics.',
    icon: BookOpen,
    href: '/pricing',
  },
  {
    title: 'Planning support',
    price: 'Request based',
    description: 'Human help shaping timing, transport, route order, and special requests around Morocco.',
    icon: CalendarCheck,
    href: '#planning-help',
  },
  {
    title: 'Booking assistance',
    price: 'Partner-ready',
    description: 'A bridge from nearby hotels and restaurants to assisted availability and reservation help.',
    icon: MapPinned,
    href: '/explore',
  },
  {
    title: 'Moroccan product packs',
    price: 'Coming soon',
    description: 'Future local goods and travel-ready packs connected to the routes and regions users explore.',
    icon: Gift,
    href: '/pricing',
  },
]

export default function ProductOffersSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-12 max-w-3xl">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Products and services
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-cormorant)] text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            Clear offers travelers can understand before they commit.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
            The commercial layer starts with paid access, travel books, and assistance requests, then can grow into bookings and local product sales.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-foreground/5 md:grid-cols-2 lg:grid-cols-4">
          {OFFERS.map((offer) => {
            const Icon = offer.icon
            return (
              <article key={offer.title} className="flex min-h-[280px] flex-col bg-card p-6">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon size={21} strokeWidth={1.7} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {offer.price}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">
                  {offer.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {offer.description}
                </p>
                <Link
                  href={offer.href}
                  className="mt-6 inline-flex text-[11px] font-semibold uppercase tracking-widest text-primary transition-colors hover:text-primary/80"
                >
                  {offer.href === '#planning-help' ? 'Request help' : 'Explore'}
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
