'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'

interface Guide {
  id: string
  bio: string | null
  languages: string[]
  regions: string[]
  daily_rate_mad: number
  is_verified: boolean
  rating: number | null
  full_name: string | null
  completedTrips: number
  reviewCount: number
  responseRate: number | null
  memberSince: number | null
}

interface Itinerary {
  id: string
  title: string
}

interface GuidesClientProps {
  guides: Guide[]
  itineraries: Itinerary[]
  user: any
}

const AVAILABLE_LANGUAGES = ['Arabic', 'French', 'English', 'Berber', 'Spanish', 'German', 'Italian']
const AVAILABLE_REGIONS = ['Marrakech-Safi', 'High Atlas', 'Sahara-Merzouga', 'Chefchaouen-Rif', 'Rabat-Salé', 'Essaouira-Coast', 'Fes-Meknes']

function TrustStats({
  completedTrips, rating, reviewCount, responseRate, memberSince, compact = false,
}: {
  completedTrips: number
  rating: number | null
  reviewCount: number
  responseRate: number | null
  memberSince: number | null
  compact?: boolean
}) {
  const hasActivity = completedTrips > 0 || reviewCount > 0 || rating !== null

  if (!hasActivity) {
    return (
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
        New guide
      </span>
    )
  }

  const parts: string[] = []
  if (completedTrips > 0) parts.push(`${completedTrips} trip${completedTrips === 1 ? '' : 's'}`)
  if (rating !== null) {
    parts.push(reviewCount > 0 ? `${rating.toFixed(1)} ★ (${reviewCount})` : `${rating.toFixed(1)} ★`)
  } else if (reviewCount > 0) {
    parts.push(`${reviewCount} review${reviewCount === 1 ? '' : 's'}`)
  }
  if (!compact && responseRate !== null && responseRate > 0) parts.push(`${responseRate}% response rate`)
  if (!compact && memberSince) parts.push(`Since ${memberSince}`)

  return (
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-medium leading-relaxed">
      {parts.join(' · ')}
    </span>
  )
}

export default function GuidesClient({ guides, itineraries, user }: GuidesClientProps) {
  const router = useRouter()

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [maxPrice, setMaxPrice] = useState(2000)

  // Modal states
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null)
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null)

  // Booking form states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedItineraryId, setSelectedItineraryId] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [checkingDates, setCheckingDates] = useState(false)
  const [avail, setAvail] = useState<{ blockedDays: string[]; activeRanges: { start: string; end: string }[] }>({
    blockedDays: [],
    activeRanges: [],
  })

  // Fetch availability once when the modal opens for a guide
  useEffect(() => {
    if (!bookingGuide) {
      setAvail({ blockedDays: [], activeRanges: [] })
      return
    }
    const ctrl = new AbortController()
    setCheckingDates(true)
    fetch(`/api/guides/${bookingGuide.id}/availability`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => setAvail({
        blockedDays: data.blockedDays ?? [],
        activeRanges: data.activeRanges ?? [],
      }))
      .catch(() => {})
      .finally(() => setCheckingDates(false))
    return () => ctrl.abort()
  }, [bookingGuide?.id])

  // Filtered guides calculation
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = (guide.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (guide.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRegion = selectedRegion === 'all' || guide.regions.includes(selectedRegion)
    const matchesLanguage = selectedLanguage === 'all' || guide.languages.includes(selectedLanguage)
    const matchesPrice = guide.daily_rate_mad <= maxPrice

    return matchesSearch && matchesRegion && matchesLanguage && matchesPrice
  })

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingGuide) return

    if (!user) {
      router.push('/auth/login?redirect=/guides')
      return
    }

    if (!startDate || !endDate) {
      setBookingError('Start date and End date are required.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      setBookingError('End date cannot be before start date.')
      return
    }

    setBookingLoading(true)
    setBookingError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guide_id: bookingGuide.id,
          itinerary_id: selectedItineraryId.trim() !== '' ? selectedItineraryId : null,
          start_date: startDate,
          end_date: endDate,
          terms_agreed: true,
        }),
      })

      if (res.ok) {
        setBookingSuccess(true)
        setTimeout(() => {
          setBookingSuccess(false)
          setBookingGuide(null)
          setStartDate('')
          setEndDate('')
          setSelectedItineraryId('')
          setTermsAgreed(false)
          router.push('/my-bookings')
        }, 2000)
      } else {
        const data = await res.json()
        setBookingError(data.error || 'Failed to submit booking request.')
      }
    } catch {
      setBookingError('Network error occurred. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'LG'
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background py-28 px-4 atlas-grain relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-semibold text-foreground tracking-tight">
            Meet Our Verified Guides
          </h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Connect with certified local experts across Morocco to guide your Sahara trek, Medina walking tours, or Atlas summit journeys.
          </p>
        </div>

        {/* Search & Filters Panel */}
        <div className="bg-card/50 border border-border rounded-2xl p-6 mb-12 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Keyword Search */}
          <div className="space-y-2 col-span-1 md:col-span-1">
            <label htmlFor="search" className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Search Guide</label>
            <input
              id="search"
              type="text"
              placeholder="Name or bio keywords..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 transition-colors"
            />
          </div>

          {/* Region Filter */}
          <div className="space-y-2">
            <label htmlFor="region" className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Region</label>
            <select
              id="region"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 transition-colors"
            >
              <option value="all">All Regions</option>
              {AVAILABLE_REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div className="space-y-2">
            <label htmlFor="language" className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Language</label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 transition-colors"
            >
              <option value="all">All Languages</option>
              {AVAILABLE_LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Max Daily Rate</span>
              <span className="text-primary font-mono">{maxPrice} MAD</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-card/25">
            <p className="text-muted-foreground text-sm">No verified guides match your selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredGuides.map(guide => (
              <div
                key={guide.id}
                className="bg-card/30 hover:bg-card/50 border border-border hover:border-primary/25 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Guide Identity Card Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs uppercase shadow-inner overflow-hidden shrink-0">
                      {guide.profile_picture_url ? (
                        <img 
                          src={guide.profile_picture_url} 
                          alt={guide.full_name || 'Guide'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        getInitials(guide.full_name)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/guides/${guide.id}`} className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-foreground group-hover:text-primary transition-colors hover:underline underline-offset-2">
                          {guide.full_name}
                        </Link>
                        <span className="text-[10px] text-green-400" title="Verified Expert">✓</span>
                      </div>
                      <div className="mt-0.5">
                        <TrustStats
                          completedTrips={guide.completedTrips}
                          rating={guide.rating}
                          reviewCount={guide.reviewCount}
                          responseRate={guide.responseRate}
                          memberSince={guide.memberSince}
                          compact
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-[12.5px] leading-relaxed line-clamp-3 mb-5">
                    {guide.bio || <span className="italic text-muted-foreground/45">No bio written yet.</span>}
                  </p>

                  {/* Languages Spoken */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {guide.languages.slice(0, 3).map(lang => (
                      <span key={lang} className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground text-[10px] tracking-wide">
                        {lang}
                      </span>
                    ))}
                    {guide.languages.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground text-[10px] tracking-wide">
                        +{guide.languages.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Regions Covered */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {guide.regions.slice(0, 2).map(reg => (
                      <span key={reg} className="px-2.5 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10">
                        {reg}
                      </span>
                    ))}
                    {guide.regions.length > 2 && (
                      <span className="px-2 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10">
                        +{guide.regions.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Daily Rate</span>
                    <p className="font-[family-name:var(--font-cormorant)] text-xl font-bold text-foreground mt-0.5">{guide.daily_rate_mad} MAD</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveGuide(guide)}
                      className="px-3.5 py-2 border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/20 hover:text-foreground transition-colors"
                    >
                      View Profile
                    </button>
                    {user?.id !== guide.id && (
                      <button
                        onClick={() => setBookingGuide(guide)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shadow-primary/10"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Detail Modal */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 md:p-8 relative max-h-[85vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setActiveGuide(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
            >
              ✕ Close
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg uppercase shadow-inner">
                {getInitials(activeGuide.full_name)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight">
                    {activeGuide.full_name}
                  </h2>
                  <span className="text-[11px] text-green-400" title="Verified Expert">✓</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span className="text-primary font-semibold text-xs font-mono">{activeGuide.daily_rate_mad} MAD / day</span>
                  <span className="text-muted-foreground/30">·</span>
                  <TrustStats
                    completedTrips={activeGuide.completedTrips}
                    rating={activeGuide.rating}
                    reviewCount={activeGuide.reviewCount}
                    responseRate={activeGuide.responseRate}
                    memberSince={activeGuide.memberSince}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Biography</h4>
                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                  {activeGuide.bio || <span className="italic text-muted-foreground/45">No bio written yet.</span>}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Languages Spoken</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeGuide.languages.map(lang => (
                    <span key={lang} className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground text-[10px] tracking-wide">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Regions Covered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeGuide.regions.map(reg => (
                    <span key={reg} className="px-2.5 py-0.5 rounded bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {user?.id !== activeGuide.id && (
                  <button
                    onClick={() => {
                      setBookingGuide(activeGuide)
                      setActiveGuide(null)
                    }}
                    className="w-full py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-xs uppercase tracking-widest transition-all shadow-sm shadow-primary/10 text-center"
                  >
                    Book this Guide
                  </button>
                )}
                <Link
                  href={`/guides/${activeGuide.id}`}
                  className="w-full py-2.5 border border-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/25 transition-colors text-center"
                >
                  View reviews &amp; full profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md relative shadow-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <button
              onClick={() => {
                setBookingGuide(null)
                setBookingError(null)
                setTermsAgreed(false)
                setStartDate('')
                setEndDate('')
              }}
              className="sticky top-0 float-right text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
            >
              ✕
            </button>

            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight mb-2">
              Book Guide
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Request a booking for <span className="text-foreground font-semibold">{bookingGuide.full_name}</span>.
            </p>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                  ✓
                </div>
                <h3 className="font-semibold text-foreground text-sm">Request Sent!</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Your request is pending guide approval. We'll notify you when they respond — check your notifications bell for updates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
                    {bookingError}
                  </div>
                )}

                {/* Availability calendar — date range picker */}
                {checkingDates ? (
                  <p className="text-[11px] text-muted-foreground italic py-2">Loading availability…</p>
                ) : (
                  <div className="bg-card/30 border border-border/60 rounded-xl p-4">
                    <AvailabilityCalendar
                      mode="traveler"
                      blockedDays={avail.blockedDays}
                      activeRanges={avail.activeRanges}
                      startDate={startDate}
                      endDate={endDate}
                      onStartChange={setStartDate}
                      onEndChange={setEndDate}
                    />
                  </div>
                )}

                {/* Itinerary Association */}
                <div className="space-y-2">
                  <label htmlFor="itinerary" className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attach Itinerary (Optional)</label>
                  <select
                    id="itinerary"
                    value={selectedItineraryId}
                    onChange={e => setSelectedItineraryId(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:border-primary/40 transition-colors"
                  >
                    <option value="">No Itinerary (Custom Route)</option>
                    {itineraries.map(it => (
                      <option key={it.id} value={it.id}>{it.title}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing Summary */}
                {startDate && endDate && (
                  <div className="bg-card/60 border border-border/60 p-4 rounded-xl text-xs space-y-2 mt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily rate</span>
                      <span className="font-semibold text-foreground">{bookingGuide.daily_rate_mad} MAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days</span>
                      <span className="font-semibold text-foreground">
                        {Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/50 pt-2 font-semibold text-sm">
                      <span className="text-foreground">Total Price</span>
                      <span className="text-primary">
                        {bookingGuide.daily_rate_mad * 
                          (Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1))
                        } MAD
                      </span>
                    </div>
                  </div>
                )}

                {/* Cancellation policy summary + agreement */}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 mt-2">
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Cancellation:</span> Full refund if cancelled 7+ days before the start date. 50% refund 2–7 days before. No refund within 2 days.
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Payment is held in escrow and released to the guide only after the tour is marked complete.{' '}
                    <a
                      href="/cancellation-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    >
                      Full policy →
                    </a>
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      checked={termsAgreed}
                      onChange={e => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-[12px] text-foreground/80 leading-snug group-hover:text-foreground transition-colors select-none">
                      I have read and agree to the cancellation policy and booking terms.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !termsAgreed || !startDate || !endDate || checkingDates}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-primary/95 transition-all shadow-sm shadow-primary/10 flex items-center justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Submitting Request...' : user ? 'Send Booking Request' : 'Login to Book Guide'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
