'use client'

import { useState } from 'react'
import GuideCard from './GuideCard'
import BookingModal from './BookingModal'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import ReviewPanel from '@/components/reviews/ReviewPanel'

interface Guide {
  id: string
  full_name: string
  bio: string
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  rating: number
}

interface GuidesDirectoryClientProps {
  initialGuides: Guide[]
}

const REGIONS = [
  'Marrakech-Safi',
  'High Atlas',
  'Sahara-Merzouga',
  'Chefchaouen-Rif',
  'Rabat-Salé',
  'Essaouira-Coast',
  'Fes-Meknes'
]

const LANGUAGES = [
  'Arabic',
  'French',
  'English',
  'Spanish',
  'Berber',
  'German',
  'Italian'
]

export default function GuidesDirectoryClient({ initialGuides }: GuidesDirectoryClientProps) {
  const [guides] = useState<Guide[]>(initialGuides)
  const [search, setSearch] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [maxRate, setMaxRate] = useState(1500)
  const [minRating, setMinRating] = useState<number>(0)
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null)
  const [reviewsGuide, setReviewsGuide] = useState<Guide | null>(null)

  // Filter logic
  const filteredGuides = guides.filter(g => {
    const matchesSearch = 
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.bio.toLowerCase().includes(search.toLowerCase())

    const matchesRegion = 
      selectedRegion === 'All' || 
      g.regions.some(r => r.toLowerCase() === selectedRegion.toLowerCase())

    const matchesLanguage = 
      selectedLanguage === 'All' || 
      g.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase())

    const matchesRate = g.daily_rate_mad <= maxRate

    const matchesRating = g.rating >= minRating

    return matchesSearch && matchesRegion && matchesLanguage && matchesRate && matchesRating
  })

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Search and Filters Sidebar */}
      <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 h-fit">
        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight border-b border-border/50 pb-3">
          Filters
        </h3>

        {/* Text Search */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Search Guide</label>
          <input
            type="text"
            placeholder="Type name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs font-semibold text-foreground outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Covered Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary/40 transition-colors"
          >
            <option value="All">All Regions</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Language Filter */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Language Spoken</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary/40 transition-colors"
          >
            <option value="All">All Languages</option>
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Minimum Rating Filter */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Minimum Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full bg-background border border-border rounded-lg py-2 px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary/40 transition-colors"
          >
            <option value="0">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4">4.0+ Stars</option>
            <option value="3">3.0+ Stars</option>
          </select>
        </div>

        {/* Rate Filter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            <span>Daily Budget Limit</span>
            <span className="text-primary font-bold">{maxRate} MAD</span>
          </div>
          <input
            type="range"
            min="200"
            max="1500"
            step="50"
            value={maxRate}
            onChange={(e) => setMaxRate(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
            <span>200 MAD</span>
            <span>1500 MAD</span>
          </div>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={() => {
            setSearch('')
            setSelectedRegion('All')
            setSelectedLanguage('All')
            setMaxRate(1500)
            setMinRating(0)
          }}
          className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-widest border border-border hover:border-primary/30 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* Guides List Grid */}
      <div className="flex-1">
        {filteredGuides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card/40 border border-border rounded-2xl">
            <svg className="w-10 h-10 text-muted-foreground/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground mb-1">No Guides Found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Try relaxing your filter criteria or search for a different name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGuides.map(guide => (
              <GuideCard 
                key={guide.id} 
                guide={guide} 
                onBook={() => setBookingGuide(guide)} 
                onShowReviews={() => setReviewsGuide(guide)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Calendar Modal Trigger */}
      {bookingGuide && (
        <BookingModal 
          guide={bookingGuide} 
          onClose={() => setBookingGuide(null)} 
        />
      )}

      {/* Slide-out Sheet Reviews Drawer */}
      <Sheet open={!!reviewsGuide} onOpenChange={(open) => !open && setReviewsGuide(null)}>
        <SheetContent className="overflow-y-auto !bg-card text-foreground !border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-[family-name:var(--font-cormorant)] text-2xl font-bold tracking-tight text-foreground">
              {reviewsGuide?.full_name} Reviews
            </SheetTitle>
          </SheetHeader>
          <div className="px-1 py-4">
            {reviewsGuide && (
              <ReviewPanel
                targetType="guide"
                guideId={reviewsGuide.id}
                title={`${reviewsGuide.full_name}`}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
