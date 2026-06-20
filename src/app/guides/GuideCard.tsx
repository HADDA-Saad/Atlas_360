'use client'

import { Star, Globe, MapPin } from 'lucide-react'

interface Guide {
  id: string
  full_name: string
  bio: string
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  rating: number
}

interface GuideCardProps {
  guide: Guide
  onBook: () => void
  onShowReviews: () => void
  compact?: boolean
}

export default function GuideCard({ guide, onBook, onShowReviews, compact = false }: GuideCardProps) {
  return (
    <div className="bg-card border border-border/80 hover:border-primary/30 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg shadow-sm">
      <div className="space-y-4">
        {/* Header: Avatar, Name, Rating */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-[family-name:var(--font-cormorant)] text-2xl font-bold text-primary">
              {guide.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground tracking-tight truncate">
              {guide.full_name}
            </h4>
            <button
              onClick={onShowReviews}
              className="flex items-center gap-1.5 mt-0.5 group hover:text-primary transition-colors cursor-pointer text-left"
              title="View reviews"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground group-hover:text-primary mt-0.5">
                {guide.rating > 0 ? guide.rating.toFixed(1) : 'No reviews'}
              </span>
              <span className="text-[10px] text-muted-foreground group-hover:text-primary mt-0.5 font-semibold uppercase tracking-wider underline decoration-dotted">
                (Reviews)
              </span>
            </button>
          </div>
          {!compact && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none">Daily Rate</p>
              <p className="text-lg font-bold text-[#D4622E] mt-1.5 leading-none">
                {guide.daily_rate_mad} <span className="text-[10px] font-semibold text-muted-foreground">MAD</span>
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        <p className="text-[12px] text-muted-foreground line-clamp-3 leading-relaxed">
          {guide.bio}
        </p>

        {/* Details: Regions, Languages */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          {/* Regions */}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {guide.regions.map(r => (
                <span key={r} className="bg-background border border-border/60 text-foreground px-2 py-0.5 rounded text-[10px] font-semibold">
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {guide.languages.map(l => (
                <span key={l} className="bg-background border border-border/60 text-foreground px-2 py-0.5 rounded text-[10px] font-semibold">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Booking Actions */}
      <div className={`mt-6 pt-4 border-t border-border/40 flex flex-col gap-4`}>
        {compact && (
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Daily Rate</span>
            <span className="text-base font-bold text-[#D4622E]">
              {guide.daily_rate_mad} <span className="text-[10px] font-semibold text-muted-foreground">MAD</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={onShowReviews}
            className="flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-widest border border-border hover:border-primary/30 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer text-center"
          >
            Reviews
          </button>
          <button
            onClick={onBook}
            className="flex-1 py-2 px-3 text-[10px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground transition-colors rounded-lg text-center shadow-md cursor-pointer"
          >
            Book Guide
          </button>
        </div>
      </div>
    </div>
  )
}
