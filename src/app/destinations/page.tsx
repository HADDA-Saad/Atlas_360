import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Destinations | Atlas 360',
  description: 'Five landscapes, one kingdom — explore Morocco by region with curated itineraries.',
}

const REGIONS = [
  {
    label: 'IMPERIAL CITIES',
    description: 'Marrakech, Fes, Rabat, Meknes — the four capitals of a storied empire',
    keywords: ['Marrakech', 'Fes', 'Rabat', 'Meknes'],
    link: '/explore?region=imperial',
  },
  {
    label: 'SAHARA & DESERT',
    description: 'Golden dunes, ancient kasbahs, and the silence of the Draa Valley',
    keywords: ['Sahara', 'Merzouga', 'Zagora', 'Ouarzazate'],
    link: '/explore?region=sahara',
  },
  {
    label: 'ATLANTIC COAST',
    description: 'Wind-swept ramparts, Andalusian architecture, and fresh Atlantic seafood',
    keywords: ['Essaouira', 'Casablanca', 'Agadir'],
    link: '/explore?region=coast',
  },
  {
    label: 'HIGH ATLAS',
    description: 'Berber villages, cinematic kasbahs, and Morocco\u2019s highest peaks',
    keywords: ['Atlas', 'Benhaddou', 'Ouarzazate'],
    link: '/explore?region=atlas',
  },
  {
    label: 'NORTHERN MOROCCO',
    description: 'The Blue Pearl of the Rif and the ancient medinas of the north',
    keywords: ['Chefchaouen', 'Tangier', 'Northern'],
    link: '/explore?region=north',
  },
]

export default async function DestinationsPage() {
  const supabase = await createClient()
  const { data: itineraries } = await supabase.from('itineraries').select('id, title, region')

  const countForRegion = (keywords: string[]) => {
    if (!itineraries) return 0
    return itineraries.filter((it) =>
      keywords.some((kw) => it.title?.toLowerCase().includes(kw.toLowerCase()) || it.region?.toLowerCase().includes(kw.toLowerCase()))
    ).length
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-8 pt-28 pb-12 max-w-6xl mx-auto">
        <p className="text-muted-foreground tracking-widest text-xs font-medium uppercase mb-4">
          Discover Morocco
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-foreground font-light leading-tight">
          Journey by Region
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-xl">
          Five landscapes, one kingdom — each with its own soul.
        </p>
      </div>

      {/* Region Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/5 max-w-6xl mx-auto">
        {REGIONS.map((region) => {
          const count = countForRegion(region.keywords)
          return (
            <Link
              key={region.label}
              href={region.link}
              className="bg-background hover:bg-card transition-all duration-200 p-8 group"
            >
              <p className="text-foreground text-xs font-medium tracking-widest uppercase mb-3">
                {region.label}
              </p>

              {/* Animated underline */}
              <div className="border-b-2 border-primary w-8 mb-4 transition-all duration-200 group-hover:w-16" />

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {region.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs tracking-widest font-medium">
                  {count > 0 ? `${count} itinerar${count === 1 ? 'y' : 'ies'}` : 'Coming soon'}
                </span>
                <span className="text-primary transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
