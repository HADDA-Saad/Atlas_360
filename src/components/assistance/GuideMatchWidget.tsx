'use client'

import { useState, useEffect } from 'react'
import { Map } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Guide {
  id: string
  full_name: string | null
  rating: number | null
  daily_rate_mad: number
}

interface GuideMatchWidgetProps {
  region: string | null
}

export default function GuideMatchWidget({ region }: GuideMatchWidgetProps) {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!region) {
      setGuides([])
      return
    }

    const matchGuides = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        // Select verified guides
        const { data: guidesData, error } = await supabase
          .from('guides')
          .select('id, rating, daily_rate_mad, regions')
          .eq('is_verified', true)

        if (error) throw error

        // Filter in JS to avoid complex array intersections on client-side
        const matchingGuides = (guidesData || []).filter(g => 
          g.regions && g.regions.includes(region)
        )

        if (matchingGuides.length > 0) {
          const guideIds = matchingGuides.map(g => g.id)
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', guideIds)

          const mapped = matchingGuides.map(g => {
            const p = (profilesData || []).find(prof => prof.id === g.id)
            return {
              id: g.id,
              full_name: p ? p.full_name : 'Local Guide',
              rating: g.rating,
              daily_rate_mad: g.daily_rate_mad
            }
          })
          setGuides(mapped.slice(0, 2)) // Show top 2 guides
        } else {
          setGuides([])
        }
      } catch (err) {
        console.error('Failed to match guides by region:', err)
      } finally {
        setLoading(false)
      }
    }

    matchGuides()
  }, [region])

  if (!region) return null
  if (loading) {
    return (
      <div className="bg-card/40 border border-border p-4 rounded-xl space-y-3">
        <div className="h-3.5 rounded atlas-shimmer w-1/2" />
        <div className="h-12 rounded atlas-shimmer w-full" />
      </div>
    )
  }

  if (guides.length === 0) return null

  return (
    <div className="bg-card/50 border border-border/80 rounded-xl p-4 space-y-3.5 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Map size={12} />
          Local Guides Matched
        </span>
        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-semibold uppercase tracking-wider">
          {region}
        </span>
      </div>

      <div className="space-y-2.5">
        {guides.map(guide => (
          <div key={guide.id} className="flex justify-between items-center gap-3 border-b border-border/40 last:border-0 pb-2.5 last:pb-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20">
                {guide.full_name ? guide.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'LG'}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">{guide.full_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-amber-500 font-bold">★ {guide.rating?.toFixed(1) || '5.0'}</span>
                  <span className="text-muted-foreground/30 text-[9px]">•</span>
                  <span className="text-muted-foreground text-[10px]">{guide.daily_rate_mad} MAD/day</span>
                </div>
              </div>
            </div>

            <Link
              href={`/guides`}
              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all"
            >
              Book
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
