'use client'

import { useState, useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import BookingModal from '@/app/guides/BookingModal'

interface Guide {
  id: string
  full_name: string
  bio: string
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  rating: number
}

interface GuideMatchWidgetProps {
  region: string | null
  itineraryId?: string | null
}

export default function GuideMatchWidget({ region, itineraryId }: GuideMatchWidgetProps) {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null)

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        
        // Fetch all verified guides
        const { data: guidesData, error } = await supabase
          .from('guides')
          .select(`
            id,
            bio,
            languages,
            regions,
            daily_rate_mad,
            rating,
            profiles (
              full_name
            )
          `)
          .eq('is_verified', true)

        if (error) throw error

        if (guidesData) {
          const formatted: Guide[] = guidesData.map((g: any) => {
            const profile = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles
            return {
              id: g.id,
              bio: g.bio || '',
              languages: (g.languages as string[]) || [],
              regions: (g.regions as string[]) || [],
              daily_rate_mad: g.daily_rate_mad || 300,
              rating: g.rating || 4.8,
              full_name: profile?.full_name || 'Verified Local Guide'
            }
          })

          const regionLower = region?.toLowerCase() || ''
          
          // Filter matching guides
          const localMatches = formatted.filter(g =>
            g.regions.some((r: string) => r.toLowerCase() === regionLower)
          )

          if (localMatches.length > 0) {
            // Sort local matches by rating
            const sorted = localMatches.sort((a, b) => b.rating - a.rating)
            setGuides(sorted.slice(0, 2))
          } else {
            // Fallback: Sort all verified guides by rating and show top 2
            const sortedFallback = formatted.sort((a, b) => b.rating - a.rating)
            setGuides(sortedFallback.slice(0, 2))
          }
        }
      } catch (err) {
        console.error('Failed to match guides:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [region])

  if (loading) {
    return (
      <div className="bg-card/40 border border-border p-4 rounded-xl space-y-3">
        <div className="h-3.5 rounded atlas-shimmer w-1/2" />
        <div className="h-12 rounded atlas-shimmer w-full" />
      </div>
    )
  }

  if (guides.length === 0) return null

  const regionLower = region?.toLowerCase() || ''
  const hasLocalMatch = guides.some(g => g.regions.some(r => r.toLowerCase() === regionLower))

  return (
    <div className="bg-card/50 border border-border/80 rounded-xl p-4 space-y-3.5 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {hasLocalMatch ? `Guides for ${region} 📍` : 'Top Rated Guides 🛡️'}
        </span>
        {!hasLocalMatch && region && (
          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
            No direct match
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {guides.map(guide => (
          <div key={guide.id} className="flex justify-between items-center gap-3 border-b border-border/40 last:border-0 pb-2.5 last:pb-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 flex-shrink-0">
                {guide.full_name ? guide.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'LG'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground leading-tight truncate">{guide.full_name}</p>
                <div className="flex items-center gap-1 mt-0.5 text-[10px]">
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {guide.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground/30 font-bold">•</span>
                  <span className="text-muted-foreground font-semibold truncate">{guide.daily_rate_mad} MAD/day</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setBookingGuide(guide)}
              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer flex-shrink-0"
            >
              Hire
            </button>
          </div>
        ))}
      </div>

      {bookingGuide && (
        <BookingModal
          guide={bookingGuide}
          onClose={() => setBookingGuide(null)}
          itineraryId={itineraryId || undefined}
        />
      )}
    </div>
  )
}
